import Spr from "../../pageCompoents/Spr";
import { tt } from "../../utils";

function Bank() {
  return <Spr title={tt("Bank", "Банк")} bank={true} />;
}

export default Bank;
