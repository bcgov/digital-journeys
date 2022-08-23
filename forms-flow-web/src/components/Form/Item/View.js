import React, { useCallback, useEffect, useState} from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  selectRoot,
  resetSubmissions,
  saveSubmission,
  Form,
  selectError,
  Errors,
  getForm,
  Formio
} from "react-formio";
import { push } from "connected-react-router";
import { Link, useParams } from "react-router-dom";
import Loading from "../../../containers/Loading";
import { getProcessReq } from "../../../apiManager/services/bpmServices";
import {
  setFormFailureErrorData,
  setFormRequestData,
  setFormSubmissionError,
  setFormSubmissionLoading,
  setMaintainBPMFormPagination,
  setFormSuccessData,
} from "../../../actions/formActions";
import SubmissionError from "../../../containers/SubmissionError";
import { 
  applicationCreate,
  publicApplicationCreate,
  publicApplicationStatus,
} from "../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";
import { CUSTOM_EVENT_TYPE } from "../../ServiceFlow/constants/customEventTypes";
import { toast } from "react-toastify";
import {
  setFormSubmitted
} from "../../../actions/formActions";
import { fetchFormByAlias } from "../../../apiManager/services/bpmFormServices";
import {checkIsObjectId} from "../../../apiManager/services/formatterService";
import { setPublicStatusLoading } from "../../../actions/applicationActions";

import {fetchEmployeeData} from "../../../apiManager/services/employeeDataService";
import { exportToPdf } from '../../../services/PdfService'

const View = React.memo((props) => {
  const isFormSubmissionLoading = useSelector(
    (state) => state.formDelete.isFormSubmissionLoading
  );
  const isPublicStatusLoading = useSelector(
    (state) => state.applications.isPublicStatusLoading
  );

  const isFormSubmitted = useSelector(
    (state) => state.formDelete.formSubmitted
  );
  const publicFormStatus = useSelector(
    (state) => state.formDelete.publicFormStatus
  );
  const isPublic = window.location.href.includes("public"); //need to remove
  const { formId } = useParams();
  const [showPublicForm, setShowPublicForm] = useState('checking');

  const {
    isAuthenticated,
    hideComponents,
    onSubmit,
    onCustomEvent,
    errors,
    options,
    form: { form, isActive, url },
    // getForm,
    getEmployeeData,
    employeeData,
  } = props;
  const dispatch = useDispatch();

  const getPublicForm = useCallback((form_id, isObjectId, formObj) => {
    dispatch(setPublicStatusLoading(true));
    dispatch(
      publicApplicationStatus(form_id, (err, res) => {
        dispatch(setPublicStatusLoading(false));
        if (!err) {
          if (isPublic) {
            if (isObjectId) {
              dispatch(getForm("form", form_id));
            }
            else {
              dispatch(setFormRequestData('form',form_id,`${Formio.getProjectUrl()}/form/${form_id}`));
              dispatch(setFormSuccessData('form',formObj));
            }
          }
        }
      })
    );
  },[dispatch,isPublic]);

  const getFormData = useCallback( () => {
    const isObjectId = checkIsObjectId(formId);
    if (isObjectId) {
      getPublicForm(formId,isObjectId);
    } else {
      dispatch(
        fetchFormByAlias(formId, async (err, formObj) => {
          if (!err) {
            const form_id = formObj._id;
            getPublicForm(form_id,isObjectId,formObj);
          }else{
            dispatch(setFormFailureErrorData('form',err));
          }
        })
      );
    }
  },[formId,dispatch,getPublicForm])

  useEffect(() => {
    if (isPublic) {
      getFormData();
    } else {
      dispatch(setMaintainBPMFormPagination(true));
    }
  }, [isPublic, dispatch,getFormData]);

  useEffect(()=>{
    if(publicFormStatus){
      if(publicFormStatus.anonymous===true && publicFormStatus.status==="active" ){
        setShowPublicForm(true);
      }else{
        setShowPublicForm(false);
      }
    }
  },[publicFormStatus])

  useEffect(() => {
    if (!isAuthenticated) {
      getForm();
    }
    getEmployeeData();
    dispatch(setMaintainBPMFormPagination(true));

  }, [getForm, getEmployeeData, isAuthenticated, dispatch]);

  if (isActive || isPublicStatusLoading) {
    return (
      <div data-testid='loading-view-component'>
        <Loading />
      </div>
    );
  }

  const printToPDF = () => {
    toast.success('Downloading...')
    exportToPdf({formId: 'formview'})
  }

  const getDefaultValues = (data) => {
    if (
      Object.keys(data)?.length === 0 ||
      form.components?.length === 0) {
      return;
    }

    // A recursive function to get all the key properties of the form
    function findAllKeys(obj, target) {
      const keys = [];
      const fnd = (obj) => {
        if (!obj || Object.entries(obj).length === 0) {
          return;
        }
        for (const [k, v] of Object.entries(obj)) {
          if (k === target) {
            keys.push(v);
          }
          if (typeof v === "object") {
            fnd(v);
          }
        }
      };
      fnd(obj);
      return keys;
    }
    const keys = findAllKeys(form.components, "key");
    const uniqueKeys = [... new Set(keys)];
    
    const filteredComponents = uniqueKeys?.filter((comp) => {
      const dataArray = Object.keys(data);
      if (comp.includes("_")) {
        return dataArray.some((dataItem) => comp.split("_")[0] === dataItem);
      }
      return dataArray.some((el2) => comp === el2);
    });

    const defaultValuesArray = filteredComponents?.map(filteredComp => {
      if (filteredComp.includes("_")) {
        return {
          [filteredComp]: data[filteredComp.split("_")[0]],
        };
      }
      return { [filteredComp]: data[filteredComp] };
    });

    const defaultValuesObject = defaultValuesArray?.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    return { data: defaultValuesObject };
  };

  if (isFormSubmitted) {
    return (
      <div className="text-center pt-5">
        <h1>Thank you for your response.</h1>
        <p>saved successfully</p>
      </div>
    );
  }

  if (isPublic && !showPublicForm) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        Form not available
      </div>
    );
  }

  return (
    <div className='container'>
      <div className='main-header'>
        <SubmissionError
          modalOpen={props.submissionError.modalOpen}
          message={props.submissionError.message}
          onConfirm={props.onConfirm}
        ></SubmissionError>
        {/*          <span className="ml-3">
            <img src="/form.svg" width="30" height="30" alt="form" />
          </span>*/}
        <h3 className='ml-3'>
          <span className='task-head-details'>
            <i className='fa fa-wpforms' aria-hidden='true' /> &nbsp; Forms /
          </span>{" "}
          {form.title}
        </h3>
      </div>
      <Errors errors={errors} />
      <LoadingOverlay
        active={isFormSubmissionLoading || employeeData.loading}
        spinner
        text={
          employeeData.loading
            ? "Loading user data..."
            : isFormSubmissionLoading
            ? "Submitting..."
            : "Loading..."
        }
        className='col-12'
      >
        <div class="row">
          <div class="btn-right">
            <button type="button" 
              class="btn btn-primary btn-sm form-btn pull-right btn-right btn btn-primary" 
              onClick={() => printToPDF()}>
                <i class="fa fa-print" aria-hidden="true"></i> Print As PDF
            </button>
          </div>
        </div>
        <div className='ml-4 mr-4' id='formview'>
          <Form
            form={form}
            submission={getDefaultValues(employeeData.data)}
            url={url}
            options={{ ...options }}
            hideComponents={hideComponents}
            onSubmit={(data) => {
              onSubmit(data, form._id);
            }}
            onCustomEvent={onCustomEvent}
          />
        </div>
      </LoadingOverlay>
    </div>
  );
});

