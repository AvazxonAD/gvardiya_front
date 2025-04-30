import Icon from "@/assets/icons";
import { tt } from "@/utils";
import { CSSProperties, MouseEventHandler } from "react";

type Props = {
  mode?:
    | "add"
    | "save"
    | "edit"
    | "back"
    | "download"
    | "delete"
    | "print"
    | "back2"
    | "clear"
    | "cancel";
  status?: "bajarildi" | "bajarilmadi";
  text?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  width?: string;
  type?: "submit" | "reset" | "button";
  style?: CSSProperties;
  className?: string;
};

function Button({
  mode,
  status,
  text,
  onClick,
  width,
  type,
  style,
  className,
  ...props
}: Props & React.ComponentPropsWithoutRef<"button">) {
  const buttonTextColor = `${
    mode
      ? mode === "back" || mode === "cancel"
        ? "dark:text-white text-black dark:fill-white fill-black"
        : mode === "clear"
        ? "text-gray-600 fill-gray-600"
        : "text-white dark:text-black fill-white dark:fill-black"
      : status === "bajarildi"
      ? "text-green-700 fill-green-700"
      : status === "bajarilmadi"
      ? "text-red-600 fill-red-600"
      : "text-white dark:text-black fill-white dark:fill-black"
  }`;

  const buttonTextHoverColor = `${
    status === "bajarildi" || status === "bajarilmadi"
      ? ""
      : mode === "download"
      ? "hover:text-sky-400 dark:hover:text-white hover:fill-sky-400 dark:hover:fill-white"
      : mode === "back2"
      ? "hover:text-blue-600 dark:hover:text-white hover:fill-blue-600 dark:hover:fill-white"
      : mode === "delete"
      ? "hover:text-red-600 dark:hover:text-red-600 hover:fill-red-600 dark:hover:fill-red-600"
      : mode === "print"
      ? "hover:text-sky-400 dark:hover:text-white hover:fill-sky-400 dark:hover:fill-white"
      : mode === "clear"
      ? "hover:text-gray-600 hover:fill-gray-600"
      : mode === "back" || mode === "cancel"
      ? "dark:hover:text-white dark:hover:fill-white"
      : "hover:text-blue-600 dark:hover:text-[#3B7FAF] hover:fill-blue-600 dark:hover:fill-[#3B7FAF]"
  }`;

  const borderColor = `${
    mode === "back" || mode === "cancel"
      ? "border-[#D9D9D9] dark:border-white hover:border-[#323232] dark:hover:border-white"
      : mode === "download" || mode === "print"
      ? "border-[#579BB1]"
      : status === "bajarildi"
      ? "border-[#E7F8F2]"
      : status === "bajarilmadi"
      ? "border-[#FFCBD1]"
      : mode === "delete"
      ? "border-[#F23D53]"
      : mode === "clear"
      ? "border-[#ECF3F7]"
      : "border-[#3B7FAF]"
  }`;

  const bg = `${
    mode === "back" || mode === "cancel"
      ? "bg-white dark:bg-[#121A31]"
      : mode === "download" || mode === "print"
      ? "bg-[#63ADC5]"
      : status === "bajarildi"
      ? "bg-[#E7F8F2]"
      : status === "bajarilmadi"
      ? "bg-[#FFCBD1]"
      : mode === "delete"
      ? "bg-[#F23D53]"
      : mode === "clear"
      ? "bg-[#ECF3F7]"
      : "bg-[#3B7FAF]"
  }`;

  const hoverBg = `${
    mode === "back" ||
    mode === "cancel" ||
    status === "bajarildi" ||
    status === "bajarilmadi"
      ? ""
      : mode === "clear"
      ? bg
      : "hover:bg-inherit"
  }`;

  let buttonClassName = `${
    width ? `w-[${width}px]` : ""
  }   h-[37px] transition-all duration-300  rounded-[6px] py-[15px] px-[20px] text-[13px] font-[500] flex justify-center items-center gap-2 leading-[16.94px]`;

  return (
    <button
      style={style}
      type={type}
      onClick={onClick}
      className={`
        ${buttonTextColor} 
        ${buttonTextHoverColor}
        border ${borderColor}
        ${bg} ${hoverBg}
        ${buttonClassName} ${className ? className : ""}`}
      {...props}
    >
      {mode === "download" ? (
        <Icon name="download" />
      ) : mode === "print" ? (
        <Icon name="print" />
      ) : mode === "clear" ? (
        <Icon name="change" />
      ) : mode === "back" ? (
        <Icon name="back" />
      ) : (
        <></>
      )}
      {text
        ? text
        : mode === "add"
        ? "+ " + tt("Qo'shish", "Добавить")
        : mode === "save"
        ? tt("Saqlash", "Сохранить")
        : mode === "edit"
        ? tt("Tahrirlash", "Редактировать")
        : mode === "back" || mode === "back2"
        ? tt("Orqaga", "Назад")
        : mode === "download"
        ? tt("Yuklash", "Загрузить")
        : mode === "delete"
        ? tt("O'chirish", "Удалить")
        : mode === "print"
        ? tt("Chop etish", "Печать")
        : mode === "clear"
        ? tt("Tozalash", "Очистить")
        : mode === "cancel"
        ? tt("Bekor qilish", "Отмена")
        : ""}
    </button>
  );
}

export default Button;
