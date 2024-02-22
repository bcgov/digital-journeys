package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmStatusWithType {
    private CrmLookupNameObject crmStatus;
    
    public CrmStatusWithType(CrmLookupNameObject crmStatus) {
        this.crmStatus = crmStatus;
    }
    
    public CrmLookupNameObject getStatus() {
        return crmStatus;
    }

    public void setStatus(CrmLookupNameObject crmStatus) {
        this.crmStatus = crmStatus;
    }
}