package org.camunda.bpm.extension.hooks.listeners;

import com.github.jknack.handlebars.Handlebars;
import com.github.jknack.handlebars.Template;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;


import javax.inject.Named;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Named("FormPDFListener")
public class FormPDFListener extends BaseListener implements TaskListener {

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Override
    public void notify(DelegateTask delegateTask) {
        String taskId = String.valueOf(delegateTask.getId());

        try (Playwright playwright = Playwright.create()) {
            DelegateExecution execution = delegateTask.getExecution();

            // Get Form Values
            Map<String,Object> dataMap = formSubmissionService.retrieveFormValues(String.valueOf(execution.getVariables()));

            Handlebars handlebars = new Handlebars();
            Template template = handlebars.compile("form");

            // Data
            Map<String, Object> data = new HashMap<>();
            data.put("formValues", dataMap );

            template.apply(data);

            Browser browser = playwright.chromium().launch();
            Page page = browser.newPage();
            page.navigate("http://www.google.ca");
            page.pdf(new Page.PdfOptions().setPath(Paths.get("test.pdf")));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
