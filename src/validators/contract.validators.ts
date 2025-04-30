/** @format */

import * as Yup from "yup";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const addContractValidator = Yup.object({
	doc_num: Yup.string()
		.min(1, "Iltimos qiymatni o'zgartiring!Chunki qiymat juda kichik!")
		.max(
			10000000000000,
			"Iltimos qiymatni qisqartiring! Chunki qiymat juda katta!"
		),
	doc_date: Yup.date().required("Sana kiritilishi shart!"),
	period: Yup.date().required("Iltimos amal qilish muddatini kiriting!"),
	adress: Yup.string()
		.required("Manzilni kiritish majburiy")
		.min(2, "Manzil juda qisqa!")
		.max(10 ^ 1000, "Manzil juda uzun!"),
	start_date: Yup.date().required("Boshlanish sanasini kiritish majburiy!"),
	end_date: Yup.date().required("Tugash sanasini kiritish majburiy!"),
	end_time: Yup.string().matches(
		timeRegex,
		"Vaqtni to'g'ri formatda kiriting!"
	),
	start_time: Yup.string().matches(
		timeRegex,
		"Vaqtni to'g'ri formatda kiriting!"
	),
	discount: Yup.number().default(0).max(100, "Qiymat juda katta!"),
	organization_id: Yup.number().required("Tashkilot nomini kiriting!"),
});

