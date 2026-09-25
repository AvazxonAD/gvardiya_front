import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import Protected from "./Components/Protected";
import ErrorPage from "./pages/404";
import UserTable from "./pages/admin/users";
import StaffPage from "./pages/region/staff";
import Batalon from "./pages/Batalon";
import ContractAnaliz from "./pages/contract/analiz";
import Contract from "./pages/contract/Contract";
import ContractHome from "./pages/contract/ContractHome";
import BatalonTasks from "./pages/batalon/task/index";
import BatalonWorkerTasks from "./pages/batalon/worker.tasks/index";
import ContractPage from "./pages/contract/contractPage";
import Document from "./pages/contract/Document";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Organisation from "./pages/Organisation";
import Prixod, { RenderPrixod } from "./pages/prixod";
import CreatePrixod from "./pages/prixod/create";
import { RenderRasxod } from "./pages/rasxod";
import { CreateRasxod } from "./pages/rasxod/createRasxod";
import { EditRasxod } from "./pages/rasxod/editRasxod";
import { Rasxod } from "./pages/rasxod/Rasxod";
import { RenderRasxodFio } from "./pages/RasxodFio";
import { CreateRasxodFio } from "./pages/RasxodFio/createRasxodFio";
import { EditRasxodFio } from "./pages/RasxodFio/editRasxodFio";
import { RasxodFio } from "./pages/RasxodFio/rasxodFio";
import AdminDashboard from "./pages/admin/dashboard";
import RegionDashboard from "./pages/dashboard/RegionDashboard";
import Report from "./pages/Report";
import AdminOverview from "./pages/admin/overview";
import AppShell from "./layout/AppShell";
import Spravichnik from "./pages/Spravichnik";
import Bxm from "./pages/sprPages/Bxm";
import Rekvizitlar from "./pages/sprPages/Rekvizitlar";
import Tasks from "./pages/Task";
import Workers from "./pages/Workers";
import BatalonWorkers from "./pages/batalon/worker";
import VideoLessons from "./pages/video-lessons";
import AdminVideoLessons from "./pages/admin/video-lessons";
import Logs from "./pages/logs";
import { isRealUser } from "./Redux/apiSlice";
import { decodeJwt } from "./services/tokenManager";
import { can, type PermAction } from "./lib/permissions";
import { getHomePathForUser } from "./layout/menu";

// Eski "Yurist shartnoma" hujjat havolasi — oddiy shartnoma sahifasiga
function LawyerRedirect() {
  const { id } = useParams();
  return <Navigate to={`/contract/view/${id}`} replace />;
}

