import { CSSProperties, MouseEventHandler } from "react";
import {
  ArrowLeft,
  Download,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";

import { tt } from "@/utils";
import { Button as UIButton } from "@/ui";
import { cn } from "@/lib/utils";

/**
 * Loyihaning eski tugmasi — endi yangi dizayn tizimidagi `ui/Button` ustidagi
 * ingichka qatlam.
 *
 * Props interfeysi ataylab o'zgarmadi: 40 ga yaqin sahifa shu `mode`/`status`
 * nomlari bilan chaqiradi. Faqat ko'rinish yangilandi — ilgari har bir holat
 * uchun qotirilgan ranglar (`#3B7FAF`, `#F23D53`, `#63ADC5` …) yozilgan edi,
 * endi mavzu tokenlari ishlaydi, shu sabab qorong'i rejim ham o'zi to'g'ri
 * bo'ladi.
 */

type Mode =
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

type Props = {
  mode?: Mode;
  status?: "bajarildi" | "bajarilmadi";
  text?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  width?: string;
  type?: "submit" | "reset" | "button";
  style?: CSSProperties;
  className?: string;
};

/** Har bir holat uchun ko'rinish */
const VARIANT: Record<Mode, "primary" | "secondary" | "destructive" | "ghost"> =
  {
    add: "primary",
    save: "primary",
    edit: "primary",
    back: "secondary",
    back2: "secondary",
    cancel: "secondary",
    download: "secondary",
    print: "secondary",
    clear: "ghost",
    delete: "destructive",
  };

const ICON: Partial<Record<Mode, typeof Plus>> = {
  add: Plus,
  save: Save,
  edit: Pencil,
  back: ArrowLeft,
  back2: ArrowLeft,
  download: Download,
  print: Printer,
  clear: RotateCcw,
  delete: Trash2,
};

function label(mode?: Mode) {
  switch (mode) {
    case "add":
      return tt("Qo'shish", "Добавить");
    case "save":
      return tt("Saqlash", "Сохранить");
    case "edit":
      return tt("Tahrirlash", "Редактировать");
    case "back":
    case "back2":
      return tt("Orqaga", "Назад");
    case "download":
      return tt("Yuklash", "Загрузить");
    case "delete":
      return tt("O'chirish", "Удалить");
    case "print":
      return tt("Chop etish", "Печать");
    case "clear":
      return tt("Tozalash", "Очистить");
    case "cancel":
      return tt("Bekor qilish", "Отмена");
    default:
      return "";
  }
}

function Button({
  mode,
  status,
  text,
  onClick,
  width,
  type,
  style,
  className,
  children,
  ...props
}: Props & React.ComponentPropsWithoutRef<"button">) {
  const Icon = mode ? ICON[mode] : undefined;

  // `status` — bu tugma emas, holat belgisi. Yumshoq fon bilan ko'rsatiladi.
  const statusClass =
    status === "bajarildi"
      ? "border border-success/30 bg-success/10 text-success hover:bg-success/15"
      : status === "bajarilmadi"
      ? "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
      : "";

  return (
    <UIButton
      // Ilgari `w-[${width}px]` yozilardi — Tailwind bunday sinfni ishlab
      // chiqmaydi, shuning uchun kenglik hech qachon qo'llanmagan. Inline
      // uslub bilan endi haqiqatan ishlaydi.
      style={width ? { width: `${width}px`, ...style } : style}
      type={type}
      onClick={onClick}
      variant={status ? "ghost" : mode ? VARIANT[mode] : "primary"}
      className={cn(statusClass, className)}
      {...props}
    >
      {Icon && !status && <Icon />}
      {text || children || label(mode)}
    </UIButton>
  );
}

export default Button;
