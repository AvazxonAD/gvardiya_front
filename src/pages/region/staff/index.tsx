import SecretText from "@/Components/SecretText";
import DeleteModal from "@/Components/DeleteModal";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import { useDebounce } from "use-debounce";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Button from "@/Components/reusable/button";
import Table from "@/Components/reusable/table/Table";
import Select from "@/Components/Select";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { tt } from "@/utils";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { KeyRound, Pencil, Plus, Trash2, UserCog } from "lucide-react";
import PermissionsModal from "./PermissionsModal";
import type { Permissions } from "@/lib/permissions";
import {
  Badge,
  Button as UIButton,
  EmptyState,
  ListCard,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

/**
 * Viloyat xodimlari: yurist va buxgalter.
 *
 * Viloyat admini ularni o'zi ochadi (backend: /region/staff).
 * Buxgalter admin bilan bir xil ishlaydi, faqat shartnomani tasdiqlay
 * olmaydi. Yurist — faqat o'ziga yuborilgan shartnomalarni ko'radi.
 */
type StaffType = "lawyer" | "accountant";

type Staff = {
  id: number;
  fio: string;
  login: string;
  type: StaffType;
  pinfl: string | null;
  created_at: string;
  last_login_at: string | null;
  permissions?: Permissions | null;
};

type FormValues = {
  fio: string;
  login: string;
  password: string;
  pinfl: string;
  type: StaffType | "";
};

const EMPTY: FormValues = { fio: "", login: "", password: "", pinfl: "", type: "" };

const staffTypes = () => [
  { id: "accountant", name: tt("Buxgalter", "Бухгалтер") },
  { id: "lawyer", name: tt("Yurist", "Юрист") },
];

const typeHint = (type: string) =>
  type === "accountant"
    ? tt(
        "Admin ma'lumotlari bilan ishlaydi — bo'limlar \"Ruxsatlar\" bo'yicha",
        "Работает с данными админа — разделы по «Правам доступа»"
      )
    : type === "lawyer"
    ? tt(
        "Yuristga yuborilgan shartnomalarni tasdiqlaydi; boshqa bo'limlar \"Ruxsatlar\" bo'yicha",
        "Утверждает отправленные юристу договоры; остальные разделы по «Правам доступа»"
      )
    : "";

function TypeBadge({ type }: { type: string }) {
  return type === "accountant" ? (
    <Badge tone="primary">{tt("Buxgalter", "Бухгалтер")}</Badge>
  ) : (
    <Badge tone="brand">{tt("Yurist", "Юрист")}</Badge>
  );
}

const StaffPage: React.FC = () => {
  const api = useApi();
  const dispatch = useDispatch();

  const [rows, setRows] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchText] = useDebounce(search.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  // null — oyna yopiq, "new" — qo'shish, Staff — tahrirlash
  const [editing, setEditing] = useState<Staff | "new" | null>(null);
  const [deleting, setDeleting] = useState<Staff | null>(null);
  const [permFor, setPermFor] = useState<Staff | null>(null);
  const isNew = editing === "new";

  const notify = (success: boolean, text: string) =>
    dispatch(alertt({ success, text }));

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await api.get<Staff[]>(
        "region/staff?" +
          (searchText ? `search=${encodeURIComponent(searchText)}` : "") +
          sortParams(sort)
      );
      if (res?.success && res.data) setRows(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, sort]);

  const formik = useFormik<FormValues>({
    initialValues: EMPTY,
    enableReinitialize: true,
    validationSchema: Yup.object({
      fio: Yup.string().trim().required(tt("F.I.Sh. kiriting", "Введите ФИО")),
      login: Yup.string().trim().required(tt("Login kiriting", "Введите логин")),
      password: (() => {
        const base = Yup.string().min(
          8,
          tt(
            "Parol kamida 8 ta belgi bo'lishi kerak",
            "Пароль должен содержать минимум 8 символов"
          )
        );
        // Tahrirlashda bo'sh qoldirilsa — parol o'zgarmaydi
        return isNew
          ? base.required(tt("Parolni kiriting", "Введите пароль"))
          : base;
      })(),
      pinfl: Yup.string()
        .required(tt("PINFL kiriting", "Введите ПИНФЛ"))
        .matches(/^\d{14}$/, {
          message: tt(
            "PINFL 14 ta raqamdan iborat bo'lishi kerak",
            "ПИНФЛ должен состоять из 14 цифр"
          ),
        }),
      type: Yup.string()
        .oneOf(["lawyer", "accountant"])
        .required(tt("Turni tanlang", "Выберите тип")),
    }),
    onSubmit: async (values, { resetForm }) => {
      const body = {
        fio: values.fio.trim(),
        login: values.login.trim(),
        password: values.password,
        pinfl: values.pinfl,
        type: values.type,
      };
      const res: any = isNew
        ? await api.post("region/staff", body)
        : await api.update(`region/staff/${(editing as Staff).id}`, body);

      if (res?.success) {
        notify(
          true,
          isNew
            ? tt("Foydalanuvchi qo'shildi", "Пользователь добавлен")
            : tt("Foydalanuvchi o'zgartirildi", "Пользователь изменён")
        );
        setEditing(null);
        resetForm({ values: EMPTY });
        fetchRows();
      } else {
        notify(false, res?.error || res?.message || tt("Xatolik yuz berdi", "Произошла ошибка"));
      }
    },
  });

  useEffect(() => {
    if (editing && editing !== "new") {
      formik.setValues({
        fio: editing.fio ?? "",
        login: editing.login ?? "",
        password: "",
        pinfl: editing.pinfl ?? "",
        type: editing.type,
      });
    } else if (editing === "new") {
      formik.resetForm({ values: EMPTY });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const closeForm = () => {
    formik.resetForm({ values: EMPTY });
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res: any = await api.remove(`region/staff/${deleting.id}`);
    notify(
      Boolean(res?.success),
      res?.success
        ? tt("Muvaffaqiyatli o'chirildi", "Успешно удалено")
        : res?.error || res?.message || tt("Xatolik", "Ошибка")
    );
    setDeleting(null);
    if (res?.success) fetchRows();
  };

  const err = (k: keyof FormValues) =>
    formik.touched[k] ? (formik.errors[k] as string | undefined) : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <div className="w-full sm:w-72">
              <Input
                v={search}
                change={(e: any) => setSearch(e.target.value)}
                search={true}
                p={tt("F.I.Sh., login yoki PINFL", "ФИО, логин или ПИНФЛ")}
                className="h-9 w-full"
              />
            </div>

            <FilterActions
              onRefresh={fetchRows}
              onClear={() => {
                setSearch("");
                resetSort();
              }}
            />

            <ToolbarSpacer />

            <UIButton size="sm" onClick={() => setEditing("new")}>
              <Plus />
              {tt("Foydalanuvchi qo'shish", "Добавить пользователя")}
            </UIButton>
          </Toolbar>
        }
      >
        {rows.length ? (
          <Table
            sort={sort}
            onSort={toggleSort}
            thead={[
              { text: "№", className: "w-[3rem] text-center" },
              { sortKey: "fio", text: tt("F.I.Sh.", "ФИО"), className: "min-w-[12.5rem]" },
              { sortKey: "type", text: tt("Roli", "Роль"), className: "w-[9rem]" },
              { sortKey: "login", text: tt("Login", "Логин"), className: "min-w-[8rem]" },
              { text: "PINFL", className: "min-w-[8.75rem]" },
              { sortKey: "last_login_at", text: tt("Oxirgi kirish", "Последний вход"), className: "w-[9rem]" },
              { text: tt("Ruxsatlar", "Права"), className: "w-[7rem] text-center" },
              { text: tt("Amallar", "Действия"), className: "w-[7.5rem] text-center" },
            ]}
          >
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="text-center tabular-nums text-muted-foreground">{i + 1}</td>
                <td className="font-medium">{r.fio}</td>
                <td title={typeHint(r.type)}>
                  <TypeBadge type={r.type} />
                </td>
                <td className="tabular-nums">{r.login}</td>
                <td className="text-muted-foreground"><SecretText value={r.pinfl} group={0} /></td>
                <td className="tabular-nums text-muted-foreground">{r.last_login_at || "—"}</td>
                <td className="text-center">
                  <button
                    type="button"
                    onClick={() => setPermFor(r)}
                    className="text-primary hover:underline tabular-nums"
                    title={tt("Ruxsatlarni sozlash", "Настроить права")}
                  >
                    {Object.keys(r.permissions ?? {}).length}{" "}
                    {tt("bo'lim", "разд.")}
                  </button>
                </td>
                <td>
                  <div className="flex items-center justify-center gap-0.5">
                    <UIButton
                      variant="ghost"
                      size="icon-xs"
                      title={tt("Ruxsatlar", "Права доступа")}
                      aria-label={tt("Ruxsatlar", "Права доступа")}
                      onClick={() => setPermFor(r)}
                    >
                      <KeyRound />
                    </UIButton>
                    <UIButton
                      variant="ghost"
                      size="icon-xs"
                      title={tt("Tahrirlash", "Редактировать")}
                      aria-label={tt("Tahrirlash", "Редактировать")}
                      onClick={() => setEditing(r)}
                    >
                      <Pencil />
                    </UIButton>
                    <UIButton
                      variant="ghost"
                      size="icon-xs"
                      title={tt("O'chirish", "Удалить")}
                      aria-label={tt("O'chirish", "Удалить")}
                      className="hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleting(r)}
                    >
                      <Trash2 />
                    </UIButton>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState
            icon={UserCog}
            title={
              loading
                ? tt("Yuklanmoqda...", "Загрузка...")
                : tt("Foydalanuvchilar yo'q", "Нет пользователей")
            }
            description={
              loading
                ? undefined
                : tt(
                    "Yurist yoki buxgalter qo'shish uchun «Foydalanuvchi qo'shish» tugmasini bosing",
                    "Нажмите «Добавить пользователя», чтобы добавить юриста или бухгалтера"
                  )
            }
          />
        )}
      </ListCard>

      <Modal
        title={
          isNew
            ? tt("Foydalanuvchi qo'shish", "Добавить пользователя")
            : tt("Foydalanuvchini tahrirlash", "Редактирование пользователя")
        }
        open={editing !== null}
        closeModal={closeForm}
        w="500px"
      >
        <form onSubmit={formik.handleSubmit} className="w-full">
          <div className="mb-4">
            <Select
              value={formik.values.type}
              data={staffTypes()}
              onChange={(value: string) => formik.setFieldValue("type", value)}
              label={tt("Roli", "Роль")}
              p={tt("Rolni tanlang", "Выберите роль")}
              error={err("type")}
              w={false}
            />
            {formik.values.type && (
              <p className="mt-1 text-[0.75rem] text-muted-foreground">
                {typeHint(formik.values.type)}
              </p>
            )}
          </div>

          <div className="mb-4 w-full">
            <Input
              n="fio"
              label={tt("F.I.Sh.", "ФИО")}
              v={formik.values.fio}
              change={formik.handleChange}
              blur={formik.handleBlur}
              error={err("fio")}
              className="w-full"
            />
          </div>

          <div className="mb-4 w-full">
            <Input
              n="login"
              label={tt("Login", "Логин")}
              v={formik.values.login}
              change={formik.handleChange}
              blur={formik.handleBlur}
              autoComplete="off"
              error={err("login")}
              className="w-full"
            />
          </div>

          <div className="mb-4 w-full">
            <Input
              n="password"
              t="password"
              label={isNew ? tt("Parol", "Пароль") : tt("Yangi parol", "Новый пароль")}
              v={formik.values.password}
              change={formik.handleChange}
              blur={formik.handleBlur}
              autoComplete="new-password"
              p={
                isNew
                  ? undefined
                  : tt("Bo'sh qoldiring — parol o'zgarmaydi", "Оставьте пустым — пароль не изменится")
              }
              error={err("password")}
              className="w-full"
            />
          </div>

          <div className="mb-4 w-full">
            <Input
              n="pinfl"
              label="PINFL"
              v={formik.values.pinfl}
              // Faqat raqam va ko'pi bilan 14 ta — ortiqchasi yozilmaydi
              change={(e: any) =>
                formik.setFieldValue("pinfl", e.target.value.replace(/\D/g, "").slice(0, 14))
              }
              blur={formik.handleBlur}
              p={tt("14 xonali PINFL ni kiriting", "Введите 14-значный ПИНФЛ")}
              inputMode="numeric"
              error={err("pinfl")}
              className="w-full"
            />
          </div>

          <div className="flex justify-end">
            <Button mode="save" type="submit" />
            <Button mode="cancel" type="button" onClick={closeForm} className="ml-2" />
          </div>
        </form>
      </Modal>

      <PermissionsModal
        staff={permFor}
        onClose={() => setPermFor(null)}
        onSaved={fetchRows}
      />

      <DeleteModal
        open={Boolean(deleting)}
        closeModal={() => setDeleting(null)}
        deletee={handleDelete}
      />
    </div>
  );
};

export default StaffPage;
