import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("logs");

/** "Qaydlar" — foydalanuvchilar amallari jurnali */
export const logs: SectionGuide = {
  intro: [
    "Viloyatingiz foydalanuvchilari tizimda nima qilgani: kim, qachon, qaysi bo'limda, qanday amal bajargan va natijasi. Parollar va maxfiy raqamlar jurnalda yashiriladi.",
    "Что делали пользователи вашей области: кто, когда, в каком разделе, какое действие и с каким результатом. Пароли и секретные номера в журнале скрыты.",
  ],
  steps: [
    {
      title: ["Davr va filtrlar", "Период и фильтры"],
      body: [
        "Ro'yxat ustidagi ikkita sana bilan davrni tanlang (odatda oxirgi 7 kun). Keyin kerakli filtrlarni qo'ying:",
        "Задайте период двумя датами над списком (по умолчанию последние 7 дней). Затем выберите нужные фильтры:",
      ],
      items: [
        ["«Barcha foydalanuvchilar» — bitta xodimni tanlash.", "Выбор одного пользователя."],
        ["«Barcha bo'limlar» — shartnoma, kirim, tashkilot va hokazo.", "Раздел: договор, приход, организация и т. д."],
        [
          "«Barcha amallar» — Qo'shish, Tahrirlash, O'chirish, Ko'rish, Yuklab olish, Kirish va boshqalar.",
          "Действие: добавление, изменение, удаление, просмотр, выгрузка, вход и др.",
        ],
        ["«Har qanday natija» — «Bajarildi» yoki «Xato».", "Результат: «Успешно» или «Ошибка»."],
        ["Qidiruv: «Login, F.I.Sh., IP yoki yo'l».", "Поиск: логин, Ф.И.О., IP или путь."],
      ],
      tip: [
        "Qatorlarning ko'pchiligi «Ko'rish» bo'ladi. Faqat o'zgarishlarni ko'rish uchun «Barcha amallar» dan «Qo'shish», «Tahrirlash» yoki «O'chirish» ni tanlang. Filtrlarni bekor qilish — «Tozalash».",
        "Большинство строк — просмотры. Чтобы видеть только изменения, выберите действие «Создание», «Изменение» или «Удаление». Сброс фильтров — «Очистить».",
      ],
      shots: [shot("01-filtrlar.webp", ["Qaydlar va filtrlar", "Журнал и фильтры"])],
    },
    {
      title: ["Jadvalni o'qish", "Как читать таблицу"],
      body: [
        "Har bir qator — bitta amal: vaqti, foydalanuvchi (login, roli), amal turi, nima qilgani, natijasi, necha soniyada bajarilgani va IP manzil. Pastda: «Jami qaydlar», «O'zgarishlar», «Xatolar», «Foydalanuvchilar».",
        "Каждая строка — одно действие: время, пользователь (логин, роль), тип действия, что сделано, результат, длительность и IP. Внизу — итоги: всего записей, изменений, ошибок, пользователей.",
      ],
      tip: [
        "«Xato» yonida xato kodi yoziladi (masalan, «Xato 400»). Bu har doim ham nosozlik emas: noto'g'ri parol, ruxsat yo'qligi yoki formada xato to'ldirilgan maydon ham shunday yoziladi.",
        "Рядом с «Ошибка» указан код (например, 400). Это не всегда сбой: так же записываются неверный пароль, отсутствие прав или ошибка в форме.",
      ],
      shots: [shot("02-jadval.webp", ["Qaydlar jadvali va jami kataklar", "Таблица журнала и итоги"])],
    },
    {
      title: ["Qayd tafsilotlari", "Подробности записи"],
      body: [
        "Qatorni bosing — «Qayd tafsilotlari» oynasi ochiladi: kim, qaysi qurilmadan, qaysi yozuv bilan ishlagan. Tahrirlangan yozuvda «O'zgarishlar: oldin → keyin» jadvali chiqadi — qaysi maydon qanday o'zgargani (maydonlar bazadagi nomi bilan yoziladi). Yangi qo'shilgan yozuvda esa «Yaratilgan yozuv» ko'rinadi.",
        "Нажмите на строку — откроется окно «Детали записи»: кто, с какого устройства, с какой записью работал. Для изменённой записи есть таблица «Изменения: до → после» (поля — под именами из базы данных). Для новой записи показывается созданная запись.",
      ],
      shots: [shot("03-tafsilot.webp", ["«Qayd tafsilotlari» oynasi", "Окно подробностей записи"])],
    },
    {
      title: ["Foydalanuvchilar kesimida", "По пользователям"],
      body: [
        "Yuqoridagi «Foydalanuvchilar kesimida» yorlig'ini bosing. Har bir foydalanuvchi bo'yicha: jami amallar, qo'shgan, tahrirlagan, o'chirgan, yuklab olgan fayllar, ko'rgan, xatolar, oxirgi kirish va oxirgi faollik. Qidiruv: «F.I.Sh. yoki login». Qatorni bossangiz, o'sha odamning qaydlari ochiladi.",
        "Откройте вкладку «По пользователям». По каждому: всего действий, создал, изменил, удалил, файлы, просмотры, ошибки, последний вход и последняя активность. Поиск по Ф.И.О. или логину. Нажмите строку — откроются записи этого человека.",
      ],
      shots: [shot("04-foydalanuvchilar.webp", ["«Foydalanuvchilar kesimida» yorlig'i", "Вкладка «По пользователям»"])],
    },
    {
      title: ["Yuklab olish", "Выгрузка"],
      body: [
        "«⋮» tugmasini bosing va Excel yoki PDF ni tanlang — filtrlarga mos BARCHA qaydlar yuklab olinadi, faqat ekrandagi sahifa emas.",
        "Нажмите «⋮» и выберите Excel или PDF — выгружаются ВСЕ записи по фильтрам, а не только текущая страница.",
      ],
      shots: [shot("05-yuklab-olish.webp", ["«⋮» menyusi", "Меню «⋮»"])],
    },
  ],
};
