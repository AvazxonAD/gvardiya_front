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
    >
      <div className="relative max-h-[80vh] overflow-y-auto">
        {/* Sticky Title */}
        <div className="sticky top-0 z-50 bg-white pb-3">
          <h2 className="text-xl font-bold px-3 pt-3">
            {type === "organization"
              ? tt("Tashkilotni tanlang", "Выберите организацию")
              : tt("Shartnomani tanlang", "Выберите договор")}
          </h2>

          {/* Sticky Filter */}
          <div className="flex gap-x-3 px-3 pt-3">
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
        </div>

        {/* Scrollable Content */}
        <div className="mt-5 px-3 pb-6">
          <Table
            tableStyle={{ minHeight: 300 }}
            thead={
              type === "contract"
                ? [
                  {
                    text: tt("Shartnoma №", "№ договора"),
                    className: "border text-left w-[170px] sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("Sanasi", "Дата"),
                    className: "border text-left w-[130px] sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("Buyurtmachi", "Заказчик"),
                    className: "border text-left sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("Tadbir manzili", "Место проведения"),
                    className: "border text-left sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("Summa", "Сумма"),
                    className: "border text-left w-[200px] sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("Qoldiq", "Остаток"),
                    className: "border text-left w-[200px] sticky top-[110px] bg-white z-40",
                  },
                ]
                : [
                  {
                    text: tt("Ism", "Название"),
                    className: "border text-left sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("INN", "ИНН"),
                    className: "border text-left sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("MFO", "МФО"),
                    className: "border text-left sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("Bank nomi", "Название банка"),
                    className: "border text-left sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("Joriy hisob", "Расчетный счет"),
                    className: "border text-left sticky top-[110px] bg-white z-40",
                  },
                  {
                    text: tt("Joriy g'azna hisobi", "Расчетный счет газна"),
                    className: "border text-left sticky top-[110px] bg-white z-40",
                  },
                ]
            }
          >
            {console.log('-------------')}
            {children}
          </Table>

          <div className="mt-[30px]">
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
      </div>
    </Modal>

  );
};

export default PrixodModal;
