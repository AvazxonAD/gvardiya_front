/** @format */

import Icon from "@/assets/icons";

function Input({
  label,
  error,
  p,
  t,
  v,
  change,
  search,
  n,
  blur,
  disabled,
  className,
  defaultValue,
  tush,
  onDoubleClick,
  readonly,
  removeValue,
}: any) {
  return (
    <div className="flex flex-col gap-2 relative">
      {label && (
        <span
          className={` ${error ? "text-[#F23D53]" : "text-[#636566]"
            }  text-[12px]  leading-[14.52px] font-[600] `}>
          {label}
        </span>
      )}
      {search && (
        <div className="top-3 left-2 absolute">
          <Icon name="search" />
        </div>
      )}

      <input
        defaultValue={defaultValue}
        value={v}
        name={n}
        type={t ? t : "text"}
        onChange={(e: any) => {
          change(e);
        }}
        onBlur={blur}
        placeholder={p}
        disabled={disabled}
        onDoubleClick={onDoubleClick}
        readOnly={readonly}
        className={
          `${tush ? "w-[320px]" : "w-[300px]"} h-[41px] rounded-[6px] ${removeValue ? "pe-10" : ""
          } ${search ? "pl-10" : "px-2"
          } bg-mycalendarbg border text-[14px] leading-[16.94px] text-mytextcolor placeholder:text-[#BEBBBB]   focus:border-[#636566] focus:outline-none ${error ? "border-[#F23D53]" : "border-myinputborder"
          } ` + className
        }
      />
      {removeValue && v && v.length > 0 && (
        <button onClick={removeValue} className="top-2 right-2 absolute">
          <Icon name="close" />
        </button>
      )}
      {error ? (
        <div className="text-[12px]  leading-[14.52px] font-[600] text-[#F23D53] -mt-1">
          {error}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default Input;
