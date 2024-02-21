/*eslint-disable no-unused-vars*/
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { push } from "connected-react-router";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  selectRoot,
  resetSubmissions,
  saveSubmission,
  Form,
  selectError,
  Errors,
  getForm,
  Formio,
} from "react-formio";
import { useTranslation, Translation } from "react-i18next";
import isEqual from "lodash/isEqual";

import Loading from "../../../containers/Loading";
import {
  getProcessReq,
  getDraftReqFormat,
} from "../../../apiManager/services/bpmServices";
import { formio_resourceBundles } from "../../../resourceBundles/formio_resourceBundles";
import {
  setFormFailureErrorData,
  setFormRequestData,
  setFormSubmissionError,
  setFormSubmissionLoading,
  setFormSuccessData,
  setMaintainBPMFormPagination,
} from "../../../actions/formActions";
import SubmissionError from "../../../containers/SubmissionError";
import { publicApplicationStatus } from "../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";
import { CUSTOM_EVENT_TYPE } from "../../ServiceFlow/constants/customEventTypes";
import { toast } from "react-toastify";
import { setFormSubmitted } from "../../../actions/formActions";
import { fetchFormByAlias } from "../../../apiManager/services/bpmFormServices";
import { checkIsObjectId } from "../../../apiManager/services/formatterService";
import {
  FilterDrafts,
  draftCreate,
  draftUpdate,
  publicDraftCreate,
  publicDraftUpdate,
} from "../../../apiManager/services/draftService";
import { setPublicStatusLoading } from "../../../actions/applicationActions";
import { postCustomSubmission } from "../../../apiManager/services/FormServices";
import {
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
  MULTITENANCY_ENABLED,
  DRAFT_ENABLED,
  DRAFT_POLLING_RATE,
  STAFF_DESIGNER,
} from "../../../constants/constants";
import useInterval from "../../../customHooks/useInterval";
import selectApplicationCreateAPI from "./apiSelectHelper";
import { getApplicationCount, getFormProcesses } from "../../../apiManager/services/processServices";
import { setFormStatusLoading } from "../../../actions/processActions";
// eslint-disable-next-line no-unused-vars
import SavingLoading from "../../Loading/SavingLoading";

import { setDraftSubmission } from "../../../actions/draftActions";
import { fetchEmployeeData } from "../../../apiManager/services/employeeDataService";
import { printToPDF } from "../../../services/PdfService";
import { convertFormLinksToOpenInNewTabs, 
  hasUserAccessToForm, getDefaultValues, setValueForComponents } from "../../../helper/formUtils";
import { redirectToFormSuccessPage } from "../../../constants/successTypes";
import MessageModal from "../../../containers/MessageModal";

