import {
  Document,
  InfoInterFace,
  SingleTemplateInterface,
  SingleTemplateInterReplaced,
} from "@/interface";
import { formatNum } from "@/utils";
import { getFullDate } from "./utils";
import { formatDocDate } from "./docText";

const fontBold = (text: string | number) => `<span class="font-bold">${text}</span>`

export const replacer = (
  template: SingleTemplateInterface,
  data: Document,
  info: InfoInterFace,
  organisation: any
): SingleTemplateInterReplaced => {
  let newtemplate: Document | any = {};

  Object.keys(template).forEach((key: any) => {
    // Agar template kaliti string bo'lsa, o'zgartirishni amalga oshir
    //@ts-ignore
    if (typeof template[key] === "string") {
      //@ts-ignore

      newtemplate[key] = String(template[key] ?? "").replaceAll("${contract_number}", data.doc_num);
      newtemplate[key] = newtemplate[key].replaceAll("${doc_date}", getFullDate(data.doc_date));
      newtemplate[key] = newtemplate[key].replaceAll("${ijrochi}", fontBold(info.doer));
      newtemplate[key] = newtemplate[key].replaceAll("${client.name}", fontBold(organisation.name));
      newtemplate[key] = newtemplate[key].replaceAll("${client.boss}", fontBold(organisation.boss || "___________________"));
      newtemplate[key] = newtemplate[key].replaceAll("${start_date}", getFullDate(data.start_date));
      newtemplate[key] = newtemplate[key].replaceAll("${end_date}", getFullDate(data.end_date));
      newtemplate[key] = newtemplate[key].replaceAll("${end_time}", data.end_time);
      newtemplate[key] = newtemplate[key].replaceAll("${start_time}", data.start_time);
      newtemplate[key] = newtemplate[key].replaceAll("${address}", fontBold(data.adress));
      newtemplate[key] = newtemplate[key].replaceAll("${raxbar}", info.boss);
      newtemplate[key] = newtemplate[key].replaceAll("${period}", formatDate(data.period));
    }
    // Agar template kaliti array bo'lsa, har bir elementni o'zgartirish
    //@ts-ignore
    else if (Array.isArray(template[key])) {
      //@ts-ignore

      newtemplate[key] = template[key]
        .map((item: string) => {
          // Massiv elementi har doim ham matn bo'lmaydi — `replaceAll`
          // shunda yiqilardi va butun shartnoma sahifasi ochilmasdi.
          let newtext = String(item ?? "")
            //@ts-ignore
            .replaceAll("${contract_number}", data.doc_num)
            .replaceAll("${doc_date}", getFullDate(data.doc_date))
            .replaceAll("${ijrochi}", fontBold(info.doer))
            .replaceAll("${client.name}", fontBold(organisation.name))
            .replaceAll("${client.boss}", fontBold(organisation.boss || "___________________"))
            .replaceAll("${start_date}", getFullDate(data.start_date))
            .replaceAll("${end_date}", getFullDate(data.end_date))
            .replaceAll("${end_time}", data.end_time)
            .replaceAll("${start_time}", data.start_time)
            .replaceAll("${address}", fontBold(data.adress))
            .replaceAll("${raxbar}", info.boss)
            .replaceAll("${period}", formatDate(data.period))
            .replaceAll("${summa}", fontBold(formatNum(data.result_summa, true)));

          return "&nbsp;&nbsp;&nbsp;" + newtext + "<br>";
          // return "" + newtext + "<br>";
        })
        .join("");
    }
  });
  return newtemplate;
};


// `${period}` — shartnoma amal qilish muddati, hujjat tilida
function formatDate(input: string): string {
  if (!input) return "";
  const date = new Date(input);
  if (isNaN(date.getTime())) return "";
  return formatDocDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}
