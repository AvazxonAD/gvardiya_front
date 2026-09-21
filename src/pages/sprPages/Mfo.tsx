import Spr from "../../pageCompoents/Spr";
import { tt } from "../../utils";

function Mfo() {
  return (
    <div>
      <Spr
        title={tt("STIR", "ИНН")}
        titleT={tt("STIR raqami", "Номер ИНН")}
        path={"str"}
        number={3}
        text={"str"}
        label={tt("STIR raqami", "Номер ИНН")}
      />
    </div>
  );
}

export default Mfo;
