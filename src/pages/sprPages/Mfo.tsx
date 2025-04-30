import Spr from "../../pageCompoents/Spr";
import { latinToCyrillic, tt } from "../../utils";

function Mfo() {
  return (
    <div>
      <Spr
        title={tt("INN", latinToCyrillic("INN"))}
        titleT={tt("INN raqami", latinToCyrillic("INN номер"))}
        path={"str"}
        number={3}
        text={"str"}
        label={tt("INN raqami", latinToCyrillic("INN номер"))}
      />
    </div>
  );
}

export default Mfo;
