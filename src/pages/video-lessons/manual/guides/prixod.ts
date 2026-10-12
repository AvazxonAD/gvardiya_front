import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("prixod");

/** "Kirimlar kitobi" — buyurtmachidan tushgan to'lovlar */
export const prixod: SectionGuide = {
  intro: [
    "Buyurtmachi tashkilotdan shartnoma bo'yicha tushgan har bir to'lov shu yerga kiritiladi. Kirim shartnomaning qarzini kamaytiradi. Kirim yuqori panelda tanlangan hisob raqamga yoziladi.",
    "Сюда вносится каждый платёж заказчика по договору. Приход уменьшает долг по договору и записывается на счёт, выбранный на верхней панели.",
  ],
  need: [
    ["To'lov hujjatining raqami va sanasi", "Номер и дата платёжного документа"],
    ["Qaysi shartnoma bo'yicha to'langani", "По какому договору оплачено"],
  ],
  steps: [
    {
      title: ["Yangi kirim kiritish", "Ввод нового прихода"],
      body: [
        "«Qo'shish» tugmasini bosing — «Hujjat yaratish» sahifasi ochiladi.",
        "Нажмите «Добавить» — откроется страница создания документа.",
      ],
      ordered: true,
      items: [
        [
          "«Shartnoma» bo'limidagi «Hujjat №» maydoniga IKKI MARTA bosing — «Shartnomani tanlang» oynasi ochiladi. Shartnomani qidiring va qatoriga bosing: to'lovchi va summa o'zi to'ladi.",
          "ДВАЖДЫ нажмите на поле «№ документа» в блоке «Договор» — откроется окно выбора договора. Найдите договор и нажмите на строку: плательщик и сумма заполнятся сами.",
        ],
        [
          "«Kirim» dagi «Summa» ni haqiqiy to'lov summasiga o'zgartiring (u shartnomaning qolgan qarzi bilan to'ladi). Yonida summa so'z bilan chiqadi.",
          "Исправьте «Сумму» прихода на фактическую сумму платежа (подставляется остаток долга). Рядом сумма выводится прописью.",
        ],
        [
          "Sahifaning yuqorisidagi «To'lov hujjatlari» qismida «Hujjat №» va «Hujjat sanasi» ni TO'LOV hujjatining raqami va sanasiga o'zgartiring.",
          "Исправьте вверху страницы «№ документа» и «Дата проводки» на номер и дату ПЛАТЁЖНОГО документа.",
        ],
        ["Kerak bo'lsa «Tavsif» yozing.", "При необходимости заполните «Описание»."],
        ["«Qo'shish» ni bosing — ro'yxatga qaytasiz.", "Нажмите «Добавить» — вы вернётесь к списку."],
      ],
      warn: [
        "Shartnoma tanlanganda yuqoridagi «Hujjat №» va «Hujjat sanasi» shartnomaning raqami va sanasi bilan to'lib qoladi — ularni albatta to'lov hujjatiga moslab o'zgartiring, aks holda oylik hisobotlar noto'g'ri chiqadi. «Hujjat №» ga faqat raqam yoziladi.",
        "При выборе договора «№» и «Дата документа» вверху заполняются номером и датой договора — обязательно исправьте их на данные платёжки, иначе помесячные отчёты будут неверными. В «№» — только цифры.",
      ],
      tip: [
        "Oynadagi «Qoldiq» — shartnomaning qolgan qarzi. 0 bo'lsa, shartnoma to'liq to'langan — uni tanlamang («Summa 1 dan kichik bo'lmasligi kerak» xatosi chiqadi). Shartnoma ro'yxatda bo'lmasa, oynadagi sanalarni kengaytiring.",
        "«Остаток» в окне — оставшийся долг по договору. Если 0, договор полностью оплачен — не выбирайте его. Если договора нет в списке, расширьте даты в окне.",
      ],
      shots: [
        shot("01-shartnoma-tanlash.webp", ["«Shartnomani tanlang» oynasi", "Окно выбора договора"]),
        shot("02-kirim.webp", ["To'ldirilgan kirim hujjati", "Заполненный документ прихода"]),
      ],
    },
    {
      title: ["Ro'yxat va qidiruv", "Список и поиск"],
      body: [
        "Ro'yxatda har bir to'lov: raqami, shartnoma, o'tkazma sanasi, to'lovchi, summa va tavsif. Qidiruv: «№, tashkilot yoki tavsif». Pastdagi «Davr bo'yicha kirim» — tanlangan davrdagi jami kirim.",
        "В списке — каждый платёж: номер, договор, дата перевода, плательщик, сумма и описание. Поиск по номеру, организации или описанию. Плашка внизу — итог прихода за период.",
      ],
      warn: [
        "Yuqoridagi sanalar to'lov sanasi bo'yicha EMAS, SHARTNOMA sanasi bo'yicha filtrlaydi. O'tgan yilgi shartnoma bo'yicha shu oy tushgan to'lovni ko'rish uchun davrni shartnoma sanasigacha kengaytiring.",
        "Даты вверху фильтруют НЕ по дате платежа, а по дате ДОГОВОРА. Чтобы увидеть платёж этого месяца по прошлогоднему договору, расширьте период до даты договора.",
      ],
      tip: [
        "«⋮» tugmasi ro'yxatni Excel yoki PDF qilib yuklab beradi.",
        "Кнопка «⋮» выгружает список в Excel или PDF.",
      ],
      shots: [shot("03-royxat.webp", ["Kirimlar ro'yxati", "Список приходов"])],
    },
    {
      title: ["Tahrirlash va o'chirish", "Изменение и удаление"],
      body: [
        "Qalam — kirimni tahrirlash (o'sha sahifa, tugma «Tahrirlash»), savat — o'chirish. Kirim faqat u kiritilgan hisob raqam tanlanganda ochiladi.",
        "Карандаш — изменить приход (та же страница, кнопка «Редактировать»), корзина — удалить. Приход открывается только при выбранном счёте, на который он внесён.",
      ],
      warn: [
        "Dastur kirim summasini shartnoma qarzidan oshishini to'xtatmaydi — summani o'zingiz tekshiring. Chiqim qilingan shartnomaning kirimini o'chirmang yoki kamaytirmang.",
        "Программа не запрещает сумму больше долга по договору — проверяйте сами. Не удаляйте и не уменьшайте приход по договору, по которому уже сделан расход.",
      ],
      shots: [shot("04-tahrirlash.webp", ["«Hujjat tahrirlash» sahifasi", "Страница изменения прихода"])],
    },
  ],
};
