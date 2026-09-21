import React, { useState } from "react";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { tt } from "../../utils";
import { alertt } from "@/Redux/LanguageSlice";
import { useDispatch } from "react-redux";

type DateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedDate: string) => void;
  default_date: string
};

const DateModal: React.FC<DateModalProps> = ({ isOpen, onClose, onSave, default_date }) => {
  const [date, setDate] = useState("")
  const dispatch = useDispatch();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-card dark:bg-card rounded p-6 w-80">
        <h3 className="mb-4 font-semibold text-lg text-foreground">
          Topshiriq muddatini kiriting
        </h3>
        <SpecialDatePicker
          label={tt("kun oy yil", "день месяц год")}
          name="start_date"
          value={date}
          defaultValue={default_date}
          onChange={(event) => {
            setDate(event);
          }}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="rounded bg-muted px-4 py-2 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => {
              if (date) {
                onSave(date);
              } else {
                dispatch(
                  alertt({
                    text: tt('Iltimos, sanani tanlang', 'Пожалуйста, выберите дату'),
                    success: false,
                  })
                );
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateModal;
