import Alert from "@/Components/Alert";
import useFullHeight from "@/hooks/useFullHeight";
import { alertt } from "@/Redux/LanguageSlice";
import { store } from "@/Redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../Components/Header";
import Navbar from "../Components/Navbar";

function Root() {
  const { pathname } = useLocation();
  const height = useFullHeight();
  const dispatch = useDispatch();
  const alertActionData = useSelector((s: any) => s.lan.alert);

  useEffect(() => {
    if (alertActionData && alertActionData?.isVisible) {
      setTimeout(() => {
        dispatch(alertt({ text: "", open: false }));
      }, alertActionData.time || 2000);
    }
  }, [alertActionData, dispatch]);

  const theme = useSelector((state: any) => state.theme);

  useEffect(() => {
    document.body.classList.add(theme);
    return () => {
      document.body.classList.remove(theme);
    };
  }, [theme]);

  store.subscribe(() => {
    const state = store.getState().theme;
    localStorage.setItem("theme", state);
  });

  return (
    <div className={`text-mytextcolor w-full relative h-[100vh]`}>
      {pathname.includes("/contract/view") ? (
        <div
          className="flex gap-5"
          style={{
            height,
          }}>
          <Navbar />
          <div
            style={{
              overflowY: "scroll",
              scrollbarWidth: "none",
              width: "100%",
            }}>
            <div
              style={{
                minHeight:
                  height,
              }}
              className={`w-full h-auto bg-mybackground   pt-[20px] px-[40px]  border-[1px] border-mybordercolor rounded-tl-[20px] `}>
              <Outlet />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 h-[80px]">
            <Header />
          </div>
          <div
            className="flex gap-5"
            style={{
              height:
                typeof height === "string"
                  ? `calc(${height} - 93px)`
                  : height - 93,
            }}>
            <Navbar />
            <div
              style={{
                overflowY: "scroll",
                scrollbarWidth: "none",
                width: "100%",
              }}>
              <div
                style={{
                  minHeight:
                    typeof height === "string"
                      ? `calc(${height} - 93px)`
                      : height - 93,
                }}
                className={`w-full h-auto bg-mybackground   pt-[20px] px-[40px]  border-[1px] border-mybordercolor rounded-tl-[20px] `}>
                <Outlet />
              </div>
            </div>
          </div>
        </>
      )}
      {alertActionData && alertActionData?.open && <Alert />}
    </div>
  );
}

export default Root;
