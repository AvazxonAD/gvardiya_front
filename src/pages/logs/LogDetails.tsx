import useApi from "@/services/api";
import ExportButtons from "@/Components/ExportButtons";
import type { ExportColumn } from "@/lib/tableExport";
import type { IActionLog, IActionLogDetails } from "@/types/actionLog";
import { Badge, Modal, Skeleton } from "@/ui";
import { formatDateTime, tt } from "@/utils";
import { useEffect, useState, type ReactNode } from "react";
import {
  actionLabel,
  actionTone,
  describeLog,
  formatDuration,
  moduleLabel,
  roleLabel,
} from "./labels";

type Json = Record<string, unknown>;

// updated_at har tahrirda o'zgaradi — foydalanuvchi uchun ma'no bermaydi
const IGNORED = new Set(["updated_at"]);

const changedKeys = (before: Json, after: Json) =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (k) =>
      !IGNORED.has(k) &&
      JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null)
  );

const show = (value: unknown) =>
  value === null || value === undefined || value === ""
    ? "—"
    : typeof value === "object"
    ? JSON.stringify(value, null, 2)
    : String(value);

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{children || "—"}</dd>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  if (value == null) {
    return <p className="text-[0.8125rem] text-muted-foreground">—</p>;
  }
  return (
    <pre className="max-h-72 overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-[0.75rem] leading-relaxed text-foreground">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

/** Yozuvning oldingi va keyingi holati: faqat o'zgargan maydonlar */
function Changes({ log }: { log: IActionLogDetails }) {
  const before = log.old_data;
  const after = log.new_data;

  if (!before && after) {
    return (
      <Section title={tt("Yaratilgan yozuv", "Созданная запись")}>
        <JsonBlock value={after} />
      </Section>
    );
  }
  if (before && !after) {
    return (
      <Section title={tt("O'zgarishlar: oldin → keyin", "Изменения: до → после")}>
        <p className="text-[0.8125rem] text-muted-foreground">
          {log.success
            ? tt(
                "Yozuvning keyingi holatini o'qib bo'lmadi (butunlay o'chirilgan bo'lishi mumkin). Oldingi holati quyida.",
                "Не удалось прочитать запись после запроса (возможно, удалена полностью). Прежнее состояние ниже."
              )
            : tt(
                "So'rov bajarilmagan — yozuv o'zgarmagan. Uning o'sha paytdagi holati quyida.",
                "Запрос не выполнен — запись не изменилась. Её состояние на тот момент ниже."
              )}
        </p>
      </Section>
    );
  }
  if (!before || !after) return null;

  const keys = changedKeys(before, after);

  const exportColumns = (): ExportColumn<string>[] => [
    { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
    { header: tt("Maydon", "Поле"), value: (k) => k },
    { header: tt("Oldin", "До"), value: (k) => show(before[k]) },
    { header: tt("Keyin", "После"), value: (k) => show(after[k]) },
  ];

  return (
    <Section title={tt("O'zgarishlar: oldin → keyin", "Изменения: до → после")}>
      {keys.length === 0 ? (
        <p className="text-[0.8125rem] text-muted-foreground">
          {tt("Yozuvda o'zgarish yo'q.", "Запись не изменилась.")}
        </p>
      ) : (
        <>
        <div className="mb-2 flex justify-end gap-2">
          <ExportButtons
            title={`${actionLabel(log.action)} — ${formatDateTime(log.created_at)}`}
            columns={exportColumns()}
            fetchRows={async () => keys}
          />
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full table-fixed text-[0.8125rem]">
            <thead className="bg-muted/60 text-left text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[24%] px-3 py-2 font-semibold">{tt("Maydon", "Поле")}</th>
                <th className="px-3 py-2 font-semibold">{tt("Oldin", "До")}</th>
                <th className="px-3 py-2 font-semibold">{tt("Keyin", "После")}</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key} className="border-t border-border align-top">
                  <td className="break-words px-3 py-2 font-mono text-[0.75rem] text-muted-foreground">
                    {key}
                  </td>
                  <td className="px-3 py-2">
                    <div className="max-h-40 overflow-auto whitespace-pre-wrap break-words bg-destructive/5 px-2 py-1 font-mono text-[0.75rem] text-destructive">
                      {show(before[key])}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="max-h-40 overflow-auto whitespace-pre-wrap break-words bg-success/5 px-2 py-1 font-mono text-[0.75rem] text-success">
                      {show(after[key])}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </Section>
  );
}

/**
 * Bitta qaydning to'liq ma'lumoti. Ro'yxat qatoridagi asosiy maydonlar darhol
 * ko'rinadi; so'rov / javob tanasi va yozuvning oldin-keyin holati alohida
 * so'rov bilan olinadi (ro'yxatga og'ir ustunlar kelmaydi).
 */
export default function LogDetails({
  log,
  onClose,
}: {
  log: IActionLog | null;
  onClose: () => void;
}) {
  const api = useApi();
  const [full, setFull] = useState<IActionLogDetails | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!log) return;
    let stale = false;
    setFull(null);
    setFailed(false);

    api.get<IActionLogDetails>(`logs/${log.id}`).then((res) => {
      if (stale) return;
      if (res?.success && res.data) setFull(res.data);
      else setFailed(true);
    });

    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log?.id]);

  const description = log ? describeLog(log) : null;

  return (
    <Modal
      open={Boolean(log)}
      onClose={onClose}
      size="2xl"
      title={tt("Qayd tafsilotlari", "Детали записи")}
      description={log ? formatDateTime(log.created_at) : undefined}
    >
      {log && (
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-[8.125rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-[0.8125rem]">
            <Row label={tt("Foydalanuvchi", "Пользователь")}>
              {log.user_fio || log.user_login}
              {log.user_fio && log.user_login && (
                <span className="text-muted-foreground"> ({log.user_login})</span>
              )}
            </Row>
            <Row label={tt("Rol", "Роль")}>{roleLabel(log.user_role)}</Row>
            <Row label={tt("Viloyat", "Область")}>{log.region_name}</Row>
            {log.batalon_name && (
              <Row label={tt("Batalon", "Батальон")}>{log.batalon_name}</Row>
            )}
            <Row label={tt("Bo'lim", "Раздел")}>{moduleLabel(log.module)}</Row>
            <Row label={tt("Amal", "Действие")}>
              <span className="flex flex-wrap items-center gap-2">
                <Badge tone={actionTone(log.action)}>{actionLabel(log.action)}</Badge>
                {description}
              </span>
            </Row>
            <Row label={tt("Obyekt ID", "ID объекта")}>
              {log.entity_id && <span className="tabular-nums">#{log.entity_id}</span>}
            </Row>
            <Row label={tt("Natija", "Результат")}>
              <span className="flex flex-wrap items-center gap-2">
                <Badge tone={log.success ? "success" : "danger"} dot>
                  {log.status}
                </Badge>
                {log.error}
              </span>
            </Row>
            <Row label={tt("So'rov", "Запрос")}>
              <code className="font-mono text-[0.75rem]">
                {log.method} {log.url}
              </code>
            </Row>
            <Row label={tt("Davomiyligi", "Длительность")}>
              {formatDuration(log.duration_ms)}
            </Row>
            <Row label="IP">
              <span className="font-mono text-[0.75rem]">{log.ip}</span>
            </Row>
            <Row label={tt("Qurilma", "Устройство")}>
              <span className="text-[0.75rem] text-muted-foreground">{full?.user_agent}</span>
            </Row>
          </dl>

          {failed ? (
            <p className="text-[0.8125rem] text-destructive">
              {tt("Tafsilotlarni yuklab bo'lmadi.", "Не удалось загрузить детали.")}
            </p>
          ) : !full ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              <Changes log={full} />

              <Section
                title={tt(
                  "So'rov (request body) — parollar yashirilgan",
                  "Запрос (request body) — пароли скрыты"
                )}
              >
                <JsonBlock value={full.body} />
              </Section>

              <Section title={tt("Javob (response body)", "Ответ (response body)")}>
                {full.response || full.method !== "GET" ? (
                  <JsonBlock value={full.response} />
                ) : (
                  <p className="text-[0.8125rem] text-muted-foreground">
                    {tt(
                      "Ko'rish (GET) javoblari saqlanmaydi — ro'yxatlar katta, ma'lumot jadvallarda bor.",
                      "Ответы просмотра (GET) не сохраняются — списки большие, данные есть в таблицах."
                    )}
                  </p>
                )}
              </Section>

              {(full.old_data || full.new_data) && (
                <details className="rounded-md border border-border">
                  <summary className="cursor-pointer select-none px-3 py-2 text-[0.8125rem] font-medium text-foreground">
                    {tt("Yozuvning to'liq holati: oldin / keyin", "Полное состояние записи: до / после")}
                  </summary>
                  <div className="grid gap-3 border-t border-border p-3 md:grid-cols-2">
                    <Section title={tt("Oldin", "До")}>
                      <JsonBlock value={full.old_data} />
                    </Section>
                    <Section title={tt("Keyin", "После")}>
                      <JsonBlock value={full.new_data} />
                    </Section>
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
