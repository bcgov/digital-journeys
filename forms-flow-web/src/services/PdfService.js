import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";

export const exportToPdf = (options) => {
  const pdfPageHeight = 1500;
  const mainPrintableContainer = document.getElementById(options.formId);
  const defaultFileName = `form-exported-${new Date().getTime()}`;
  var opt = {
    margin: [64, 0, 64, 0],
    filename: `${options.pdfName || defaultFileName}.pdf`,
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

export const printToPDF = ({ pdfName }) => {
  // Hiding the floating buttons during the PDF generation
  const floatingButtons = document.querySelectorAll("button.floatingButton");
  floatingButtons.forEach((btmElm) => (btmElm.style.visibility = "hidden"));
  toast.success("Downloading...");
  exportToPdf({ formId: "formview", pdfName });
  setTimeout(() => {
    floatingButtons.forEach((btmElm) => (btmElm.style.visibility = "visible"));
  }, 2000);
};
