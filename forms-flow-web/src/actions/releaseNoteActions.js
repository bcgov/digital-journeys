import ACTION_CONSTANTS from "./actionConstants";

export const setReleaseNoteData = (data) => dispatch => {
  dispatch({
    type:ACTION_CONSTANTS.RELEASE_NOTE_DATA,
    payload:data
  });
};
