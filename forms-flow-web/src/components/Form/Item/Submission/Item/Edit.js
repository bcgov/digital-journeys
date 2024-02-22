import React, { useEffect , useState, useRef} from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  selectRoot,
  resetSubmissions,
  saveSubmission,
  Form,
  selectError,
  Errors,
} from "react-formio";
import { push } from "connected-react-router";
import { formio_resourceBundles } from "../../../../../resourceBundles/formio_resourceBundles";
import Loading from "../../../../../containers/Loading";

import {
  setFormSubmissionError,
  setFormSubmissionLoading,
} from "../../../../../actions/formActions";
import SubmissionError from "../../../../../containers/SubmissionError";
import { getUserRolePermission } from "../../../../../helper/user";
import {
  CLIENT,
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
  MULTITENANCY_ENABLED,
} from "../../../../../constants/constants";
import {
  // CLIENT_EDIT_STATUS,
  UPDATE_EVENT_STATUS,
  getProcessDataReq,
} from "../../../../../constants/applicationConstants";
import { useParams, Link } from "react-router-dom";
import { updateApplicationEvent } from "../../../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";
import { toast } from "react-toastify";
import { Translation, useTranslation } from "react-i18next";
import { updateCustomSubmission } from "../../../../../apiManager/services/FormServices";

import {
  convertFormLinksToOpenInNewTabs,
  scrollToErrorOnValidation,
  setValueForComponents,
} from "../../../../../helper/formUtils";

import { setBPMTaskDetailLoader } from "../../../../../actions/bpmTaskActions";
import {
  getFormIdSubmissionIdFromURL,
  getFormUrlWithFormIdSubmissionId,
} from "../../../../../apiManager/services/formatterService";
import {
  onBPMTaskFormSubmit,
  fetchBPMTasks,
} from "../../../../../apiManager/services/bpmTaskServices";
import { getTaskSubmitFormReq } from "../../../../../apiManager/services/bpmServices";
import { redirectToSuccessPage } from "../../../../../constants/successTypes";
import { CUSTOM_EVENT_TYPE } from "../../../../ServiceFlow/constants/customEventTypes";
import { printToPDF } from "../../../../../services/PdfService";
import { hasFormEditAccessByStatus } from "../../../../../helper/access";
import MessageModal from "../../../../../containers/MessageModal";

