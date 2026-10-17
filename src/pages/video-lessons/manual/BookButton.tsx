import { Download } from "lucide-react";
import { useSelector } from "react-redux";

import { getAppLang } from "@/lib/lang";
import { tt } from "@/utils";
import { Button } from "@/ui";
import { MANUALS, manualAudience } from "./sections";

/**
 * Qo'llanmaning PDF kitobi — oldindan tayyorlab qo'yilgan fayl
 * (`npm run manual:pdf`). Har kim o'z kitobini oladi: viloyat foydalanuvchisi
 * `public/manual/qollanma-<til>.pdf`, super-admin
 * `public/manual/qollanma-admin-<til>.pdf` — joriy til varianti.
 */
export default function BookButton({ className }: { className?: string }) {
  const user = useSelector((s: any) => s.auth.user);
  const audience = manualAudience(user);
  const lang = getAppLang();
  return (
    <Button variant="secondary" size="sm" asChild className={className}>
      <a
        href={`/manual/${MANUALS[audience].pdf}-${lang}.pdf`}
        download={
          audience === "admin"
            ? tt("Tadbir-Hisob super-admin qo'llanma.pdf", "Tadbir-Hisob руководство супер-администратора.pdf")
            : tt("Tadbir-Hisob qo'llanma.pdf", "Tadbir-Hisob руководство.pdf")
        }
        title={tt("Qo'llanmani PDF kitob ko'rinishida yuklab olish", "Скачать руководство в виде PDF-книги")}
      >
        <Download />
        {tt("PDF kitob", "PDF-книга")}
      </a>
    </Button>
  );
}
