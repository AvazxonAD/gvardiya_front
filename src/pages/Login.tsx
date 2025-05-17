/** @format */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAuth } from "../api";
import { putJwt, setUserData } from "../Redux/apiSlice";

import Alert from "@/Components/Alert";
import useFullHeight from "@/hooks/useFullHeight";
import { store } from "@/Redux/store";
import { alertt } from "../Redux/LanguageSlice";
import { latinToCyrillic, tt } from "../utils";
import Logo from "@/assets/logo.png";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [value, setValue] = useState({
    login: "",
    password: "",
  });

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

  const loginUser = async () => {
    const res = await loginAuth(value.login, value.password);

    if (res.success) {
      dispatch(setUserData(res.data));
      dispatch(
        alertt({
          text: res.message,
          success: true,
        })
      );
      navigate("/");
    }

    if (!res.success) {
      dispatch(
        alertt({
          text: res?.error || res?.message,
          success: false,
        })
      );
      return;
    }

    dispatch(putJwt(res.data.token));
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
        </div>
      </div>
      {alertActionData && alertActionData?.open && <Alert />}
    </div>
  );
}

export default Login;
