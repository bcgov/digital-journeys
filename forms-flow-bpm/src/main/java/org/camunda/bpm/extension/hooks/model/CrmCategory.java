package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmCategory {
    private String lookupName;
    
    public CrmCategory(String lookupName) {
        this.lookupName = lookupName;
    }
    
    public String getLookupName() {
        return lookupName;
    }

    public void setLookupName(String lookupName) {
        this.lookupName = lookupName;
    }
}
