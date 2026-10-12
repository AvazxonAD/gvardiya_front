import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("rasxod");

/** "Chiqimlar kitobi" — hamkor tashkilotlarga to'lov */
export const rasxod: SectionGuide = {
  intro: [
    "Chiqim — hamkor tashkilotga u bajargan topshiriqlar uchun to'lov hujjati. Hujjatga faqat to'liq to'langan shartnomalarning topshiriqlari kiradi, summa o'zi hisoblanadi. O'z batalonlaringiz xodimlariga to'lov — «Hodimlarning pul hisob-kitobi» bo'limida.",
    "Расход — платёжный документ партнёрской организации за выполненные ею задания. В документ входят только задания полностью оплаченных договоров, сумма считается сама. Выплаты сотрудникам своих батальонов — в разделе «Расчёты с сотрудниками».",
  ],
  need: [
    [
      "«Quyi tuzilmalar» da «Hamkor tashkilot» turidagi tuzilma",
      "Подразделение типа «Hamkor tashkilot» в «Подразделениях»",
    ],
    [
      "Shu tuzilmaga topshiriq biriktirilgan va kirimlar bilan TO'LIQ to'langan shartnoma",
      "Договор с заданием этого подразделения, ПОЛНОСТЬЮ оплаченный приходами",
    ],
  ],
  steps: [
    {
      title: ["Yangi chiqim yaratish", "Создание расхода"],
      body: [
        "«Qo'shish» tugmasini bosing — «Chiqim hujjatini yaratish» sahifasi ochiladi.",
        "Нажмите «Добавить» — откроется страница создания расходного документа.",
      ],
      ordered: true,
      items: [
        [
          "«Hujjat №» (faqat raqam) va «Hujjat sanasi» ni kiriting.",
          "Введите «№ документа» (только цифры) и «Дата проводки».",
        ],
        [
          "«Qabul qiluvchi ma'lumotlari» maydonlaridan biriga IKKI MARTA bosing va ochilgan «Tashkilotni tanlang» oynasida hamkor tashkilotni tanlang (qatoriga bosing). Uning topshiriqlari jadvalga o'zi yuklanadi.",
          "ДВАЖДЫ нажмите на любое поле «Информация о получателе» и выберите в окне партнёрскую организацию (нажмите на строку). Её задания загрузятся в таблицу сами.",
        ],
        [
          "Pastdagi «dan» va «gacha» — shartnoma sanasi oralig'i (odatda oxirgi bir oy). O'zgartirsangiz, «Ishga tushirish» ni bosing.",
          "«с» и «по» внизу — период по дате договора (по умолчанию последний месяц). После изменения нажмите «Запустить».",
        ],
        [
          "Jadvaldagi topshiriqlarni tekshiring. «Summa» — ulardagi «Natijaviy summa» lar yig'indisi, o'zi hisoblanadi.",
          "Проверьте задания в таблице. «Сумма» — итог их «Результирующих сумм», считается сама.",
        ],
        [
          "Kerak bo'lsa «Tavsif» yozing va «Saqlash» ni bosing — «Chiqim yaratildi!».",
          "При необходимости заполните «Описание» и нажмите «Сохранить».",
        ],
      ],
      warn: [
        "Jadvaldagi HAMMA topshiriqlar chiqimga kiradi — alohida qatorni olib tashlab bo'lmaydi. Keraksiz topshiriqni chiqarish uchun «dan» / «gacha» oralig'ini toraytirib, «Ishga tushirish» ni bosing.",
        "В расход входят ВСЕ задания таблицы — отдельную строку убрать нельзя. Чтобы исключить лишнее, сузьте период «с» / «по» и нажмите «Запустить».",
      ],
      tip: [
        "Jadval bo'sh bo'lsa: qabul qiluvchi tanlanmagan, sana oralig'i tor, shartnoma hali to'liq to'lanmagan yoki topshiriqlar boshqa chiqimga kiritilgan.",
        "Если таблица пуста: не выбран получатель, узкий период, договор ещё не оплачен полностью или задания уже вошли в другой расход.",
      ],
      shots: [
        shot("01-qabul-qiluvchi.webp", ["Qabul qiluvchini tanlash", "Выбор получателя"]),
        shot("02-topshiriqlar.webp", ["Topshiriqlar jadvali va «Ishga tushirish»", "Таблица заданий и кнопка «Запустить»"]),
      ],
    },
    {
      title: ["Ro'yxat va hisobotlar", "Список и отчёты"],
      body: [
        "Ro'yxatdagi sanalar chiqim hujjati sanasi bo'yicha filtrlaydi. Qidiruv: «№, qabul qiluvchi yoki izoh», yonidagi filtr — holat bo'yicha («To'langan» / «To'lanmagan»). Yuqoridagi «⋮» — ro'yxatni Excel yoki PDF qilib yuklab olish.",
        "Даты списка фильтруют по дате расходного документа. Поиск по номеру, получателю или комментарию, рядом — фильтр по статусу («Оплаченные» / «Неоплаченные»). «⋮» вверху — выгрузка списка в Excel или PDF.",
      ],
      tip: [
        "Qatordagi «⋮» (Amallar) — shu chiqim bo'yicha hamma amallar nomi bilan: «Hujjatni tahrirlash», «To'landi deb belgilash», «Hisobotlar» guruhida «Shartnomalar bo'yicha ma'lumot» (Excel yoki PDF) va «Hujjatni o'chirish».",
        "«⋮» в строке (Действия) — все действия с этим расходом по названиям: «Редактировать документ», «Отметить как оплачено», в группе «Отчёты» — «Сведения по договорам» (Excel или PDF) и «Удалить документ».",
      ],
      shots: [shot("03-royxat.webp", ["Chiqimlar ro'yxati", "Список расходов"])],
    },
    {
      title: ["To'lov holati", "Статус оплаты"],
      body: [
        "Yangi chiqim «To'lanmagan» bo'lib yaratiladi. Summa qabul qiluvchi tashkilotga o'tkazilgach, qatordagi «⋮» → «To'landi deb belgilash» ni bosing va tasdiqlang. Xato belgilangan bo'lsa — «⋮» → «To'lanmaganga qaytarish». Holat «Holati» ustunida ko'rinadi.",
        "Новый расход создаётся «Не оплачено». Когда сумма перечислена получателю, нажмите в строке «⋮» → «Отметить как оплачено» и подтвердите. Если отметили по ошибке — «⋮» → «Вернуть в неоплаченные». Статус виден в столбце «Статус».",
      ],
      tip: [
        "Holat faqat belgi: summalar va «Davr bo'yicha chiqim» o'zgarmaydi, hujjatni tahrirlash ham holatni o'zgartirmaydi. Holat filtri faqat ro'yxatni saralaydi.",
        "Статус — только отметка: суммы и «Расход за период» не меняются, редактирование документа статус не меняет. Фильтр по статусу влияет только на список.",
      ],
    },
    {
      title: ["Tahrirlash va o'chirish", "Изменение и удаление"],
      body: [
        "Qatordagi «⋮» → «Hujjatni tahrirlash» — «Chiqim hujjatini tahrirlash» sahifasi. Saqlangan topshiriqlar och yashil rangda ko'rinadi. Yangi to'langan topshiriqlarni qo'shish uchun «Ishga tushirish» ni bosing. «⋮» → «Hujjatni o'chirish» — chiqimni o'chirish; uning topshiriqlari yangi chiqim uchun yana bo'shaydi.",
        "«⋮» в строке → «Редактировать документ» — страница изменения расхода. Сохранённые задания подсвечены светло-зелёным. Чтобы добавить новые оплаченные задания, нажмите «Запустить». «⋮» → «Удалить документ» — удалить расход; его задания снова станут доступны.",
      ],
      warn: [
        "Tahrirlashda qabul qiluvchini almashtirsangiz, saqlangan topshiriqlar jadvaldan o'chadi.",
        "Если при изменении сменить получателя, сохранённые задания пропадут из таблицы.",
      ],
      shots: [shot("04-tahrirlash.webp", ["«Chiqim hujjatini tahrirlash» sahifasi", "Страница изменения расхода"])],
    },
  ],
};
