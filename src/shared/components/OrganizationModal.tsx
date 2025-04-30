import React from "react";
import Button from "@/Components/reusable/button";
import { PlusIcon, Trash2Icon } from "lucide-react";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import { tt } from "@/utils";

interface OrganizationModalProps {
  open: boolean;
  closeModal: () => void;
  value: {
    name: string;
    address: string;
    str: string;
    bank_name: string;
    mfo: string;
    account_numbers: string[];
    gazna_numbers: string[];
  };
  handleChange: (e: any) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAccountNumberChange: (index: number, value: string) => void;
  handleGaznaChange: (index: number, value: string) => void;
  addAccountNumber: () => void;
  addGazna: () => void;
  removeAccountNumber: (index: number) => void;
  removeGazna: (index: number) => void;
  title: string;
  submitButtonText?: string;
}

function OrganizationModal({
  open,
  closeModal,
  value,
  handleChange,
  handleSubmit,
  handleAccountNumberChange,
  handleGaznaChange,
  addAccountNumber,
  addGazna,
  removeAccountNumber,
  removeGazna,
  title,
  submitButtonText = "save",
}: OrganizationModalProps) {
  return (
    <Modal open={open} w="730px" title={title} closeModal={closeModal}>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-6 w-full">
          <div className="flex gap-3 flex-col w-1/2">
            <Input
              t={"text"}
              change={handleChange}
              v={value.name}
              n="name"
              label={tt("Nomi", "Имя")}
              p={tt("Nom kiriting", "Введите имя")}
              className="w-full"
            />
            <Input
              change={handleChange}
              v={value.address}
              n="address"
              label={tt("Manzil", "Адрес")}
              p={tt("Manzil kiriting", "Введите адрес")}
              className="w-full"
            />
            <Input
              change={handleChange}
              v={value.str}
              n="str"
              t="text"
              label={tt("INN", "ИНН")}
              p={tt("INN", "ИНН")}
              className="w-full"
            />
            <Input
              change={handleChange}
              v={value.bank_name}
              n="bank_name"
              label={tt("Bank nomi", "Название банка")}
              p={tt("Bank nomi kiritng", "Введите название банка")}
              className="w-full"
            />
            <Input
              change={handleChange}
              v={value.mfo}
              n="mfo"
              t="number"
              label={tt("MFO", "МФО")}
              p={tt("MFO kiriting", "Введите МФО")}
              className="w-full"
            />
          </div>
          <div className="flex gap-3 flex-col w-1/2">
            {/* Account numbers section */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tt("Hisob raqami", "Счет номер")}
              </label>
              {value.account_numbers.map((accountNumber, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div className="w-full">
                    <Input
                      t="text"
                      change={(e: any) =>
                        handleAccountNumberChange(index, e.target.value)
                      }
                      v={accountNumber}
                      p={tt("Hisob raqam kiriting", "Введите номер счета")}
                      className="w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAccountNumber(index)}
                    className="ml-2 text-red-500"
                  >
                    <Trash2Icon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAccountNumber}
                className="w-full py-2 border border-gray-300 rounded-md text-center text-sm flex items-center justify-center gap-2"
              >
                <PlusIcon size={16} /> {tt("Qo'shish", "Добавить")}
              </button>
            </div>

            {/* Gazna numbers section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tt("Hisob raqami g'azna", "Счет номер казначейства")}
              </label>
              {value.gazna_numbers.map((gazna, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div className="w-full">
                    <Input
                      t="text"
                      change={(e: any) =>
                        handleGaznaChange(index, e.target.value)
                      }
                      v={gazna}
                      p={tt(
                        "Xazna raqam kiriting",
                        "Введите номер казначейства"
                      )}
                      className="w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGazna(index)}
                    className="ml-2 text-red-500"
                  >
                    <Trash2Icon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addGazna}
                className="w-full py-2 border border-gray-300 rounded-md text-center text-sm flex items-center justify-center gap-2"
              >
                <PlusIcon size={16} /> {tt("Qo'shish", "Добавить")}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button mode={submitButtonText} type="submit" />
        </div>
      </form>
    </Modal>
  );
}

export default OrganizationModal;
