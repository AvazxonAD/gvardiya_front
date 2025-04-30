import { Outlet } from "react-router-dom";

function Spravichnik() {
	return (
		<div className='flex flex-col w-full'>
			<Outlet />
		</div>
	);
}

export default Spravichnik;
