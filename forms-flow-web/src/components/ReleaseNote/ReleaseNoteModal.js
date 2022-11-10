import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal } from "react-bootstrap";
import { Translation } from "react-i18next";
import {
    Form,
} from "react-formio";
import { fetchUnreadReleaseNote, readReleaseNote } from "../../apiManager/services/releaseNoteService";

const ReleaseNoteModal = React.memo(() => {
    const [showReleaseNoteModal, setShowReleaseNoteModal] = useState(false);
    const dispatch = useDispatch();
    const releaseNoteData = useSelector((state) => state.releaseNote);
    useEffect(() => {
        if (releaseNoteData.data?.id) {
            setShowReleaseNoteModal(true);
        }
    }, [releaseNoteData, dispatch, readReleaseNote]);

    useEffect(() => {
        dispatch(fetchUnreadReleaseNote());
    }, [dispatch, fetchUnreadReleaseNote]);

    const onClose = () => {
        setShowReleaseNoteModal(false);
        dispatch(readReleaseNote({ release_note_id: releaseNoteData.data?.id }));
    };
    const content = releaseNoteData.data?.content;
    const isForm = content === undefined ? false : true;
    const title = releaseNoteData.data?.title === undefined ?
        "Release Notes" : releaseNoteData.data?.title;
    return (
        <>
            <Modal
                show={showReleaseNoteModal}
                onHide={onClose}
                size="lg"
            >
                <Modal.Header style={{ color: "#fff", backgroundColor: "#036" }}>
                    <Modal.Title>
                        <h3>{title}</h3>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="release-note-modal">
                    {isForm && (
                        <Form
                            form={content}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" className="btn btn-default" onClick={onClose}>
                        <Translation>{(t) => t("Close")}</Translation>
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
});

export default ReleaseNoteModal;
