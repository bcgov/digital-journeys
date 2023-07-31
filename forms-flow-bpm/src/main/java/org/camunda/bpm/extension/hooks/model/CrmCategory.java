package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmCategory {
    private int id;
    private String lookupName;

    public CrmCategory(int id) {
        this.id = id;
    }
    
    public CrmCategory(String lookupName) {
        this.lookupName = lookupName;
    }
    
    public CrmCategory(int id, String lookupName) {
        this.lookupName = lookupName;
        this.id = id;
    }

    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getLookupName() {
        return lookupName;
    }

    public void setLookupName(String lookupName) {
        this.lookupName = lookupName;
    }
}
