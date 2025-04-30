/** @format */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { giveUserData, putJwt } from "../Redux/apiSlice";

const Protected = ({ children }: { children: React.ReactNode }) => {
	const navigate = useNavigate();
	const token = useSelector((s: any) => s.auth.jwt);
	useEffect(() => {
		if (!token || token === "out") {
			navigate("/login");
		}
	}, [navigate]);
	const dispatch = useDispatch();

	useEffect(() => {
		const jsonData = localStorage.getItem("user");
		const datas = !jsonData ? {} : JSON.parse(jsonData);

		if (!jsonData) navigate("/login");
		return () => {
			dispatch(putJwt(token));
			dispatch(giveUserData(datas));
		};
	}, []);

	window.onbeforeunload = function (e: any) {
		if (typeof e == "undefined") {
			e = window.event;
		}

		dispatch(putJwt(sessionStorage.getItem("token")));
	};
	return <>{children}</>;
};

export default Protected;
