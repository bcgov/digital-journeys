import React, { useCallback, useEffect, useState } from "react";
import { Row, Tab, Tabs } from "react-bootstrap";
import TaskHeader from "./TaskHeader";
import {
  reloadTaskFormSubmission,
  setBPMTaskDetailLoader,
  setSelectedTaskID,
} from "../../../actions/bpmTaskActions";
import {
  fetchServiceTaskList,
  getBPMGroups,
  getBPMTaskDetail,
  onBPMTaskFormSubmit,
} from "../../../apiManager/services/bpmTaskServices";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../containers/Loading";
import ProcessDiagram from "../../BPMN/ProcessDiagramHook";
import {
  getFormIdSubmissionIdFromURL,
  getFormUrlWithFormIdSubmissionId,
  getProcessDataObjectFromList,
} from "../../../apiManager/services/formatterService";
import History from "../../Application/ApplicationHistory";
import FormEdit from "../../Form/Item/Submission/Item/Edit";
import FormView from "../../Form/Item/Submission/Item/View";
import LoadingOverlay from "react-loading-overlay";
import { getForm, getSubmission, Formio } from "react-formio";
import { CUSTOM_EVENT_TYPE } from "../constants/customEventTypes";
import { getTaskSubmitFormReq } from "../../../apiManager/services/bpmServices";
import { useParams } from "react-router-dom";
import { push } from "connected-react-router";
import {
  resetFormData,
  setFormSubmissionLoading,
} from "../../../actions/formActions";
import { useTranslation } from "react-i18next";
import {
  CUSTOM_SUBMISSION_URL,
  CUSTOM_SUBMISSION_ENABLE,
  MULTITENANCY_ENABLED,
  EDIT_SUBMISSION_PAGE,
} from "../../../constants/constants";
import { getCustomSubmission } from "../../../apiManager/services/FormServices";
import { getFormioRoleIds } from "../../../apiManager/services/userservices";

import _ from "lodash";
import {
  getUserRolePermission,
} from "../../../helper/user";
import {
  STAFF_REVIEWER,
} from "../../../constants/constants";
import { redirectToSuccessPage } from "../../../constants/successTypes";
import { printToPDF } from "../../../services/PdfService";
import MessageModal from "../../../containers/MessageModal";

