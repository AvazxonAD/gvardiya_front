import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, RotateCcw, Save } from "lucide-react";

import { getSpr, updateSprPair } from "@/api";
import { alertt } from "@/Redux/LanguageSlice";
import { tt } from "@/utils";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Skeleton,
} from "@/ui";
import { permBtn, usePermission } from "@/lib/permissions";
import Hisob from "./Hisob";

/**
 * Tashkilot rekvizitlari — viloyatga bitta qatorli ma'lumotnomalar bitta
 * sahifada: Ijrochi, Rahbar, Manzil, Bank (MFO bilan), STIR. Pastda — hisob
 * raqamlari (ular bir nechta bo'lishi mumkin).
 *
 * Backend o'zgarmagan: har bo'lim o'z endpointiga (GET/PUT /doer, /boss,
 * /adress, /bank, /str) saqlanadi — faqat o'zgargan bo'limlar yuboriladi.
 * Barcha maydonlar (kirill, lotin, rus) majburiy.
 */

type FieldDef = { key: string; label: string; digits?: number };
type Section = { path: string; title: string; hint?: string; fields: FieldDef[] };

type Values = Record<string, Record<string, string>>;

const sections = (): Section[] => {
  const withLang = (key: string, label: string): FieldDef[] => [
    { key, label },
    { key: `${key}_uz`, label: `${label} (${tt("lotin", "латиница")})` },
    { key: `${key}_ru`, label: `${label} (${tt("rus tilida", "на русском")})` },
  ];
  return [
    {
      path: "doer",
      title: tt("Ijrochi", "Исполнитель"),
      fields: [
        ...withLang("doer", tt("Ijrochi nomi", "Название исполнителя")),
        ...withLang("title", tt("Hujjat sarlavhasi", "Заголовок документа")),
      ],
    },
    {
      path: "boss",
      title: tt("Rahbar", "Руководитель"),
      fields: withLang("boss", tt("Rahbar F.I.Sh.", "ФИО руководителя")),
    },
    {
      path: "adress",
      title: tt("Manzil", "Адрес"),
      fields: withLang("adress", tt("Manzil", "Адрес")),
    },
    {
      path: "bank",
      title: tt("Bank", "Банк"),
      fields: [
        ...withLang("bank", tt("Bank nomi", "Название банка")),
        { key: "mfo", label: tt("MFO", "МФО"), digits: 5 },
      ],
    },
    {
      path: "str",
      title: tt("STIR", "ИНН"),
      fields: [{ key: "str", label: tt("STIR raqami", "Номер ИНН"), digits: 9 }],
    },
  ];
};

// "-" — backend til ustunlarining bo'sh qiymati (79.sql DEFAULT '-')
const clean = (v: unknown) => (v == null || v === "-" ? "" : String(v));

export default function Rekvizitlar() {
  const JWT = useSelector((s: any) => s.auth.jwt);
  const dispatch = useDispatch();
  // Tahrirlash huquqi bo'lmasa — faqat ko'rish (saqlash tugmasi yo'q)
  const { update: canEdit } = usePermission("spravochnik");
  const list = useMemo(sections, []);

  const [initial, setInitial] = useState<Values>({});
  const [values, setValues] = useState<Values>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(list.map((s) => getSpr(JWT, s.path)));
      const next: Values = {};
      list.forEach((s, i) => {
        const row = results[i]?.data || {};
        next[s.path] = Object.fromEntries(s.fields.map((f) => [f.key, clean(row[f.key])]));
      });
      setInitial(next);
      setValues(next);
      setErrors({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changed = (path: string) =>
    JSON.stringify(values[path] ?? {}) !== JSON.stringify(initial[path] ?? {});
  const dirty = list.some((s) => changed(s.path));

  const setField = (path: string, key: string, v: string) => {
    setValues((prev) => ({ ...prev, [path]: { ...prev[path], [key]: v } }));
    setErrors((prev) => {
      const { [`${path}.${key}`]: _, ...rest } = prev;
      return rest;
    });
  };

  const validate = (s: Section) => {
    const errs: Record<string, string> = {};
    for (const f of s.fields) {
      const v = (values[s.path]?.[f.key] ?? "").trim();
      if (!v) errs[`${s.path}.${f.key}`] = tt("To'ldiring", "Заполните");
      else if (f.digits && v && !new RegExp(`^\\d{${f.digits}}$`).test(v))
        errs[`${s.path}.${f.key}`] = tt(
          `${f.digits} ta raqam bo'lishi kerak`,
          `Должно быть ${f.digits} цифр`
        );
    }
    return errs;
  };

  const save = async () => {
    const toSave = list.filter((s) => changed(s.path));
    const errs = Object.assign({}, ...toSave.map(validate));
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const failed: string[] = [];
      for (const s of toSave) {
        const body = Object.fromEntries(
          s.fields.map((f) => {
            return [f.key, (values[s.path]?.[f.key] ?? "").trim()];
          })
        );
        const res = await updateSprPair(body, JWT, s.path);
        if (!res?.success) failed.push(`${s.title}: ${res?.message || tt("xatolik", "ошибка")}`);
      }
      dispatch(
        alertt({
          success: failed.length === 0,
          text: failed.length
            ? failed.join("; ")
            : tt("Rekvizitlar saqlandi", "Реквизиты сохранены"),
        })
      );
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[1rem] font-semibold text-foreground">
          {tt("Tashkilot rekvizitlari", "Реквизиты организации")}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading || saving}>
            <RotateCcw />
            {dirty ? tt("Bekor qilish", "Отменить") : tt("Yangilash", "Обновить")}
          </Button>
          <Button
            size="sm"
            onClick={save}
            {...permBtn(canEdit)}
            disabled={!canEdit || !dirty || saving || loading}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {tt("Saqlash", "Сохранить")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {list.map((s) => (
          <Card key={s.path} className={s.path === "doer" ? "xl:col-span-2" : undefined}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                {s.title}
                {changed(s.path) && (
                  <span className="text-[0.6875rem] font-normal text-warning">
                    {tt("o'zgartirildi", "изменено")}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  {s.fields.map((f) => (
                    <Skeleton key={f.key} className="h-[2.25rem]" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {s.fields.map((f) => (
                    <Field
                      key={f.key}
                      label={f.label}
                      required
                      error={errors[`${s.path}.${f.key}`]}
                      // Raqamli yakka maydon (MFO, STIR) — to'liq qator emas
                      className={f.digits && s.fields.length === 1 ? "sm:col-span-1" : undefined}
                    >
                      <Input
                        inputSize="sm"
                        inputMode={f.digits ? "numeric" : undefined}
                        maxLength={f.digits}
                        value={values[s.path]?.[f.key] ?? ""}
                        readOnly={!canEdit}
                        onChange={(e) =>
                          setField(
                            s.path,
                            f.key,
                            f.digits ? e.target.value.replace(/\D/g, "") : e.target.value
                          )
                        }
                      />
                    </Field>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hisob raqamlari — bir nechta bo'lishi mumkin, shu sahifaning o'zida */}
      <Hisob />
    </div>
  );
}
