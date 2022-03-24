package org.camunda.bpm.extension.hooks.model;

import javax.activation.DataSource;
import javax.mail.util.ByteArrayDataSource;

public class Attachment {
    private final String fileName;
    private final String contentType;
    private DataSource dataSource;

    public Attachment(String fileName, String contentType, byte[] fileContent) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.dataSource = new ByteArrayDataSource(fileContent, contentType);
    }
    public Attachment(String fileName, String contentType, DataSource dataSource) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.dataSource = dataSource;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public DataSource getDataSource() {
        return dataSource;
    }
}
