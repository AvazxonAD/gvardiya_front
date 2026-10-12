import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("staff");

/** "Foydalanuvchilar" — yurist va buxgalter hisoblari (faqat viloyat admini) */
export const staff: SectionGuide = {
  intro: [
    "Boshqarmangizning yurist va buxgalteriga tizimga kirish hisobini ochish va ular qaysi bo'limda nima qila olishini belgilash. Bu bo'lim faqat viloyat adminida bor.",
    "Создание учётных записей юриста и бухгалтера вашего управления и настройка того, что они могут делать в каждом разделе. Раздел есть только у администратора области.",
  ],
  need: [
    ["Xodimning F.I.Sh.", "Ф.И.О. сотрудника"],
    [
      "Xodimning PINFL raqami — u ishlatadigan E-IMZO kalitidagi PINFL",
      "ПИНФЛ сотрудника — тот же, что в его ключе E-IMZO",
    ],
  ],
  steps: [
    {
      title: ["Foydalanuvchi qo'shish", "Добавление пользователя"],
      body: [
        "«Foydalanuvchi qo'shish» tugmasini bosing va oynani to'ldiring:",
        "Нажмите «Добавить пользователя» и заполните окно:",
      ],
      ordered: true,
      items: [
        [
          "«Roli» — «Buxgalter» yoki «Yurist».",
          "«Роль» — бухгалтер или юрист.",
        ],
        ["«F.I.Sh.» — xodimning to'liq ismi.", "«ФИО» — полное имя сотрудника."],
        [
          "«Login» — xodim tizimga shu nom bilan kiradi.",
          "«Логин» — имя для входа в систему.",
        ],
        [
          "«Parol» — kamida 8 ta belgi: katta va kichik lotin harfi, raqam va maxsus belgi (! @ # $ kabi); bo'sh joy, kirill harfi va loginsiz. Maydon ostidagi ro'yxatda har bir shart yozish paytida yashil bo'lib boradi — hammasi yashil bo'lmaguncha saqlanmaydi.",
          "«Пароль» — не меньше 8 символов: заглавная и строчная латинская буква, цифра и спецсимвол (! @ # $ и т.п.); без пробелов, кириллицы и логина. Список под полем отмечает каждое условие зелёным по мере ввода — пока всё не зелёное, сохранить нельзя.",
        ],
        ["«PINFL» — 14 ta raqam.", "«PINFL» — 14 цифр."],
        [
          "«Saqlash» ni bosing — «Foydalanuvchi qo'shildi».",
          "Нажмите «Сохранить».",
        ],
      ],
      warn: [
        "Xodim login va paroldan keyin o'z E-IMZO kaliti bilan kiradi. PINFL kalitdagi PINFL bilan bir xil bo'lmasa, u tizimga kira olmaydi. Login butun tizimda yagona — «Ushbu login avval kiritilgan!» chiqsa, boshqa login tanlang.",
        "После логина и пароля сотрудник входит своим ключом E-IMZO. Если ПИНФЛ не совпадает с ключом, он не сможет войти. Логин уникален во всей системе — если он занят, выберите другой.",
      ],
      tip: [
        "Buxgalter sizning ma'lumotlaringiz bilan ishlaydi — boshida unga barcha bo'limlar ochiladi (imzosiz). Yurist yuborilgan shartnomalarni tasdiqlaydi — boshida unga faqat «Shartnomalar ro'yhati» (ko'rish va imzo) ochiladi.",
        "Бухгалтер работает с вашими данными — изначально ему открыты все разделы (без подписи). Юрист подтверждает отправленные договоры — изначально ему открыт только «Список договоров» (просмотр и подпись).",
      ],
      shots: [shot("01-qoshish.webp", ["«Foydalanuvchi qo'shish» oynasi", "Окно добавления пользователя"])],
    },
    {
      title: ["Ruxsatlarni sozlash", "Настройка прав"],
      body: [
        "Qatordagi kalit belgisini yoki «Ruxsatlar» ustunidagi «... bo'lim» yozuvini bosing. Jadvalda har bir bo'lim uchun belgilang va «Saqlash» ni bosing — «Ruxsatlar saqlandi».",
        "Нажмите значок ключа или надпись «... разд.» в столбце прав. Отметьте права для каждого раздела и нажмите «Сохранить».",
      ],
      items: [
        [
          "«Ko'rish» — bo'lim xodimning menyusida ochiladi. Belgilanmasa, bo'lim kulrang ko'rinadi va ochilmaydi.",
          "«Просмотр» — раздел доступен в меню сотрудника. Без него раздел серый и не открывается.",
        ],
        [
          "«Yaratish», «Tahrirlash», «O'chirish» — qo'shish, o'zgartirish va o'chirish. Belgilanmasa, tugmalar kulrang bo'ladi («Ruxsat yo'q»).",
          "«Создание», «Изменение», «Удаление». Без них кнопки серые («Нет доступа»).",
        ],
        [
          "«Imzo» — shartnomani E-IMZO bilan tasdiqlash (yurist uchun — tasdiqlash yoki rad qilish).",
          "«Подпись» — подтверждение договора через E-IMZO (для юриста — подтвердить или отклонить).",
        ],
      ],
      warn: [
        "Buxgalterga «Shartnomalar ro'yhati» da «Imzo» bersangiz, u shartnomani rahbar nomidan tasdiqlay oladi. Bu ruxsatni faqat kerakli odamga bering.",
        "Если дать бухгалтеру «Подпись» в договорах, он сможет подтверждать их от имени руководителя. Давайте это право только тому, кому нужно.",
      ],
      tip: [
        "Belgilashdan biri qo'yilsa, «Ko'rish» o'zi yoqiladi. Ustun nomini bossangiz, butun ustun belgilanadi yoki olib tashlanadi. «Yuristga jo'natish» uchun «Tahrirlash» kerak. Yangi ruxsatlar xodim sahifani yangilaganda ko'rinadi.",
        "При отметке любого действия «Просмотр» включается сам. Нажатие на заголовок столбца отмечает или снимает весь столбец. Для «Отправить юристу» нужно «Изменение». Новые права видны сотруднику после обновления страницы.",
      ],
      shots: [shot("02-ruxsatlar.webp", ["«Ruxsatlar» oynasi", "Окно прав"])],
    },
    {
      title: ["Tahrirlash va parolni tiklash", "Изменение и сброс пароля"],
      body: [
        "Qalam belgisi «Foydalanuvchini tahrirlash» oynasini ochadi. Parolni o'zgartirmoqchi bo'lsangiz, «Yangi parol» ga yozing — yangi parol ham xuddi shu shartlarga javob berishi kerak; bo'sh qoldirsangiz, parol o'zgarmaydi.",
        "Карандаш открывает окно изменения пользователя. Чтобы сменить пароль, введите «Новый пароль» — он должен отвечать тем же условиям; если оставить пустым, пароль не изменится.",
      ],
      warn: [
        "Rolni almashtirganda ruxsatlar o'zgarmaydi — keyin «Ruxsatlar» ni qo'lda tekshiring. Yangi parol yoki yangi rol saqlangach, xodim tizimdan chiqariladi va qaytadan kiradi.",
        "При смене роли права не меняются — проверьте их вручную. После смены пароля или роли сотрудник будет выведен из системы и войдёт заново.",
      ],
      shots: [shot("03-tahrirlash.webp", ["«Foydalanuvchini tahrirlash» oynasi", "Окно изменения пользователя"])],
    },
    {
      title: ["O'chirish", "Удаление"],
      body: [
        "Savat belgisini bosing va tasdiqlang. Xodim darhol tizimdan chiqariladi, hisobini qayta tiklab bo'lmaydi.",
        "Нажмите корзину и подтвердите. Сотрудник сразу выводится из системы, учётную запись восстановить нельзя.",
      ],
      tip: [
        "Ro'yxatda qidiruv: «F.I.Sh., login yoki PINFL» (PINFL to'liq yoziladi). «Oxirgi kirish» — xodim oxirgi marta qachon kirgani.",
        "Поиск по списку: Ф.И.О., логин или ПИНФЛ (ПИНФЛ полностью). «Последний вход» — когда сотрудник входил последний раз.",
      ],
      shots: [shot("04-royxat.webp", ["Foydalanuvchilar ro'yxati", "Список пользователей"])],
    },
  ],
};
