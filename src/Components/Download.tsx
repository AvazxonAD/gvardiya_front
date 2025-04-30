import { alertt } from "@/Redux/LanguageSlice";
import { getExcel } from "@/api";
import { tt } from "@/utils";

import { useDispatch, useSelector } from "react-redux";
import Button from "./reusable/button";

function Download({ open, URL, closeModal }: any) {
  const JWT = useSelector((s: any) => s.auth.jwt);
  const dispatch = useDispatch();
  const downloadExcel = async () => {
    try {
      const excelBlob = await getExcel(JWT, URL);
      const url = window.URL.createObjectURL(excelBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${URL.split("/")[2]}_file.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      dispatch(
        alertt({
          text: tt("Excel file yuklandi", "Файл Excel загружен"),
          success: true,
        })
      );
    } catch (error) {
      dispatch(
        alertt({
          text: tt(
            "Excel file yuklanishda muamo mavjud",
            "Проблема с загрузкой файла Excel"
          ),
          success: false,
        })
      );
    }
  };
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-[#00000066]  flex items-center justify-center z-50">
          <div className="bg-mybackground rounded-[6px]  w-[512px] h-[212px] text-mytextcolor shadow-[0.5px_0.5px_4px_0px_#00000026] flex justify-center items-center">
            <div className="w-[70%] mx-auto ">
              <h1 className=" leading-[19.36px]  mb-3 font-[600]">
                {tt("Faylni yuklab olish", "Скачать файл")}
              </h1>

              <div className="text-mytextcolor mb-6 text-[14px]  leading-[16.94px] font-[400]">
                {tt(
                  "Faylni yuklab olib olmoqchimisiz? Unda “Yuklash” tugmasini bosing.",
                  "Хотите скачать файл? В нем нажмите кнопку Загрузить."
                )}
              </div>

              <div className="flex  items-center gap-5 justify-center">
                <Button mode="cancel" onClick={closeModal} />
                <Button
                  mode="download"
                  onClick={() => {
                    downloadExcel();
                    closeModal();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Download;
