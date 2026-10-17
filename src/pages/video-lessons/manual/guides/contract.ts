import { shotIn, type SectionGuide } from "../types";

const shot = shotIn("contract");

/**
 * "Shartnomalar ro'yhati". Yangi shartnoma tuzish — "Ishni boshlash"
 * ning 7–10-bosqichlarida; bu yerda ro'yxat va shartnomadan keyingi
 * amallar (tasdiqlash, xodim biriktirish, hisobotlar).
 */
export const contract: SectionGuide = {
  intro: [
    "Barcha shartnomalar bir joyda: summasi, kelib tushgan to'lov, qarzdorlik va tasdiq holati. Yangi shartnoma tuzish tartibi «Ishni boshlash» bo'limining 7–10-bosqichlarida yozilgan.",
    "Все договоры в одном месте: сумма, поступившие оплаты, задолженность и статус подтверждения. Порядок создания нового договора описан в шагах 7–10 раздела «Начало работы».",
  ],
  steps: [
    {
      title: ["Ro'yxatni o'qish", "Как читать список"],
      body: [
        "Jadvalda har bir qator — bitta shartnoma. Ro'yxat yuqori panelda tanlangan hisob raqam bo'yicha ko'rsatiladi.",
        "Каждая строка таблицы — один договор. Список показывается по счёту, выбранному на верхней панели.",
      ],
      items: [
        [
          "«№» — shartnoma raqami; bosilsa shartnoma hujjati ochiladi.",
          "«№» — номер договора; при нажатии открывается документ договора.",
        ],
        [
          "«Buyurtmachi» — sichqonchani ustiga olib borsangiz, tashkilotning nomi, manzili, INN va hisob raqami chiqadi.",
          "«Заказчик» — при наведении мыши показываются название, адрес, ИНН и счёт организации.",
        ],
        [
          "«Hisoblangan» — chegirmadan keyingi summa, «Kelib tushgan» — kirimlar, «Qarzdorlik» — qolgan qarz, «Chiqim» — chiqimlar.",
          "«Начислено» — сумма после скидки, «Поступило» — приходы, «Задолженность» — остаток долга, «Расход» — расходы.",
        ],
        [
          "«Xodim» — topshiriqlarning hamma soatlariga xodim biriktirilganmi (✕ — hali to'liq emas); «Boshliq T» va «Yurist T» — rahbar va yurist tasdig'i; «Yuristga» — yuristga jo'natilganmi. «Sana» va «Tadbir manzili» — shartnoma sanasi va tadbir joyi.",
          "«Xodim» — закреплены ли сотрудники на все часы заданий (✕ — ещё не полностью); «Boshliq T» и «Yurist T» — подтверждение руководителя и юриста; «Yuristga» — отправлен ли юристу. «Дата» и «Адрес мероприятия» — дата договора и место мероприятия.",
        ],
      ],
      tip: [
        "«Boshliq T» va «Yurist T» belgilari: yashil ✓ — tasdiqlangan; sariq ✎ — shartnoma o'zgartirilgan, qayta tasdiqlash kerak; qizil ⚠ — yurist rad qilgan; ✕ — hali tasdiqlanmagan.",
        "Значки в «Boshliq T» и «Yurist T»: зелёная ✓ — подтверждено; жёлтый ✎ — договор изменён, нужно подтвердить заново; красный ⚠ — юрист отклонил; ✕ — ещё не подтверждено.",
      ],
      shots: [shot("01-royxat.webp", ["Shartnomalar ro'yxati", "Список договоров"])],
    },
    {
      title: ["Qidirish va filtrlar", "Поиск и фильтры"],
      body: [
        "Qidiruv maydoniga shartnoma raqami, tashkilot nomi, INN, manzil yoki batalon nomini yozing. Batafsil tanlash uchun «Filtrlar» tugmasini bosing.",
        "Введите в поиск номер договора, название организации, ИНН, адрес или название батальона. Для подробного отбора нажмите «Фильтры».",
      ],
      items: [
        ["«Bajarilish holati» — Bajarilgan / Bajarilmagan.", "«Статус выполнения» — выполнено / не выполнено."],
        ["«To'lov holati» — To'langan / To'lanmagan.", "«Статус оплаты» — оплачено / не оплачено."],
        [
          "«To'lov muddati» — muddati kelmagan, kechiktirilgan yoki muddati o'tgan qarzlar.",
          "«Срок оплаты» — долги со сроком не наступившим, просроченные или с истёкшим сроком.",
        ],
        ["«Chiqim holati» — Sarflangan / Sarflanmagan.", "«Статус расхода» — израсходовано / не израсходовано."],
        [
          "«Sanadan» va «Sanagacha» — shartnoma sanasi oralig'i.",
          "«С даты» и «По дату» — период по дате договора.",
        ],
      ],
      tip: [
        "Pastdagi «Muddati kelmagan», «Kechiktirilgan», «Muddati o'tgan» yozuvlarini bossangiz, ro'yxat shu qarzlar bo'yicha filtrlanadi. Filtrlarni bekor qilish — «Tozalash».",
        "Нажмите на плашки «Срок не наступил», «Просрочен платёж», «Просрочено» внизу — список отфильтруется по этим долгам. Сбросить фильтры — «Очистить».",
      ],
      shots: [shot("02-filtr.webp", ["Filtrlar paneli va jami summalar", "Панель фильтров и итоговые суммы"])],
    },
    {
      title: ["Qatordagi amallar", "Действия в строке"],
      body: [
        "Har bir qatorning oxirida beshta belgi-tugma bor (nomi sichqonchani ustiga olib borganda chiqadi):",
        "В конце каждой строки пять кнопок-значков (название появляется при наведении мыши):",
      ],
      items: [
        ["«Tahrirlash» (qalam) — shartnomani o'zgartirish.", "«Редактировать» (карандаш) — изменить договор."],
        [
          "«Xodim biriktirish» (odam va «+» belgisi) — topshiriqlarga xodimlarni biriktirish.",
          "«Закрепить сотрудников» (человек с «+») — назначить сотрудников на задания.",
        ],
        ["«Analiz» (diagramma belgisi) — shartnoma bo'yicha tahlil.", "«Анализ» (значок диаграммы) — анализ по договору."],
        [
          "«Shartnomani bekor qilish» (chizilgan doira) — tadbir bo'lmaydigan shartnomani bekor qilish (keyingi bosqich).",
          "«Отменить договор» (перечёркнутый круг) — отменить договор, если мероприятия не будет (следующий шаг).",
        ],
        ["«O'chirish» (savat) — shartnomani o'chirish.", "«Удалить» (корзина) — удалить договор."],
      ],
      warn: [
        "Shartnoma bo'yicha kirim, chiqim yoki xodimlarga to'lov qilingan bo'lsa, uni o'chirib ham, summasini o'zgartirib ham bo'lmaydi — «Ushbu hujjat bilan bog'liq hujjatlar mavjud» degan xabar chiqadi. Avval o'sha hujjatlarni o'chiring. Topshiriqlarga xodim biriktirilgan bo'lsa, shartnomani o'chirib bo'lmaydi; tahrirda esa xodimli topshiriqni olib tashlab, batalonini, sanasini yoki bir soat narxini (BHM, chegirma) o'zgartirib, hajmini biriktirilgan soatdan kamaytirib bo'lmaydi, tadbir sanasi va vaqti esa biriktirilgan xodimlarni o'z ichiga olishi kerak. Manzil, raqam, tashkilot va hisob raqamlarini o'zgartirish, yangi topshiriq qo'shish mumkin. Kirim qilingan shartnomada tashkilot o'zgarmaydi — u kirimdagi tashkilot bilan bir xil bo'lishi kerak.",
        "Если по договору есть приходы, расходы или выплаты сотрудникам, его нельзя удалить или изменить сумму — появится сообщение о связанных документах. Сначала удалите их. Если на задания прикреплены сотрудники, договор нельзя удалить, а при изменении нельзя убрать задание с сотрудниками, сменить его батальон, дату или стоимость часа (БХМ, скидку) и уменьшить объём ниже назначенных часов; даты и время мероприятия должны охватывать назначения. Адрес, номер, организацию и счета менять можно, новые задания — добавлять. Если по договору есть приход, организацию изменить нельзя — она должна совпадать с организацией в приходе.",
      ],
      tip: [
        "Shartnoma tahrirlanib saqlansa, oldingi tasdiqlar bekor bo'ladi (sariq ✎) — uni yuristga qayta jo'natib, qayta tasdiqlash kerak.",
        "После изменения договора прежние подтверждения сбрасываются (жёлтый ✎) — его нужно снова отправить юристу и подтвердить.",
      ],
      shots: [shot("03-amallar.webp", ["Qatordagi amallar tugmalari", "Кнопки действий в строке"])],
    },
    {
      title: ["Shartnomani bekor qilish", "Отмена договора"],
      body: [
        "Tadbir bo'lmaydigan bo'lsa, shartnomani o'chirmasdan bekor qilish mumkin: u saqlanib qoladi, lekin hech qayerda hisobga olinmaydi. Qatordagi «Shartnomani bekor qilish» tugmasini bosing — «Shartnomani bekor qilasizmi?» oynasi chiqadi. Shartnoma raqami, buyurtmachi va summani tekshirib, «Ha, bekor qilish» ni bosing.",
        "Если мероприятия не будет, договор можно не удалять, а отменить: он сохранится, но нигде не будет учитываться. Нажмите в строке «Отменить договор» — появится окно «Отменить договор?». Проверьте номер, заказчика и сумму и нажмите «Да, отменить».",
      ],
      items: [
        [
          "Bekor qilish ikki shart bajarilganda mumkin: shartnomaga pul kelib tushmagan va chiqim qilinmagan. Tadbir sanasi ahamiyatsiz — tadbir boshlangan yoki o'tgan shartnoma ham bekor qilinadi. Aks holda tugma o'chiq turadi, sichqonchani ustiga olib borsangiz sababi chiqadi: «Pul kelib tushgan — bekor qilib bo'lmaydi» yoki «Chiqim qilingan — bekor qilib bo'lmaydi».",
          "Отменить можно при двух условиях: по договору не поступали деньги и не было расходов. Дата мероприятия не важна — можно отменить и начавшийся или прошедший договор. Иначе кнопка неактивна, а при наведении показывается причина: «Поступила оплата — отменить нельзя» или «Есть расход — отменить нельзя».",
        ],
        [
          "Pul kelib tushgan, lekin tadbir bo'lmaydigan bo'lsa — avval «Kirimlar kitobi» da shu shartnomaning kirimini bekor qiling, keyin shartnomani bekor qilish mumkin bo'ladi.",
          "Если деньги поступили, но мероприятия не будет, сначала отмените приход по этому договору в «Книге приходов» — после этого договор можно отменить.",
        ],
        [
          "Bekor qilingan shartnoma asosiy ro'yxatdan chiqadi, qarzdorlik, dashboard, hisobot va chiqimda hisobga olinmaydi, summasi jamlanmalarga qo'shilmaydi. Uni tahrirlab bo'lmaydi.",
          "Отменённый договор уходит из основного списка, не учитывается в задолженности, дашборде, отчётах и расходах, его сумма не входит в итоги. Изменить его нельзя.",
        ],
        [
          "«Qarzdorlik» sahifasida ham bekor qilish mumkin: kartochka yoki qarzdor tashkilot bosilganda ochiladigan shartnomalar ro'yxatida har qatorda «Bekor qilish» tugmasi bor.",
          "Отменить можно и на странице «Задолженность»: в списке договоров, который открывается по карточке или организации-должнику, в каждой строке есть кнопка «Отменить».",
        ],
      ],
      tip: [
        "Bekor qilish o'chirish emas: shartnoma «Bekor qilinganlar» ro'yxatida turadi va kerak bo'lsa qayta faollashtiriladi (keyingi bosqich).",
        "Отмена — не удаление: договор остаётся в списке «Отменённые» и при необходимости восстанавливается (следующий шаг).",
      ],
      shots: [shot("12-bekor-qilish.webp", ["«Shartnomani bekor qilasizmi?» oynasi", "Окно «Отменить договор?»"])],
    },
    {
      title: ["Bekor qilinganlar va qayta faollashtirish", "Отменённые договоры и восстановление"],
      body: [
        "Ro'yxat sahifasidagi «Bekor qilinganlar» tugmasi (yonida — soni) «Bekor qilingan shartnomalar» oynasini ochadi: shartnoma raqami, sanasi, buyurtmachisi, summasi (chizilgan — jamlanmaga qo'shilmaydi), qachon va kim bekor qilgani.",
        "Кнопка «Отменённые» на странице списка (рядом — их число) открывает окно «Отменённые договоры»: номер, дата, заказчик, сумма (зачёркнута — не входит в итоги), когда и кем отменён.",
      ],
      items: [
        [
          "Qidiruv — «№, tashkilot yoki INN». Buyurtmachi ustiga sichqoncha olib borsangiz, tashkilot ma'lumotlari chiqadi; shartnoma raqamini bossangiz, hujjat ochiladi.",
          "Поиск — по №, организации или ИНН. При наведении на заказчика показываются данные организации; нажмите номер договора — откроется документ.",
        ],
        [
          "Shartnoma yana kerak bo'lsa, qatordagi «Faollashtirish» ni bosing va «Ha, faollashtirish» bilan tasdiqlang — u yana asosiy ro'yxatga, qarzdorlik, dashboard va hisobotlarga qaytadi.",
          "Если договор снова нужен, нажмите в строке «Восстановить» и подтвердите «Да, восстановить» — он вернётся в основной список, задолженность, дашборд и отчёты.",
        ],
      ],
      shots: [shot("13-bekor-qilinganlar.webp", ["«Bekor qilingan shartnomalar» oynasi", "Окно «Отменённые договоры»"])],
    },
    {
      title: ["Shartnoma hujjati", "Документ договора"],
      body: [
        "Ro'yxatda shartnoma raqamini («№») bosing — shartnoma matni ochiladi. Yuqorida tugmalar: «Orqaga», «E-IMZO bilan tasdiqlash», «Yuristga jo'natish», «PDF», «Tarix», «Chop etish».",
        "Нажмите номер договора («№») в списке — откроется текст договора. Вверху кнопки: назад, подтверждение E-IMZO, отправка юристу, PDF, история, печать.",
      ],
      items: [
        ["«PDF» — hujjatni PDF fayl qilib yuklab olish.", "«PDF» — скачать документ в PDF."],
        ["«Chop etish» — printerda chop etish.", "«Печать» — распечатать на принтере."],
      ],
      tip: [
        "Hujjat tili yuqori paneldagi globus belgisidan tanlanadi: «O'zbek», «Ўзбек» yoki «Русский». Til almashtirilganda sahifa qayta yuklanadi.",
        "Язык документа выбирается значком глобуса на верхней панели: «O'zbek», «Ўзбек» или «Русский». При смене языка страница перезагружается.",
      ],
      shots: [shot("04-hujjat.webp", ["Shartnoma hujjati va tugmalar", "Документ договора и кнопки"])],
    },
    {
      title: ["Yuristga jo'natish", "Отправка юристу"],
      body: [
        "Hujjat sahifasida «Yuristga jo'natish» ni bosing. «Yuristga jo'natildi» xabari chiqadi, tugma o'rnida «✓ Yuristga jo'natilgan» yozuvi paydo bo'ladi. Endi yurist shartnomani tekshiradi va tasdiqlaydi yoki rad qiladi.",
        "На странице документа нажмите «Отправить юристу». Появится сообщение об отправке, а вместо кнопки — отметка «✓ Отправлено юристу». Юрист проверит договор и подтвердит или отклонит его.",
      ],
      warn: [
        "Yurist rad qilsa, sahifada qizil xabar chiqadi: «Shartnoma yurist tomonidan rad qilingan» va sababi. Kamchilikni tuzating va «Qayta yuristga jo'natish» ni bosing.",
        "Если юрист отклонит договор, на странице появится красное сообщение с причиной. Исправьте замечание и нажмите «Повторно отправить юристу».",
      ],
      shots: [shot("05-yurist.webp", ["«Yuristga jo'natish» tugmasi", "Кнопка отправки юристу"])],
    },
    {
      title: ["Rahbar tasdig'i (E-IMZO)", "Подтверждение руководителя (E-IMZO)"],
      body: [
        "Rahbar hujjat sahifasida «E-IMZO bilan tasdiqlash» ni bosadi, kalitini tanlaydi va parolini kiritadi. «Shartnoma muvaffaqiyatli tasdiqlandi!» xabari chiqadi, hujjat oxirida imzolovchi ismi va «E-IMZO bilan tasdiqlandi» belgisi paydo bo'ladi.",
        "Руководитель нажимает «Подтвердить через E-IMZO» на странице документа, выбирает ключ и вводит пароль. Появится сообщение об успешном подтверждении, а в конце документа — имя подписавшего и отметка E-IMZO.",
      ],
      warn: [
        "Kompyuterda E-IMZO va USB Manager dasturlari ochiq, kalit (fleshka) ulangan bo'lishi kerak. «E-IMZO xizmati (USB Manager) ishga tushmagan» chiqsa — USB Manager dasturini oching va qayta urining.",
        "На компьютере должны быть запущены программы E-IMZO и USB Manager и подключён ключ. Если появится сообщение, что служба E-IMZO (USB Manager) не запущена, — откройте USB Manager и повторите.",
      ],
      tip: [
        "Bir nechta kalit bo'lsa, «Kalitingizni tanlang» oynasi chiqadi. Parol noto'g'ri bo'lsa — «Noto'g'ri parol kiritildi».",
        "Если ключей несколько, появится окно выбора ключа. При неверном пароле будет сообщение об ошибке пароля.",
      ],
      shots: [shot("06-eimzo.webp", ["«E-IMZO bilan tasdiqlash» va kalit tanlash", "Подтверждение E-IMZO и выбор ключа"])],
    },
    {
      title: ["Jarayonlar tarixi", "История действий"],
      body: [
        "Hujjat sahifasidagi «Tarix» tugmasi «Shartnoma jarayonlari tarixi» oynasini ochadi: kim, qachon shartnomani yaratgan, o'zgartirgan, tasdiqlagan yoki rad qilgan (sababi bilan).",
        "Кнопка «История» открывает окно истории договора: кто и когда создал, изменил, подтвердил или отклонил его (с причиной).",
      ],
      shots: [shot("07-tarix.webp", ["«Shartnoma jarayonlari tarixi» oynasi", "Окно истории договора"])],
    },
    {
      title: ["Topshiriqqa xodim biriktirish", "Назначение сотрудников на задание"],
      body: [
        "Ro'yxatda qatordagi «Xodim biriktirish» tugmasini bosing — «Topshiriqlar» sahifasi ochiladi. Har bir topshiriq qatorida «Qolgan vaqt» bor: qizil ✗ — hali biriktirilmagan soat qolgan, yashil ✓ — hammasi biriktirilgan.",
        "Нажмите в строке списка «Закрепить сотрудников» — откроется страница «Задания». В каждой строке есть «Оставшееся время»: красный ✗ — остались незакреплённые часы, зелёный ✓ — всё закреплено.",
      ],
      ordered: true,
      items: [
        [
          "Batalon qatoridagi «+» («Xodim biriktirish») tugmasini bosing — qator ostida forma ochiladi.",
          "Нажмите «+» в строке батальона — под строкой откроется форма.",
        ],
        [
          "«Sana», «Boshlanish», «Tugash» — tadbir kuni va vaqti (shartnomadan o'zi to'ladi, kerak bo'lsa o'zgartiring).",
          "«Дата», «Начало», «Окончание» — день и время мероприятия (заполняются из договора, при необходимости измените).",
        ],
        [
          "Xodimlarni belgilang — avval belgi qo'yiladi, keyin soat yoziladi.",
          "Отметьте сотрудников — сначала галочка, потом часы.",
        ],
        [
          "Har biriga «Topshiriq vaqti» ni yozing yoki yuqoridagi «Soat» ga yozib, «Qo'llash» ni bosing (belgilanganlarning hammasiga qo'yiladi).",
          "Введите каждому часы или укажите «Час» вверху и нажмите «Применить» (проставится всем отмеченным).",
        ],
        [
          "«Qoldi: ... soat» ni kuzating va «Saqlash» ni bosing — «Muvaffaqiyatli bajarildi».",
          "Следите за «Осталось: ... ч» и нажмите «Сохранить».",
        ],
      ],
      warn: [
        "Jami soat qolgan vaqtdan oshsa — «Topshiriq vaqti noto'g'ri kiritildi!». Xodim o'sha kuni shu vaqtda boshqa tadbirda bo'lsa — «Quyidagi xodimlar band: ...» chiqadi.",
        "Если сумма часов больше оставшегося времени — будет ошибка. Если сотрудник в это время занят на другом мероприятии — появится сообщение о занятых сотрудниках.",
      ],
      tip: [
        "«+» tugmasi jadvalning o'ng chetida — ko'rinmasa, jadvalni o'ngga suring yoki chap menyuni «Yig'ish» bilan yig'ing. Kerakli xodim ro'yxatda bo'lmasa, formadagi «Xodim qo'shish» bilan shu yerning o'zida qo'shing. Hamkor tashkilot qatorlarida «+» yo'q — ularga to'lov «Chiqimlar kitobi» orqali qilinadi.",
        "Кнопка «+» — у правого края таблицы; если её не видно, прокрутите таблицу вправо или сверните левое меню. Если нужного сотрудника нет, добавьте его прямо здесь кнопкой «Добавить сотрудника». У строк партнёрских организаций «+» нет — им платят через «Книгу расходов».",
      ],
      shots: [shot("08-xodim-biriktirish.webp", ["Xodim biriktirish formasi", "Форма назначения сотрудников"])],
    },
    {
      title: ["Biriktirilgan xodimlarni ko'rish", "Просмотр назначенных сотрудников"],
      body: [
        "Topshiriq qatoridagi ko'z belgisi («Xodimlarni ko'rish») biriktirilgan xodimlar ro'yxatini ochadi: yuqorida jami ko'rsatkichlar va «Ismlar bo'yicha qidiruv», jadvalda F.I.Sh., «Topshiriq vaqti», «Summa», «Foydalanuvchi» (kim biriktirgani) va sana/vaqt. Savat — xodimni topshiriqdan olib tashlash.",
        "Значок глаза («Просмотр сотрудников») открывает список назначенных: вверху итоги и поиск по именам, в таблице Ф.И.О., часы, сумма, пользователь (кто назначил), дата и время. Корзина — снять сотрудника с задания.",
      ],
      warn: [
        "Olib tashlash tasdiq so'ramaydi. Soatni o'zgartirish uchun xodimni olib tashlab, qayta biriktiring. Bu topshiriq bo'yicha xodimlarga to'lov hujjati tuzilgan bo'lsa, olib tashlab bo'lmaydi.",
        "Удаление происходит без подтверждения. Чтобы изменить часы, снимите сотрудника и назначьте заново. Если по заданию уже есть документ выплаты сотрудникам, снять нельзя.",
      ],
      shots: [shot("09-xodimlar.webp", ["«Xodimlarni ko'rish» oynasi", "Окно просмотра сотрудников"])],
    },
    {
      title: ["Shartnoma tahlili", "Анализ договора"],
      body: [
        "Qatordagi «Analiz» tugmasi «Shartnoma tahlili» sahifasini ochadi:",
        "Кнопка «Анализ» в строке открывает страницу анализа договора:",
      ],
      items: [
        [
          "«Umumiy» — shartnoma summasi (chegirmadan keyin), «Chegirma» — chegirma summasi.",
          "«Общая» — сумма договора (после скидки), «Скидка» — сумма скидки.",
        ],
        [
          "«Debet» — kelib tushgan to'lovlar, «Kredit» — buyurtmachining qolgan qarzi.",
          "«Дебет» — поступившие оплаты, «Кредит» — остаток долга заказчика.",
        ],
        [
          "«Chiqim» — hamkor tashkilot va xodimlarga to'langan, «Qoldiq» — shartnomada qolgan pul.",
          "«Расход» — выплачено партнёрам и сотрудникам, «Остаток» — деньги, оставшиеся по договору.",
        ],
        [
          "Pastda «Kirim», «Chiqim» va «Chiqim F.I.Sh.» ro'yxatlari — har birini «⋮» orqali Excel yoki PDF qilib yuklab olish mumkin.",
          "Ниже — списки приходов, расходов и выплат сотрудникам; каждый можно выгрузить через «⋮» в Excel или PDF.",
        ],
      ],
      shots: [shot("10-analiz.webp", ["«Shartnoma tahlili» sahifasi", "Страница анализа договора"])],
    },
    {
      title: ["Hisobotlarni yuklab olish", "Выгрузка отчётов"],
      body: [
        "Ro'yxat sahifasidagi «⋮» (Yuklab olish) tugmasini bosing:",
        "Нажмите кнопку «⋮» (Скачать) на странице списка:",
      ],
      items: [
        [
          "«Shartnomalar hisoboti — Excel» yoki «— PDF» — tanlangan davr bo'yicha umumiy hisobot.",
          "«Отчёт по договорам — Excel / PDF» — общий отчёт за выбранный период.",
        ],
        [
          "«Batalon bo'yicha shartnomalar — Excel» (yoki «— PDF») — keyin ochilgan «Batalonni tanlang» oynasida batalonni tanlab, yuklab olish tugmasini bosing.",
          "«Договоры по батальону — Excel / PDF» — затем в окне выбора батальона выберите батальон и нажмите кнопку выгрузки.",
        ],
        [
          "«Excel formatda yuklab olish» yoki «PDF formatda yuklab olish» (Jadval ro'yxati) — ekrandagi jadvalning o'zi.",
          "«Скачать в Excel» или «Скачать в PDF» (список таблицы) — сама таблица с экрана.",
        ],
        [
          "«Import shabloni (Excel)» (menyuning oxirida) — shartnomalarni Exceldan import qilish shabloni. «Shartnomalar» varag'ini to'ldiring (qoidalar — «Izoh» varag'ida), 901–912 raqamli namuna qatorlarini o'chiring va faylni super-adminga yuboring — u «Shartnoma importi» bo'limida yuklaydi.",
          "«Шаблон импорта (Excel)» (в конце меню) — шаблон для импорта договоров из Excel. Заполните лист «Shartnomalar» (правила — на листе «Izoh»), удалите строки-образцы с номерами 901–912 и отправьте файл супер-админу — он загрузит его в разделе «Импорт договоров».",
        ],
      ],
      shots: [shot("11-yuklab-olish.webp", ["«⋮» menyusi", "Меню «⋮»"])],
    },
  ],
};
