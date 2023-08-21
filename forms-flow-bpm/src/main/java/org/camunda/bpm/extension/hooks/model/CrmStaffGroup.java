package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmStaffGroup {
    private String lookupName;
    
    public CrmStaffGroup(String lookupName) {
        this.lookupName = lookupName;
    }
    
    public String getLookupName() {
        return lookupName;
    }

    public void setLookupName(String lookupName) {
        this.lookupName = lookupName;
    }
}
