package main.java.org.camunda.bpm.extension.hooks.model;

import java.util.ArrayList;

public class CrmPostRequest {
  private CrmPrimaryContact crmPrimaryContact;
  private ArrayList<CrmOtherContact> crmOtherContacts;
  private String subject;
  private ArrayList<CrmThread> crmThreads;
  private CrmProduct crmProduct;
  private CrmCategory crmCategory;
  private CrmAssignedTo crmAssignedTo;
  private CrmCustomFields crmCustomFields;
  
  public CrmPostRequest(CrmPrimaryContact crmPrimaryContact, String subject) {
    this.crmPrimaryContact = crmPrimaryContact;
    this.subject = subject;
  }

  public CrmPostRequest(CrmPrimaryContact crmPrimaryContact, ArrayList<CrmOtherContact> crmOtherContacts, String subject, ArrayList<CrmThread> crmThreads, 
    CrmProduct crmProduct, CrmCategory crmCategory, CrmAssignedTo crmAssignedTo, CrmCustomFields crmCustomFields) {
    this.crmPrimaryContact = crmPrimaryContact;
    this.crmOtherContacts = crmOtherContacts;
    this.subject = subject;
    this.crmThreads = crmThreads;
    this.crmCategory = crmCategory;
    this.crmProduct = crmProduct;
    this.crmAssignedTo = crmAssignedTo;
    this.crmCustomFields = crmCustomFields;
  }

  public CrmPrimaryContact getPrimaryContact() {
    return crmPrimaryContact;
  }

  public void setPrimaryContact(CrmPrimaryContact crmPrimaryContact) {
    this.crmPrimaryContact = crmPrimaryContact;
  }

  public ArrayList<CrmOtherContact> getOtherContacts() {
    return crmOtherContacts;
  }

  public void setOtherContacts(ArrayList<CrmOtherContact> crmOtherContacts) {
    this.crmOtherContacts = crmOtherContacts;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public ArrayList<CrmThread> getThreads() {
    return crmThreads;
  }

  public void setThreads(ArrayList<CrmThread> crmThreads) {
    this.crmThreads = crmThreads;
  }

  public CrmProduct getProduct() {
    return crmProduct;
  }

  public void setProduct(CrmProduct crmProduct) {
    this.crmProduct = crmProduct;
  }

  public CrmCategory getCategory() {
    return crmCategory;
  }

  public void setCategory(CrmCategory crmCategory) {
    this.crmCategory = crmCategory;
  }

  public CrmAssignedTo getAssignedTo() {
    return crmAssignedTo;
  }

  public void setAssignedTo(CrmAssignedTo crmAssignedTo) {
    this.crmAssignedTo = crmAssignedTo;
  }

  public CrmCustomFields getCustomFields() {
    return crmCustomFields;
  }

  public void setCustomFields(CrmCustomFields crmCustomFields) {
    this.crmCustomFields = crmCustomFields;
  }
}