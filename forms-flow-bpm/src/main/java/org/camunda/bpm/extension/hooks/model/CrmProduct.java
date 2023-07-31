package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmProduct {
    private int id;
    private String lookupName;

    public CrmProduct(int id) {
        this.id = id;
    }
    
    public CrmProduct(String lookupName) {
        this.lookupName = lookupName;
    }
    
    public CrmProduct(int id, String lookupName) {
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
