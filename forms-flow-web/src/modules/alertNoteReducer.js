import ACTION_CONSTANTS from "../actions/actionConstants";

export const initialState = {
  data: {}
};

const alertNote = (state = initialState, action) => {
  switch (action.type) {
    
    case ACTION_CONSTANTS.ALERT_NOTE_DATA:
      return {
        ...state,
        data: action.payload,
      };
      
    default:
      return state;
  }
};

export default alertNote;
