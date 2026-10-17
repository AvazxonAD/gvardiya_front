import { shotIn, type SectionGuide } from "../../types";

const shot = shotIn("admin/logs");

/**
 * Super-admin: "Qaydlar" (pages/logs) — barcha foydalanuvchilar amallari,
 * viloyat filtri bilan. Viloyat admini faqat o'z viloyatini ko'radi.
 */
export const adminLogs: SectionGuide = {
  intro: [
    "Kim, qachon, qaysi bo'limda nima qilgani — barcha foydalanuvchilar bo'yicha: viloyatlar, JSTB va super-admin. Har bir amal bajarilgandan keyin o'zi yoziladi. Viloyat admini faqat o'z viloyatining qaydlarini ko'radi, siz esa hammasini — viloyat filtri bilan.",
    "Кто, когда, в каком разделе и что сделал — по всем пользователям: областям, ЖСТБ и супер-администратору. Каждое действие записывается автоматически. Администратор области видит только записи своей области, вы — все, с фильтром по области.",
  ],
  steps: [
    {
      title: ["Qaydlar jadvali", "Таблица журнала"],
      body: [
        "Sanalar — davr (odatda oxirgi 7 kun). Filtrlar: «Barcha viloyatlar», «Barcha foydalanuvchilar», «Barcha bo'limlar», «Barcha amallar», «Har qanday natija» va qidiruv — «Login, F.I.Sh., IP yoki yo'l». Jadvalda:",
        "Даты — период (по умолчанию последние 7 дней). Фильтры: все области, все пользователи, все разделы, все действия, любой результат и поиск — по логину, Ф.И.О., IP или пути. В таблице:",
      ],
      items: [
        [
          "«Vaqt», «Foydalanuvchi» (ostida login, rol va viloyat), «Amal» (Qo'shish, Tahrirlash, O'chirish, Ko'rish, Yuklab olish, Import, Kirish, Chiqish), «Nima qildi» — bo'lim va yozuv raqami.",
          "Время, пользователь (ниже — логин, роль и область), действие (создание, изменение, удаление, просмотр, выгрузка, импорт, вход, выход), «Что сделал» — раздел и номер записи.",
        ],
        [
          "«Natija» — «Bajarildi» yoki «Xato» (sichqoncha ustida — xato matni), «Davomiyligi» (3 soniyadan uzoq bo'lsa sariq), «IP».",
          "«Результат» — «Успешно» или «Ошибка» (при наведении — текст ошибки), длительность (дольше 3 секунд — жёлтым), IP.",
        ],
        [
          "Pastda: «Jami qaydlar», «O'zgarishlar», «Xatolar», «Foydalanuvchilar». «⋮» — davrdagi barcha qaydlarni Excel yoki PDF qilib yuklab olish.",
          "Внизу: всего записей, изменения, ошибки, пользователи. «⋮» — выгрузить все записи периода в Excel или PDF.",
        ],
      ],
      tip: [
        "«Viloyat» bo'sh («—») qaydlar — super-admin va JSTB xodimlarining amallari (JSTB «Super admin» roli bilan ko'rinadi). Viloyat almashtirilsa, foydalanuvchilar ro'yxati shu viloyatnikiga o'zgaradi.",
        "Записи без области («—») — действия супер-администратора и сотрудников ЖСТБ (ЖСТБ показывается с ролью «Супер админ»). При смене области список пользователей меняется на её пользователей.",
      ],
      shots: [shot("01-qaydlar.webp", ["Qaydlar jadvali va filtrlar", "Таблица журнала и фильтры"])],
    },
    {
      title: ["Qayd tafsilotlari", "Детали записи"],
      body: [
        "Qatorni bossangiz, «Qayd tafsilotlari» oynasi ochiladi: foydalanuvchi, rol, viloyat, bo'lim, amal, natija, so'rov, davomiyligi, IP va qurilma.",
        "Нажмите на строку — откроется окно «Детали записи»: пользователь, роль, область, раздел, действие, результат, запрос, длительность, IP и устройство.",
      ],
      items: [
        [
          "«O'zgarishlar: oldin → keyin» — faqat o'zgargan maydonlar: «Maydon», «Oldin» (qizil), «Keyin» (yashil). Yangi yozuvda — «Yaratilgan yozuv».",
          "«Изменения: до → после» — только изменённые поля: поле, до (красным), после (зелёным). Для новой записи — «Созданная запись».",
        ],
        [
          "«So'rov (request body)» — yuborilgan ma'lumot, parollar yashirilgan. Ko'rish (GET) so'rovlarining javobi saqlanmaydi.",
          "«Запрос (request body)» — отправленные данные, пароли скрыты. Ответы на просмотр (GET) не сохраняются.",
        ],
      ],
      shots: [shot("02-tafsilot.webp", ["«Qayd tafsilotlari» oynasi", "Окно «Детали записи»"])],
    },
    {
      title: ["Foydalanuvchilar kesimida", "По пользователям"],
      body: [
        "Yuqori paneldagi «Foydalanuvchilar kesimida» — har bir foydalanuvchi davrda nechta amal qilgani: «Jami», «Qo'shdi», «Tahrirladi», «O'chirdi», «Fayllar», «Ko'rdi», «Xatolar», «Oxirgi kirish» va «Oxirgi faollik». Amali yo'q foydalanuvchilar ham 0 bilan ko'rinadi.",
        "«По пользователям» на верхней панели — сколько действий каждый пользователь совершил за период: всего, создал, изменил, удалил, файлы, просмотры, ошибки, последний вход и последняя активность. Пользователи без действий тоже показываются с нулями.",
      ],
      items: [
        [
          "Qatorni bossangiz, «Qaydlar» shu foydalanuvchi bo'yicha ochiladi.",
          "Нажмите на строку — откроется журнал по этому пользователю.",
        ],
        [
          "O'chirilgan foydalanuvchi qizil «O'chirilgan» belgisi bilan. Pastda: «Foydalanuvchilar», «Davr ichida faol», «Jami amallar», «Xatolar».",
          "Удалённый пользователь — с красной отметкой «Удалён». Внизу: пользователи, активны за период, всего действий, ошибки.",
        ],
      ],
      shots: [shot("03-kesim.webp", ["«Foydalanuvchilar kesimida»", "«По пользователям»"])],
    },
  ],
};
