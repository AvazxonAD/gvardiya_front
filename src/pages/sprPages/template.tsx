import Button from "@/Components/reusable/button";
import Spr from "@/pageCompoents/Spr";
import { tt } from "@/utils";
import { useNavigate } from "react-router-dom";

const Template = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{tt("Shablonlar", "Шаблоны")}</h2>
        <Button
          mode="add"
          onClick={() => navigate("/spravichnik/template/create")}
        />
      </div>
      <Spr
        titleT={tt("Shablon nomi", "Название шаблона")}
        path="template"
        text="shablon_name"
        label={tt("Shablon nomi ismi", "Имя шаблона")}
      />
    </div>
  );
};

export default Template;
