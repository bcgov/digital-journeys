package org.camunda.bpm.extension.hooks.listeners;

import com.github.jknack.handlebars.Handlebars;
import com.github.jknack.handlebars.Template;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.TaskListener;

import javax.inject.Named;
import java.io.IOException;
import java.nio.file.Paths;

@Named("FormPDFListener")
public class FormPDFListener extends BaseListener implements TaskListener {

    @Override
    public void notify(DelegateTask delegateTask) {
        String taskId = String.valueOf(delegateTask.getId());

        try (Playwright playwright = Playwright.create()) {
            Handlebars handlebars = new Handlebars();
            Template template = handlebars.compile("form");

//            // Data
//            Map<String, String> data = new HashMap<>();
//            data.put("name", "John");
//
//            template.apply(data);

            Browser browser = playwright.chromium().launch();
            Page page = browser.newPage();
            page.navigate("http://www.google.ca");
            page.pdf(new Page.PdfOptions().setPath(Paths.get("test.pdf")));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
