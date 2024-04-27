package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmFileAttachment {
  private String fileName;
  private String name;
  private String data;
  private String contentType;

  public CrmFileAttachment(String data) {
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

  public String getContentType() {
    return contentType;
  }

  public void setContentType(String contentType) {
    this.contentType = contentType;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  } 
}