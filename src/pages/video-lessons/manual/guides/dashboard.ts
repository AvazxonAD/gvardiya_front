import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("dashboard");

/** "Dashboard" — viloyat bosh sahifasi */
export const dashboard: SectionGuide = {
  intro: [
    "Viloyat bo'yicha umumiy ko'rinish: nechta shartnoma tuzilgan, qanchasi to'langan, qancha qarz qolgan va pul qayerga taqsimlangan. Dashboard viloyatning barcha hisob raqamlari bo'yicha hisoblanadi.",
    "Общая картина по области: сколько договоров заключено, сколько оплачено, какой долг остался и как распределены деньги. Дашборд считается по всем счетам области.",
  ],
  steps: [
    {
      title: ["Davrni tanlash", "Выбор периода"],
      body: [
        "Yuqori paneldagi ikkita sana — davr boshi va oxiri. Odatda yil boshidan (1-yanvardan) joriy oy oxirigacha turadi. Sana o'zgartirilishi bilan ko'rsatkichlar qayta hisoblanadi. Hisob shartnoma sanasi bo'yicha olinadi.",
        "Две даты на верхней панели — начало и конец периода. По умолчанию — с начала года (1 января) до конца текущего месяца. После изменения даты показатели пересчитываются. Учитывается дата договора.",
      ],
      tip: [
        "Bu davr faqat dashboardga tegishli: boshqa sahifalarning sanasi o'zgarmaydi (ular uchun — sozlamalar belgisidagi «Standart sana oralig'i»). Tanlangan davr tizimdan chiqquncha eslab qolinadi. Kichik ekranda sanalar ko'rinmaydi — taqvim belgisini bosing: «Dashboard davri» oynasida «dan» va «gacha» ni tanlab, «Saqlash» ni bosing.",
        "Этот период относится только к дашборду: даты других страниц не меняются (для них — «Период по умолчанию» в значке настроек). Выбранный период сохраняется до выхода из системы. На маленьком экране даты скрыты — нажмите значок календаря и задайте период в окне «Период дашборда».",
      ],
      shots: [shot("01-davr.webp", ["Yuqori paneldagi sanalar", "Даты на верхней панели"])],
    },
    {
      title: ["Ommaviy tadbirlar hisoboti", "Отчёт по массовым мероприятиям"],
      body: [
        "Yuqori paneldagi «Excel» va «PDF» tugmalari «Ommaviy tadbirlar hisoboti»ni yuklab beradi: 1-toifali ommaviy tadbirlardan kelib tushgan pul mablag'lari to'g'risidagi ma'lumotnoma, viloyat bo'yicha, rasmiy shaklda. Davr — dashboarddagi sanalar (hisobot shu oraliqda tuzilgan shartnomalar bo'yicha), til — interfeys tili. Keng ekranda tugmalar yonida hisobot nomi yoziladi, kichikroq ekranda nom sichqonchani tugma ustiga olib borganda chiqadi. Hisobot ustunlari:",
        "Кнопки «Excel» и «PDF» на верхней панели выгружают «Отчёт по массовым мероприятиям»: справку о денежных средствах, поступивших от массовых мероприятий 1-й категории, по области, в официальной форме. Период — даты дашборда (отчёт строится по договорам, заключённым в этом периоде), язык — язык интерфейса. На широком экране рядом с кнопками написано название отчёта, на меньшем оно появляется при наведении мыши на кнопку. Графы отчёта:",
      ],
      items: [
        [
          "«Shartnomalar» — davrda tuzilgan shartnomalar soni va summasi; «Shartnoma bo'yicha ishtirok etgan sh/t» — MG, IIO va FVV xodimlari soni; «Pul taqsimoti» — shartnomalar summasining MG, IIO va FVV ga bo'linishi.",
          "«Договоры» — количество и сумма договоров за период; «Задействованный личный состав по договорам» — сотрудники НГ, ОВД и МЧС; «Распределение средств» — сумма договоров по НГ, ОВД и МЧС.",
        ],
        [
          "«Debitor qarzdorlik» va «Kelib tushgan mablag'» — shartnomalar summasining to'lanmagan va to'langan qismi: shartnomalar soni, «Jami», MG, IIO va FVV. Ikkalasi qo'shilsa, shartnomalar summasi chiqadi — ortiqcha to'lov hisoblanmaydi.",
          "«Дебиторская задолженность» и «Поступившие средства» — неоплаченная и оплаченная часть суммы договоров: количество договоров, «Всего», НГ, ОВД и МЧС. Вместе они дают сумму договоров — переплата не учитывается.",
        ],
        [
          "«Har bir boshqarma o'z ixtiyorida qolgan pullarning taqsimlanishi» — boshqarma ulushi: «Markaziy devon moddiy bazasiga 10%», qolganidan «Rag'batlantirishga 25%» va «Moddiy bazaga 75%». Har birida «Hisoblandi (so'mda)» va «Sarflandi (so'mda)», rag'batda yana «Shaxsiy tarkib soni».",
          "«Распределение средств, оставшихся в распоряжении каждого управления» — доля управления: «На материальную базу центрального аппарата 10%», из остатка «На поощрение 25%» и «На материальную базу 75%». В каждой — «Начислено (в сумах)» и «Израсходовано (в сумах)», в поощрении ещё «Кол-во личного состава».",
        ],
        [
          "«Boshqa organlar ixtiyorida qolgan» — «Ichki ishlar organlari», «Favqulodda vaziyatlar bo'linmalari» va «MG harbiy qismlari» ulushi: «Hisoblandi (so'mda)» va «O'tkazildi (so'mda)» («Chiqimlar kitobi» da chiqim qilingani).",
          "«Оставшиеся в распоряжении других органов» — доля «Органы внутренних дел», «Подразделения по чрезвычайным ситуациям» и «Воинские части НГ»: «Начислено (в сумах)» и «Перечислено (в сумах)» (проведённое в «Книге расходов»).",
        ],
      ],
      tip: [
        "«Hisoblandi» ustunlari shu davrda tuzilgan shartnomalar summasidan, «Sarflandi» ustunlari esa chiqim hujjatlari sanasi bo'yicha olinadi. Shuning uchun hisobot raqamlari «Chiqimlar kitobi» va «Hodimlarning pul hisob-kitobi» sahifalaridagi jamidan farq qilishi mumkin — farq nimadan iboratligi o'sha sahifalarning pastida yozilgan. Viloyat hisobotida «Markaziy devon moddiy bazasiga 10%» ning «Sarflandi» ustuni 0 bo'ladi.",
        "Графы «Начислено» считаются по сумме договоров, заключённых в периоде, а «Израсходовано» — по дате расходных документов. Поэтому цифры отчёта могут отличаться от итогов страниц «Книга расходов» и «Расчёты с сотрудниками» — из чего складывается разница, написано внизу этих страниц. В отчёте по области «Израсходовано» у «На материальную базу центрального аппарата 10%» равно 0.",
      ],
      shots: [shot("06-ommaviy-hisobot.webp", ["Hisobotning «Excel» va «PDF» tugmalari", "Кнопки «Excel» и «PDF» отчёта"])],
    },
    {
      title: ["Asosiy ko'rsatkichlar", "Основные показатели"],
      body: [
        "Yuqoridagi to'rtta kartochka. Har biri bosiladi — tegishli shartnomalar ro'yxati ochiladi.",
        "Четыре карточки вверху. Каждая нажимается — открывается список соответствующих договоров.",
      ],
      items: [
        [
          "«Jami shartnomalar» — davrdagi shartnomalar soni, ostida — ularning umumiy summasi.",
          "«Всего договоров» — число договоров за период, ниже — их общая сумма.",
        ],
        [
          "«Puli to'lab berilgan» — to'liq to'langan shartnomalar soni. Yashil foiz — ularning summasi barcha shartnomalar summasining necha foizi ekani; pastdagi summa — shu shartnomalarning umumiy summasi.",
          "«Оплаченные» — число полностью оплаченных договоров. Зелёный процент — доля их суммы в сумме всех договоров; сумма ниже — общая сумма этих договоров.",
        ],
        [
          "«Qarzdorligi bor» — qarzi qolgan shartnomalar soni. Qizil foiz — ularning summadagi ulushi; pastdagi summa — shu shartnomalarning TO'LIQ summasi, qolgan qarz emas.",
          "«С задолженностью» — число договоров с долгом. Красный процент — их доля по сумме; сумма ниже — ПОЛНАЯ сумма этих договоров, а не остаток долга.",
        ],
        [
          "«Qizil chegaraga tushgan xodimlar» — o'z batalonidagi o'rtachadan kamida 2 barobar ko'p pul olgan xodimlar. Soni 0 dan ko'p bo'lsa, bosib ro'yxatini ko'rasiz.",
          "«Сотрудники в красной зоне» — получившие минимум в 2 раза больше среднего по своему батальону. Если их больше 0, нажмите, чтобы увидеть список.",
        ],
      ],
      tip: [
        "Ochilgan shartnomalar oynasidagi «⋮» tugmasi ro'yxatni Excel yoki PDF qilib yuklab beradi.",
        "Кнопка «⋮» в открывшемся окне договоров выгружает список в Excel или PDF.",
      ],
      shots: [shot("02-korsatkichlar.webp", ["Asosiy ko'rsatkichlar", "Основные показатели"])],
    },
    {
      title: ["Qarzdorlik to'lov muddati bo'yicha", "Задолженность по срокам оплаты"],
      body: [
        "To'lov tadbir boshlanishidan 3 kun oldin tushishi kerak. Shunga qarab qolgan qarz uch guruhga bo'linadi (har birida shartnomalar soni va qolgan qarz summasi):",
        "Оплата должна поступить за 3 дня до начала мероприятия. По этому правилу остаток долга делится на три группы (в каждой — число договоров и сумма остатка):",
      ],
      items: [
        [
          "«Muddati kelmagan» — to'lov muddati hali kelmagan.",
          "«Срок не наступил» — срок оплаты ещё не настал.",
        ],
        [
          "«Kechiktirilgan» — to'lov muddati o'tdi, lekin tadbir hali boshlanmagan.",
          "«Просрочен платёж» — срок оплаты прошёл, но мероприятие ещё не началось.",
        ],
        [
          "«Muddati o'tgan» — tadbir boshlangan, pul hali tushmagan.",
          "«Просрочено» — мероприятие началось, а деньги не поступили.",
        ],
      ],
      tip: [
        "Holat har doim BUGUNGI kunga nisbatan hisoblanadi. Guruhni bossangiz, o'sha shartnomalar ro'yxati ochiladi.",
        "Статус всегда считается относительно СЕГОДНЯШНЕГО дня. Нажмите на группу — откроется список этих договоров.",
      ],
      shots: [shot("03-muddat.webp", ["To'lov muddati bo'yicha qarz", "Долг по сроку оплаты"])],
    },
    {
      title: ["Diagrammalar", "Диаграммы"],
      body: [
        "Uchta doira diagramma. Sichqonchani bo'lak ustiga olib borsangiz, markazda uning summasi va ulushi chiqadi.",
        "Три круговые диаграммы. При наведении на сегмент в центре показываются его сумма и доля.",
      ],
      items: [
        [
          "«Umumiy batalon va birgadalar kesimida» — topshiriqlar summasi batalonlar bo'yicha. Bo'lakni bossangiz, batalon ko'rsatkichlari ochiladi: xodimlar soni, summa, soat, tadbirlar soni.",
          "«В разрезе батальонов и бригад» — сумма заданий по батальонам. Нажмите на сегмент — откроются показатели батальона: сотрудники, сумма, часы, мероприятия.",
        ],
        [
          "«Muddatli harbiy xizmatchilar kesimida» — muddatli xizmatchilarning tadbirlardagi ulushi, batalonlar bo'yicha. Bo'lak bosiladi.",
          "«В разрезе военнослужащих срочной службы» — их доля в мероприятиях по батальонам. Сегмент нажимается.",
        ],
        [
          "«Kirim bo'lgan pulning taqsimoti» — tushgan pul qayerga sarflangani: «Moddiy bazaga», «Hamkor tashkilotlar», «Xodimlar uchun premiya» (qavs ichida — ulushi) va «Qolgan».",
          "«Распределение поступивших средств» — куда направлены поступившие деньги: на материальную базу, партнёрам, премии сотрудникам (в скобках — доля) и остаток.",
        ],
      ],
      shots: [shot("04-diagrammalar.webp", ["Diagrammalar", "Диаграммы"])],
    },
    {
      title: ["Qarzdor tashkilotlar", "Организации-должники"],
      body: [
        "Pastdagi jadvalda qarzi bor tashkilotlar: «Kelishilgan summa», «To'langan», «Muddati o'tgan» va «Qarzdorlik» (eng katta qarz birinchi). Qatorni bossangiz, tashkilotning qarzdor shartnomalari ochiladi.",
        "В таблице внизу — организации с долгом: согласованная сумма, оплачено, просроченная часть и долг (сначала самые крупные). Нажмите на строку — откроются долговые договоры организации.",
      ],
      items: [
        [
          "Qidiruv: «Tashkilot, INN yoki manzil».",
          "Поиск: по организации, ИНН или адресу.",
        ],
        [
          "Ustun nomini bossangiz, jadval shu ustun bo'yicha tartiblanadi.",
          "Нажмите на заголовок столбца — таблица отсортируется по нему.",
        ],
        [
          "↻ «Yangilash» — jadvalni qayta yuklash; «⋮» — Excel yoki PDF qilib yuklab olish.",
          "↻ «Обновить» — перезагрузить таблицу; «⋮» — выгрузить в Excel или PDF.",
        ],
      ],
      warn: [
        "Bu jadvalda faqat davrning OXIRGI sanasi hisobga olinadi: shu sanagacha tuzilgan barcha qarzdor shartnomalar kiradi.",
        "В этой таблице учитывается только КОНЕЧНАЯ дата периода: входят все долговые договоры, заключённые до неё.",
      ],
      shots: [shot("05-qarzdorlar.webp", ["«Qarzdor tashkilotlar» jadvali", "Таблица организаций-должников"])],
    },
  ],
};
