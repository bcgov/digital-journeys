/* istanbul ignore file */
const ACTION_CONSTANTS = {
  SET_CURRENT_PAGE: "SET_CURRENT_PAGE",
  SET_USER_AUTHENTICATION: "SET_USER_AUTHENTICATION",
  SET_USER_TOKEN: "SET_USER_TOKEN",
  SET_USER_ROLES: "SET_USER_ROLES",
  SET_USER_DETAILS: "SET_USER_DETAILS",
  ERROR: "ERROR",
  IS_LOADING: "IS_LOADING",
  SET_LANGUAGE: "SET_LANGUAGE",
  SET_SELECT_LANGUAGES: "SET_SELECT_LANGUAGES",
  ROLE_IDS: "ROLE_IDS",
  ACCESS_ADDING: "ACCESS_ADDING",
  //FORM
  FORM_DELETE: "FORM_DELETE",
  FORM_SUBMISSION_DELETE: "FORM_SUBMISSION_DELETE",
  FORM_SUBMISSION_ERROR: "FORM_SUBMISSION_ERROR",
  IS_FORM_SUBMISSION_LOADING: "IS_FORM_SUBMISSION_LOADING",
  IS_FORM_WORKFLOW_SAVED: "IS_FORM_WORKFLOW_SAVED",
  PUBLIC_FORM_SUBMIT: "IS_FORM_SUBMITTED",
  PUBLIC_FORM_STATUS: "PUBLIC_FORM_STATUS",
  IS_FORM_LOADING: "IS_FORM_LOADING",
  APPLICATION_COUNT: "APPLICATION_COUNT",
  IS_APPLICATION_COUNT_LOADING: "IS_APPLICATION_COUNT_LOADING",
  APPLICATION_COUNT_RESPONSE: "APPLICATION_COUNT_RESPONSE",
  UNPUBLISH_API_ERROR: "UNPUBLISH_API_ERROR",
  IS_PUBLIC_STATUS_LOADING: "IS_PUBLIC_STATUS_LOADING",
  IS_FORM_SEARCH_LOADING: "IS_FORM_SEARCH_LOADING",
  // CUSTOM SUBMISSION
  CUSTOM_SUBMISSION: "CUSTOM_SUBMISSION",
  //React Formio Action Constants
  FORM_CLEAR_ERROR: "FORM_CLEAR_ERROR",
  FORM_REQUEST: "FORM_REQUEST",
  FORM_SUCCESS: "FORM_SUCCESS",
  FORM_FAILURE: "FORM_FAILURE",
  FORM_SAVE: "FORM_SAVE",
  FORM_RESET: "FORM_RESET",
  SUBMISSION_CLEAR_ERROR: "SUBMISSION_CLEAR_ERROR",
  //Dashboards
  LIST_DASHBOARDS: "LIST_DASHBOARDS",
  DASHBOARD_DETAIL: "DASHBOARD_DETAIL",
  IS_DASHBOARD_LOADING: "IS_DASHBOARD_LOADING",
  IS_INSIGHT_DETAIL_LOADING: "IS_INSIGHT_DETAIL_LOADING",
  INSIGHT_ERROR: "INSIGHT_ERROR",
  CLEANUP_INSIGHTS: "CLEANUP_INSIGHTS",
  // Metrics
  METRICS_SUBMISSION_DATE: "METRICS_SUBMISSION_DATE",
  METRICS_LIST: "METRICS_LIST",
  METRICS_SUBMISSIONS: "METRICS_SUBMISSIONS",
  IS_METRICS_LOADING: "IS_METRICS_LOADING",
  METRICS_SUBMISSIONS_STATUS: "METRICS_SUBMISSIONS_STATUS",
  IS_METRICS_STATUS_LOADING: "IS_METRICS_STATUS_LOADING",
  SELECTED_METRICS_ID: "SELECTED_METRICS_ID",
  METRICS_LOAD_ERROR: "METRICS_LOAD_ERROR",
  METRICS_STATUS_LOAD_ERROR: "METRICS_STATUS_LOAD_ERROR",
  IS_PROCESS_STATUS_LOADING: "IS_PROCESS_STATUS_LOADING",
  PROCESS_STATUS_LIST: "PROCESS_STATUS_LIST",
  IS_PROCESS_STATUS_LOAD_ERROR: "IS_PROCESS_STATUS_LOAD_ERROR",
  IS_PROCESS_ACTIVITY_LOAD_ERROR: "IS_PROCESS_ACTIVITY_LOAD_ERROR",
  METRICS_SUBMISSIONS_SEARCH: "METRICS_SUBMISSIONS_SEARCH",
  METRICS_SUBMISSIONS_SORT_CHANGE: "METRICS_SUBMISSIONS_SORT_CHANGE",
  METRICS_SUBMISSIONS_LIST_LIMIT_CHANGE:
    "METRICS_SUBMISSIONS_LIST_LIMIT_CHANGE",
  METRICS_SUBMISSIONS_LIST_PAGE_CHANGE: "METRICS_SUBMISSIONS_LIST_PAGE_CHANGE",
  METRICS_DATE_RANGE_LOADING: "METRICS_DATE_RANGE_LOADING",
  METRICS_SUBMISSION_STATUS_COUNT_LOADER:
    "METRICS_SUBMISSION_STATUS_COUNT_LOADER",
  METRICS_SUBMISSIONS_COUNT: "METRICS_SUBMISSIONS_COUNT",
  // Application history
  LIST_APPLICATION_HISTORY: "LIST_APPLICATION_HISTORY",
  APPLICATION_HISTORY_DETAIL: "APPLICATION_HISTORY_DETAIL",
  PROCESS_LIST: "PROCESS_LIST",
  DMN_PROCESS_LIST: "DMN_PROCESS_LIST",
  IS_HISTORY_LOADING: "IS_HISTORY_LOADING",
  IS_FORM_PROCESS_STATUS_LOAD_ERROR: "IS_FORM_PROCESS_STATUS_LOAD_ERROR",
  FORM_PROCESS_LIST: "FORM_PROCESS_LIST",
  WORKFLOW_ASSOCIATION_CHANGED: "WORKFLOW_ASSOCIATION_CHANGED",
  //Application
  LIST_APPLICATIONS: "LIST_APPLICATIONS",
  LIST_APPLICATIONS_OF_FORM: "LIST_APPLICATIONS_OF_FORM",
  APPLICATION_DETAIL: "APPLICATION_DETAIL",
  APPLICATION_DETAIL_STATUS_CODE: "APPLICATION_DETAIL_STATUS_CODE",
  IS_APPLICATION_LIST_LOADING: "IS_APPLICATION_LIST_LOADING",
  IS_APPLICATION_DETAIL_LOADING: "IS_APPLICATION_DETAIL_LOADING",
  IS_APPLICATION_UPDATING: "IS_APPLICATION_UPDATING",
  APPLICATION_PROCESS: "APPLICATION_PROCESS",
  SET_APPLICATION_LIST_COUNT: "SET_APPLICATION_LIST_COUNT",
  PROCESS_ACTIVITIES: "PROCESS_ACTIVITIES",
  PROCESS_DIAGRAM_XML: "PROCESS_DIAGRAM_XML",
  IS_PROCESS_DIAGRAM_LOADING: "IS_PROCESS_DIAGRAM_LOADING",
  APPLICATION_LIST_ACTIVE_PAGE: "APPLICATION_LIST_ACTIVE_PAGE",
  APPLICATION_STATUS_LIST: "APPLICATION_STATUS_LIST",
  APPLICATIONS_ERROR: "APPLICATIONS_ERROR",
  FORM_PREVIOUS_DATA: "FORM_PREVIOUS_DATA",
  SET_SELECTED_APPLICATION_FOR_DELETE: "SET_SELECTED_APPLICATION_FOR_DELETE",
  DELETE_APPLICATION: "DELETE_APPLICATION",
  //Menu
  TOGGLE_MENU: "TOGGLE_MENU",
  //BPM TASKS
  BPM_LIST_TASKS: "BPM_LIST_TASKS",
  BPM_PROCESS_LIST: "BPM_PROCESS_LIST",
  BPM_USER_LIST: "BPM_USER_LIST",
  BPM_TASKS_COUNT: "BPM_TASKS_COUNT",
  BPM_TASK_DETAIL: "BPM_TASK_DETAIL",
  IS_BPM_TASK_UPDATING: "IS_BPM_TASK_UPDATING",
  IS_BPM_TASK_LOADING: "IS_BPM_TASK_LOADING",
  IS_BPM_TASK_DETAIL_LOADING: "IS_BPM_TASK_DETAIL_LOADING",
  IS_BPM_TASK_DETAIL_UPDATING: "IS_BPM_TASK_DETAIL_UPDATING",
  BPM_FILTER_LIST: "BPM_FILTER_LIST",
  IS_BPM_FILTERS_LOADING: "IS_BPM_FILTERS_LOADING",
  BPM_SELECTED_FILTER: "BPM_SELECTED_FILTER",
  SELECTED_TASK_ID: "SELECTED_TASK_ID",
  SET_TASK_GROUP: "SET_TASK_GROUP",
  IS_TASK_GROUP_LOADING: "IS_TASK_GROUP_LOADING",
  UPDATE_FILTER_LIST_SORT_PARAMS: "UPDATE_FILTER_LIST_SORT_PARAMS",
  UPDATE_FILTER_LIST_SEARCH_PARAMS: "UPDATE_FILTER_LIST_SEARCH_PARAMS",
  UPDATE_LIST_PARAMS: "UPDATE_LIST_PARAMS",
  UPDATE_SEARCH_QUERY_TYPE: "UPDATE_SEARCH_QUERY_TYPE",
  UPDATE_VARIABLE_NAME_IGNORE_CASE: "UPDATE_VARIABLE_NAME_IGNORE_CASE",
  UPDATE_VARIABLE_VALUE_IGNORE_CASE: "UPDATE_VARIABLE_VALUE_IGNORE_CASE",
  RELOAD_TASK_FORM_SUBMISSION: "RELOAD_TASK_FORM_SUBMISSION",
  BPM_TASK_LIST_ACTIVE_PAGE: "BPM_TASK_LIST_ACTIVE_PAGE",
  DEPLOYMENT_LIST: "DEPLOYMENT_LIST",
  BPM_TASKS: "BPM_TASKS",
  BPM_TASKS_ERROR: "BPM_TASKS_ERROR",
  //BPM FORMS
  BPM_FORM_LIST: "BPM_FORM_LIST",
  IS_BPM_FORM_LIST_LOADING: "IS_BPM_FORM_LIST_LOADING",
  BPM_FORM_LIST_PAGE_CHANGE: "BPM_FORM_LIST_PAGE_CHANGE",
  BPM_FORM_LIST_LIMIT_CHANGE: "BPM_FORM_LIST_LIMIT_CHANGE",
  BPM_FORM_LIST_SORT_CHANGE: "BPM_FORM_LIST_SORT_CHANGE",
  BPM_MAINTAIN_PAGINATION: "BPM_MAINTAIN_PAGINATION",
  BPM_FORM_SEARCH: "BPM_FORM_SEARCH",
  BPM_FORM_LOADING: "BPM_FORM_LOADING",
  //CheckList Form
  FORM_CHECK_LIST_UPDATE: "FORM_CHECK_LIST_UPDATE",
  FORM_UPLOAD_LIST: "FORM_UPLOAD_LIST",
  FORM_UPLOAD_COUNTER: "FORM_UPLOAD_COUNTER",
  CHANGE_SIZE_PER_PAGE: "CHANGE_SIZE_PER_PAGE",

  // Dashboards

  DASHBOARDS_LIST: "DASHBOARDS_LIST",
  DASHBOARDS_LIST_ERROR: "DASHBOARDS_LIST_ERROR",
  DASHBOARDS_LIST_GROUPS: "DASHBOARDS_LIST_GROUPS",
  DASHBOARDS_UPDATE_ERROR: "DASHBOARDS_UPDATE_ERROR",
  SET_AUTHORIZATIONS: "SET_AUTHORIZATIONS",
  UPDATE_AUTHORIZATIONS: "UPDATE_AUTHORIZATIONS",

  // Process
  RESET_PROCESS: "RESET_PROCESS",
  FORM_STATUS_LOADING: "FORM_STATUS_LOADING",
  // Tenant
  RESET_TENANT: "RESET_TENANT",
  SET_TENANT_DETAILS: "SET_TENANT_DETAILS",
  SET_TENANT_ID: "SET_TENANT_ID",
  IS_TENANT_DETAIL_LOADING: "IS_TENANT_DETAIL_LOADING",
  SET_TENANT_DATA: "SET_TENANT_DATA",
  // Draft
  SAVE_DRAFT_DATA: "SAVE_DRAFT_DATA",
  DRAFT_SUBMISSION_ERROR: "DRAFT_SUBMISSION_ERROR",
  DRAFT_LIST: "DRAFT_LIST",
  DRAFT_DETAIL: "DRAFT_DETAIL",
  DRAFT_COUNT: "DRAFT_COUNT",
  DRAFT_LIST_LOADER: "DRAFT_LIST_LOADER",
  SET_DRAFT_LIST_ACTIVE_PAGE: "SET_DRAFT_LIST_ACTIVE_PAGE",
  SET_DRAFT_COUNT_PER_PAGE: "SET_DRAFT_COUNT_PER_PAGE",
  DRAFT_DETAIL_STATUS_CODE: "DRAFT_DETAIL_STATUS_CODE",
  DRAFT_LAST_UPDATED: "DRAFT_LAST_UPDATED",
  SET_SELECTED_DRAFT_FOR_DELETE: "SET_SELECTED_DRAFT_FOR_DELETE",
  DELETE_DRAFT: "DELETE_DRAFT",

  // Employee Data
  EMPLOYEE_DATA: "EMPLOYEE_DATA",
  EMPLOYEE_DATA_ERROR: "EMPLOYEE_DATA_ERROR",

  // Release note data
  RELEASE_NOTE_DATA: "RELEASE_NOTE_DATA",
};

export default ACTION_CONSTANTS;
