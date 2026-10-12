import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("organisation");

/** "Tashkilot" — buyurtmachi (hamkor) tashkilotlar */
export const organisation: SectionGuide = {
  intro: [
    "Buyurtmachi tashkilotlar — shartnoma kim bilan tuziladi. Bu yerda o'z boshqarmangiz emas, mijoz tashkilotlari yuritiladi (o'z rekvizitlaringiz — «Ma'lumotnoma» da).",
    "Организации-заказчики — с кем заключается договор. Здесь ведутся клиенты, а не ваше управление (свои реквизиты — в «Справочнике»).",
  ],
  steps: [
    {
      title: ["Tashkilot qo'shish (INN bo'yicha)", "Добавление организации (по ИНН)"],
      body: [
        "«Qo'shish» tugmasini bosing — «Tashkilotchi» oynasi ochiladi.",
        "Нажмите «Добавить» — откроется окно добавления организации.",
      ],
      ordered: true,
      items: [
        [
          "«INN» maydoniga 9 xonali INN ni yozing va yonidagi lupa tugmasini bosing.",
          "Введите 9-значный ИНН в поле ИНН и нажмите кнопку с лупой рядом.",
        ],
        [
          "«Nomi», «Manzil» va «Direktor» o'zi to'ladi — to'g'riligini tekshiring.",
          "«Название», «Адрес» и «Директор» заполнятся сами — проверьте их.",
        ],
        ["«Bank nomi» va «MFO» ni yozing.", "Введите «Название банка» и «МФО»."],
        [
          "«Hisob raqami» ostidagi «Qo'shish» tugmasini bosing — yangi qator chiqadi, unga hisob raqamini yozing. Bir nechta bo'lsa, har biri uchun yana «Qo'shish».",
          "Нажмите «Добавить» под «Номер счета» — появится новая строка, введите в неё номер счёта. Если счетов несколько — «Добавить» для каждого.",
        ],
        [
          "G'azna (xazina) hisob raqami bo'lsa — «G'azna hisob raqami» ga xuddi shunday qo'shing.",
          "Если есть казначейский счёт — добавьте его так же в «Казначейский счёт».",
        ],
        ["«Saqlash» ni bosing — «Ma'lumot qo'shildi».", "Нажмите «Сохранить»."],
      ],
      warn: [
        "Avval INN bo'yicha qidiring, keyin bank ma'lumotlarini yozing yoki tekshiring: qidiruv «Bank nomi» va «MFO» ni qaytadan yozadi (Didox ulangan bo'lsa o'zi to'ldiradi, aks holda bo'shatib qo'yadi).",
        "Сначала выполните поиск по ИНН, потом вводите или проверяйте банковские данные: поиск перезаписывает «Название банка» и «МФО» (при подключённом Didox заполняет их, иначе очищает).",
      ],
      shots: [shot("01-qoshish.webp", ["INN bo'yicha to'ldirilgan oyna", "Окно, заполненное по ИНН"])],
    },
    {
      title: ["INN topilmasa", "Если ИНН не найден"],
      body: [
        "Qidiruv tashqi ochiq manbadan ma'lumot oladi. Quyidagi xabarlardan biri chiqsa, maydonlarni qo'lda to'ldiring:",
        "Поиск берёт данные из внешнего открытого источника. Если появится одно из сообщений ниже, заполните поля вручную:",
      ],
      items: [
        ["«INN 9 ta raqamdan iborat bo'lishi kerak» — raqamni tekshiring.", "ИНН должен состоять из 9 цифр — проверьте номер."],
        ["«Tashkilot topilmadi» — bunday INN topilmadi.", "«Организация не найдена»."],
        ["«Qidirishda xatolik» yoki «Orginfo.uz bilan bog'lanishda xatolik» — aloqa yo'q: keyinroq urining yoki qo'lda to'ldiring.", "«Ошибка поиска» — нет связи, попробуйте позже."],
      ],
      warn: [
        "Aniq mos tashkilot topilmasa, qidiruv birinchi o'xshash natijani qo'yadi — «Nomi» to'g'riligini albatta tekshiring.",
        "Если точного совпадения нет, поиск подставит первый похожий результат — обязательно проверьте название.",
      ],
      shots: [shot("02-inn-topilmadi.webp", ["INN bo'yicha qidiruv xabari", "Сообщение поиска по ИНН"])],
    },
    {
      title: ["Ro'yxat va qidiruv", "Список и поиск"],
      body: [
        "Qidiruv maydoniga nomi, INN, manzil yoki rahbar ismini yozing. «⋮» tugmasi ro'yxatni Excel yoki PDF qilib yuklab beradi.",
        "Введите в поиск название, ИНН, адрес или имя руководителя. Кнопка «⋮» выгружает список в Excel или PDF.",
      ],
      tip: [
        "Bir INN bilan tashkilot ikki marta kiritilmaydi — «Ushbu hamkor tashkilot avval kiritilgan!» chiqsa, u ro'yxatda bor, qidiruv orqali toping.",
        "Организация с одним ИНН дважды не вносится — если появилось такое сообщение, найдите её в списке через поиск.",
      ],
      shots: [shot("03-royxat.webp", ["Tashkilotlar ro'yxati", "Список организаций"])],
    },
    {
      title: ["Tahrirlash va o'chirish", "Изменение и удаление"],
      body: [
        "Qator oxiridagi qalam «Hamkor korxona» oynasini ochadi, savat esa tashkilotni o'chiradi.",
        "Карандаш в конце строки открывает окно изменения организации, корзина — удаляет её.",
      ],
      warn: [
        "Hisob raqamini o'chirsangiz yoki boshqa raqamga almashtirsangiz, shu tashkilot bilan tuzilgan shartnomani keyin tahrirlashda undagi «Hisob raqami» va «G'azna hisob raqami» ni tekshiring. Shartnomalarda ishlatilgan tashkilotni o'chirmang — dastur buni to'xtatmaydi.",
        "Если вы удалили или заменили номер счёта, при редактировании договоров этой организации проверьте «Номер счета» и «Казначейский счёт». Не удаляйте организацию, используемую в договорах, — программа этого не запрещает.",
      ],
      shots: [shot("04-tahrirlash.webp", ["«Hamkor korxona» oynasi", "Окно изменения организации"])],
    },
  ],
};
