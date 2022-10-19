import React from "react";
import { useTranslation } from "react-i18next";
import { printToPDF } from "../services/PdfService";

const PrintPDF = React.memo(() => {
  const { t } = useTranslation();
  return (
    <div className="row ">
        <div className="btn-right">
        <button
            type="button"
            className="btn btn-primary btn-sm form-btn pull-right btn-right btn btn-primary"
            onClick={() => printToPDF()}
            style={{marginRight: "15px"}}
        >
            <i className="fa fa-print" aria-hidden="true"></i> {t(`Print As PDF`)}
        </button>
        </div>
    </div>
  );
});
export default PrintPDF;