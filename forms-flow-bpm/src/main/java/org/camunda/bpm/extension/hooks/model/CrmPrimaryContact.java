package main.java.org.camunda.bpm.extension.hooks.model;

public class CrmPrimaryContact {
    private int id;

    public CrmPrimaryContact(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
