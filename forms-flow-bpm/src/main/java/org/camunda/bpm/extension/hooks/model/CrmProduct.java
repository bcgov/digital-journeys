package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmProduct {
    private String lookupName;
    
    public CrmProduct(String lookupName) {
        this.lookupName = lookupName;
    }
    
    public String getLookupName() {
        return lookupName;
    }

    public void setLookupName(String lookupName) {
        this.lookupName = lookupName;
    }
}
