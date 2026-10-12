import FilterActions from "@/Components/FilterActions";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { useRequest } from "@/hooks/useRequest";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import { formatDate, formatSum, tt } from "@/utils";
import {
  DataTable,
  ListCard,
  SummaryRow,
  SummaryTile,
  Toolbar,
  type TableColumn,
} from "@/ui";
import { useEffect, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MARKAZIY_BAZA, MODDIY_BAZA, type BazaConfig } from "./baza";

/** To'langan "Hodimlarning pul hisob-kitobi" hujjati — bazaga ulushi bilan */
type KirimDoc = {
  id: number;
  doc_num: string;
  doc_date: string;
  /** Hujjat viloyati (faqat markaziy bazada — barcha viloyatlardan) */
  region_name?: string | null;
  batalon_name: string | null;
  /** Hujjatning umumiy summasi */
  doc_summa: number;
  /** Shundan bazaga: moddiy — rasxod_fio.summa_65, markaziy — summa_10 */
  summa: number;
};

type ChiqimDoc = {
  id: number;
  doc_num: string;
  doc_date: string;
  summa: number;
  comment: string | null;
};

/** Backend: GET `${api}/monitoring` (/moddiy-baza yoki /admin/markaziy-baza) */
type MonitoringData = {
  opening: number;
  kirim: number;
  chiqim: number;
  closing: number;
  /** Davrdagi to'lanmagan hujjatlar — kirimga hali qo'shilmagan */
  pending: { count: number; summa: number };
  kirim_docs: KirimDoc[];
  chiqim_docs: ChiqimDoc[];
};

const errorText = (error: any) =>
  error?.response?.data?.message || error?.message || tt("Xatolik yuz berdi", "Произошла ошибка");

const sum = (v: number) => <span className="whitespace-nowrap tabular-nums">{formatSum(v)}</span>;

/** Ixcham jadval qutisi: sarlavha, jadval (o'zi aylanadi) va jami qatori */
function Panel({
  title,
  count,
  total,
  children,
}: {
  title: ReactNode;
  count: number;
  total: number;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-card">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
        <h3 className="truncate text-[0.8125rem] font-semibold text-foreground">{title}</h3>
        <span className="shrink-0 text-[0.75rem] text-muted-foreground tabular-nums">
          {count} {tt("ta", "шт.")}
        </span>
      </header>
      {children}
      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-2 text-[0.8125rem] font-semibold">
        <span>{tt("Jami", "Итого")}</span>
        {sum(total)}
      </footer>
    </section>
  );
}

/**
 * Monitoring: bazaga ajratilgan pul (kirim), chiqimlar va qoldiq. "Moddiy
 * baza" va "Markaziy baza" uchun bir xil — farqi `config` da (baza.ts)
 */
