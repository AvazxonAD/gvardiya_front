import { shotIn, type SectionGuide } from "../../types";

const shot = shotIn("admin/import");

/**
 * Super-admin: "Shartnoma importi" — viloyat to'ldirgan Excel shablondagi
 * shartnomalarni viloyatga yuklash (backend: admin/contract.import).
 */
export const adminImport: SectionGuide = {
  intro: [
    "Viloyat Excel shablonga to'ldirib bergan shartnomalarni shu yerdan bir yo'la dasturga yuklaysiz. Fayl avval tekshiriladi: xato bo'lsa import qilinmaydi. Viloyat rekvizitlari to'ldirilgan bo'lishi shart. Viloyatda yo'q tashkilot va batalonlar esa import paytida o'zi yaratiladi, shartnomalar viloyat admini nomidan yoziladi.",
    "Здесь договоры, которые область заполнила в шаблоне Excel, загружаются в программу одним разом. Файл сначала проверяется: при ошибках импорт невозможен. Реквизиты области обязательно должны быть заполнены. А недостающие в области организации и батальоны создаются при импорте, договоры записываются от имени админа области.",
  ],
  need: [
    [
      "Viloyatda admin bo'lishi kerak («Foydalanuvchilar» bo'limida ochiladi) — aks holda «... import qilib bo'lmaydi» chiqadi",
      "В области должен быть админ (создаётся в разделе «Пользователи») — иначе появится сообщение, что импорт невозможен",
    ],
    [
      "Viloyat rekvizitlari to'liq bo'lishi kerak — viloyat admini «Ma'lumotnoma» → «Rekvizitlar» bo'limida to'ldiradi; aks holda «Avval viloyat rekvizitlarini to'ldiring» xatosi chiqadi",
      "Реквизиты области должны быть заполнены — их заполняет админ области в «Справочник» → «Реквизиты»; иначе появится ошибка «Avval viloyat rekvizitlarini to'ldiring» (сначала заполните реквизиты области)",
    ],
    [
      "Viloyat to'ldirgan Excel fayl — shu sahifadagi «Shablonni yuklab olish» shabloni bo'yicha",
      "Excel-файл, заполненный областью по шаблону «Скачать шаблон» с этой страницы",
    ],
    [
      "Fayldagi BXM «Ma'lumotnoma» → «BXM» da bo'lishi kerak (import BXM yaratmaydi)",
      "БХМ из файла должна быть в «Справочник» → «БХМ» (импорт БХМ не создаёт)",
    ],
  ],
  steps: [
    {
      title: ["Shablon va uni to'ldirish", "Шаблон и его заполнение"],
      body: [
        "«Shablonni yuklab olish» ni bosing va faylni viloyatga bering. Shablonning «Izoh» varag'ida har bir ustun qanday to'ldirilishi yozilgan. Viloyat faqat birinchi varaqni to'ldiradi: ma'lumot 3-qatordan boshlanadi.",
        "Нажмите «Скачать шаблон» и передайте файл области. На листе «Izoh» шаблона описано, как заполнять каждый столбец. Область заполняет только первый лист: данные начинаются с 3-й строки.",
      ],
      items: [
        [
          "Har bir qator — bitta topshiriq: «Batalon», «Xodimlar soni», «Jami soat», «BXM».",
          "Каждая строка — одно задание: батальон, число сотрудников, всего часов, БХМ.",
        ],
        [
          "Bir shartnomaning bir necha batalonli topshirig'i — «Shartnoma raqami» bir xil bo'lgan bir necha qator. Shartnoma ustunlari (sana, tashkilot, STIR, manzil, tadbir sanalari va vaqti) bu qatorlarda bir xil bo'lishi kerak.",
          "Задания одного договора для нескольких батальонов — несколько строк с одинаковым номером договора. Столбцы договора (даты, организация, ИНН, адрес, даты и время мероприятия) в этих строках должны совпадать.",
        ],
        [
          "Sanalar — KK.OO.YYYY, vaqt — SS:MM (tugash 24:00 bo'lishi mumkin). STIR — 9 xonali, JSHSHIR — 14 xonali.",
          "Даты — ДД.ММ.ГГГГ, время — ЧЧ:ММ (окончание может быть 24:00). ИНН — 9 цифр, ПИНФЛ — 14 цифр.",
        ],
      ],
      warn: [
        "Shablondagi namuna qatorlarni (901–912) o'chirib, o'z ma'lumotingizni yozing — ular qolsa, «Shablondagi namuna qator» xatosi chiqadi.",
        "Удалите образцовые строки шаблона (901–912) и впишите свои данные — если они останутся, будет ошибка «образцовая строка шаблона».",
      ],
    },
    {
      title: ["Viloyatni tanlash: rekvizitlar", "Выбор области: реквизиты"],
      body: [
        "Yuqorida «Viloyat» ni tanlang. Dastur shu zahoti viloyat rekvizitlarini tekshiradi: ular har bir shartnoma matniga va «Bajaruvchi» rekvizitlariga tushadi, shuning uchun to'ldirilmagan bo'lsa import qilinmaydi.",
        "Выберите вверху «Область». Программа сразу проверит реквизиты области: они попадают в текст каждого договора и в реквизиты «Исполнителя», поэтому, если они не заполнены, импорт невозможен.",
      ],
      items: [
        [
          "Viloyatlar ro'yxati yuklanguncha maydon «Yuklanmoqda...» deb turadi. Yuklanmasa (server bilan aloqa uzilsa) — qizil qatorda «Viloyatlar ro'yxati yuklanmadi: ...» chiqadi: «Qayta urinish» ni bosing.",
          "Пока список областей загружается, в поле написано «Загрузка...». Если он не загрузился (нет связи с сервером) — в красной строке появится «Список областей не загружен: ...»: нажмите «Повторить».",
        ],
        [
          "Tekshiriladigan maydonlar: «Ijrochi nomi», «Hujjat sarlavhasi», «Rahbar F.I.Sh.», «Manzil», «Bank nomi», «MFO», «STIR raqami». Hammasi to'ldirilgan bo'lsa, hech narsa chiqmaydi — keyingi qadamga o'ting.",
          "Проверяются поля: «Название исполнителя», «Заголовок документа», «ФИО руководителя», «Адрес», «Название банка», «МФО», «Номер ИНН». Если все заполнены, ничего не появится — переходите к следующему шагу.",
        ],
        [
          "Bo'sh maydon bo'lsa — qizil qatorda «... import qilib bo'lmaydi» va «Avval viloyat rekvizitlarini to'ldiring. Bo'sh maydonlar: ...» chiqadi. «Import qilish» tugmasi bosilmaydi.",
          "Если есть пустые поля — в красной строке появится «... import qilib bo'lmaydi» и «Avval viloyat rekvizitlarini to'ldiring. Bo'sh maydonlar: ...» (сначала заполните реквизиты; пустые поля: ...). Кнопка «Импортировать» неактивна.",
        ],
        [
          "Rekvizitlarni super-admin to'ldira olmaydi: buni viloyat admini o'z kabinetida, «Ma'lumotnoma» → «Rekvizitlar» bo'limida qiladi (viloyat qo'llanmasi: «Ishni boshlash» → «Rekvizitlarni to'ldirish»). Viloyat saqlagach, qizil qatordagi «Qayta tekshirish» ni bosing — qator yo'qoladi.",
          "Супер-админ не может заполнить реквизиты: это делает админ области в своём кабинете, в «Справочник» → «Реквизиты» (руководство области: «Начало работы» → «Заполнение реквизитов»). Когда область сохранит их, нажмите «Проверить снова» в красной строке — строка исчезнет.",
        ],
      ],
      tip: [
        "Hisob raqami, batalon va tashkilotlar esa majburiy emas: viloyatda hisob raqami bo'lmasa, uni «Import qilish» qadamida shu sahifada kiritasiz, batalon va tashkilotlar fayldan o'zi yaratiladi.",
        "А расчётный счёт, батальоны и организации не обязательны: если у области нет счёта, его вводят на этой же странице на шаге «Импорт», батальоны и организации создаются из файла сами.",
      ],
      shots: [
        shot("03-rekvizitlar.webp", [
          "Rekvizitlari to'ldirilmagan viloyat: qizil qatorda bo'sh maydonlar va «Qayta tekshirish»",
          "Область без реквизитов: в красной строке пустые поля и «Проверить снова»",
        ]),
      ],
    },
    {
      title: ["Faylni tekshirish", "Проверка файла"],
      body: [
        "Viloyat tanlangach, faylni o'rtadagi maydonga tashlang yoki «Excel faylni tanlash» ni bosing. Fayl tanlanishi bilan o'zi tekshiriladi va natija chiqadi:",
        "Когда область выбрана, перетащите файл в поле посередине или нажмите «Выбрать файл Excel». Файл проверится сразу, и появится результат:",
      ],
      items: [
        [
          "Kataklar: «Shartnomalar», «Jami summa», «Yangi tashkilotlar», «Yangi batalonlar», «Xatolar», «Ogohlantirishlar».",
          "Плашки: договоры, общая сумма, новые организации, новые батальоны, ошибки, предупреждения.",
        ],
        [
          "Xatolar va ogohlantirishlar jadvali — Excel qator raqami va «Izoh» bilan. Xato bo'lsa import qilinmaydi: faylni tuzatib, qayta tanlang (yoki «Qayta tekshirish»).",
          "Таблица ошибок и предупреждений — с номером строки Excel и описанием. При ошибках импорт невозможен: исправьте файл и выберите заново (или «Проверить снова»).",
        ],
        [
          "«Import qilinadigan shartnomalar» — har bir shartnoma: sana, buyurtmachi («bazada bor» yoki «yangi»), tadbir, «Batalon × xodim × soat», shablon va summa.",
          "«Договоры к импорту» — каждый договор: дата, заказчик («есть в базе» или «новая»), мероприятие, батальон × сотрудники × часы, шаблон и сумма.",
        ],
      ],
      tip: [
        "Ogohlantirish importni to'xtatmaydi, lekin tekshirib chiqing: yangi yaratiladigan batalon va tashkilotlar, BXM ko'rsatilmagan qatorlar (joriy BXM olinadi), sana va vaqtga mos kelmaydigan «Jami soat».",
        "Предупреждения не останавливают импорт, но проверьте их: создаваемые батальоны и организации, строки без БХМ (берётся текущая БХМ), «Всего часов», не совпадающие с датами и временем.",
      ],
      warn: [
        "Viloyatda shu yili shu raqamli shartnoma bo'lsa — «... shartnoma ... yilda viloyatda allaqachon bor» xatosi: bir faylni ikki marta import qilib bo'lmaydi.",
        "Если в области в этом году уже есть договор с таким номером — ошибка «уже есть в области»: один файл нельзя импортировать дважды.",
      ],
      shots: [shot("01-tekshirish.webp", ["Tekshiruv natijasi va shartnomalar", "Результат проверки и договоры"])],
    },
    {
      title: ["Import qilish", "Импорт"],
      body: [
        "Xato bo'lmasa, «Hisob raqami» ni tanlang (viloyatda bitta bo'lsa o'zi tanlanadi) va «Import qilish» ni bosing. «Import qilishni tasdiqlang» oynasida viloyat, shartnomalar soni va summasi hamda avtomatik yaratiladigan tashkilot, batalon va hisob raqami yoziladi — tekshirib, yana «Import qilish» ni bosing.",
        "Если ошибок нет, выберите «Расчётный счёт» (если у области он один — выбирается сам) и нажмите «Импортировать». В окне подтверждения указаны область, число и сумма договоров, а также организации, батальоны и счёт, которые будут созданы автоматически, — проверьте и снова нажмите «Импортировать».",
      ],
      items: [
        [
          "«Shartnoma shabloni» — odatda «Avtomatik (muddat va vaqtga qarab)»; kerak bo'lsa bitta shablonni tanlang.",
          "«Шаблон договора» — обычно «Автоматически (по сроку и времени)»; при необходимости выберите один шаблон.",
        ],
        [
          "Viloyatda hisob raqami bo'lmasa, maydon «Hisob raqami (yangi)» bo'ladi — raqamni yozing, import bilan birga viloyatga qo'shiladi.",
          "Если у области нет счёта, поле становится «Расчётный счёт (новый)» — введите номер, он будет добавлен области вместе с импортом.",
        ],
        [
          "Natija yashil qatorda: «... ta shartnoma import qilindi», yaratilgan tashkilot va batalonlar soni.",
          "Результат — в зелёной строке: сколько договоров импортировано, сколько организаций и батальонов создано.",
        ],
      ],
      tip: [
        "Shartnoma summasi dasturdagi kabi hisoblanadi: soat × xodim × BXM × 7%. Yangi tashkilot va batalonlarning rekvizitlarini (manzil, bank, STIR) viloyat keyin o'z «Ma'lumotnoma» sida to'ldiradi.",
        "Сумма договора считается как в программе: часы × сотрудники × БХМ × 7%. Реквизиты новых организаций и батальонов (адрес, банк, ИНН) область потом заполнит в своём «Справочнике».",
      ],
      shots: [shot("02-tasdiqlash.webp", ["«Import qilishni tasdiqlang» oynasi", "Окно подтверждения импорта"])],
    },
  ],
};
