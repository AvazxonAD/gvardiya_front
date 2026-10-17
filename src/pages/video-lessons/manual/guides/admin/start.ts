import type { SectionGuide } from "../../types";

/**
 * Super-admin qo'llanmasining kirish bo'limi: super-admin nima qiladi,
 * menyu, yuqori panel va yangi viloyatni ishga tushirish tartibi.
 */
export const adminStart: SectionGuide = {
  intro: [
    "Super-admin butun respublika bo'yicha ishlaydi: viloyatlar qarzdorligi va faolligini kuzatadi, viloyat foydalanuvchilarini ochadi, BXM ni yuritadi, shartnomalarni Exceldan import qiladi, markaziy baza mablag'i va o'quv videolarini boshqaradi. Shartnoma, kirim va chiqimni viloyatlar o'zi yuritadi — ularning tartibi viloyat foydalanuvchilarining qo'llanmasida.",
    "Супер-администратор работает по всей республике: следит за задолженностью и активностью областей, создаёт пользователей областей, ведёт БХМ, импортирует договоры из Excel, управляет средствами центральной базы и обучающими видео. Договоры, приходы и расходы ведут сами области — порядок описан в руководстве пользователей областей.",
  ],
  steps: [
    {
      title: ["Menyu", "Меню"],
      body: ["Chap menyudagi bo'limlar:", "Разделы левого меню:"],
      items: [
        [
          "«Dashboard» — respublika ko'rsatkichlari, viloyatlar xaritasi, pul taqsimoti.",
          "«Дашборд» — показатели республики, карта областей, распределение средств.",
        ],
        [
          "«Qarzdorlik» — viloyatlar va tashkilotlar bo'yicha qarz tahlili.",
          "«Задолженность» — анализ долга по областям и организациям.",
        ],
        [
          "«Monitoring» — qaysi viloyat oy davomida ma'lumot kiritgan.",
          "«Мониторинг» — какие области вносили данные за месяц.",
        ],
        [
          "«Markaziy baza» — markaziy devon moddiy bazasi mablag'i va chiqimlari.",
          "«Центральная база» — средства материальной базы центрального аппарата и расходы.",
        ],
        [
          "«Shartnoma importi» — viloyat shartnomalarini Excel shablondan yuklash.",
          "«Импорт договоров» — загрузка договоров области из шаблона Excel.",
        ],
        [
          "«Foydalanuvchilar» — viloyat admini, yurist, buxgalter va JSTB xodimlari.",
          "«Пользователи» — администраторы, юристы, бухгалтеры областей и сотрудники ЖСТБ.",
        ],
        ["«Qaydlar» — barcha foydalanuvchilar amallari jurnali.", "«Журнал» — журнал действий всех пользователей."],
        [
          "«Video darslar» — viloyatlar uchun o'quv videolari; shu qo'llanma ham shu yerda.",
          "«Видеоуроки» — обучающие видео для областей; это руководство тоже здесь.",
        ],
        ["«Ma'lumotnoma» → «BXM» — respublika BXM ro'yxati.", "«Справочник» → «БХМ» — список БХМ республики."],
      ],
    },
    {
      title: ["Yuqori panel", "Верхняя панель"],
      body: ["O'ng yuqori burchakda:", "В правом верхнем углу:"],
      items: [
        [
          "Globus («Til») — dastur tili: «O'zbek», «Ўзбек» yoki «Русский» (sahifa qayta yuklanadi).",
          "Глобус («Язык») — язык программы: «O'zbek», «Ўзбек» или «Русский» (страница перезагрузится).",
        ],
        ["Oy belgisi — «Tungi rejim» (qayta bossangiz — «Yorug' rejim»).", "Значок луны — тёмная тема (повторно — светлая)."],
        [
          "Ismingizni bossangiz: «Parolni o'zgartirish» («Login», «Eski parol», «Yangi parol») va «Chiqish».",
          "Нажмите на своё имя: «Сменить пароль» (логин, старый пароль, новый пароль) и «Выход».",
        ],
      ],
      tip: [
        "Chap menyuni pastdagi «Yig'ish» bilan yig'ib, ish joyini kengaytirish mumkin.",
        "Левое меню можно свернуть кнопкой «Свернуть» внизу, чтобы освободить место.",
      ],
    },
    {
      title: ["Yangi viloyatni ishga tushirish", "Подключение новой области"],
      body: ["Viloyat dasturda ishlay boshlashi uchun:", "Чтобы область начала работать в программе:"],
      ordered: true,
      items: [
        [
          "«Foydalanuvchilar» da viloyat adminini oching (kerak bo'lsa yurist va buxgalterni ham) va login-parolni topshiring.",
          "В «Пользователях» создайте администратора области (при необходимости — юриста и бухгалтера) и передайте логин и пароль.",
        ],
        [
          "«Ma'lumotnoma» → «BXM» da joriy BXM borligini tekshiring — viloyat shartnomada uni tanlaydi.",
          "Проверьте в «Справочник» → «БХМ», что есть текущая БХМ — область выбирает её в договоре.",
        ],
        [
          "Viloyat admini o'z rekvizitlari, hisob raqami va quyi tuzilmalarini kiritadi (viloyat qo'llanmasidagi «Ishni boshlash»).",
          "Администратор области вносит свои реквизиты, счёт и подразделения («Начало работы» в руководстве области).",
        ],
        [
          "Viloyatda eski shartnomalar Excelda bo'lsa — viloyat rekvizitlarni to'ldirgach, «Shartnoma importi» bilan yuklang (rekvizitlarsiz import qilinmaydi).",
          "Если у области есть прежние договоры в Excel — после того как область заполнит реквизиты, загрузите их через «Импорт договоров» (без реквизитов импорт невозможен).",
        ],
        [
          "«Monitoring» da viloyat ma'lumot kirita boshlaganini kuzating.",
          "Следите в «Мониторинге», что область начала вносить данные.",
        ],
      ],
    },
  ],
};
