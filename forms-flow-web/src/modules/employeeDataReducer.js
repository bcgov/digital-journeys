import ACTION_CONSTANTS from "../actions/actionConstants";

export const initialState = {
  data: {},
  error: null,
  loading: true,
};

const employeeData = (state = initialState, action) => {
  switch (action.type) {
    
    case ACTION_CONSTANTS.EMPLOYEE_DATA:
      return {
        ...state,
        data: action.payload,
        error: null,
        loading: false,
      };
    
    case ACTION_CONSTANTS.EMPLOYEE_DATA_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    default:
      return state;
  }
};


export default employeeData;