const MainProvider = () => {
  const { user } = useSelector((state: any) => state.auth);
  const token = useSelector((state: any) => state.auth.jwt);

  // Ilova faqat store'dagi `user` token egasining o'zi bo'lganda ochiladi.
  // Kirishda token `user`dan oldin keladi (`setTokens` login javobidayoq
  // `putJwt` qiladi), store'da esa bo'sh andoza yoki oldingi foydalanuvchi
  // turadi. Quyidagi rol tanlovi ularni super-admin deb, bosh sahifada
  // `admin/dashboard` so'rovlarini yuborardi (viloyat admini, yuristda 403).
  // Shu oraliqda kirish sahifasi qoladi.
  const loggedIn =
    Boolean(token) &&
    token !== "out" &&
    isRealUser(user) &&
    String(decodeJwt(token)?.id) === String(user.id);

  const c = (menu: string, action: PermAction = "read") => can(user, menu, action);

  return (
    <BrowserRouter>
      <Routes>
        {loggedIn ? (
          <>
            <Route
              path="/"
              element={
                <Protected>
                  <AppShell />
                </Protected>
              }
            >
              {user.type === "jstb" ? (
                <Fragment>
                  {/* JSTB xodimi — faqat super-admin dashboardi */}
                  <Route index={true} element={<AdminDashboard />} />
                </Fragment>
              ) : Boolean(user.batalon) ? (
                <Fragment>
                  {/* Batalon uchun bosh sahifa — `getHomePathForUser` ham
                      shu yerga yo'naltiradi */}
                  <Route index={true} element={<BatalonTasks />} />
                  <Route path="/batalon/workers" element={<BatalonWorkers />} />
                  <Route path="/batalon/tasks" element={<BatalonTasks />} />
                  <Route
                    path="/batalon/worker/tasks/:id"
                    element={<BatalonWorkerTasks />}
                  />
                </Fragment>
              ) : Boolean(user.region_id) ? (
                // Viloyat admini hammasini ko'radi; yurist va buxgalter —
                // admin bergan ruhsatlar bo'yicha (`can` adminda doim true)
                <Fragment>
                  <Route
                    index={true}
                    element={
                      c("dashboard") ? (
                        <RegionDashboard />
                      ) : (
                        <Navigate to={getHomePathForUser(user)} replace />
                      )
                    }
                  />
                  {c("report") && <Route path="/report" element={<AdminOverview scope="region" />} />}
                  {c("video_lessons") && (
                    <Route path="/video-lessons" element={<VideoLessons />} />
                  )}
                  {c("logs") && <Route path="/logs" element={<Logs />} />}
                  {/* Xodimlar va ularning ruhsatlarini faqat viloyat admini boshqaradi */}
                  {user.type !== "accountant" && user.type !== "lawyer" && (
                    <Route path="/staff" element={<StaffPage />} />
                  )}
                  {/* Yurist uchun alohida sahifa yo'q — u ham "Shartnomalar" da
                      ishlaydi. Eski havolalar shu yerga yo'naltiriladi. */}
                  <Route path="/lawyer-contract" element={<Navigate to="/contract" replace />} />
                  <Route path="/lawyer-contract/view/:id" element={<LawyerRedirect />} />
                  {c("contract") && (
                    <Route path="/contract" element={<Contract />}>
                      <Route path="" element={<ContractHome />} />
                      {c("contract", "create") && (
                        <Route path="add" element={<ContractPage />} />
                      )}
                      <Route path="view/:id" element={<Document />} />
                      <Route path="analiz/:id" element={<ContractAnaliz />} />
                      <Route path="tasks/:id" element={<Tasks />} />
                      {c("contract", "update") && (
                        <Route path=":id" element={<ContractPage />} />
                      )}
                    </Route>
                  )}
                  {c("workers") && <Route path="/workers" element={<Workers />} />}
                  {c("batalon") && <Route path="/batalon" element={<Batalon />} />}
                  {c("organisation") && (
                    <Route path="/organisation" element={<Organisation />} />
                  )}
                  {/* Ma'lumotnoma: bitta sahifada rekvizitlar va hisob raqamlari.
                      BXM umumiy — super-admin yuritadi; ushlanmalar olib tashlandi. */}
                  {c("spravochnik") && (
                    <Route path="/spravichnik" element={<Spravichnik />}>
                      <Route path="" element={<Rekvizitlar />} />
                      {/* Eski havolalar (xatcho'plar) rekvizitlarga tushadi */}
                      <Route path="*" element={<Navigate to="/spravichnik" replace />} />
                    </Route>
                  )}
                  {c("rasxod") && (
                    <Route path="/rasxod" element={<RenderRasxod />}>
                      <Route path="" element={<Rasxod />} />
                      {c("rasxod", "create") && (
                        <Route path="create" element={<CreateRasxod />} />
                      )}
                      <Route path=":id" element={<EditRasxod />} />
                    </Route>
                  )}
                  {c("prixod") && (
                    <Route path="/prixod" element={<RenderPrixod />}>
                      <Route path="" element={<Prixod />} />
                      {c("prixod", "create") && (
                        <Route path="create" element={<CreatePrixod />} />
                      )}
                      <Route path=":id" element={<CreatePrixod />} />
                    </Route>
                  )}
                  {c("rasxod_workers") && (
                    <Route path="/rasxod-workers" element={<RenderRasxodFio />}>
                      <Route path="" element={<RasxodFio />} />
                      {c("rasxod_workers", "create") && (
                        <Route path="create" element={<CreateRasxodFio />} />
                      )}
                      <Route path=":id" element={<EditRasxodFio />} />
                    </Route>
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  <Route path="/users" element={<UserTable />} />
                  {/* Umumiy ma'lumotnoma: BXM (viloyatlar shartnomada tanlaydi) */}
                  <Route path="/spravichnik" element={<Spravichnik />}>
                    <Route path="" element={<Bxm />} />
                  </Route>
                  <Route index={true} element={<Home />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/debt" element={<AdminOverview />} />
                  {/* Eski "Hisobot" havolasi */}
                  <Route path="/report" element={<Navigate to="/debt" replace />} />
                  <Route path="/video-lessons" element={<AdminVideoLessons />} />
                  <Route path="/logs" element={<Logs />} />
                </Fragment>
              )}
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </>
        ) : (
          <Route path="*" element={<Login />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default MainProvider;
