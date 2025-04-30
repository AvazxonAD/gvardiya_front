// export const latinToCyrillic = (latin: string): string => {
//   const map: { [key: string]: string } = {
//     a: "а",
//     A: "А",
//     b: "б",
//     B: "Б",
//     c: "ц",
//     C: "Ц",
//     d: "д",
//     D: "Д",
//     e: "е",
//     E: "Е",
//     f: "ф",
//     F: "Ф",
//     g: "г",
//     G: "Г",
//     "g'": "ғ",
//     "G'": "Ғ",
//     h: "ҳ",
//     H: "Ҳ",
//     i: "и",
//     I: "И",
//     j: "ж",
//     J: "Ж",
//     k: "к",
//     K: "К",
//     l: "л",
//     L: "Л",
//     m: "м",
//     M: "М",
//     n: "н",
//     N: "Н",
//     o: "о",
//     O: "О",
//     "o'": "ў",
//     "O'": "Ў",
//     p: "п",
//     P: "П",
//     q: "қ",
//     Q: "Қ",
//     r: "р",
//     R: "Р",
//     s: "с",
//     S: "С",
//     t: "т",
//     T: "Т",
//     u: "у",
//     U: "У",
//     v: "в",
//     V: "В",
//     w: "ў",
//     W: "Ў",
//     x: "х",
//     X: "Х",
//     y: "й",
//     Y: "Й",
//     z: "з",
//     Z: "З",
//     sh: "ш",
//     Sh: "Ш",
//     SH: "Ш",
//     ch: "ч",
//     Ch: "Ч",
//     CH: "Ч",
//     Ye: "Е",
//     YE: "Е",
//     ye: "е",
//     Yo: "Ё",
//     YO: "Ё",
//     yo: "ё",
//     Yu: "Ю",
//     YU: "Ю",
//     yu: "ю",
//     Ya: "Я",
//     YA: "Я",
//     ya: "я",
//     " ": " ",
//     "y'": "ь",
//     "Y'": "ь",
//     "'": "ь",
//   };

//   return latin.replace(
//     /sh|Sh|SH|ch|Ch|CH|g'|G'|o'|O'|Ye|YE|ye|Yo|YO|yo|Yu|YU|yu|Ya|YA|ya|y'|Y'|'|./g,
//     (char) => map[char] || char
//   );
// };
export const latinToCyrillic = (latin: string): string => {
  const map: { [key: string]: string } = {
    a: "а",
    A: "А",
    b: "б",
    B: "Б",
    c: "ц",
    C: "Ц",
    d: "д",
    D: "Д",
    e: "е",
    E: "Е",
    f: "ф",
    F: "Ф",
    g: "г",
    G: "Г",
    "g'": "ғ",
    "G'": "Ғ",
    h: "ҳ",
    H: "Ҳ",
    i: "и",
    I: "И",
    j: "ж",
    J: "Ж",
    k: "к",
    K: "К",
    l: "л",
    L: "Л",
    m: "м",
    M: "М",
    n: "н",
    N: "Н",
    o: "о",
    O: "О",
    "o'": "ў",
    "O'": "Ў",
    p: "п",
    P: "П",
    q: "қ",
    Q: "Қ",
    r: "р",
    R: "Р",
    s: "с",
    S: "С",
    t: "т",
    T: "Т",
    u: "у",
    U: "У",
    v: "в",
    V: "В",
    w: "ў",
    W: "Ў",
    x: "х",
    X: "Х",
    y: "й",
    Y: "Й",
    z: "з",
    Z: "З",
    sh: "ш",
    Sh: "Ш",
    SH: "Ш",
    ch: "ч",
    Ch: "Ч",
    CH: "Ч",
    Ye: "Е",
    YE: "Е",
    ye: "е",
    Yo: "Ё",
    YO: "Ё",
    yo: "ё",
    Yu: "Ю",
    YU: "Ю",
    yu: "ю",
    Ya: "Я",
    YA: "Я",
    ya: "я",
    "y'": "ь",
    "Y'": "ь",
    "'": "ь",
  };

  let result = "";
  let i = 0;

  while (i < latin.length) {
    // Try to match the longest patterns first
    if (i + 2 <= latin.length && map[latin.substring(i, i + 2)]) {
      result += map[latin.substring(i, i + 2)];
      i += 2;
    } else if (i + 1 <= latin.length && map[latin.substring(i, i + 1)]) {
      result += map[latin.substring(i, i + 1)];
      i += 1;
    } else {
      // If no match is found, keep the original character
      result += latin[i];
      i += 1;
    }
  }

  return result;
};

