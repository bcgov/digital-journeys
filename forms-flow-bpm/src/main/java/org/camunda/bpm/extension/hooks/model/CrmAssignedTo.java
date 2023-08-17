package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmAssignedTo {
    private CrmStaffGroup crmStaffGroup;
    
    public CrmAssignedTo(CrmStaffGroup crmStaffGroup) {
        this.crmStaffGroup = crmStaffGroup;
    }
    
    public CrmStaffGroup getStaffGroup() {
        return crmStaffGroup;
    }

    public void setStaffGroup(CrmStaffGroup crmStaffGroup) {
        this.crmStaffGroup = crmStaffGroup;
    }
}
