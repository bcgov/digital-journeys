package main.java.org.camunda.bpm.extension.hooks.model;

import java.util.ArrayList;

public class CrmPostRequest {
  private CrmPrimaryContact crmPrimaryContact;
  private String subject;
  private ArrayList<CrmThread> crmThreads;
  private CrmProduct crmProduct;
  private CrmCategory crmCategory;
  
  public CrmPostRequest(CrmPrimaryContact crmPrimaryContact, String subject) {
    this.crmPrimaryContact = crmPrimaryContact;
    this.subject = subject;
  }

  public CrmPostRequest(CrmPrimaryContact crmPrimaryContact, String subject, ArrayList<CrmThread> crmThreads, CrmProduct crmProduct, CrmCategory crmCategory) {
    this.crmPrimaryContact = crmPrimaryContact;
    this.subject = subject;
    this.crmThreads = crmThreads;
    this.crmCategory = crmCategory;
    this.crmProduct = crmProduct;
  }

  public CrmPrimaryContact getCrmPrimaryContact() {
    return crmPrimaryContact;
  }

  public void setCrmPrimaryContact(CrmPrimaryContact crmPrimaryContact) {
    this.crmPrimaryContact = crmPrimaryContact;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public ArrayList<CrmThread> getCrmThreads() {
    return crmThreads;
  }

  public void setCrmThreads(ArrayList<CrmThread> crmThreads) {
    this.crmThreads = crmThreads;
  }

  public CrmProduct getCrmProduct() {
    return crmProduct;
  }

  public void setCrmProduct(CrmProduct crmProduct) {
    this.crmProduct = crmProduct;
  }

  public CrmCategory getCrmCategory() {
    return crmCategory;
  }

  public void setCrmCategory(CrmCategory crmCategory) {
    this.crmCategory = crmCategory;
  }
}