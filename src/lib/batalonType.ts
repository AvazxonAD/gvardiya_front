import { tt } from "@/utils";

/**
 * Quyi tuzilma (batalon) tegishliligi — bazada `batalon.type` (89.sql).
 *
 * Super-admin "Ommaviy tadbirlar hisoboti" pullarni shu bo'yicha idoralarga
 * ajratadi: MG = batalon + MG harbiy qismi, IIO = IIV, FVV = FVV.
 * `birgada` (hamkor tashkilot) bayrog'idan alohida — u topshiriq va chiqim
 * oqimini belgilaydi.
 */
export type BatalonType = "batalon" | "mg_harbiy_qism" | "iiv" | "fvv";

export const BATALON_TYPES: BatalonType[] = ["batalon", "mg_harbiy_qism", "iiv", "fvv"];

/** Funksiya: `tt` tanlangan tilni chaqirilgan paytda o'qiydi */
export const batalonTypeLabel = (type?: string | null): string => {
  switch (type) {
    case "mg_harbiy_qism":
      return tt("MG harbiy qismi", "Воинская часть НГ");
    case "iiv":
      return tt("IIV", "ОВД");
    case "fvv":
      return tt("FVV", "МЧС");
    default:
      return tt("Batalon", "Батальон");
  }
};