export function formatSum(value?: number): string {
  if (value === 0) return "0";
  if (!value) return "";
  // Ikkita kasr raqamiga ega bo'lishi uchun toFixed qo'llaniladi
  const [integerPart, decimalPart] = value.toFixed(2).split(".");

  // Integer qismni minglik bo'shliqlar bilan ajratish
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Formatlangan qismni kasr qismi bilan birlashtirish
  return `${formattedInteger},${decimalPart}`;
}

export function numberToWords(num?: number): string {
  if (num === undefined || num === null) return "";

  const ones = [
    "",
    "bir",
    "ikki",
    "uch",
    "to'rt",
    "besh",
    "olti",
    "yetti",
    "sakkiz",
    "to'qqiz",
  ];
  const teens = [
    "o'n",
    "o'n bir",
    "o'n ikki",
    "o'n uch",
    "o'n to'rt",
    "o'n besh",
    "o'n olti",
    "o'n yetti",
    "o'n sakkiz",
    "o'n to'qqiz",
  ];
  const tens = [
    "",
    "",
    "yigirma",
    "o'ttiz",
    "qirq",
    "ellik",
    "oltmish",
    "yetmish",
    "sakson",
    "to'qson",
  ];
  const thousands = ["", "ming", "million", "milliard"];

  if (num === 0) return "nol";

  // Faqat butun son qismiga ishlov berish uchun
  function translateChunk(n: number): string {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " yuz ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      str += teens[n - 10] + " ";
      n = 0;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  }

  // Butun qismini olish
  let integerPart = Math.floor(num);

  let result = "";
  let thousandIndex = 0;

  while (integerPart > 0) {
    const chunk = integerPart % 1000;
    if (chunk > 0) {
      result = `${translateChunk(chunk)} ${
        thousands[thousandIndex]
      } ${result}`.trim();
    }
    integerPart = Math.floor(integerPart / 1000);
    thousandIndex++;
  }

  return `${result.trim()} ${tt("SO'M", "СУМ")}`;
}

export const tt = (text: string, ru: string) => {
  const type = localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : "0";
  return type == "2" ? ru : type == "0" ? text : latinToCyrillic(text);
};

export function textNum(text: string, number: number): string {
  if (text) {
    let result = "";

    // Iterate through the text in chunks of `number`
    for (let i = 0; i < text.length; i += number) {
      result += text.slice(i, i + number) + " ";
    }

    // Trim the extra space at the end and return
    return result.trim();
  } else {
    return text;
  }
}

// export function formatNum(number: number): any {
//   if (number) {
//     // Convert the number to string and reverse it for easier grouping

//     const reversedNumber = number.toString().split("").reverse().join("");

//     // Group the reversed number into chunks of 3 and join them with spaces
//     const grouped = reversedNumber.match(/.{1,3}/g)?.join(" ");

//     // Reverse it back to get the correct format
//     return grouped?.split("").reverse().join("") || number.toString();
//   } else {
//     return number;
//   }
// }
export function formatNum(num: number, disableFixed?: boolean) {
  if (num === 0) return "0"; // Explicitly return "0" for input 0
  if (num) {
    if (isNaN(num)) {
      return "";
    }

    // Raqamni ikkiga bo'lamiz: butun va kasr qism
    const number = disableFixed
      ? num.toString().split(".")
      : num?.toFixed(2).split(".");
    const [integerPart, fractionalPart] = number;
    // Butun qismini mingliklarga ajratish
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    // Kasr qismi bilan birga string qaytarish
    return `${formattedInteger}${disableFixed ? "" : `,${fractionalPart}`}`;
  } else {
    return "";
  }
}
export function formatDate(dateStr?: string): string {
  try {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  } catch {
    return "";
  }
}

