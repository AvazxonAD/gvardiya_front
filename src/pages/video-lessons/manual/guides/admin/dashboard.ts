import { shotIn, type SectionGuide } from "../../types";

const shot = shotIn("admin/dashboard");

/**
 * Super-admin dashboardi (pages/admin/dashboard): respublika bo'yicha
 * umumiy ko'rsatkichlar, faqat ko'rish. Davr — shartnoma sanasi, bekor
 * qilingan shartnomalar kirmaydi (backend: admin/dashboard).
 */
export const adminDashboard: SectionGuide = {
  intro: [
    "Respublika bo'yicha umumiy ko'rinish (faqat ko'rish): barcha viloyatlarning shartnomalari, to'langan va qarzdor shartnomalar, to'lov muddati bo'yicha qarz, viloyatlar xaritasi, kirim bo'lgan pulning taqsimoti va qizil chegaraga tushgan xodimlar. Hamma ko'rsatkich dashboard davri bo'yicha — shartnoma sanasiga qarab; bekor qilingan shartnomalar kirmaydi.",
    "Общая картина по республике (только просмотр): договоры всех областей, оплаченные и с задолженностью, долг по срокам оплаты, карта областей, распределение поступивших средств и сотрудники в красной зоне. Все показатели — за период дашборда, по дате договора; отменённые договоры не учитываются.",
  ],
  steps: [
    {
      title: ["Davr va ko'rsatkichlar", "Период и показатели"],
      body: [
        "Yuqori paneldagi ikki sana — dashboard davri. Odatda yil boshidan joriy oy oxirigacha turadi. Sanani yozing yoki kalendar belgisini bosing — ko'rsatkichlar o'zi yangilanadi. Uchta kartochkada «Soni» va «Summasi»:",
        "Две даты на верхней панели — период дашборда. По умолчанию — с начала года до конца текущего месяца. Введите дату или нажмите значок календаря — показатели обновятся сами. В трёх карточках «Количество» и «Сумма»:",
      ],
      items: [
        ["«Jami shartnomalar» — davrdagi barcha shartnomalar.", "«Всего договоров» — все договоры за период."],
        [
          "«Puli to'lab berilgan shartnomalar» — to'liq to'langan shartnomalar.",
          "«Оплаченные договоры» — полностью оплаченные договоры.",
        ],
        [
          "«Qarzdorligi bor shartnomalar» — hali to'liq to'lanmaganlar.",
          "«Договоры с задолженностью» — ещё не оплаченные полностью.",
        ],
        [
          "Ostidagi uchta katak — qarz to'lov muddati bo'yicha: «Muddati kelmagan», «Kechiktirilgan», «Muddati o'tgan» (soni va qarz summasi).",
          "Три плашки ниже — долг по сроку оплаты: «Срок не наступил», «Просрочен платёж», «Просрочено» (количество и сумма долга).",
        ],
      ],
      tip: [
        "Kartochkalardagi «Summasi» — shartnomalarning to'liq summasi (to'langan yoki qolgan qarz emas); qarz summasi pastdagi kataklarda. To'lov muddati — tadbirdan 3 kun oldin. Dashboard davri boshqa sahifalarning sanasiga ta'sir qilmaydi.",
        "«Сумма» в карточках — полная сумма договоров (не оплачено и не остаток долга); сумма долга — в плашках ниже. Срок оплаты — за 3 дня до мероприятия. Период дашборда не меняет даты на других страницах.",
      ],
      shots: [shot("01-korsatkichlar.webp", ["Davr, kartochkalar va qarz kataklari", "Период, карточки и плашки долга"])],
    },
    {
      title: ["Shartnomalar ro'yxati", "Список договоров"],
      body: [
        "Kartochkadagi «Batafsil» yoki qarz katagini bossangiz, shu shartnomalar ro'yxati ochiladi (sarlavha ostida «Jami: ... ta shartnoma»):",
        "Нажмите «Подробнее» в карточке или плашку долга — откроется список этих договоров (под заголовком — «Всего: ... договоров»):",
      ],
      items: [
        [
          "Ustunlar: «Hujjat raqami», «Sana», «Tashkilot», «Foydalanuvchi», «Viloyat», «Shartnoma summasi», «To'langan», «Qarz» va «To'lov muddati» (holat belgisi va «Tadbir:» sanasi).",
          "Столбцы: номер документа, дата, организация, пользователь, регион, сумма договора, оплачено, долг и срок оплаты (статус и дата мероприятия).",
        ],
        [
          "Bir sahifada 15 ta — «Oldingi» / «Keyingi».",
          "На странице 15 строк — «Предыдущая» / «Следующая».",
        ],
        [
          "«⋮» — ro'yxatning hammasini Excel yoki PDF qilib yuklab olish.",
          "«⋮» — выгрузить весь список в Excel или PDF.",
        ],
      ],
      shots: [shot("02-royxat.webp", ["«Qarzdorligi bor shartnomalar» ro'yxati", "Список договоров с задолженностью"])],
    },
    {
      title: ["Viloyatlar xaritasi", "Карта областей"],
      body: [
        "«Markazlashgan tizim monitoringi» — viloyatlar kesimida. Viloyat ustiga sichqoncha olib borsangiz, uning shartnomalari chiqadi: «Jami shartnomalar», «Puli to'lab berilgan», «Qarzdorligi bor» (soni va summasi).",
        "«Мониторинг централизованной системы» — в разрезе областей. При наведении на область показываются её договоры: всего, оплаченные и с задолженностью (количество и сумма).",
      ],
      items: [
        [
          "Viloyatni bossangiz, butun dashboard — kartochkalar, qarz kataklari, taqsimot va qizil chegara — shu viloyat bo'yicha ko'rsatiladi; xaritaning o'zi esa barcha viloyatlarni ko'rsatib turadi.",
          "Нажмите на область — весь дашборд (карточки, плашки долга, распределение и красная зона) покажет только её; сама карта по-прежнему показывает все области.",
        ],
        [
          "Tanlovni bekor qilish — sarlavha yonidagi viloyat nomi tugmasidagi «×» ni yoki shu viloyatni yana bosing.",
          "Сбросить выбор — «×» на кнопке с названием области рядом с заголовком или повторное нажатие на ту же область.",
        ],
      ],
      shots: [shot("03-xarita.webp", ["Xaritada viloyat tanlangan", "Область выбрана на карте"])],
    },
    {
      title: ["Kirim bo'lgan pulning taqsimoti", "Распределение поступивших средств"],
      body: [
        "Diagramma to'liq to'langan shartnomalar puli («Jami kirim», markazda) qayerga tarqatilganini ko'rsatadi: «Moddiy bazaga», «Hamkor tashkilotlar», «Xodimlar uchun premiya» va «Qolgan». Bo'lak ustiga sichqoncha olib borsangiz, summasi markazda chiqadi; pastdagi yozuvni bossangiz, bo'lak yashiriladi.",
        "Диаграмма показывает, куда распределены деньги полностью оплаченных договоров («Всего поступило» — в центре): на мат. базу, партнёрским организациям, премии сотрудникам и остаток. При наведении на сегмент его сумма появится в центре; нажатие на подпись внизу скрывает сегмент.",
      ],
      items: [
        [
          "«Batafsil» — «Kirim bo'lgan pulning taqsimoti — viloyatlar bo'yicha»: yuqorida jami kataklar, jadvalda har viloyat — «Jami kirim», «Moddiy baza (75%)», «Hamkor tashkilotlar», «Xodimlar premiyasi (25%)», «Jami tarqatilgan» va «Qolgan».",
          "«Подробнее» — распределение по регионам: вверху итоговые плашки, в таблице по каждой области — всего поступило, мат. база (75%), партнёрские организации, премия сотрудникам (25%), всего распределено и остаток.",
        ],
        [
          "Oynadagi «⋮» — jadvalni Excel yoki PDF qilib yuklab olish; «Yopish» — oynani yopish.",
          "«⋮» в окне — выгрузить таблицу в Excel или PDF; «Закрыть» — закрыть окно.",
        ],
      ],
      tip: [
        "Foizlar «Jami kirim» dan emas, tarqatilgan pul (xodimlarga to'lov va hamkorlarga chiqim) yig'indisidan olinadi. Viloyatlar jadvali har doim barcha viloyatlar bo'yicha — xaritadagi tanlovga bog'liq emas.",
        "Проценты берутся не от «Всего поступило», а от суммы распределённого (выплаты сотрудникам и расходы партнёрам). Таблица по регионам всегда по всем областям — от выбора на карте не зависит.",
      ],
      shots: [shot("04-taqsimot.webp", ["Taqsimot — viloyatlar bo'yicha", "Распределение по регионам"])],
    },
    {
      title: ["Qizil chegaraga tushgan xodimlar", "Сотрудники в красной зоне"],
      body: [
        "Dastur o'zi aniqlaydi: xodimning davrda olgan premiya summasi o'z batalonidagi o'rtacha summadan ikki baravar va undan ko'p bo'lsa, u «qizil chegara» ga tushadi. Kartochkada — soni («... xodim aniqlandi»).",
        "Программа выявляет сама: если премия сотрудника за период вдвое и более превышает среднюю по его батальону, он попадает в «красную зону». В карточке — их число.",
      ],
      items: [
        [
          "«Ro'yxatni ko'rsatish» — xodimlar jadvali: «Xodim ismi», «Batalon», «Xodimlar soni», «Batalon summasi», «Viloyat», «Xodimning olgan summasi», «O'rtacha», «Chegara (×2)» va «Necha marta».",
          "«Показать список» — таблица сотрудников: Ф.И.О., батальон, число сотрудников, сумма батальона, регион, полученная сумма, среднее, порог (×2) и во сколько раз.",
        ],
        [
          "«⋮» — ro'yxatni Excel yoki PDF qilib yuklab olish.",
          "«⋮» — выгрузить список в Excel или PDF.",
        ],
      ],
      shots: [shot("05-qizil.webp", ["«Qizil chegaraga tushgan xodimlar» ro'yxati", "Список сотрудников в красной зоне"])],
    },
    {
      title: ["Ommaviy tadbirlar hisoboti", "Отчёт по массовым мероприятиям"],
      body: [
        "Yuqori paneldagi «Ommaviy tadbirlar hisoboti:» yonidagi «Excel» yoki «PDF» tugmasi — dashboard davri bo'yicha hisobotni viloyatlar kesimida yuklab oladi (hisobot tili — dastur tili).",
        "Кнопки «Excel» или «PDF» рядом с «Отчёт по массовым мероприятиям» на верхней панели скачивают отчёт за период дашборда в разрезе областей (язык отчёта — язык программы).",
      ],
      tip: [
        "Hisobot shakli keng — PDF A3 varaqda tayyorlanadi. Davr noto'g'ri bo'lsa, «Sana oralig'i noto'g'ri» xabari chiqadi.",
        "Форма отчёта широкая — PDF готовится на листе A3. При неверном периоде появится сообщение «Неверный период».",
      ],
    },
  ],
};
