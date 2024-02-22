package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmReferenceContactPostRequest {
  private CrmIdObject contactId;
  private CrmIdObject incidentId;
  
  public CrmReferenceContactPostRequest(CrmIdObject contactId, CrmIdObject incidentId) {
    this.contactId = contactId;
    this.incidentId = incidentId;
  }

  public CrmIdObject getC_id() {
    return contactId;
  }

  public void setC_id(CrmIdObject contactId) {
    this.contactId = contactId;
  }

  public CrmIdObject getI_id() {
    return incidentId;
  }

  public void setI_id(CrmIdObject incidentId) {
    this.incidentId = incidentId;
  }
}