export function BazaMonitoring({ config }: { config: BazaConfig }) {
  const request = useRequest();
  const dispatch = useDispatch();
  const { account_number_id } = useSelector((state: any) => state.account);
  const defDate = useSelector((state: RootState) => state.defaultDate);
  const L = config.labels();

  const [from, setFrom] = useState(defDate.startDate);
  const [to, setTo] = useState(defDate.endDate);

  useEffect(() => {
    setFrom(defDate.startDate);
    setTo(defDate.endDate);
  }, [defDate.startDate, defDate.endDate]);

  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(false);

  const notify = (text: string) => dispatch(alertt({ text, success: false }));

  // Moddiy baza tanlangan hisob raqam bo'yicha; markaziy — hisob raqamsiz
  const ready = Boolean(from && to && (!config.withAccount || account_number_id));

  const fetchData = () =>
    request.get(`${config.api}/monitoring`, {
      params: { from, to, ...(config.withAccount ? { account_number_id } : {}) },
    });

  /** "Yangilash" tugmasi */
  const reload = async () => {
    if (!ready) return;
    try {
      const res = await fetchData();
      if (res.data?.success) setData(res.data.data);
    } catch (error) {
      notify(errorText(error));
    }
  };

  useEffect(() => {
    if (!ready) return;

    // Kechikkan javob yangisining ustidan yozib yubormasin
    let stale = false;
    setLoading(true);
    fetchData()
      .then((res) => {
        if (!stale && res.data?.success) setData(res.data.data);
      })
      .catch((error) => {
        if (!stale) notify(errorText(error));
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });

    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, account_number_id]);

  const kirimColumns: TableColumn<KirimDoc>[] = [
    {
      key: "doc_num",
      header: "№",
      width: "64px",
      align: "center",
      cell: (r) => <span className="tabular-nums">{r.doc_num}</span>,
      sortValue: (r) => r.doc_num,
    },
    {
      key: "doc_date",
      header: tt("Sana", "Дата"),
      width: "104px",
      align: "center",
      cell: (r) => <span className="whitespace-nowrap tabular-nums">{formatDate(r.doc_date)}</span>,
      sortValue: (r) => r.doc_date,
    },
    // Markaziy baza — barcha viloyatlardan: hujjat qaysi viloyatniki
    ...(config.showRegion
      ? [
          {
            key: "region_name",
            header: tt("Viloyat", "Область"),
            // "Toshkent shahar" sig'sin; uzunroq nom — qisqarib, to'liqi izohda
            width: "128px",
            cell: (r: KirimDoc) => (
              <span className="block truncate" title={r.region_name ?? ""}>
                {r.region_name}
              </span>
            ),
            sortValue: (r: KirimDoc) => r.region_name ?? "",
          },
        ]
      : []),
    {
      key: "batalon_name",
      header: tt("Qabul qiluvchi", "Получатель"),
      cell: (r) => <span className="block truncate">{r.batalon_name}</span>,
      sortValue: (r) => r.batalon_name ?? "",
    },
    {
      key: "doc_summa",
      header: tt("Hujjat summasi", "Сумма документа"),
      // Kirim jadvalidagi summalar 140px: "Viloyat" ustuni bo'lganda ham
      // "Qabul qiluvchi"ga joy qolsin
      width: "140px",
      align: "right",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{sum(r.doc_summa)}</span>,
      sortValue: (r) => r.doc_summa,
    },
    {
      key: "summa",
      header: L.share,
      width: "140px",
      align: "right",
      cell: (r) => <span className="font-semibold">{sum(r.summa)}</span>,
      sortValue: (r) => r.summa,
    },
  ];

  const chiqimColumns: TableColumn<ChiqimDoc>[] = [
    {
      key: "doc_num",
      header: "№",
      width: "64px",
      align: "center",
      cell: (r) => <span className="tabular-nums">{r.doc_num}</span>,
      sortValue: (r) => r.doc_num,
    },
    {
      key: "doc_date",
      header: tt("Sana", "Дата"),
      width: "104px",
      align: "center",
      cell: (r) => <span className="whitespace-nowrap tabular-nums">{formatDate(r.doc_date)}</span>,
      sortValue: (r) => r.doc_date,
    },
    {
      key: "summa",
      header: tt("Summa", "Сумма"),
      width: "150px",
      align: "right",
      cell: (r) => <span className="font-semibold">{sum(r.summa)}</span>,
      sortValue: (r) => r.summa,
    },
    {
      key: "comment",
      header: tt("Izoh", "Комментарий"),
      cell: (r) => <span className="block truncate" title={r.comment ?? ""}>{r.comment}</span>,
      sortValue: (r) => r.comment ?? "",
    },
  ];

  const empty = (
    <p className="py-6 text-center text-[0.8125rem] text-muted-foreground">
      {tt("Davrda hujjat yo'q", "За период документов нет")}
    </p>
  );

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        flush
        toolbar={
          <Toolbar>
            <div className="flex items-center gap-1.5">
              <SpecialDatePicker defaultValue={from} onChange={setFrom} />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker defaultValue={to} onChange={setTo} />
            </div>

            <FilterActions
              onRefresh={reload}
              onClear={() => {
                setFrom(defDate.startDate);
                setTo(defDate.endDate);
              }}
            />
          </Toolbar>
        }
      >
        {/* Qoldiq manfiy bo'lishi mumkin (chiqim kirimdan oldin yozilgan) —
            cheklanmaydi, faqat qizil rangda ko'rsatiladi */}
        <SummaryRow className="shrink-0">
          <SummaryTile
            label={tt("Boshlang'ich qoldiq", "Начальный остаток")}
            value={formatSum(data?.opening ?? 0)}
            tone={(data?.opening ?? 0) < 0 ? "danger" : "neutral"}
          />
          <SummaryTile label={L.allocated} value={formatSum(data?.kirim ?? 0)} tone="success" />
          <SummaryTile label={tt("Chiqim", "Расход")} value={formatSum(data?.chiqim ?? 0)} />
          <SummaryTile
            label={tt("Yakuniy qoldiq", "Конечный остаток")}
            value={formatSum(data?.closing ?? 0)}
            tone={(data?.closing ?? 0) < 0 ? "danger" : "primary"}
          />
        </SummaryRow>

        {!!data?.pending?.count && (
          <p className="shrink-0 px-3 pt-2 text-[0.75rem] text-muted-foreground sm:px-4">
            {tt(
              `Davrdagi to'lanmagan ${data.pending.count} ta hujjat (${L.shareLower} ${formatSum(data.pending.summa)}) kirimga qo'shilmagan — to'langan deb belgilangach hisobga olinadi.`,
              `Неоплаченные документы за период (${data.pending.count} шт., ${L.shareLower} ${formatSum(data.pending.summa)}) не учтены в приходе — будут учтены после отметки об оплате.`
            )}
          </p>
        )}

        {/* Kompyuterda ikkala jadval ekranga sig'adi va har biri o'zi aylanadi
            (index.css dagi `list-body` qoidasi qutilarni ustun qiladi — keng
            ekranda yonma-yon bo'lishi uchun `!flex-row`) */}
        <div className="flex min-h-0 flex-col gap-3 p-3 sm:px-4 xl:!flex-row">
          <Panel
            title={L.allocated}
            count={data?.kirim_docs?.length ?? 0}
            total={data?.kirim ?? 0}
          >
            <DataTable
              columns={kirimColumns}
              rows={data?.kirim_docs ?? []}
              keyOf={(r) => r.id}
              loading={loading && !data}
              loadingRows={4}
              fixedLayout
              empty={empty}
            />
          </Panel>

          <Panel
            title={tt("Chiqimlar", "Расходы")}
            count={data?.chiqim_docs?.length ?? 0}
            total={data?.chiqim ?? 0}
          >
            <DataTable
              columns={chiqimColumns}
              rows={data?.chiqim_docs ?? []}
              keyOf={(r) => r.id}
              loading={loading && !data}
              loadingRows={4}
              fixedLayout
              empty={empty}
            />
          </Panel>
        </div>
      </ListCard>
    </div>
  );
}

/** Viloyat: moddiy baza (F.I.Sh. chiqimlaridagi 75%) */
export default function ModdiyBazaMonitoring() {
  return <BazaMonitoring config={MODDIY_BAZA} />;
}

/** Super-admin: markaziy baza (F.I.Sh. chiqimlaridagi 10%, barcha viloyatlar) */
export function MarkaziyBazaMonitoring() {
  return <BazaMonitoring config={MARKAZIY_BAZA} />;
}
