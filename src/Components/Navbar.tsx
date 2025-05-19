import Icon from "@/assets/icons";
import { Shartnoma as ShartnomaIcon } from "@/assets/icons/navbar/icons";
import { removeAccountNumber } from "@/Redux/accountSlice";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { latinToCyrillic, tt } from "../utils";
function Navbar() {
  const locationn = useLocation();
  const navigate = useNavigate();

  const [activeItem, setActiveItem] = useState("");
  const [activeSubItem, setActiveSubItem] = useState("");
  const [isShrink, setIsShrink] = useState(false);
  const [isSpravichnikOpen, setIsSpravichnikOpen] = useState(
    sessionStorage.getItem("spravichnikOpen") === "true"
  );

  const menuItems = [
    {
      id: 1,
      name: "Asosiy",
      path: "/",
      ru: "Базовый",
      icon: ({ ...props }) => <Icon name="home" {...props} />,
    },
    {
      id: 2,
      name: "Asosiy",
      path: "/",
      ru: "Базовый",
      icon: ({ ...props }) => <Icon name="home" {...props} />,
      isAdminPath: true,
    },
    {
      id: 3,
      name: "Shartnoma",
      path: "/contract",
      ru: "Договор",
      icon: ({ ...props }) => <ShartnomaIcon {...props} />,
    },
    {
      id: 4,
      name: "F.I.O",
      path: "/workers",
      ru: "Ф.И.О",
      icon: ({ ...props }) => <Icon name="fio" {...props} />,
    },
    {
      id: 12,
      name: "Topshiriqlar",
      path: "/batalon/tasks",
      ru: "Задания",
      icon: ({ ...props }) => <Icon name="rasxod_fio" {...props} />,
      isBatalon: true
    },
    {
      id: 4,
      name: "F.I.O",
      path: "/batalon/workers",
      ru: "Ф.И.О",
      icon: ({ ...props }) => <Icon name="fio" {...props} />,
      isBatalon: true
    },
    {
      id: 5,
      name: "Batalon",
      path: "/batalon",
      ru: "Батальон",
      icon: ({ ...props }) => <Icon name="batalon" {...props} />,
    },
    {
      id: 6,
      name: "Hisobot",
      path: "/report",
      ru: "Отчетность",
      icon: ({ ...props }) => <Icon name="hisobot" {...props} />,
      isAdminPath: true,
    },
    {
      id: 7,
      name: "Hisobot",
      path: "/report",
      ru: "Отчетность",
      icon: ({ ...props }) => <Icon name="hisobot" {...props} />,
    },
    {
      id: 8,
      name: "Organizatsiya",
      path: "/organisation",
      ru: "Организация",
      icon: ({ ...props }) => <Icon name="organizatsiya" {...props} />,
    },
    {
      id: 9,
      name: "Spravochnik",
      path: "/spravichnik",
      ru: "Справочник",
      icon: ({ ...props }) => <Icon name="spravochnik" {...props} />,
      subItems: [
        { id: 1, name: "BXM", ru: latinToCyrillic("BXM"), path: "/" },
        {
          id: 2,
          name: "Hisob raqami",
          ru: "Номер счета",
          path: "/hisobRaqami",
        },
        { id: 3, name: "Ijrochi", ru: "Исполнитель", path: "/ijrochi" },
        { id: 4, name: "Rahbari", ru: "Руководитель", path: "/rahbar" },
        { id: 5, name: "Manzil", ru: "Адрес", path: "/manzil" },
        { id: 6, name: "Bank", ru: "Банк", path: "/bank" },
        { id: 7, name: "INN", ru: latinToCyrillic("INN"), path: "/mfo" },
        { id: 8, name: "Ushlanma", ru: "Удержание", path: "/deduction" },
        // { id: 9, name: "Shablon", ru: "Шаблон", path: "/template/" },
      ],
    },
    {
      id: 10,
      name: "Kirim",
      path: "/prixod",
      ru: latinToCyrillic("Prixod"),
      icon: ({ ...props }) => <Icon name="bottom_arrow" {...props} />,
    },
    {
      id: 11,
      name: "Chiqim",
      path: "/rasxod",
      ru: "Расход",
      icon: ({ ...props }) => <Icon name="top_arrow" {...props} />,
    },
    {
      id: 12,
      name: "Chiqim FIO",
      path: "/rasxod-workers",
      ru: "Расход ФИО",
      icon: ({ ...props }) => <Icon name="rasxod_fio" {...props} />,
    },
    {
      id: 13,
      name: "Foydalanuvchilar",
      path: "/users",
      ru: "Пользователь",
      icon: ({ ...props }) => <Icon name="users" {...props} />,
      isAdminPath: true,
    },
    {
      id: 13,
      name: "Foydalanuvchilar",
      path: "/batalon/users",
      ru: "Пользователь",
      icon: ({ ...props }) => <Icon name="users" {...props} />,
    },
  ];

  const { user } = useSelector((state: any) => state.auth);
  const filteredMenuItems = user.batalon
    ? menuItems.filter((item) => item.isBatalon)
    : !user.region_id
      ? menuItems.filter((item) => item.isAdminPath)
      : menuItems.filter((item) => !item.isAdminPath && !item.isBatalon);

  useEffect(() => {
    const currentPath = locationn.pathname;
    const currentItem = filteredMenuItems.find(
      (item) => item.path === currentPath
    );

    if (locationn.pathname.includes("/spravichnik")) {
      setActiveItem("Spravochnik");
      setIsSpravichnikOpen(true);

      // Find which subitem is active
      const spravochnikItem = filteredMenuItems.find(
        (item) => item.name === "Spravochnik"
      );
      if (spravochnikItem && spravochnikItem.subItems) {
        const activeSubPath = locationn.pathname.replace("/spravichnik", "");
        const currentSubItem = spravochnikItem.subItems.find(
          (subItem) => subItem.path === activeSubPath
        );
        if (currentSubItem) {
          setActiveSubItem(currentSubItem.name);
        }
      }
    } else if (locationn.pathname.includes("/contract")) {
      setActiveItem("Shartnoma");
      setIsSpravichnikOpen(false);
      setActiveSubItem("");
    } else if (locationn.pathname.includes("/prixod")) {
      setActiveItem("Kirim");
      setActiveSubItem("");
    } else if (
      locationn.pathname.includes("/rasxod") &&
      !locationn.pathname.includes("/rasxod-")
    ) {
      setActiveItem("Chiqim");
      setActiveSubItem("");
    } else if (locationn.pathname.includes("/rasxod-workers")) {
      setActiveItem("Chiqim FIO");
      setActiveSubItem("");
    } else if (locationn.pathname.includes("/rasxod-organisation")) {
      setActiveItem("Chiqim ORG");
      setActiveSubItem("");
    } else {
      setIsSpravichnikOpen(false); // Yopiladi, agar boshqa sahifa bo'lsa
      setActiveSubItem("");
      if (currentItem) setActiveItem(currentItem.name);
    }

    // Spravichnikning ochiq yoki yopiq holatini saqlash
    sessionStorage.setItem("spravichnikOpen", isSpravichnikOpen.toString());
  }, [locationn.pathname, isSpravichnikOpen]);

  const generateY = () => {
    const sizeW = isShrink ? 54 : 44;
    const index = filteredMenuItems.findIndex(
      (item) => item.name === activeItem
    );

    // Find the Spravochnik item and its index
    const spravochnikIndex = filteredMenuItems.findIndex(
      (item) => item.name === "Spravochnik"
    );
    const spravochnikItem = filteredMenuItems.find(
      (item) => item.name === "Spravochnik"
    );

    // Calculate submenu height if Spravochnik is open
    const submenuHeight =
      isSpravichnikOpen && !isShrink && spravochnikItem?.subItems
        ? spravochnikItem.subItems.length * 36 // Approximate height per submenu item
        : 0;

    // Adjust position based on whether active item is before or after Spravochnik
    let result = index * sizeW;

    // If Spravochnik is open and active item is after Spravochnik, add submenu height
    if (isSpravichnikOpen && !isShrink && index > spravochnikIndex) {
      result += submenuHeight;
    }

    return result;
  };

  const handleSpravichnikToggle = () => {
    const newState = !isSpravichnikOpen;
    setIsSpravichnikOpen(newState);
    sessionStorage.setItem("spravichnikOpen", newState.toString());
  };
  const dispatch = useDispatch();

  const handleLogout = async () => {
    localStorage.removeItem("account");
    localStorage.removeItem("standartDate");
    localStorage.removeItem("user");
    sessionStorage.setItem("token", "out");
    dispatch(removeAccountNumber());
    navigate("/");
    location.reload();
  };
  const { pathname } = useLocation();
  return (
    <motion.div
      animate={{
        // width: isShrink ? "220px" : "300px",
        width: isShrink ? "150px" : "320px",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-[100%] pt-[85px] pr-2 relative rounded-tr-[20px] bg-mybackground border border-mybordercolor shadow-lg flex flex-col justify-between py-4"
    >
      <button
        onClick={() => setIsShrink(!isShrink)}
        className={`border absolute right-[-12px] ${pathname.includes("/contract/view") ? "top-[0px]" : "-top-[5px]"
          }  transition-all duration-300 border-[#EEEDED] bg-[#323232] hover:bg-[#BEBBBB] w-[44px] h-[44px] rounded-[999px] flex justify-center items-center`}
      >
        {/* <img src={`/${!isShrink ? "kichray" : "kottalashtir"}.svg`} alt="" /> */}
        <div>
          <Icon name="kattalashtir" />
        </div>
      </button>

      <div className="flex flex-col gap-0 z-10 relative h-[100%] overflow-y-auto">
        {filteredMenuItems.map((item, idx) => (
          <div key={idx}>
            <Link to={item.path}>
              <button
                onClick={() => {
                  setActiveItem(item.name);
                  if (item.name === "Spravochnik") {
                    handleSpravichnikToggle();
                  }
                }}
                className={`flex items-center gap-3 ${isShrink ? " h-[54px]" : "h-[44px]"
                  } transition-all duration-300 rounded-[4px] px-6 py-3 text-left  text-[20px] leading-[24.2px] font-[500]  
                ${activeItem === item.name
                    ? "text-mylabelcolor"
                    : "text-mylabelcolor hover:text-[#323232] dark:hover:text-[#fff] "
                  }    transition-colors duration-300`}
              >
                <div
                  className={`${isShrink ? "w-[30px] h-[30px] " : "w-[24px] h-[24px]"
                    } ${activeItem == item.name
                      ? "dark:text-[#00A1D5]"
                      : "text-mytextcolor"
                    }`}
                >
                  <item.icon active={activeItem === item.name} />
                </div>

                {!isShrink && tt(item.name, item.ru)}
              </button>
            </Link>

            {item.name === "Spravochnik" && isSpravichnikOpen && !isShrink && (
              <motion.div
                className="pl-[2rem] pt-2 space-y-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {item.subItems?.map((subItem) => (
                  <Link to={"/spravichnik" + subItem.path} key={subItem.id}>
                    <div
                      onClick={() => {
                        navigate("/spravichnik" + subItem.path);
                        setActiveSubItem(subItem.name);
                      }}
                      key={subItem.id}
                      className={`transition-all duration-300 text-[18px] flex items-center gap-3 font-[500] p-1 rounded-[4px] ${activeSubItem === subItem.name
                        ? "text-mynavactiveborder bg-mynavactivebg border-r-[6px] border-r-mynavactiveborder"
                        : "text-mylabelcolor hover:text-opacity-[80%]"
                        }`}
                    >
                      <span
                        className={`w-[5px] h-[5px] rounded-[999px] ${activeSubItem === subItem.name
                          ? "bg-mynavactiveborder"
                          : "bg-[#323232]"
                          }`}
                      ></span>{" "}
                      <span>{tt(subItem.name, subItem.ru)}</span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        ))}
        <motion.div
          className={`absolute right-0 rounded-[4px] z-[-1] top-[0] ${isShrink ? "h-[53px]" : "h-[43px]"
            } 
            text-mylabelcolor
            bg-mynavactivebg border-r-[6px] border-r-mynavactiveborder`}
          initial={false}
          animate={{
            y: generateY(),
            width: isShrink ? "140px" : "240px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-6 py-3 text-left text-[16px] font-medium text-red-500 hover:text-red-600 transition-colors duration-300"
      >
        <div
          className={`${isShrink ? "w-[32px] h-[32px]" : "w-[24px] h-[24px]"}`}
        >
          <Icon name="exit" />
        </div>
        {!isShrink && tt("Chiqish", "Выход")}
      </button>
    </motion.div>
  );
}

export default Navbar;
