import BackButton from "@/Components/reusable/BackButton";
import Button from "@/Components/reusable/button";
import { alertt } from "@/Redux/LanguageSlice";
import useApi from "@/services/api";
import { tt } from "@/utils";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

const EditTemplate: React.FC = () => {
  const api = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      shablon_name: "",
      title: "",
      main_section: "",
      section_1_title: "",
      section_1: "",
      section_2_title: "",
      section_2: "",
      section_3_title: "",
      section_3: "",
      section_4_title: "",
      section_4: "",
      section_5_title: "",
      section_5: "",
      section_6_title: "",
      section_6: "",
      section_7_title: "",
      section_7: "",
    },
    validationSchema: Yup.object({
      shablon_name: Yup.mixed().required(
        tt(`Shablon nomi kiritilishi shart`, `Требуется название шаблона`)
      ),
      title: Yup.mixed().required(
        tt(`Sarlavha kiritilishi shart`, `Требуется заголовок`)
      ),
      main_section: Yup.mixed().required(
        tt(`Asosiy bo'lim kiritilishi shart`, `Требуется основной раздел`)
      ),
      section_1_title: Yup.mixed().required(
        tt(
          `1-bo'lim sarlavhasi kiritilishi shart`,
          `Требуется название раздела 1`
        )
      ),
      section_1: Yup.mixed().required(
        tt(
          `1-bo'lim mazmuni kiritilishi shart`,
          `Требуется содержание раздела 1`
        )
      ),
      section_2_title: Yup.mixed().required(
        tt(
          `2-bo'lim sarlavhasi kiritilishi shart`,
          `Требуется название раздела 2`
        )
      ),
      section_2: Yup.mixed().required(
        tt(
          `2-bo'lim mazmuni kiritilishi shart`,
          `Требуется содержание раздела 2`
        )
      ),
      section_3_title: Yup.mixed().required(
        tt(
          `3-bo'lim sarlavhasi kiritilishi shart`,
          `Требуется название раздела 3`
        )
      ),
      section_3: Yup.mixed().required(
        tt(
          `3-bo'lim mazmuni kiritilishi shart`,
          `Требуется содержание раздела 3`
        )
      ),
      section_4_title: Yup.mixed().required(
        tt(
          `4-bo'lim sarlavhasi kiritilishi shart`,
          `Требуется название раздела 4`
        )
      ),
      section_4: Yup.mixed().required(
        tt(
          `4-bo'lim mazmuni kiritilishi shart`,
          `Требуется содержание раздела 4`
        )
      ),
      section_5_title: Yup.mixed().required(
        tt(
          `5-bo'lim sarlavhasi kiritilishi shart`,
          `Требуется название раздела 5`
        )
      ),
      section_5: Yup.mixed().required(
        tt(
          `5-bo'lim mazmuni kiritilishi shart`,
          `Требуется содержание раздела 5`
        )
      ),
      section_6_title: Yup.mixed().required(
        tt(
          `6-bo'lim sarlavhasi kiritilishi shart`,
          `Требуется название раздела 6`
        )
      ),
      section_6: Yup.mixed().required(
        tt(
          `6-bo'lim mazmuni kiritilishi shart`,
          `Требуется содержание раздела 6`
        )
      ),
      section_7_title: Yup.mixed().required(
        tt(
          `7-bo'lim sarlavhasi kiritilishi shart`,
          `Требуется название раздела 7`
        )
      ),
      section_7: Yup.mixed().required(
        tt(
          `7-bo'lim mazmuni kiritilishi shart`,
          `Требуется содержание раздела 7`
        )
      ),
    }),
    onSubmit: async (values) => {
      try {
        const response: any = await api.update(
          `template/${id}?edit=true`,
          values
        );
        if (response?.success) {
          dispatch(
            alertt({
              text: tt(
                `Shablon muvaffaqiyatli tahrirlandi!`,
                `Шаблон успешно отредактирован!`
              ),
              success: true,
            })
          );
          navigate("/spravichnik/template/");
        } else {
          dispatch(
            alertt({
              text:
                response?.error ??
                tt(
                  `Shablonni tahrirlashda xatolik yuz berdi`,
                  `Ошибка при редактировании шаблона`
                ),
              success: false,
            })
          );
        }
      } catch (error) {
        dispatch(
          alertt({
            text: tt(`Formani yuborishda xatolik`, `Ошибка при отправке формы`),
            success: false,
          })
        );
      }
    },
  });

  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        const response: any = await api.get(`template/${id}`);
        if (response?.success) {
          delete response.data.isdeleted;
          delete response.data.updated_at;
          delete response.data.created_at;
          delete response.data.user_id;
          delete response.data.id;
          const test = {
            ...response.data,
            section_1: response.data.section_1?.join("\n"),
            section_2: response.data.section_2?.join("\n"),
            section_3: response.data.section_3?.join("\n"),
            section_4: response.data.section_4?.join("\n"),
            section_5: response.data.section_5?.join("\n"),
            section_6: response.data.section_6?.join("\n"),
            section_7: response.data.section_7?.join("\n"),
          };

          formik.setValues(test);
        } else {
          dispatch(
            alertt({
              text:
                response?.error ??
                tt(
                  `Shablon ma'lumotlarini olishda xatolik yuz berdi`,
                  `Ошибка при получении данных шаблона`
                ),
              success: false,
            })
          );
          navigate(-1);
        }
      } catch (error) {
        dispatch(
          alertt({
            text: tt(
              `Ma'lumotlarni yuklashda xatolik`,
              `Ошибка при загрузке данных`
            ),
            success: false,
          })
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTemplateData();
    }
  }, [id]);

  if (loading) {
    return <div>{tt(`Yuklanmoqda...`, `Загрузка...`)}</div>;
  }

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="py-6 bg-mybackground space-y-4"
    >
      <div className="relative flex justify-center items-center mb-7">
        <div className="absolute left-0">
          <BackButton />
        </div>
        <h1 className="text-xl font-bold">
          {tt(`Shablonni tahrirlash`, `Редактировать шаблон`)}
        </h1>
      </div>

      <div>
        <label htmlFor="shablon_name" className="block font-medium mb-1">
          {tt(`Shablon nomi`, `Название шаблона`)}
        </label>
        <input
          id="shablon_name"
          name="shablon_name"
          type="text"
          className={`w-full border bg-mybackground rounded p-2 ${
            formik.touched.shablon_name && formik.errors.shablon_name
              ? "border-red-500"
              : "border-gray-300"
          }`}
          value={formik.values.shablon_name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.shablon_name && formik.errors.shablon_name && (
          <div className="text-red-500 text-sm">
            {formik.errors.shablon_name}
          </div>
        )}
      </div>

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block font-medium mb-1">
          {tt(`Sarlavha`, `Заголовок`)}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className={`w-full border bg-mybackground rounded p-2 ${
            formik.touched.title && formik.errors.title
              ? "border-red-500"
              : "border-gray-300"
          }`}
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.title && formik.errors.title && (
          <div className="text-red-500 text-sm">{formik.errors.title}</div>
        )}
      </div>

      {/* Main Section */}
      <div>
        <label htmlFor="main_section" className="block font-medium mb-1">
          {tt(`Asosiy bo'lim`, `Основной раздел`)}
        </label>
        <textarea
          id="main_section"
          name="main_section"
          rows={3}
          className={`w-full border bg-mybackground rounded p-2 ${
            formik.touched.main_section && formik.errors.main_section
              ? "border-red-500"
              : "border-gray-300"
          }`}
          value={formik.values.main_section}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.main_section && formik.errors.main_section && (
          <div className="text-red-500 text-sm">
            {formik.errors.main_section}
          </div>
        )}
      </div>

      {/* Dynamic Sections */}
      {Array.from({ length: 7 }, (_, i) => i + 1).map((sectionNumber) => (
        <div key={sectionNumber} className="flex gap-x-5">
          {/* Section Title */}
          <div className="w-1/2">
            <label
              htmlFor={`section_${sectionNumber}_title`}
              className="block font-medium mb-1"
            >
              {tt(
                `${sectionNumber}-bo'lim sarlavhasi`,
                `Заголовок раздела ${sectionNumber}`
              )}
            </label>
            <input
              id={`section_${sectionNumber}_title`}
              name={`section_${sectionNumber}_title`}
              type="text"
              className={`w-full bg-mybackground border rounded p-2 ${
                formik.touched[
                  `section_${sectionNumber}_title` as keyof typeof formik.values
                ] &&
                formik.errors[
                  `section_${sectionNumber}_title` as keyof typeof formik.values
                ]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={
                formik.values[
                  `section_${sectionNumber}_title` as keyof typeof formik.values
                ]
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched[
              `section_${sectionNumber}_title` as keyof typeof formik.values
            ] &&
              formik.errors[
                `section_${sectionNumber}_title` as keyof typeof formik.values
              ] && (
                <div className="text-red-500 text-sm">
                  {
                    formik.errors[
                      `section_${sectionNumber}_title` as keyof typeof formik.values
                    ]
                  }
                </div>
              )}
          </div>

          {/* Section Content */}
          <div className="w-1/2">
            <label
              htmlFor={`section_${sectionNumber}`}
              className="block font-medium mb-1"
            >
              {tt(`${sectionNumber}-bo'lim`, `Раздел ${sectionNumber}`)}
            </label>
            <textarea
              id={`section_${sectionNumber}`}
              name={`section_${sectionNumber}`}
              rows={3}
              className={`w-full bg-mybackground border rounded p-2 ${
                formik.touched[
                  `section_${sectionNumber}` as keyof typeof formik.values
                ] &&
                formik.errors[
                  `section_${sectionNumber}` as keyof typeof formik.values
                ]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={
                formik.values[
                  `section_${sectionNumber}` as keyof typeof formik.values
                ]
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched[
              `section_${sectionNumber}` as keyof typeof formik.values
            ] &&
              formik.errors[
                `section_${sectionNumber}` as keyof typeof formik.values
              ] && (
                <div className="text-red-500 text-sm">
                  {
                    formik.errors[
                      `section_${sectionNumber}` as keyof typeof formik.values
                    ]
                  }
                </div>
              )}
          </div>
        </div>
      ))}

      <div>
        <Button mode="edit" type="submit" />
      </div>
    </form>
  );
};

export default EditTemplate;
