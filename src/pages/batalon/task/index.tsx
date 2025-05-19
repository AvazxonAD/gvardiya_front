/** @format */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    getTasks,
} from "../../../api";
import Input from "../../../Components/Input";
import Paginatsiya from "../../../Components/Paginatsiya";
import TaskTable from "./table";
import { tt } from "../../../utils";

import Button from "@/Components/reusable/button";
import useFullHeight from "@/hooks/useFullHeight";
import { useDebounce } from "use-debounce";
import { SpecialDatePicker } from "../../../Components/SpecialDatePicker";

function BatalonTasks() {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = startOfMonth.toISOString().split('T')[0];

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endDate = endOfMonth.toISOString().split('T')[0];

    const [data, setData] = useState<any[]>([]);
    const JWT = useSelector((s: any) => s.auth.jwt);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalpage] = useState(10);
    const [setActive] = useState(1);
    const [search, setSearch] = useState("");
    const [limet, setLimet] = useState(15);
    const [all, setAll] = useState(10);
    const [status, setStatus] = useState('');

    const getInfo = async () => {
        const res = await getTasks(
            JWT,
            currentPage,
            limet,
            dates.date1,
            dates.date2,
            searchingText,
            status
        );

        setData(res.data);
        setTotalpage(res.meta.pageCount);
        setAll(res.meta.count);
    };

    const [dates, setDates] = useState<any>({
        date1: startDate,
        date2: endDate,
    });

    const [searchingText] = useDebounce(search, 500);

    useEffect(() => {
        if ((searchingText || status) && currentPage !== 1) {
            setCurrentPage(1);
        } else {
            getInfo();
        }
    }, [currentPage, limet, status, searchingText, dates.date1, dates.date2]);


    const height = useFullHeight();

    const fullHeight =
        typeof height === "string" ? `calc(${height} - 190px)` : height - 190;


    return (
        <div className="flex flex-col">
            <div style={{ minHeight: fullHeight }}>
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-8">
                        <div className="w-[250px]">
                            <Input
                                v={search}
                                change={(e: any) => setSearch(e.target.value)}
                                search={true}
                                p={tt("Ismlar bo’yicha qidiruv", "Поиск по имени")}
                                className="w-full"
                            />
                        </div>

                        <div className="w-[200px]">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="
                                    block w-full
                                    bg-white
                                    border border-gray-300
                                    rounded-md
                                    py-2 px-3
                                    text-gray-700
                                    text-base
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    focus:border-blue-500
                                    cursor-pointer
                                    transition
                                    duration-200
                                    ease-in-out
                                    shadow-sm
                                    hover:border-blue-400
                                "
                            >
                                <option value="">Barchasi</option>
                                <option value="done">Bajarilgan</option>
                                <option value="progress">Bajarilmoqda</option>
                                <option value="extended">Muddati o'tgan</option>
                            </select>
                        </div>


                        <div className="flex gap-2  items-center">
                            <SpecialDatePicker
                                defaultValue={dates.date1}
                                onChange={(e) => setDates({ ...dates, date1: e })}
                            />
                            <SpecialDatePicker
                                defaultValue={dates.date2}
                                onChange={(e) => setDates({ ...dates, date2: e })}
                            />
                        </div>

                        <Button
                            mode="clear"
                            onClick={() => {
                                setDates({
                                    date1: startDate,
                                    date2: endDate,
                                });
                                setSearch("");
                                setStatus("");
                            }}
                        />
                    </div>
                </div>
                <TaskTable
                    setActive={setActive}
                    page={currentPage}
                    itemsPerPage={10}
                    data={data}
                />
            </div>
            <div className="">
                <Paginatsiya
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    currentPage={currentPage}
                    limet={limet}
                    setLimet={setLimet}
                    count={all}
                />
            </div>
        </div>
    );
}

export default BatalonTasks;
