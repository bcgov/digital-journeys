import ACTION_CONSTANTS from "./actionConstants";

export const setAlertNoteData = (data) => dispatch => {
  dispatch({
    type:ACTION_CONSTANTS.ALERT_NOTE_DATA,
    payload:data
  });
};
