import SecretText from "@/Components/SecretText";
import DeleteModal from "@/Components/DeleteModal";
import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import { sortParams, useTableSort } from "@/hooks/useTableSort";
import { useDebounce } from "use-debounce";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Button from "@/Components/reusable/button";
import Table from "@/Components/reusable/table/Table";
import Select from "@/Components/Select";
import { alertt } from "@/Redux/LanguageSlice";
import useApi, { baseUri } from "@/services/api";
import type { ExportColumn } from "@/lib/tableExport";
import { IUsers } from "@/types/user";
import { tt } from "@/utils";
import { FormikHelpers, useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import {
  Badge,
  Button as UIButton,
  EmptyState,
  ListCard,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

const userTypes = [
  { id: "admin", name: "Viloyat admin" },
  { id: "lawyer", name: "Viloyat yurist" },
  { id: "accountant", name: "Viloyat buxgalter" },
  // Viloyatsiz; faqat super-admin dashboardini ko'radi, bir nechta bo'lishi mumkin
  { id: "jstb", name: "JSTB xodimi" },
];

// JSTB xodimi viloyatga biriktirilmaydi — hudud maydoni ko'rsatilmaydi
const isJstb = (type?: string) => type === "jstb";

// PINFL — faqat raqam, ko'pi bilan 14 ta: ortiqchasi yozilmaydi ham.
// `maxLength` qo'yilmaydi: u "1234 5678 ..." kabi nusxalangan matnni
// probellar bilan birga 14 belgida kesib, raqamlarni yo'qotib qo'yardi.
const onlyPinfl = (v: string) => v.replace(/\D/g, "").slice(0, 14);

/**
 * Turi formada birinchi turadi: hudud kerakmi-yo'qligini u belgilaydi.
 * JSTB xodimi hududga biriktirilmaydi (super-admin darajasida) — hudud
 * maydoni o'rniga izoh chiqadi. Qo'shish va tahrirlash oynalari uchun umumiy.
 */
function TypeAndRegionFields({
  form,
  regions,
}: {
  form: any;
  regions: { id: number; name: string }[];
}) {
  return (
    <>
      <div className="mb-4">
        <Select
          value={form.values.type}
          data={userTypes}
          onChange={(value: string) => {
            form.setFieldValue("type", value);
            if (isJstb(value)) form.setFieldValue("region_id", "");
          }}
          label={tt("Turi", "Тип")}
          p={tt("Turni tanlang", "Выберите тип")}
          error={form.touched?.type ? form.errors.type : undefined}
          w={false}
          className="!w-full"
        />
      </div>

      {isJstb(form.values.type) ? (
        <p className="mb-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-[0.8125rem] text-muted-foreground">
          {tt(
            "JSTB xodimi hududga biriktirilmaydi — super-admin darajasida ishlaydi.",
            "Сотрудник ЖСТБ не привязан к региону — работает на уровне супер-админа."
          )}
        </p>
      ) : (
        <div className="mb-4">
          <Select
            value={form.values.region_id}
            data={regions}
            onChange={(value: number) => form.setFieldValue("region_id", value)}
            label={tt("Hudud", "Регион")}
            p={tt("Hudud tanlang", "Выберите регион")}
            error={form.touched?.region_id ? form.errors.region_id : undefined}
            w={false}
            className="!w-full"
          />
        </div>
      )}
    </>
  );
}

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<IUsers>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("F.I.Sh.", "ФИО"), value: (u) => u.fio },
  { header: tt("Viloyat", "Регион"), value: (u) => u.name || "—" },
  {
    header: tt("Turi", "Тип"),
    value: (u) =>
      u.type === "admin"
        ? tt("Viloyat admin", "Администратор")
        : u.type === "lawyer"
        ? tt("Viloyat yurist", "Юрист")
        : u.type === "accountant"
        ? tt("Viloyat buxgalter", "Бухгалтер")
        : u.type === "jstb"
        ? tt("JSTB xodimi", "Сотрудник ЖСТБ")
        : "—",
  },
  { header: tt("Login", "Логин"), value: (u) => u.login },
  { header: "PINFL", value: (u) => u.pinfl || "—", align: "center" },
];

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
  const [userSelected, setUserSelected] = useState<IUsers>();
  const [userDeleted, setUserDeleted] = useState<IUsers>();
  const [userEdited, setUserEdited] = useState<IUsers>();
  const [add, setAdd] = useState<boolean>(false);

  const api = useApi();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [searchText] = useDebounce(search.trim(), 500);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  const clearFilters = () => {
    setSearch("");
    resetSort();
  };

  // Ro'yxat sahifalanmaydi, lekin qidiruv va saralash backendda
  const fetchUsers = async () => {
    try {
      const response = await api.get<IUsers[]>(
        "admin/user?" +
          (searchText ? `search=${encodeURIComponent(searchText)}` : "") +
          sortParams(sort)
      );
      if (response?.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await api.get<{ id: number; name: string }[]>(
        "admin/regions"
      );
      if (response?.success && response.data) {
        setRegions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch regions:", error);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchText, sort]);

  const handleDelete = async () => {
    if (userDeleted?.id) {
      const response: any = await api.remove(`admin/user/${userDeleted.id}`);
      if (response?.success) {
        fetchUsers();
      }
      dispatch(
        alertt({
          text: response?.success
            ? tt("Muvaffaqiyatli o'chirildi", "Успешно удалено")
            : response?.error || response?.message || tt("Xatolik", "Ошибка"),
          success: response?.success,
        })
      );
      setUserDeleted(undefined);
    }
  };

  const formik = useFormik({
    initialValues: {
      fio: "",
      password: "",
      login: "",
      pinfl: "",
      file: null as File | null,
      region_id: "",
      type: "",
    },
    validationSchema: Yup.object({
      fio: Yup.string().required(tt("F.I.Sh. kiriting", "Введите ФИО")),
      pinfl: Yup.string().matches(/^\d{14}$/, {
        message: tt(
          "PINFL 14 ta raqamdan iborat bo'lishi kerak",
          "ПИНФЛ должен состоять из 14 цифр"
        ),
        excludeEmptyString: true,
      }),
      password: Yup.string()
        .min(
          8,
          tt(
            "Parol kamida 8 ta belgi bo'lishi kerak",
            "Пароль должен содержать минимум 8 символов"
          )
        )
        .required(tt("Parolni kiriting", "Введите пароль")),
      login: Yup.string().required(tt("Login kiriting", "Введите логин")),
      file: Yup.mixed().nullable(),
      region_id: Yup.number().when("type", ([type], schema) =>
        isJstb(type)
          ? schema.notRequired()
          : schema.required(tt("Hududni tanlang", "Выберите регион"))
      ),
      type: Yup.string()
        .oneOf(["admin", "lawyer", "accountant", "jstb"])
        .required(tt("Turni tanlang", "Выберите тип")),
    }),
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("fio", values.fio);
      formData.append("password", values.password);
      formData.append("login", values.login);
      formData.append("pinfl", values.pinfl);
      if (values.file) formData.append("file", values.file);
      if (!isJstb(values.type))
        formData.append("region_id", String(values.region_id ?? ""));
      formData.append("type", values.type);

      try {
        const response: any = await api.post("admin/user", formData, true);
        if (response?.success) {
          dispatch(
            alertt({
              text: tt(
                "Foydalanuvchi muvaffaqiyatli qo'shildi",
                "Пользователь успешно добавлен"
              ),
              success: true,
            })
          );
          setAdd(false);
          fetchUsers();
          resetForm({ values: formik.initialValues });
        } else {
          dispatch(
            alertt({
              text:
                response?.error ||
                response?.message ||
                tt("Xatolik yuz berdi", "Произошла ошибка"),
              success: false,
            })
          );
        }
      } catch (error) {
        console.error("Failed to create user:", error);
      }
    },
  });

  interface UserFormValues {
    fio: string;
    password: string;
    login: string;
    pinfl: string;
    region_id: string | number;
    type: string;
    file: File | null;
  }

  const formik2 = useFormik<UserFormValues>({
    initialValues: {
      fio: "",
      password: "",
      login: "",
      pinfl: "",
      region_id: "",
      type: "",
      file: null as File | null,
    },
    validationSchema: Yup.object({
      fio: Yup.string().required(tt("F.I.Sh. kiriting", "Введите ФИО")),
      pinfl: Yup.string().matches(/^\d{14}$/, {
        message: tt(
          "PINFL 14 ta raqamdan iborat bo'lishi kerak",
          "ПИНФЛ должен состоять из 14 цифр"
        ),
        excludeEmptyString: true,
      }),
      // Tahrirlashda parol ixtiyoriy: bo'sh qoldirilsa mavjudi saqlanadi.
      password: Yup.string().min(
        8,
        tt(
          "Parol kamida 8 ta belgi bo'lishi kerak",
          "Пароль должен содержать минимум 8 символов"
        )
      ),
      login: Yup.string().required(tt("Login kiriting", "Введите логин")),
      region_id: Yup.number().when("type", ([type], schema) =>
        isJstb(type)
          ? schema.notRequired()
          : schema.required(tt("Hududni tanlang", "Выберите регион"))
      ),
      type: Yup.string()
        .oneOf(["admin", "lawyer", "accountant", "jstb"])
        .required(tt("Turni tanlang", "Выберите тип")),
    }),
    onSubmit: async (
      values: UserFormValues,
      { resetForm }: FormikHelpers<UserFormValues>
    ) => {
      const formData = new FormData();
      formData.append("fio", values.fio);
      // Bo'sh parol yuborilmaydi — backend uni "o'zgarmasin" deb tushunadi
      if (values.password) formData.append("password", values.password);
      formData.append("login", values.login);
      formData.append("pinfl", values.pinfl);
      if (!isJstb(values.type))
        formData.append("region_id", String(values.region_id ?? ""));
      formData.append("type", values.type);
      if (values.file) formData.append("file", values.file);

      try {
        const response: any = await api.update(
          `admin/user/${userEdited?.id}`,
          formData,
          true
        );
        if (response?.success) {
          dispatch(
            alertt({
              text: tt(
                "Foydalanuvchi muvaffaqiyatli o'zgartirildi",
                "Пользователь успешно изменен"
              ),
              success: true,
            })
          );
          setUserEdited(undefined);
          fetchUsers();
          resetForm();
        } else {
          dispatch(
            alertt({
              text:
                response?.error ||
                response?.message ||
                tt("Xatolik yuz berdi", "Произошла ошибка"),
              success: false,
            })
          );
        }
      } catch (error) {
        console.error("Failed to update user:", error);
      }
    },
  });

  useEffect(() => {
    if (userEdited) {
      formik2.setValues({
        fio: userEdited.fio ?? "",
        password: "",
        login: userEdited.login ?? "",
        pinfl: userEdited.pinfl ?? "",
        region_id: userEdited.region_id ?? "",
        type: userEdited.type ?? "",
        file: null,
      });
    }
  }, [userEdited]);

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
                p={tt(
                  "F.I.Sh., login, PINFL yoki viloyat",
                  "ФИО, логин, ПИНФЛ или регион"
                )}
                className="h-9 w-full"
              />
            </div>

            <FilterActions onRefresh={fetchUsers} onClear={clearFilters} />

            <ToolbarSpacer />
            {/* Ro'yxat sahifalanmaydi — yuklangan qatorlar to'liq */}
            <ExportButtons
              title={tt("Foydalanuvchilar", "Пользователи")}
              columns={exportColumns()}
              fetchRows={async () => users}
            />
            <UIButton size="sm" onClick={() => setAdd(true)}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
      >
        {users.length ? (
          <Table
            sort={sort}
            onSort={toggleSort}
            thead={[
              { text: tt("Rasm", "Фото"), className: "w-[5.625rem] text-center" },
              { sortKey: "fio", text: tt("F.I.Sh.", "ФИО"), className: "min-w-[12.5rem]" },
              { sortKey: "name", text: tt("Viloyat", "Регион"), className: "min-w-[9.375rem]" },
              { sortKey: "type", text: tt("Turi", "Тип"), className: "w-[9.375rem]" },
              { sortKey: "login", text: tt("Login", "Логин"), className: "min-w-[8.125rem]" },
              { text: "PINFL", className: "min-w-[8.75rem]" },
              { text: tt("Amallar", "Действия"), className: "w-[6.875rem] text-center" },
            ]}
          >
            {users.map((user) => (
              <tr key={user.id}>
                <td className="text-center">
                  <button
                    type="button"
                    disabled={!user.image}
                    onClick={() => user.image && setUserSelected(user)}
                    className="mx-auto block disabled:cursor-default"
                  >
                    {user.image ? (
                      <img
                        src={baseUri + user.image}
                        alt={user.fio}
                        className="size-10 rounded-none object-cover ring-1 ring-border"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-none bg-primary/10 text-[0.9375rem] font-semibold text-primary">
                        {user.fio?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </button>
                </td>
                <td className="font-medium">{user.fio}</td>
                <td className="text-muted-foreground">{user.name || "—"}</td>
                <td>
                  {user.type === "admin" ? (
                    <Badge tone="primary">
                      {tt("Viloyat admin", "Администратор")}
                    </Badge>
                  ) : user.type === "lawyer" ? (
                    <Badge tone="brand">{tt("Viloyat yurist", "Юрист")}</Badge>
                  ) : user.type === "accountant" ? (
                    <Badge tone="neutral">{tt("Viloyat buxgalter", "Бухгалтер")}</Badge>
                  ) : user.type === "jstb" ? (
                    <Badge tone="success">{tt("JSTB xodimi", "Сотрудник ЖСТБ")}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="tabular-nums">{user.login}</td>
                <td className="tabular-nums text-muted-foreground">
                  <SecretText value={user.pinfl} group={0} />
                </td>
                <td>
                  <div className="flex items-center justify-center gap-0.5">
                    <UIButton
                      variant="ghost"
                      size="icon-xs"
                      title={tt("Tahrirlash", "Редактировать")}
                      aria-label={tt("Tahrirlash", "Редактировать")}
                      onClick={() => setUserEdited(user)}
                    >
                      <Pencil />
                    </UIButton>
                    <UIButton
                      variant="ghost"
                      size="icon-xs"
                      title={tt("O'chirish", "Удалить")}
                      aria-label={tt("O'chirish", "Удалить")}
                      className="hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setUserDeleted(user)}
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
            icon={Users}
            title={tt("Foydalanuvchi yo'q", "Нет пользователей")}
          />
        )}
      </ListCard>

      <Modal
        title={tt("Foydalanuvchi tahrirlash", "Редактирование пользователя")}
        open={Boolean(userEdited)}
        closeModal={() => {
          formik2.resetForm({ values: formik2.initialValues });
          setUserEdited(undefined);
        }}
        w="500px"
      >
        <form onSubmit={formik2.handleSubmit} className="w-full">
          <TypeAndRegionFields form={formik2} regions={regions} />

          <div className="mb-4 w-full">
            <Input
              n="fio"
              label={tt("F.I.Sh.", "ФИО")}
              v={formik2.values.fio}
              change={formik2.handleChange}
              blur={formik2.handleBlur}
              error={formik2.touched?.fio ? formik2.errors?.fio : undefined}
              className="w-full"
            />
          </div>

          <div className="mb-4 w-full">
            <Input
              n="login"
              label={tt("Login", "Логин")}
              v={formik2.values.login}
              change={formik2.handleChange}
              blur={formik2.handleBlur}
              error={formik2.touched?.login ? formik2.errors?.login : undefined}
              className="w-full"
            />
          </div>
          <div className="mb-4 w-full">
            <Input
              n="pinfl"
              label={tt("PINFL", "ПИНФЛ")}
              v={formik2.values.pinfl}
              change={(e: any) =>
                formik2.setFieldValue("pinfl", onlyPinfl(e.target.value))
              }
              blur={formik2.handleBlur}
              p={tt("14 xonali PINFL ni kiriting", "Введите 14-значный ПИНФЛ")}
              inputMode="numeric"
              error={formik2.touched?.pinfl ? formik2.errors?.pinfl : undefined}
              className="w-full"
            />
          </div>
          <div className="mb-4 w-full">
            <Input
              n="password"
              t="password"
              label={tt("Yangi parol", "Новый пароль")}
              v={formik2.values.password}
              change={formik2.handleChange}
              blur={formik2.handleBlur}
              // Brauzer saqlangan parolni o'zi to'ldirib qo'ymasin —
              // maydon bo'sh ko'rinishi kerak.
              autoComplete="new-password"
              p={tt(
                "Bo'sh qoldiring — parol o'zgarmaydi",
                "Оставьте пустым — пароль не изменится"
              )}
              error={
                formik2.touched?.password ? formik2.errors?.password : undefined
              }
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-muted-foreground mb-1">{tt("Rasm", "Изображение")} <span className="text-[var(--dash-text-muted,#94a3b8)] text-xs">({tt("ixtiyoriy", "необязательно")})</span></label>
            <label className="flex items-center gap-3 border border-border rounded-lg px-4 py-2.5 cursor-pointer hover:border-primary/30 transition">
              <svg className="w-5 h-5 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-foreground truncate">
                {formik2.values.file ? formik2.values.file.name : tt("Rasm tanlang", "Выберите изображение")}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  formik2.setFieldValue("file", e.currentTarget.files?.[0] || null)
                }
              />
            </label>
          </div>

          <div className="flex justify-end">
            <Button mode="save" type="submit" />
            <Button
              mode="cancel"
              type="button"
              onClick={() => {
                formik2.resetForm({ values: formik2.initialValues });
                setUserEdited(undefined);
              }}
              className="ml-2"
            />
          </div>
        </form>
      </Modal>

      <Modal
        title={tt("Foydalanuvchi qo'shish", "Добавить пользователя")}
        open={add}
        closeModal={() => {
          formik.resetForm({ values: formik.initialValues });
          setAdd(false);
        }}
        w="500px"
      >
        <form onSubmit={formik.handleSubmit} className="w-full">
          <TypeAndRegionFields form={formik} regions={regions} />

          <div className="mb-4 w-full">
            <Input
              n="fio"
              label={tt("F.I.Sh.", "ФИО")}
              v={formik.values.fio}
              change={formik.handleChange}
              blur={formik.handleBlur}
              error={formik.touched?.fio ? formik.errors?.fio : undefined}
              className="w-full"
            />
          </div>
          <div className="mb-4 w-full">
            <Input
              n="password"
              t="password"
              label={tt("Parol", "Пароль")}
              v={formik.values.password}
              change={formik.handleChange}
              blur={formik.handleBlur}
              autoComplete="new-password"
              error={
                formik.touched?.password ? formik.errors?.password : undefined
              }
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
              error={formik.touched?.login ? formik.errors?.login : undefined}
              className="w-full"
            />
          </div>

          <div className="mb-4 w-full">
            <Input
              n="pinfl"
              label={tt("PINFL", "ПИНФЛ")}
              v={formik.values.pinfl}
              change={(e: any) =>
                formik.setFieldValue("pinfl", onlyPinfl(e.target.value))
              }
              blur={formik.handleBlur}
              p={tt("14 xonali PINFL ni kiriting", "Введите 14-значный ПИНФЛ")}
              inputMode="numeric"
              error={formik.touched?.pinfl ? formik.errors?.pinfl : undefined}
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-muted-foreground mb-1">{tt("Rasm", "Изображение")} <span className="text-[var(--dash-text-muted,#94a3b8)] text-xs">({tt("ixtiyoriy", "необязательно")})</span></label>
            <label className="flex items-center gap-3 border border-border rounded-lg px-4 py-2.5 cursor-pointer hover:border-primary/30 transition">
              <svg className="w-5 h-5 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-foreground truncate">
                {formik.values.file ? formik.values.file.name : tt("Rasm tanlang", "Выберите изображение")}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  formik.setFieldValue("file", e.currentTarget.files?.[0] || null)
                }
              />
            </label>
          </div>

          <div className="flex justify-end">
            <Button mode="save" type="submit" />
            <Button
              mode="cancel"
              type="button"
              onClick={() => {
                formik.resetForm({ values: formik.initialValues });
                setAdd(false);
              }}
              className="ml-2"
            />
          </div>
        </form>
      </Modal>

      <Modal
        title={userSelected?.fio}
        open={Boolean(userSelected)}
        closeModal={() => setUserSelected(undefined)}
        w={800}
      >
        <img
          src={baseUri + userSelected?.image}
          className="w-[43.75rem] mx-auto"
        />
      </Modal>

      <DeleteModal
        open={Boolean(userDeleted)}
        closeModal={() => setUserDeleted(undefined)}
        deletee={handleDelete}
      />
    </div>
  );
};

export default UserTable;
