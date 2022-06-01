import html2pdf from 'html2pdf.js';

export const exportToPdf = (options) => {
  const pdfPageHeight = 1500;
  const mainPrintableContainer = document.getElementById(options.formId);
  var opt = {
    margin: [64, 0, 64, 0],
    filename: `form-exported-${new Date().getTime()}.pdf`,
    pagebreak: {mode: ['avoid-all']},
    image: { type: 'jpeg', quality: 0.50 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'px', format: [mainPrintableContainer.offsetWidth, pdfPageHeight], orientation: 'portrait' }
  };
  html2pdf().set(opt).from(mainPrintableContainer).save();
};