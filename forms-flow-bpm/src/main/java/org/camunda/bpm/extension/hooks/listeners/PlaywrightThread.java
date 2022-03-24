package org.camunda.bpm.extension.hooks.listeners;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Playwright;

public class PlaywrightThread extends Thread {
    private final ThreadLocal<Browser> browser = ThreadLocal.withInitial(() -> {
        Playwright pw = Playwright.create();
        Browser b = pw.chromium().launch(new BrowserType.LaunchOptions().setHeadless(true));

        b.onDisconnected(h -> pw.close());

        return b;
    });

    public PlaywrightThread(Runnable runnable) {
        super(runnable);
    }

    public synchronized Browser getBrowser() {
        return browser.get();
    }

    @Override
    public void run() {
        try {
            System.out.println("Starting playwright thread");

            super.run();
        } finally {
            browser.get().close();
        }
    }
}
