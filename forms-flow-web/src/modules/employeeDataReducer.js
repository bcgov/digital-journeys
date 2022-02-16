import ACTION_CONSTANTS from "../actions/actionConstants";

export const initialState = {
  data: {},
  error: null,
};

const employeeData = (state = initialState, action) => {
  switch (action.type) {
    
    case ACTION_CONSTANTS.EMPLOYEE_DATA:
      return {
        ...state,
        data: action.payload,
        error: null,
      };
    
    case ACTION_CONSTANTS.EMPLOYEE_DATA_ERROR:
      return {
        ...state,
        error: action.payload,
      };
      
    default:
      return state;
  }
};


export default employeeData;