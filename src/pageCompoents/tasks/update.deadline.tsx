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
      <div className="bg-white rounded p-6 w-80">
        <h3 className="mb-4 font-semibold text-lg">
          Topshiriq muddatini kiriting
        </h3>
        <SpecialDatePicker
          label={tt("kun oy yil", "один ой йил")}
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
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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
                    text: tt('Iltimos sana tanlnag', 'Iltimos sana tanlnag'),
                    success: false,
                  })
                );
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateModal;
