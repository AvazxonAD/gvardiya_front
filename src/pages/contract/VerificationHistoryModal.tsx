import { useEffect, useState } from "react";
import { useRequest } from "@/hooks/useRequest";
import { formatDateTime, tt, viewAndDownloadPdf } from "@/utils";
import { URL as API_URL } from "@/api";

interface HistoryItem {
  id: number;
  contract_id: number;
  user_id: number | null;
  user_fio: string | null;
  file_name: string | null;
  signer_name: string | null;
  sig_file: string | null;
  status: string;
  user_type: string | null;
  reason?: string | null;
  created_at: string;
}

const USER_TYPE_LABEL: Record<string, { uz: string; ru: string }> = {
  admin: { uz: "Boshliq", ru: "Начальник" },
  lawyer: { uz: "Yurist", ru: "Юрист" },
};

interface Props {
  contractId: string | number;
  docNum?: string | number;
  open: boolean;
  onClose: () => void;
}

const STATUS_META: Record<string, { label_uz: string; label_ru: string; bg: string; text: string }> = {
  created: {
    label_uz: "Yaratildi",
    label_ru: "Создано",
    bg: "bg-blue-100",
    text: "text-blue-800",
  },
  updated: {
    label_uz: "O'zgartirildi",
    label_ru: "Изменено",
    bg: "bg-amber-100",
    text: "text-amber-800",
  },
  verified: {
    label_uz: "Tasdiqlandi",
    label_ru: "Утверждено",
    bg: "bg-green-100",
    text: "text-green-800",
  },
  rejected: {
    label_uz: "Rad qilindi",
    label_ru: "Отклонено",
    bg: "bg-red-100",
    text: "text-red-800",
  },
};

const VerificationHistoryModal = ({ contractId, docNum, open, onClose }: Props) => {
  const request = useRequest();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    request
      .get(`/contract/${contractId}/verification/history`)
      .then((res) => {
        if (cancelled) return;
        if (res.data?.success) {
          setItems(res.data.data || []);
        } else {
          setError(res.data?.message || "Xatolik");
        }
      })
      .catch((e: any) => {
        if (!cancelled) setError(e?.message || "Xatolik");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, contractId]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            {tt("Shartnoma jarayonlari tarixi", "История изменений договора")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex justify-center py-8">
              <span className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {tt("Hozircha hech qanday jarayon yo'q", "Пока нет ни одного события")}
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
              {items.map((item) => {
                const meta = STATUS_META[item.status] || {
                  label_uz: item.status,
                  label_ru: item.status,
                  bg: "bg-gray-100",
                  text: "text-gray-700",
                };
                return (
                  <li key={item.id} className="ml-6">
                    <span className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ${meta.bg} ring-4 ring-white dark:ring-gray-900`}>
                      <span className={`w-2 h-2 rounded-full ${meta.text.replace("text-", "bg-")}`} />
                    </span>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${meta.bg} ${meta.text}`}>
                            {tt(meta.label_uz, meta.label_ru)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(item.created_at)}
                          </span>
                        </div>

                        {item.file_name && (
                          <button
                            type="button"
                            onClick={() =>
                              viewAndDownloadPdf(
                                API_URL + item.file_name,
                                `shartnoma_${docNum || contractId}_${item.id}.pdf`,
                              )
                            }
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                            </svg>
                            PDF
                          </button>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {item.status === "verified" && item.signer_name && (
                          <div>
                            <span className="font-semibold text-gray-600 dark:text-gray-400">
                              {tt("Tasdiqlagan", "Утвердил")}:
                            </span>{" "}
                            {item.signer_name}
                            {item.user_type && USER_TYPE_LABEL[item.user_type] && (
                              <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-700">
                                {tt(USER_TYPE_LABEL[item.user_type].uz, USER_TYPE_LABEL[item.user_type].ru)}
                              </span>
                            )}
                          </div>
                        )}
                        {item.user_fio && (
                          <div>
                            <span className="font-semibold text-gray-600 dark:text-gray-400">
                              {tt("Foydalanuvchi", "Пользователь")}:
                            </span>{" "}
                            {item.user_fio}
                          </div>
                        )}
                        {item.status === "rejected" && item.reason && (
                          <div className="sm:col-span-2 text-red-700 dark:text-red-400">
                            <span className="font-semibold">
                              {tt("Rad qilish sababi", "Причина отказа")}:
                            </span>{" "}
                            {item.reason}
                          </div>
                        )}
                        {/* Imzo (.sig) fayli foydalanuvchiga ko'rsatilmaydi — texnik fayl */}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-semibold cursor-pointer"
          >
            {tt("Yopish", "Закрыть")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationHistoryModal;
