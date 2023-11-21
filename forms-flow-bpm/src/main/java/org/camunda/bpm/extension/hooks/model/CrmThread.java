package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmThread {
  private String text;
  private CrmIdObject crmEntryType;
  private CrmIdObject crmChannel;
  private CrmIdObject crmContentType;

  public CrmThread(String text, CrmIdObject crmEntryType, CrmIdObject crmChannel, CrmIdObject crmContentType) {
    this.text = text;
    this.crmEntryType = crmEntryType;
    this.crmChannel = crmChannel;
    this.crmContentType = crmContentType;
  }
  public String getText() {
    return text;
  }
  public void setText(String text) {
    this.text = text;
  }
  public CrmIdObject getEntryType() {
    return crmEntryType;
  }
  public void setEntryType(CrmIdObject crmEntryType) {
    this.crmEntryType = crmEntryType;
  }

  public CrmIdObject getContentType() {
    return crmContentType;
  }
  public void setContentType(CrmIdObject crmContentType) {
    this.crmContentType = crmContentType;
  }

  public CrmIdObject getChannel() {
    return crmChannel;
  }
  public void setChannel(CrmIdObject crmChannel) {
    this.crmChannel = crmChannel;
  }
}