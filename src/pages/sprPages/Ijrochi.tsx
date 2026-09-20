import Spr from "../../pageCompoents/Spr";
import { tt } from "../../utils";

function Ijrochi() {
  return (
    <div>
      <Spr
        title={tt("Ijrochi", "Исполнитель")}
        titleT={tt("Ijrochi", "Исполнитель")}
        path={"doer"}
        text={"doer"}
        /* Ikkita maydon: `doer` (bajaruvchi nomi) va `title` (shartnoma
           hujjatining sarlavhasi). Server ikkalasini birga talab qiladi —
           ilgari faqat `doer` yuborilib, saqlash umuman ishlamasdi. */
        pair={"doer"}
        label={tt("Ijrochi", "Исполнитель")}
      />
    </div>
  );
}

export default Ijrochi;
