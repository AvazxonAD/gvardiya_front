import { useSelector } from "react-redux";
import AdminMonitoring from "./admin/monitoring";
import UserMonitoring from "./home/monitoring";

function Home() {
  const { user } = useSelector((state: any) => state.auth);
  return Boolean(user.region_id) ? <UserMonitoring /> : <AdminMonitoring />
}
export default Home


