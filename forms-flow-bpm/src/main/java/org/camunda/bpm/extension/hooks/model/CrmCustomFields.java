package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmCustomFields {
    private CrmC crmC;
    
    public CrmCustomFields(CrmC crmC) {
        this.crmC = crmC;
    }
    
    public CrmC getC() {
        return crmC;
    }

    public void setC(CrmC crmC) {
        this.crmC = crmC;
    }
}
