import { useSelector } from "react-redux";
import AdminDashboard from "./admin/dashboard";
import UserMonitoring from "./home/monitoring";

function Home() {
  const { user } = useSelector((state: any) => state.auth);
  return Boolean(user.region_id) ? <UserMonitoring /> : <AdminDashboard />
}
export default Home


