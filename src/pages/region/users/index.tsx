import Icon from "@/assets/icons";
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

const BatalonUser: React.FC = () => {
    const [users, setUsers] = useState<IUsers[]>([]);
    const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
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
        fetchUsers();
        fetchRegions();
    }, []);

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
            file: Yup.mixed()
                .nullable()
                .required(tt("Rasm tanlang", "Выберите изображение")),
            batalon_id: Yup.number().required(
                tt("Hududni tanlang", "Выберите регион")
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
        batalon_id: string | number;
        file: File | null;
    }

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
            batalon_id: Yup.number().required(
                tt("Hududni tanlang", "Выберите регион")
            ),
        }),
        onSubmit: async (
            values: UserFormValues,
            { resetForm }: FormikHelpers<UserFormValues>
        ) => {
            const formData = new FormData();
            formData.append("fio", values.fio);
            formData.append("password", values.password);
            formData.append("login", values.login);
            formData.append("batalon_id", values.batalon_id.toString());
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
                batalon_id: userEdited.batalon_id ?? "",
                file: null,
            });
        }
    }, [userEdited]);

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <Button mode="add" onClick={() => setAdd(true)} />
            </div>
            <Table
                thead={[
                    { text: tt("Rasm", "Фото"), className: "w-[100px]" },
                    { text: tt("FIO", "ФИО"), className: "text-left" },
                    { text: tt("Batalon", "Баталон"), className: "text-left" },
                    { text: tt("Login", "Логин"), className: "text-left" },
                    { text: tt("Amallar", "Действия"), className: "w-[150px]" },
                ]}
            >
                {users.map((user) => (
                    <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-mytableheadborder text-mytextcolor border border-mytableheadborder"
                    >
                        <td
                            className={`border-b border-l border-r  ${user.image ? "py-1" : "py-3"
                                } px-3 text-center`}
                            style={{
                                cursor: user.image ? "pointer" : "not-allowed",
                            }}
                            onClick={() => {
                                if (user.image) {
                                    setUserSelected(user);
                                }
                            }}
                        >
                            {user.image ? (
                                <img
                                    src={baseUri + user.image}
                                    alt={user.fio}
                                    className="w-12 h-12 rounded-full mx-auto"
                                />
                            ) : (
                                <span className="opacity-[0.7]">
                                    {tt("Rasm topilmadi", "Нет изображения")}
                                </span>
                            )}
                        </td>
                        <td
                            className={`border-b border-l border-r  ${user.image ? "py-1" : "py-3"
                                } px-3 font-[600] text-md`}
                        >
                            {user.fio}
                        </td>
                        <td
                            className={`border-b border-l border-r  ${user.image ? "py-1" : "py-3"
                                } px-3 font-[600] text-md`}
                        >
                            {user.batalon.name}
                        </td>
                        <td
                            className={`border-b border-l border-r  ${user.image ? "py-1" : "py-3"
                                } px-3 font-[600] text-md`}
                        >
                            {user.login}
                        </td>
                        <td
                            className={`border-b border-l border-r  ${user.image ? "py-1" : "py-3"
                                } px-3 font-[600] text-md text-center`}
                        >
                            <div className="flex justify-center">
                                <button
                                    className="text-blue-500 hover:underline mr-4"
                                    onClick={() => setUserEdited(user)}
                                >
                                    <Icon name="edit" />
                                </button>
                                <button
                                    className="text-red-500 hover:underline"
                                    onClick={() => setUserDeleted(user)}
                                >
                                    <Icon name="delete" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

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
                            label={tt("Parol", "Пароль")}
                            v={formik2.values.password}
                            change={formik2.handleChange}
                            blur={formik2.handleBlur}
                            error={
                                formik2.touched?.password ? formik2.errors?.password : undefined
                            }
                            className="w-full"
                        />
                    </div>

                    <div className="mb-4">
                        <Select
                            value={formik2.values.batalon_id}
                            data={regions}
                            onChange={(value: number) =>
                                formik2.setFieldValue("batalon_id", value)
                            }
                            label={tt("Hudud", "Регион")}
                            p={tt("Hudud tanlang", "Выберите регион")}
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
                        <label className="me-2">{tt("Rasm", "Изображение")}</label>
                        <input
                            type="file"
                            onChange={(e) =>
                                formik2.setFieldValue(
                                    "file",
                                    e.currentTarget.files?.[0] || null
                                )
                            }
                        />
                        <p className="text-red-500 text-sm">
                            {formik2.touched?.file ? formik2.errors?.file : undefined}
                        </p>
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
                            n="password"
                            t="password"
                            label={tt("Parol", "Пароль")}
                            v={formik.values.password}
                            change={formik.handleChange}
                            blur={formik.handleBlur}
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

                    <div className="mb-4">
                        <Select
                            value={formik.values.batalon_id}
                            data={regions}
                            onChange={(value: number) =>
                                formik.setFieldValue("batalon_id", value)
                            }
                            label={tt("Hudud", "Регион")}
                            p={tt("Hudud tanlang", "Выберите регион")}
                            error={
                                formik.touched?.batalon_id ? formik.errors.batalon_id : undefined
                            }
                            up={true}
                            w={false}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="me-2">{tt("Rasm", "Изображение")}</label>
                        <input
                            type="file"
                            onChange={(e) =>
                                formik.setFieldValue("file", e.currentTarget.files?.[0] || null)
                            }
                        />
                        <p className="text-red-500 text-sm">
                            {formik.touched?.file ? formik.errors?.file : undefined}
                        </p>
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
