import { cn } from "@/lib/utils";
import { tt } from "@/utils";
import { format, isValid } from "date-fns";
import { Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";

const uzbekMonths = [
  "yan",
  "fev",
  "mart",
  "apr",
  "may",
  "iyun",
  "iyul",
  "avg",
  "sent",
  "okt",
  "noy",
  "dek",
];

function formatToUzbek(date: Date): string {
  if (!isValid(date)) return "";

  const day = format(date, "dd");
  const monthIndex = date.getMonth();
  const year = format(date, "yyyy");
  const uzbekMonth = uzbekMonths[monthIndex];
  return `${day}-${uzbekMonth}, ${year}`;
}

interface DatePickerProps {
  label?: string;
  ru?: string;
  name?: string;
  defaultValue?: string;
  onChange?: (date: string, formattedDate: string) => void;
  error?: string | boolean;
}

interface DateErrors {
  day?: string;
  month?: string;
  year?: string;
}

export function SpecialDatePicker({
  label,
  defaultValue,
  onChange,
  error,
}: DatePickerProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [dateErrors, setDateErrors] = useState<DateErrors>({});

  useEffect(() => {
    if (defaultValue) {
      // Avval Date orqali tekshiramiz
      try {
        const date = new Date(defaultValue);
        if (isValid(date)) {
          setDay(format(date, "dd"));
          setMonth((date.getMonth() + 1).toString().padStart(2, "0"));
          setYear(format(date, "yyyy"));
          return;
        }
      } catch (e) {
        console.error("Invalid date format, trying split method");
      }

      // Agar Date bilan bo'lmasa, string split qilamiz
      try {
        // ISO format (yyyy-MM-dd) uchun
        if (defaultValue.includes("-")) {
          const [y, m, d] = defaultValue.split("-");
          if (y) setYear(y);
          if (m) setMonth(m);
          if (d) setDay(d);
        }
        // KK/OO/YYYY format uchun
        else if (defaultValue.includes("/")) {
          const [d, m, y] = defaultValue.split("/");
          if (d) setDay(d);
          if (m) setMonth(m);
          if (y) setYear(y);
        }
      } catch (e) {
        console.error("Error parsing date string:", e);
      }
    }
  }, [defaultValue]);

  const validateDay = (value: string): string | undefined => {
    if (!value) return undefined;
    const dayNum = parseInt(value);
    if (isNaN(dayNum)) return tt("Format xato", "Xato format");
    if (dayNum < 1 || dayNum > 31) return tt("Format xato", "Xato format");
    return undefined;
  };

  const validateMonth = (value: string): string | undefined => {
    if (!value) return undefined;
    const monthNum = parseInt(value);
    if (isNaN(monthNum)) return tt("Format xato", "Xato format");
    if (monthNum < 1 || monthNum > 12) return tt("Format xato", "Xato format");
    return undefined;
  };

  const validateYear = (value: string): string | undefined => {
    if (!value) return undefined;
    const yearNum = parseInt(value);
    if (isNaN(yearNum)) return tt("Format xato", "Xato format");
    if (yearNum < 1900 || yearNum > 2300)
      return tt("Format xato", "Xato format");
    return undefined;
  };

  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    const errors: DateErrors = {
      day: validateDay(newDay),
      month: validateMonth(newMonth),
      year: validateYear(newYear),
    };

    setDateErrors(errors);

    if (newDay && newMonth && newYear && !Object.values(errors).some(Boolean)) {
      try {
        const date = new Date(
          parseInt(newYear),
          parseInt(newMonth) - 1,
          parseInt(newDay)
        );

        if (isValid(date)) {
          const isoDate = format(date, "yyyy-MM-dd");
          const uzbekDate = formatToUzbek(date);
          onChange?.(isoDate, uzbekDate);
        }
      } catch (e) {
        console.error("Invalid date combination:", {
          newDay,
          newMonth,
          newYear,
        });
      }
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newDay = e.target.value.replace(/\D/g, "");
    if (newDay.length > 2) newDay = newDay.slice(0, 2);
    if (parseInt(newDay) > 31) newDay = "31";
    setDay(newDay);
    updateDate(newDay, month, year);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMonth = e.target.value.replace(/\D/g, "");
    if (newMonth.length > 2) newMonth = newMonth.slice(0, 2);
    if (parseInt(newMonth) > 12) newMonth = "12";
    setMonth(newMonth);
    updateDate(day, newMonth, year);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newYear = e.target.value.replace(/\D/g, "");
    if (newYear.length > 4) newYear = newYear.slice(0, 4);
    setYear(newYear);
    updateDate(day, month, newYear);
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (isValid(date)) {
      const newDay = format(date, "dd");
      const newMonth = (date.getMonth() + 1).toString().padStart(2, "0");
      const newYear = format(date, "yyyy");

      setDay(newDay);
      setMonth(newMonth);
      setYear(newYear);
      updateDate(newDay, newMonth, newYear);
    }
  };

  return (
    <div className="grid gap-[6px]">
      {label && (
        <label
          className={cn(
            "font-bold text-xs",
            error && (!day || !month || !year)
              ? "text-[#F23D53]"
              : "text-[#636566]"
          )}
        >
          {label}
        </label>
      )}
      <div className="flex gap-2 items-center justify-between border px-2 py-1 rounded-lg">
        <div className="flex items-center gap-1">
          <input
            type="text"
            className={cn(
              "w-8 rounded-lg focus:ring-1 focus:border-transparent outline-none text-center bg-background",
              (error && !day) || dateErrors.day
                ? "focus:ring-[#F23D53]"
                : "focus:ring-mybordercolor"
            )}
            value={day}
            onChange={handleDayChange}
            placeholder="KK"
            maxLength={2}
          />
          <span className="text-gray-500">/</span>
          <input
            type="text"
            className={cn(
              "w-8 px-0 py-1 rounded-lg focus:ring-1 focus:border-transparent outline-none text-center bg-background",
              (error && !month) || dateErrors.month
                ? "focus:ring-[#F23D53]"
                : "focus:ring-mybordercolor"
            )}
            value={month}
            onChange={handleMonthChange}
            placeholder="OO"
            maxLength={2}
          />
          <span className="text-gray-500">/</span>
          <input
            type="text"
            className={cn(
              "w-16 px-0 py-1 rounded-lg focus:ring-1  focus:border-transparent outline-none text-center bg-background",
              (error && !year) || dateErrors.year
                ? "focus:ring-[#F23D53]"
                : "focus:ring-mybordercolor"
            )}
            value={year}
            onChange={handleYearChange}
            placeholder="YYYY"
            maxLength={4}
          />
        </div>
        <div className="relative">
          <Calendar className="h-5 w-5 text-gray-400 cursor-pointer" />
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-5"
            onChange={handleDatePickerChange}
            value={year && month && day ? `${year}-${month}-${day}` : ""}
          />
        </div>
      </div>
      {error && (!day || !month || !year) && (
        <div className="text-[12px] leading-[14.52px] font-[600] text-[#F23D53]">
          {error}
        </div>
      )}
    </div>
  );
}
