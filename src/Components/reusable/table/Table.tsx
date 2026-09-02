import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ITheadItem = {
  className?: string;
  text: string;
};

type Props = {
  thead: ITheadItem[];
  children: ReactNode;
  theadClassName?: string;
  tableClassName?: string;
  tbodyClassName?: string;
  tbodyStyle?: CSSProperties;
  tableStyle?: CSSProperties;
  theadStyle?: CSSProperties;
};

/**
 * Loyihaning umumiy jadvali — yangi dizayn tokenlariga o'tkazildi.
 *
 * Props interfeysi o'zgarmadi. Ikki narsa shu yerda markazlashtirilgan:
 *
 * 1. Sarlavha qatori yopishqoq (`sticky`) — uzun ro'yxatni aylantirganda
 *    ustun nomlari ko'rinib turadi.
 * 2. Excel kabi to'liq katak chegaralari. `border-collapse` emas,
 *    `border-separate` ishlatiladi: yopishqoq sarlavhada birinchisi
 *    chegarani "yo'qotib" qo'yadi (brauzer uni jadval bilan birga
 *    aylantiradi), ikkinchisida esa chegara katakning o'ziga tegishli
 *    bo'lgani uchun joyida qoladi. Ikki marta chiziq chiqmasligi uchun
 *    har bir katakda faqat o'ng va past chegara bor, chap/yuqori chegara
 *    esa birinchi ustun va sarlavhaga beriladi.
 */
const Table = ({
  thead,
  children,
  theadClassName,
  tableClassName,
  tbodyClassName,
  tbodyStyle,
  tableStyle,
  theadStyle,
}: Props) => {
  return (
    // Sarlavha yopishqoq bo'lishi uchun aynan shu quti aylanishi kerak:
    // balandlik chegaralanmasa sahifa aylanadi va `sticky` ish bermaydi.
    <div
      className={cn(
        "w-full max-h-[calc(100vh-16rem)] overflow-auto",
        tableClassName
      )}
      style={tableStyle}
    >
      <table className="table-grid w-full">
        <thead
          style={theadStyle}
          className={cn(
            "bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/60",
            theadClassName,
            // Yopishqoqlik shu qutining tepasiga bog'langan va sahifalar uni
            // bekor qila olmaydi: eski `top-[80px]` sarlavhani jadval o'rtasida
            // qoldirib, ustidagi qatorlarni yopib qo'yardi.
            "sticky top-0 z-20"
          )}
        >
          <tr>
            {thead.map((e, ind) => (
              <th
                key={ind}
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-left align-middle",
                  "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                  e.className
                )}
              >
                {e.text}
              </th>
            ))}
          </tr>
        </thead>

        <tbody
          style={tbodyStyle}
          className={cn(
            "text-[13px] text-foreground",
            "[&>tr]:transition-colors [&>tr:hover]:bg-accent/50",
            "[&>tr>td]:px-4 [&>tr>td]:py-2.5 [&>tr>td]:align-middle",
            tbodyClassName
          )}
        >
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
