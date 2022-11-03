import { httpGETRequest, httpPOSTRequest } from "../httpRequestHandler";
import { setReleaseNoteData } from "../../actions/releaseNoteActions";
import API from "../endpoints/index";

export const fetchUnreadReleaseNote = () => {
  return (dispatch) => {
    httpGETRequest(API.RELEASE_NOTE_UNREAD)
      .then((res) => {
        if (res.data) {
          dispatch(setReleaseNoteData(res.data));
        } else {
          dispatch(setReleaseNoteData({}));
        }
      })
      .catch(() => {
        dispatch(setReleaseNoteData({}));
      });
  };
};


export const readReleaseNote = (data) => {
  return (dispatch) => {
    httpPOSTRequest(API.RELEASE_NOTE_READ, data)
      .then(() => {
        /*  It does not checks success or error
            It's about release note read.
            It will be re-open in case of error.
            We do not need to open toast message here.
            That's why setting release_note to blank object.
        */
        dispatch(setReleaseNoteData({}));
      })
      .catch(() => {
        dispatch(setReleaseNoteData({}));
      });
  };
};
