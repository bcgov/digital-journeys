import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlertNoteData } from "../../apiManager/services/alertNoteService";

const AlertNoteBanner = React.memo(() => {
    const dispatch = useDispatch();
    const alertNoteData = useSelector((state) => state.alertNote);
    console.log({alertNoteData});
    useEffect(() => {
        dispatch(fetchAlertNoteData());
    }, [dispatch, fetchAlertNoteData]);

    if (alertNoteData !== undefined) {
        const content = alertNoteData.data?.content;
        const contentType = alertNoteData.data?.contenttype === undefined ?
            "alert alert-info" : alertNoteData.data?.contenttype;
        if (content !== undefined && content !== "") {
            return (
                <>
                    <div 
                    className={contentType}
                    dangerouslySetInnerHTML={{ __html: content }}
                    >
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <div></div>
                </>
            );
        }
    } else {
        return (
            <>
                <div></div>
            </>
        );
    }
});

export default AlertNoteBanner;

