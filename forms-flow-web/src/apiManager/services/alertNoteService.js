import { httpGETRequest } from "../httpRequestHandler";
import { setAlertNoteData } from "../../actions/alertNoteActions";
import API from "../endpoints/index";

export const fetchAlertNoteData = () => {
  return (dispatch) => {
    httpGETRequest(API.ALERT_NOTE_DATA)
      .then((res) => {
        if (res.data) {
          dispatch(setAlertNoteData(res.data));
        } else {
          dispatch(setAlertNoteData({}));
        }
      })
      .catch(() => {
        dispatch(setAlertNoteData({}));
      });
  };
};