const View = React.memo((props) => {
  const [formStatus, setFormStatus] = React.useState("");
  const { t } = useTranslation();
  const lang = useSelector((state) => state.user.lang);
  const formStatusLoading = useSelector(
    (state) => state.process?.formStatusLoading
  );
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
  const draftSubmissionId = useSelector(
    (state) => state.draft.draftSubmission?.id
  );
  // Holds the latest data saved by the server
  const lastUpdatedDraft = useSelector((state) => state.draft.lastUpdated);
  const isPublic = !props.isAuthenticated;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  /**
   * `draftData` is used for keeping the uptodate form entry,
   * this will get updated on every change the form is having.
   */
  const [draftData, setDraftData] = useState({});
  const draftRef = useRef();
  const [isDraftCreated, setIsDraftCreated] = useState(false);

  const { formId } = useParams();
  const [validFormId, setValidFormId] = useState(undefined);

  const [showPublicForm, setShowPublicForm] = useState("checking");
  const [poll, setPoll] = useState(DRAFT_ENABLED);
  const exitType = useRef("UNMOUNT");
  // eslint-disable-next-line no-unused-vars
  const [draftSaved, setDraftSaved] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [notified, setNotified] = useState(false);
  const [defaultVals, setDefaultVals] = useState({});
  
  const [hasFormAccess, setHasFormAccess] = useState(false);
  const [addEditForm, setAddEditForm] = useState({isAllow: true});
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState();

  const [isCustomFormSubmissionLoading, setIsCustomFormSubmissionLoading] = React.useState(false);

  const {
    isAuthenticated,
    // submission,
    hideComponents,
    onSubmit,
    onCustomEvent,
    errors,
    options,
    form: { form, isActive, url, error },
    getEmployeeData,
    employeeData,
    user,
    authToken,
  } = props;
  const formRef = useRef(null);

  const [isValidResource, setIsValidResource] = useState(false);

  const dispatch = useDispatch();
  /*
  Selecting which endpoint to use based on authentication status,
  public endpoint or authenticated endpoint.
  */
  const draftCreateMethod = isAuthenticated ? draftCreate : publicDraftCreate;
  const draftUpdateMethod = isAuthenticated ? draftUpdate : publicDraftUpdate;

  const getPublicForm = useCallback(
    (form_id, isObjectId, formObj) => {
      dispatch(setPublicStatusLoading(true));
      dispatch(
        publicApplicationStatus(form_id, (err) => {
          dispatch(setPublicStatusLoading(false));
          if (!err) {
            if (isPublic) {
              if (isObjectId) {
                dispatch(getForm("form", form_id));
                dispatch(setFormStatusLoading(false));
              } else {
                dispatch(
                  setFormRequestData(
                    "form",
                    form_id,
                    `${Formio.getProjectUrl()}/form/${form_id}`
                  )
                );
                dispatch(setFormSuccessData("form", formObj));
                dispatch(setFormStatusLoading(false));
              }
            }
          }
        })
      );
    },
    [dispatch, isPublic]
  );
  const getFormData = useCallback(() => {
    const isObjectId = checkIsObjectId(formId);
    if (isObjectId) {
      getPublicForm(formId, isObjectId);
      setValidFormId(formId);
    } else {
      dispatch(
        fetchFormByAlias(formId, async (err, formObj) => {
          if (!err) {
            const form_id = formObj._id;
            getPublicForm(form_id, isObjectId, formObj);
            setValidFormId(form_id);
          } else {
            dispatch(setFormFailureErrorData("form", err));
          }
        })
      );
    }
  }, [formId, dispatch, getPublicForm]);
  /**
   * Compares the current form data and last saved data
   * Draft is updated only if the form is updated from the last saved form data.
   */
  const saveDraft = (payload, exitType = exitType) => {
    if (exitType === "SUBMIT") return;
    let dataChanged = !isEqual(payload.data, lastUpdatedDraft.data);
    // check if draftsave is disebled in form or not
    if (payload.data?.isSaveDraftEnabled !== undefined &&
      payload.data?.isSaveDraftEnabled === false) {
    return;
  }
    if (draftSubmissionId && isDraftCreated) {
      if (dataChanged) {
        setDraftSaved(false);
        dispatch(
          draftUpdateMethod(payload, draftSubmissionId, (err) => {
            if (exitType === "UNMOUNT" && !err && isAuthenticated) {
              toast.success(t("Submission saved to draft."));
              /* issue/722
              before this requirement, it creates new draft on form load.
              Now is is not saving it as draft "if few fields in form" are
              blank.
              In this change, it keeps state.draft with previous form data.
              hence it required to clear on the form close. 
              */
              dispatch(setDraftSubmission({}));
            }
            if (!err) {
              setDraftSaved(true);
            } else {
              setDraftSaved(false);
            }
          })
        );
      }
    } else if (draftSubmissionId === undefined && !isDraftCreated) {
      if (
        validFormId &&
        DRAFT_ENABLED &&
        ((isAuthenticated && formStatus === "active") ||
          (!isAuthenticated && publicFormStatus?.status == "active"))
      ) {
        // let payload = getDraftReqFormat(validFormId, draftData?.data);
        dispatch(draftCreateMethod(payload, setIsDraftCreated));
      }
    }
  };

  useEffect(() => {
    if (form._id && !error) setIsValidResource(true);
    return () => setIsValidResource(false);
  }, [error, form._id]);

  useEffect(() => {
    setTimeout(() => {
      setNotified(true);
    }, 5000);
  }, []);

  useEffect(() => {
    if (isDraftCreated) {
      setDraftSaved(true);
    }
  }, [isDraftCreated]);

  /*  commented below code, for more detail please visit below link
      https://github.com/bcgov/digital-journeys/issues/722  */
  /**
   * Will create a draft application when the form is selected for entry.
   */
  // useEffect(() => {
  //   if (
  //     validFormId &&
  //     DRAFT_ENABLED &&
  //     isValidResource &&
  //     ((isAuthenticated && formStatus === "active") ||
  //       (!isAuthenticated && publicFormStatus?.status == "active"))
  //   ) {
  //     let payload = getDraftReqFormat(validFormId, draftData?.data);
  //     dispatch(draftCreateMethod(payload, setIsDraftCreated));
  //   }
  // }, [validFormId, formStatus, publicFormStatus, isValidResource]);

  /**
   * We will repeatedly update the current state to draft table
   * on purticular interval
   */
  useInterval(
    () => {
      let payload = getDraftReqFormat(validFormId, { ...draftData?.data });
      saveDraft(payload);
    },
    poll ? DRAFT_POLLING_RATE : null
  );

  /**
   * Save the current state when the component unmounts.
   * Save the data before submission to handle submission failure.
   */
  useEffect(() => {
    return () => {
      let payload = getDraftReqFormat(validFormId, draftRef.current?.data);
      if (poll) saveDraft(payload, exitType.current);
    };
  }, [validFormId, draftSubmissionId, isDraftCreated, poll, exitType.current]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(setFormStatusLoading(true));
      dispatch(
        getFormProcesses(formId, (err, data) => {
          if (!err) {
            dispatch(getApplicationCount(data.id));
            setFormStatus(data.status);
            dispatch(setFormStatusLoading(false));
          }
        })
      );
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isPublic) {
      getFormData();
    } else {
      setValidFormId(formId);
    }
  }, [isPublic, dispatch, getFormData]);

  useEffect(() => {
    if (publicFormStatus) {
      if (
        publicFormStatus.anonymous === true &&
        publicFormStatus.status === "active"
      ) {
        setShowPublicForm(true);
      } else {
        setShowPublicForm(false);
      }
    }
  }, [publicFormStatus]);

  useEffect(() => {
    if (!isAuthenticated) {
      getForm();
    }
    getEmployeeData();
    dispatch(setMaintainBPMFormPagination(true));

  }, [getForm, getEmployeeData, isAuthenticated, dispatch]);

  /** 
   * Move  getDefaultValues function into form Utils helper 
   * reference ticket,
   * https://github.com/bcgov/digital-journeys/issues/835
  */
  useEffect(() => {
    setDefaultVals(getDefaultValues(employeeData.data, form));
  }, [employeeData.data, form]);

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

  useEffect(() => {
    if (user && user.role.some(el => el === STAFF_DESIGNER)) {
      setHasFormAccess(true);
    } else if (user && !user.role.some(el => el === STAFF_DESIGNER)) {
      /* check formRef before calling function of formio */
      if (formRef.current !== null) {
        if (formRef.current?.formio 
          && formRef.current.formio?._form
          && formRef.current.formio._form?.supportedidp !== undefined) {
            if (formRef.current.formio._form?.supportedidp === "") {
              setHasFormAccess(true);
            } else {
              setHasFormAccess(
                hasUserAccessToForm(
                  formRef.current.formio._form?.supportedidp.split(","),
                  user.username
                )
              );
            }
        }
      }
    }
  });

  /**
   * check if draft exists
   */
  const isDraftListLoading = useSelector(
    (state) => state.draft.isDraftListLoading
  );
  const draftCount = useSelector((state) => state.draft.draftCount);
  const formTitle = useSelector((state)=> state?.form?.form?.title);
 
  useEffect(() => {  
    if(formTitle) {
      dispatch(FilterDrafts({ filters: { DraftName: { filterVal: formTitle } }, 
        page: 1, sizePerPage: 1 }));
    }
  }, [dispatch, formTitle]);

  if (isActive || isPublicStatusLoading || formStatusLoading || isDraftListLoading) {
    return (
      <div data-testid="loading-view-component">
        <Loading />
      </div>
    );
  }

  if (isFormSubmitted && !isAuthenticated) {
    return (
      <div className="text-center pt-5">
        <h1>{t("Thank you for your response.")}</h1>
        <p>{t("saved successfully")}</p>
      </div>
    );
  }

  if (isPublic && !showPublicForm) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        {t("Form not available")}
      </div>
    );
  }

  const handleCustomEvent = (evt) => {
    switch (evt.type) {
      case CUSTOM_EVENT_TYPE.SAVE_DRAFT: {
        let payload = getDraftReqFormat(validFormId, {
          ...draftData?.data,
        });
        saveDraft(payload);
        toast.success(
          <Translation>
            {(t) => t("Submission saved to Draft Forms")}
          </Translation>
        );
        break;
      }
      case CUSTOM_EVENT_TYPE.PRINT_PDF:
        printToPDF({ formName: evt.formName, pdfName: evt.pdfName });
        break;
      case CUSTOM_EVENT_TYPE.ERROR_CUSTOM_VALIDATION:
        toast.error(evt.error);
        break;
      case CUSTOM_EVENT_TYPE.POPUP:
        setPopupData({ title: evt.title, body: evt.body });
        setShowPopup(true);
        break;
      case CUSTOM_EVENT_TYPE.FORMACCESS:
        setAddEditForm({ 
          isAllow: evt.isAllow,
          title: evt.title,
          message: evt.message,
          redirectPath: evt.redirectPath,
        });
        break;
      case CUSTOM_EVENT_TYPE.CUSTOM_SUBMISSION_LOADING:
        setIsCustomFormSubmissionLoading(true);
        break;
      case CUSTOM_EVENT_TYPE.CUSTOM_INITIAL_SUBMISSION:
        setPoll(false);
        exitType.current = "SUBMIT";
        onSubmit({data: evt.data}, form._id, isPublic);
        break;
      default:
        return;
    }
  };

  return (
    <div className="container overflow-y-auto form-view-wrapper">
      {/* {DRAFT_ENABLED &&
        isAuthenticated &&
        isValidResource && 
        (formStatus === "active" ||
          (publicFormStatus?.anonymous === true &&
            publicFormStatus?.status === "active")) && (
          <>
            <span className="pr-2  mr-2 d-flex justify-content-end align-items-center">
              {!notified && (
                <span className="text-primary">
                  <i className="fa fa-info-circle mr-2" aria-hidden="true"></i>
                  {t(
                    "Unfinished applications will be saved to Applications/Drafts."
                  )}
                </span>
              )}

              {notified && poll && (
                <SavingLoading
                  text={
                    draftSaved
                      ? t("Saved to Applications/Drafts")
                      : t("Saving...")
                  }
                  saved={draftSaved}
                />
              )}
            </span>
          </>
        )} */}
      {/* If draft exists */}
      {draftCount > 0 ? (
        <div className="alert-bc-warning">
          <p>
            You have a saved draft available for {formTitle?.endsWith('form') ? formTitle : `${formTitle} form`}. <br />
            You can access your saved drafts in &nbsp;
            <Link title="Draft Forms" to="/draft">
              Draft Forms
            </Link>
          </p>
        </div>
      ) : null}
      <div className="d-flex align-items-center justify-content-between">        
        <div className="main-header">
        <MessageModal
            modalOpen={!hasFormAccess}
            title="Form Access Error"
            message={"You do not have access to this form!"}
            onConfirm={() => {
              window.location.replace(`${window.location.origin}/form`);
            }}
          />
          <MessageModal
            modalOpen={!addEditForm.isAllow}
            title={addEditForm.title}
            message={addEditForm.message}
            onConfirm={() => {
              window.location.replace(`${window.location.origin}/${addEditForm.redirectPath}`);
            }}
          />
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
          {isAuthenticated ? (
            <Link title="go back" to={`${redirectUrl}form`} className="back-link">
              <i className="fa fa-chevron-left fa-lg" />
            </Link>
          ) : null}

          {/* {form.title ? (
            <h3 className="ml-3">
              <span className="task-head-details">
                <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp;{" "}
                {t("Forms")}/
              </span>{" "}
              {form.title}
            </h3>
          ) : (
            ""
          )} */}          
          <h3 className="ml-3">
            <span className="task-head-details">
              <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp; Forms /
            </span>{" "}
            {form.title}
          </h3>
        </div>
      </div>
      <Errors errors={errors} />
      <LoadingOverlay
        active={isFormSubmissionLoading || isCustomFormSubmissionLoading || employeeData.loading}
        spinner
        // text={<Translation>{(t) => t("Loading...")}</Translation>}
        text={
          employeeData.loading
            ? "Loading user data..."
            : isFormSubmissionLoading || isCustomFormSubmissionLoading
            ? "Submitting..."
            : "Loading..."
        }
        className="col-12"
      >
        <div className="ml-4 mr-4" id="formview">
          {isPublic || formStatus === "active" ? (
            <Form
              form={form}
              // submission={submission}
              submission={defaultVals}
              url={url}
              options={{
                ...options,
                language: lang,
                i18n: formio_resourceBundles,
              }}
              hideComponents={hideComponents}
              onChange={(data) => {
                setDraftData(data);
                draftRef.current = data;
              }}
              onSubmit={(data) => {
                setPoll(false);
                exitType.current = "SUBMIT";
                onSubmit(data, form._id, isPublic);
              }}
              // onCustomEvent={(evt) => onCustomEvent(evt, redirectUrl)}
              onCustomEvent={(evt) => {
                onCustomEvent(evt, redirectUrl);
                handleCustomEvent(evt);
              }}
              ref={formRef}
            />
          ) : formStatus === "inactive" || !formStatus ? (
            <span>
              <div
                className="container"
                style={{
                  maxWidth: "900px",
                  margin: "auto",
                  height: "50vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h3>{t("Form not published")}</h3>
                <p>{t("You can't submit this form until it is published")}</p>
              </div>
            </span>
          ) : null}
        </div>
      </LoadingOverlay>
    </div>
  );
});

