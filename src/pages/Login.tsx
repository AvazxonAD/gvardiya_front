/** @format */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAuth, loginEimzoAuth } from "../api";
import { putJwt, setUserData } from "../Redux/apiSlice";

import Alert from "@/Components/Alert";
import useFullHeight from "@/hooks/useFullHeight";
import { store } from "@/Redux/store";
import { alertt } from "../Redux/LanguageSlice";
import { latinToCyrillic, tt } from "../utils";
import Logo from "@/assets/logo.png";
import {
  EimzoCertificate,
  listCertificatesWithBridge,
  signWithBridge,
} from "@/lib/eimzo";

// Login 2-bosqich (E-IMZO) holati — 1-bosqich javobidan keladi
interface EimzoStep {
  login_token: string;
  challenge: string;
  bridge: string;
}

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [value, setValue] = useState({
    login: "",
    password: "",
  });

  // E-IMZO bosqichi
  const [eimzoStep, setEimzoStep] = useState<EimzoStep | null>(null);
  const [certs, setCerts] = useState<EimzoCertificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<EimzoCertificate | null>(null);
  const [certsLoading, setCertsLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [eimzoError, setEimzoError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  const handleChange = (i: React.ChangeEvent<HTMLInputElement>) => {
    setValue({ ...value, [i.target.name]: i.target.value });
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    loginUser();
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alertActionData = useSelector((s: any) => s.lan.alert);

  useEffect(() => {
    if (alertActionData && alertActionData?.isVisible) {
      setTimeout(() => {
        dispatch(alertt({ text: "", open: false }));
      }, alertActionData.time || 2000);
    }
  }, [alertActionData, dispatch]);

  // Token olingandan keyingi umumiy yakun (oddiy va E-IMZO login uchun bir xil)
  const finishLogin = (res: any) => {
    dispatch(setUserData(res.data));
    dispatch(
      alertt({
        text: res.message,
        success: true,
      })
    );
    if (res?.data?.user?.batalon) {
      navigate("/batalon/tasks");
    } else {
      navigate("/");
    }
    dispatch(putJwt(res.data.token));
  };

  const loadCertificates = async (bridge: string) => {
    setEimzoError("");
    setCertsLoading(true);
    setCerts([]);
    setSelectedCert(null);
    try {
      const list = await listCertificatesWithBridge(bridge);
      if (!list || list.length === 0) {
        setEimzoError(
          tt("E-IMZO kaliti topilmadi", "Ключ E-IMZO не найден")
        );
        return;
      }
      setCerts(list);
      // Bitta kalit bo'lsa avtomatik tanlanadi, 2+ bo'lsa foydalanuvchi tanlaydi
      if (list.length === 1) {
        setSelectedCert(list[0]);
      }
    } catch (e: any) {
      setEimzoError(e?.message || tt("Xatolik yuz berdi", "Произошла ошибка"));
    } finally {
      setCertsLoading(false);
    }
  };

  const loginUser = async () => {
    const res = await loginAuth(value.login, value.password);

    if (!res.success) {
      dispatch(
        alertt({
          text: res?.error || res?.message,
          success: false,
        })
      );
      return;
    }

    // 2-bosqich: parol to'g'ri, endi E-IMZO bilan tasdiqlash kerak
    if (res.data?.requires_eimzo) {
      const step: EimzoStep = {
        login_token: res.data.login_token,
        challenge: res.data.challenge,
        bridge: res.data.eimzo_bridge?.token || "",
      };
      setEimzoStep(step);
      loadCertificates(step.bridge);
      return;
    }

    finishLogin(res);
  };

  // E-IMZO bilan tasdiqlash: challenge imzolanadi, imzo backendga yuboriladi
  const confirmEimzo = async () => {
    if (!eimzoStep || !selectedCert || signing) return;
    setEimzoError("");
    setSigning(true);
    try {
      const content64 = btoa(eimzoStep.challenge);
      const sig = await signWithBridge(eimzoStep.bridge, content64, selectedCert);
      const res = await loginEimzoAuth(eimzoStep.login_token, sig.pkcs7_64);
      if (res.success) {
        finishLogin(res);
      } else {
        setEimzoError(
          res?.error || res?.message || tt("Xatolik yuz berdi", "Произошла ошибка")
        );
      }
    } catch (e: any) {
      const msg = String(e?.message || e).toLowerCase();
      if (msg.includes("password") || msg.includes("padding")) {
        setEimzoError(
          tt("Noto'g'ri parol kiritildi. Qaytadan urinib ko'ring.", "Введён неверный пароль. Попробуйте снова.")
        );
      } else if (msg.includes("cancel")) {
        setEimzoError(tt("Bekor qilindi", "Отменено"));
      } else {
        setEimzoError(e?.message || tt("Xatolik yuz berdi", "Произошла ошибка"));
      }
    } finally {
      setSigning(false);
    }
  };

  const cancelEimzo = () => {
    setEimzoStep(null);
    setCerts([]);
    setSelectedCert(null);
    setEimzoError("");
  };

  store.subscribe(() => {
    const user = store.getState().auth.user;
    localStorage.setItem(
      "user",
      JSON.stringify({
        user: user,
      })
    );
  });

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 1px)` : height - 1;
  return (
    <div style={{ height: fullHeight }} className="w-full flex">
      <div className="max-w-[50%] h-full">
        <img
          className="w-full flex h-full"
          src="/homebanner.jpg"
          alt="picture"
        />
      </div>
      <div className="w-[50%] bg-[#121212] h-full flex justify-center items-center">
        <div className="flex flex-col">
          <img
            className="w-[240px] h-[240px] mx-auto rounded-[999px] mb-2"
            src={Logo}
            alt="logo"
          />
          <h1 className="text-[#D1AA67] text-center mb-12 text-[32px] leading-[38.73px] font-bold">
            {tt("Tadbir-Hisob", "Тадбир-Ҳисоб")}
          </h1>

          {!eimzoStep ? (
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="flex flex-col gap-2 mb-2">
                <span className="text-[#BEBBBB] text-[12px] leading-[14.52px] font-[600]">
                  {tt("Login", latinToCyrillic("Login"))}
                </span>

                <input
                  type="text"
                  name="login"
                  onChange={handleChange}
                  placeholder={tt("Login kiriting", "Введите логин")}
                  className="border border-[#BEBBBB] text-[#BEBBBB] pl-2 bg-inherit w-[300px] h-[41px] rounded-[6px] placeholder:text-[#636566] text-[12px] leading-[14.52px]"
                />
              </div>
              <div className="flex flex-col gap-2 mb-6 relative">
                <span className="text-[#BEBBBB] text-[12px] leading-[14.52px] font-[600]">
                  {tt("Parol", "Пароль")}
                </span>

                <input
                  onChange={handleChange}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={tt("Parol kiriting", "Введите пароль")}
                  className="border border-[#BEBBBB] text-[#BEBBBB] pl-2 bg-inherit w-[300px] h-[41px] rounded-[6px] placeholder:text-[#636566] text-[12px] leading-[14.52px]"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-8 text-[#BEBBBB]"
                >
                  <img src="/eye.png" alt="" />
                </button>
              </div>

              <button
                className="w-[300px] text-white text-[14px] leading-[16.94px] font-[600] flex justify-center items-center rounded-[8px] bg-[#C18B2F] h-[33px] hover:bg-white border border-[#C18B2F] hover:text-[#C18B2F] transition-all duration-300"
                type="submit"
              >
                {tt("Kirish", "Введение")}
              </button>
            </form>
          ) : (
            <div className="flex flex-col w-[340px]">
              <span className="text-[#D1AA67] text-[14px] font-[600] mb-1">
                {tt("E-IMZO bilan tasdiqlash", "Подтверждение через E-IMZO")}
              </span>
              <span className="text-[#BEBBBB] text-[12px] mb-4">
                {certs.length > 1
                  ? tt(
                      "Bir nechta kalit topildi — birini tanlang",
                      "Найдено несколько ключей — выберите один"
                    )
                  : tt(
                      "E-IMZO kaliti bilan kirishni tasdiqlang",
                      "Подтвердите вход ключом E-IMZO"
                    )}
              </span>

              {certsLoading && (
                <span className="text-[#BEBBBB] text-[12px] mb-4">
                  {tt("Kalitlar qidirilmoqda...", "Поиск ключей...")}
                </span>
              )}

              <div className="flex flex-col gap-2 mb-4 max-h-[220px] overflow-y-auto">
                {certs.map((c) => (
                  <button
                    key={c.alias}
                    type="button"
                    disabled={c.expired || signing}
                    onClick={() => setSelectedCert(c)}
                    className={`text-left border rounded-[6px] px-3 py-2 transition-all duration-200 ${
                      selectedCert?.alias === c.alias
                        ? "border-[#C18B2F] bg-[#C18B2F]/10"
                        : "border-[#3a3a3a] hover:border-[#BEBBBB]"
                    } ${c.expired ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className="block text-[#E5E5E5] text-[13px] font-[600] uppercase">
                      {c.fio}
                    </span>
                    <span className="block text-[#8a8a8a] text-[11px]">
                      {tt("Amal qilish muddati", "Срок действия")}: {c.validTo}
                      {c.expired && (
                        <span className="text-red-400 ml-2">
                          {tt("muddati o'tgan", "истёк")}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {eimzoError && (
                <div className="flex flex-col gap-2 mb-4">
                  <span className="text-red-400 text-[12px]">{eimzoError}</span>
                  <button
                    type="button"
                    onClick={() => loadCertificates(eimzoStep.bridge)}
                    className="text-[#C18B2F] text-[12px] underline text-left cursor-pointer"
                  >
                    {tt("Qayta urinish", "Повторить")}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={confirmEimzo}
                disabled={!selectedCert || signing || certsLoading}
                className="w-full text-white text-[14px] leading-[16.94px] font-[600] flex justify-center items-center rounded-[8px] bg-[#C18B2F] h-[37px] hover:bg-white border border-[#C18B2F] hover:text-[#C18B2F] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#C18B2F] disabled:hover:text-white"
              >
                {signing
                  ? tt("Imzolanmoqda...", "Подписывается...")
                  : tt("E-IMZO bilan kirish", "Войти через E-IMZO")}
              </button>
              <button
                type="button"
                onClick={cancelEimzo}
                disabled={signing}
                className="w-full mt-2 text-[#BEBBBB] text-[13px] font-[600] flex justify-center items-center rounded-[8px] h-[33px] border border-[#3a3a3a] hover:border-[#BEBBBB] transition-all duration-300"
              >
                {tt("Orqaga", "Назад")}
              </button>
            </div>
          )}
        </div>
      </div>
      {alertActionData && alertActionData?.open && <Alert />}
    </div>
  );
}

export default Login;
