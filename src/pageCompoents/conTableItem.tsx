import { IContract } from "@/types/contract";
import { formatDate, formatSum, textNum, tt } from "@/utils";
import { useState } from "react";
import ReactDOM from "react-dom";

interface ITableItemProps {
  item: IContract;
  onView: (id: number) => void;
  setDelOpen: (state: boolean) => void;
  setActive: (id: number) => void;
}

export const TableItem: React.FC<ITableItemProps> = ({ item, onView }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isMouseOverTooltip, setIsMouseOverTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const handleTdMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 5, // Slightly offset below the `td`
      left: rect.left + window.scrollX,
    });
    setIsTooltipVisible(true);
  };

  const handleTdMouseLeave = () => {
    // Close the tooltip only if the mouse is not over the tooltip itself
    setTimeout(() => {
      if (!isMouseOverTooltip) {
        setIsTooltipVisible(false);
      }
    }, 100); // Timeout for smooth transition
  };

  const handleTooltipMouseEnter = () => {
    setIsMouseOverTooltip(true); // Prevent tooltip from closing
  };

  const handleTooltipMouseLeave = () => {
    setIsMouseOverTooltip(false); // Allow tooltip to close
    setTimeout(() => {
      if (!isTooltipVisible) {
        setIsTooltipVisible(false);
      }
    }, 100);
  };

  const renderTooltip = () => {
    if (!isTooltipVisible) return null;

    const tooltipElement = (
      <div
        className="text-mytextcolor fixed w-[250px] bg-mybackground border border-mytableheadborder rounded-md shadow-lg p-3"
        style={{
          top: `${tooltipPosition.top - 50}px`,
          left: `${tooltipPosition.left + 80}px`,
        }}
        onMouseEnter={handleTooltipMouseEnter} // Keep the tooltip visible
        onMouseLeave={handleTooltipMouseLeave} // Allow tooltip to close
      >
        <h2>
          {tt("Nomi", "Название")}: {item.organization_name}
        </h2>
        <h2>
          {tt("Manzil", "Адрес")}: {item.organization_address}
        </h2>
        <h2>
          {tt("INN", "ИНН")}: {textNum(item.organization_str, 3)}
        </h2>
        <h2>
          {tt("Hisob raqam", "Номер счета")}:{" "}
          {textNum(item.organization_account_number, 4)}
        </h2>
      </div>
    );

    return ReactDOM.createPortal(tooltipElement, document.body);
  };

  return (
    <>
      <tr className="my-[25px] text-mytextcolor cursor-pointer font-[500] hover:text-[#3B7FAF] transition-colors duration-300 border-b border-mytableheadborder">
        <td
          className="px-2 py-3 text-[#3B7FAF] text-left"
          onClick={() => onView(item.id)}>
          {item.doc_num}
        </td>
        <td className="text-center text-inherit">
          {formatDate(item.doc_date)}
        </td>
        <td
          className="rasxod-tooltip relative px-2 text-left text-inherit"
          onMouseEnter={handleTdMouseEnter} // Show tooltip on hover
          onMouseLeave={handleTdMouseLeave} // Conditional close tooltip
        >
          {item.organization_name}
        </td>
        <td className="px-2 py-[6px] text-left text-inherit">{item.adress}</td>
        <td className="px-2 text-left text-inherit">
          {formatSum(item.result_summa)}
        </td>
        <td className="px-2 text-left text-inherit">
          {formatSum(item.remaining_balance)}
        </td>
        <td className="px-2 text-left text-inherit">
          {formatSum(item.remaining_summa)}
        </td>
        <td className="px-2 text-center text-inherit">
          {/* Add your action menu */}
        </td>
      </tr>
      {renderTooltip()}
    </>
  );
};
