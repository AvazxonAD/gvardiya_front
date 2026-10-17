import { shotIn, type SectionGuide } from "../../types";

const shot = shotIn("admin/bxm");

/** Super-admin: "Ma'lumotnoma" → "BXM" (pages/sprPages/Bxm) — respublika uchun bitta ro'yxat */
export const adminBxm: SectionGuide = {
  intro: [
    "BXM (bazaviy hisoblash miqdori) — butun respublika uchun bitta ro'yxat, uni faqat super-admin yuritadi. Viloyatlar shartnoma tuzishda BXM ni shu ro'yxatdan tanlaydi: topshiriqning bir soat narxi — BXM ning 7 foizi.",
    "БХМ (базовая расчётная величина) — один список на всю республику, ведёт его только супер-администратор. Области выбирают БХМ из этого списка при создании договора: стоимость часа задания — 7% от БХМ.",
  ],
  steps: [
    {
      title: ["BXM ro'yxati", "Список БХМ"],
      body: [
        "Chap menyuda «Ma'lumotnoma» → «BXM». Jadvalda — «BXM summa»; ustun nomini bossangiz, tartib o'zgaradi. «⋮» — ro'yxatni Excel yoki PDF qilib yuklab olish.",
        "В левом меню «Справочник» → «БХМ». В таблице — «Сумма БХМ»; нажатие на заголовок меняет сортировку. «⋮» — выгрузить список в Excel или PDF.",
      ],
      items: [
        [
          "«Qo'shish» → «Summa» ni yozing → «Qo'shish».",
          "«Добавить» → введите «Сумма» → «Добавить».",
        ],
        [
          "Qalam — «Tahrirlash» oynasi: summani o'zgartirib, «Tahrirlash» ni bosing.",
          "Карандаш — окно «Редактировать»: измените сумму и нажмите «Редактировать».",
        ],
        [
          "Savat — o'chirish (tasdiq so'raydi). O'chirilgan BXM yangi shartnomalarda tanlanmaydi.",
          "Корзина — удаление (с подтверждением). Удалённая БХМ не предлагается в новых договорах.",
        ],
      ],
      tip: [
        "Yangi BXM kuchga kirganda eskisini tahrirlamang — yangisini «Qo'shish» bilan qo'shing. «Shartnoma importi» da faylda BXM ko'rsatilmasa, eng oxirgi qo'shilgan BXM olinadi.",
        "Когда вступает в силу новая БХМ, не меняйте прежнюю — добавьте новую через «Добавить». В «Импорте договоров» при пустой БХМ в файле берётся последняя добавленная.",
      ],
      shots: [shot("01-royxat.webp", ["«BXM» ro'yxati va «Qo'shish» oynasi", "Список БХМ и окно «Добавить»"])],
    },
  ],
};