const doProcessActions = (submission, ownProps) => {
  return (dispatch, getState) => {
    let user = getState().user.userDetail;
    let form = getState().form.form;
    let IsAuth = getState().user.isAuthenticated;
    dispatch(resetSubmissions("submission"));
    const data = getProcessReq(form, submission._id, "new", user);

    const isPublic = window.location.href.includes("public");

    if (isPublic) {
      // this is for anonymous
      dispatch(
        publicApplicationCreate(data, (err, res) => {
          if (!err) {
            dispatch(setFormSubmissionLoading(false));
            toast.success("Submission Saved.");
            dispatch(setFormSubmitted(true));
          } else {
            //TO DO Update to show error message
            dispatch(setFormSubmissionLoading(false));
            toast.error("Submission failed");
            // dispatch(setFormSubmitted())
            // dispatch(push(`/public/submitted`));
          }
        })
      );
    } else {
      dispatch(
        applicationCreate(data, (err, res) => {
          if (!err) {
            if (IsAuth) {
              dispatch(setFormSubmissionLoading(false));
              dispatch(setMaintainBPMFormPagination(true));
              /*dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`))*/
              // toast.success("Thank you for your submission. Once your submission has been reviewed by your supervisor, you will receive a notification via email. You can view a copy of your submission in your forms dashboard.");
              dispatch(push(`/success?type=submission`));
            } else {
              dispatch(setFormSubmissionLoading(false));
            }
          } else {
           
            //TO DO Update to show error message
            if (IsAuth) {
              dispatch(setFormSubmissionLoading(false));
              dispatch(setMaintainBPMFormPagination(true));
              //dispatch(push(`/form/${ownProps.match.params.formId}/submission/${submission._id}/edit`))
              toast.success("Thank you for your submission. Once your submission has been reviewed by your supervisor, you will receive a notification via email. You can view a copy of your submission in your forms dashboard.");
              dispatch(push(`/form`));
            }  else  {
              dispatch(setFormSubmissionLoading(false));
            }
          }
            })
      
      );
      }
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.user.userDetail,
    form: selectRoot("form", state),
    isAuthenticated: state.user.isAuthenticated,
    errors: [selectError("form", state), selectError("submission", state)],
    options: {
      noAlerts: false,
      i18n: {
        en: {
          error: "Please fix the errors before submitting again.",
        },
      },
    },
    submissionError: selectRoot("formDelete", state).formSubmissionError,
    employeeData: state.employeeData,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (submission, formId) => {
      dispatch(setFormSubmissionLoading(true));
      dispatch(
        saveSubmission(
          "submission", submission, formId, (err, submission) => {
            if (!err) {
              dispatch(doProcessActions(submission, ownProps));
            } else {
              const ErrorDetails = {
                modalOpen: true,
                message: "Submission cannot be done",
              };
              toast.error("Error while Submission.");
              dispatch(setFormSubmissionLoading(false));
              dispatch(setFormSubmissionError(ErrorDetails));
            }
          }
        )
      );
    },
    onCustomEvent: (customEvent) => {
      switch (customEvent.type) {
        case CUSTOM_EVENT_TYPE.CUSTOM_SUBMIT_DONE:
          toast.success("Thank you for your submission. Once your submission has been reviewed by your supervisor, you will receive a notification via email. You can view a copy of your submission in your forms dashboard.");
          dispatch(push(`/form`));
          break;
        // case CUSTOM_EVENT_TYPE.CANCEL_SUBMISSION:
        //   dispatch(push(`/form`));
        //   break;
        default:
          return;
      }
    },
    onConfirm: () => {
      const ErrorDetails = { modalOpen: false, message: "" };
      dispatch(setFormSubmissionError(ErrorDetails));
    },
    getEmployeeData: () => dispatch(fetchEmployeeData()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(View);
