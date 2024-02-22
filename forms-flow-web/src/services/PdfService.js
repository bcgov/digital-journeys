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
  let maxWidth = '1440px';
  if (window.location.href.includes('/task/')) {
    maxWidth = '1920px';
  }
  const checkedRadio = document.querySelectorAll('input[type="radio"]:checked');
  const appContainer = document.querySelectorAll("div.app-container.container");
  if (appContainer.length > 0) {
    appContainer[0].style.maxWidth = maxWidth;
    appContainer[0].style.minWidth = maxWidth;
  }
  //hide textarea at the time of print ticket#1291
  const textAreas = document.querySelectorAll('textarea.form-control');
  let changeTextAreasElm = [];
  textAreas.forEach((elm) => {
    if (elm.style.display === "" || elm.style.display === "block") {
      elm.insertAdjacentHTML(
        "afterend",
        `<div class="textarea-edit-print-only form-control" style="height:auto">${elm.value}</div>`
      );
      elm.style.display = "none";
      changeTextAreasElm.push(elm);
    }
  });
  // hide block with class .hidden-in-print
  const hiddenInPrint = document.querySelectorAll(".hidden-in-print");
  let changeElm = [];
  hiddenInPrint.forEach((elm) => {
    if (elm.style.display === "" || elm.style.display === "block") {
      elm.style.display = "none";
      changeElm.push(elm);
    }
  });
  /** .show-in-print-only has property display:none 
  * so no need to check for style.display none or block.
  */
  const showInPrint = document.querySelectorAll(".show-in-print-only");
  let changeHiddenElm = [];
  showInPrint.forEach((elm) => {
      elm.style.display = "block";
      changeHiddenElm.push(elm);
  });
  // Hiding the floating buttons during the PDF generation
  const selectors = "button.floatingButton,.formio-component-button";
  const floatingButtons = document.querySelectorAll(selectors);
  floatingButtons.forEach((btmElm) => (btmElm.style.visibility = "hidden"));
  toast.success("Downloading...");
  exportToPdf({ formId: "formview", pdfName, formName });
  setTimeout(() => {
    checkedRadio.forEach((ele) => ele.checked = true);
    floatingButtons.forEach((btmElm) => (btmElm.style.visibility = "visible"));
    changeElm.forEach((elm) => (elm.style.display = "block"));
    changeHiddenElm.forEach((elm) => (elm.style.display = "none"));
    changeHiddenElm = [];
    changeElm = [];
    // visible textarea again and remove additional temp div ticket#1291
    const textareaEditPrintOnly = document.querySelectorAll(".textarea-edit-print-only");
    textareaEditPrintOnly.forEach((elm) => elm.remove());
    changeTextAreasElm.forEach((elm) => (elm.style.display = "block"));
    changeTextAreasElm = [];
    if (appContainer.length > 0) {
      appContainer[0].style.maxWidth = '';
      appContainer[0].style.minWidth = '';
    }
  }, 2000);
};

const getTodayDateString = () => {
  const today = new Date();
  // Return today's date in yyy-m-d format in the client's timezone
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};