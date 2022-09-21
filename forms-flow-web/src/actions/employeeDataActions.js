import ACTION_CONSTANTS from "./actionConstants";

export const setEmployeeData = (data) => dispatch => {
  dispatch({
    type:ACTION_CONSTANTS.EMPLOYEE_DATA,
    payload:data
  });
};

export const employeeDataErrorHandler = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.EMPLOYEE_DATA_ERROR,
    payload: data,
  });
};