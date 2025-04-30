import { tt } from "../utils";
import Button from "./reusable/button";

function DeleteModal({ closeModal, open, deletee }: any) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-[#00000066]  flex items-center justify-center z-50">
          <div className="bg-mybackground rounded-[6px]  w-[512px] h-[212px] text-mytextcolor shadow-[0.5px_0.5px_4px_0px_#00000026] flex justify-center items-center">

            <div className="w-[70%] mx-auto ">
              <h1 className="text-mytextcolor leading-[19.36px] text-center mb-6 font-[600]">
                {tt(
                  "Siz mutlaqo ishonchingiz komilmi?",
                  "Вы абсолютно уверены?"
                )}
              </h1>

              <div className="flex  items-center gap-5 justify-center">
                <Button mode="cancel" onClick={closeModal} />
                <Button
                  mode="delete"
                  onClick={() => {
                    deletee();
                    closeModal();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteModal;
