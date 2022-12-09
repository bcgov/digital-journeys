import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";

export const exportToPdf = ({formId, formName, pdfName}) => {
  const pdfPageHeight = 1500;
  const mainPrintableContainer = document.getElementById(formId);
  const opt = {
    margin: [64, 0, 64, 0],
    filename: `${formName || "form-exported"}-${
      (pdfName && pdfName.replace(/[^a-z0-9]/gi, '_').toLowerCase()) || getTodayDateString()
    }.pdf`,
    pagebreak: { mode: ["avoid-all", "css"] },
    image: { type: "jpeg", quality: 1.0 },
    html2canvas: { scale: 1 },
    jsPDF: {
      unit: "px",
      format: [mainPrintableContainer.offsetWidth, pdfPageHeight],
      orientation: "portrait",
    },
  };
  html2pdf().set(opt).from(mainPrintableContainer).save();
};

export const printToPDF = ({ pdfName, formName }) => {
  // Hiding the floating buttons during the PDF generation
  const floatingButtons = document.querySelectorAll("button.floatingButton");
  floatingButtons.forEach((btmElm) => (btmElm.style.visibility = "hidden"));
  toast.success("Downloading...");
  exportToPdf({ formId: "formview", pdfName, formName });
  setTimeout(() => {
    floatingButtons.forEach((btmElm) => (btmElm.style.visibility = "visible"));
  }, 2000);
};

const getTodayDateString = () => {
  const today = new Date();
  // Return today's date in yyy-m-d format in the client's timezone
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};