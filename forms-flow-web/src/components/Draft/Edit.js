/*eslint-disable no-unused-vars*/
import React, { useEffect, useRef, useState } from "react";
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
} from "../../actions/formActions";
import { postCustomSubmission } from "../../apiManager/services/FormServices";
import {
  getProcessReq,
  getDraftReqFormat,
} from "../../apiManager/services/bpmServices";
import {
  deleteDraftbyId,
  draftUpdate,
} from "../../apiManager/services/draftService";
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
import SavingLoading from "../Loading/SavingLoading";
import Confirm from "../../containers/Confirm";
import { setDraftDelete } from "../../actions/draftActions";

import { setDraftDetail } from "../../actions/draftActions";
import { redirectToFormSuccessPage } from "../../constants/successTypes";
import { convertFormLinksToOpenInNewTabs, 
  hasUserAccessToForm, getDefaultValues, setValueForComponents } from "../../helper/formUtils";
import { printToPDF } from "../../services/PdfService";
import MessageModal from "../../containers/MessageModal";

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
  const draftDelete = useSelector((state) => state.draft?.draftDelete);
  const [areFormLinksWereConverted, setAreFormLinksWereConverted] = React.useState(false);
  const formRef = useRef(null);
  
  const isPublic = !props.isAuthenticated;
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const draftSubmission = useSelector((state) => state.draft.submission);
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
  const { formId, draftId } = useParams();
  const [poll, setPoll] = useState(DRAFT_ENABLED);
  const exitType = useRef("UNMOUNT");

  const [hasFormAccess, setHasFormAccess] = useState(true);
  const [addEditForm, setAddEditForm] = useState({isAllow: true});
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState();
  const [isCustomFormSubmissionLoading, setIsCustomFormSubmissionLoading] = React.useState(false);
  
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
    employeeData,
    authToken
  } = props;
  const dispatch = useDispatch();

  const saveDraft = (payload, exitType = exitType) => {
    if (exitType === "SUBMIT") return;
    let dataChanged = !isEqual(payload.data, lastUpdatedDraft.data);
    if (draftSubmission?.id) {
      if (String(draftSubmission?.id) !== String(draftId)) return;
      if (dataChanged) {
        setDraftSaved(false);
        if (!showNotification) setShowNotification(true);
        dispatch(
          draftUpdate(payload, draftSubmission?.id, (err) => {
            if (exitType === "UNMOUNT" && !err) {
              toast.success(t("Submission saved to draft."));
              dispatch(setDraftDetail(null));
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
  }, [poll, exitType.current, draftSubmission?.id]);

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

  if (isActive || isPublicStatusLoading) {
    return (
      <div data-testid="loading-view-component">
        <Loading />
      </div>
    );
  }

  const deleteDraft = () => {
    dispatch(
      setDraftDelete({
        modalOpen: true,
        draftId: draftSubmission.id,
        draftName: draftSubmission.DraftName,
      })
    );
  };

  const onYes = () => {
    deleteDraftbyId(draftDelete.draftId)
      .then(() => {
        toast.success(t("Draft Deleted Successfully"));
        dispatch(push(`${redirectUrl}draft`));
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        dispatch(
          setDraftDelete({
            modalOpen: false,
            draftId: null,
            draftName: "",
          })
        );
      });
  };

  const onNo = () => {
    dispatch(
      setDraftDelete({
        modalOpen: false,
        draftId: null,
        draftName: "",
      })
    );
  };

  /** Is form enable to fetch default data from ODS?
   * EmployeeData and Submission are required, Check before processing.
   * "enableDraftDefault" is hidden param/field in the form,
   * to enable, please add it in the form and set value "true".
   */
  if (employeeData && submission && submission.submission &&
    submission.submission?.data?.enableDraftDefault) {
    if (submission.submission.data?.enableDraftDefault === "true") {
      // Let's fetch default value for disabled fiedls only
      const vals = getDefaultValues(employeeData.data, form, 'draft');
      if (vals) {
        submission.submission.data = {
          ...submission.submission.data,
          ...vals.data
        };
      }
    }
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
    <div className="container overflow-y-auto">
      {/*{
        <>
          <span className="pr-2  mr-2 d-flex justify-content-end align-items-center">
            {poll && showNotification && (
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
      } */}
      <div className="d-flex align-items-center justify-content-between">
        <div className="main-header">
          <MessageModal
            modalOpen={!hasFormAccess}
            title="Form Access Error"
            message={"You do not have access to this form!"}
            onConfirm={() => {
              window.location.replace(`${window.location.origin}/draft`);
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
          {popupData && (
            <MessageModal
              modalOpen={showPopup}
              title={popupData.title}
              message={popupData.body}
              onConfirm={() => setShowPopup(false)}
            />
          )}
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
        <button
          className="btn btn-danger mr-2"
          style={{ width: "8.5em" }}
          onClick={() => deleteDraft()}
        >
          {t("Discard Draft")}
        </button>
      </div>
      <Errors errors={errors} />
      <LoadingOverlay
        active={isFormSubmissionLoading || isCustomFormSubmissionLoading}
        spinner
        // text={<Translation>{(t) => t("Loading...")}</Translation>}
        text={isFormSubmissionLoading || isCustomFormSubmissionLoading ? "Submitting..." : "Loading..."}
        className="col-12"
      >
        <div className="ml-4 mr-4" id="formview">
          <Confirm
            modalOpen={draftDelete.modalOpen}
            message={`${t("Are you sure you wish to delete the draft")} "${
              draftDelete.draftName
            }" 
            ${t("with ID")} "${draftDelete.draftId}"`}
            onNo={() => onNo()}
            onYes={() => {
              exitType.current = "SUBMIT";
              onYes();
            }}
          />
          {
            <Form
              form={form}
              submission={submission.submission}
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

const executeAuthSideEffects = (dispatch, redirectUrl) => {
  dispatch(push(`${redirectUrl}draft`));
};

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
          // toast.success(
          //   <Translation>{(t) => t("Submission Saved")}</Translation>
          // );
          redirectToFormSuccessPage(dispatch, push, form?.path, submission);
        } else {
          toast.error(
            <Translation>{(t) => t("Submission Failed.")}</Translation>
          );
        }
        if (isAuth) executeAuthSideEffects(dispatch, redirectUrl);
        else dispatch(setFormSubmitted(true));
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
    authToken: state.user.bearerToken,
    employeeData: selectRoot("employeeData", state),
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(View);
