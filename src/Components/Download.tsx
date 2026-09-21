import { useDispatch, useSelector } from "react-redux";
import { Download as DownloadIcon, FileSpreadsheet } from "lucide-react";

import { alertt } from "@/Redux/LanguageSlice";
import { getExcel } from "@/api";
import { tt } from "@/utils";
import { Button, Modal } from "@/ui";

/**
 * Excel yuklab olishni tasdiqlash oynasi — yangi dizayn tizimida.
 * Props interfeysi o'zgarmadi (`open`, `URL`, `closeModal`).
 */
function Download({ open, URL: url, closeModal }: any) {
  const JWT = useSelector((s: any) => s.auth.jwt);
  const dispatch = useDispatch();

  const downloadExcel = async () => {
    try {
      const excelBlob = await getExcel(JWT, url);
      const blobUrl = window.URL.createObjectURL(excelBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${url.split("/")[2]}_file.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      dispatch(
        alertt({
          text: tt("Excel fayl yuklandi", "Файл Excel загружен"),
          success: true,
        })
      );
    } catch (error) {
      dispatch(
        alertt({
          text: tt(
            "Excel faylni yuklashda muammo yuz berdi",
            "Проблема с загрузкой файла Excel"
          ),
          success: false,
        })
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      size="sm"
      title={tt("Faylni yuklab olish", "Скачать файл")}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={closeModal}>
            {tt("Bekor qilish", "Отмена")}
          </Button>
          <Button
            onClick={() => {
              downloadExcel();
              closeModal();
            }}
          >
            <DownloadIcon />
            {tt("Yuklash", "Загрузить")}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-none bg-success/10 text-success">
          <FileSpreadsheet className="size-5" />
        </span>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {tt(
            "Ma'lumotlar Excel faylga yuklab olinadi. Davom etish uchun “Yuklash” tugmasini bosing.",
            "Данные будут выгружены в файл Excel. Нажмите «Загрузить», чтобы продолжить."
          )}
        </p>
      </div>
    </Modal>
  );
}

export default Download;
