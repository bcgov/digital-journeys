package main.java.org.camunda.bpm.extension.hooks.model;

import java.util.ArrayList;

public class CrmIncidentPostRequest {
  private CrmIdObject crmPrimaryContact;
  private String subject;
  private ArrayList<CrmThread> crmThreads;
  private CrmLookupNameObject crmProduct;
  private CrmLookupNameObject crmCategory;
  private CrmAssignedTo crmAssignedTo;
  private CrmCustomFields crmCustomFields;
  private CrmStatusWithType crmStatusWithType;
  
  public CrmIncidentPostRequest(CrmIdObject crmPrimaryContact, String subject) {
    this.crmPrimaryContact = crmPrimaryContact;
    this.subject = subject;
  }

  public CrmIncidentPostRequest(CrmIdObject crmPrimaryContact, String subject, ArrayList<CrmThread> crmThreads, 
    CrmLookupNameObject crmProduct, CrmLookupNameObject crmCategory, CrmAssignedTo crmAssignedTo, CrmCustomFields crmCustomFields,
    CrmStatusWithType crmStatusWithType) {
    this.crmPrimaryContact = crmPrimaryContact;
    this.subject = subject;
    this.crmThreads = crmThreads;
    this.crmCategory = crmCategory;
    this.crmProduct = crmProduct;
    this.crmAssignedTo = crmAssignedTo;
    this.crmCustomFields = crmCustomFields;
    this.crmStatusWithType = crmStatusWithType;
  }

  public CrmIdObject getPrimaryContact() {
    return crmPrimaryContact;
  }

  public void setPrimaryContact(CrmIdObject crmPrimaryContact) {
    this.crmPrimaryContact = crmPrimaryContact;
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

  public CrmLookupNameObject getProduct() {
    return crmProduct;
  }

  public void setProduct(CrmLookupNameObject crmProduct) {
    this.crmProduct = crmProduct;
  }

  public CrmLookupNameObject getCategory() {
    return crmCategory;
  }

  public void setCategory(CrmLookupNameObject crmCategory) {
    this.crmCategory = crmCategory;
  }

  public CrmAssignedTo getAssignedTo() {
    return crmAssignedTo;
  }

  public void setAssignedTo(CrmAssignedTo crmAssignedTo) {
    this.crmAssignedTo = crmAssignedTo;
  }

  public CrmStatusWithType getStatusWithType() {
    return crmStatusWithType;
  }

  public void setStatusWithType(CrmStatusWithType crmStatusWithType) {
    this.crmStatusWithType = crmStatusWithType;
  }

  public CrmCustomFields getCustomFields() {
    return crmCustomFields;
  }

  public void setCustomFields(CrmCustomFields crmCustomFields) {
    this.crmCustomFields = crmCustomFields;
  }
}