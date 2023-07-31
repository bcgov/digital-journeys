package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmThread {
  private String text;
  private CrmEntryType crmEntryType;

  public CrmThread(String text, CrmEntryType crmEntryType) {
    this.text = text;
    this.crmEntryType = crmEntryType;
  }
  public String getText() {
    return text;
  }
  public void setText(String text) {
    this.text = text;
  }
  public CrmEntryType getCrmEntryType() {
    return crmEntryType;
  }
  public void setCrmEntryType(CrmEntryType crmEntryType) {
    this.crmEntryType = crmEntryType;
  }
}