import { useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import Protected from "./Components/Protected";
import ErrorPage from "./pages/404";
import UserTable from "./pages/admin/users";
import BatalonUser from "./pages/region/users";
import Batalon from "./pages/Batalon";
import ContractAnaliz from "./pages/contract/analiz";
import Contract from "./pages/contract/Contract";
import ContractHome from "./pages/contract/ContractHome";
import ContractPage from "./pages/contract/contractPage";
import Document from "./pages/contract/Document";
import Home from "./pages/Home";
import Login from "./pages/Login";
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
import Report from "./pages/Report";
import Root from "./pages/Root";
import Spravichnik from "./pages/Spravichnik";
import Bank from "./pages/sprPages/Bank";
import Bxm from "./pages/sprPages/Bxm";
import Deduction from "./pages/sprPages/deduction";
import Hisob from "./pages/sprPages/Hisob";
import Ijrochi from "./pages/sprPages/Ijrochi";
import Manzil from "./pages/sprPages/Manzil";
import Mfo from "./pages/sprPages/Mfo";
import Tashkilot from "./pages/sprPages/Tashkilot";
import Tasks from "./pages/Task";
import Workers from "./pages/Workers";
import BatalonWorkers from "./pages/batalon/worker";

const MainProvider = () => {
  const { user } = useSelector((state: any) => state.auth);
  const token = useSelector((state: any) => state.auth.jwt);

  return (
    <BrowserRouter>
      <Routes>
        {token && token !== "out" ? (
          <>
            <Route
              path="/"
              element={
                <Protected>
                  <Root />
                </Protected>
              }
            >
              {Boolean(user.region_id) ? (
                <Fragment>
                  <Route index={true} element={<Home />} />
                  <Route path="/contract" element={<Contract />}>
                    <Route path="" element={<ContractHome />} />
                    <Route path="add" element={<ContractPage />} />
                    <Route path="view/:id" element={<Document />} />
                    <Route path="analiz/:id" element={<ContractAnaliz />} />
                    <Route path="tasks/:id" element={<Tasks />} />
                    <Route path=":id" element={<ContractPage />} />
                  </Route>
                  <Route path="/workers" element={<Workers />} />
                  <Route path="/batalon" element={<Batalon />} />
                  <Route path="/organisation" element={<Organisation />} />
                  <Route path="/spravichnik" element={<Spravichnik />}>
                    <Route path="" element={<Bxm />} />
                    <Route path="hisobRaqami" element={<Hisob />} />
                    <Route path="ijrochi" element={<Ijrochi />} />
                    <Route path="rahbar" element={<Tashkilot />} />
                    <Route path="manzil" element={<Manzil />} />
                    <Route path="bank" element={<Bank />} />
                    <Route path="mfo" element={<Mfo />} />
                    <Route path="deduction" element={<Deduction />} />
                  </Route>
                  <Route path="/rasxod" element={<RenderRasxod />}>
                    <Route path="" element={<Rasxod />} />
                    <Route path="create" element={<CreateRasxod />} />
                    <Route path=":id" element={<EditRasxod />} />
                  </Route>
                  <Route path="/prixod" element={<RenderPrixod />}>
                    <Route path="" element={<Prixod />} />
                    <Route path="create" element={<CreatePrixod />} />
                    <Route path=":id" element={<CreatePrixod />} />
                  </Route>
                  <Route path="/rasxod-workers" element={<RenderRasxodFio />}>
                    <Route path="" element={<RasxodFio />} />
                    <Route path="create" element={<CreateRasxodFio />} />
                    <Route path=":id" element={<EditRasxodFio />} />
                  </Route>
                  <Route path="/batalon/users" element={<BatalonUser />} />
                </Fragment>
              ) : Boolean(user.batalon) ? (
                <Fragment>
                  <Route path="/users" element={<UserTable />} />
                  <Route path="/users" element={<UserTable />} />
                </Fragment>
              ) : (
                <Fragment>
                  <Route path="/users" element={<UserTable />} />
                  <Route index={true} element={<Home />} />
                  <Route path="/report" element={<Report />} />
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
