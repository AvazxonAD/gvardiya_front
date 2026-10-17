import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("report");

/** "Qarzdorlik" — qarzdorlik tahlili */
export const report: SectionGuide = {
  intro: [
    "«Qarzdorlik tahlili» — qolgan qarz qancha, qanchasining muddati o'tgan va qaysi tashkilotlar eng uzoq vaqt to'lamayapti.",
    "«Анализ задолженности» — сколько долга осталось, какая часть просрочена и какие организации дольше всех не платят.",
  ],
  steps: [
    {
      title: ["Davrni tanlash", "Выбор периода"],
      body: [
        "Sahifaning o'ng yuqorisidagi ikkita sana — shartnoma sanasi oralig'i. Odatda 2020-yil 1-yanvardan bugungacha turadi. «Yangilash» tugmasi ko'rsatkichlarni qayta yuklaydi.",
        "Две даты справа вверху страницы — период по дате договора. По умолчанию с 1 января 2020 года по сегодня. Кнопка «Обновить» перезагружает показатели.",
      ],
      tip: [
        "Bu sahifaning sanalari Dashboard sanalaridan alohida va sahifa har ochilganda qaytadan 2020-yildan boshlanadi.",
        "Даты этой страницы не связаны с датами дашборда и при каждом открытии снова начинаются с 2020 года.",
      ],
      shots: [shot("01-davr.webp", ["Sana oralig'i va «Yangilash»", "Период и кнопка «Обновить»"])],
    },
    {
      title: ["Qarz kartochkalari", "Карточки долга"],
      body: [
        "To'rtta kartochka. Har birini bossangiz, shartnomalar ro'yxati ochiladi (Excel yoki PDF qilib yuklab olish mumkin).",
        "Четыре карточки. Нажмите на любую — откроется список договоров (можно выгрузить в Excel или PDF).",
      ],
      items: [
        [
          "«Jami qarz» — davrdagi shartnomalar bo'yicha qolgan qarz; ostida qarzdor shartnomalar soni va undirilgan foiz.",
          "«Общий долг» — остаток долга по договорам периода; ниже — число договоров с долгом и процент взыскания.",
        ],
        [
          "«Muddati kelmagan» — to'lov muddati hali kelmagan qarz.",
          "«Срок не наступил» — долг, срок оплаты которого ещё не настал.",
        ],
        [
          "«Kechiktirilgan» — muddat o'tdi, tadbir hali oldinda.",
          "«Просрочен платёж» — срок прошёл, мероприятие ещё впереди.",
        ],
        [
          "«Muddati o'tgan» — tadbir boshlangan, pul tushmagan.",
          "«Просрочено» — мероприятие началось, деньги не поступили.",
        ],
      ],
      tip: [
        "To'lov muddati — tadbirdan 3 kun oldin. Holatlar bugungi kunga nisbatan hisoblanadi.",
        "Срок оплаты — за 3 дня до мероприятия. Статусы считаются относительно сегодняшнего дня.",
      ],
      shots: [shot("02-kartochkalar.webp", ["Qarz kartochkalari", "Карточки долга"])],
    },
    {
      title: ["Diagrammalar", "Диаграммы"],
      body: [
        "Ikkita diagramma qarzning qanchalik eskirganini ko'rsatadi:",
        "Две диаграммы показывают, насколько долг старый:",
      ],
      items: [
        [
          "«Muddati o'tgan qarz yoshi» — tadbir boshlanganidan beri necha kun o'tgan: 30 kungacha, 31–90 kun, 91–180 kun, 181–365 kun, 1 yildan ko'p.",
          "«Возраст просроченного долга» — сколько дней прошло с начала мероприятия: до 30, 31–90, 91–180, 181–365 дней, больше года.",
        ],
        [
          "«Oylar bo'yicha qolgan qarz» — shartnoma oyi bo'yicha hali to'lanmagan summa (oxirgi 24 oy). Ustun ustiga sichqoncha olib borsangiz, tafsiloti chiqadi.",
          "«Остаток долга по месяцам» — неоплаченная сумма по месяцу договора (последние 24 месяца). При наведении на столбец показываются подробности.",
        ],
      ],
      shots: [shot("03-diagrammalar.webp", ["Qarz yoshi va oylar bo'yicha qarz", "Возраст долга и долг по месяцам"])],
    },
    {
      title: ["Qarzdor tashkilotlar", "Организации-должники"],
      body: [
        "Jadvalda eng uzoq vaqt to'lamayotgan tashkilotlar birinchi turadi. Qatorni yoki «Shartnoma» ustunidagi sonni bossangiz, tashkilotning qarzdor shartnomalari ochiladi.",
        "В таблице первыми идут организации, дольше всех не платящие. Нажмите на строку или на число в столбце «Договоры» — откроются долговые договоры организации.",
      ],
      items: [
        ["Qidiruv: «Nomi yoki STIR (INN)».", "Поиск: по названию или ИНН."],
        [
          "«Kechikish» — eng eski muddati o'tgan shartnoma bo'yicha necha kun o'tgan: 90 kundan oshsa qizil, kamroq bo'lsa to'q sariq. Muddati o'tgan qarzi yo'q tashkilotda «—» turadi.",
          "«Просрочка» — сколько дней прошло по самому старому просроченному договору: больше 90 дней — красным, меньше — оранжевым. Если просроченного долга нет — «—».",
        ],
        [
          "Ustun nomini bossangiz, tartib o'zgaradi. Pastdagi «Yana ... ta» tugmasi ro'yxatning davomini ochadi.",
          "Нажмите на заголовок столбца, чтобы сменить сортировку. Кнопка «Ещё ...» внизу подгружает продолжение списка.",
        ],
        ["«⋮» — ro'yxatni Excel yoki PDF qilib yuklab olish.", "«⋮» — выгрузить список в Excel или PDF."],
      ],
      tip: [
        "Tadbir bo'lmaydigan shartnomani kartochka yoki tashkilot bosilganda ochiladigan shartnomalar ro'yxatidagi «Bekor qilish» tugmasi bilan bekor qilish mumkin — u qarzdorlikdan chiqadi. Shartlari va qayta faollashtirish — «Shartnomalar ro'yhati» bo'limida.",
        "Договор, по которому мероприятия не будет, можно отменить кнопкой «Отменить» в списке договоров, который открывается по карточке или организации, — он уйдёт из задолженности. Условия и восстановление — в разделе «Список договоров».",
      ],
      shots: [shot("04-tashkilotlar.webp", ["«Qarzdor tashkilotlar» jadvali", "Таблица организаций-должников"])],
    },
  ],
};