export const handleStatus = (status: number): string => {
  const statusMessages: { [key: number]: any } = {
    200: {
      uz: "So'rov muvaffaqiyatli bajarildi",
      ru: "Запрос выполнен успешно",
    },
    201: {
      uz: "Yangi resurs yaratildi",
      ru: "Создан новый ресурс",
    },
    202: {
      uz: "So'rov qabul qilindi, qayta ishlanmoqda",
      ru: "Запрос принят, выполняется обработка",
    },
    203: {
      uz: "Noaniq ma'lumotlar bilan muvaffaqiyatli qaytdi",
      ru: "Возврат успешен, но информация неточная",
    },
    204: {
      uz: "Kontent mavjud emas, muvaffaqiyatli bajarildi",
      ru: "Контент отсутствует, запрос выполнен успешно",
    },
    205: {
      uz: "Formani yangilash uchun qayta yuklang",
      ru: "Перезагрузите для обновления формы",
    },
    206: {
      uz: "Qisman kontent qaytarildi",
      ru: "Частичный контент был возвращен",
    },
    300: {
      uz: "Bir nechta variant mavjud",
      ru: "Доступны несколько вариантов",
    },
    301: {
      uz: "Resurs doimiy ravishda boshqa manzilga ko'chirildi",
      ru: "Ресурс был перемещен на другой адрес навсегда",
    },
    302: {
      uz: "Resurs vaqtinchalik boshqa manzilda joylashgan",
      ru: "Ресурс временно находится по другому адресу",
    },
    303: {
      uz: "Boshqa resursga yo'naltirildi, GET orqali kirish mumkin",
      ru: "Перенаправлено на другой ресурс, доступен через GET",
    },
    304: {
      uz: "Ma'lumot yangilanmagan, mavjud nusxadan foydalaning",
      ru: "Информация не обновлена, используйте существующую копию",
    },
    307: {
      uz: "Vaqtinchalik yo'naltirish, boshqa URL orqali kirish mumkin",
      ru: "Временное перенаправление, доступ по другому URL",
    },
    308: {
      uz: "Doimiy yo'naltirish, boshqa URL orqali kiring",
      ru: "Постоянное перенаправление, доступ по другому URL",
    },
    400: {
      uz: "Ma'lumotlar noto'g'ri kiritildi, iltimos, e'tiborli bo'ling",
      ru: "Введены неверные данные, пожалуйста, будьте внимательны",
    },
    401: {
      uz: "Autentifikatsiya talab qilinadi, iltimos, tizimga kiring",
      ru: "Требуется аутентификация, пожалуйста, войдите в систему",
    },
    402: {
      uz: "To'lov talab qilinadi, iltimos, to'lovni amalga oshiring",
      ru: "Требуется оплата, пожалуйста, выполните платеж",
    },
    403: {
      uz: "Ruxsat etilmagan amal, huquqlaringizni tekshiring",
      ru: "Действие запрещено, проверьте свои права",
    },
    404: {
      uz: "Qidirilgan resurs topilmadi, iltimos, to'g'ri URL kiriting",
      ru: "Запрашиваемый ресурс не найден, введите правильный URL",
    },
    405: {
      uz: "Metod qo'llab-quvvatlanmaydi, tegishli HTTP metodni ishlating",
      ru: "Метод не поддерживается, используйте правильный HTTP метод",
    },
    406: {
      uz: "Qabul qilinmaydi, iltimos, ma'lumotlarni qayta ko'rib chiqing",
      ru: "Недопустимый запрос, пересмотрите введенные данные",
    },
    407: {
      uz: "Proxy autentifikatsiyasi talab qilinadi, tizimga kiring",
      ru: "Требуется аутентификация через прокси, войдите в систему",
    },
    408: {
      uz: "So'rov vaqti tugadi, iltimos, qayta urinib ko'ring",
      ru: "Время запроса истекло, попробуйте снова",
    },
    409: {
      uz: "To'qnashuv yuz berdi, ma'lumotlarni tekshiring",
      ru: "Произошло столкновение, проверьте данные",
    },
    410: {
      uz: "Resurs mavjud emas, boshqa resursdan foydalaning",
      ru: "Ресурс недоступен, воспользуйтесь другим ресурсом",
    },
    411: {
      uz: "Kontent uzunligi talab qilinadi, iltimos, to'liq kiriting",
      ru: "Требуется длина контента, введите полный запрос",
    },
    412: {
      uz: "Old shartlar bajarilmadi, kerakli talablarni tekshiring",
      ru: "Условие не выполнено, проверьте требования",
    },
    413: {
      uz: "So'rov juda katta, iltimos, hajmini kamaytiring",
      ru: "Запрос слишком велик, уменьшите его размер",
    },
    414: {
      uz: "URL juda uzun, iltimos, qisqartiring",
      ru: "URL слишком длинный, укоротите его",
    },
    415: {
      uz: "Qo'llab-quvvatlanmaydigan media turi, boshqa formatni tanlang",
      ru: "Неподдерживаемый тип медиа, выберите другой формат",
    },
    416: {
      uz: "Talab qilingan diapazon qoniqtirilmadi, boshqa diapazonni tanlang",
      ru: "Запрашиваемый диапазон недопустим, выберите другой диапазон",
    },
    417: {
      uz: "Kutish bajarilmadi, iltimos, yana tekshiring",
      ru: "Ожидание не выполнено, проверьте снова",
    },
    418: {
      uz: "Men choynakman - kulgili tarzda ko'rsatilmoqda",
      ru: "Я чайник - сообщение показано в шутливой форме",
    },
    421: {
      uz: "Yo'naltirish noto'g'ri, so'rovni qayta yuboring",
      ru: "Неправильное перенаправление, повторите запрос",
    },
    422: {
      uz: "So'rov bajarib bo'lmaydi, ma'lumot noto'g'ri",
      ru: "Невозможно обработать запрос, данные неверны",
    },
    423: {
      uz: "Resurs qulflangan, kirish huquqlarini tekshiring",
      ru: "Ресурс заблокирован, проверьте права доступа",
    },
    424: {
      uz: "Bog'liq amal muvaffaqiyatsiz, qayta urinib ko'ring",
      ru: "Связанное действие не выполнено, попробуйте снова",
    },
    426: {
      uz: "Yangilanish talab qilinadi, iltimos, so'rovni yangilang",
      ru: "Требуется обновление, обновите запрос",
    },
    428: {
      uz: "Old shart kerak, talablarni bajaring",
      ru: "Необходимо предварительное условие, выполните требования",
    },
    429: {
      uz: "Ko'p so'rovlar, keyinroq qayta urinib ko'ring",
      ru: "Слишком много запросов, попробуйте позже",
    },
    431: {
      uz: "So'rov sarlavhalari juda katta, qisqartiring",
      ru: "Заголовки запроса слишком велики, сократите их",
    },
    451: {
      uz: "Huquqiy sabablarga ko'ra mavjud emas",
      ru: "Недоступно по юридическим причинам",
    },
    500: {
      uz: "Serverda ichki xatolik yuz berdi, keyinroq qayta urinib ko'ring",
      ru: "Внутренняя ошибка сервера, попробуйте позже",
    },
  };

  return (
    tt(statusMessages[status]?.uz, statusMessages[status]?.ru) ||
    "Noma'lum xato yuz berdi / Неизвестная ошибка"
  );
};

export function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateAll(isoString: string): string {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
