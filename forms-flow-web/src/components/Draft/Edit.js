import React, { useEffect, useRef, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  selectRoot,
  resetSubmissions,
  saveSubmission,
  Form,
  selectError,
  getForm,
  Errors,
} from "react-formio";
import { push } from "connected-react-router";
import { Link, useParams } from "react-router-dom";
import { useTranslation, Translation } from "react-i18next";
import LoadingOverlay from "react-loading-overlay";
import { toast } from "react-toastify";
import isEqual from "lodash/isEqual";

import { formio_resourceBundles } from "../../resourceBundles/formio_resourceBundles";
import useInterval from "../../customHooks/useInterval";
import { CUSTOM_EVENT_TYPE } from "../ServiceFlow/constants/customEventTypes";
import selectApplicationCreateAPI from "../Form/Item/apiSelectHelper";
import {
  setFormSubmissionError,
  setFormSubmissionLoading,
  setFormSubmitted,
  setMaintainBPMFormPagination,
} from "../../actions/formActions";
import { postCustomSubmission } from "../../apiManager/services/FormServices";
import {
  getProcessReq,
  getDraftReqFormat,
} from "../../apiManager/services/bpmServices";
import { draftUpdate } from "../../apiManager/services/draftService";
import { fetchEmployeeData } from "../../apiManager/services/employeeDataService";
import {
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
  MULTITENANCY_ENABLED,
  DRAFT_ENABLED,
  DRAFT_POLLING_RATE,
  STAFF_DESIGNER,
} from "../../constants/constants";
import Loading from "../../containers/Loading";
import SubmissionError from "../../containers/SubmissionError";
// eslint-disable-next-line no-unused-vars
import SavingLoading from "../Loading/SavingLoading";
import { redirectToFormSuccessPage } from "../../constants/successTypes";
import { convertFormLinksToOpenInNewTabs, getFormSupportedIdentityProviders, 
  hasUserAccessToForm, getDefaultValues } from "../../helper/formUtils";
import { printToPDF } from "../../services/PdfService";
import MessageModal from "../../containers/MessageModal";
import { FORM_SUPPORTED_IDENTITY_PROVIDERS_FIELD_NAME } from "../../constants/formConstants";

