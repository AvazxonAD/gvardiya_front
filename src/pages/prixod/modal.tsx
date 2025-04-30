import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Paginatsiya from "@/Components/Paginatsiya";
import Table from "@/Components/reusable/table/Table";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { tt } from "@/utils";
import { Dispatch, ReactNode, SetStateAction } from "react";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "contract" | "organization";
  children: ReactNode;
  meta?: {
    nextPage: number | null;
    backPage: number | null;
    pageCount: number;
    currentPage: number;
    count: number;
  };
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  limit: number;
  setLimit: Dispatch<SetStateAction<number>>;
  onChange?: any;
  contractFrom?: string;
  contractTo?: string;
  setContractFrom?: Dispatch<SetStateAction<string>>;
  setContractTo?: Dispatch<SetStateAction<string>>;
  hasDate?: boolean;
};

const PrixodModal = ({
  open,
  setOpen,
  type,
  children,
  meta,
  page,
  setPage,
  limit,
  setLimit,
  onChange,
  contractFrom,
  contractTo,
  setContractFrom,
  setContractTo,
  hasDate,
}: Props) => {
  return (
    <Modal
      w="100%"
      open={open}
      closeModal={() => setOpen(false)}
      title={
        type === "organization"
          ? tt("Tashkilotni tanlang", "Выберите организацию")
          : tt("Shartnomani tanlang", "Выберите договор")
      }
    >
      <div className="flex gap-x-3">
        <Input change={onChange} search p={tt("Izlash...", "Поиск...")} />
        {hasDate && (
          <div className="flex gap-x-3">
            <SpecialDatePicker
              defaultValue={contractFrom}
              onChange={setContractFrom}
            />
            <SpecialDatePicker
              defaultValue={contractTo}
              onChange={setContractTo}
            />
          </div>
        )}
      </div>
      <div className="mt-5">
        <Table
          tableStyle={{ minHeight: 300 }}
          thead={
            type === "contract"
              ? [
                  {
                    text: tt("Shartnoma №", "№ договора"),
                    className: "border text-left w-[170px] ",
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
          }
        >
          {children}
        </Table>
        <div className=" mt-[30px]">
          <Paginatsiya
            currentPage={page}
            setCurrentPage={setPage}
            totalPages={meta?.pageCount}
            limet={limit}
            setLimet={setLimit}
            count={meta?.count}
          />
        </div>
      </div>
    </Modal>
  );
};

export default PrixodModal;
