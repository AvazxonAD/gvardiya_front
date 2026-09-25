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
                    className: "text-left w-[9.375rem] ",
                  },
                  {
                    text: tt("Sanasi", "Дата"),
                    className: "text-left w-[8.125rem]",
                  },
                  {
                    text: tt("Buyurtmachi", "Заказчик"),
                    className: "text-left",
                  },
                  {
                    text: tt("Tadbir manzili", "Место проведения"),
                    className: "text-left",
                  },
                  {
                    text: tt("Summa", "Сумма"),
                    className: "text-left w-[12.5rem]",
                  },
                  {
                    text: tt("Qoldiq", "Остаток"),
                    className: "text-left w-[12.5rem]",
                  },
                ]
              : [
                  {
                    text: tt("Nomi", "Название"),
                    className: "text-left",
                  },
                  { text: tt("INN", "ИНН"), className: "text-left" },
                  { text: tt("MFO", "МФО"), className: "text-left" },
                  {
                    text: tt("Bank nomi", "Название банка"),
                    className: "text-left",
                  },
                  {
                    text: tt("Joriy hisob", "Расчетный счет"),
                    className: "text-left",
                  },
                  {
                    text: tt("Joriy g'azna hisobi", "Казначейский счёт"),
                    className: "text-left",
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
