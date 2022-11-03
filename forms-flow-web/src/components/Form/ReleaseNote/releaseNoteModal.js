import { Button, Modal } from "react-bootstrap";
import { Form } from "react-formio";
import { Translation } from "react-i18next";

const ReleaseNoteModal = ({ showModal, onClose, title, content }) => {
  const isForm = content === undefined ? false : true;
  return (
      <Modal 
        show={showModal}
        onHide={onClose}
        size="lg"
        >
        <Modal.Header style={{color: "#fff", backgroundColor: "#036"}}>
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
  );
};

export default ReleaseNoteModal;