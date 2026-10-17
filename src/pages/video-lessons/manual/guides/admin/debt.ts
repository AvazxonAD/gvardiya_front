import { shotIn, type SectionGuide } from "../../types";

const shot = shotIn("admin/debt");

/**
 * Super-admin: "Qarzdorlik" (pages/admin/overview, scope "admin") —
 * respublika bo'yicha qarzdorlik tahlili, viloyat bo'yicha filtr bilan.
 */
export const adminDebt: SectionGuide = {
  intro: [
    "Respublika bo'yicha qarzdorlik tahlili: qancha qarz qolgan, qanchasining muddati o'tgan va pul qaysi viloyat va tashkilotlarda qotib qolgan. Viloyat qatorini bossangiz, butun sahifa shu viloyat bo'yicha ko'rsatiladi.",
    "Анализ задолженности по республике: сколько долга осталось, какая часть просрочена и в каких областях и организациях застряли деньги. Нажмите строку области — вся страница покажет только её.",
  ],
  steps: [
    {
      title: ["Davr va qarz kartochkalari", "Период и карточки долга"],
      body: [
        "O'ng yuqoridagi ikki sana — shartnoma sanasi oralig'i (odatda 2020-yil 1-yanvardan bugungacha), «Yangilash» — qayta yuklash. To'rtta kartochka:",
        "Две даты справа вверху — период по дате договора (по умолчанию с 1 января 2020 года по сегодня), «Обновить» — перезагрузить. Четыре карточки:",
      ],
      items: [
        [
          "«Jami qarz» — qolgan qarz; ostida qarzdor shartnomalar soni va undirilgan foiz.",
          "«Общий долг» — остаток долга; ниже — число договоров с долгом и процент взыскания.",
        ],
        [
          "«Muddati kelmagan», «Kechiktirilgan», «Muddati o'tgan» — qarz to'lov muddati bo'yicha (summa va shartnomalar soni).",
          "«Срок не наступил», «Просрочен платёж», «Просрочено» — долг по сроку оплаты (сумма и число договоров).",
        ],
        [
          "Kartochkani bossangiz, shartnomalar ro'yxati ochiladi: hujjat raqami, sana, tashkilot, foydalanuvchi, viloyat, summa, to'langan, qarz va to'lov muddati; «⋮» — Excel yoki PDF.",
          "Нажмите на карточку — откроется список договоров: номер, дата, организация, пользователь, регион, сумма, оплачено, долг и срок оплаты; «⋮» — Excel или PDF.",
        ],
      ],
      tip: [
        "To'lov muddati — tadbirdan 3 kun oldin. Sahifa sanalari dashboard davridan alohida va har ochilganda yana 2020-yildan boshlanadi.",
        "Срок оплаты — за 3 дня до мероприятия. Даты страницы не связаны с периодом дашборда и при каждом открытии снова начинаются с 2020 года.",
      ],
      shots: [shot("01-kartochkalar.webp", ["Qarz kartochkalari va diagrammalar", "Карточки долга и диаграммы"])],
    },
    {
      title: ["Diagrammalar", "Диаграммы"],
      body: ["Ikkita diagramma qarzning qanchalik eskirganini ko'rsatadi:", "Две диаграммы показывают, насколько долг старый:"],
      items: [
        [
          "«Muddati o'tgan qarz yoshi» — tadbir boshlanganidan beri necha kun o'tgan: «30 kungacha», «31–90 kun», «91–180 kun», «181–365 kun», «1 yildan ko'p» (har birida shartnomalar soni va ulushi).",
          "«Возраст просроченного долга» — сколько дней прошло с начала мероприятия: до 30, 31–90, 91–180, 181–365 дней, более года (в каждой — число договоров и доля).",
        ],
        [
          "«Oylar bo'yicha qolgan qarz» — shartnoma oyi bo'yicha hali to'lanmagan summa (oxirgi 24 oy). Ustun ustiga sichqoncha olib borsangiz: «Qolgan qarz», «Shartnomalar» va «Undirilgan» foizi.",
          "«Остаток долга по месяцам» — неоплаченная сумма по месяцу договора (последние 24 месяца). При наведении на столбец: остаток долга, сумма договоров и процент взыскания.",
        ],
      ],
    },
    {
      title: ["Viloyatlar kesimida", "По регионам"],
      body: [
        "Jadvalda har bir viloyat: «Shartnoma summasi», «Undirilgan» (foiz), «Qarz», «Muddati kelmagan», «Kechiktirilgan», «Muddati o'tgan». Odatda qarzi ko'p viloyat birinchi turadi; ustun nomini bossangiz, tartib o'zgaradi.",
        "В таблице по каждой области: сумма договоров, взыскано (процент), долг, срок не наступил, просрочен платёж, просрочено. По умолчанию первой идёт область с наибольшим долгом; нажатие на заголовок меняет сортировку.",
      ],
      items: [
        [
          "Qatorni bossangiz, kartochkalar, diagrammalar va tashkilotlar shu viloyat bo'yicha ko'rsatiladi. Tepada viloyat nomi tugmasi chiqadi — undagi «×» filtrni bekor qiladi.",
          "Нажмите на строку — карточки, диаграммы и организации покажут эту область. Вверху появится кнопка с названием области — «×» на ней снимает фильтр.",
        ],
        [
          "Davrda shartnomasi yo'q viloyatlar jadval ostida bitta qatorda: «Yana ... ta viloyatda bu davrda shartnoma yo'q» (nomlari — sichqoncha ustida).",
          "Области без договоров за период — одной строкой под таблицей: «Ещё в ... регионах за период договоров нет» (названия — при наведении).",
        ],
        ["«⋮» — jadvalni Excel yoki PDF qilib yuklab olish.", "«⋮» — выгрузить таблицу в Excel или PDF."],
      ],
      shots: [shot("02-viloyatlar.webp", ["«Viloyatlar kesimida» jadvali", "Таблица «По регионам»"])],
    },
    {
      title: ["Qarzdor tashkilotlar", "Организации-должники"],
      body: [
        "Eng uzoq vaqt to'lamayotgan tashkilotlar birinchi turadi. Qidiruv — «Nomi yoki STIR (INN)». Ustunlar: «Tashkilot», «Viloyat», «Shartnoma», «Qarz», «Muddati o'tgan», «Kechikish».",
        "Первыми идут организации, дольше всех не платящие. Поиск — по названию или ИНН. Столбцы: организация, регион, договоры, долг, просрочено, просрочка.",
      ],
      items: [
        [
          "«Kechikish» — eng eski muddati o'tgan shartnoma bo'yicha necha kun o'tgan: 90 kundan oshsa qizil.",
          "«Просрочка» — сколько дней прошло по самому старому просроченному договору: больше 90 дней — красным.",
        ],
        [
          "Qatorni yoki «Shartnoma» dagi sonni bossangiz, tashkilotning qarzdor shartnomalari ochiladi; oynadagi «⋮» — Excel yoki PDF.",
          "Нажмите на строку или число в «Договоры» — откроются договоры организации с долгом; «⋮» в окне — Excel или PDF.",
        ],
        [
          "Ro'yxat 20 tadan ochiladi — pastdagi «Yana ... ta» tugmasi davomini qo'shadi. Yuqoridagi «⋮» — hamma qarzdorlarni Excel yoki PDF qilib yuklab olish.",
          "Список показывается по 20 — кнопка «Ещё ...» внизу добавляет продолжение. «⋮» вверху — выгрузить всех должников в Excel или PDF.",
        ],
      ],
      tip: [
        "Tashkilot shartnomalari oynasida sahifadagi boshlang'ich sana hisobga olinmaydi — tashkilotning oxirgi sanagacha bo'lgan barcha qarzdor shartnomalari chiqadi, shuning uchun soni jadvaldagidan ko'p bo'lishi mumkin.",
        "В окне договоров организации начальная дата страницы не учитывается — показываются все её договоры с долгом до конечной даты, поэтому их может быть больше, чем в таблице.",
      ],
      shots: [shot("03-tashkilotlar.webp", ["«Qarzdor tashkilotlar» jadvali", "Таблица организаций-должников"])],
    },
  ],
};
