import Spr from "../../pageCompoents/Spr";
import { tt } from "../../utils";

function Manzil() {
  return (
    <div>
      {" "}
      <Spr
        title={tt("Manzil", "Адрес")}
        titleT={tt("Manzil", "Адрес")}
        path={"adress"}
        text={"adress"}
        label={tt("Manzil", "Адрес")}
      />
    </div>
  );
}

export default Manzil;
