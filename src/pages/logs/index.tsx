import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { NavbarPortal } from "@/layout/navbarSlot";
import { cn } from "@/lib/utils";
import useApi from "@/services/api";
import type { IActionLogUser } from "@/types/actionLog";
import { Select } from "@/ui";
import { tt } from "@/utils";
import { History, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import JournalTab, { DEFAULT_JOURNAL_FILTERS, type JournalFilters } from "./JournalTab";
import UsersTab from "./UsersTab";

type Tab = "journal" | "users";

/** Mahalliy sana "yyyy-MM-dd" (toISOString UTC ga o'tkazib, kunni surardi) */
const localDay = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/**
 * Qaydlar — kim, qachon, qaysi bo'limda nima qilgani.
 *
 * Super-admin barcha foydalanuvchilarni (viloyat filtri bilan), viloyat
 * admini faqat o'z viloyatini ko'radi — cheklov backendda qo'yiladi, bu
 * yerda faqat keraksiz filtr yashiriladi.
 */
export default function Logs() {
  const { user } = useSelector((state: any) => state.auth);
  const isSuper = !user?.region_id;
  const api = useApi();

  const [tab, setTab] = useState<Tab>("journal");
  const [from, setFrom] = useState(() => localDay(6));
  const [to, setTo] = useState(() => localDay());
  const [regionId, setRegionId] = useState("");
  const [journal, setJournal] = useState<JournalFilters>(DEFAULT_JOURNAL_FILTERS);
  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
  const [users, setUsers] = useState<IActionLogUser[]>([]);

  const patchJournal = (patch: Partial<JournalFilters>) =>
    setJournal((current) => ({ ...current, ...patch }));

  useEffect(() => {
    if (!isSuper) return;
    api.get<{ id: number; name: string }[]>("admin/regions").then((res) => {
      if (res?.success && Array.isArray(res.data)) setRegions(res.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuper]);

  // Foydalanuvchi filtri tanlangan viloyatga mos bo'lsin
  useEffect(() => {
    api
      .get<IActionLogUser[]>(`logs/users${regionId ? `?region_id=${regionId}` : ""}`)
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) setUsers(res.data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  const changeRegion = (value: string) => {
    setRegionId(value);
    // Boshqa viloyat foydalanuvchisi tanlangan bo'lib qolmasin
    patchJournal({ userId: "" });
  };

  // "Tozalash": sana oralig'i va viloyat boshlang'ich holatga
  const resetShared = () => {
    setFrom(localDay(6));
    setTo(localDay());
    changeRegion("");
  };

  // "Foydalanuvchi kesimida" dan: shu odamning barcha amallari
  const openUser = (userId: number) => {
    setJournal({ ...DEFAULT_JOURNAL_FILTERS, userId: String(userId) });
    setTab("journal");
  };

  const sharedFilters = (
    <>
      <div className="flex items-center gap-1.5">
        <SpecialDatePicker value={from} onChange={setFrom} />
        <span className="text-muted-foreground">—</span>
        <SpecialDatePicker value={to} onChange={setTo} />
      </div>
      {isSuper && (
        <div className="w-full sm:w-52">
          <Select
            selectSize="sm"
            aria-label={tt("Viloyat", "Область")}
            placeholder={tt("Barcha viloyatlar", "Все области")}
            options={regions.map((r) => ({ value: r.id, label: r.name }))}
            value={regionId}
            onChange={(e) => changeRegion(e.target.value)}
          />
        </div>
      )}
    </>
  );

  const tabs = [
    { key: "journal" as const, label: tt("Qaydlar", "Журнал"), icon: History },
    {
      key: "users" as const,
      label: tt("Foydalanuvchilar kesimida", "По пользователям"),
      icon: Users,
    },
  ];

  const description = isSuper
    ? tt(
        "Barcha foydalanuvchilar: kim, qachon, qaysi bo'limda nima qildi",
        "Все пользователи: кто, когда, в каком разделе и что сделал"
      )
    : tt(
        "Viloyatingiz foydalanuvchilari: kim, qachon, qaysi bo'limda nima qildi",
        "Пользователи вашей области: кто, когда, в каком разделе и что сделал"
      );

  return (
    <>
      {/* Tablar va izoh yuqori panelda — kontentda alohida qator egallamasin */}
      <NavbarPortal>
        <div
          role="tablist"
          className="inline-flex shrink-0 rounded-md border border-border bg-muted/40 p-0.5"
        >
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              aria-label={label}
              title={label}
              onClick={() => setTab(key)}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-[0.3125rem] px-2.5 text-[0.8125rem] font-medium transition-colors",
                tab === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <p
          className="hidden min-w-0 truncate text-[0.75rem] text-muted-foreground xl:block"
          title={description}
        >
          {description}
        </p>
      </NavbarPortal>

      {tab === "journal" ? (
        <JournalTab
          from={from}
          to={to}
          regionId={regionId}
          isSuper={isSuper}
          sharedFilters={sharedFilters}
          users={users}
          filters={journal}
          onFilters={patchJournal}
          onResetShared={resetShared}
        />
      ) : (
        <UsersTab
          from={from}
          to={to}
          regionId={regionId}
          isSuper={isSuper}
          sharedFilters={sharedFilters}
          onOpenUser={openUser}
          onResetShared={resetShared}
        />
      )}
    </>
  );
}
