import { shotIn, type SectionGuide } from "../../types";

const shot = shotIn("admin/videos");

/**
 * Super-admin: "Video darslar" (pages/admin/video-lessons) — viloyat
 * foydalanuvchilari ko'radigan o'quv videolarini boshqarish. Shu sahifada
 * super-admin qo'llanmasi va uning PDF kitobi ham ochiladi.
 */
export const adminVideos: SectionGuide = {
  intro: [
    "Viloyat foydalanuvchilari ko'radigan o'quv videolarini shu yerda qo'shasiz, tartiblaysiz va almashtirasiz. Yuqori paneldagi «Qo'llanma» — shu qo'llanma, «PDF kitob» — uning yuklab olinadigan kitobi.",
    "Здесь добавляются, упорядочиваются и заменяются обучающие видео для пользователей областей. «Qo'llanma» на верхней панели — это руководство, «PDF kitob» — его книга для скачивания.",
  ],
  steps: [
    {
      title: ["Darslar ro'yxati", "Список уроков"],
      body: [
        "Darslar «№» (tartib raqami) bo'yicha — kichik raqam yuqorida. Jadvalda «Dars nomi» (ostida tavsifi), «Hajmi» va «Yuklangan» vaqti.",
        "Уроки идут по «№» (порядковому номеру) — меньший номер выше. В таблице название урока (ниже — описание), размер и время загрузки.",
      ],
      items: [
        ["«Ko'rish» — videoni yangi oynada ochish.", "«Смотреть» — открыть видео в новой вкладке."],
        ["Qalam — tahrirlash, savat — o'chirish.", "Карандаш — изменить, корзина — удалить."],
        ["«⋮» — ro'yxatni Excel yoki PDF qilib yuklab olish.", "«⋮» — выгрузить список в Excel или PDF."],
      ],
      shots: [shot("01-royxat.webp", ["«Video darslar» ro'yxati", "Список видеоуроков"])],
    },
    {
      title: ["Yangi dars qo'shish", "Новый урок"],
      body: [
        "«Qo'shish» ni bosing — «Yangi video dars» oynasi ochiladi.",
        "Нажмите «Добавить» — откроется окно «Новый видеоурок».",
      ],
      ordered: true,
      items: [
        ["«Dars nomi» — kamida 2 ta belgi.", "«Название урока» — минимум 2 символа."],
        ["«Tavsif» — darsda nima ko'rsatilgani qisqacha.", "«Описание» — кратко о содержании урока."],
        [
          "«Tartib raqami» — ro'yxatda shu raqam bo'yicha joylashadi (oxirgisidan keyingi raqam o'zi qo'yiladi).",
          "«Порядковый номер» — определяет позицию в списке (по умолчанию — следующий после последнего).",
        ],
        [
          "«Video fayl» — MP4 yoki WEBM, eng ko'pi 1 GB. «Saqlash» ni bosing — tugmada «Yuklanmoqda ...%» ko'rinadi.",
          "«Видеофайл» — MP4 или WEBM, максимум 1 ГБ. Нажмите «Сохранить» — на кнопке будет «Загрузка ...%».",
        ],
      ],
      warn: [
        "Yuklash tugaguncha oynani yopib bo'lmaydi — katta fayl bir necha daqiqa yuklanishi mumkin. Boshqa formatdagi yoki 1 GB dan katta fayl qabul qilinmaydi.",
        "Пока идёт загрузка, окно закрыть нельзя — большой файл может загружаться несколько минут. Файлы других форматов или больше 1 ГБ не принимаются.",
      ],
      shots: [shot("02-qoshish.webp", ["«Yangi video dars» oynasi", "Окно «Новый видеоурок»"])],
    },
    {
      title: ["Tahrirlash va o'chirish", "Изменение и удаление"],
      body: [
        "Qalam — «Darsni tahrirlash»: nomi, tavsifi, tartib raqami yoki videoning o'zini almashtirish mumkin. «Yangi fayl tanlanmasa, mavjud video o'zgarmaydi.» Yangi fayl tanlansa, eski video o'chiriladi.",
        "Карандаш — «Редактировать урок»: можно изменить название, описание, порядковый номер или само видео. Если файл не выбран, текущее видео останется прежним; при выборе нового старое удаляется.",
      ],
      tip: [
        "Tartibni o'zgartirish uchun darslarning «Tartib raqami» ni tahrirlang — raqamlar o'zi qayta qo'yilmaydi. Savat bilan o'chirilgan darsning video fayli ham o'chiriladi.",
        "Чтобы изменить порядок, отредактируйте «Порядковый номер» уроков — номера сами не перестраиваются. При удалении урока корзиной удаляется и его видеофайл.",
      ],
    },
  ],
};