const Edit = React.memo((props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.user.lang);
  const { formId, submissionId } = useParams();
  const {
    hideComponents,
    onSubmit,
    options,
    errors,
    onFormSubmit,
    onCustomEvent,
    form: { form, isActive: isFormActive },
    submission: { submission, isActive: isSubActive, url },
    task,
    user,
    showPrintButton,
    authToken,
    editSubmissionPage,
  } = props;

  const [updatedSubmissionData, setUpdatedSubmissionData] = useState({});
  
  const formRef = useRef(null);
  const [isCustomFormSubmissionLoading, setIsCustomFormSubmissionLoading] = useState(false);

  const [showPopup, setShowPopup] = React.useState(false);
  const [popupData, setPopupData] = React.useState();

  const applicationStatus = useSelector(
    (state) => state.applications.applicationDetail?.applicationStatus || ""
  );
  const userRoles = useSelector((state) => {
    return selectRoot("user", state).roles;
  });
  const applicationDetail = useSelector(
    (state) => state.applications.applicationDetail
  );
  const isFormSubmissionLoading = useSelector(
    (state) => state.formDelete.isFormSubmissionLoading
  );
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const customSubmission = useSelector(
    (state) => state.formDelete.customSubmission
  );
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  useEffect(() => {
    if (applicationStatus && !onFormSubmit) {
      if (
        getUserRolePermission(userRoles, CLIENT) &&
        // !CLIENT_EDIT_STATUS.includes(applicationStatus)
        !hasFormEditAccessByStatus(applicationDetail?.applicationName, applicationStatus)
        ) {
        dispatch(push(`/form/${formId}/submission/${submissionId}`));
      }
    }
  }, [
    applicationStatus,
    userRoles,
    dispatch,
    submissionId,
    formId,
    onFormSubmit,
  ]);
  let updatedSubmission;
  if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
    updatedSubmission = customSubmission;
  } else {
    updatedSubmission = submission;
  }

  let scrollToErrorInterval = null;
  useEffect(() => {
    scrollToErrorInterval = setInterval(() => {
      scrollToErrorOnValidation(formRef.current?.formio, scrollToErrorInterval);
    }, 1000);
    return () => {
      clearInterval(scrollToErrorInterval);
    };
  });

  /* Pass values to the form components
   A component with the same key should be present in the form otherwise it will be ignored */
  let valueForComponentsInterval = null;
  useEffect(() => {
    valueForComponentsInterval = setInterval(() => {
      if (formRef.current !== null && formRef.current?.formio) {
        const keyValuePairs = [{key: "token", value: authToken}];
        setValueForComponents(formRef.current.formio, valueForComponentsInterval, keyValuePairs);
      }
    }, 1000);
    return () => {
      clearInterval(valueForComponentsInterval);
    };
    // Add the states to the dependency array to re-run the effect when they change 
  }, [authToken]);

  // If this is an application edit, get the application's task
  useEffect(() => {
    if (
      applicationStatus &&
      !onFormSubmit &&
      applicationDetail?.processInstanceId
    ) {
      dispatch(
        fetchBPMTasks({
          processInstanceId: applicationDetail.processInstanceId,
        })
      );
    }
  }, [dispatch, applicationDetail, onFormSubmit]);

  const applicationTask =
    useSelector((state) => state?.bpmTasks?.bpmTasks) &&
    useSelector((state) => state.bpmTasks.bpmTasks)[0];

  /* Pass along the current task and the page where this 
  * component is opened in (e.g., edit submission page, review submission page), 
  * so it can be used for validation purposes. 
  * */
  updatedSubmission.editSubmissionPage = editSubmissionPage;
  updatedSubmission.task = {
            assignedToMe:
              task?.assignee && user?.preferred_username === task?.assignee,
            ...(task || {}),
          };

  if (isFormActive || (isSubActive && !isFormSubmissionLoading)) {
    return <Loading />;
  }

  const onApplicationFormSubmit = (actionType = "", successPage) => {
    dispatch(setBPMTaskDetailLoader(true));
    const { formId, submissionId } = getFormIdSubmissionIdFromURL(url);
    const formUrl = getFormUrlWithFormIdSubmissionId(formId, submissionId);
    const origin = `${window.location.origin}${redirectUrl}`;
    const webFormUrl = `${origin}form/${formId}/submission/${submissionId}`;
    dispatch(
      onBPMTaskFormSubmit(
        applicationTask.id,
        getTaskSubmitFormReq(
          formUrl,
          applicationDetail.id,
          actionType,
          webFormUrl
        ),
        (err) => {
          if (!err) {
            redirectToSuccessPage(dispatch, push, successPage);
          } else {
            dispatch(setBPMTaskDetailLoader(false));
          }
        }
      )
    );
  };

  const onApplicationFormSubmitCustomEvent = (customEvent) => {
    switch (customEvent.type) {
      case CUSTOM_EVENT_TYPE.ACTION_COMPLETE:
        onApplicationFormSubmit(
          customEvent.actionType,
          customEvent.successPage
        );
        break;
      case CUSTOM_EVENT_TYPE.SAVE_DRAFT:
        toast.success(
          <Translation>
            {(t) => t("Submission saved to Submitted Forms")}
          </Translation>
        );
        break;
      case CUSTOM_EVENT_TYPE.PRINT_PDF:
        printToPDF({
          formName: customEvent.formName,
          pdfName: customEvent.pdfName,
        });
        break;
      case CUSTOM_EVENT_TYPE.POPUP:
        setPopupData({ title: customEvent.title, body: customEvent.body });
        setShowPopup(true);
        break;
      case CUSTOM_EVENT_TYPE.ERROR_CUSTOM_VALIDATION:
        toast.error(customEvent.error);
        break;
      case CUSTOM_EVENT_TYPE.CUSTOM_SUBMISSION_LOADING:
        setIsCustomFormSubmissionLoading(true);
        break;
      default:
        return;
    }
  };

  return (
    <div className="container">
      <div className="main-header">
        {popupData && 
          <MessageModal
            modalOpen={showPopup}
            title={popupData.title}
            message={popupData.body}
            onConfirm={() => setShowPopup(false)}
          />}
        <SubmissionError
          modalOpen={props.submissionError.modalOpen}
          message={props.submissionError.message}
          onConfirm={props.onConfirm}
        ></SubmissionError>
        {showPrintButton ? (
          <>
            <Link title={t("go back")} to={`${redirectUrl}application`} className="back-link">
              <i className="fa fa-chevron-left fa-lg" />
            </Link>&nbsp;
            <i className="fa fa-edit" 
            aria-hidden="true"
            style={{fontSize: "30px", margin: "5px 5px 5px 18px"}}
            ></i>&nbsp;
          </>
        ) : null }
        <h3 className="task-head">{form.title}</h3>
      </div>
      <Errors errors={errors} />
      <LoadingOverlay
        // active={isFormSubmissionLoading}
        active={isFormSubmissionLoading || isCustomFormSubmissionLoading}
        spinner
        // text={t("Loading...")}
        text={isFormSubmissionLoading || isCustomFormSubmissionLoading ? "Submitting..." : "Loading..."}
        className="col-12"
      >
        <div className="ml-4 mr-4" id="formview">
          <Form
            form={form}
            submission={isFormSubmissionLoading ? updatedSubmissionData : updatedSubmission}
            url={url}
            hideComponents={hideComponents}
            onSubmit={(submission) =>{

              setUpdatedSubmissionData(submission);
              onSubmit(
                submission,
                applicationDetail,
                onFormSubmit,
                form._id,
                redirectUrl
              );
            }
              
            }
            options={{
              ...options,
              i18n: formio_resourceBundles,
              language: lang,
            }}
            // onCustomEvent={onCustomEvent}
            onCustomEvent={applicationTask ? onApplicationFormSubmitCustomEvent : onCustomEvent}
            ref={formRef}
          />
        </div>
      </LoadingOverlay>
    </div>
  );
});

