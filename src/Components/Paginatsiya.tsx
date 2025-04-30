import Icon from "@/assets/icons";
import { motion } from "framer-motion";
import { tt } from "../utils";
import Select from "./Select";

const Paginatsiya = ({
  currentPage,
  setCurrentPage,
  totalPages,
  limet,
  setLimet,
  count,
}: any) => {
  const pageOptions = [
    { id: 10, name: "10" },
    { id: 15, name: "15" },
    { id: 20, name: "20" },
    { id: 30, name: "30" },
    { id: 40, name: "40" },
    { id: 100, name: "100" },
  ]; // Example options for totalPages

  // Function to get the pages to display
  const getVisiblePages = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 2) {
      return [1, 2, 3, "..."];
    } else if (currentPage >= totalPages - 1) {
      return ["...", totalPages - 2, totalPages - 1, totalPages];
    } else {
      return ["...", currentPage - 1, currentPage, currentPage + 1, "..."];
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex   items-center text-mytextcolor text-[12px] gap-2 leading-[14.52px] justify-center p-4">
      {/* Pagination Control */}
      <div className="flex items-center justify-center space-x-2">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`px-3 py-1 rounded flex gap-1 items-center ${currentPage === 1
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
            }`}
          onClick={handlePrev}
          disabled={currentPage === 1}>
          <Icon name="prev" />
          <span>{tt("Oldinga", "Вперед")}</span>
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-2">
          {getVisiblePages().map((page, index) => (
            <motion.button
              key={index}
              whileHover={typeof page === "number" ? { scale: 1.1 } : {}}
              whileTap={typeof page === "number" ? { scale: 0.9 } : {}}
              className={`w-[35px] h-[32px] rounded-[6px] font-[500]   ${currentPage === page
                ? " border  border-[#383838] dark:border-[#D9D9D9]"
                : ""
                } flex items-center justify-center ${typeof page !== "number" ? "cursor-default" : "cursor-pointer"
                }`}
              onClick={() => typeof page === "number" && setCurrentPage(page)}>
              {page}
            </motion.button>
          ))}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`px-3 py-1 rounded flex gap-1 items-center ${currentPage === totalPages
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
            }`}
          onClick={handleNext}
          disabled={currentPage === totalPages}>
          <span>{tt("Keyingi", "Следующий")}</span>
          <Icon name="next" />
        </motion.button>
      </div>
      {limet && (
        <div className="flex gap-3 items-center">
          <span className="text-[12px] leading-[12.52px] font-[600] text-mytextcolor">
            {tt("qatorlar:", "строк:")}
          </span>
          <Select
            value={limet}
            up
            data={pageOptions}
            onChange={(e: any) => setLimet(e)}
            w={200}
          />
          <span className="text-[12px] leading-[12.52px] font-[600] text-mytextcolor">
            {tt("jami:", "итого:")}
          </span>
          <span className="text-[14px]  leading-[12.52px] font-[600] text-mytextcolor">
            {count}
          </span>
        </div>
      )}
    </div>
  );
};

export default Paginatsiya;
