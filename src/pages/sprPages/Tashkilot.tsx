import Spr from "../../pageCompoents/Spr";
import {  tt } from "../../utils";

function Tashkilot() {
  return (
    <div>
      <Spr
        title={tt("Tashkilot rahbari", "Руководитель организации")}
        titleT={tt("Rahbar", "Лидер")}
       
        path={"boss"}
        text={"boss"}
        label={tt("Rahbar ismi", "Имя руководителя")}
      />
    </div>
  );
}

export default Tashkilot;
