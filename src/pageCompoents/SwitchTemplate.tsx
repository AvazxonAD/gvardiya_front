import Modal from "@/Components/Modal";
import { templateInterface } from "@/interface";
import { tt } from "@/utils";
import React from "react";
import { useSearchParams } from "react-router-dom";

interface Props {
  templatesData: templateInterface[];
  open: boolean;
  setTemplatesdata: React.Dispatch<React.SetStateAction<templateInterface[]>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const SwitchTemplate = (props: Props) => {
  const [urlParams, setUrlParams] = useSearchParams();
  const template_id = urlParams.get("template_id");

  const handleChangeTemplate = (data: templateInterface, idx: number) => {
    if (props.templatesData[idx].active) return;

    props.setTemplatesdata((prevTemplates) =>
      prevTemplates.map((template, index) =>
        index === idx
          ? { ...template, active: true }
          : { ...template, active: false }
      )
    );

    props.setOpen(false);
    if (template_id) {
      const newParams = new URLSearchParams(urlParams);
      newParams.set("template_id", data.id.toString());
      setUrlParams(newParams);
    }
  };

  return (
    <Modal
      closeModal={() => props.setOpen(false)}
      open={props.open}
      title={tt(`Shablonlar`, "Шаблоны")}
      w={"1000px"}>
      <div className="cursor-pointer flex flex-wrap gap-2 rounded-md bg-[#f6f6f6] dark:bg-[#3d3d3f] p-2">
        {props.templatesData.map((el, idx) => (
          <div
            key={idx}
            onClick={() => handleChangeTemplate(el, idx)}
            className={`flex w-[150px] h-[150px] bg-mybackground  justify-center items-center rounded-md border-[2px] ${el.active ? "border-[#ff7d2c]" : "border-[transparent]"
              }`}>
            {el.shablon_name}
          </div>
        ))}
      </div>
    </Modal>
  );
};
