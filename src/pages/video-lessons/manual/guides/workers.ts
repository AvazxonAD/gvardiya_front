import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("workers");

/** "Hodimlar ro'yhati" */
export const workers: SectionGuide = {
  intro: [
    "Batalonlaringizdagi xodimlar ro'yxati. Xodimlar shartnoma topshiriqlariga biriktiriladi va ishlagan soatlari uchun pul hisob-kitobi qilinadi. Shartnoma tuzish uchun xodim kiritish shart emas.",
    "Список сотрудников ваших батальонов. Сотрудников закрепляют за заданиями договоров и рассчитывают оплату за отработанные часы. Для создания договора вносить сотрудников не обязательно.",
  ],
  steps: [
    {
      title: ["Xodim qo'shish", "Добавление сотрудника"],
      body: [
        "«Qo'shish» tugmasini bosing — «Xodim qo'shish» oynasi ochiladi. Maydonlarni to'ldiring va «Saqlash» ni bosing.",
        "Нажмите «Добавить» — откроется окно добавления сотрудника. Заполните поля и нажмите «Сохранить».",
      ],
      items: [
        [
          "«Familiya, ism, otasining ismi» — majburiy.",
          "«Фамилия, имя, отчество» — обязательно.",
        ],
        [
          "«Karta raqam» va «Hisob raqam» — pul o'tkaziladigan raqamlar.",
          "«Номер карты» и «Номер счёта» — куда перечисляются деньги.",
        ],
        ["«PINFL (JSHSHIR)» — 14 ta raqam.", "«ПИНФЛ» — 14 цифр."],
        ["«Batalon nomi» — majburiy.", "«Название батальона» — обязательно."],
        [
          "«Muddatli harbiy xizmatchi» — muddatli xizmatdagi askar bo'lsa belgilang.",
          "«Срочнослужащий» — отметьте, если это военнослужащий срочной службы.",
        ],
      ],
      warn: [
        "«Batalon nomi» ro'yxati bo'sh bo'lsa, «Quyi tuzilmalar» bo'limida «Batalon» turidagi tuzilma qo'shing. Hamkor tashkilotlar bu ro'yxatda chiqmaydi.",
        "Если список батальонов пуст, добавьте в разделе «Подразделения» подразделение типа «Батальон». Партнёрские организации в этом списке не показываются.",
      ],
      tip: [
        "«Muddatli harbiy xizmatchi» belgilangan xodimga «Hodimlarning pul hisob-kitobi» da pul hisoblanmaydi.",
        "Сотруднику с отметкой «Срочнослужащий» в «Расчётах с сотрудниками» выплата не начисляется.",
      ],
      shots: [shot("01-qoshish.webp", ["«Xodim qo'shish» oynasi", "Окно добавления сотрудника"])],
    },
    {
      title: ["Exceldan import qilish", "Импорт из Excel"],
      body: [
        "Ko'p xodimni bir yo'la kiritish uchun «Import» tugmasini bosing — «Xodimlarni Exceldan import qilish» oynasi ochiladi.",
        "Чтобы внести много сотрудников сразу, нажмите «Импорт» — откроется окно «Импорт сотрудников из Excel».",
      ],
      ordered: true,
      items: [
        [
          "Oynaning pastidagi «Shablonni yuklab olish» ni bosing (shu shablon «⋮» menyusidagi «Import shabloni (Excel)» da ham bor).",
          "Нажмите «Скачать шаблон» внизу окна (тот же шаблон есть в меню «⋮» — «Шаблон импорта (Excel)»).",
        ],
        [
          "Shablonning «Xodimlar» varag'ini to'ldiring: har bir xodim — bitta qator. «Batalon» — katakni bosib ro'yxatdan tanlang (unda viloyatingiz batalonlari), «F.I.Sh.» — majburiy, «Karta raqami» — 16, «Hisob raqami» — 20, «PINFL» — 14 ta raqam. Batafsil qoidalar — «Izoh» varag'ida.",
          "Заполните лист «Сотрудники»: каждый сотрудник — одна строка. «Батальон» — выберите из списка в ячейке (там батальоны вашей области), «ФИО» — обязательно, «Номер карты» — 16, «Лицевой счёт» — 20, «ПИНФЛ» — 14 цифр. Подробные правила — на листе «Пояснение».",
        ],
        [
          "2–4-qatorlarda kulrang namuna bor — qanday to'ldirishni ko'rsatadi, raqamlari soxta. Import qilishdan oldin namuna qatorlarini o'chirib, o'z xodimlaringizni yozing.",
          "В строках 2–4 — серый образец: показывает, как заполнять, номера ненастоящие. Перед импортом удалите строки-образцы и впишите своих сотрудников.",
        ],
        [
          "Faylni oynadagi maydonga tashlang yoki «Faylni tanlash» ni bosing — u o'zi tekshiriladi: «Xodimlar», «Import qilinadi», «Xatolar», «Ogohlantirishlar» kataklari, xatolar jadvali (Excel qator raqami bilan) va «Fayldagi xodimlar» chiqadi (karta, hisob raqami va PINFL oxirgi 4 raqami bilan).",
          "Перетащите файл в поле окна или нажмите «Выбрать файл» — он проверится сам: появятся плашки «Сотрудники», «Будет импортировано», «Ошибки», «Предупреждения», таблица ошибок (с номером строки Excel) и «Сотрудники в файле».",
        ],
        [
          "Xato bo'lmasa «Import qilish» ni bosing (qavsda — qo'shiladigan xodimlar soni): hamma xodimlar birga qo'shiladi va ro'yxat yangilanadi.",
          "Если ошибок нет, нажмите «Импортировать» (в скобках — число добавляемых сотрудников): все сотрудники добавятся вместе, список обновится.",
        ],
      ],
      warn: [
        "Bitta xato bo'lsa ham hech kim qo'shilmaydi: faylni tuzatib, «Boshqa fayl» bilan qayta tanlang. Xato hisoblanadi: viloyatda yo'q batalon, shu batalonda bor F.I.Sh., viloyatda bor karta yoki hisob raqami, raqam uzunligi noto'g'ri. Batalon import paytida yaratilmaydi — avval «Quyi tuzilmalar» bo'limida qo'shing.",
        "Если есть хотя бы одна ошибка, никто не добавляется: исправьте файл и выберите его снова («Другой файл»). Ошибкой считаются: батальон, которого нет в области, ФИО, которое уже есть в этом батальоне, номер карты или счёта, который уже есть в области, неверная длина номера. Батальон при импорте не создаётся — сначала добавьте его в разделе «Подразделения».",
      ],
      tip: [
        "Import qilingan xodimlar «Muddatli harbiy xizmatchi» belgisisiz qo'shiladi — kerak bo'lsa keyin xodimni tahrirlab belgilang. Raqamlarni boshqa fayldan nusxalaganda «Faqat qiymatni qo'yish» ni tanlang: Excel 16–20 xonali raqamni son qilib qo'ysa, oxirgi raqamlari yo'qoladi va «Excelda son bo'lib qolgan» xatosi chiqadi. «вакант» deb yozilgan qatorlar o'tkazib yuboriladi.",
        "Импортированные сотрудники добавляются без отметки «Срочнослужащий» — при необходимости отметьте её, изменив сотрудника. При копировании номеров из другого файла используйте «Вставить только значения»: если Excel превратит 16–20-значный номер в число, последние цифры потеряются и появится ошибка «Excelda son bo'lib qolgan». Строки с «вакант» пропускаются.",
      ],
      shots: [
        shot("05-import.webp", [
          "Tekshiruv natijasi: kataklar, xatolar jadvali va «Import qilish»",
          "Результат проверки: плашки, таблица ошибок и «Импортировать»",
        ]),
      ],
    },
    {
      title: ["Xodimni qidirish", "Поиск сотрудника"],
      body: [
        "Qidiruv maydoniga («F.I.Sh., PINFL yoki raqam bo'yicha») F.I.Sh. ning bir qismini yozing. Bitta batalon xodimlarini ko'rish uchun yonidagi batalon filtridan (odatda «Hammasi» turadi) batalonni tanlang.",
        "Введите в поиск часть Ф.И.О. Чтобы посмотреть сотрудников батальона, выберите его в фильтре по батальону.",
      ],
      warn: [
        "Karta raqami, hisob raqami yoki PINFL bo'yicha qidirganda raqamni TO'LIQ yozing — bu raqamlar shifrlangan, qisman qidiruv ishlamaydi.",
        "При поиске по номеру карты, счёта или ПИНФЛ вводите номер ПОЛНОСТЬЮ — эти номера зашифрованы, частичный поиск не работает.",
      ],
      tip: [
        "Jadvalda raqamlar yashirilgan holda ko'rinadi. Hali birorta xodim qo'shilmagan bo'lsa ham «Qidiruv shartlariga mos xodim topilmadi» yozuvi chiqadi.",
        "В таблице номера показываются скрытыми. Надпись «сотрудники не найдены» появляется и тогда, когда сотрудников ещё нет.",
      ],
      shots: [shot("02-royxat.webp", ["Xodimlar ro'yxati va qidiruv", "Список сотрудников и поиск"])],
    },
    {
      title: ["Tahrirlash va o'chirish", "Изменение и удаление"],
      body: [
        "Qator oxiridagi qalam tugmasi «Xodim tahrirlash» oynasini ochadi, savat tugmasi esa xodimni o'chiradi (tasdiqlash so'raladi).",
        "Карандаш в конце строки открывает окно изменения сотрудника, корзина — удаляет его (с подтверждением).",
      ],
      warn: [
        "Bir batalonda bir xil F.I.Sh. ikki marta kiritilmaydi («Ushbu F.I.Sh. avval kiritilgan!»), karta yoki hisob raqam ham takrorlanmaydi («Ushbu hisob raqami avval kiritilgan!»).",
        "В одном батальоне нельзя дважды внести одинаковое Ф.И.О., а номер карты или счёта не может повторяться.",
      ],
      shots: [shot("03-tahrirlash.webp", ["«Xodim tahrirlash» oynasi", "Окно изменения сотрудника"])],
    },
    {
      title: ["Ro'yxatni yuklab olish", "Выгрузка списка"],
      body: [
        "«⋮» tugmasini bosing va «Xodimlar ro'yxati — Excel» yoki «Xodimlar ro'yxati — PDF» ni tanlang. «Import shabloni (Excel)» — xodimlarni import qilish shabloni (2-qadam).",
        "Нажмите «⋮» и выберите выгрузку списка сотрудников в Excel или PDF. «Шаблон импорта (Excel)» — шаблон для импорта сотрудников (шаг 2).",
      ],
      shots: [shot("04-yuklab-olish.webp", ["«⋮» menyusi", "Меню «⋮»"])],
    },
  ],
};
