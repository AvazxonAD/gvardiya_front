import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("batalon");

/** "Quyi tuzilmalar" */
export const batalon: SectionGuide = {
  intro: [
    "Batalonlar va hamkor tashkilotlar ro'yxati. Shartnomadagi har bir topshiriq (tadbir) shulardan biriga biriktiriladi.",
    "Список батальонов и партнёрских организаций. Каждое задание (мероприятие) договора закрепляется за одним из них.",
  ],
  steps: [
    {
      title: ["Quyi tuzilma qo'shish", "Добавление подразделения"],
      body: [
        "«Qo'shish» tugmasini bosing — «Batalon qo'shish» oynasi ochiladi.",
        "Нажмите «Добавить» — откроется окно добавления батальона.",
      ],
      ordered: true,
      items: [
        ["«Nomi» ni yozing — majburiy.", "Введите «Название» — обязательно."],
        [
          "Kerak bo'lsa «Manzil», «INN», «Bank nomi», «MFO», «Hisob raqam» ni to'ldiring.",
          "При необходимости заполните адрес, ИНН, банк, МФО и номер счёта.",
        ],
        [
          "«Batalon tanlang» ostida turini belgilang: «Batalon» yoki «Hamkor tashkilot».",
          "В блоке «Выберите батальон» выберите тип: «Батальон» или «Партнёрская организация».",
        ],
        ["«Saqlash» ni bosing.", "Нажмите «Сохранить»."],
      ],
      warn: [
        "Bir xil nomli tuzilma ikki marta kiritilmaydi — «Ushbu batalon avval kiritilgan!» xabari chiqadi.",
        "Подразделение с таким же названием повторно не добавляется — появится сообщение, что батальон уже внесён.",
      ],
      shots: [shot("01-qoshish.webp", ["«Batalon qo'shish» oynasi", "Окно добавления батальона"])],
    },
    {
      title: ["Batalon va hamkor tashkilot farqi", "Батальон и партнёрская организация"],
      body: [
        "Ikkalasi ham shartnoma topshirig'ida «Batalon nomi» ro'yxatida chiqadi. Farqi:",
        "Оба типа доступны в списке батальонов в задании договора. Разница:",
      ],
      items: [
        [
          "«Batalon» — o'z bo'linmangiz. Unga xodimlar biriktiriladi va topshiriqqa xodimlar tayinlanadi.",
          "«Batalon» — ваше подразделение. К нему прикрепляются сотрудники, их назначают на задания.",
        ],
        [
          "«Hamkor tashkilot» — tadbirga jalb qilinadigan boshqa tashkilot. Unga xodim biriktirilmaydi.",
          "«Hamkor tashkilot» — сторонняя организация, привлекаемая к мероприятию. Сотрудники к ней не прикрепляются.",
        ],
      ],
      tip: [
        "Jadvaldagi «Turi» ustunida har bir tuzilmaning turi ko'rsatiladi.",
        "Тип каждого подразделения виден в столбце «Тип» таблицы.",
      ],
      shots: [shot("02-royxat.webp", ["Quyi tuzilmalar ro'yxati", "Список подразделений"])],
    },
    {
      title: ["Qidirish, tahrirlash, yuklab olish", "Поиск, изменение, выгрузка"],
      body: [
        "Qidiruv maydoniga nomi, INN yoki manzilni yozing. Qator oxiridagi qalam — «Batalon tahrirlash», savat — o'chirish. «⋮» tugmasi ro'yxatni Excel yoki PDF qilib yuklab beradi.",
        "Введите в поиск название, ИНН или адрес. Карандаш в конце строки — изменение, корзина — удаление. Кнопка «⋮» выгружает список в Excel или PDF.",
      ],
      warn: [
        "Shartnomalarda ishlatilgan yoki xodimlari bor tuzilmani o'chirmang — dastur buni to'xtatmaydi.",
        "Не удаляйте подразделение, которое используется в договорах или к которому прикреплены сотрудники, — программа этого не запрещает.",
      ],
      shots: [shot("03-tahrirlash.webp", ["«Batalon tahrirlash» oynasi", "Окно изменения батальона"])],
    },
  ],
};
