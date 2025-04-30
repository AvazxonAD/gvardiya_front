/** @format */

import Icon from "@/assets/icons";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";

// Uzbek months array
const uzbekMonths = [
  "yan",
  "fev",
  "mart",
  "apr",
  "may",
  "iyun",
  "iyul",
  "avg",
  "sen",
  "okt",
  "noy",
  "dek",
];
const weekDays = ["D", "S", "Ch", "P", "J", "Sh", "Y"];

interface CustomDateInputProps {
  double?: boolean;
  initialDate?: string;
  onDateSelect?: (dates: { date1: string; date2?: string }) => void;
  label?: string;
  error?: boolean;
  className?: string;
}

const CustomDateInput: React.FC<CustomDateInputProps> = ({
  double = false,
  initialDate = new Date().toISOString().split("T")[0],
  onDateSelect,
  label,
  error,
  className,
}) => {
  const today = new Date();
  const today2 = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  today2.setMonth(today.getMonth() - 1);
  const [selectedDate1, setSelectedDate1] = useState<Date | null>(today2);
  const [selectedDate2, setSelectedDate2] = useState<Date | null>(
    double ? tomorrow : null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate1, setCurrentDate1] = useState(new Date(initialDate));
  const [currentDate2, setCurrentDate2] = useState(new Date(tomorrow));
  const [date1Selected, setDate1Selected] = useState(false);
  const [date2Selected, setDate2Selected] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleInputClick = () => {
    setIsOpen(!isOpen);
    setDate2Selected(false);
    setDate1Selected(false);
  };

  const handleDateSelect = (date: Date, isFirstDate: boolean) => {
    if (isFirstDate) {
      setSelectedDate1(date);
      setDate1Selected(true);
    } else {
      setSelectedDate2(date);
      setDate2Selected(true);
    }

    if (date1Selected && date2Selected) {
      handleInputClick();
    }

    if (double) {
      setIsOpen(false);
      setDate2Selected(false);
      setDate1Selected(false);
    }
    if (onDateSelect) {
      onDateSelect({
        date1: format(selectedDate1 || date, "yyyy-MM-dd"),
        date2: double ? format(selectedDate2 || date, "yyyy-MM-dd") : undefined,
      });
    }
  };

  const formatDateWithUzbek = (date: Date) => {
    const monthIndex = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();
    return `${uzbekMonths[monthIndex]}-${day}, ${year}`;
  };

  const formattedDate = selectedDate1
    ? formatDateWithUzbek(selectedDate1) +
      (double && selectedDate2
        ? ` - ${formatDateWithUzbek(selectedDate2)}`
        : "")
    : "Sana tanlang";

  const handleNextMonth = (isFirst: boolean) => {
    const nextMonth = isFirst ? new Date(currentDate1) : new Date(currentDate2);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    isFirst ? setCurrentDate1(nextMonth) : setCurrentDate2(nextMonth);
  };

  const handlePrevMonth = (isFirst: boolean) => {
    const prevMonth = isFirst ? new Date(currentDate1) : new Date(currentDate2);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    isFirst ? setCurrentDate1(prevMonth) : setCurrentDate2(prevMonth);
  };

  const renderDays = (isFirstDate: boolean) => {
    const currentDate = isFirstDate ? currentDate1 : currentDate2;
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const startDay = firstDayOfMonth.getDay();

    const days = [
      ...Array(startDay).fill(null),
      ...Array(daysInMonth)
        .fill(null)
        .map((_, day) => day + 1),
    ];

    const selectedDay = isFirstDate
      ? selectedDate1?.getDate()
      : selectedDate2?.getDate();

    return days.map((day, index) => (
      <button
        type="button"
        key={index}
        onClick={() =>
          day &&
          handleDateSelect(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
            isFirstDate
          )
        }
        className={`w-[32px] h-[32px] text-sm rounded-[999px] font-[600] text-[20px] text-center leading-[24px] transition-all duration-300 hover:bg-[#323232] hover:text-[#FFFFFF] ${
          day === selectedDay ? "bg-[#323232] text-white" : "text-[#636363]"
        }`}
        disabled={day === null}>
        {day !== null ? day : ""}
      </button>
    ));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={"relative inline-block " + className} ref={inputRef}>
      <div className="grid gap-2 w-full">
        {label && (
          <span
            className={` ${
              error ? "text-[#F23D53]" : "text-[#636566]"
            }  text-[12px]  leading-[14.52px] font-[600] `}>
            {label}
          </span>
        )}
        <div
          onClick={handleInputClick}
          className="flex gap-2  bg-white border text-[14px] items-center rounded-[6px] py-[8px] px-[10px] max-w-[300px] border-[#D9D9D9] leading-[16.94px] text-[#636566] placeholder:text-[#BEBBBB] focus:border-[#636566] focus:outline-none">
          <Icon name="calendar" />
          <span className="text-[#636363]">
            {(date1Selected && formattedDate) || initialDate
              ? formattedDate
              : "Muddatni tanlang"}
          </span>
        </div>
      </div>

      {isOpen && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 z-10 mt-2 bg-white border border-gray-300 rounded-md shadow-lg ${
            double ? "w-[550px]" : "w-[300px]"
          }`}
          style={{ boxShadow: "0.5px 0.5px 10px 0px #00000026" }}>
          <div className="p-4 flex gap-4 justify-center">
            <div>
              <div className="flex justify-between mb-2">
                <button
                  type="button"
                  onClick={() => handlePrevMonth(true)}
                  className="text-gray-500 hover:text-gray-700">
                  &lt;
                </button>
                <span className="font-semibold text-[#636363]">
                  {uzbekMonths[currentDate1.getMonth()]}{" "}
                  {currentDate1.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => handleNextMonth(true)}
                  className="text-gray-500 hover:text-gray-700">
                  &gt;
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[#3C3C434D]">
                {weekDays.map((day, index) => (
                  <div key={index} className="font-semibold">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">{renderDays(true)}</div>
            </div>

            {double && (
              <div>
                <div className="flex justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => handlePrevMonth(false)}
                    className="text-gray-500 hover:text-gray-700">
                    &lt;
                  </button>
                  <span className="font-semibold text-[#636363]">
                    {uzbekMonths[currentDate2.getMonth()]}{" "}
                    {currentDate2.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNextMonth(false)}
                    className="text-gray-500 hover:text-gray-700">
                    &gt;
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[#3C3C434D]">
                  {weekDays.map((day, index) => (
                    <div key={index} className="font-semibold">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderDays(false)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateInput;
