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
        label={tt("Ijrochi", "Исполнитель")}
      />
    </div>
  );
}

export default Ijrochi;
