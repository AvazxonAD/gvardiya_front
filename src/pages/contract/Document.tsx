import { getContractId, getOrganId, getSpr, URL as API_URL } from "@/api";
import { textNum, tt, viewAndDownloadPdf } from "@/utils";
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
import html2pdf from "html2pdf.js";
import { useLocation } from "react-router-dom";
import { EImzo } from "@/lib/eimzo";

const Document = () => {
  const [templatesData, setTemplatesdata] = React.useState<templateInterface[]>([]);
  const request = useRequest();
  const [openSwitcher, setOpenSwitcher] = React.useState(false);
  const [singleTemplate, setSingleTemplate] = React.useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [isSentToLawyer, setIsSentToLawyer] = useState(false);
  const [didoxSending, setDidoxSending] = useState(false);
  const [didoxLoginOpen, setDidoxLoginOpen] = useState(false);
  const [didoxPassword, setDidoxPassword] = useState("");
  const [didoxLoginLoading, setDidoxLoginLoading] = useState(false);
  const [didoxSigning, setDidoxSigning] = useState(false);
  const [didoxPdfModal, setDidoxPdfModal] = useState(false);
  const [didoxPdfBase64, setDidoxPdfBase64] = useState<string>("");
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
  const location = useLocation();
  const shouldGeneratePdf = (location.state as any)?.generatePdf === true;
  const documentRef = useRef<HTMLDivElement>(null);

  //@ts-ignore
  const [urlParams] = useSearchParams();
  const template_id = urlParams.get("template_id");

  const { account_number_id } = useSelector((state: any) => state.account);

  const getInfo = async () => {
    const res = await getContractId(JWT, id, account_number_id);
    if (res.success) {
      await getInfoForDoc(res.data);
      setData(res.data);
      setIsSentToLawyer(res.data.send_lawyer || false);
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

  const handleSendToLawyer = async () => {
    try {
      const activeTemplate = templatesData.find((el) => el.active === true);
      if (!activeTemplate) {
        dispatch(alertt({ text: tt("Avval shablon tanlang", "Сначала выберите шаблон"), success: false, open: true }));
        return;
      }
      const res = await request.patch(`/contract/${id}/send-lawyer`, { template_id: activeTemplate.id });
      if (res.data.success) {
        setIsSentToLawyer(true);
        dispatch(alertt({ text: tt("Yuristga jo'natildi", "Отправлено юристу"), success: true, open: true }));
      } else {
        dispatch(alertt({ text: res.data.message || tt("Xatolik", "Ошибка"), success: false, open: true }));
      }
    } catch (err: any) {
      dispatch(alertt({ text: err.message || tt("Xatolik", "Ошибка"), success: false, open: true }));
    }
  };

  const handleSendToDidox = async () => {
    setDidoxSending(true);
    try {
      const res = await request.post(`/didox/contract/${id}/send`);
      if (res.data.success) {
        dispatch(alertt({ text: tt("Didoxga jo'natildi", "Отправлено в Didox"), success: true, open: true }));
        await getInfo();
      } else {
        dispatch(alertt({ text: res.data.message || tt("Xatolik", "Ошибка"), success: false, open: true }));
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.data?.message?.includes("login")) {
        setDidoxLoginOpen(true);
      } else {
        dispatch(alertt({ text: err.response?.data?.message || err.message || tt("Xatolik", "Ошибка"), success: false, open: true }));
      }
    } finally {
      setDidoxSending(false);
    }
  };

  const handleDidoxLogin = async () => {
    setDidoxLoginLoading(true);
    try {
      const res = await request.post("/didox/login", { password: didoxPassword });
      if (res.data.success) {
        setDidoxLoginOpen(false);
        setDidoxPassword("");
        dispatch(alertt({ text: tt("Didox ga muvaffaqiyatli kirildi", "Успешный вход в Didox"), success: true, open: true }));
        // Login bo'lgandan keyin avtomatik qayta yuborish
        handleSendToDidox();
      } else {
        dispatch(alertt({ text: res.data.message || tt("Xatolik", "Ошибка"), success: false, open: true }));
      }
    } catch (err: any) {
      dispatch(alertt({ text: err.response?.data?.message || err.message || tt("Xatolik", "Ошибка"), success: false, open: true }));
    } finally {
      setDidoxLoginLoading(false);
    }
  };

  // Tasdiqlash — avval PDF ko'rsatish
  const handleDidoxPreview = async () => {
    setDidoxSigning(true);
    try {
      const docRes = await request.get(`/didox/contract/${id}/pdf`);
      if (!docRes.data.success) {
        dispatch(alertt({ text: docRes.data.message || tt("Xatolik", "Ошибка"), success: false, open: true }));
        return;
      }
      const resData = docRes.data.data;
      let pdfData = typeof resData === "string" ? resData : resData?.file?.data || resData?.data || "";
      if (typeof pdfData === "string" && pdfData.includes("base64,")) {
        pdfData = pdfData.split("base64,")[1];
      }
      setDidoxPdfBase64(pdfData);
      setDidoxPdfModal(true);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.data?.message?.includes("login")) {
        setDidoxLoginOpen(true);
      } else {
        dispatch(alertt({ text: err.response?.data?.message || err.message || String(err), success: false, open: true }));
      }
    } finally {
      setDidoxSigning(false);
    }
  };

  // Modal ichidan E-IMZO bilan imzolash (JSON imzolanadi)
  const handleDidoxSign = async () => {
    setDidoxSigning(true);
    try {
      // 1. Document JSON olish
      const docRes = await request.get(`/didox/contract/${id}/document`);
      if (!docRes.data.success) {
        dispatch(alertt({ text: docRes.data.message || tt("Xatolik", "Ошибка"), success: false, open: true }));
        return;
      }
      const docJson = docRes.data.data;

      // 2. JSON → base64
      const jsonString = JSON.stringify(docJson);
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

      // 3. E-IMZO bilan imzolash
      const certs = await EImzo.listAllCertificates();
      if (!certs || certs.length === 0) {
        dispatch(alertt({ text: tt("E-IMZO kaliti topilmadi", "Ключ E-IMZO не найден"), success: false, open: true }));
        return;
      }
      const cert = certs[0];
      const keyId = await EImzo.loadKey(cert.disk, cert.path, cert.name, cert.alias);
      const eimzoResult = await EImzo.createPkcs7(base64Data, keyId);
      const pkcs7 = eimzoResult.pkcs7_64;

      // 4. Backend ga pkcs7 yuborish (timestamp + sign backendda)
      const signRes = await request.post(`/didox/contract/${id}/sign`, { pkcs7 });

      if (signRes.data.success) {
        dispatch(alertt({ text: tt("Didoxda tasdiqlandi", "Подтверждено в Didox"), success: true, open: true }));
        setData({ ...data, didox_status: "confirm" });
        setDidoxPdfModal(false);
        setDidoxPdfBase64("");
      } else {
        dispatch(alertt({ text: signRes.data.message || tt("Xatolik", "Ошибка"), success: false, open: true }));
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.data?.message?.includes("login")) {
        setDidoxLoginOpen(true);
      } else {
        dispatch(alertt({ text: err.response?.data?.message || err.message || String(err), success: false, open: true }));
      }
    } finally {
      setDidoxSigning(false);
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

    function getMonthName(oyRaqami: number) {
      const oylar = [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ];

      if (oyRaqami < 1 || oyRaqami > 12) {
        return "Noto‘g‘ri oy raqami";
      }

      return oylar[oyRaqami - 1];
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
            updatedtemplate.section_2 = formatSectionText(updatedtemplate.section_2);
          }

          // Format other sections
          if (updatedtemplate.section_1) {
            updatedtemplate.section_1 = formatSectionText(updatedtemplate.section_1);
            if (updatedtemplate.section_1.includes("${start_month}")) {
              const start_month = new Date(data.start_date).getMonth() + 1;
              const end_month = new Date(data.end_date).getMonth() + 1;
              const start_month_str = getMonthName(start_month);
              const end_month_str = getMonthName(end_month);
              const year = new Date(data.start_date).getFullYear();

              // Bold uchun span qo'shamiz
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
          if (updatedtemplate.section_3) {
            updatedtemplate.section_3 = formatSectionText(updatedtemplate.section_3);
          }
          if (updatedtemplate.section_4) {
            updatedtemplate.section_4 = formatSectionText(updatedtemplate.section_4);
          }
          if (updatedtemplate.section_5) {
            updatedtemplate.section_5 = formatSectionText(updatedtemplate.section_5);
          }
          if (updatedtemplate.section_6) {
            updatedtemplate.section_6 = formatSectionText(updatedtemplate.section_6);
          }
          if (updatedtemplate.section_7) {
            updatedtemplate.section_7 = formatSectionText(updatedtemplate.section_7);
          }
          if (updatedtemplate.main_section) {
            updatedtemplate.main_section = formatSectionText(updatedtemplate.main_section);
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

  // PDF avtomatik yaratish: file null bo'lsa yoki create/update dan kelgan bo'lsa
  const pdfUploaded = useRef(false);
  useEffect(() => {
    if (singleTemplate && data && !pdfUploaded.current && (shouldGeneratePdf || !data.file)) {
      pdfUploaded.current = true;
      setTimeout(async () => {
        try {
          const element = documentRef.current;
          if (!element) return;

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
              margin: [5, 0, 5, 0],
              image: { type: "jpeg", quality: 0.95 },
              html2canvas: { scale: 2, useCORS: true, scrollY: -window.scrollY },
              jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
              pagebreak: { mode: "css", avoid: ["h1", "h2", "h3"] },
            })
            .from(element)
            .outputPdf("blob");

          sections.forEach((s, i) => (s.style.cssText = savedStyles[i]));
          dividers.forEach((d) => (d.style.display = ""));

          const formData = new FormData();
          formData.append("file", blob, `contract-${id}.pdf`);
          await request.patch(`/contract/${id}/upload-pdf`, formData);
        } catch (e) {
          console.error("PDF avtomatik yaratishda xatolik:", e);
        }
      }, 1000);
    }
  }, [singleTemplate, data]);

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
                {!isSentToLawyer ? (
                  <Button onClick={handleSendToLawyer} mode="clear" text={tt("Yuristga jo'natish", "Отправить юристу")} />
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    {tt("Yuristga jo'natilgan", "Отправлено юристу")}
                  </div>
                )}
                {data?.file && (
                  <button
                    type="button"
                    onClick={() =>
                      viewAndDownloadPdf(
                        API_URL + data.file,
                        `shartnoma_${data?.doc_num || id}.pdf`
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                    PDF
                  </button>
                )}
                <button
                  onClick={handleSendToDidox}
                  disabled={didoxSending || !data?.file}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-[#FCD34D] text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {didoxSending ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {tt("Kuting...", "Подождите...")}
                    </>
                  ) : (
                    tt("Didoxga jo'natish", "Отправить в Didox")
                  )}
                </button>
                <button
                  onClick={handleDidoxPreview}
                  disabled={didoxSigning || !data?.didox_id}
                  className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:bg-[#6ee7b7] text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {didoxSigning ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {tt("Kuting...", "Подождите...")}
                    </>
                  ) : (
                    tt("Tasdiqlash", "Подтвердить")
                  )}
                </button>
                {data?.didox_status === "confirm" && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    {tt("Didoxda tasdiqlangan", "Подтверждено в Didox")}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-[100px] mt-5">
              <div ref={documentRef} className="container mx-auto   text-wrap    text-[16px] overfloww my-auto w-[795px] bg-mybackground text-mytextcolor font__times">
                <section className="pt-10 pr-[40px] pl-[80px] border border-gray-300">
                  <h1 className="text-center font-bold text-lg mb-1">
                    {/* Оммавий тадбирни ўтказишда фуқаролар хавфсизлигини таъминлаш
                  ва жамоат тартибини сақлаш тўғрисида намунавий шартнома */}
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

                <section className="pt-8 pr-[40px] pb-5 pl-[80px] border border-gray-300">
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

                <section className="pt-8 pr-[40px] pb-5 pl-[80px] border border-gray-300" style={{ pageBreakBefore: "always" }}>
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
      {/* Didox PDF Preview Modal */}
      {didoxPdfModal && didoxPdfBase64 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90%] h-[90%] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-mytextcolor">
                {tt("Hujjatni ko'rish", "Просмотр документа")}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDidoxSign}
                  disabled={didoxSigning}
                  className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:bg-[#6ee7b7] text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {didoxSigning ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {tt("Kuting...", "Подождите...")}
                    </>
                  ) : (
                    tt("E-IMZO bilan tasdiqlash", "Подтвердить через E-IMZO")
                  )}
                </button>
                <button
                  onClick={() => { setDidoxPdfModal(false); setDidoxPdfBase64(""); }}
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {tt("Yopish", "Закрыть")}
                </button>
              </div>
            </div>
            <div className="flex-1 p-2">
              <iframe
                src={(() => {
                  const byteCharacters = atob(didoxPdfBase64);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }
                  const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
                  return window.URL.createObjectURL(blob);
                })()}
                className="w-full h-full rounded"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Didox Login Modal */}
      {didoxLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px] shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-mytextcolor">
              {tt("Didox ga kirish", "Вход в Didox")}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-mytextcolor">
                {tt("Parol", "Пароль")}
              </label>
              <input
                type="password"
                value={didoxPassword}
                onChange={(e) => setDidoxPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDidoxLogin()}
                className="w-full border rounded-md px-3 py-2 bg-mybackground text-mytextcolor"
                placeholder={tt("Parolni kiriting", "Введите пароль")}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setDidoxLoginOpen(false); setDidoxPassword(""); }}
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {tt("Bekor qilish", "Отмена")}
              </button>
              <button
                onClick={handleDidoxLogin}
                disabled={didoxLoginLoading || !didoxPassword}
                className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {didoxLoginLoading ? tt("Kuting...", "Подождите...") : tt("Kirish", "Войти")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Document;
