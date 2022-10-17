import React, { useEffect, useRef } from "react";
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
  CLIENT_EDIT_STATUS,
  UPDATE_EVENT_STATUS,
  getProcessDataReq,
} from "../../../../../constants/applicationConstants";
import { useParams } from "react-router-dom";
import { updateApplicationEvent } from "../../../../../apiManager/services/applicationServices";
import LoadingOverlay from "react-loading-overlay";
import { toast } from "react-toastify";
import { Translation, useTranslation } from "react-i18next";
import { updateCustomSubmission } from "../../../../../apiManager/services/FormServices";

import _ from "lodash";
import {
  convertFormLinksToOpenInNewTabs,
  scrollToErrorOnValidation,
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
  } = props;

  const formRef = useRef(null);

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
        !CLIENT_EDIT_STATUS.includes(applicationStatus)
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

  let convertFormLinksInterval = null;
  useEffect(() => {
    convertFormLinksInterval = setInterval(() => {
      convertFormLinksToOpenInNewTabs(
        formRef.current?.formio,
        convertFormLinksInterval
      );
    }, 1000);
    return () => {
      clearInterval(convertFormLinksInterval);
    };
  });

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

  // Pass along the current task with the given submission
  // so it can be used for validation purposes.
  const submissionWithTask = _.merge(
    {},
    {
      data: {
        task: {
          assignedToMe:
            task?.assignee && user?.preferred_username === task?.assignee,
          ...(task || {}),
        },
      },
    },
    updatedSubmission
  );

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
        onApplicationFormSubmit(customEvent.actionType, customEvent.successPage);
        break;
      default:
        return;
    }
  };

  return (
    <div className="container">
      <div className="main-header">
        <SubmissionError
          modalOpen={props.submissionError.modalOpen}
          message={props.submissionError.message}
          onConfirm={props.onConfirm}
        ></SubmissionError>
        <h3 className="task-head">{form.title}</h3>
      </div>
      <Errors errors={errors} />
      <LoadingOverlay
        active={isFormSubmissionLoading}
        spinner
        text={t("Loading...")}
        className="col-12"
      >
        <div className="ml-4 mr-4">
          <Form
            form={form}
            // submission={updatedSubmission}
            submission={submissionWithTask}
            url={url}
            hideComponents={hideComponents}
            onSubmit={(submission) =>
              onSubmit(
                submission,
                applicationDetail,
                onFormSubmit,
                form._id,
                redirectUrl
              )
            }
            options={{
              ...options,
              i18n: formio_resourceBundles,
              language: lang,
            }}
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
};

const mapStateToProps = (state) => {
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
                  // toast.success(
                  //   <Translation>{(t) => t("Submission Saved")}</Translation>
                  // );
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
              // toast.success(
              //   <Translation>{(t) => t("Submission Saved")}</Translation>
              // );
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
      }
      dispatch(
        saveSubmission(
          "submission",
          submission,
          onFormSubmit ? formId : ownProps.match.params.formId,
          callBack
        )
      );
    },
    onConfirm: () => {
      const ErrorDetails = { modalOpen: false, message: "" };
      dispatch(setFormSubmissionError(ErrorDetails));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Edit);
