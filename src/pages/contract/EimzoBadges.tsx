import { formatDateTime, tt } from "@/utils";

const SIGNER_TYPE_LABEL: Record<string, { uz: string; ru: string }> = {
  admin: { uz: "Boshliq", ru: "Начальник" },
  lawyer: { uz: "Yurist", ru: "Юрист" },
};

/** Faqat shu blok ishlatadigan maydonlar — chaqiruvchidagi to'liq
 *  `VerificationInfo` bilan mos keladi (ortiqcha maydonlar muammo emas). */
export type VerificationItem = {
  id: number | string;
  signer_name: string;
  user_type?: string | null;
  created_at: string;
};

/**
 * E-IMZO tasdiqlash belgilari.
 *
 * Hujjatning eng oxirida turishi kerak: kafolat xati mavjud bo'lsa uning
 * ostida, aks holda smeta bo'limidan keyin. Ilgari blok smeta ichiga
 * qotirilgan edi va kafolat xati undan keyin chiqib, imzo hujjat
 * o'rtasida qolib ketardi.
 *
 * Bir xil nusxa to'rtta hujjat komponentida takrorlanardi (ekran va chop
 * etish variantlari) — chop etish versiyalarida esa umuman yo'q edi,
 * ya'ni PDF da imzo ko'rinmasdi. Shu sabab bitta joyga yig'ildi.
 *
 * Ranglar ataylab qat'iy: bu blok oq qog'ozga ham bosiladi.
 */
export default function EimzoBadges({ items }: { items?: VerificationItem[] }) {
  if (!items?.length) return null;

  return (
    <div className="mt-10 flex justify-end">
      <div className="flex flex-row flex-wrap justify-end gap-2">
        {items.map((v) => (
          <div
            key={v.id}
            className="inline-flex items-center gap-2 rounded-md border border-green-400 bg-green-50 px-3 py-2 text-[12px] text-green-800"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              className="text-green-600"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.41 14.42L7.17 12l1.41-1.41 2.01 2.01 5.04-5.04 1.41 1.42-6.46 6.44z" />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold">
                {v.signer_name}
                {v.user_type && SIGNER_TYPE_LABEL[v.user_type] && (
                  <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                    {tt(
                      SIGNER_TYPE_LABEL[v.user_type].uz,
                      SIGNER_TYPE_LABEL[v.user_type].ru
                    )}
                  </span>
                )}
              </span>
              <span className="text-[10px] text-green-700">
                {tt("E-IMZO bilan tasdiqlandi", "Утверждено E-IMZO")}:{" "}
                {formatDateTime(v.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
