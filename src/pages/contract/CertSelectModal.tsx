import { tt } from "@/utils";
import type { EimzoCertificate } from "@/lib/eimzo";

interface Props {
  open: boolean;
  certs: EimzoCertificate[];
  onSelect: (cert: EimzoCertificate) => void;
  onClose: () => void;
}

// "2026.04.03 14:38:13" -> "03.04.2026"
const fmtDate = (s?: string) => {
  if (!s) return "";
  const m = s.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : s;
};

// Bir nechta E-IMZO kaliti bo'lsa, qaysi biri bilan imzolashni tanlash oynasi.
// Tanlangandan keyin E-IMZO aynan shu kalit uchun parol so'raydi.
const CertSelectModal = ({ open, certs, onSelect, onClose }: Props) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            {tt("Kalitingizni tanlang", "Выберите ваш ключ")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="p-3 space-y-1 max-h-[65vh] overflow-y-auto">
          {certs.map((cert, i) => (
            <button
              key={cert.serialNumber || i}
              type="button"
              disabled={cert.expired}
              onClick={() => onSelect(cert)}
              className="w-full text-left rounded-lg px-4 py-3 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-transparent"
            >
              <div className="flex items-start gap-3">
                {/* Kalit ikonkasi */}
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600 flex-shrink-0 mt-1">
                  <circle cx="7.5" cy="15.5" r="4.5" />
                  <path d="M10.7 12.3 21 2" />
                  <path d="M18 5l3 3" />
                  <path d="M15 8l3 3" />
                </svg>

                <div className="min-w-0 text-sm leading-snug">
                  <div className="font-bold">
                    {tt("SERTIFIKAT №", "СЕРТИФИКАТ №")}: {cert.serialNumber}
                    {cert.expired && (
                      <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold rounded bg-red-100 text-red-700 align-middle">
                        {tt("Muddati o'tgan", "Истёк срок")}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">INN:</span> {cert.tin}{" "}
                    <span className="font-bold">{tt("JISMONIY SHAXS", "ФИЗИЧЕСКОЕ ЛИЦО")}</span>
                  </div>
                  <div className="truncate">
                    <span className="font-semibold">F.I.Sh.:</span>{" "}
                    <span className="uppercase">{cert.fio}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {tt("Sertifikatni amal qilish muddati", "Срок действия сертификата")}:{" "}
                    {fmtDate(cert.validFrom)} - {fmtDate(cert.validTo)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-semibold cursor-pointer"
          >
            {tt("Bekor qilish", "Отмена")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertSelectModal;
