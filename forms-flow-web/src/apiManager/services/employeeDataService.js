import { httpGETRequest } from "../httpRequestHandler";
import { setEmployeeData, employeeDataErrorHandler } from "../../actions/employeeDataActions";
import API from "../endpoints/index";

export const fetchEmployeeData = () => {
  return (dispatch) => {
    httpGETRequest(API.GET_EMPLOYEE_DATA)
      .then((res) => {
        if (res.data) {
          dispatch(setEmployeeData(res.data));
        } else {
          dispatch(employeeDataErrorHandler("No employee data found!"));
        }
      })
      .catch((error) => {
        if (error?.response?.data) {
          dispatch(employeeDataErrorHandler(error.response.data));
        } else {
          dispatch(employeeDataErrorHandler("Failed to fetch employee data!"));
        }
      });
  };
};