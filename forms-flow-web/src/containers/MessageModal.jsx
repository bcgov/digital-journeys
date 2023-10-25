import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";

const MessageModal = React.memo((props) => {
  const { modalOpen = false, onConfirm, message, title } = props;
  const { t } = useTranslation();
  return (
    <>
      <Modal show={modalOpen} onHide={onConfirm}>
        {title && <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>}
        <Modal.Body>
          <div dangerouslySetInnerHTML={{ __html: message }} />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" className="btn btn-default" onClick={onConfirm}>
            {t("OK")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default MessageModal;