Edit.defaultProps = {
  onCustomEvent: () => {},
  showPrintButton: true,
};

const mapStateToProps = (state) => {
  // Get form data from state and preprocess it before passed to be rendered
  const { form } = selectRoot("form", state);
  if (form._id) {
    convertFormLinksToOpenInNewTabs(form);
  }

  return {
    user: state.user.userDetail,
    form: selectRoot("form", state),
    submission: selectRoot("submission", state),
    isAuthenticated: state.user.isAuthenticated,
    errors: [selectError("form", state), selectError("submission", state)],
    options: {
      noAlerts: false,
      i18n: {
        en: {
          error: (
            <Translation>
              {(t) => t("Please fix the errors before submitting again.")}
            </Translation>
          ),
        },
      },
    },
    submissionError: selectRoot("formDelete", state).formSubmissionError,
    authToken: state.user.bearerToken,
    task: state?.bpmTasks?.taskDetail,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (
      submission,
      applicationDetail,
      onFormSubmit,
      formId,
      redirectUrl
    ) => {
      dispatch(setFormSubmissionLoading(true));
      const callBack = (err, submission) => {
        if (!err) {
          if (
            UPDATE_EVENT_STATUS.includes(applicationDetail.applicationStatus)
          ) {
            const data = getProcessDataReq(applicationDetail);
            dispatch(
              updateApplicationEvent(data, () => {
                dispatch(resetSubmissions("submission"));
                dispatch(setFormSubmissionLoading(false));
                if (onFormSubmit) {
                  onFormSubmit();
                } else {
                  /* toast.success(
                    <Translation>{(t) => t("Submission Saved")}</Translation>
                  ); */
                  toast.success(
                    "Thank you for your submission. Once your submission has been reviewed by your supervisor, you will receive a notification via email. You can view a copy of your submission in your forms dashboard."
                  );
                  dispatch(
                    push(
                      // eslint-disable-next-line max-len
                      `${redirectUrl}form/${ownProps.match.params.formId}/submission/${submission._id}`
                    )
                  );
                }
              })
            );
          } else {
            dispatch(resetSubmissions("submission"));
            dispatch(setFormSubmissionLoading(false));
            if (onFormSubmit) {
              onFormSubmit();
            } else {
              /* toast.success(
                <Translation>{(t) => t("Submission Saved")}</Translation>
              ); */
              toast.success(
                "Thank you for your submission. Once your submission has been reviewed by your supervisor, you will receive a notification via email. You can view a copy of your submission in your forms dashboard."
              );
              dispatch(
                push(
                  // eslint-disable-next-line max-len
                  `${redirectUrl}form/${ownProps.match.params.formId}/submission/${submission._id}/edit`
                )
              );
            }
          }
        } else {
          dispatch(setFormSubmissionLoading(false));
          const ErrorDetails = {
            modalOpen: true,
            message: (
              <Translation>
                {(t) => t("Submission cannot be done.")}
              </Translation>
            ),
          };
          toast.error(
            <Translation>{(t) => t("Error while Submission.")}</Translation>
          );
          dispatch(setFormSubmissionError(ErrorDetails));
        }
      };
      if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
        updateCustomSubmission(
          submission,
          onFormSubmit ? formId : ownProps.match.params.formId,
          callBack
        );
      }else{
        dispatch(
          saveSubmission(
            "submission",
            submission,
            onFormSubmit ? formId : ownProps.match.params.formId,
            callBack
          )
        );
      }
     
    },
    onConfirm: () => {
      const ErrorDetails = { modalOpen: false, message: "" };
      dispatch(setFormSubmissionError(ErrorDetails));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Edit);
