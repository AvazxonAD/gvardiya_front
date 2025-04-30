import { useSelector } from "react-redux";
import ReportAdmin from "./admin/report";
import ReportUser from "./report/index";


function Report() {
  const { user } = useSelector((state: any) => state.auth);
  return Boolean(user.region_id) ? <ReportUser /> : <ReportAdmin />
}

export default Report