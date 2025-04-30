import { tt } from "@/utils";
interface Props {
  label?: string;
  checked: boolean;
  handleChange: () => void;
  deleted?: boolean;
}
export const Checkbox = ({ label, checked, handleChange, deleted }: Props) => {
  return (
    <button
      onClick={() => handleChange()}
      className="flex items-center gap-[12px]">
      <div
        role="button"
        className={`w-[22px] cursor-pointer  h-5 ${checked
            ? `${deleted
              ? "bg-[#ff3d3d] border-[#ff3d3d]"
              : "bg-[#3a7eae] border-[#3a7eae]"
            }`
            : `bg-white border-[#323232]`
          }  rounded border `}>
        {checked && (
          <>
            <svg
              width={19}
              height={20}
              viewBox="0 0 19 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.8327 5L7.12435 14.1667L3.16602 10"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </div>
      <p className="text-mytextcolor text-sm font-normal ">
        {label ? label : ""}{" "}
        {deleted && tt("Hozirda mavjud emas", "В настоящее время недоступен")}
      </p>
    </button>
  );
};
