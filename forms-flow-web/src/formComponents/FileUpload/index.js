import { Components } from 'react-formio';

const FileComponent = Components.components.file;

const Field = Components.components.field;

/**
 * Custom Form.io file upload component.
 * This is based on the default file upload component, but provides the following default values:
 * - Private Downloads
 * - File Pattern: image/*,application/pdf,message/rfc822,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-outlook
 * - Max file size: 15MB
 * - Storage provider: digital-journeys
 */
export default class DGJFileUpload extends FileComponent{

  static schema(...extend) {
    return Field.schema({
      type: 'file',
      label: 'Upload File',
      key: 'file',
      image: false,
      privateDownload: true,
      imageSize: '200',
      filePattern: 'image/*,application/pdf,message/rfc822,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-outlook',
      fileMinSize: '0KB',
      fileMaxSize: '15MB',
      description: 'Supported file types: .eml, .msg, .docx, .pdf, common image formats',
      uploadOnly: false,
      storage: 'digital-journeys',
    }, ...extend);
  }

  static get builderInfo() {
    return {
      title: 'File Upload',
      group: 'basic',
      icon: 'file',
      documentation: 'http://help.form.io/userguide/#file',
      weight: 100,
      schema: DGJFileUpload.schema(),
    };
  }

  // Fix a bug where the file upload component doesn't display if you remove a file that had an error
  attach(element) {
    this.loadRefs(element, {
      fileStatusRemove: 'multiple',
    });

    this.refs.fileStatusRemove.forEach((fileStatusRemove) => {
      this.addEventListener(fileStatusRemove, 'click', () => {
        // Force the file selector component to show once the errored file has been removed
        this.fileDropHidden = false;
      });
    });

    return super.attach(element);
  }
}
