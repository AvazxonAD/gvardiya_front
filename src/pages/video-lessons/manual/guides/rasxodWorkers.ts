import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("rasxod-workers");

/** "Hodimlarning pul hisob-kitobi" — "Chiqim F.I.Sh." hujjatlari */
export const rasxodWorkers: SectionGuide = {
  intro: [
    "Batalon xodimlariga topshiriqlarda ishlagan soatlari uchun to'lov hujjati («Chiqim F.I.Sh.»). Faqat buyurtmachi to'liq to'lagan shartnomalar bo'yicha tuziladi. Har bir xodimning summasi belgilangan foizlar bo'yicha o'zi taqsimlanadi.",
    "Платёжный документ сотрудникам батальона за часы, отработанные на заданиях («Chiqim F.I.Sh.»). Составляется только по договорам, полностью оплаченным заказчиком. Сумма каждого сотрудника сама распределяется по установленным процентам.",
  ],
  need: [
    [
      "Xodimlar shartnoma topshiriqlariga biriktirilgan bo'lishi kerak («Shartnomalar ro'yhati» → «Xodim biriktirish»)",
      "Сотрудники должны быть закреплены за заданиями договоров («Список договоров» → «Закрепить сотрудников»)",
    ],
    [
      "Shartnoma kirimlar bilan TO'LIQ to'langan bo'lishi kerak",
      "Договор должен быть ПОЛНОСТЬЮ оплачен приходами",
    ],
  ],
  steps: [
    {
      title: ["Yangi hujjat yaratish", "Создание документа"],
      body: [
        "«Qo'shish» tugmasini bosing — «Chiqim F.I.Sh. yaratish» sahifasi ochiladi.",
        "Нажмите «Добавить» — откроется страница создания документа.",
      ],
      ordered: true,
      items: [
        ["«Hujjat №» va «Hujjat sanasi» ni kiriting.", "Введите «№ документа» и «Дата проводки»."],
        [
          "«Qabul qiluvchi ma'lumotlari» maydonlaridan biriga IKKI MARTA bosing va ochilgan «Tashkilotni tanlang» oynasida batalonni tanlang (qatoriga bosing). Xodimlar qatorlari jadvalga o'zi yuklanadi.",
          "ДВАЖДЫ нажмите на любое поле «Информация о получателе» и выберите батальон в окне (нажмите на строку). Строки сотрудников загрузятся в таблицу сами.",
        ],
        [
          "«dan» va «gacha» — shartnoma sanasi oralig'i (odatda oxirgi bir oy). O'zgartirsangiz, «Ishga tushirish» ni bosing.",
          "«с» и «по» — период по дате договора (по умолчанию последний месяц). После изменения нажмите «Запустить».",
        ],
        [
          "Jadvalni tekshiring: har bir qator — bitta xodimning bitta topshiriqdagi ishi va uning summasi. Hozir to'lanmaydiganini qator boshidagi savat tugmasi bilan olib tashlang.",
          "Проверьте таблицу: каждая строка — работа одного сотрудника на одном задании и её сумма. То, что сейчас не оплачивается, уберите корзиной в начале строки.",
        ],
        [
          "Kerak bo'lsa «Tavsif» yozing va «Saqlash» ni bosing — «Chiqim F.I.Sh. yaratildi!».",
          "При необходимости заполните «Описание» и нажмите «Сохранить».",
        ],
      ],
      warn: [
        "Jadvalda qolgan HAMMA qatorlar hujjatga kiradi. Qidiruv faqat ko'rinishni filtrlaydi, qatorni olib tashlamaydi — buning uchun savat tugmasi bor. Olib tashlangan ish to'lanmagan bo'lib qoladi va keyingi hujjatda yana chiqadi. «Ishga tushirish» qayta bosilsa, jadval qaytadan yuklanadi va olib tashlanganlar ham qaytadi.",
        "В документ входят ВСЕ оставшиеся строки таблицы. Поиск только фильтрует отображение, строки не убирает — для этого есть корзина. Убранная работа остаётся неоплаченной и снова появится в следующем документе. Повторное «Запустить» загружает таблицу заново, убранные строки тоже вернутся.",
      ],
      tip: [
        "Jadval bo'sh bo'lsa: shartnoma hali to'liq to'lanmagan, xodimlar topshiriqqa biriktirilmagan, sana oralig'i tor yoki bu ishlar boshqa hujjatda to'langan. «Muddatli harbiy xizmatchi» belgilangan xodimlar bu yerga kirmaydi.",
        "Если таблица пуста: договор ещё не оплачен полностью, сотрудники не закреплены, узкий период или эта работа уже оплачена другим документом. Срочнослужащие сюда не попадают.",
      ],
      shots: [
        shot("01-yaratish.webp", ["Batalon tanlangan va qatorlar yuklangan", "Батальон выбран, строки загружены"]),
      ],
    },
    {
      title: ["Summa qanday taqsimlanadi", "Как распределяется сумма"],
      body: [
        "Har bir qatorning «Jami (100%)» summasi quyidagicha bo'linadi. Misol — 100 000 so'm:",
        "Сумма «Всего (100%)» каждой строки делится так. Пример — 100 000 сум:",
      ],
      items: [
        ["«Boshqarma (10%)» — 10 000.", "«Управление (10%)» — 10 000."],
        ["«Qolgan (90%)» — 90 000.", "«Остаток (90%)» — 90 000."],
        [
          "«Moddiy baza (75%)» — qolganning 75 foizi: 67 500.",
          "«Материальная база (75%)» — 75% остатка: 67 500.",
        ],
        [
          "«I-II guruh (25%)» — qolganning 25 foizi: 22 500. Undan «Shaxsiy tarkib» — 18 000 va «Ijtimoiy soliq (25%)» — 4 500.",
          "«I-II группы (25%)» — 25% остатка: 22 500. Из неё «Личный состав» — 18 000 и «Социальный налог (25%)» — 4 500.",
        ],
        [
          "«Daromad solig'i (12%)» — shaxsiy tarkib summasining 12 foizi: 2 160.",
          "«Налог на доходы (12%)» — 12% суммы личного состава: 2 160.",
        ],
        [
          "«Kartaga o'tkazildi» — xodim kartasiga tushadigan summa: 15 840.",
          "«Перечислено на карту» — сумма на карту сотрудника: 15 840.",
        ],
      ],
      tip: [
        "Foizlar umumiy summadan emas, oldingi bosqichdan olinadi. Eski hujjatlarda o'sha paytdagi qoidalar bo'yicha saqlangan summalar qoladi.",
        "Проценты берутся не от общей суммы, а от предыдущего шага. В старых документах остаются суммы по правилам того времени.",
      ],
      shots: [shot("02-taqsimot.webp", ["Jadvaldagi taqsimot ustunlari", "Столбцы распределения в таблице"])],
    },
    {
      title: ["Ro'yxat va hisobotlar", "Список и отчёты"],
      body: [
        "Ro'yxatdagi sanalar hujjat sanasi bo'yicha filtrlaydi. Qidiruv: «№ yoki qabul qiluvchi», yonidagi filtr — holat bo'yicha («To'langan» / «To'lanmagan»). Pastdagi kataklarda tanlangan davr bo'yicha jami summalar.",
        "Даты списка фильтруют по дате документа. Поиск по номеру или получателю, рядом — фильтр по статусу («Оплаченные» / «Неоплаченные»). Внизу — итоговые суммы за период.",
      ],
      items: [
        [
          "Yuqoridagi «⋮» — «Batalonlar uchun chiqimlar» va «Umumiy hisobot» (Excel yoki PDF).",
          "«⋮» вверху — «Расходы для батальонов» и «Общий отчёт» (Excel или PDF).",
        ],
        [
          "Qatordagi «⋮» (Amallar) — shu hujjat bo'yicha hamma amallar nomi bilan: «Hujjatni tahrirlash», «To'landi deb belgilash», «Hisobotlar» guruhida «Umumiy hisobot», «Tarqatuv vedomosti» va «Tarqatuv vedomosti (karta raqamlari bilan)», oxirida «Hujjatni o'chirish».",
          "«⋮» в строке (Действия) — все действия с документом по названиям: «Редактировать документ», «Отметить как оплачено», в группе «Отчёты» — «Общий отчёт», «Раздаточная ведомость» и ведомость с номерами карт, в конце — «Удалить документ».",
        ],
        [
          "Jami kataklar ostida — «Ommaviy tadbirlar hisoboti» uchun izoh: hisobotdagi «Rag'batlantirishga 25% → Sarflandi» — shu davrdagi hujjatlarning 25% qismi, viloyatning barcha hisob raqamlari bo'yicha (boshqa hisob raqamlardagisi qavsda). Hisobotning «Hisoblandi» ustunlari bu sahifadan emas, shu davrda tuzilgan shartnomalar summasidan hisoblanadi.",
          "Под итоговыми ячейками — пояснение к «Отчёту по массовым мероприятиям»: графа «На поощрение 25% → Израсходовано» — 25% документов за этот период по всем счетам области (сумма по другим счетам — в скобках). Графы «Начислено» считаются не по этой странице, а по сумме договоров, заключённых в этот период.",
        ],
      ],
      tip: [
        "Chop etish uchun shu Excel yoki PDF fayllarni yuklab olib, chop eting.",
        "Для печати скачайте эти файлы Excel или PDF и распечатайте их.",
      ],
      shots: [
        shot("03-royxat.webp", ["Ro'yxat va qatordagi «⋮» (Amallar)", "Список и «⋮» (Действия) в строке"]),
        shot("05-hisobot-izohi.webp", ["«Ommaviy tadbirlar hisoboti» uchun izoh", "Пояснение к отчёту по массовым мероприятиям"]),
      ],
    },
    {
      title: ["To'lov holati", "Статус оплаты"],
      body: [
        "Yangi hujjat «To'lanmagan» bo'lib yaratiladi. Summalar xodimlarga to'langach, qatordagi «⋮» → «To'landi deb belgilash» ni bosing va tasdiqlang. Xato belgilangan bo'lsa — «⋮» → «To'lanmaganga qaytarish». Holat «Holati» ustunida ko'rinadi.",
        "Новый документ создаётся «Не оплачено». Когда суммы выплачены сотрудникам, нажмите в строке «⋮» → «Отметить как оплачено» и подтвердите. Если отметили по ошибке — «⋮» → «Вернуть в неоплаченные». Статус виден в столбце «Статус».",
      ],
      tip: [
        "«Moddiy baza» → «Monitoring» dagi kirimga faqat «To'landi» hujjatlarning moddiy baza ulushi (75%) qo'shiladi. Ro'yxatdagi jami summalar va hujjatni tahrirlash holatga bog'liq emas.",
        "В приход «Материальная база» → «Мониторинг» попадает доля на мат. базу (75%) только из документов «Оплачено». Итоги списка и редактирование документа от статуса не зависят.",
      ],
    },
    {
      title: ["Tahrirlash va o'chirish", "Изменение и удаление"],
      body: [
        "Qatordagi «⋮» → «Hujjatni tahrirlash» — «Chiqim F.I.Sh. tahrirlash» sahifasi. Sahifa hujjatda saqlangan qatorlar bilan ochiladi (och yashil) — yangi ma'lumot o'zi yuklanmaydi. Qatorni olib tashlash uchun uning boshidagi savatni bosing va «Saqlash» ni bosing — bu ish hujjatdan chiqadi va yana to'lov uchun bo'shaydi. Yangi to'lanadigan ishlarni qo'shish uchun «Summalarni yangilash» ni bosing. Ro'yxatdagi «⋮» → «Hujjatni o'chirish» esa hujjatni butunlay o'chiradi.",
        "«⋮» в строке → «Редактировать документ» — страница изменения документа. Она открывается с сохранёнными строками (светло-зелёные) — новые данные сами не загружаются. Чтобы убрать строку, нажмите корзину в её начале и «Сохранить» — работа выйдет из документа и снова станет доступна к оплате. Чтобы добавить новые оплачиваемые работы, нажмите «Обновить суммы». «⋮» в списке → «Удалить документ» удаляет документ целиком.",
      ],
      warn: [
        "Hujjatda kamida bitta qator qolishi kerak. Qabul qiluvchi batalon almashtirilsa, eski batalonning qatorlari hujjatdan chiqadi — yangisiniki uchun «Summalarni yangilash» ni bosing. Hujjat bor ekan, undagi topshiriqlardan xodimni o'chirib bo'lmaydi.",
        "В документе должна остаться хотя бы одна строка. Если сменить батальон-получатель, строки прежнего батальона выйдут из документа — для нового нажмите «Обновить суммы». Пока документ существует, сотрудника нельзя снять с его заданий.",
      ],
      shots: [shot("04-tahrirlash.webp", ["«Chiqim F.I.Sh. tahrirlash» sahifasi", "Страница изменения документа"])],
    },
  ],
};
