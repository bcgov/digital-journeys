package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmPostResponse {
    private int id;
    private String lookupName;
    
    public CrmPostResponse(int id, String lookupName) {
      this.id = id;
      this.lookupName = lookupName;
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
