import { FORM_NAMES } from "../constants/formConstants";
import { 
  SUBMITTED_STATUS,
  SUBMITTED_VALIDATION_STATUS,
  SUBMITTED_FINAL_STATUS,
  APPROVED_STATUS,
  DENIED_STATUS,
  NEW_STATUS, } from "../constants/applicationConstants";
import { convertObjectKeyValueToLowercase } from './helper';
/**
 * 
 * @param {String} type 
 * @param {Array} data 
 * @returns {Array}
 */
export const setFormAndSubmissionAccess = (type, data) => {
  let ROLE = {};
  data.forEach((role) => {
    if (role.type !== "RESOURCE_ID" || role.type !== "ANONYMOUS") {
      ROLE[role.type] = role.roleId;
    }
  });

  if (ROLE.DESIGNER === undefined) {
    return [];
  }
  const CLIENT_ID = ROLE.CLIENT;
  const DESIGNER_ID = ROLE.DESIGNER;
  const REVIEWER_ID = ROLE.REVIEWER;
  switch (type) {
    case "formAccess":
      return [
        {
          type: "read_all",
          roles: [CLIENT_ID, DESIGNER_ID, REVIEWER_ID],
        },
        {
          type: "update_all",
          roles: [DESIGNER_ID],
        },
        {
          type: "delete_all",
          roles: [DESIGNER_ID],
        },
      ];
    case "submissionAccess":
      return [
        {
          roles: [DESIGNER_ID],
          type: "create_all",
        },
        {
          roles: [REVIEWER_ID],
          type: "read_all",
        },
        {
          roles: [REVIEWER_ID],
          type: "update_all",
        },
        {
          roles: [DESIGNER_ID, REVIEWER_ID],
          type: "delete_all",
        },
        {
          roles: [CLIENT_ID],
          type: "create_own",
        },
        // {
        //   roles: [CLIENT_ID],
        //   type: "create_own",
        // },
        {
          roles: [CLIENT_ID],
          type: "read_own",
        },
        {
          roles: [CLIENT_ID],
          type: "update_own",
        },
        {
          roles: [REVIEWER_ID],
          type: "delete_own",
        },
      ];
    default:
      break;
  }
};

/* Status of the forms that once submitted can support edit under Submitted Forms page
  * Those not listed, will only support view submission
*/
const formEditStatusMap = {
  [FORM_NAMES.MATERNITY_AND_PARENTAL_LEAVE_FORM]: [NEW_STATUS, APPROVED_STATUS, DENIED_STATUS],
  [FORM_NAMES.MATERNITY_PARENTAL_LEAVE_AND_ALLOWANCE_FORM]: [
    NEW_STATUS, APPROVED_STATUS, DENIED_STATUS
  ],
  [FORM_NAMES.INFLUENZA_WORKSITE_REGISTRATION]: [SUBMITTED_STATUS],
  [FORM_NAMES.SL_REVIEW]: [SUBMITTED_VALIDATION_STATUS, SUBMITTED_FINAL_STATUS],
  [FORM_NAMES.SENIOR_LEADER_REVIEW]: [SUBMITTED_VALIDATION_STATUS, SUBMITTED_FINAL_STATUS],
};

export const hasFormEditAccessByStatus = (formName, status) => {
  // convert form names and status to lowercase for comparison
  const lowerCaseFormName = formName.toLowerCase();
  const lowerCaseStatus = status.toLowerCase();
  const lowerCaseFormEditStatusMap = convertObjectKeyValueToLowercase(formEditStatusMap);
  
  const validStatuses = lowerCaseFormEditStatusMap[lowerCaseFormName] || [];
  return validStatuses.includes(lowerCaseStatus);
};