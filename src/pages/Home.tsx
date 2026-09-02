import { useSelector } from "react-redux";
import AdminDashboard from "./admin/dashboard";
import RegionDashboard from "./dashboard/RegionDashboard";

/**
 * "Asosiy" — rolga qarab ikki xil ko'rinish.
 *
 * Viloyat foydalanuvchisi yangi design tizimidagi panelni ko'radi;
 * markaziy admin paneli hozircha eski `admin/dashboard` da qoldi va
 * navbatdagi bosqichda ko'chiriladi.
 */
function Home() {
  const { user } = useSelector((state: any) => state.auth);
  return Boolean(user.region_id) ? <RegionDashboard /> : <AdminDashboard />;
}

export default Home;
