import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import Icon, { IconName } from "@/assets/icons";
import { datas } from "@/assets/icons/map/uzb";
import { UserApiData } from "../types";

const regionImages: Record<number, string> = {
  1: "tashkent",
  2: "tashkent_v",
  3: "andijon",
  4: "buxoro",
  5: "fargona",
  6: "jizzax",
  7: "xorazm",
  8: "namangan",
  9: "navoiy",
  10: "qashqadaryo",
  11: "qoraqalpoq",
  12: "samarqand",
  13: "surxondaryo",
  14: "sirdaryo",
};

interface RegionMapProps {
  usersData: UserApiData[];
  onDetail: () => void;
}

export default function RegionMap({ usersData, onDetail }: RegionMapProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const regionId = user?.region_id;
  const regionName = datas?.find((r: any) => r?.id === regionId)?.title || "";
  const iconName = regionImages[regionId] as IconName | undefined;

  return (
    <div className="dash-glass p-[12px] lg:col-span-2 flex flex-col relative z-10 min-h-0">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[16px] font-semibold flex items-center text-[var(--dash-text)]">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-3 animate-pulse" />
          {regionName || "Viloyat"} Monitoring
        </h2>
        <button
          onClick={onDetail}
          className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 border border-blue-400/40 hover:border-blue-300/60 rounded-md px-2.5 py-1 transition"
        >
          Batafsil
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <p className="text-[var(--dash-text-secondary)] text-[12px] mb-1">
        Foydalanuvchilar kesimida mablag'lar harakati
      </p>

      <div className="flex-1 relative w-full flex items-center justify-center p-0 min-h-0 min-w-0 overflow-hidden">
        {iconName ? (
          <div className="w-[70%] h-full flex items-center justify-center region-map-svg">
            <Icon name={iconName} />
          </div>
        ) : (
          <p className="text-[var(--dash-text-muted)]">Xarita topilmadi</p>
        )}
      </div>
    </div>
  );
}
