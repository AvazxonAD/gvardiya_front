import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Check, Minus } from "lucide-react";

import Modal from "@/Components/Modal";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { cn } from "@/lib/utils";
import { tt } from "@/utils";
import {
  PERM_MENUS,
  type PermAction,
  type Permissions,
} from "@/lib/permissions";
import { Button } from "@/ui";

type StaffLike = {
  id: number;
  fio: string;
  permissions?: Permissions | null;
};

type Props = {
  staff: StaffLike | null;
  onClose: () => void;
  onSaved: () => void;
};

const COLUMNS: { action: PermAction; uz: string; ru: string; short: string }[] = [
  { action: "read", uz: "Ko'rish", ru: "Просмотр", short: "R" },
  { action: "create", uz: "Yaratish", ru: "Создание", short: "C" },
  { action: "update", uz: "Tahrirlash", ru: "Изменение", short: "U" },
  { action: "delete", uz: "O'chirish", ru: "Удаление", short: "D" },
  { action: "sign", uz: "Imzo", ru: "Подпись", short: "E-IMZO" },
];

/**
 * Xodim ruhsatlari: qator — menyu, ustun — amal.
 *
 * "Ko'rish" belgilansa menyu xodimga ko'rinadi (boshlang'ich ruhsat).
 * Yaratish / tahrirlash / o'chirish / imzo belgilansa "Ko'rish" o'zi
 * yoqiladi; "Ko'rish" olib tashlansa — o'sha menyudagi hamma amal o'chadi.
 * Menyuda ma'nosi yo'q amallar (masalan hisobotda "O'chirish") ko'rsatilmaydi.
 */
function PermissionsModal({ staff, onClose, onSaved }: Props) {
  const api = useApi();
  const dispatch = useDispatch();
  const [perms, setPerms] = useState<Permissions>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPerms(staff?.permissions ? structuredClone(staff.permissions) : {});
  }, [staff]);

  const has = (menu: string, action: PermAction) =>
    Boolean(perms[menu]?.includes(action));

  const toggle = (menu: string, action: PermAction) => {
    setPerms((prev) => {
      const current = new Set(prev[menu] ?? []);
      if (current.has(action)) {
        if (action === "read") current.clear();
        else current.delete(action);
      } else {
        current.add(action);
        current.add("read");
      }
      const next = { ...prev };
      if (current.size) next[menu] = COLUMNS.map((c) => c.action).filter((a) => current.has(a));
      else delete next[menu];
      return next;
    });
  };

  // Ustun sarlavhasi bosilsa — shu amal barcha menyularda yoqiladi/o'chiriladi
  const toggleColumn = (action: PermAction) => {
    const menus = PERM_MENUS.filter((m) => m.actions.includes(action));
    const allOn = menus.every((m) => has(m.key, action));
    setPerms((prev) => {
      const next: Permissions = { ...prev };
      for (const m of menus) {
        const set = new Set(next[m.key] ?? []);
        if (allOn) {
          if (action === "read") set.clear();
          else set.delete(action);
        } else {
          set.add(action);
          set.add("read");
        }
        if (set.size) next[m.key] = COLUMNS.map((c) => c.action).filter((a) => set.has(a));
        else delete next[m.key];
      }
      return next;
    });
  };

  const save = async () => {
    if (!staff || saving) return;
    setSaving(true);
    try {
      const res: any = await api.update(`region/staff/${staff.id}/permissions`, {
        permissions: perms,
      });
      if (res?.success) {
        dispatch(alertt({ success: true, text: tt("Ruxsatlar saqlandi", "Права сохранены") }));
        onSaved();
        onClose();
      } else {
        dispatch(
          alertt({
            success: false,
            text: res?.message || tt("Xatolik yuz berdi", "Произошла ошибка"),
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const grantedCount = Object.keys(perms).length;

  return (
    <Modal
      title={`${tt("Ruxsatlar", "Права доступа")}: ${staff?.fio ?? ""}`}
      open={staff !== null}
      closeModal={onClose}
      w="760px"
    >
      <div className="flex w-full flex-col gap-3">
        <p className="text-[0.8125rem] text-muted-foreground">
          {tt(
            "Belgilangan bo'limlar xodimning menyusida ko'rinadi. \"Ko'rish\" — boshlang'ich ruhsat; qolganlari tanlanganda u o'zi yoqiladi.",
            "Отмеченные разделы появятся в меню сотрудника. «Просмотр» — базовое право; при выборе остальных оно включается автоматически."
          )}
        </p>

        <div className="max-h-[60vh] overflow-auto rounded-md border border-border">
          <table className="w-full border-collapse text-[0.8125rem]">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">
                  {tt("Bo'lim", "Раздел")}
                </th>
                {COLUMNS.map((c) => (
                  <th key={c.action} className="px-2 py-2 text-center font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleColumn(c.action)}
                      className="inline-flex flex-col items-center leading-tight hover:text-primary"
                      title={tt("Hammasini belgilash / olib tashlash", "Отметить / снять все")}
                    >
                      <span>{tt(c.uz, c.ru)}</span>
                      <span className="text-[0.6875rem] font-normal text-muted-foreground">
                        {c.short}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERM_MENUS.map((m) => {
                const enabled = has(m.key, "read");
                return (
                  <tr key={m.key} className="border-t border-border">
                    <td className={cn("px-3 py-2", enabled ? "font-medium" : "text-muted-foreground")}>
                      {tt(m.uz, m.ru)}
                    </td>
                    {COLUMNS.map((c) => {
                      const applicable = m.actions.includes(c.action);
                      const on = has(m.key, c.action);
                      return (
                        <td key={c.action} className="px-2 py-2 text-center">
                          {applicable ? (
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={on}
                              aria-label={`${tt(m.uz, m.ru)} — ${tt(c.uz, c.ru)}`}
                              onClick={() => toggle(m.key, c.action)}
                              className={cn(
                                "inline-flex size-5 items-center justify-center rounded border transition-colors",
                                // Ko'k chegara va yengil soya — bo'sh katak ham aniq ko'rinsin
                                on
                                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
                                  : "border-primary/50 bg-primary/5 shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] hover:border-primary hover:bg-primary/10"
                              )}
                            >
                              {on && <Check className="size-3.5" strokeWidth={3} />}
                            </button>
                          ) : (
                            <Minus className="mx-auto size-3.5 text-muted-foreground/40" aria-hidden />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.8125rem] text-muted-foreground">
            {tt("Ruxsat berilgan bo'limlar", "Разрешённых разделов")}: {grantedCount}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {tt("Bekor qilish", "Отмена")}
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {tt("Saqlash", "Сохранить")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PermissionsModal;
