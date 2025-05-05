import { textNum } from "@/utils";
import React from "react";
import BudgetTable from "./Smeta";

const DocumentForPrint2 = React.forwardRef<HTMLDivElement, any>(
  ({ data, info, organisation, singleTemplate, getFullDate }, ref) => {
    return (
      <>
        {data && info && organisation && (
          <>
            <div className="h-full text-[#000000] text-[14px] leading-[19.2px]">
              <div ref={ref} className="text-[16px] bg-[#FFFFFF] font__times">
                <section className=" ">
                  <h1 className="text-center font-bold text-lg mb-1">
                    {singleTemplate?.title}
                    {/* {singleTemplate?.main_section} */}
                  </h1>

                  <p className="text-center font-bold mb-1">
                    {data.doc_num}-сон
                  </p>

                  <div className="flex justify-between font-bold mb-6">
                    <p>{"_____________"}</p>
                    <p>{info.title}</p>
                  </div>

                  <div className="mb-1">
                    <p
                      className="mb-2 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.main_section,
                      }}
                    />
                  </div>

                  {/* Bandlar */}
                  <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                    {singleTemplate?.section_1_title}
                  </h2>
                  <div className="">
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_1,
                      }}
                    />
                  </div>

                  <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                    {singleTemplate?.section_2_title}
                  </h2>
                  <div className="">
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_2,
                      }}
                    />
                  </div>

                  <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                    {singleTemplate?.section_3_title}
                  </h2>
                  <div className="mb-6">
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_3,
                      }}
                    />
                  </div>
                </section>

                <section className=" ">
                  <div className="">
                    <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                      {singleTemplate?.section_4_title}
                    </h2>
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_4,
                      }}
                    />
                  </div>
                  <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                    {singleTemplate?.section_5_title}
                  </h2>
                  <div className="">
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_5,
                      }}
                    />
                  </div>

                  <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                    {singleTemplate?.section_6_title}
                  </h2>
                  <div className="">
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_6,
                      }}
                    />
                  </div>

                  <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                    {singleTemplate?.section_7_title}
                  </h2>
                  <div className="">
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_7,
                      }}
                    />
                  </div>

                  <h2 className="text-lg font-semibold text-center mb-4">
                    8. Томонларнинг реквизитлари
                  </h2>
                  <div className="flex max-w-[100%]   font-semibold mx-auto justify-between">
                    <div className="max-w-[45%]">
                      <h3 className="font-bold mb-2 text-center">Буюртмачи:</h3>
                      <p className="font-semibold mb-3 text-center">
                        "{organisation.name}"
                      </p>
                      <p>Манзил: {organisation.address}</p>
                      <p>ИНН: {textNum(organisation.str, 3)}</p>
                      <p>Банк реквизитлари: {organisation.bank_name}</p>
                      <p>МФО: {organisation.mfo}</p>
                      <p>х/р: {textNum(organisation.account_number, 4)} </p>

                      {(organisation.treasury1 || organisation.treasury2) && (
                        <p>
                          {" "}
                          Ғазначилиги х/р:
                          {organisation.treasury1 || organisation.treasury2}
                        </p>
                      )}
                    </div>
                    <div className="max-w-[45%]">
                      <h3 className="font-bold mb-2 text-center">Бажарувчи:</h3>
                      <p className="font-semibold mb-3 text-center">
                        "{info.doer}"
                      </p>
                      <p>Манзил: {info.address}</p>
                      <p>ИНН: {textNum(info.str, 3)}</p>
                      <p>Банк реквизитлари: {info.bank} </p>
                      <p>МФО: {info.mfo}</p>
                      <p>х/р: {textNum(info.account_number, 4)} </p>
                    </div>
                  </div>
                  <div className="flex max-w-[100%]   font-semibold mx-auto justify-between">
                    <div className="max-w-[45%] w-full">
                      <p className="mt-2">Раҳбари:_____________________</p>
                    </div>
                    <div className="max-w-[45%] w-full">
                      <p className="mt-2 w-full">
                        Раҳбари:___________{info.boss}
                      </p>
                    </div>
                  </div>
                </section>

                <section className=" mt-[1000px] ">
                  <div className="flex flex-col justify-end text-lg font-semibold items-end gap-1">
                    <span>{getFullDate(data.doc_date)}</span>
                    <span>{data.doc_num} сонли шартномага илова</span>
                  </div>

                  <h1 className="text-center text-lg my-[70px] font-semibold">
                    Оммавий тадбирни ўтказишда фуқаролар хавсизлигини таъминлаш
                    ва жамоат тартибини сақлашни ташкил этишда
                  </h1>

                  <h1 className="text-center text-lg mb-[50px] font-semibold ">
                    Харажатлар сметаси
                  </h1>
                  <BudgetTable data={data} />
                  <div className="flex items-start justify-around mt-14">
                    <div className="flex items-center flex-col">
                      <h1 className="text-center text-lg  font-semibold">
                        Буюртмачи:
                      </h1>
                      <span className="block mt-5">
                        ______________________________
                      </span>
                    </div>
                    <div className="flex items-center flex-col">
                      <h1 className="text-center text-lg  font-semibold">
                        Бажарувчи:
                      </h1>
                      <span className="block mt-5">
                        ______________________________
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </>
    );
  }
);

export default DocumentForPrint2;
