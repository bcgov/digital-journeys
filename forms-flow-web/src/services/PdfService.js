import html2pdf from 'html2pdf.js';
import { toast } from "react-toastify";

export const exportToPdf = (options) => {
  const pdfPageHeight = 1500;
  const mainPrintableContainer = document.getElementById(options.formId);
  var opt = {
    margin: [64, 0, 64, 0],
    filename: `form-exported-${new Date().getTime()}.pdf`,
    pagebreak: {mode: ['avoid-all', 'css']},
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { scale: 1 },
    jsPDF: { unit: 'px', format: [mainPrintableContainer.offsetWidth, pdfPageHeight], orientation: 'portrait' }
  };
  html2pdf().set(opt).from(mainPrintableContainer).save();
};

export const printToPDF = () => {
  toast.success("Downloading...");
  exportToPdf({ formId: "formview" });
};
