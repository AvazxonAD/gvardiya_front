import { getContractId, getOrganId, getSpr } from "@/api";
import { textNum, tt } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import DocumentForPrint from "./DocumentForPrint";
import BudgetTable from "./Smeta";
// import { request } from "@/config/request";
import BackButton from "@/Components/reusable/BackButton";
import Button from "@/Components/reusable/button";
import { useRequest } from "@/hooks/useRequest";
import { SingleTemplateInterface, templateInterface } from "@/interface";
import { replacer } from "@/lib/replace";
import { getFullDate } from "@/lib/utils";
import { SwitchTemplate } from "@/pageCompoents/SwitchTemplate";
import { alertt } from "@/Redux/LanguageSlice";
import DocumentForPrint2 from "./DocumentForPrint2";

const Document = () => {
  const [templatesData, setTemplatesdata] = React.useState<templateInterface[]>(
    []
  );
  const request = useRequest();
  const [openSwitcher, setOpenSwitcher] = React.useState(false);
  const [singleTemplate, setSingleTemplate] = React.useState<any>(null);
  const [data, setData] = useState<any>(null);
  const JWT = useSelector((s: any) => s.auth.jwt);
  // const [versiya, setVersiya] = useState(true);
  const [info, setInfo] = useState({
    title: "",
    doer: "",
    boss: "",
    account_number: "",
    bank: "",
    address: "",
    str: "",
    mfo: "",
    bxm: 0,
  });
  const [organisation, setOrganisation] = useState<any>([]);
  const { id } = useParams();

  //@ts-ignore
  const [urlParams] = useSearchParams();
  const template_id = urlParams.get("template_id");

  const { account_number_id } = useSelector((state: any) => state.account);

  const getInfo = async () => {
    const res = await getContractId(JWT, id, account_number_id);
    if (res.success) {
      await getInfoForDoc(res.data);
      setData(res.data);
      const organ = await getOrganId(JWT, res.data.organization_id);
      setOrganisation(organ.data);
    }
  };

  const getInfoForDoc = async (data: any) => {
    try {
      const [resDoer, resBoss, resBank, resStr, resAddress, resAccount, bxm] =
        await Promise.all([
          getSpr(JWT, "doer"),
          getSpr(JWT, "boss"),
          getSpr(JWT, "bank"),
          getSpr(JWT, "str"),
          getSpr(JWT, "adress"),
          getSpr(JWT, `account/${data.account_number_id}`),
          getSpr(JWT, "bxm"),
        ]);

      setInfo({
        ...info,
        title: resDoer.data.title,
        doer: resDoer.data.doer,
        boss: resBoss.data.boss,
        bank: resBank.data.bank,
        mfo: resBank.data.mfo,
        str: resStr.data.str,
        address: resAddress.data.adress,
        account_number: resAccount.data.account_number,
        bxm: bxm.data.summa,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const dispatch = useDispatch();
  const getAlltemplates = async () => {
    try {
      const response = await request.get("/template/");
      if (response.status == 200 || response.status == 201) {
        let tmplates = response.data.data.map((el: any, idx: number) => ({
          idx: idx,
          active: template_id ? el.id == template_id : idx == 0 ? true : false,
          ...el,
        }));
        setTemplatesdata(tmplates);
      }
    } catch (error) {
      console.error(error);
      dispatch(
        alertt({
          //@ts-ignore
          text: error.message,
          success: false,
          open: true,
        })
      );
    }
  };

  function formatSectionText(text: string): string {
    // Split the text by <br> tags
    const paragraphs = text.split("<br>");

    // Process each paragraph
    const formattedParagraphs = paragraphs
      .filter((p) => p.trim() !== "") // Remove empty paragraphs
      .map((paragraph) => {
        // Remove the non-breaking spaces from the beginning
        const cleanParagraph = paragraph.replace(/^(&nbsp;)+/, "");

        // Wrap in span with text-indent
        return `<span style="display: block; text-indent: 1em;">${cleanParagraph}</span>`;
      });

    // Join the paragraphs back together
    return formattedParagraphs.join("");
  }

  const getSingleTemplate = async (print = null) => {
    function replaceBetween(text: string) {
      const start = "«Бажарувчи»";
      const end = "тасдиқланган";

      const startIndex = text.indexOf(start);
      const endIndex = text.indexOf(end);

      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        return text; // Agar kerakli so‘zlar topilmasa yoki noto‘g‘ri tartibda bo‘lsa, o‘zgartirmay qaytaradi
      }

      const before = text.slice(0, startIndex + start.length);
      const after = text.slice(endIndex);

      return `${before} ________________________ ${after}`;
    }

    if (templatesData.length > 0) {
      const getActivetmplt = templatesData.find((el) => el?.active == true);
      if (getActivetmplt) {
        const res = await request.get("/template/" + getActivetmplt.id);
        if (res.status == 200 || res.status == 201) {
          let template: SingleTemplateInterface = res.data.data;
          // template.main_section=;

          let updatedtemplate = replacer(template, data, info, organisation);

          // Format all section texts
          if (updatedtemplate.section_2) {
            updatedtemplate.section_2 = formatSectionText(
              updatedtemplate.section_2
            );
          }

          // Format other sections
          if (updatedtemplate.section_1) {
            updatedtemplate.section_1 = formatSectionText(
              updatedtemplate.section_1
            );

            if (print) {
              updatedtemplate.section_1 = replaceBetween(
                updatedtemplate.section_1
              );
              data.doc_date = "_____________";

              console.log(updatedtemplate.section_1);
            }
          }
          if (updatedtemplate.section_3) {
            updatedtemplate.section_3 = formatSectionText(
              updatedtemplate.section_3
            );
          }
          if (updatedtemplate.section_4) {
            updatedtemplate.section_4 = formatSectionText(
              updatedtemplate.section_4
            );
          }
          if (updatedtemplate.section_5) {
            updatedtemplate.section_5 = formatSectionText(
              updatedtemplate.section_5
            );
          }
          if (updatedtemplate.section_6) {
            updatedtemplate.section_6 = formatSectionText(
              updatedtemplate.section_6
            );
          }
          if (updatedtemplate.section_7) {
            updatedtemplate.section_7 = formatSectionText(
              updatedtemplate.section_7
            );
          }
          if (updatedtemplate.main_section) {
            updatedtemplate.main_section = formatSectionText(
              updatedtemplate.main_section
            );
          }

          setSingleTemplate(updatedtemplate);
        }
      }
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const contentRef2 = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef,
    // pageStyle: `@page {\ margin: 50px;\ }`,
  });

  const reactToPrintFn2 = useReactToPrint({
    contentRef: contentRef2,
    // pageStyle: `@page {\ margin: 50px;\ }`,
  });
  const onPrintClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent default action if needed
    reactToPrintFn(); // Call the handlePrint function
  };

  const onPrintClick2 = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent default action if needed
    getSingleTemplate(true).then(() => {}); // Call the handlePrint function
  };
  // Explicitly cast to UseReactToPrintOptions
  useEffect(() => {
    if (data && organisation) {
      getSingleTemplate();
    }
  }, [templatesData, data, organisation]);

  useEffect(() => {
    getAlltemplates();
  }, [template_id]);

  useEffect(() => {
    if (account_number_id) {
      getInfo();
    }
  }, [account_number_id]);

  return (
    <>
      {data && info && organisation && (
        <>
          <div className=" hidden">
            <DocumentForPrint
              ref={contentRef}
              data={data}
              info={info}
              getFullDate={getFullDate}
              organisation={organisation}
              singleTemplate={singleTemplate}
            />
            <DocumentForPrint2
              ref={contentRef2}
              data={data}
              info={info}
              getFullDate={getFullDate}
              organisation={organisation}
              singleTemplate={singleTemplate}
            />
          </div>
          <SwitchTemplate
            templatesData={templatesData}
            open={openSwitcher}
            setOpen={setOpenSwitcher}
            setTemplatesdata={setTemplatesdata}
          />
          <div className="h-full  text-[#000000] text-[14px] leading-[19.2px]">
            <div className="flex justify-between items-start">
              <div>
                <BackButton link="/contract" />
              </div>
              <div className="flex gap-2 justify-end mr-16">
                <Button mode="print" onClick={onPrintClick} />
                <Button mode="clear" onClick={onPrintClick2} />
                <Button
                  onClick={() => setOpenSwitcher(true)}
                  mode="clear"
                  text={tt("almashtirish", "замена")}
                />
              </div>
            </div>
            <div className="mb-[100px] mt-5">
              <div className="container mx-auto   text-wrap    text-[16px] overfloww my-auto w-[795px] bg-mybackground text-mytextcolor font__times">
                <section className="pt-10 pr-[40px] pl-[80px] border border-gray-300">
                  <h1 className="text-center font-bold text-lg mb-1">
                    {/* Оммавий тадбирни ўтказишда фуқаролар хавфсизлигини таъминлаш
                  ва жамоат тартибини сақлаш тўғрисида намунавий шартнома */}
                    {singleTemplate?.title}
                  </h1>

                  <p className="text-center font-bold mb-1">
                    {data.doc_num}-сон
                  </p>

                  <div className="flex justify-between font-bold mb-6">
                    <p>{getFullDate(data.doc_date)}</p>
                    <p>{info.title}</p>
                  </div>

                  <div className="mb-1 text-justify">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.main_section,
                      }}
                      className="mb-2   "
                    />
                  </div>

                  {/* Bandlar */}
                  <h2
                    dangerouslySetInnerHTML={{
                      __html: singleTemplate?.section_1_title,
                    }}
                    className="text-lg text-center font-semibold mt-1 -mb-1"
                  ></h2>
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
                    <div
                      className="text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_2,
                      }}
                    />
                  </div>

                  <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                    {singleTemplate?.section_3_title}
                  </h2>
                  <div className="mb-6 ">
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_3,
                      }}
                    />
                  </div>
                </section>

                <div className="h-[16px] bg-mybackground w-[100%]  "></div>

                <section className="pt-8 pr-[40px] pb-5 pl-[80px] border border-gray-300">
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
                  <div className="">
                    <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                      {singleTemplate?.section_5_title}
                    </h2>
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_5,
                      }}
                    />
                  </div>
                  <div className="">
                    <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                      {singleTemplate?.section_6_title}
                    </h2>
                    <p
                      className="text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_6,
                      }}
                    />
                  </div>
                  <div className="">
                    <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                      {singleTemplate?.section_7_title}
                    </h2>
                    <p
                      className="text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_7,
                      }}
                    />
                  </div>
                </section>

                <div className="h-[16px] bg-mybackground w-[100%]  "></div>

                <section className="pt-8 pr-[40px] pb-[565px] pl-[80px] border border-gray-300">
                  <h2 className="text-lg font-semibold text-center mb-4">
                    8. Томонларнинг реквизитлари
                  </h2>
                  <div className="flex max-w-[85%]   font-semibold mx-auto justify-between">
                    <div className="max-w-[50%]">
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
                          Ғазначилиги х/р:{" "}
                          {textNum(organisation.treasury1, 4) ||
                            textNum(organisation.treasury2, 4)}
                        </p>
                      )}
                    </div>
                    <div className="max-w-[50%]">
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
                  <div className="flex max-w-[85%]   font-semibold mx-auto justify-between">
                    <div className="max-w-[50%]">
                      <p className="mt-2">Раҳбари:_____________________</p>
                    </div>
                    <div className="max-w-[50%]">
                      <p className="mt-2 w-full">
                        Раҳбари:___________{info.boss}
                      </p>
                    </div>
                  </div>
                </section>

                <div className="h-[16px] bg-mybackground w-[100%]  "></div>

                <section className="pt-8 pr-[40px] pb-[360px] pl-[80px] border border-gray-300">
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
                  {data && <BudgetTable data={data} />}
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
          </div>
        </>
      )}
    </>
  );
};

export default Document;
