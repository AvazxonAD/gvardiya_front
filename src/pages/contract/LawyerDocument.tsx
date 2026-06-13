import { getContractId, getOrganId, getSpr } from "@/api";
import { formatDateTime, textNum, tt, viewAndDownloadPdf } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
import { EImzo, type EimzoCertificate } from "@/lib/eimzo";
import { URL as API_URL } from "@/api";
import html2pdf from "html2pdf.js";
import VerificationHistoryModal from "./VerificationHistoryModal";
import CertSelectModal from "./CertSelectModal";

interface VerificationInfo {
  id: number;
  contract_id: number;
  user_id: number;
  file_name: string;
  signer_name: string;
  user_type?: string | null;
  created_at: string;
}

const SIGNER_TYPE_LABEL: Record<string, { uz: string; ru: string }> = {
  admin: { uz: "Boshliq", ru: "Начальник" },
  lawyer: { uz: "Yurist", ru: "Юрист" },
};

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
  const location = useLocation();
  const navigate = useNavigate();
  const shouldGeneratePdf = (location.state as any)?.generatePdf === true;

  const { account_number_id } = useSelector((state: any) => state.account);

  // E-IMZO state
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");
  const [signSuccess, setSignSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  // Yurist va boshliq imzolari alohida — har biri o'z yozuvi bilan ko'rsatiladi
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Bir nechta E-IMZO kaliti bo'lsa tanlash oynasi
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certList, setCertList] = useState<EimzoCertificate[]>([]);

  // Rad qilish (yurist sabab yozib rad qiladi)
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectionInfo, setRejectionInfo] = useState<{
    reason: string;
    created_at?: string;
  } | null>(null);

  const documentRef = useRef<HTMLDivElement>(null);

  const loadVerificationInfo = async () => {
    try {
      const res = await request.get(`/contract/${id}/verification`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setVerificationInfo(res.data.data);
      }
    } catch {}
  };

  // Tarixdan eng so'nggi rad qilish yozuvini olish (sababi bilan)
  const loadRejectionInfo = async () => {
    try {
      const res = await request.get(`/contract/${id}/verification/history`);
      if (res.data.success && Array.isArray(res.data.data)) {
        const rejected = res.data.data.find((it: any) => it.status === "rejected");
        if (rejected) {
          setRejectionInfo({ reason: rejected.reason || "", created_at: rejected.created_at });
        }
      }
    } catch {}
  };

  const getInfo = async () => {
    const res = await getContractId(JWT, id, account_number_id);
    if (res.success) {
      await getInfoForDoc(res.data);
      setData(res.data);
      setVerificationStatus(res.data.verification_lawyer || null);
      if (res.data.verification_lawyer === "success" || res.data.verification_boss === "success") {
        loadVerificationInfo();
      }
      if (res.data.verification_lawyer === "rejected") {
        loadRejectionInfo();
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

  const handleSignError = (err: any) => {
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
  };

  // Tanlangan kalit bilan imzolash — E-IMZO aynan shu kalit uchun parol so'raydi
  const signWithCert = async (cert: EimzoCertificate) => {
    setCertModalOpen(false);
    setSigning(true);
    setSignError("");

    try {
      // 1. Shartnoma ma'lumotlarini usb_manager orqali imzolash (parol oynasi shu yerda ochiladi)
      const content = `contract_id:${id}|doc_num:${data.doc_num}|verify:lawyer`;
      const content64 = btoa(unescape(encodeURIComponent(content)));
      const sigResult = await EImzo.sign(content64, cert);

      // 2. Backendga signer_name va sig_data yuborish (PDF backendda yangilanadi)
      const res = await request.patch(`/contract/${id}/verify-lawyer`, {
        signer_name: sigResult.signer_name,
        sig_data: sigResult.pkcs7_64,
      });

      if (res.data.success) {
        setSignSuccess(true);
        setVerificationStatus("success");
        setVerificationInfo(Array.isArray(res.data.data) ? res.data.data : []);
        regenerateAfterSign.current = true;
        dispatch(alertt({ text: "Shartnoma muvaffaqiyatli tasdiqlandi!", success: true, open: true }));
      } else {
        throw new Error(res.data.message || "Tasdiqlashda xatolik");
      }
    } catch (err: any) {
      handleSignError(err);
    } finally {
      setSigning(false);
    }
  };

  // E-IMZO bilan tasdiqlash: kalit bitta bo'lsa to'g'ridan-to'g'ri imzolanadi,
  // bir nechta bo'lsa foydalanuvchi tanlash oynasidan kalitni belgilaydi
  const handleEimzoSign = async () => {
    setSigning(true);
    setSignError("");
    setSignSuccess(false);

    try {
      // 1. usb_manager orqali E-IMZO holatini tekshirish
      const status = await EImzo.getStatus();
      if (!status.running) {
        throw new Error(
          status.installed
            ? "E-IMZO dasturi ishga tushmagan. Uni oching va qaytadan urinib ko'ring."
            : "E-IMZO dasturi o'rnatilmagan.",
        );
      }
      if (!status.hasKey) throw new Error("E-IMZO kaliti topilmadi");

      // 2. Kalitlar ro'yxati
      const certs = await EImzo.listCertificates();
      if (certs.length === 0) throw new Error("E-IMZO kaliti topilmadi");

      if (certs.length === 1) {
        await signWithCert(certs[0]);
      } else {
        setCertList(certs);
        setCertModalOpen(true);
        setSigning(false);
      }
    } catch (err: any) {
      handleSignError(err);
      setSigning(false);
    }
  };

  // Yurist rad qiladi — sabab majburiy
  const handleReject = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      dispatch(
        alertt({
          text: tt("Rad qilish sababini kiriting!", "Укажите причину отказа!"),
          success: false,
        })
      );
      return;
    }

    setRejecting(true);
    try {
      const res = await request.patch(`/contract/${id}/reject-lawyer`, { reason });
      if (res.data.success) {
        setRejectOpen(false);
        setRejectReason("");
        dispatch(
          alertt({ text: tt("Shartnoma rad qilindi", "Договор отклонён"), success: true })
        );
        // Rad qilingan shartnoma yuristdan chiqib ketadi — ro'yxatga qaytamiz
        navigate("/lawyer-contract");
      } else {
        throw new Error(res.data.message || "Xatolik");
      }
    } catch (err: any) {
      dispatch(
        alertt({
          text: err?.response?.data?.message || err.message || "Xatolik yuz berdi",
          success: false,
        })
      );
    } finally {
      setRejecting(false);
    }
  };

  useEffect(() => {
    if (data && organisation) {
      getSingleTemplate();
    }
  }, [templatesData, data, organisation]);

  // Har safar sahifa ochilganda avtomatik PDF yaratib saqlash
  const pdfUploaded = useRef(false);
  const regenerateAfterSign = useRef(false);

  const uploadPdfToServer = async () => {
    const blob = await generatePdf();
    const formData = new FormData();
    formData.append("file", blob, `contract-${id}.pdf`);
    const res = await request.patch(`/contract/${id}/upload-pdf`, formData);
    return res?.data?.data?.file as string | undefined;
  };

  useEffect(() => {
    if (singleTemplate && data && !pdfUploaded.current && (shouldGeneratePdf || !data.file)) {
      pdfUploaded.current = true;
      setTimeout(async () => {
        try {
          await uploadPdfToServer();
        } catch (e) {
          console.error("PDF avtomatik yaratishda xatolik:", e);
        }
      }, 1000);
    }
  }, [singleTemplate, data]);

  // Tasdiqlangandan keyin yangi PDF (tasdiqlash belgilari bilan) yaratib server'ga yuklash
  useEffect(() => {
    if (verificationInfo.length === 0 || !regenerateAfterSign.current) return;
    regenerateAfterSign.current = false;
    setTimeout(async () => {
      try {
        const newFile = await uploadPdfToServer();
        if (newFile) {
          setData((prev: any) => (prev ? { ...prev, file: newFile } : prev));
          // Tasdiqlash banneridagi "PDF" tugmasi ham aynan shu (belgili) faylni bersin
          setVerificationInfo((prev) => prev.map((v) => ({ ...v, file_name: newFile })));
        }
      } catch (e) {
        console.error("Tasdiqlangan PDF yaratishda xatolik:", e);
      }
    }, 500);
  }, [verificationInfo]);

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
                {verificationStatus !== "success" && (
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
                {/* Rad qilish tugmasi — tasdiqlanmagan va hali rad qilinmagan bo'lsa */}
                {verificationStatus !== "success" && verificationStatus !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => setRejectOpen(true)}
                    disabled={rejecting}
                    className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-[#fca5a5] text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                    </svg>
                    {tt("Rad qilish", "Отклонить")}
                  </button>
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
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                    {tt("PDF yuklab olish", "Скачать PDF")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm-1 5v5l4.25 2.52.75-1.23-3.5-2.07V8H12z" />
                  </svg>
                  {tt("Tarix", "История")}
                </button>
              </div>
            </div>

            {/* E-IMZO xatolik xabari */}
            {signError && (
              <div className="mx-16 mt-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {signError}
              </div>
            )}

            {/* Rad qilingan holat — sababi bilan */}
            {verificationStatus === "rejected" && rejectionInfo && (
              <div className="mx-16 mt-2 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-red-600">
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                  </svg>
                  {tt("Shartnoma yurist tomonidan rad qilingan", "Договор отклонён юристом")}
                  {rejectionInfo.created_at && (
                    <span className="font-normal text-red-600">
                      — {formatDateTime(rejectionInfo.created_at)}
                    </span>
                  )}
                </div>
                {rejectionInfo.reason && (
                  <div className="mt-1">
                    <span className="font-semibold">{tt("Sabab", "Причина")}:</span>{" "}
                    {rejectionInfo.reason}
                  </div>
                )}
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

                  {verificationInfo.length > 0 && (
                    <div className="mt-10 flex justify-end">
                      <div className="flex flex-row flex-wrap justify-end gap-2">
                        {verificationInfo.map((v) => (
                          <div key={v.id} className="inline-flex items-center gap-2 px-3 py-2 border border-green-400 bg-green-50 rounded-md text-[12px] text-green-800">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-green-600">
                              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.41 14.42L7.17 12l1.41-1.41 2.01 2.01 5.04-5.04 1.41 1.42-6.46 6.44z" />
                            </svg>
                            <div className="flex flex-col leading-tight">
                              <span className="font-semibold">
                                {v.signer_name}
                                {v.user_type && SIGNER_TYPE_LABEL[v.user_type] && (
                                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700">
                                    {tt(
                                      SIGNER_TYPE_LABEL[v.user_type].uz,
                                      SIGNER_TYPE_LABEL[v.user_type].ru,
                                    )}
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-green-700">
                                {tt("E-IMZO bilan tasdiqlandi", "Утверждено E-IMZO")}: {formatDateTime(v.created_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </>
      )}
      <VerificationHistoryModal
        contractId={id || ""}
        docNum={data?.doc_num}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      {/* E-IMZO kalitini tanlash oynasi (bir nechta kalit bo'lsa) */}
      <CertSelectModal
        open={certModalOpen}
        certs={certList}
        onSelect={signWithCert}
        onClose={() => setCertModalOpen(false)}
      />

      {/* Rad qilish sababi modali */}
      {rejectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setRejectOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">
                {tt("Shartnomani rad qilish", "Отклонить договор")}
              </h2>
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold mb-2">
                {tt("Rad qilish sababi", "Причина отказа")}
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder={tt("Sababni yozing...", "Укажите причину...")}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm bg-white dark:bg-gray-800 outline-none focus:border-gray-500 resize-none"
              />
            </div>

            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-semibold cursor-pointer"
              >
                {tt("Bekor qilish", "Отмена")}
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={rejecting || !rejectReason.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-[#fca5a5] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {rejecting && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {tt("Rad qilish", "Отклонить")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LawyerDocument;
