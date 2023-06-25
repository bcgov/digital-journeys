package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmFileAttachmentPostRequest {
  private String fileName;
  private String data;
  
  public CrmFileAttachmentPostRequest(String fileName, String data) {
    this.fileName = fileName;
    this.data = data;
  }

  public String getFileName() {
    return fileName;
  }

  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public String getData() {
    return data;
  }

  public void setData(String data) {
    this.data = data;
  }  
}
