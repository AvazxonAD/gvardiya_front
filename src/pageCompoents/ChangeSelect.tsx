import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { tt } from "../utils";

interface ChangeSelectProps {
  onChange?: (value: boolean) => void;
  value?: boolean; // true for Brigada, false for Batalon
}

const ChangeSelect: React.FC<ChangeSelectProps> = ({ onChange, value }) => {
  const [selected, setSelected] = useState<"Batalon" | "Brigada">(
    value ? "Brigada" : "Batalon"
  );

  useEffect(() => {
    setSelected(value ? "Brigada" : "Batalon");
  }, [value]);

  const handleClick = (choice: "Batalon" | "Brigada") => {
    setSelected(choice);
    onChange && onChange(choice === "Batalon" ? false : true);
  };

  return (
    <div className="relative flex items-center bg-background border border-border rounded-none w-[300px] h-[37px] justify-center">
      <motion.div
        className="absolute w-[142px] rounded-none h-[29px] bg-muted/60border ml-1 mr-2 shadow-md"
        layout
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          left: selected === "Batalon" ? 0 : "50%",
        }}
      />
      <button
        type="button" // Prevent form submission
        className={`w-[152px] rounded-none h-[29px] text-center z-10 text-[12px] text-foreground font-[600] leading-[14.52px] transition-all duration-300 ease-in-out ${selected === "Batalon" ? "text-foreground" : "text-muted-foreground"
          }`}
        onClick={() => handleClick("Batalon")}
      >
        {tt("Batalon", "Батальон")}
      </button>
      <button
        type="button" // Prevent form submission
        className={`w-[152px] rounded-none h-[29px] text-center z-10 text-[12px] text-foreground font-[600] leading-[14.52px] transition-all duration-300 ease-in-out ${selected === "Brigada" ? "text-foreground" : "text-muted-foreground"
          }`}
        onClick={() => handleClick("Brigada")}
      >
        {tt("Brigada", "Бригада")}
      </button>
    </div>
  );
};

export default ChangeSelect;