const View = React.memo((props) => {
  const { t } = useTranslation();
  const lang = useSelector((state) => state.user.lang);
  const isFormSubmissionLoading = useSelector(
    (state) => state.formDelete.isFormSubmissionLoading
  );
  const isPublicStatusLoading = useSelector(
    (state) => state.applications.isPublicStatusLoading
  );

  const isFormSubmitted = useSelector(
    (state) => state.formDelete.formSubmitted
  );

  const [areFormLinksWereConverted, setAreFormLinksWereConverted] = React.useState(false);
  const formRef = useRef(null);
  const isPublic = !props.isAuthenticated;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const draftSubmission = useSelector((state) => state.draft.submission);
  // eslint-disable-next-line no-unused-vars
  const [draftSaved, setDraftSaved] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  /**
   * `draftData` is used for keeping the uptodate form entry,
   * this will get updated on every change the form is having.
   */
  const [draftData, setDraftData] = useState(draftSubmission?.data);
  // Holds the latest data saved by the server
  const lastUpdatedDraft = useSelector((state) => state.draft.lastUpdated);
  const draftRef = useRef();
  const { formId } = useParams();
  const [poll, setPoll] = useState(DRAFT_ENABLED);
  const exitType = useRef("UNMOUNT");

  const [hasFormAccess, setHasFormAccess] = useState(true);
  const [defaultVals, setDefaultVals] = useState({});
  const [isfetchedlatestdata, setIsfetchedlatestdata] = useState(false);

  const {
    isAuthenticated,
    submission,
    hideComponents,
    onSubmit,
    onCustomEvent,
    errors,
    options,
    form: { form, isActive, url },
    user,
    getEmployeeData,
    employeeData,
  } = props;
  const dispatch = useDispatch();

  const saveDraft = (payload, exitType = exitType) => {
    let dataChanged = !isEqual(payload.data, lastUpdatedDraft.data);
    if (draftSubmission?.id) {
      if (dataChanged) {
        setDraftSaved(false);
        if (!showNotification) setShowNotification(true);
        dispatch(
          draftUpdate(payload, draftSubmission?.id, (err) => {
            if (exitType === "UNMOUNT" && !err) {
              toast.success(
              t("Submission saved to draft.")
              );
            }
            if (!err) {
              setDraftSaved(true);
            } else {
              setDraftSaved(false);
            }
          })
        );
      }
    }
  };

  /**
   * We will repeatedly update the current state to draft table
   * on purticular interval
   */
  useInterval(
    () => {
      let payload = getDraftReqFormat(formId, { ...draftData });
      saveDraft(payload);
    },
    poll ? DRAFT_POLLING_RATE : null
  );

  useEffect(() => {
    return () => {
      let payload = getDraftReqFormat(formId, draftRef.current);
      if (poll) saveDraft(payload, exitType.current);
    };
  }, [poll, exitType.current]);

  let convertFormLinksInterval = null;
  useEffect(() => {
    if (areFormLinksWereConverted) {
      return; 
    }
    convertFormLinksInterval = setInterval(() => {
      const done = convertFormLinksToOpenInNewTabs(
        formRef.current?.formio,
        convertFormLinksInterval
      );
      setAreFormLinksWereConverted(done);
    }, 1000);
    return () => {
      clearInterval(convertFormLinksInterval);
    };
  });

  if (!user.role.some(el => el === STAFF_DESIGNER)) {
    let formAccessInterval = null;
    useEffect(() => {
      formAccessInterval = setInterval(() => {
        /* check formRef before calling function of formio */
        if (formRef.current !== null) {
          const formSupportedIdentityProviders = getFormSupportedIdentityProviders(
            formRef.current?.formio, 
            FORM_SUPPORTED_IDENTITY_PROVIDERS_FIELD_NAME, formAccessInterval);
          if (Array.isArray(formSupportedIdentityProviders)) {
            setHasFormAccess(hasUserAccessToForm(formSupportedIdentityProviders, user.username));
          }
        }
      }, 1000);
      return () => {
        clearInterval(formAccessInterval);
      };
    });
  }

  useEffect(() => {
    setDefaultVals(submission.submission);
    getForm();
    getEmployeeData();
    dispatch(setMaintainBPMFormPagination(true));
  }, [getEmployeeData, dispatch]);

  useEffect(() => {
    if (!isfetchedlatestdata) {
      const defaultData = getDefaultValues(employeeData.data, form, 'draft');
      if (defaultData !== undefined &&
        Object.keys(defaultData.data).length > 0) {
        submission.submission.data = {
          ...submission.submission.data,
          ...defaultData.data
        };
        setDefaultVals(submission.submission);
        setIsfetchedlatestdata(true);
      }
    }
  }, [employeeData.data, form]);

  if (isActive || isPublicStatusLoading) {
    return (
      <div data-testid="loading-view-component">
        <Loading />
      </div>
    );
  }

  if (isFormSubmitted && !isAuthenticated) { 
    //This code has relevance only for form Submission Edit by Anonymous Users
    return (
      <div className="text-center pt-5">
        <h1>{t("Thank you for your response.")}</h1>
        <p>{t("saved successfully")}</p>
      </div>
    );
  }

  const handleCustomEvent = (evt) => {
    switch (evt.type) {
      case CUSTOM_EVENT_TYPE.SAVE_DRAFT: {
        let payload = getDraftReqFormat(formId, { ...draftData });
        saveDraft(payload);
        toast.success(
          <Translation>{(t) => t("Submission saved to Draft Forms")}</Translation>
        );
        break;
      }
      case CUSTOM_EVENT_TYPE.PRINT_PDF: {
        printToPDF({ formName: evt.formName, pdfName: evt.pdfName });
        break;
      }
      case CUSTOM_EVENT_TYPE.ERROR_CUSTOM_VALIDATION:
        toast.error(evt.error);
        break;
      default:
        return;
    }
  };

  return (
    <div className="container overflow-y-auto">
      {/* {
        <>
          <span className="pr-2  mr-2 d-flex justify-content-end align-items-center">
            {poll && showNotification && (
              <SavingLoading
                text={draftSaved ? t("Saved to draft") : t("Saving...")}
                saved={draftSaved}
              />
            )}
          </span>
        </>
      } */}
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
          <SubmissionError
            modalOpen={props.submissionError.modalOpen}
            message={props.submissionError.message}
            onConfirm={props.onConfirm}
          ></SubmissionError>
          {isAuthenticated ? (
            <Link title={t("go back")} to={`${redirectUrl}draft`} className="back-link">
              <i className="fa fa-chevron-left fa-lg" />
            </Link>
          ) : null}

          {form.title ? (
            <h3 className="ml-3">
              <span className="task-head-details">
                <i className="fa fa-wpforms" aria-hidden="true" /> &nbsp; {t("Drafts")}
                /
              </span>{" "}
              {form.title}
            </h3>
          ) : (
            ""
          )}
        </div>
      </div>
      <Errors errors={errors} />
      <LoadingOverlay
        active={isFormSubmissionLoading}
        spinner
        text={<Translation>{(t) => t("Loading...")}</Translation>}
        className="col-12"
      >
        <div className="ml-4 mr-4" id="formview">
          {
            <Form
              form={form}
              submission={defaultVals}
              url={url}
              options={{
                ...options,
                language: lang,
                i18n: formio_resourceBundles,
              }}
              hideComponents={hideComponents}
              onChange={(formData) => {
                setDraftData(formData.data);
                draftRef.current = formData.data;
              }}
              onSubmit={(data) => {
                setPoll(false);
                exitType.current = "SUBMIT";
                onSubmit(data, form._id, isPublic);
              }}
              onCustomEvent={(evt) => {
                onCustomEvent(evt, redirectUrl);
                handleCustomEvent(evt);
              }}
              ref={formRef}
            />
          }
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
    dispatch(resetSubmissions("submission"));
    const origin = `${window.location.origin}${redirectUrl}`;
    const data = getProcessReq(form, submission._id, origin);
    let draft_id = state.draft.submission?.id;
    let isDraftCreated = draft_id ? true : false;
    const applicationCreateAPI = selectApplicationCreateAPI(
      isAuth,
      isDraftCreated,
      DRAFT_ENABLED
    );
    dispatch(
      applicationCreateAPI(data, draft_id ? draft_id : null, (err) => {
        dispatch(setFormSubmissionLoading(false));
        if (!err) {
          redirectToFormSuccessPage(dispatch, push, form?.path, submission);
        } else {
          toast.error(
            <Translation>{(t) => t("Submission Failed.")}</Translation>
          );
        }
        if (!isAuth) {
          dispatch(setFormSubmitted(true));
        }
        
      })
    );
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.user.userDetail,
    tenant: state?.tenants?.tenantId,
    form: selectRoot("form", state),
    submission: selectRoot("draft", state),
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
          toast.success("Submission Saved.");
          dispatch(push(`${redirectUrl}draft`));
          break;
        case CUSTOM_EVENT_TYPE.CANCEL_SUBMISSION:
          dispatch(push(`${redirectUrl}draft`));
          break;
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
