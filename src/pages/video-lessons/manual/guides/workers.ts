import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("workers");

/** "Hodimlar ro'yhati" */
export const workers: SectionGuide = {
  intro: [
    "Batalonlaringizdagi xodimlar ro'yxati. Xodimlar shartnoma topshiriqlariga biriktiriladi va ishlagan soatlari uchun pul hisob-kitobi qilinadi. Shartnoma tuzish uchun xodim kiritish shart emas.",
    "Список сотрудников ваших батальонов. Сотрудников закрепляют за заданиями договоров и рассчитывают оплату за отработанные часы. Для создания договора вносить сотрудников не обязательно.",
  ],
  steps: [
    {
      title: ["Xodim qo'shish", "Добавление сотрудника"],
      body: [
        "«Qo'shish» tugmasini bosing — «Xodim qo'shish» oynasi ochiladi. Maydonlarni to'ldiring va «Saqlash» ni bosing.",
        "Нажмите «Добавить» — откроется окно добавления сотрудника. Заполните поля и нажмите «Сохранить».",
      ],
      items: [
        [
          "«Familiya, ism, otasining ismi» — majburiy.",
          "«Фамилия, имя, отчество» — обязательно.",
        ],
        [
          "«Karta raqam» va «Hisob raqam» — pul o'tkaziladigan raqamlar.",
          "«Номер карты» и «Номер счёта» — куда перечисляются деньги.",
        ],
        ["«PINFL (JSHSHIR)» — 14 ta raqam.", "«ПИНФЛ» — 14 цифр."],
        ["«Batalon nomi» — majburiy.", "«Название батальона» — обязательно."],
        [
          "«Muddatli harbiy xizmatchi» — muddatli xizmatdagi askar bo'lsa belgilang.",
          "«Срочнослужащий» — отметьте, если это военнослужащий срочной службы.",
        ],
      ],
      warn: [
        "«Batalon nomi» ro'yxati bo'sh bo'lsa, «Quyi tuzilmalar» bo'limida «Batalon» turidagi tuzilma qo'shing. Hamkor tashkilotlar bu ro'yxatda chiqmaydi.",
        "Если список батальонов пуст, добавьте в разделе «Подразделения» подразделение типа «Батальон». Партнёрские организации в этом списке не показываются.",
      ],
      tip: [
        "«Muddatli harbiy xizmatchi» belgilangan xodimga «Hodimlarning pul hisob-kitobi» da pul hisoblanmaydi.",
        "Сотруднику с отметкой «Срочнослужащий» в «Расчётах с сотрудниками» выплата не начисляется.",
      ],
      shots: [shot("01-qoshish.webp", ["«Xodim qo'shish» oynasi", "Окно добавления сотрудника"])],
    },
    {
      title: ["Xodimni qidirish", "Поиск сотрудника"],
      body: [
        "Qidiruv maydoniga («F.I.Sh., PINFL yoki raqam bo'yicha») F.I.Sh. ning bir qismini yozing. Bitta batalon xodimlarini ko'rish uchun yonidagi batalon filtridan (odatda «Hammasi» turadi) batalonni tanlang.",
        "Введите в поиск часть Ф.И.О. Чтобы посмотреть сотрудников батальона, выберите его в фильтре по батальону.",
      ],
      warn: [
        "Karta raqami, hisob raqami yoki PINFL bo'yicha qidirganda raqamni TO'LIQ yozing — bu raqamlar shifrlangan, qisman qidiruv ishlamaydi.",
        "При поиске по номеру карты, счёта или ПИНФЛ вводите номер ПОЛНОСТЬЮ — эти номера зашифрованы, частичный поиск не работает.",
      ],
      tip: [
        "Jadvalda raqamlar yashirilgan holda ko'rinadi. Hali birorta xodim qo'shilmagan bo'lsa ham «Qidiruv shartlariga mos xodim topilmadi» yozuvi chiqadi.",
        "В таблице номера показываются скрытыми. Надпись «сотрудники не найдены» появляется и тогда, когда сотрудников ещё нет.",
      ],
      shots: [shot("02-royxat.webp", ["Xodimlar ro'yxati va qidiruv", "Список сотрудников и поиск"])],
    },
    {
      title: ["Tahrirlash va o'chirish", "Изменение и удаление"],
      body: [
        "Qator oxiridagi qalam tugmasi «Xodim tahrirlash» oynasini ochadi, savat tugmasi esa xodimni o'chiradi (tasdiqlash so'raladi).",
        "Карандаш в конце строки открывает окно изменения сотрудника, корзина — удаляет его (с подтверждением).",
      ],
      warn: [
        "Bir batalonda bir xil F.I.Sh. ikki marta kiritilmaydi («Ushbu F.I.Sh. avval kiritilgan!»), karta yoki hisob raqam ham takrorlanmaydi («Ushbu hisob raqami avval kiritilgan!»).",
        "В одном батальоне нельзя дважды внести одинаковое Ф.И.О., а номер карты или счёта не может повторяться.",
      ],
      shots: [shot("03-tahrirlash.webp", ["«Xodim tahrirlash» oynasi", "Окно изменения сотрудника"])],
    },
    {
      title: ["Ro'yxatni yuklab olish", "Выгрузка списка"],
      body: [
        "«⋮» tugmasini bosing va «Xodimlar ro'yxati — Excel» yoki «Xodimlar ro'yxati — PDF» ni tanlang. «Import shabloni (Excel)» — xodimlar uchun bo'sh Excel shablon.",
        "Нажмите «⋮» и выберите выгрузку списка сотрудников в Excel или PDF. «Шаблон импорта (Excel)» — пустой шаблон для сотрудников.",
      ],
      shots: [shot("04-yuklab-olish.webp", ["«⋮» menyusi", "Меню «⋮»"])],
    },
  ],
};
