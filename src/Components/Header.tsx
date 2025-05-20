import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { updateAuth } from "../api";
import { latinToCyrillic, textNum, tt } from "../utils";
import Input from "./Input";
// import { request } from "@/config/request";
import Icon from "@/assets/icons";
import { useRequest } from "@/hooks/useRequest";
import { RootState } from "@/Redux/store";
import { AccountNumberSelect } from "./AccountNumberSelect";

import { colorSwitcher } from "@/Redux/colorSwitcher";
import { changeDefaultDate } from "@/Redux/dateSlice";
import { changeMonth } from "@/Redux/monthSlice";
import { baseUri } from "@/services/api";
import Modal from "./Modal";
import Button from "./reusable/button";
import { SpecialDatePicker } from "./SpecialDatePicker";
import SpecialMonthPicker from "./specialMonthPicker";
import Logo from "@/assets/logo.png";
// import AvaSvgImg from "../assets/icons/icons";

const language = [
  {
    id: 0,
    text: "Uzbek",
    type: "uz",
  },
  {
    id: 1,
    text: "Ўзбек",
    type: "kr",
  },
  {
    id: 2,
    text: "Rus",
    type: "ru",
  },
];

function Header() {
  const type = localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : "0";
  const active = type == "0" ? 0 : type == "1" ? 1 : type == "2" ? 2 : 0;
  const [selectedValue, setSelectedValue] = useState<number>(active);
  const [isShow, setIsShow] = useState(false);
  const [accountsData, setAccountsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modalni holatini boshqaramiz
  const [isAccountModal, setIsAccountModal] = useState(false); // Modalni holatini boshqaramiz
  const [defaultDateOpen, setDefaultDateOpen] = useState<boolean>(false);
  const [start, setStart] = useState<string>();
  const [end, setEnd] = useState<string>();

  const { startDate, endDate } = useSelector(
    (state: RootState) => state.defaultDate
  );
  const { month } = useSelector((state: RootState) => state.month);

  const [value, setValue] = useState({
    login: "",
    oldPassword: "",
    newPassword: "",
  });
  const accountNumber = useSelector((state: any) => state.account);
  const loggeduser = useSelector((state: any) => state.auth.user);

  const [isSub, setIsSub] = useState(false);
  const request = useRequest();
  const getAccounts = async () => {
    const data = await request.get("/account");
    if (data.status == 200 || data.status == 201) {
      setAccountsData(data.data.data);
    }
  };
  const dispatch = useDispatch();
  const handleChangeTheme = () => {
    dispatch(colorSwitcher());
  };
  //@ts-ignore
  const { jwt } = useSelector((state) => state.auth);
  //@ts-ignore
  const { account_number_id } = useSelector((state) => state.account);
  React.useEffect(() => {
    if (!account_number_id) {
      setIsAccountModal(true);
    }
    if (jwt && jwt !== "out") getAccounts();
  }, [jwt]);

  // React.useEffect(() => {}, [account_number_id]);
  // Modalni ochish funksiyasi
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Modalni yopish funksiyasi
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleChange = (e: any) => {
    setValue({ ...value, [e.target.name]: e.target.value });
  };
  const JWT = useSelector((s: any) => s.auth.jwt);
  const update = async () => {
    const res = await updateAuth(value, JWT);

    if (res.success) {
      location.reload();
    }
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSub(true);
    if (value.newPassword) {
      update();
    }
  };
  const navigate = useNavigate();

  const { user } = useSelector((state: any) => state.auth);

  let path = "/";

  if (user?.batalon) {
    path = "/batalon/tasks";
  }

  const { pathname } = useLocation();
  const [imageError, setImageError] = useState(false);

  return (
    <header className="bg-mybackground border-b border-mybordercolor shadow-[0px_1px_12px_0px_#00000026] w-full flex justify-center h-[100%]">
      <div className="mx-auto w-[85%] flex justify-between items-center">
        <div
          onClick={() => {
            navigate(path);
            location.reload();
          }}
          className="flex gap-2 cursor-pointer items-center"
        >
          <img src={Logo} className="w-[40px] h-[40px]" alt="Tadbir-Hisob" />
          <span className="text-[20px] leading-[24.2px] text-mylogocolor">
            {tt("Tadbir-Hisob", "Тадбир-Ҳисоб")}
          </span>
        </div>
        <div className="flex gap-6 items-center">
          {!Boolean(user.region_id) ? (
            <>
              {pathname === "/" && (
                <SpecialMonthPicker
                  defaultValue={month}
                  onChange={(e) => dispatch(changeMonth(e))}
                />
              )}
            </>
          ) : (
            <>
              {pathname === "/" && (
                <SpecialMonthPicker
                  defaultValue={month}
                  onChange={(e) => dispatch(changeMonth(e))}
                />
              )}
              <button onClick={() => setDefaultDateOpen(true)}>
                <Icon name="settings" />
              </button>
              <div
                role="button"
                onClick={() => setIsAccountModal(true)}
                className="account-switcher flex gap-2 items-center cursor-pointer "
              >
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 4V10H7"
                    // stroke="white"
                    className="stroke-myiconcolor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.51 15.0004C4.15839 16.8408 5.38734 18.4206 7.01166 19.5018C8.63598 20.583 10.5677 21.107 12.5157 20.9949C14.4637 20.8828 16.3226 20.1406 17.8121 18.8802C19.3017 17.6198 20.3413 15.9094 20.7742 14.0068C21.2072 12.1042 21.0101 10.1124 20.2126 8.33154C19.4152 6.55068 18.0605 5.07723 16.3528 4.1332C14.6451 3.18917 12.6769 2.8257 10.7447 3.09755C8.81245 3.36941 7.02091 4.26186 5.64 5.64044L1 10.0004"
                    // stroke="white"
                    className="stroke-myiconcolor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div>
                  <p className="text-[14px] text-mylabelcolor">
                    {tt("Hisob raqam", "Номер счета")}
                  </p>
                  <p className="text-[15px] text-mytextcolor">
                    {textNum(accountNumber?.account_number, 4)}
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="relative">
            <button
              onClick={() => setIsShow(!isShow)}
              className="text-[14px]  dark:bg-[#0d1735] w-[72px] h-[37px] leading-[16.94px] rounded   text-mytextcolor flex justify-center items-center"
            >
              {language[selectedValue].text}
              {/* <Icon name="down" /> */}
              <svg
                width={14}
                height={16}
                viewBox="0 0 14 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.00008 10.6675C6.86378 10.6678 6.73169 10.6136 6.62675 10.5142L3.12675 7.18084C3.00762 7.06768 2.93271 6.90507 2.91848 6.72878C2.90426 6.5525 2.9519 6.37698 3.05091 6.24083C3.14993 6.10469 3.29221 6.01907 3.44646 6.00282C3.60071 5.98657 3.75429 6.04101 3.87341 6.15417L7.00008 9.14083L10.1267 6.26084C10.1864 6.20546 10.2551 6.1641 10.3288 6.13915C10.4025 6.11419 10.4798 6.10613 10.5562 6.11542C10.6326 6.12472 10.7067 6.15118 10.7741 6.1933C10.8416 6.23541 10.9011 6.29235 10.9492 6.36083C11.0027 6.42938 11.0431 6.5098 11.0681 6.59705C11.0931 6.6843 11.102 6.7765 11.0943 6.86787C11.0866 6.95925 11.0625 7.04783 11.0235 7.12807C10.9845 7.20831 10.9314 7.27847 10.8676 7.33417L7.36758 10.5542C7.25961 10.6378 7.13022 10.6777 7.00008 10.6675Z"
                  // fill="white"
                  className="fill-myiconcolor"
                />
              </svg>
            </button>
            <div
              className={`${
                isShow ? "flex z-[999]" : "hidden"
              } absolute top-[37px] bg-mytablehead transition-all duration-300 rounded-[6px] h-[85px] w-[68px] items-center justify-center border border-mybordercolor shadow-[0px_1px_4px_0px_#00000026]`}
            >
              <div className="flex flex-col gap-2 text-[14px] text-mytextcolor  leading-[16.94px]">
                {language.map((e: any) => (
                  <span
                    key={e.id}
                    onClick={() => {
                      setSelectedValue(e.id);
                      localStorage.setItem("lang", e.id.toString());
                      setIsShow(false);
                      location.reload();
                    }}
                    className={`cursor-pointer hover:text-mylabelcolor hover:font-[600] ${
                      e.id === selectedValue && "text-mylabelcolor font-[600]"
                    }`}
                  >
                    {e.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div
            onClick={openModal}
            role="button"
            className="flex items-center gap-2"
          >
            <button className="w-[32px] h-[32px]  rounded-[999px] border border-mybordercolor flex justify-center items-center">
              <div>
                {user.image && !imageError ? (
                  <img
                    src={baseUri + user.image}
                    alt={user.fio}
                    className="w-full h-full rounded-full mx-auto"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Icon name="ava" />
                )}
              </div>
            </button>
            <div>
              <p className="text-[14px] text-mylabelcolor">
                {tt("Foydalanuvchi", "Пользователь")}
              </p>
              <p className="text-mytextcolor">
                {loggeduser?.fio?.toLocaleUpperCase()}
              </p>
            </div>
          </div>
          <div
            role="button"
            onClick={handleChangeTheme}
            className="w-[52px] h-[52px] p-2 rounded-2xl border border-mybordercolor justify-center items-center gap-2.5 inline-flex"
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.301 22.0002H12.201C10.8295 21.9897 9.47387 21.7057 8.21352 21.1649C6.95316 20.624 5.81339 19.837 4.86095 18.8502C3.0948 16.9615 2.09084 14.4855 2.04282 11.9001C1.99481 9.3147 2.90614 6.80316 4.60095 4.85017C5.69284 3.62651 7.06548 2.68625 8.60095 2.11017C8.78012 2.04123 8.97534 2.02531 9.1633 2.06432C9.35126 2.10333 9.52402 2.19562 9.66095 2.33017C9.78777 2.45949 9.87708 2.62083 9.91935 2.79695C9.96162 2.97308 9.95526 3.15738 9.90095 3.33017C9.35291 4.8311 9.24433 6.45722 9.58795 8.01769C9.93158 9.57817 10.7131 11.0083 11.841 12.1402C12.9793 13.2645 14.4128 14.0434 15.9755 14.3868C17.5382 14.7301 19.1662 14.6238 20.671 14.0802C20.8501 14.0171 21.0434 14.0064 21.2284 14.0492C21.4134 14.092 21.5824 14.1866 21.7156 14.3219C21.8488 14.4572 21.9407 14.6276 21.9807 14.8133C22.0206 14.9989 22.0068 15.1921 21.941 15.3702C21.4301 16.7339 20.6321 17.9719 19.601 19.0002C18.6418 19.9565 17.5031 20.7138 16.2503 21.2286C14.9976 21.7435 13.6554 22.0057 12.301 22.0002Z"
                // fill="#151515"
                className="fill-myiconcolor"
              />
            </svg>
          </div>
        </div>
      </div>

      <AccountNumberSelect
        accountData={accountsData}
        openmodal={isAccountModal}
        setOpenmodal={setIsAccountModal}
      />

      {/* Modal ko'rinishi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#00000066]  flex items-center justify-center z-50">
          <div className="bg-mybackground rounded-[6px]  w-[460px] h-[474px] flex justify-center items-center">
            <div className="w-[70%] mx-auto ">
              <div className="flex justify-between mb-8 w-full items-center">
                <h2 className="text-mytextcolor font-[500] text-[20px] leading-[24.2px]">
                  {tt("Shaxsiy ma'lumotlar", "Личные данные")}
                </h2>
                <button onClick={closeModal} className="">
                  <Icon name="close" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 w-full"
              >
                <Input
                  change={handleChange}
                  n="login"
                  v={value.login}
                  error={isSub && !value.login}
                  label={tt("Login", latinToCyrillic("Login"))}
                  p={tt("Login kiriting", "Введите логин")}
                  className="w-full"
                />
                <Input
                  change={handleChange}
                  n="oldPassword"
                  error={isSub && !value.oldPassword}
                  v={value.oldPassword}
                  label={tt("Eski parol", "Старый пароль")}
                  p={tt("Eski parol kiriting", "Введите старый пароль")}
                  className="w-full"
                />
                <Input
                  change={handleChange}
                  n="newPassword"
                  error={isSub && !value.newPassword}
                  v={value.newPassword}
                  label={tt("Yangi parol", "Новый пароль")}
                  p={tt("Yangi parol kiriting", "Введите новый  пароль")}
                  className="w-full"
                />
                <div className="mt-5 flex justify-end">
                  <Button type="submit" mode="save" />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Modal
        title={tt("Standart sanani belgilash", " Настроить дату по умолчанию")}
        open={defaultDateOpen}
        closeModal={() => setDefaultDateOpen(false)}
        style={{ width: "500px" }}
      >
        <div className="flex flex-col gap-y-3">
          <SpecialDatePicker
            label={tt("dan", latinToCyrillic("dan"))}
            defaultValue={startDate}
            // onChange={(_, e) => dispatch(changeDefaultDate({ startDate: e }))}
            onChange={(a) => setStart(a)}
          />

          <SpecialDatePicker
            label={tt("gacha", latinToCyrillic("do"))}
            defaultValue={endDate}
            onChange={(e) => setEnd(e)}
          />
          <Button
            mode="save"
            onClick={() => {
              dispatch(
                changeDefaultDate({
                  startDate: start,
                  endDate: end,
                })
              );
              setDefaultDateOpen(false);
            }}
          />
        </div>
      </Modal>
    </header>
  );
}

export default Header;
