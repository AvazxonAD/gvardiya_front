import useFullHeight from "@/hooks/useFullHeight";
import { useState } from "react";
import DeleteModal from "../../../Components/DeleteModal";
import { tt } from "../../../utils";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TasksTable = ({ data, handleDelete, page, itemsPerPage, edit }: any) => {
  const [delOpen, setDelOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const navigate = useNavigate();

  const getRowNumber = (index: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const height = useFullHeight();
  const fullHeight =
    typeof height === "string" ? `calc(${height} - 250px)` : height - 250;

  return (
    <>
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[400px] animate-scale-in">
            <h2 className="text-xl font-semibold text-center text-blue-700 mb-6 border-b pb-3">
              📄 Shartnoma tafsilotlari
            </h2>

            <div className="space-y-3 text-gray-700 text-[15px]">
              <div className="border-l-4 border-blue-500 pl-3">
                <strong>Shartnoma raqami:</strong>{" "}
                {selectedTask.contract_info?.doc_num}
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <strong>Hamkor tashkilot:</strong>{" "}
                {selectedTask.contract_info?.organization}
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <strong>Tadbir boshlanish vaqti:</strong>{" "}
                {selectedTask.contract_info?.start_date}{" "}
                {selectedTask.contract_info?.start_time}
              </div>
              <div className="border-l-4 border-red-500 pl-3">
                <strong>Tadbir tugash vaqti:</strong>{" "}
                {selectedTask.contract_info?.end_date}{" "}
                {selectedTask.contract_info?.end_time}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTask(null);
                }}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {data ? (
        <div
          className={`rounded-t-[6px] text-[14px] leading-[16.94px] border`}
          style={{ maxHeight: fullHeight, overflowY: "auto" }}
        >
          <table className="min-w-full relative">
            <thead className="bg-mytablehead sticky z-10 -top-1 text-[14px] leading-[16.94px] rounded-t-[6px] border border-mytableheadborder">
              <tr className="text-mytextcolor">
                <th className="px-4 py-3 text-left w-[60px]">{tt("№", "№")}</th>
                <th className="px-4 py-3 text-center w-[160px]">
                  {tt("Shartnoma raqami", "Номер контракта")}
                </th>
                <th className="px-4 py-3 text-center w-[140px]">
                  {tt("Xodimlar soni", "Количество сотрудников")}
                </th>
                <th className="px-4 py-3 text-center w-[180px]">
                  {tt("Tadbir vaqti", "Время события")}
                </th>
                <th className="px-4 py-3 text-center w-[180px]">
                  {tt("Umumiy vaqt ", "Время события")}
                </th>
                <th className="px-4 py-3 text-center w-[180px]">
                  {tt("Qolgan ", "Остальные")}
                </th>
                <th className="px-4 py-3 text-center w-[180px]">
                  {tt("Topshiriq muddati", "Крайний срок выполнения задания")}
                </th>
                <th className="px-4 py-3 text-center w-[180px]">
                  {tt("Manzil", "Адрес")}
                </th>
                <th className="px-4 py-3 text-center w-[300px]">
                  {tt("Izoh", "Примечание")}
                </th>
                <th className="px-4 py-3 text-center w-[150px]">
                  {tt("Topshiriq holati", "Статус задания")}
                </th>
                <th className="px-4 py-3 text-right w-[100px]">
                  {tt("Amallar", "Действия")}
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((task: any, index: number) => (
                <tr
                  key={task.id}
                  className="hover:text-[#3B7FAF] text-mytextcolor cursor-pointer transition-colors duration-300 border-b border-mytableheadborder"
                >
                  <td className="px-4 py-3 text-left">{getRowNumber(index)}</td>
                  <td
                    className="px-4 py-3 text-center text-blue-600 cursor-pointer hover:font-semibold transition"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowModal(true);
                    }}
                  >
                    {task.contract_info?.doc_num}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {task.worker_number}
                  </td>
                  <td className="px-4 py-3 text-center">{task.task_time}</td>
                  <td className="px-4 py-3 text-center">
                    {Math.round(task.task_time * task.worker_number * 100) /
                      100}
                  </td>
                  <td
                    className={`px-4 py-3 text-center ${
                      task.remaining_task_time === 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {Math.round(task.remaining_task_time * 100) / 100}
                  </td>
                  <td className="px-4 py-3 text-center">{task.deadline}</td>
                  <td className="px-4 py-3 text-center">{task.address}</td>
                  <td className="px-4 py-3 text-center truncate">
                    {task.comment}
                  </td>
                  <td
                    className={`px-4 py-3 text-center font-semibold ${
                      task.status === "Muddati o'tgan"
                        ? "text-red-600"
                        : task.status === "Bajarilgan"
                        ? "text-green-600"
                        : task.status === "Bajarilmoqda"
                        ? "text-yellow-600"
                        : ""
                    }`}
                  >
                    {task.status}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => {
                          navigate(`/batalon/worker/tasks/${task.id}`);
                        }}
                        className="hover:opacity-80 transition-opacity text-blue-600"
                      >
                        <FaUserPlus size={20} className="inline mr-1" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{ height: fullHeight }}
          className="w-full text-[#323232] font-[500] text-[20px] flex justify-center items-center bg-[#F4FAFD] rounded-lg"
        >
          {tt("Malumot yo'q", "Нет ссылки")}
        </div>
      )}

      <DeleteModal
        open={delOpen}
        deletee={handleDelete}
        closeModal={() => setDelOpen(false)}
      />
    </>
  );
};

export default TasksTable;
