package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmLookupNameObject {
    private String lookupName;
    
    public CrmLookupNameObject(String lookupName) {
        this.lookupName = lookupName;
    }
    
    public String getLookupName() {
        return lookupName;
    }

    public void setLookupName(String lookupName) {
        this.lookupName = lookupName;
    }
}
