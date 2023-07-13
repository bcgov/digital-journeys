
export const setDeleteDraft = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.DELETE_DRAFT,
    payload: data,
  });
};

export const setSelectedDraftForDelete = (data) => (dispatch) => {
  dispatch({
    type: ACTION_CONSTANTS.SET_SELECTED_DRAFT_FOR_DELETE,
    payload: data,
  });
};