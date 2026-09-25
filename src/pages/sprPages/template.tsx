import Spr from "@/pageCompoents/Spr";
import { tt } from "@/utils";

// Shartnoma shablonlari kodda saqlanadi (backend `contract.shablon/templates/`)
// va tanlangan tilda keladi — bu yerda faqat ko'rish mumkin.
const Template = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{tt("Shablonlar", "Шаблоны")}</h2>
      </div>
      <Spr
        titleT={tt("Shablon nomi", "Название шаблона")}
        path="template"
        text="shablon_name"
        label={tt("Shablon nomi", "Название шаблона")}
      />
    </div>
  );
};

export default Template;
