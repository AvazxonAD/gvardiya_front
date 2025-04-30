import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Table from "@/Components/reusable/table/Table";
import { tt } from "@/utils";
import { Dispatch, ReactNode, SetStateAction } from "react";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "contract" | "organization";
  children: ReactNode;

  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  limit: number;
  setLimit: Dispatch<SetStateAction<number>>;
  onChange?: any;
};

const RasxodModal = ({
  open,
  setOpen,
  type,
  children,

  // page,
  // setPage,
  // limit,
  // setLimit,
  onChange,
}: Props) => {
  return (
    <Modal
      w="65vw"
      open={open}
      closeModal={() => setOpen(false)}
      title={
        type === "organization"
          ? tt("Tashkilotni tanlang", "Выберите организацию")
          : tt("Shartnomani tanlang", "Выберите договор")
      }>
      <div>
        <Input change={onChange} search p={tt("Izlash...", "Поиск...")} />
      </div>
      <div className="mt-5">
        <Table
          thead={
            type === "contract"
              ? [
                  {
                    text: tt("Shartnoma №", "№ договора"),
                    className: "border text-left w-[150px] ",
                  },
                  {
                    text: tt("Sanasi", "Дата"),
                    className: "border text-left w-[130px]",
                  },
                  {
                    text: tt("Buyurtmachi", "Заказчик"),
                    className: "border text-left",
                  },
                  {
                    text: tt("Tadbir manzili", "Место проведения"),
                    className: "border text-left",
                  },
                  {
                    text: tt("Summa", "Сумма"),
                    className: "border text-left w-[200px]",
                  },
                  {
                    text: tt("Qoldiq", "Остаток"),
                    className: "border text-left w-[200px]",
                  },
                ]
              : [
                  {
                    text: tt("Ism", "Название"),
                    className: "border text-left",
                  },
                  { text: tt("INN", "ИНН"), className: "border text-left" },
                  { text: tt("MFO", "МФО"), className: "border text-left" },
                  {
                    text: tt("Bank nomi", "Название банка"),
                    className: "border text-left",
                  },
                  {
                    text: tt("Joriy hisob", "Расчетный счет"),
                    className: "border text-left",
                  },
                  {
                    text: tt("Joriy g'azna hisobi", "Расчетный счет газна"),
                    className: "border text-left",
                  },
                ]
          }>
          {children}
        </Table>
      </div>
    </Modal>
  );
};

export default RasxodModal;
