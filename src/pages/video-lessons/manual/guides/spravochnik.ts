import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("spravochnik");

/** "Ma'lumotnoma" → "Rekvizitlar" */
export const spravochnik: SectionGuide = {
  intro: [
    "«Ma'lumotnoma» → «Rekvizitlar» sahifasida boshqarmangizning shartnomalarda chiqadigan ma'lumotlari va hisob raqamlari yuritiladi. Birinchi to'ldirish tartibi — «Ishni boshlash» ning 2–4-bosqichlarida.",
    "На странице «Справочник» → «Реквизиты» ведутся данные вашего управления для договоров и номера счетов. Первичное заполнение описано в шагах 2–4 раздела «Начало работы».",
  ],
  steps: [
    {
      title: ["Rekvizitlarni o'zgartirish", "Изменение реквизитов"],
      body: [
        "«Tashkilot rekvizitlari» sahifasida kerakli kartochkadagi maydonni o'zgartiring — kartochka nomi yonida «o'zgartirildi» belgisi chiqadi, «Yangilash» tugmasi esa «Bekor qilish» ga aylanadi. Yuqoridagi «Saqlash» ni bosing: «Rekvizitlar saqlandi».",
        "Измените поле в нужной карточке — рядом с её названием появится отметка «изменено». Нажмите «Сохранить» вверху.",
      ],
      items: [
        ["«Ijrochi» — boshqarma nomi va «Hujjat sarlavhasi».", "«Исполнитель» — название управления и «Заголовок документа»."],
        ["«Rahbar» — boshliq F.I.Sh.", "«Руководитель» — Ф.И.О. начальника."],
        ["«Manzil» — boshqarma manzili.", "«Адрес» — адрес управления."],
        ["«Bank» — bank nomi va «MFO» (5 ta raqam).", "«Банк» — название банка и «МФО» (5 цифр)."],
        ["«STIR» — 9 ta raqam.", "«ИНН» — 9 цифр."],
      ],
      warn: [
        "Har bir matn uch xil yoziladi: qo'shimchasiz maydon — kirill yozuvida, «(lotin)» — lotin yozuvida, «(rus tilida)» — rus tilida. Bo'sh maydon «To'ldiring» deb qizil bilan belgilanadi.",
        "Каждый текст вводится в трёх вариантах: без пометки — кириллицей, «(lotin)» — латиницей, «(rus tilida)» — на русском. Пустое поле подсвечивается красным.",
      ],
      tip: [
        "Saqlashda xato chiqsa, sahifa qayta yuklanadi va o'sha kartochkaga yozganingiz o'chadi — uzun matnni oldindan nusxalab qo'ying. O'zgarishlarni bekor qilish — «Bekor qilish».",
        "При ошибке сохранения страница перезагружается и введённое в карточку пропадает — длинный текст скопируйте заранее. Отменить изменения — «Отмена».",
      ],
      shots: [shot("01-rekvizitlar.webp", ["Rekvizitlar sahifasi", "Страница реквизитов"])],
    },
    {
      title: ["Hisob raqamlari", "Номера счетов"],
      body: [
        "Sahifaning pastidagi «Hisob raqami» bo'limida: «Qo'shish» — yangi raqam, qalam — tahrirlash, savat — o'chirish.",
        "В разделе «Номер счета» внизу страницы: «Добавить» — новый номер, карандаш — изменить, корзина — удалить.",
      ],
      warn: [
        "Ishlatilgan hisob raqamni o'chirmang: unga bog'langan shartnoma, kirim va chiqimlar ro'yxatlarda ko'rinmay qoladi. Bir xil raqam ikki marta kiritilmaydi.",
        "Не удаляйте используемый счёт: связанные с ним договоры, приходы и расходы перестанут отображаться в списках. Одинаковый номер дважды не вносится.",
      ],
      tip: [
        "Yangi hisob raqam qo'shilsa yoki o'zgartirilsa, yuqori paneldagi ro'yxat o'zi yangilanadi.",
        "При добавлении или изменении счёта список на верхней панели обновляется сам.",
      ],
      shots: [shot("02-hisob.webp", ["«Hisob raqami» bo'limi", "Раздел номеров счетов"])],
    },
    {
      title: ["Rekvizitlar qayerda ishlatiladi", "Где используются реквизиты"],
      body: [
        "Rekvizitlar shartnomaning «Bajaruvchi» qismiga va «Qabul qiluvchi tafsilotlari» ga tushadi. Hujjat qaysi tilda ko'rsatilsa, o'sha til varianti olinadi.",
        "Реквизиты попадают в раздел «Исполнитель» договора и в «Данные получателя». Берётся вариант на языке, на котором показан документ.",
      ],
      tip: [
        "Oldin tuzilgan shartnomalarning saqlangan PDF fayli o'zgarmaydi — shartnoma tahrirlanib saqlanganda yangilanadi.",
        "Сохранённый PDF ранее созданных договоров не меняется — он обновится, когда договор будет изменён и сохранён.",
      ],
      shots: [shot("03-hujjatda.webp", ["Rekvizitlar shartnomaning «Bajaruvchi» qismida", "Реквизиты в разделе «Исполнитель» договора"])],
    },
  ],
};
