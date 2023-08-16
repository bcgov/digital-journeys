package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmThread {
  private String text;
  private CrmEntryType crmEntryType;
  private CrmChannel crmChannel;
  private CrmContentType crmContentType;

  public CrmThread(String text, CrmEntryType crmEntryType, CrmChannel crmChannel, CrmContentType crmContentType) {
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
  public CrmEntryType getEntryType() {
    return crmEntryType;
  }
  public void setEntryType(CrmEntryType crmEntryType) {
    this.crmEntryType = crmEntryType;
  }

  public CrmContentType getContentType() {
    return crmContentType;
  }
  public void setContentType(CrmContentType crmContentType) {
    this.crmContentType = crmContentType;
  }

  public CrmChannel getChannel() {
    return crmChannel;
  }
  public void setChannel(CrmChannel crmChannel) {
    this.crmChannel = crmChannel;
  }
}