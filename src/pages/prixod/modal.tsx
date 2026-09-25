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
        <div className="sticky top-0 z-50 bg-card pb-3">
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
                    className: "text-left w-[10.625rem]",
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
                  {
                    text: tt("INN", "ИНН"),
                    className: "text-left",
                  },
                  {
                    text: tt("MFO", "МФО"),
                    className: "text-left",
                  },
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
            }
          >
            {children}
          </Table>

          <div className="mt-[1.875rem]">
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