const ServiceFlowTaskDetails = React.memo(() => {
  const { t } = useTranslation();
  const { taskId } = useParams();
  const bpmTaskId = useSelector((state) => state.bpmTasks.taskId);
  const task = useSelector((state) => state.bpmTasks.taskDetail);
  const processList = useSelector((state) => state.bpmTasks.processList);
  const isTaskLoading = useSelector(
    (state) => state.bpmTasks.isTaskDetailLoading
  );
  const isTaskUpdating = useSelector(
    (state) => state.bpmTasks.isTaskDetailUpdating
  );
  const reqData = useSelector((state) => state.bpmTasks.listReqParams);
  const taskFormSubmissionReload = useSelector(
    (state) => state.bpmTasks.taskFormSubmissionReload
  );
  const dispatch = useDispatch();
  const currentUser = useSelector(
    (state) => state.user?.userDetail?.preferred_username || ""
  );
  const selectedFilter = useSelector((state) => state.bpmTasks.selectedFilter);
  const firstResult = useSelector((state) => state.bpmTasks.firstResult);
  const [processKey, setProcessKey] = useState("");
  const [processTenant, setProcessTenant] = useState(null);
  const [processInstanceId, setProcessInstanceId] = useState("");
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const submission = useSelector((state) => state.submission.submission);
  const isSubmissionLoaded = !(_.isEmpty(submission));
  const userRoles = useSelector((state) => state.user.roles);

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState();

  /** custom event loading */
  const [isCustomFormSubmissionLoading, setIsCustomFormSubmissionLoading] =
    React.useState(false);

  useEffect(() => {
    if (taskId) {
      dispatch(setSelectedTaskID(taskId));
    }
  }, [taskId, dispatch]);

  useEffect(() => {
    if (bpmTaskId) {
      dispatch(setBPMTaskDetailLoader(true));
      dispatch(getBPMTaskDetail(bpmTaskId));
      dispatch(getBPMGroups(bpmTaskId));
    }
    return () => {
      Formio.clearCache();
    };
  }, [bpmTaskId, dispatch]);

  useEffect(() => {
    if (processList.length && task?.processDefinitionId) {
      const pKey = getProcessDataObjectFromList(
        processList,
        task?.processDefinitionId
      );
      setProcessKey(pKey["key"]);
      setProcessTenant(pKey["tenantId"]);
    }
  }, [processList, task?.processDefinitionId]);

  useEffect(() => {
    if (task?.processInstanceId) {
      setProcessInstanceId(task?.processInstanceId);
    }
  }, [task?.processInstanceId]);

  const getFormSubmissionData = useCallback(
    (formUrl) => {
      const { formId, submissionId } = getFormIdSubmissionIdFromURL(formUrl);
      Formio.clearCache();
      dispatch(resetFormData("form"));
      function fetchForm() {        
        dispatch(
          getForm("form", formId, (err) => {
            if (!err) {
              if (CUSTOM_SUBMISSION_URL && CUSTOM_SUBMISSION_ENABLE) {
                dispatch(getCustomSubmission(submissionId, formId));
              } else {
                dispatch(getSubmission("submission", submissionId, formId));
              }
              dispatch(setFormSubmissionLoading(false));
            } else {
              if (err === "Bad Token" || err === "Token Expired") {
                dispatch(resetFormData("form"));
                dispatch(
                  getFormioRoleIds((err) => {
                    if (!err) {
                      fetchForm();
                    } else {
                      dispatch(setFormSubmissionLoading(false));
                    }
                  })
                );
              } else {
                dispatch(setFormSubmissionLoading(false));
              }
            }
          })
        );
      }
      fetchForm();
    },
    [dispatch]
  );

  useEffect(() => {
    const originalConsoleWarn = console.warn;
    
    if (task?.formUrl) {
      /* #1501 getForm generated lots of unnecessary console warning, 
           use the following to disable console.warn
        */      
      console.warn = () => {};

      dispatch(setFormSubmissionLoading(true));
      getFormSubmissionData(task?.formUrl);
    }

    return () => {
      console.warn = originalConsoleWarn;
    };
  }, [task?.formUrl, dispatch, getFormSubmissionData]);

  useEffect(() => {
    if (task?.formUrl && taskFormSubmissionReload) {
      // dispatch(setFormSubmissionLoading(false));
      dispatch(setFormSubmissionLoading(true));
      getFormSubmissionData(task?.formUrl);
      dispatch(reloadTaskFormSubmission(false));
    }
  }, [
    task?.formUrl,
    taskFormSubmissionReload,
    dispatch,
    getFormSubmissionData,
  ]);

  const reloadTasks = () => {
    dispatch(setBPMTaskDetailLoader(true));
    dispatch(setSelectedTaskID(null)); // unSelect the Task Selected
    dispatch(fetchServiceTaskList(selectedFilter.id, firstResult, reqData)); //Refreshes the Tasks
    dispatch(push(`${redirectUrl}task/`));
  };

  const reloadCurrentTask = () => {
    if (selectedFilter && task?.id) {
      dispatch(setBPMTaskDetailLoader(true));
      dispatch(
        getBPMTaskDetail(task.id, (err, taskDetail) => {
          if (!err) {
            dispatch(setFormSubmissionLoading(true));
            getFormSubmissionData(taskDetail?.formUrl);
          }
        })
      ); // Refresh the Task Selected
      dispatch(getBPMGroups(task.id));
      dispatch(fetchServiceTaskList(selectedFilter.id, firstResult, reqData)); //Refreshes the Tasks
      
    }
  };

  const onCustomEventCallBack = (customEvent) => {
    switch (customEvent.type) {
      case CUSTOM_EVENT_TYPE.RELOAD_TASKS:
        reloadTasks();
        break;
      case CUSTOM_EVENT_TYPE.RELOAD_CURRENT_TASK:
        reloadCurrentTask();
        break;
      case CUSTOM_EVENT_TYPE.ACTION_COMPLETE:
        onFormSubmitCallback(customEvent.actionType, customEvent.successPage, 
          customEvent?.isDefaultLoaderHidden);
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
      case CUSTOM_EVENT_TYPE.CUSTOM_SUBMISSION_LOADING:
        setIsCustomFormSubmissionLoading(true);
        break;
      default:
        return;
    }
  };

  const onFormSubmitCallback = (actionType = "", successPage, isDefaultLoaderHidden = false) => {
    if (bpmTaskId) {
      // The following dispatch is the place where showing the 3 dots animation.
      !isDefaultLoaderHidden && dispatch(setBPMTaskDetailLoader(true));
      const { formId, submissionId } = getFormIdSubmissionIdFromURL(
        task?.formUrl
      );
      const formUrl = getFormUrlWithFormIdSubmissionId(formId, submissionId);
      const origin = `${window.location.origin}${redirectUrl}`;
      const webFormUrl = `${origin}form/${formId}/submission/${submissionId}`;
      dispatch(
        onBPMTaskFormSubmit(
          bpmTaskId,
          getTaskSubmitFormReq(
            formUrl,
            task?.applicationId,
            actionType,
            webFormUrl
          ),
          (err) => {
            if (!err) {
              reloadTasks();
              redirectToSuccessPage(dispatch, push, successPage);
            } else {
              dispatch(setBPMTaskDetailLoader(false));
            }
          }
        )
      );
    } else {
      reloadCurrentTask();
    }
  };

  if (!bpmTaskId) {
    return (
      <Row className="not-selected mt-2 ml-1 " style={{ color: "#757575" }}>
        <i className="fa fa-info-circle mr-2 mt-1" />
        {t("Select a task in the list.")}
      </Row>
    );
  } else if (isTaskLoading) {
    return (
      <div className="service-task-details">
        <Loading />
      </div>
    );
  } else {
    /*TODO split render*/
    return (
      <div className="service-task-details">
        <LoadingOverlay
          active={isTaskUpdating || isCustomFormSubmissionLoading}
          spinner
          text={
            isCustomFormSubmissionLoading
              ? "Submitting...this can take a few minutes"
              : "Loading..."
          }
        >
          <TaskHeader />
          <Tabs defaultActiveKey="form" id="service-task-details" mountOnEnter>
            <Tab eventKey="form" title={t("Form")}>
              {popupData && (
                <MessageModal
                  modalOpen={showPopup}
                  title={popupData.title}
                  message={popupData.body}
                  onConfirm={() => setShowPopup(false)}
                />
              )}
              <LoadingOverlay
                active={task?.assignee !== currentUser}
                styles={{
                  overlay: (base) => ({
                    ...base,
                    background: "rgba(0, 0, 0, 0.2)",
                    cursor: "not-allowed !important",
                  }),
                }}
              >
                {/* {task?.assignee === currentUser ? ( */}
                {task?.assignee === currentUser && isSubmissionLoaded ? (
                  <FormEdit
                    onFormSubmit={onFormSubmitCallback}
                    onCustomEvent={onCustomEventCallBack}
                    showPrintButton={false}
                    editSubmissionPage={EDIT_SUBMISSION_PAGE.isReviewSubmission}
                  />
                ) : (
                  <FormView showPrintButton={false} />
                )}
              </LoadingOverlay>
            </Tab>
            {!getUserRolePermission(userRoles, STAFF_REVIEWER) && (
              <>
                <Tab eventKey="history" title={t("History")}>
                  <History applicationId={task?.applicationId} />
                </Tab>
                <Tab eventKey="diagram" title={t("Diagram")}>
                  <div>
                    <ProcessDiagram
                      processKey={processKey}
                      processInstanceId={processInstanceId}
                      tenant={processTenant}
                      // markers={processActivityList}
                    />
                  </div>
                </Tab>
              </>
            )}
          </Tabs>
        </LoadingOverlay>
      </div>
    );
  }
});

export default ServiceFlowTaskDetails;
