package main.java.org.camunda.bpm.extension.hooks.model;

import java.util.ArrayList;

public class CrmPostRequest {
  private PrimaryContact primaryContact;
  private String subject;
  private ArrayList<Thread> threads;
  
  public CrmPostRequest(PrimaryContact primaryContact, String subject) {
    this.primaryContact = primaryContact;
    this.subject = subject;
  }

  public CrmPostRequest(PrimaryContact primaryContact, String subject, ArrayList<Thread> threads) {
    this.primaryContact = primaryContact;
    this.subject = subject;
    this.threads = threads;
  }

  public PrimaryContact getPrimaryContact() {
    return primaryContact;
  }

  public void setPrimaryContact(PrimaryContact primaryContact) {
    this.primaryContact = primaryContact;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public ArrayList<Thread> getThreads() {
    return threads;
  }

  public void setThreads(ArrayList<Thread> threads) {
    this.threads = threads;
  }
}