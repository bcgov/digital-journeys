import ACTION_CONSTANTS from "./actionConstants";

export const setAlertNoteData = (data) => dispatch => {
    let cc = {
        type:ACTION_CONSTANTS.ALERT_NOTE_DATA,
        payload:data
      };
  dispatch({
    type:ACTION_CONSTANTS.ALERT_NOTE_DATA,
    payload:data
  });
};
