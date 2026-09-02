import DeleteModal from "@/Components/DeleteModal";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import Button from "@/Components/reusable/button";
import Table from "@/Components/reusable/table/Table";
import Select from "@/Components/Select";
import { alertt } from "@/Redux/LanguageSlice";
import useApi, { baseUri } from "@/services/api";
import { IUsers } from "@/types/user";
import { tt } from "@/utils";
import { FormikHelpers, useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { FaUser } from "react-icons/fa";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import {
  Button as UIButton,
  EmptyState,
  ListCard,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";

const BatalonUser: React.FC = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [batalons, setBatalons] = useState<{ id: number; name: string }[]>([]);
  const [userSelected, setUserSelected] = useState<IUsers>();
  const [userDeleted, setUserDeleted] = useState<IUsers>();
  const [userEdited, setUserEdited] = useState<IUsers>();
  const [add, setAdd] = useState<boolean>(false);

  const api = useApi();
  const dispatch = useDispatch();

  const fetchUsers = async () => {
    try {
      const response = await api.get<IUsers[]>("region/users");
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
        "batalon/?birgada=false"
      );
      if (response?.success && response.data) {
        setBatalons(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch batalons:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRegions();
  }, []);

  const handleDelete = async () => {
    if (userDeleted?.id) {
      const response: any = await api.remove(`region/users/${userDeleted.id}`);
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

  interface UserFormValues {
    fio: string;
    password: string;
    login: string;
    batalon_id: string | number;
    file: File | null;
  }

  const formik = useFormik({
    initialValues: {
      fio: "",
      password: "",
      login: "",
      file: null as File | null,
      batalon_id: "",
    },
    validationSchema: Yup.object({
      fio: Yup.string().required(tt("FIO kiriting", "Введите ФИО")),
      password: Yup.string()
        .min(
          3,
          tt(
            "Parol kamida 3 ta belgi bo'lishi kerak",
            "Пароль должен содержать минимум 3 символов"
          )
        )
        .required(tt("Parolni kiriting", "Введите пароль")),
      login: Yup.string().required(tt("Login kiriting", "Введите логин")),
      file: Yup.mixed().nullable(),
      batalon_id: Yup.number().required(
        tt("Hududni tanlang", "Выберите Баталон")
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("fio", values.fio);
      formData.append("password", values.password);
      formData.append("login", values.login);
      if (values.file) formData.append("file", values.file);
      formData.append("batalon_id", values.batalon_id.toString());

      try {
        const response: any = await api.post("region/users", formData, true);
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

  const formik2 = useFormik<UserFormValues>({
    initialValues: {
      fio: "",
      password: "",
      login: "",
      batalon_id: "",
      file: null as File | null,
    },
    validationSchema: Yup.object({
      fio: Yup.string().required(tt("FIO kiriting", "Введите ФИО")),
      // Tahrirlashda parol ixtiyoriy: bo'sh qoldirilsa mavjudi saqlanadi.
      password: Yup.string().min(
        3,
        tt(
          "Parol kamida 3 ta belgi bo'lishi kerak",
          "Пароль должен содержать минимум 3 символов"
        )
      ),
      login: Yup.string().required(tt("Login kiriting", "Введите логин")),
      batalon_id: Yup.number().required(
        tt("Hududni tanlang", "Выберите Баталон")
      ),
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
      formData.append("batalon_id", values.batalon_id.toString());
      if (values.file) formData.append("file", values.file);

      try {
        const response: any = await api.update(
          `region/users/${userEdited?.id}`,
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
        batalon_id: userEdited.batalon_id ?? "",
        file: null,
      });
    }
  }, [userEdited]);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        toolbar={
          <Toolbar>
            <ToolbarSpacer />
            <UIButton size="sm" onClick={() => setAdd(true)}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </UIButton>
          </Toolbar>
        }
      >
        {users.length ? (
          <Table
            thead={[
              { text: tt("Rasm", "Фото"), className: "w-[90px] text-center" },
              { text: tt("FIO", "ФИО"), className: "min-w-[220px]" },
              { text: tt("Batalon", "Батальон"), className: "min-w-[160px]" },
              { text: tt("Login", "Логин"), className: "min-w-[140px]" },
              { text: tt("Amallar", "Действия"), className: "w-[110px] text-center" },
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
                      <span className="flex size-10 items-center justify-center rounded-none bg-muted text-muted-foreground">
                        <FaUser />
                      </span>
                    )}
                  </button>
                </td>
                <td className="font-medium">{user.fio}</td>
                <td className="text-muted-foreground">{user.batalon.name}</td>
                <td className="tabular-nums">{user.login}</td>
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
          <div className="mb-4 w-full">
            <Input
              n="fio"
              label={tt("FIO", "ФИО")}
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
              n="password"
              t="password"
              label={tt("Yangi parol", "Новый пароль")}
              v={formik2.values.password}
              change={formik2.handleChange}
              blur={formik2.handleBlur}
              // Brauzer saqlangan parolni o'zi to'ldirib qo'ymasin
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
            <Select
              value={formik2.values.batalon_id}
              data={batalons}
              onChange={(value: number) =>
                formik2.setFieldValue("batalon_id", value)
              }
              label={tt("Batalon", "Баталон")}
              p={tt("Batalon tanlang", "Выберите баталон")}
              error={
                formik2.touched?.batalon_id
                  ? formik2.errors.batalon_id
                  : undefined
              }
              up={true}
              w={false}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {tt("Rasm", "Изображение")}
            </label>

            <div className="flex items-center gap-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover transition"
              >
                {tt("Fayl tanlash", "Выбрать файл")}
              </label>

              <span className="text-sm text-muted-foreground">
                {formik.values.file
                  ? formik.values.file.name
                  : tt("Fayl tanlanmagan", "Файл не выбран")}
              </span>
            </div>

            <input
              id="file-upload"
              name="file"
              type="file"
              className="hidden"
              onChange={(e) =>
                formik.setFieldValue("file", e.currentTarget.files?.[0] || null)
              }
            />

            {formik.touched.file && formik.errors.file && (
              <p className="text-destructive text-sm mt-1">{formik.errors.file}</p>
            )}
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
          <div className="mb-4 w-full">
            <Input
              n="fio"
              label={tt("FIO", "ФИО")}
              v={formik.values.fio}
              change={formik.handleChange}
              blur={formik.handleBlur}
              error={formik.touched?.fio ? formik.errors?.fio : undefined}
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

          <div className="mb-4">
            <Select
              value={formik.values.batalon_id}
              data={batalons}
              onChange={(value: number) =>
                formik.setFieldValue("batalon_id", value)
              }
              label={tt("Batalon", "Баталон")}
              p={tt("Batalon tanlang", "Выберите Баталон")}
              error={
                formik.touched?.batalon_id
                  ? formik.errors.batalon_id
                  : undefined
              }
              up={true}
              w={false}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {tt("Rasm", "Изображение")}
            </label>

            <div className="flex items-center gap-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover transition"
              >
                {tt("Fayl tanlash", "Выбрать файл")}
              </label>

              <span className="text-sm text-muted-foreground">
                {formik.values.file
                  ? formik.values.file.name
                  : tt("Fayl tanlanmagan", "Файл не выбран")}
              </span>
            </div>

            <input
              id="file-upload"
              name="file"
              type="file"
              className="hidden"
              onChange={(e) =>
                formik.setFieldValue("file", e.currentTarget.files?.[0] || null)
              }
            />

            {formik.touched.file && formik.errors.file && (
              <p className="text-destructive text-sm mt-1">{formik.errors.file}</p>
            )}
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
          className="w-[700px] mx-auto"
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

export default BatalonUser;
