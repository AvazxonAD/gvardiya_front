import { shotIn, type SectionGuide } from "../../types";

const shot = shotIn("admin/users");

/**
 * Super-admin: "Foydalanuvchilar" (pages/admin/users) — viloyat admini,
 * yurist, buxgalter va JSTB xodimlari. Har viloyatda har turdan bittadan.
 */
export const adminUsers: SectionGuide = {
  intro: [
    "Viloyat foydalanuvchilari (viloyat admini, yurist, buxgalter) va JSTB xodimlari shu yerda ochiladi va tahrirlanadi. Har bir viloyatda bittadan admin, yurist va buxgalter bo'ladi. JSTB xodimi viloyatga biriktirilmaydi, faqat dashboardni ko'radi va ular bir nechta bo'lishi mumkin.",
    "Здесь создаются и изменяются пользователи областей (администратор, юрист, бухгалтер) и сотрудники ЖСТБ. В каждой области — по одному администратору, юристу и бухгалтеру. Сотрудник ЖСТБ не привязан к области, видит только дашборд, их может быть несколько.",
  ],
  steps: [
    {
      title: ["Foydalanuvchilar ro'yxati", "Список пользователей"],
      body: [
        "Jadvalda: «Rasm», «F.I.Sh.», «Viloyat», «Turi», «Login», «PINFL» va «Amallar». Qidiruv — «F.I.Sh., login, PINFL yoki viloyat»; ustun nomini bossangiz, tartib o'zgaradi.",
        "В таблице: фото, Ф.И.О., регион, тип, логин, ПИНФЛ и действия. Поиск — по Ф.И.О., логину, ПИНФЛ или региону; нажатие на заголовок столбца меняет сортировку.",
      ],
      items: [
        [
          "«Turi»: «Viloyat admin», «Viloyat yurist», «Viloyat buxgalter» yoki «JSTB xodimi».",
          "«Тип»: администратор, юрист, бухгалтер области или сотрудник ЖСТБ.",
        ],
        [
          "PINFL yashirin turadi — ko'z belgisi («Ko'rsatish») bilan ochiladi. Rasm kichik ko'rinishini bossangiz, kattalashadi.",
          "ПИНФЛ скрыт — открывается значком глаза («Показать»). Нажмите на миниатюру фото, чтобы увеличить.",
        ],
        [
          "«⋮» — ro'yxatni Excel yoki PDF qilib yuklab olish (PINFL faylda to'liq chiqadi).",
          "«⋮» — выгрузить список в Excel или PDF (ПИНФЛ в файле выводится полностью).",
        ],
      ],
      tip: [
        "Ro'yxatda super-admin va batalon foydalanuvchilari ko'rinmaydi.",
        "Супер-администраторы и пользователи батальонов в списке не показываются.",
      ],
      shots: [shot("01-royxat.webp", ["«Foydalanuvchilar» ro'yxati", "Список пользователей"])],
    },
    {
      title: ["Yangi foydalanuvchi", "Новый пользователь"],
      body: [
        "«Qo'shish» ni bosing — «Foydalanuvchi qo'shish» oynasi ochiladi.",
        "Нажмите «Добавить» — откроется окно «Добавить пользователя».",
      ],
      ordered: true,
      items: [
        [
          "«Turi» ni tanlang. JSTB xodimi uchun hudud so'ralmaydi.",
          "Выберите «Тип». Для сотрудника ЖСТБ регион не запрашивается.",
        ],
        ["«Hudud» — foydalanuvchi viloyati.", "«Регион» — область пользователя."],
        ["«F.I.Sh.» va «Login» ni yozing.", "Введите «ФИО» и «Логин»."],
        [
          "«Parol» — ostidagi talablarning hammasi yashil bo'lsin: kamida 8 ta belgi, katta va kichik harf, raqam, maxsus belgi (!@#$%&*), kirill harfi va bo'sh joysiz, login ichida bo'lmasin.",
          "«Пароль» — все требования под полем должны стать зелёными: не менее 8 символов, заглавная и строчная буквы, цифра, спецсимвол (!@#$%&*), без кириллицы и пробелов, не содержит логин.",
        ],
        [
          "«PINFL» (14 ta raqam) va «Rasm» — ixtiyoriy. «Saqlash» ni bosing.",
          "«ПИНФЛ» (14 цифр) и «Изображение» — необязательно. Нажмите «Сохранить».",
        ],
      ],
      warn: [
        "Login takrorlanmasligi kerak — «Ushbu login avval kiritilgan!». Viloyatda shu turdagi foydalanuvchi bo'lsa — «Ushbu foydalanuvchi avval kiritilgan!»: har viloyatda bittadan admin, yurist va buxgalter.",
        "Логин должен быть уникальным — иначе «Такой логин уже занят!». Если в области уже есть пользователь этого типа — «Такой пользователь уже добавлен!»: в каждой области по одному администратору, юристу и бухгалтеру.",
      ],
      tip: [
        "Yurist va buxgalterning qaysi bo'limlarni ko'rishini viloyat admini o'zining «Foydalanuvchilar» bo'limida belgilaydi; yaratilganda standart ruxsatlar beriladi. Rasm — JPG, PNG yoki GIF, 5 MB gacha.",
        "Какие разделы видят юрист и бухгалтер, настраивает администратор области в своём разделе «Пользователи»; при создании выдаются стандартные права. Фото — JPG, PNG или GIF, до 5 МБ.",
      ],
      shots: [shot("02-qoshish.webp", ["«Foydalanuvchi qo'shish» oynasi", "Окно «Добавить пользователя»"])],
    },
    {
      title: ["Tahrirlash, parol va o'chirish", "Изменение, пароль и удаление"],
      body: [
        "Qatordagi qalam — «Foydalanuvchi tahrirlash». Parolni tiklash ham shu yerda: «Yangi parol» ga yangi parolni yozing; bo'sh qoldirilsa, parol o'zgarmaydi.",
        "Карандаш в строке — «Редактирование пользователя». Сброс пароля — тоже здесь: введите новый в «Новый пароль»; если оставить пустым, пароль не изменится.",
      ],
      items: [
        [
          "Savat — o'chirish: «Siz mutlaqo ishonchingiz komilmi?» oynasida «O'chirish» ni bosing.",
          "Корзина — удаление: в окне «Вы абсолютно уверены?» нажмите «Удалить».",
        ],
        [
          "O'chirilgan foydalanuvchi ro'yxatdan chiqadi, uning logini va o'rni (viloyat, tur) bo'shaydi; qilgan amallari «Qaydlar» da «O'chirilgan» belgisi bilan qoladi.",
          "Удалённый пользователь исчезает из списка, его логин и место (область, тип) освобождаются; его действия остаются в «Журнале» с отметкой «Удалён».",
        ],
      ],
    },
  ],
};
