import { getContractId, getOrganId, getSpr } from "@/api";
import { textNum, tt } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import DocumentForPrint from "./DocumentForPrint";
import BudgetTable from "./Smeta";
import BackButton from "@/Components/reusable/BackButton";
import Button from "@/Components/reusable/button";
import { useRequest } from "@/hooks/useRequest";
import { SingleTemplateInterface, templateInterface } from "@/interface";
import { replacer } from "@/lib/replace";
import { getFullDate } from "@/lib/utils";
import { alertt } from "@/Redux/LanguageSlice";
import DocumentForPrint2 from "./DocumentForPrint2";
import { EImzo } from "@/lib/eimzo";
import { URL as API_URL } from "@/api";
import html2pdf from "html2pdf.js";

interface VerificationInfo {
  id: number;
  contract_id: number;
  user_id: number;
  file_name: string;
  signer_name: string;
  created_at: string;
}

const LawyerDocument = () => {
  const [templatesData, setTemplatesdata] = React.useState<templateInterface[]>([]);
  const request = useRequest();
  const [singleTemplate, setSingleTemplate] = React.useState<any>(null);
  const [data, setData] = useState<any>(null);
  const JWT = useSelector((s: any) => s.auth.jwt);
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

  const { account_number_id } = useSelector((state: any) => state.account);

  // E-IMZO state
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");
  const [signSuccess, setSignSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);

  const documentRef = useRef<HTMLDivElement>(null);

  const loadVerificationInfo = async () => {
    try {
      const res = await request.get(`/contract/${id}/verification`);
      if (res.data.success && res.data.data) {
        setVerificationInfo(res.data.data);
      }
    } catch {}
  };

  const getInfo = async () => {
    const res = await getContractId(JWT, id, account_number_id);
    if (res.success) {
      await getInfoForDoc(res.data);
      setData(res.data);
      setVerificationStatus(res.data.verification_lawyer || null);
      if (res.data.verification_lawyer === "success") {
        loadVerificationInfo();
      }
      getContractTemplate(res.data);
      const organ = await getOrganId(JWT, res.data.organization_id);
      setOrganisation(organ.data);
    }
  };

  const getInfoForDoc = async (data: any) => {
    try {
      const [resDoer, resBoss, resBank, resStr, resAddress, resAccount, bxm] = await Promise.all([
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
  const getContractTemplate = async (contractData: any) => {
    if (!contractData?.template_id) return;
    try {
      const res = await request.get("/template/" + contractData.template_id);
      if (res.status == 200 || res.status == 201) {
        setTemplatesdata([{ idx: 0, active: true, id: contractData.template_id, shablon_name: res.data.data.shablon_name }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  function formatSectionText(text: string): string {
    const paragraphs = text.split("<br>");
    const formattedParagraphs = paragraphs
      .filter((p) => p.trim() !== "")
      .map((paragraph) => {
        const cleanParagraph = paragraph.replace(/^(&nbsp;)+/, "");
        return `<span style="display: block; text-indent: 1em;">${cleanParagraph}</span>`;
      });
    return formattedParagraphs.join("");
  }

  const getSingleTemplate = async (print = null) => {
    function replaceBetween(text: string) {
      const start = "«Бажарувчи»";
      const end = "тасдиқланган";
      const startIndex = text.indexOf(start);
      const endIndex = text.indexOf(end);
      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        return text;
      }
      const before = text.slice(0, startIndex + start.length);
      const after = text.slice(endIndex);
      return `${before} ________________________ ${after}`;
    }

    function getMonthName(oyRaqami: number) {
      const oylar = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
      ];
      if (oyRaqami < 1 || oyRaqami > 12) return "Noto'g'ri oy raqami";
      return oylar[oyRaqami - 1];
    }

    if (templatesData.length > 0) {
      const getActivetmplt = templatesData.find((el) => el?.active == true);
      if (getActivetmplt) {
        const res = await request.get("/template/" + getActivetmplt.id);
        if (res.status == 200 || res.status == 201) {
          let template: SingleTemplateInterface = res.data.data;
          let updatedtemplate = replacer(template, data, info, organisation);

          if (updatedtemplate.section_2) updatedtemplate.section_2 = formatSectionText(updatedtemplate.section_2);
          if (updatedtemplate.section_1) {
            updatedtemplate.section_1 = formatSectionText(updatedtemplate.section_1);
            if (updatedtemplate.section_1.includes("${start_month}")) {
              const start_month = new Date(data.start_date).getMonth() + 1;
              const end_month = new Date(data.end_date).getMonth() + 1;
              const start_month_str = getMonthName(start_month);
              const end_month_str = getMonthName(end_month);
              const year = new Date(data.start_date).getFullYear();
              const start_month_bold = `<span class="font-bold">${year}-йил ${start_month_str}</span>`;
              const end_month_bold = `<span class="font-bold">${end_month_str}</span>`;
              updatedtemplate.section_1 = updatedtemplate.section_1.replace("${start_month}", start_month_bold);
              updatedtemplate.section_1 = updatedtemplate.section_1.replace("${end_month}", end_month_bold);
            }
            if (print) {
              updatedtemplate.section_1 = replaceBetween(updatedtemplate.section_1);
              data.doc_date = "_____________";
            }
          }
          if (updatedtemplate.section_3) updatedtemplate.section_3 = formatSectionText(updatedtemplate.section_3);
          if (updatedtemplate.section_4) updatedtemplate.section_4 = formatSectionText(updatedtemplate.section_4);
          if (updatedtemplate.section_5) updatedtemplate.section_5 = formatSectionText(updatedtemplate.section_5);
          if (updatedtemplate.section_6) updatedtemplate.section_6 = formatSectionText(updatedtemplate.section_6);
          if (updatedtemplate.section_7) updatedtemplate.section_7 = formatSectionText(updatedtemplate.section_7);
          if (updatedtemplate.main_section) updatedtemplate.main_section = formatSectionText(updatedtemplate.main_section);

          setSingleTemplate(updatedtemplate);
        }
      }
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const contentRef2 = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({ contentRef });
  const reactToPrintFn2 = useReactToPrint({ contentRef: contentRef2 });

  const onPrintClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    reactToPrintFn();
  };

  const onPrintClick2 = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    getSingleTemplate(true).then(() => {});
  };

  // Shartnomani PDF qilib yaratish
  const generatePdf = async (): Promise<Blob> => {
    const element = documentRef.current;
    if (!element) throw new Error("Hujjat topilmadi");

    // Borderlarni va dividerlarni vaqtincha olib tashlash
    const sections = element.querySelectorAll<HTMLElement>("section");
    const dividers = element.querySelectorAll<HTMLElement>(".h-\\[16px\\]");
    const savedStyles: string[] = [];
    sections.forEach((s) => {
      savedStyles.push(s.style.cssText);
      s.style.border = "none";
    });
    dividers.forEach((d) => (d.style.display = "none"));

    const blob: Blob = await html2pdf()
      .set({
        margin: [5, 0, 5, 0], // top, left, bottom, right (mm)
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, scrollY: -window.scrollY },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: "css", avoid: ["h1", "h2", "h3"] },
      })
      .from(element)
      .outputPdf("blob");

    // Stillarni qaytarish
    sections.forEach((s, i) => (s.style.cssText = savedStyles[i]));
    dividers.forEach((d) => (d.style.display = ""));

    return blob;
  };

  // E-IMZO bilan tasdiqlash
  const handleEimzoSign = async () => {
    setSigning(true);
    setSignError("");
    setSignSuccess(false);

    try {
      // 1. E-IMZO ga ulanish va sertifikatlar ro'yxati
      await EImzo.connect();
      const certs = await EImzo.listAllCertificates();
      if (certs.length === 0) throw new Error("E-IMZO kaliti topilmadi");

      // 2. Birinchi kalitni yuklash (parol oynasi ochiladi)
      const cert = certs[0];
      const alias = cert.alias || "";
      const keyId = await EImzo.loadKey(
        cert.disk || "", cert.path || "", cert.name || "", alias
      );

      // 3. E-IMZO sertifikatdan FIO olish
      const parseCertAlias = (a: string) => {
        const result: Record<string, string> = {};
        for (const part of a.split(",")) {
          const eq = part.indexOf("=");
          if (eq === -1) continue;
          result[part.substring(0, eq).trim().toLowerCase()] = part.substring(eq + 1).trim();
        }
        return result;
      };
      const certFields = parseCertAlias(alias);
      const signerName = certFields.cn || certFields["1.2.860.3.16.1.1"] || "";

      // 4. Shartnoma ma'lumotlarini imzolash
      const content = `contract_id:${id}|doc_num:${data.doc_num}|verify:lawyer`;
      const content64 = btoa(unescape(encodeURIComponent(content)));
      await EImzo.createPkcs7(content64, keyId);

      // 5. PDF yaratish
      const pdfBlob = await generatePdf();

      // 6. Backendga PDF va tasdiqlash yuborish
      const formData = new FormData();
      formData.append("file", pdfBlob, `contract_${data.doc_num}.pdf`);
      formData.append("signer_name", signerName);

      const res = await request.patch(`/contract/${id}/verify-lawyer`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setSignSuccess(true);
        setVerificationStatus("success");
        setVerificationInfo(res.data.data);
        dispatch(alertt({ text: "Shartnoma muvaffaqiyatli tasdiqlandi!", success: true, open: true }));
      } else {
        throw new Error(res.data.message || "Tasdiqlashda xatolik");
      }
    } catch (err: any) {
      const errMsg = String(err.message || err).toLowerCase();
      if (errMsg.includes("password") || errMsg.includes("padding")) {
        setSignError("Noto'g'ri parol kiritildi. Qaytadan urinib ko'ring.");
      } else if (errMsg.includes("aloqa uzildi") || errMsg.includes("ulanib bo'lmadi")) {
        setSignError("E-IMZO dasturiga ulanib bo'lmadi. Dastur ishga tushirilganligini tekshiring.");
      } else if (errMsg.includes("cancel")) {
        setSignError("Bekor qilindi.");
      } else {
        setSignError(err.message || "Xatolik yuz berdi");
      }
    } finally {
      setSigning(false);
    }
  };

  useEffect(() => {
    if (data && organisation) {
      getSingleTemplate();
    }
  }, [templatesData, data, organisation]);

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
          <div className="h-full  text-[#000000] text-[14px] leading-[19.2px]">
            <div className="flex justify-between items-start">
              <div>
                <BackButton link="/lawyer-contract" />
              </div>
              <div className="flex gap-2 justify-end mr-16">
                {/* E-IMZO tasdiqlash tugmasi */}
                {verificationStatus === "success" ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    {tt("Tasdiqlangan", "Утверждено")}
                  </div>
                ) : (
                  <button
                    onClick={handleEimzoSign}
                    disabled={signing}
                    className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:bg-[#6ee7b7] text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    {signing ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {tt("Kuting...", "Подождите...")}
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z" />
                        </svg>
                        {tt("E-IMZO bilan tasdiqlash", "Утвердить через E-IMZO")}
                      </>
                    )}
                  </button>
                )}
                <Button mode="print" onClick={onPrintClick} />
              </div>
            </div>

            {/* E-IMZO xatolik xabari */}
            {signError && (
              <div className="mx-16 mt-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {signError}
              </div>
            )}

            {/* Tasdiqlash ma'lumotlari */}
            {verificationInfo && (
              <div className="mx-16 mt-2 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-semibold">{tt("Tasdiqlagan", "Утвердил")}:</span>{" "}
                    {verificationInfo.signer_name}
                  </div>
                  <div>
                    <span className="font-semibold">{tt("Sana", "Дата")}:</span>{" "}
                    {new Date(verificationInfo.created_at).toLocaleString("uz-UZ")}
                  </div>
                </div>
                <a
                  href={API_URL?.replace("/api", "") + verificationInfo.file_name}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700"
                >
                  PDF
                </a>
              </div>
            )}

            <div className="mb-[100px] mt-5">
              <div ref={documentRef} className="container mx-auto   text-wrap    text-[14px] overfloww my-auto w-[795px] bg-mybackground text-mytextcolor font__times">
                <section className="pt-10 pr-[40px] pl-[80px] border border-gray-300">
                  <h1 className="text-center font-bold text-lg mb-1">
                    {singleTemplate?.title}
                  </h1>

                  <p className="text-center font-bold mb-1">{data.doc_num}-сон</p>

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

                  <h2 className="text-lg text-center font-semibold mt-1 -mb-1">{singleTemplate?.section_2_title}</h2>
                  <div className="">
                    <div
                      className="text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_2,
                      }}
                    />
                  </div>

                  <h2 className="text-lg text-center font-semibold mt-1 -mb-1">{singleTemplate?.section_3_title}</h2>
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
                    <h2 className="text-lg text-center font-semibold mt-1 -mb-1">{singleTemplate?.section_4_title}</h2>
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_4,
                      }}
                    />
                  </div>
                  <div className="">
                    <h2 className="text-lg text-center font-semibold mt-1 -mb-1">{singleTemplate?.section_5_title}</h2>
                    <p
                      className="mb-0 text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_5,
                      }}
                    />
                  </div>
                  <div className="">
                    <h2 className="text-lg text-center font-semibold mt-1 -mb-1">{singleTemplate?.section_6_title}</h2>
                    <p
                      className="text-justify"
                      dangerouslySetInnerHTML={{
                        __html: singleTemplate?.section_6,
                      }}
                    />
                  </div>
                  <div className="">
                    <h2 className="text-lg text-center font-semibold mt-1 -mb-1">{singleTemplate?.section_7_title}</h2>
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
                  <h2 className="text-lg font-semibold text-center mb-4">8. Томонларнинг реквизитлари</h2>
                  <div className="flex max-w-[85%]   font-semibold mx-auto justify-between">
                    <div className="max-w-[50%]">
                      <h3 className="font-bold mb-2 text-center">Буюртмачи:</h3>
                      <p className="font-semibold mb-3 text-center">"{organisation.name}"</p>
                      <p>Манзил: {organisation.address}</p>
                      <p>ИНН: {textNum(organisation.str, 3)}</p>
                      <p>Банк реквизитлари: {organisation.bank_name}</p>
                      <p>МФО: {organisation.mfo}</p>
                      <p>х/р: {textNum(data.organization_account_number || organisation.account_number, 4)} </p>
                      {(organisation.treasury1 || organisation.treasury2) && (
                        <p>
                          {" "}
                          Ғазначилиги х/р: {textNum(organisation.treasury1, 4) || textNum(organisation.treasury2, 4)}
                        </p>
                      )}
                    </div>
                    <div className="max-w-[50%]">
                      <h3 className="font-bold mb-2 text-center">Бажарувчи:</h3>
                      <p className="font-semibold mb-3 text-center">"{info.doer}"</p>
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
                      <p className="mt-2 w-full">Раҳбари:___________{info.boss}</p>
                    </div>
                  </div>
                </section>

                <div className="h-[16px] bg-mybackground w-[100%]  "></div>

                <section className="pt-8 pr-[40px] pb-[360px] pl-[80px] border border-gray-300" style={{ pageBreakBefore: "always" }}>
                  <div className="flex flex-col justify-end text-lg font-semibold items-end gap-1">
                    <span>{getFullDate(data.doc_date)}</span>
                    <span>{data.doc_num} сонли шартномага илова</span>
                  </div>

                  <h1 className="text-center text-lg my-[70px] font-semibold">
                    Оммавий тадбирни ўтказишда фуқаролар хавсизлигини таъминлаш ва жамоат тартибини сақлашни ташкил
                    этишда
                  </h1>

                  <h1 className="text-center text-lg mb-[50px] font-semibold ">Харажатлар сметаси</h1>
                  {data && <BudgetTable data={data} />}
                  <div className="flex items-start justify-around mt-14">
                    <div className="flex items-center flex-col">
                      <h1 className="text-center text-lg  font-semibold">Буюртмачи:</h1>
                      <span className="block mt-5">______________________________</span>
                    </div>
                    <div className="flex items-center flex-col">
                      <h1 className="text-center text-lg  font-semibold">Бажарувчи:</h1>
                      <span className="block mt-5">______________________________</span>
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

export default LawyerDocument;
