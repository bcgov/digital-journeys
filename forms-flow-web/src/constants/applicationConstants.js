/* istanbul ignore file */
export const RESUBMITTED_STATUS_EVENT = "application_resubmitted";
export const ACKNOWLEDGED_EVENT = "application_acknowledged";

//export const RETURNED_STATUS = "Returned";
export const RESUBMIT_STATUS = "Resubmit";
export const AWAITING_ACKNOWLEDGEMENT = "Awaiting Acknowledgement";
//export const NEW_STATUS = "New";
export const SUBMITTED_STATUS = "Submitted";
export const RESUBMITTED_STATUS = "Resubmitted";
export const VALIDATED_STATUS = "Validated";
export const SUBMITTED_VALIDATION_STATUS = "Submitted - Validation";
export const SUBMITTED_FINAL_STATUS = "Submitted - Final";
export const APPROVED_STATUS = "APPROVED";
export const DENIED_STATUS = "DENIED";
export const NEW_STATUS = "NEW";
export const COMPLETED_STATUS = "Completed";

// No longer need this, as edit access is now controlled by the formEditStatusMap in forms-flow-web/src/helper/access.js
/* export const CLIENT_EDIT_STATUS = [
  AWAITING_ACKNOWLEDGEMENT,
  RESUBMIT_STATUS,
  SUBMITTED_STATUS,
  RESUBMITTED_STATUS,
  VALIDATED_STATUS,
  SUBMITTED_VALIDATION_STATUS,
  SUBMITTED_FINAL_STATUS,
]; */

export const UPDATE_EVENT_STATUS = [RESUBMIT_STATUS, AWAITING_ACKNOWLEDGEMENT];

export const getProcessDataReq = (applicationDetail) => {
  const data = {
    messageName: "",
    processInstanceId: applicationDetail.processInstanceId,
  };

  switch (applicationDetail.applicationStatus) {
    case AWAITING_ACKNOWLEDGEMENT:
      data.messageName = ACKNOWLEDGED_EVENT;
      break;
    case RESUBMIT_STATUS:
      data.messageName = RESUBMITTED_STATUS_EVENT;
      break;
    default:
      return null; //TODO check
  }
  return data;
};
