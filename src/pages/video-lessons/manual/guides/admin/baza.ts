import { shotIn, type SectionGuide } from "../../types";

const shot = shotIn("admin/markaziy-baza");

/**
 * Super-admin: "Markaziy baza" — viloyatlardagi "Moddiy baza" kabi, lekin
 * kirim — barcha viloyatlarning to'langan «Chiqim F.I.Sh.» hujjatlaridagi
 * «Boshqarma (10%)» ulushi (markaziy devon moddiy bazasiga).
 */
export const adminBaza: SectionGuide = {
  intro: [
    "Markaziy devon moddiy bazasiga ajratilgan pul va undan qilingan chiqimlar. Barcha viloyatlarning «Hodimlarning pul hisob-kitobi» hujjatlaridagi «Boshqarma (10%)» ulushi shu yerga kirim bo'lib tushadi — faqat «To'landi» deb belgilangan hujjatlardan. Bo'limda ikki sahifa bor: «Monitoring» va «Chiqimlar».",
    "Деньги, выделенные на материальную базу центрального аппарата, и расходы из них. Доля «Управление (10%)» из документов «Расчёты с сотрудниками» всех областей поступает сюда приходом — только из документов, отмеченных как оплаченные. В разделе две страницы: «Мониторинг» и «Расходы».",
  ],
  steps: [
    {
      title: ["Monitoring: mablag' harakati", "Мониторинг: движение средств"],
      body: [
        "Chap menyuda «Markaziy baza» → «Monitoring». Yuqoridagi ikki sana — davr. To'rtta katakda:",
        "В левом меню «Центральная база» → «Мониторинг». Две даты вверху — период. В четырёх плашках:",
      ],
      items: [
        [
          "«Boshlang'ich qoldiq» — davr boshigacha ajratilgan va hali sarflanmagan pul.",
          "«Начальный остаток» — деньги, выделенные до начала периода и ещё не израсходованные.",
        ],
        [
          "«Markaziy bazaga ajratildi (kirim)» — davrda to'langan hujjatlardan tushgan ulush.",
          "«Выделено на центр. базу (приход)» — доля из документов, оплаченных за период.",
        ],
        ["«Chiqim» — davrdagi chiqimlar.", "«Расход» — расходы за период."],
        [
          "«Yakuniy qoldiq» — boshlang'ich qoldiq + kirim − chiqim.",
          "«Конечный остаток» — начальный остаток + приход − расход.",
        ],
        [
          "Pastda ikkita jadval: kirim hujjatlari («Viloyat» ustuni bilan — hujjat qaysi viloyatniki, «Qabul qiluvchi», «Hujjat summasi» va undan «Markaziy bazaga») va «Chiqimlar». Har jadval ostida «Jami».",
          "Ниже две таблицы: документы прихода (со столбцом «Область» — чей документ, получатель, сумма документа и из неё «На центр. базу») и «Расходы». Под каждой таблицей — «Итого».",
        ],
      ],
      tip: [
        "Bu yerda hisob raqam tanlanmaydi — barcha viloyat va hisob raqamlar birga hisoblanadi. Viloyatda hujjat hali «To'landi» deb belgilanmagan bo'lsa, kataklar ostida «Davrdagi to'lanmagan ... ta hujjat ... kirimga qo'shilmagan» izohi chiqadi.",
        "Счёт здесь не выбирается — считаются все области и счета вместе. Если в области документ ещё не отмечен как оплаченный, под плашками появится пояснение о неоплаченных документах за период.",
      ],
      shots: [shot("01-monitoring.webp", ["«Markaziy baza» → «Monitoring»", "«Центральная база» → «Мониторинг»"])],
    },
    {
      title: ["Chiqimlar", "Расходы"],
      body: [
        "«Markaziy baza» → «Chiqimlar» — markaziy baza mablag'idan qilingan xarajatlar ro'yxati. Sanalar — hujjat sanasi oralig'i, qidiruv — «№ yoki izoh», pastda «Davr bo'yicha chiqim». «⋮» — ro'yxatni Excel yoki PDF qilib yuklab olish.",
        "«Центральная база» → «Расходы» — список расходов из средств центральной базы. Даты — период по дате документа, поиск — по номеру или комментарию, внизу «Расход за период». «⋮» — выгрузить список в Excel или PDF.",
      ],
      ordered: true,
      items: [
        [
          "«Qo'shish» ni bosing — «Yangi chiqim» oynasi ochiladi («Markaziy devon moddiy bazasiga ajratilgan mablag' hisobidan»).",
          "Нажмите «Добавить» — откроется окно «Новый расход».",
        ],
        [
          "«Hujjat raqami» va «Hujjat sanasi» ni kiriting — sana ostida «... holatiga markaziy baza mablag'i» chiqadi: «Ajratilgan (kirim)», «Sarflangan (chiqim)» va «Qoldiq».",
          "Введите «Номер документа» и «Дата документа» — под датой появятся «Средства центральной базы на ...»: выделено, израсходовано и остаток.",
        ],
        [
          "«Summa» ni yozing (ostida «Bu chiqimdan keyin qoldiq»), kerak bo'lsa «Izoh» va «Saqlash» ni bosing.",
          "Введите «Сумма» (под полем — «Остаток после этого расхода»), при необходимости «Комментарий», и нажмите «Сохранить».",
        ],
      ],
      warn: [
        "Qoldiq yetmasa ham chiqim saqlanadi — faqat qizil «qoldiq yetarli emas» ogohlantirishi chiqadi. Tahrirlash — qatordagi qalam, o'chirish — savat (tasdiq so'raydi).",
        "Даже при нехватке остатка расход сохранится — появится только красное предупреждение. Изменить — карандаш в строке, удалить — корзина (с подтверждением).",
      ],
      shots: [shot("02-chiqim.webp", ["«Yangi chiqim» oynasi va qoldiq", "Окно «Новый расход» и остаток"])],
    },
  ],
};