// eslint-disable-next-line no-unused-vars
const doProcessActions = (submission, ownProps) => {
  return (dispatch, getState) => {
    const state = getState();
    let form = state.form.form;
    let isAuth = state.user.isAuthenticated;
    const tenantKey = state.tenants?.tenantId;
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : `/`;
    const origin = `${window.location.origin}${redirectUrl}`;
    dispatch(resetSubmissions("submission"));
    const data = getProcessReq(form, submission._id, origin);
    let draft_id = state.draft.draftSubmission?.id;
    let isDraftCreated = draft_id ? true : false;
    const applicationCreateAPI = selectApplicationCreateAPI(
      isAuth,
      isDraftCreated,
      DRAFT_ENABLED
    );

    dispatch(
      // eslint-disable-next-line no-unused-vars
      applicationCreateAPI(data, draft_id ? draft_id : null, (err, res) => {
        dispatch(setFormSubmissionLoading(false));
        if (!err) {
          /* toast.success(
            <Translation>{(t) => t("Submission Saved")}</Translation>
          ); */
          dispatch(setFormSubmitted(true));
          if (isAuth) {
            dispatch(setMaintainBPMFormPagination(true));
            // dispatch(push(`${redirectUrl}form`));
            dispatch(setDraftSubmission({})); // check "saveDraft" for more detail
            redirectToFormSuccessPage(dispatch, push, form?.path, submission);
          }
        } else {
          toast.error(
            <Translation>{(t) => t("Submission Failed.")}</Translation>
          );
        }
      })
    );
  };
};

