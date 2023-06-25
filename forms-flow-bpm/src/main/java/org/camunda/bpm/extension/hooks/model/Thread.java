package main.java.org.camunda.bpm.extension.hooks.model;

public class Thread {
  private String text;
  private EntryType entryType;

  public Thread(String text, EntryType entryType) {
    this.text = text;
    this.entryType = entryType;
  }
  public String getText() {
    return text;
  }
  public void setText(String text) {
    this.text = text;
  }
  public EntryType getEntryType() {
    return entryType;
  }
  public void setEntryType(EntryType entryType) {
    this.entryType = entryType;
  }
}