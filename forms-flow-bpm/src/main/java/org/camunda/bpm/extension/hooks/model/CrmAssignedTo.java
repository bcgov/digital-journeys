package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmAssignedTo {
    private CrmLookupNameObject crmStaffGroup;
    
    public CrmAssignedTo(CrmLookupNameObject crmStaffGroup) {
        this.crmStaffGroup = crmStaffGroup;
    }
    
    public CrmLookupNameObject getStaffGroup() {
        return crmStaffGroup;
    }

    public void setStaffGroup(CrmLookupNameObject crmStaffGroup) {
        this.crmStaffGroup = crmStaffGroup;
    }
}
