import { shotIn, type SectionGuide } from "../../types";

const shot = shotIn("admin/monitoring");

/**
 * Super-admin: "Monitoring" (pages/admin/monitoring-data) — qaysi viloyat
 * tanlangan oyda dasturga ma'lumot kiritgan (kiritilgan sana bo'yicha).
 */
export const adminMonitoring: SectionGuide = {
  intro: [
    "Qaysi viloyat tanlangan oyda dasturga ma'lumot kiritgan, qaysi biri yo'q: shartnomalar, tashkilotlar, xodimlar va to'lovlar soni — yozuv kiritilgan sana bo'yicha. Dasturdan foydalanmayotgan viloyatni shu yerda ko'rasiz.",
    "Какие области вносили данные в программу за выбранный месяц, а какие нет: число договоров, организаций, сотрудников и оплат — по дате ввода записи. Здесь видно, какая область не пользуется программой.",
  ],
  steps: [
    {
      title: ["Oyni tanlash va jadval", "Выбор месяца и таблица"],
      body: [
        "Yuqorida oy va yil (odatda joriy oy); «‹» va «›» — oldingi va keyingi oy, «Tozalash» — joriy oyga qaytish. Jadvalda har bir viloyat:",
        "Вверху месяц и год (по умолчанию текущий месяц); «‹» и «›» — предыдущий и следующий месяц, «Очистить» — вернуться к текущему. В таблице по каждой области:",
      ],
      items: [
        [
          "«Holat» — «Kiritgan» (yashil) yoki «Kiritilmagan» (qizil).",
          "«Статус» — «Внесены» (зелёный) или «Нет данных» (красный).",
        ],
        [
          "«Shartnoma» (ostida summasi), «Tashkilot», «Xodim», «To'lov» va «To'langan summa» — oy davomida kiritilganlari.",
          "Договоры (ниже — сумма), организации, сотрудники, оплаты и оплаченная сумма — внесённые за месяц.",
        ],
        [
          "«Oxirgi kiritish» — viloyatning eng oxirgi yozuvi (butun vaqt bo'yicha): sana va «bugun», «kecha» yoki «... kun oldin». 30 kundan oshsa qizil; hech narsa kiritmagan bo'lsa — «Hech qachon».",
          "«Последний ввод» — самая последняя запись области (за всё время): дата и «сегодня», «вчера» или «... дн. назад». Больше 30 дней — красным; если ничего не вносили — «Никогда».",
        ],
        [
          "Pastda: «Kiritgan» (masalan, 12 / 14), «Kiritmagan», «Shartnomalar», «Tashkilotlar», «Xodimlar», «To'langan summa». «⋮» — jadvalni Excel yoki PDF qilib yuklab olish.",
          "Внизу: внесли (например, 12 / 14), не внесли, договоры, организации, сотрудники, оплаченная сумма. «⋮» — выгрузить таблицу в Excel или PDF.",
        ],
      ],
      tip: [
        "Sana — yozuv dasturga kiritilgan kun, hujjat sanasi emas: sahifa kim qachon ishlaganini ko'rsatadi. Ustun nomini bossangiz, tartib o'zgaradi — «Holat» bo'yicha kiritmagan viloyatlarni bir joyga to'plang.",
        "Дата — день ввода записи в программу, а не дата документа: страница показывает, кто и когда работал. Нажатие на заголовок меняет сортировку — отсортируйте по «Статус», чтобы собрать не внёсшие области вместе.",
      ],
      shots: [shot("01-jadval.webp", ["«Monitoring» — viloyatlar bo'yicha", "«Мониторинг» по областям"])],
    },
  ],
};
