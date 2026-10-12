import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("start");

/** "Ishni boshlash" — login berilgandan birinchi shartnomagacha */
export const start: SectionGuide = {
  intro: [
    "Login va parol olganingizdan keyin birinchi shartnomani tuzguncha bo'lgan yo'l. Bosqichlarni shu tartibda bajaring — har biri keyingisi uchun kerak. 2–6-bosqichlar faqat bir marta bajariladi.",
    "Путь от получения логина и пароля до первого договора. Выполняйте шаги по порядку — каждый нужен для следующего. Шаги 2–6 выполняются только один раз.",
  ],
  need: [
    [
      "Boshqarmangiz rekvizitlari: nomi, rahbar F.I.Sh., manzil, bank nomi, MFO, STIR",
      "Реквизиты вашего управления: название, Ф.И.О. руководителя, адрес, банк, МФО, ИНН",
    ],
    ["Boshqarmaning hisob raqami (20 xonali)", "Номер счёта управления (20 цифр)"],
    [
      "Buyurtmachi tashkilotning INN raqami va hisob raqami",
      "ИНН и номер счёта организации-заказчика",
    ],
  ],
  steps: [
    // 1
    {
      title: ["Tizimga kirish", "Вход в систему"],
      body: [
        "Brauzerda dastur manzilini oching. «Login» va «Parol» maydonlariga sizga berilgan ma'lumotlarni yozing va «Kirish» tugmasini bosing.",
        "Откройте адрес программы в браузере. Введите выданные вам данные в поля «Логин» и «Пароль» и нажмите «Войти».",
      ],
      tip: [
        "Agar keyingi oynada E-IMZO kalitlari ro'yxati chiqsa — kalitingizni tanlab, «E-IMZO bilan kirish» ni bosing. Buning uchun kompyuterda E-IMZO va USB Manager dasturlari ochiq bo'lishi kerak.",
        "Если следующим окном появится список ключей E-IMZO — выберите свой ключ и нажмите «Войти через E-IMZO». Для этого на компьютере должны быть запущены программы E-IMZO и USB Manager.",
      ],
      shots: [shot("01-login.webp", ["Kirish oynasi", "Окно входа"])],
    },
    // 2
    {
      title: ["Rekvizitlarni to'ldirish", "Заполнение реквизитов"],
      body: [
        "Chap menyuning eng pastidagi «Ma'lumotnoma» → «Rekvizitlar» ni oching — «Tashkilot rekvizitlari» sahifasi ochiladi. Bu yerga o'z boshqarmangiz ma'lumotlari yoziladi — ular har bir shartnomaning «Bajaruvchi» qismiga o'zi tushadi.",
        "Откройте «Справочник» → «Реквизиты» внизу левого меню. Здесь указываются данные вашего управления — они автоматически попадают в раздел «Исполнитель» каждого договора.",
      ],
      items: [
        [
          "«Ijrochi» — boshqarma nomi va «Hujjat sarlavhasi» (shartnomada sana qatorining o'ng tomonida chiqadi).",
          "«Исполнитель» — название управления и «Заголовок документа» (выводится в договоре справа в строке с датой).",
        ],
        ["«Rahbar» — boshqarma boshlig'ining F.I.Sh.", "«Руководитель» — Ф.И.О. начальника управления."],
        ["«Manzil» — boshqarma manzili.", "«Адрес» — адрес управления."],
        ["«Bank» — bank nomi va «MFO» (5 ta raqam).", "«Банк» — название банка и «МФО» (5 цифр)."],
        ["«STIR» — boshqarmaning STIR raqami (9 ta raqam).", "«ИНН» — ИНН управления (9 цифр)."],
      ],
      warn: [
        "Har bir matn uch xil yoziladi: qo'shimchasiz maydon — kirill yozuvida (Ўзбек), «(lotin)» — lotin yozuvida, «(rus tilida)» — rus tilida. Shartnoma qaysi tilda chop etilsa, o'sha variant olinadi. Hammasi to'ldirilishi shart, keyin yuqoridagi «Saqlash» ni bosing.",
        "Каждый текст вводится в трёх вариантах: поле без пометки — кириллицей (Ўзбек), «(lotin)» — латиницей, «(rus tilida)» — на русском. В договор берётся вариант на языке печати. Заполните все поля и нажмите «Сохранить» вверху.",
      ],
      tip: [
        "Rekvizitlarni shartnoma tuzishdan OLDIN to'ldiring: shartnoma hujjati (PDF) yaratilgan paytdagi rekvizitlar bilan saqlanadi.",
        "Заполните реквизиты ДО создания договоров: документ договора (PDF) сохраняется с реквизитами на момент его создания.",
      ],
      shots: [
        shot("02-rekvizitlar.webp", [
          "Ma'lumotnoma → Rekvizitlar: beshta kartochka va «Saqlash» tugmasi",
          "Справочник → Реквизиты: пять карточек и кнопка «Сохранить»",
        ]),
      ],
    },
    // 3
    {
      title: ["Hisob raqam qo'shish", "Добавление номера счёта"],
      body: [
        "Shu sahifaning pastidagi «Hisob raqami» bo'limida «Qo'shish» tugmasini bosing. Ochilgan oynada 20 xonali hisob raqamini yozing va «Qo'shish» ni bosing.",
        "В разделе «Номер счета» внизу этой же страницы нажмите «Добавить». В открывшемся окне введите 20-значный номер счёта и нажмите «Добавить».",
      ],
      tip: [
        "Raqam 4 tadan guruhlanib o'zi ajratiladi — bo'sh joy qo'yish shart emas. Bir nechta hisob raqamingiz bo'lsa, har birini alohida qo'shing.",
        "Цифры сами разбиваются на группы по 4 — пробелы ставить не нужно. Если счетов несколько, добавьте каждый отдельно.",
      ],
      shots: [
        shot("03-hisob-qoshish.webp", [
          "«Hisob raqami qo'shish» oynasi",
          "Окно добавления номера счёта",
        ]),
      ],
    },
    // 4
    {
      title: ["Hisob raqamni tanlash", "Выбор номера счёта"],
      body: [
        "Birinchi hisob raqam qo'shilishi bilan «Hisob raqam» oynasi o'zi ochiladi. Ro'yxatdan hisob raqamni tanlang va «Yopish» ni bosing. Tanlangan raqam yuqori panelda «Hisob raqam» yozuvi ostida ko'rinadi.",
        "Как только добавлен первый счёт, окно «Номер счета» откроется само. Выберите счёт из списка и нажмите «Закрыть». Выбранный номер отображается на верхней панели под надписью «Номер счета».",
      ],
      warn: [
        "Shartnomalar, kirimlar va chiqimlar tanlangan hisob raqamga bog'lanadi va faqat o'sha hisob tanlanganda ko'rinadi. Boshqa hisobga o'tish uchun yuqori paneldagi hisob raqam tugmasini bosing.",
        "Договоры, приходы и расходы привязываются к выбранному счёту и видны только при нём. Чтобы перейти на другой счёт, нажмите кнопку с номером счёта на верхней панели.",
      ],
      tip: [
        "Har safar tizimga kirganingizda bu oyna ochiladi — qaysi hisob bilan ishlashingizni tanlaysiz. Oyna o'zi ochilmasa, sahifani yangilang (F5).",
        "Это окно открывается при каждом входе — вы выбираете, с каким счётом работать. Если окно не открылось само, обновите страницу (F5).",
      ],
      shots: [
        shot("04-hisob-tanlash.webp", [
          "«Hisob raqam» oynasi va yuqori paneldagi tanlangan hisob",
          "Окно «Номер счета» и выбранный счёт на верхней панели",
        ]),
      ],
    },
    // 5
    {
      title: ["Quyi tuzilma qo'shish", "Добавление подразделения"],
      body: [
        "Menyudan «Quyi tuzilmalar» ni oching va «Qo'shish» tugmasini bosing. Shartnomadagi har bir tadbirni qaysi batalon yoki hamkor tashkilot bajarishi shu ro'yxatdan tanlanadi.",
        "Откройте в меню «Подразделения» и нажмите «Добавить». Из этого списка выбирается, какой батальон или партнёрская организация выполняет каждое мероприятие договора.",
      ],
      items: [
        ["«Nomi» — majburiy.", "«Название» — обязательно."],
        [
          "«Manzil», «INN», «Bank nomi», «MFO», «Hisob raqam» — ixtiyoriy.",
          "«Адрес», «ИНН», «Название банка», «МФО», «Номер счета» — по желанию.",
        ],
        [
          "Pastdagi «Batalon tanlang» qismida turini belgilang: «Batalon» — o'z bo'linmangiz, «Hamkor tashkilot» — tadbirga jalb qilinadigan boshqa tashkilot. So'ng «Saqlash» ni bosing.",
          "Внизу выберите тип: «Батальон» — ваше подразделение, «Партнёрская организация» — сторонняя организация, привлекаемая к мероприятию. Затем нажмите «Сохранить».",
        ],
      ],
      tip: [
        "Hodimlar faqat «Batalon» turidagi quyi tuzilmaga biriktiriladi.",
        "Сотрудников можно закрепить только за подразделением типа «Батальон».",
      ],
      shots: [
        shot("05-batalon.webp", ["«Batalon qo'shish» oynasi", "Окно добавления батальона"]),
      ],
    },
    // 6
    {
      title: ["Buyurtmachi tashkilot qo'shish", "Добавление организации-заказчика"],
      body: [
        "Shartnoma qaysi tashkilot bilan tuzilsa (buyurtmachi) — o'shani kiriting. Menyudan «Tashkilot» ni oching va «Qo'shish» ni bosing.",
        "Внесите организацию, с которой заключается договор (заказчика). Откройте в меню «Организация» и нажмите «Добавить».",
      ],
      ordered: true,
      items: [
        [
          "«INN» maydoniga tashkilotning 9 xonali INN raqamini yozing va yonidagi lupa tugmasini bosing.",
          "Введите 9-значный ИНН организации в поле ИНН и нажмите кнопку с лупой рядом.",
        ],
        [
          "«Nomi», «Manzil» va «Direktor» o'zi to'ladi — to'g'riligini tekshiring.",
          "«Название», «Адрес» и «Директор» заполнятся сами — проверьте их.",
        ],
        ["«Bank nomi» va «MFO» ni yozing.", "Введите «Название банка» и «МФО»."],
        [
          "«Hisob raqami» ostidagi «Qo'shish» tugmasini bosing va chiqqan yangi qatorga tashkilotning hisob raqamini yozing. G'azna hisob raqami bo'lsa — «G'azna hisob raqami» ga qo'shing.",
          "Нажмите «Добавить» под «Номер счета» и введите счёт организации в появившуюся строку. Если есть казначейский счёт — добавьте его в «Казначейский счёт».",
        ],
        ["«Saqlash» ni bosing.", "Нажмите «Сохранить»."],
      ],
      warn: [
        "Avval INN bo'yicha qidiring, keyin bank ma'lumotlarini yozing yoki tekshiring: qidiruv «Bank nomi» va «MFO» ni qaytadan yozadi (Didox ulangan bo'lsa o'zi to'ldiradi, aks holda bo'shatib qo'yadi).",
        "Сначала выполните поиск по ИНН, потом вводите или проверяйте банковские данные: поиск перезаписывает «Название банка» и «МФО» (при подключённом Didox заполняет их, иначе очищает).",
      ],
      tip: [
        "«Tashkilot topilmadi» chiqsa — ma'lumotlarni qo'lda yozing.",
        "Если организация не найдена — введите данные вручную.",
      ],
      shots: [
        shot("06-tashkilot.webp", [
          "INN bo'yicha qidiruvdan keyin to'lgan maydonlar",
          "Поля после поиска по ИНН",
        ]),
      ],
    },
    // 7
    {
      title: ["Shartnoma: asosiy ma'lumotlar", "Договор: основные данные"],
      body: [
        "Menyudan «Shartnomalar ro'yhati» ni oching va «Qo'shish» tugmasini bosing. «Shartnomani kiritish» sahifasining yuqori qismini to'ldiring:",
        "Откройте в меню «Список договоров» и нажмите «Добавить». Заполните верхнюю часть страницы ввода договора:",
      ],
      items: [
        [
          "«Shartnoma raqami» — faqat raqam (masalan, 125). Harf va «/» belgisi qabul qilinmaydi.",
          "«Номер договора» — только цифры (например, 125). Буквы и знак «/» не принимаются.",
        ],
        [
          "«Shartnoma sanasi» va «Amal qilish muddati».",
          "«Дата договора» и «Срок действия».",
        ],
        [
          "«Boshlanish sana» va «Tugash sana» — tadbir kunlari; kerak bo'lsa «Boshlanish vaqti» va «Tugash vaqti».",
          "«Дата начала» и «Дата окончания» — дни мероприятия; при необходимости — время начала и окончания.",
        ],
        [
          "«Chegirma (%)» — chegirma bo'lmasa, 0 qoladi.",
          "«Скидка (%)» — если скидки нет, остаётся 0.",
        ],
        ["«Manzil» — tadbir manzili.", "«Адрес» — адрес мероприятия."],
        [
          "«Shablon» — shartnoma matni turi: «Ko'p kunlik», «1 kunlik», «Ko'p kunlik (soat bilan)», «1 kunlik (soat bilan)», «Oylar oralig'ida».",
          "«Шаблон» — вид текста договора: многодневный, однодневный, многодневный (с часами), однодневный (с часами), на период в месяцах.",
        ],
      ],
      tip: [
        "Tadbirlarning manzili yoki sanasi har xil bo'lsa, «Manzil» va «Sana» belgilarini qo'ying — har bir topshiriq qatorida alohida maydon chiqadi.",
        "Если у мероприятий разные адреса или даты, отметьте флажки «Адрес» и «Дата» — в каждой строке задания появится отдельное поле.",
      ],
      shots: [
        shot("07-shartnoma.webp", [
          "Shartnomaning asosiy ma'lumotlari",
          "Основные данные договора",
        ]),
      ],
    },
    // 8
    {
      title: ["Shartnoma: buyurtmachini tanlash", "Договор: выбор заказчика"],
      body: [
        "«To'lovchi tafsilotlari» bo'limidagi «Tashkilotni tanlash» tugmasini bosing. Ochilgan «Buyurtmachi» oynasida tashkilotni qidiring («Nomlar bo'yicha qidiruv») va uning qatoriga bosing — bank, MFO, INN va hisob raqami o'zi to'ladi.",
        "Нажмите «Выбрать организацию» в разделе «Данные плательщика». В окне «Заказчик» найдите организацию и нажмите на её строку — банк, МФО, ИНН и счёт заполнятся сами.",
      ],
      tip: [
        "Chapdagi «Qabul qiluvchi tafsilotlari» — sizning rekvizitlaringiz (2–4-bosqichlar). Bo'sh bo'lsa, rekvizitlar va tanlangan hisob raqamni tekshiring.",
        "Слева «Данные получателя» — ваши реквизиты (шаги 2–4). Если пусто, проверьте реквизиты и выбранный счёт.",
      ],
      warn: [
        "Kerakli tashkilot ro'yxatda bo'lmasa, oynadagi «Qo'shish» bilan shu yerning o'zida qo'shing — saqlangach u o'zi tanlanadi. Buyurtmachi tanlanmasa, shartnoma saqlanmaydi.",
        "Если нужной организации нет в списке, добавьте её прямо здесь кнопкой «Добавить» в окне — после сохранения она выберется сама. Без заказчика договор не сохранится.",
      ],
      shots: [
        shot("08-buyurtmachi.webp", [
          "«Buyurtmachi» oynasi: qidiruv va tanlanadigan qator",
          "Окно «Заказчик»: поиск и строка для выбора",
        ]),
      ],
    },
    // 9
    {
      title: ["Shartnoma: topshiriqlar", "Договор: задания"],
      body: [
        "Pastdagi topshiriq qatorini to'ldiring. Summani dastur o'zi hisoblaydi: xodimlar soni × soat × BXM stavkasi.",
        "Заполните строку задания внизу. Сумму программа считает сама: число сотрудников × часы × ставка БХМ.",
      ],
      items: [
        [
          "«Batalon nomi» — tadbirni bajaradigan quyi tuzilma (5-bosqich).",
          "«Название батальона» — подразделение-исполнитель (шаг 5).",
        ],
        [
          "«BXM tanlang» — soatbay stavka. Ro'yxatni markaziy admin yuritadi.",
          "«Выберите БХМ» — почасовая ставка. Список ведёт центральный администратор.",
        ],
        ["«Xodimlar soni» — nechta xodim jalb qilinadi.", "«Количество сотрудников» — сколько сотрудников привлекается."],
        ["«Tadbir vaqti» — necha soat.", "«Время мероприятия» — сколько часов."],
        [
          "«Chegirma» va «Summa» o'zi hisoblanadi, «Izoh» — ixtiyoriy.",
          "«Скидка» и «Сумма» считаются сами, «Комментарий» — по желанию.",
        ],
        [
          "Yana topshiriq kerak bo'lsa, pastdagi «Qo'shish» yangi qator qo'shadi. Ortiqcha qatorni savat belgisi bilan o'chiring.",
          "Если нужно ещё задание, кнопка «Добавить» внизу добавит строку. Лишнюю строку удалите значком корзины.",
        ],
      ],
      tip: [
        "Misol: 10 xodim × 8 soat × 30 800 so'm = 2 464 000 so'm.",
        "Пример: 10 сотрудников × 8 часов × 30 800 сум = 2 464 000 сум.",
      ],
      warn: [
        "«Batalon nomi» ro'yxati bo'sh bo'lsa — 5-bosqichni bajaring. «BXM tanlang» bo'sh bo'lsa — markaziy adminga murojaat qiling.",
        "Если список батальонов пуст — выполните шаг 5. Если пуст список БХМ — обратитесь к центральному администратору.",
      ],
      shots: [
        shot("09-topshiriq.webp", [
          "To'ldirilgan topshiriq qatori va hisoblangan summa",
          "Заполненная строка задания и рассчитанная сумма",
        ]),
      ],
    },
    // 10
    {
      title: ["Shartnomani saqlash", "Сохранение договора"],
      body: [
        "«Jami summa» ni tekshiring va «Saqlash» ni bosing. «Muvaffaqiyatli kiritildi» xabari chiqadi va shartnoma hujjati ochiladi — dastur uning PDF faylini o'zi tayyorlaydi.",
        "Проверьте «Итоговую сумму» и нажмите «Сохранить». Появится сообщение об успешном добавлении и откроется документ договора — программа сама подготовит его PDF.",
      ],
      items: [
        [
          "«Yuristga jo'natish» — shartnomani yurist tekshiradi.",
          "«Отправить юристу» — договор проверяет юрист.",
        ],
        [
          "«E-IMZO bilan tasdiqlash» — rahbar tasdig'i.",
          "«Подтвердить через E-IMZO» — подтверждение руководителя.",
        ],
        [
          "«PDF» va «Chop etish» — hujjatni yuklab olish yoki chop etish.",
          "«PDF» и «Печать» — скачать или распечатать документ.",
        ],
      ],
      warn: [
        "Xato chiqsa, xabarda maydon nomi yoziladi. Masalan, «Hujjat raqami» — bu «Shartnoma raqami» maydoni.",
        "При ошибке в сообщении указывается поле. Например, «Hujjat raqami» — это поле «Номер договора».",
      ],
      shots: [
        shot("10-saqlash.webp", [
          "Jami summa va «Saqlash» tugmasi",
          "Итоговая сумма и кнопка «Сохранить»",
        ]),
      ],
    },
  ],
  outro: [
    "Tayyor! Keyingi shartnomalar uchun faqat 7–10-bosqichlar kerak. Hodimlarni «Hodimlar ro'yhati» ga kiritib, keyin topshiriqlarga biriktirasiz — bu shartnoma tuzish uchun shart emas.",
    "Готово! Для следующих договоров нужны только шаги 7–10. Сотрудников вносят в «Список сотрудников» и затем закрепляют за заданиями — для создания договора это не обязательно.",
  ],
};
