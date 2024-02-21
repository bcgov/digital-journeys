package main.java.org.camunda.bpm.extension.hooks.model;

import java.util.ArrayList;

public class CrmIncidentPatchRequest {
  private CrmIdObject crmIncident;
  private Boolean crmUseEmailSignature;
  
  public CrmIncidentPatchRequest(CrmIdObject crmIncident, Boolean crmUseEmailSignature) {
    this.crmIncident = crmIncident;
    this.crmUseEmailSignature = true;
  }

  public CrmIdObject getIncident() {
    return crmIncident;
  }

  public void setIncident(CrmIdObject crmIncident) {
    this.crmIncident = crmIncident;
  }

  public Boolean getUseEmailSignature() {
    return crmUseEmailSignature;
  }

  public void setUseEmailSignature(Boolean crmUseEmailSignature) {
    this.crmUseEmailSignature = crmUseEmailSignature;
  }
}
