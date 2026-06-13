/** @format */

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { tt } from "@/utils";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Calendar } from "@/Components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover";

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
  const year = format(date, "yyyy");
  return `${day}-${uzbekMonths[date.getMonth()]}, ${year}`;
}

interface DateInputProps {
  /** ISO format (yyyy-MM-dd). To'liq ISO datetime ham qabul qilinadi. */
  value?: string;
  defaultValue?: string;
  onChange?: (isoDate: string, uzbekDate: string) => void;
  label?: string;
  ru?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string | boolean;
  id?: string;
}

function DateInput({
  value,
  defaultValue,
  onChange,
  label,
  name,
  placeholder = "KK.OO.YYYY",
  className,
  disabled,
  error,
  id,
}: DateInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // value/defaultValue turli formatda kelishi mumkin:
  // ISO (yyyy-MM-dd), to'liq ISO datetime, dd.MM.yyyy, dd/MM/yyyy, dd-MM-yyyy.
  const selectedDate = React.useMemo(() => {
    const raw = (value ?? defaultValue ?? "").trim();
    if (!raw) return undefined;

    // ISO sana yoki datetime
    let date = parse(raw.slice(0, 10), "yyyy-MM-dd", new Date());
    if (isValid(date)) return date;

    // ko'rinish formatlari
    for (const fmt of ["dd.MM.yyyy", "dd/MM/yyyy", "dd-MM-yyyy"]) {
      date = parse(raw, fmt, new Date());
      if (isValid(date)) return date;
    }

    // oxirgi chora — native Date
    const native = new Date(raw);
    return isValid(native) ? native : undefined;
  }, [value, defaultValue]);

  const isoValue = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  // inputValue ni tashqi qiymat bilan sinxronlaymiz
  React.useEffect(() => {
    setInputValue(selectedDate ? format(selectedDate, "dd.MM.yyyy") : "");
  }, [selectedDate]);

  const emit = (date: Date) => {
    onChange?.(format(date, "yyyy-MM-dd"), formatToUzbek(date));
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) emit(date);
    setOpen(false);
  };

  const handleTodayClick = () => {
    emit(new Date());
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // slash/dash larni nuqtaga aylantiramiz
    newValue = newValue.replace(/[/\-]/g, ".");
    // faqat raqam va nuqta
    newValue = newValue.replace(/[^\d.]/g, "");

    // yozish davomida avtomatik nuqta qo'shamiz (KK.OO.YYYY)
    if (newValue.length === 2 && inputValue.length === 1) {
      newValue = newValue + ".";
    } else if (newValue.length === 5 && inputValue.length === 4) {
      newValue = newValue + ".";
    }

    // kun (max 31) va oy (max 12) ni tekshiramiz
    const parts = newValue.split(".");
    if (parts[0] && parts[0].length === 2 && parseInt(parts[0], 10) > 31) {
      parts[0] = "31";
    }
    if (parts[1] && parts[1].length === 2 && parseInt(parts[1], 10) > 12) {
      parts[1] = "12";
    }
    newValue = parts.join(".");

    if (newValue.length > 10) newValue = newValue.slice(0, 10);

    setInputValue(newValue);

    if (newValue.length === 10) {
      const parsedDate = parse(newValue, "dd.MM.yyyy", new Date());
      if (isValid(parsedDate)) emit(parsedDate);
    } else if (newValue === "") {
      onChange?.("", "");
    }
  };

  const handleInputBlur = () => {
    if (!inputValue) return;

    let parsedDate = parse(inputValue, "dd.MM.yyyy", new Date());
    if (!isValid(parsedDate)) {
      parsedDate = parse(inputValue, "dd/MM/yyyy", new Date());
    }
    if (!isValid(parsedDate)) {
      parsedDate = parse(inputValue, "dd-MM-yyyy", new Date());
    }

    if (isValid(parsedDate)) {
      emit(parsedDate);
      setInputValue(format(parsedDate, "dd.MM.yyyy"));
    } else if (selectedDate) {
      // oldingi yaroqli qiymatga qaytaramiz
      setInputValue(format(selectedDate, "dd.MM.yyyy"));
    } else {
      setInputValue("");
      onChange?.("", "");
    }
  };

  const hasError = Boolean(error);

  return (
    <div className="grid gap-[6px]">
      {label && (
        <label
          className={cn(
            "font-bold text-xs",
            hasError && !selectedDate ? "text-[#F23D53]" : "text-[#636566]"
          )}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <Input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-[140px] pr-10 bg-background text-mytextcolor",
            hasError && !selectedDate && "border-[#F23D53]",
            className
          )}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="absolute right-0 h-full px-3 hover:bg-transparent"
            >
              <CalendarIcon className="h-4 w-4 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-mybackground"
            align="end"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              defaultMonth={selectedDate}
              initialFocus
            />
            <div className="px-3 pb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleTodayClick}
              >
                {tt("Bugun", "Сегодня")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        {/* form submit uchun yashirin input */}
        {name && <input type="hidden" name={name} value={isoValue} />}
      </div>
      {hasError && typeof error === "string" && !selectedDate && (
        <div className="text-[12px] leading-[14.52px] font-[600] text-[#F23D53]">
          {error}
        </div>
      )}
    </div>
  );
}

export { DateInput };
