/** @format */

import Icon from "@/assets/icons";

function Modal({
  closeModal,
  open,
  title,
  children,
  w,
  style,
  className,
}: any) {
  return (
    <>
      {open && (
        <div className="fixed  inset-0 bg-[#00000066]  flex items-center justify-center z-50">
          <div
            style={{
              width: w ? w : "400px",
              ...style,
            }}
            className={` bg-mybackground rounded-[6px]   py-[40px] px-[40px] ${
              className ?? ""
            }`}
          >
            <div className="w-[100%] mx-auto ">
              <div className="flex justify-between mb-8 w-full items-center">
                <h2 className="text-mytextcolor font-[500] text-[20px] leading-[24.2px]">
                  {title}
                </h2>
                {closeModal && (
                  <button onClick={closeModal} className="">
                    <Icon name="close" />
                  </button>
                )}
              </div>
              <div className="max-h-[90vh] overflow-y-auto">
                <div className="h-auto ">{children}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Modal;
