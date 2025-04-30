/** @format */

import Icon from "@/assets/icons";
import { useEffect, useState } from "react";
import { formatNum, tt } from "../utils";

const Select = ({
  value,
  def,
  data,
  onChange,
  label,
  p,
  error,
  up,
  w,
  className,
  setOpenProps,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: any) => {
    onChange(id); // Return the selected id
    setIsOpen(false); // Close dropdown after selecting
  };

  useEffect(() => {
    if (setOpenProps) setOpenProps?.(isOpen);
  }, [isOpen]);

  const selectedOption = data?.find((item: any) => item.id === value);

  return (
    <div className={`relative ${w ? `w-[${w}px]` : "w-[300px]"} ${className}`}>
      <div className="flex gap-2 flex-col">
        {label && (
          <span
            className={`text-[12px] leading-[14.52px] font-[600] ${
              error && !value ? "text-[#F23D53]" : "text-[#636566]"
            }`}
          >
            {label}
          </span>
        )}

        <button
          type="button" // Prevent the button from submitting a form or reloading the page
          className={`w-full text-mytextcolor border text-[12px] leading-[14.52px] font-[600] rounded-[4px] bg-mycalendarbg px-4 py-2 flex justify-between items-center ${
            error && !value ? "border-[#F23D53]" : "border-myinputborder"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption ? (
            selectedOption?.name || formatNum(selectedOption?.bxm_07 ?? 0, true)
          ) : (
            <span className="text-[#BEBBBB]">{p}</span>
          )}
          <div className="flex flex-col items-center">
            <Icon name="up" />
            <Icon name="down2" />
          </div>
        </button>
      </div>
      {isOpen && (
        <ul
          className={`absolute w-full z-50 text-[12px] leading-[14.52px] font-[600] border border-gray-300 dark:border-mynavactiveborder rounded-md bg-mycalendarbg max-h-60 overflow-auto  shadow-lg ${
            up ? "bottom-full mb-1" : "top-full mt-1"
          }`} // Apply 'bottom-full' to open upwards and 'top-full' to open downwards
        >
          {def && (
            <li
              className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-mynavactivebg dark:text-white  cursor-pointer ${
                value === 0 ? "bg-gray-200 dark:bg-mynavactivebg " : ""
              }`}
              onClick={() => handleSelect(0)}
            >
              {tt("Hammasi", "Все")}
            </li>
          )}

          {data.map((item: any) => (
            <li
              key={item.id}
              className={`px-4 py-2 text-mytextcolor hover:bg-gray-100 dark:hover:bg-mynavactivebg  cursor-pointer ${
                value === item.id ? "bg-gray-200 dark:bg-mynavactivebg" : ""
              }`}
              onClick={() => handleSelect(item.id)}
            >
              {item?.name || formatNum(item?.bxm_07 ?? 0, true)}
            </li>
          ))}
        </ul>
      )}

      {error && !value ? (
        <div className="text-[12px]  leading-[14.52px] font-[600] text-[#F23D53] mt-2">
          {error}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Select;
