import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("moddiy-baza");

/**
 * "Moddiy baza": monitoring (kirim — to'langan "Chiqim F.I.Sh." hujjatlaridagi
 * 75% ulush), shu mablag'dan chiqimlar va muddatli harbiy xizmatchilar
 * ishtirokidagi pul (faqat ko'rish).
 */
export const moddiyBaza: SectionGuide = {
  intro: [
    "Moddiy bazaga ajratilgan pul va undan qilingan chiqimlar. «Hodimlarning pul hisob-kitobi» hujjatlaridagi «Moddiy baza (75%)» ulushi shu yerga kirim bo'lib tushadi — faqat «To'landi» deb belgilangan hujjatlardan. Bo'limda uchta sahifa bor: «Monitoring», «Chiqimlar» va «Muddatli harbiy xizmatchilar».",
    "Деньги, выделенные на материальную базу, и расходы из них. Доля «Материальная база (75%)» из документов «Расчёты с сотрудниками» поступает сюда приходом — только из документов, отмеченных как оплаченные. В разделе три страницы: «Мониторинг», «Расходы» и «Военнослужащие срочной службы».",
  ],
  need: [
    [
      "«Hodimlarning pul hisob-kitobi» da to'lov hujjati tuzilgan va «To'landi» deb belgilangan bo'lishi kerak — shundagina moddiy bazaga kirim tushadi",
      "В «Расчётах с сотрудниками» должен быть документ выплаты, отмеченный как оплаченный, — только тогда на мат. базу поступает приход",
    ],
    [
      "Yuqori panelda kerakli hisob raqam tanlangan bo'lsin: «Monitoring» va «Chiqimlar» shu hisob raqam bo'yicha ko'rsatiladi",
      "На верхней панели выберите нужный счёт: «Мониторинг» и «Расходы» показываются по нему",
    ],
  ],
  steps: [
    {
      title: ["Monitoring: mablag' harakati", "Мониторинг: движение средств"],
      body: [
        "Chap menyuda «Moddiy baza» ni bosing — ostida uchta sahifa ochiladi. «Monitoring» da yuqoridagi ikki sana — davr. To'rtta katakda:",
        "Нажмите в левом меню «Материальная база» — под ним откроются три страницы. В «Мониторинге» две даты вверху — период. В четырёх плашках:",
      ],
      items: [
        [
          "«Boshlang'ich qoldiq» — davr boshigacha ajratilgan va hali sarflanmagan pul.",
          "«Начальный остаток» — деньги, выделенные до начала периода и ещё не израсходованные.",
        ],
        [
          "«Moddiy bazaga ajratildi (kirim)» — davrda to'langan hujjatlardan tushgan ulush.",
          "«Выделено на мат. базу (приход)» — доля из документов, оплаченных за период.",
        ],
        ["«Chiqim» — davrdagi chiqimlar.", "«Расход» — расходы за период."],
        [
          "«Yakuniy qoldiq» — davr oxiridagi qoldiq: boshlang'ich qoldiq + kirim − chiqim.",
          "«Конечный остаток» — остаток на конец периода: начальный остаток + приход − расход.",
        ],
        [
          "Pastda ikkita jadval. «Moddiy bazaga ajratildi (kirim)» — har bir to'langan hujjat: «Sana», «Qabul qiluvchi» (batalon), «Hujjat summasi» va undan «Moddiy bazaga». «Chiqimlar» — «Chiqimlar» sahifasida kiritilgan xarajatlar. Har jadval ostida «Jami».",
          "Ниже две таблицы. «Выделено на мат. базу (приход)» — каждый оплаченный документ: дата, получатель (батальон), сумма документа и из неё «На мат. базу». «Расходы» — расходы, внесённые на странице «Расходы». Под каждой таблицей — «Итого».",
        ],
      ],
      tip: [
        "To'lanmagan hujjatlar kirimga qo'shilmaydi — kataklar ostida «Davrdagi to'lanmagan ... ta hujjat ... kirimga qo'shilmagan» degan izoh chiqadi. Hujjat «Hodimlarning pul hisob-kitobi» da «To'landi» deb belgilangach, kirimga o'zi qo'shiladi. Qoldiq manfiy bo'lsa (chiqim kirimdan oldin yozilgan), qizil rangda ko'rinadi.",
        "Неоплаченные документы в приход не входят — под плашками появится пояснение о неоплаченных документах за период. После отметки об оплате в «Расчётах с сотрудниками» документ сам войдёт в приход. Отрицательный остаток (расход записан раньше прихода) показывается красным.",
      ],
      shots: [shot("01-monitoring.webp", ["«Monitoring»: qoldiq, kirim va chiqim", "«Мониторинг»: остатки, приход и расход"])],
    },
    {
      title: ["Chiqimlar ro'yxati", "Список расходов"],
      body: [
        "«Moddiy baza» → «Chiqimlar» — moddiy baza mablag'idan qilingan xarajatlar. Sanalar — hujjat sanasi oralig'i, qidiruv — «№ yoki izoh». Pastdagi «Davr bo'yicha chiqim» — davrdagi barcha chiqimlar yig'indisi.",
        "«Материальная база» → «Расходы» — расходы из средств мат. базы. Даты — период по дате документа, поиск — по номеру или комментарию. «Расход за период» внизу — сумма всех расходов за период.",
      ],
      items: [
        ["«Qo'shish» — yangi chiqim kiritish (keyingi bosqich).", "«Добавить» — внести новый расход (следующий шаг)."],
        [
          "Qatordagi qalam — «Tahrirlash», savat — «O'chirish» (tasdiq so'raydi).",
          "Карандаш в строке — «Редактировать», корзина — «Удалить» (с подтверждением).",
        ],
        ["«⋮» — ro'yxatni Excel yoki PDF qilib yuklab olish.", "«⋮» — выгрузить список в Excel или PDF."],
      ],
      tip: [
        "«Davr bo'yicha chiqim» qidiruvga bog'liq emas — qidiruv faqat jadvaldagi qatorlarni filtrlaydi.",
        "«Расход за период» не зависит от поиска — поиск только фильтрует строки таблицы.",
      ],
      shots: [shot("02-chiqimlar.webp", ["«Chiqimlar» ro'yxati va «Qo'shish» tugmasi", "Список расходов и кнопка «Добавить»"])],
    },
    {
      title: ["Yangi chiqim kiritish", "Новый расход"],
      body: [
        "Oynada shu kungacha qancha pul ajratilgani, sarflangani va qolgani ko'rinib turadi — chiqimni qoldiqqa qarab kiriting.",
        "В окне видно, сколько денег выделено, израсходовано и осталось на эту дату, — вносите расход с учётом остатка.",
      ],
      ordered: true,
      items: [
        [
          "«Qo'shish» ni bosing — «Yangi chiqim» oynasi ochiladi.",
          "Нажмите «Добавить» — откроется окно «Новый расход».",
        ],
        [
          "«Hujjat raqami» va «Hujjat sanasi» ni kiriting (sana bugungi kun bo'lib turadi).",
          "Введите «Номер документа» и «Дата документа» (по умолчанию — сегодня).",
        ],
        [
          "Sana ostida «... holatiga moddiy baza mablag'i» bloki chiqadi: «Ajratilgan (kirim)», «Sarflangan (chiqim)» va «Qoldiq» — hujjat sanasigacha (shu kun ham).",
          "Под датой появится блок «Средства материальной базы на ...»: выделено (приход), израсходовано (расход) и остаток — по дату документа включительно.",
        ],
        [
          "«Summa» ni yozing — ostida «Bu chiqimdan keyin qoldiq» ko'rinadi.",
          "Введите «Сумма» — под полем появится «Остаток после этого расхода».",
        ],
        [
          "Kerak bo'lsa «Izoh» yozing va «Saqlash» ni bosing — «Muvaffaqiyatli qo'shildi».",
          "При необходимости заполните «Комментарий» и нажмите «Сохранить».",
        ],
      ],
      warn: [
        "Qoldiq yetmasa ham chiqim saqlanadi — faqat qizil «qoldiq yetarli emas» ogohlantirishi chiqadi. Summani tekshirib kiriting. Hujjat raqami, sana va noldan katta summa majburiy.",
        "Даже при нехватке остатка расход сохранится — появится только красное предупреждение «остатка недостаточно». Проверяйте сумму. Номер документа, дата и сумма больше нуля обязательны.",
      ],
      tip: [
        "Tahrirlashda qoldiq shu chiqimning o'zisiz hisoblanadi — summani o'zgartirsangiz, «Bu chiqimdan keyin qoldiq» yangi summa bo'yicha chiqadi.",
        "При редактировании остаток считается без самого этого расхода — при изменении суммы «Остаток после этого расхода» пересчитается по новой сумме.",
      ],
      shots: [shot("03-yangi-chiqim.webp", ["«Yangi chiqim» oynasi va qoldiq", "Окно «Новый расход» и остаток"])],
    },
    {
      title: ["Muddatli harbiy xizmatchilar", "Военнослужащие срочной службы"],
      body: [
        "«Moddiy baza» → «Muddatli harbiy xizmatchilar» — muddatli xizmatchilar ishtirok etgan tadbirlardan yig'ilgan pul (faqat ko'rish). Ularga «Hodimlarning pul hisob-kitobi» orqali to'lov qilinmaydi, shuning uchun summa — topshiriqqa biriktirilgan soatlari bo'yicha topshiriq summasidagi ulushi.",
        "«Материальная база» → «Военнослужащие срочной службы» — деньги за мероприятия с участием срочнослужащих (только просмотр). Им не платят через «Расчёты с сотрудниками», поэтому сумма — их доля в сумме задания по закреплённым часам.",
      ],
      items: [
        [
          "Kataklar: «Jami (ishtirok puli)», «Shundan to'langan shartnomalardan», «To'lanmagan shartnomalarda» (yonida — shartnomalar soni), «Tadbirlar soni», «Jami soat».",
          "Плашки: «Итого (за участие)», из них по оплаченным договорам, в неоплаченных договорах (рядом — число договоров), число мероприятий, всего часов.",
        ],
        [
          "«Batalonlar kesimida» — har batalonning tadbirlari, soati, summasi va ulushi. Qatorni bossangiz, pastdagi ro'yxat shu batalon bo'yicha filtrlanadi (qayta bossangiz — bekor bo'ladi).",
          "«В разрезе батальонов» — мероприятия, часы, сумма и доля каждого батальона. Нажмите на строку — список ниже отфильтруется по батальону (повторное нажатие — отмена).",
        ],
        [
          "«Tadbirlar ro'yxati» — shartnoma, tashkilot, tadbir manzili va sanasi, batalon, soat, summa, «Shartnoma bo'yicha kirim» («Pul tushgan», «Qisman tushgan», «Pul tushmagan») va «Qarzdorlik».",
          "«Список мероприятий» — договор, организация, место и дата мероприятия, батальон, часы, сумма, поступления по договору (поступили / частично / не поступили) и задолженность.",
        ],
        [
          "Filtrlar: qidiruv («№, tashkilot, manzil yoki batalon»), «Barcha batalonlar» va «Barcha shartnomalar» (to'langan / to'lanmagan). «⋮» — ro'yxatni yoki batalonlar kesimini Excel yoki PDF qilib yuklab olish.",
          "Фильтры: поиск (№, организация, адрес или батальон), «Все батальоны» и «Все договоры» (оплаченные / неоплаченные). «⋮» — выгрузить список или разрез по батальонам в Excel или PDF.",
        ],
      ],
      tip: [
        "Bu sahifada davr — shartnoma sanasi bo'yicha, hisob raqam tanlovi ta'sir qilmaydi (barcha hisob raqamlar). Yig'indilar Dashboarddagi «Muddatli harbiy xizmatchilar kesimida» diagrammasi bilan bir xil. Xodim muddatli xizmatchi ekani «Hodimlar ro'yhati» da «Muddatli harbiy xizmatchi» belgisi bilan belgilanadi.",
        "Здесь период — по дате договора, выбор счёта не влияет (все счета). Итоги совпадают с диаграммой «В разрезе военнослужащих срочной службы» на дашборде. Срочнослужащий отмечается в «Списке сотрудников» признаком «Военнослужащий срочной службы».",
      ],
      warn: [
        "Kataklar va «Batalonlar kesimida» faqat davrga bog'liq — qidiruv va filtrlar faqat pastdagi ro'yxatni o'zgartiradi.",
        "Плашки и «В разрезе батальонов» зависят только от периода — поиск и фильтры меняют только список ниже.",
      ],
      shots: [shot("04-muddatli.webp", ["«Muddatli harbiy xizmatchilar» sahifasi", "Страница «Военнослужащие срочной службы»"])],
    },
  ],
};
