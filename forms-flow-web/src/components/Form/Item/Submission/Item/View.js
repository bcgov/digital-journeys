import React from 'react';
import {connect, useSelector} from 'react-redux'
import {selectRoot, resetSubmissions, saveSubmission, Form, selectError, Errors} from 'react-formio';
import {push} from 'connected-react-router';
import {Button} from "react-bootstrap";
import { jsPDF } from 'jspdf';


import Loading from '../../../../../containers/Loading'
import {setFormSubmissionLoading} from "../../../../../actions/formActions";
import LoadingOverlay from "react-loading-overlay";

const View = React.memo((props) => {

  const pdfDownload = () => {
    const pdfPageHeight = 4000;
    const mainPrintableContainer = document.getElementById('main');
    const pageHeader = document.getElementById('main-header');
    
    // Hide the page header before creating the PDF
    pageHeader.style.visibility = "hidden";
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [mainPrintableContainer.offsetWidth, pdfPageHeight],
    });

    doc.html(mainPrintableContainer, {
    callback: () => {
        doc.save('forms.pdf');
        // Show the page header again after creating the PDF
        pageHeader.style.visibility = "visible";
    },
  });
    
  }


  const {
    hideComponents,
    onSubmit, options,
    errors,
    form: {form, isActive: isFormActive},
    submission: {submission, isActive: isSubActive, url},
    showPrintButton
  } = props;
  const isFormSubmissionLoading = useSelector(state => state.formDelete.isFormSubmissionLoading);
  if (isFormActive || (isSubActive && !isFormSubmissionLoading)) {
    return <Loading/>;
  }


  return (
    <div className="container row task-container">
      <div className="main-header" id='main-header'>
        <h3 className="task-head"> {form.title}</h3>
        {showPrintButton?<div className="btn-right">
          <Button className="btn btn-primary btn-sm form-btn pull-right btn-right" onClick={pdfDownload}>
          <i className="fa fa-print" aria-hidden="true"/> Print As PDF</Button></div>:null}
      </div>

      <Errors errors={errors}/>
      <LoadingOverlay active={isFormSubmissionLoading} spinner text='Loading...' className="col-12">
        <div className="sub-container" id='formview'>
          <Form
            form={form}
            submission={submission}
            url={url}
            hideComponents={hideComponents}
            onSubmit={onSubmit}
            options={{...options}}
          />
        </div>
      </LoadingOverlay>
    </div>
  );
})

View.defaultProps = {
  showPrintButton: true
}

const mapStateToProps = (state) => {
  return {
    form: selectRoot('form', state),
    submission: selectRoot('submission', state),
    options: {
      readOnly: true,
    },
    errors: [
      selectError('submission', state),
      selectError('form', state)
    ],
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (submission) => {
      dispatch(setFormSubmissionLoading(true));
      dispatch(saveSubmission('submission', submission, ownProps.match.params.formId, (err, submission) => {
        if (!err) {
          dispatch(resetSubmissions('submission'));
          dispatch(setFormSubmissionLoading(false));
          dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}`))
        } else {
          dispatch(setFormSubmissionLoading(false));
        }
      }));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(View)