const mapStateToProps = (state) => {
  // Get form data from state and preprocess it before passed to be rendered
  const { form } = selectRoot("form", state);
  if (form._id) {
    convertFormLinksToOpenInNewTabs(form);
  }
  
  return {
    user: state.user.userDetail,
    tenant: state?.tenants?.tenantId,
    form: selectRoot("form", state),
    isAuthenticated: state.user.isAuthenticated,
    errors: [selectError("form", state), selectError("submission", state)],
    options: {
      noAlerts: false,
      i18n: {
        en: {
          error: <Translation>{(t) => t("Message")}</Translation>,
        },
      },
    },
    submissionError: selectRoot("formDelete", state).formSubmissionError,
    authToken: state.user.bearerToken,
    employeeData: state.employeeData,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (submission, formId, isPublic) => {
      dispatch(setFormSubmissionLoading(true));
      // this is callback function for submission
      const callBack = (err, submission) => {
        if (!err) {
          dispatch(doProcessActions(submission, ownProps));
        } else {
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
          dispatch(setFormSubmissionLoading(false));
          dispatch(setFormSubmissionError(ErrorDetails));
        }
      };
      if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
        postCustomSubmission(submission, formId, isPublic, callBack);
      } else {
        dispatch(saveSubmission("submission", submission, formId, callBack));
      }
    },
    onCustomEvent: (customEvent, redirectUrl) => {
      switch (customEvent.type) {
        case CUSTOM_EVENT_TYPE.CUSTOM_SUBMIT_DONE:
          // toast.success("Submission Saved.");
          toast.success(
            "Thank you for your submission. Once your submission has been reviewed by your supervisor, you will receive a notification via email. You can view a copy of your submission in your forms dashboard."
          );
          dispatch(push(`${redirectUrl}form`));
          break;
        /* case CUSTOM_EVENT_TYPE.CANCEL_SUBMISSION:
          dispatch(push(`${redirectUrl}form`));
          break; */
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
