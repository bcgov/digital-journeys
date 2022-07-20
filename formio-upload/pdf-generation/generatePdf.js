const url = require('url');
const debug = require('debug');
const log = debug('pdfGeneration');

const { BrowserPool, PuppeteerPlugin } = require('browser-pool');
const puppeteer = require('puppeteer');

/**
 * Local scripts to embed onto the page.
 * These are added by Puppeteer to avoid extra network requests
 */
const externalScripts = [
  'pdf-generation/scripts/formio-4.13.1.full.min.js',
];

/**
 * Local styles to embed onto the page.
 * These are added by Puppeteer to avoid extra network requests
 */
const externalStyles = [
  'pdf-generation/styles/bootstrap-4.1.3.min.css',
  'pdf-generation/styles/font-awesome-4.7.0.min.css',
  'pdf-generation/styles/formio-4.13.1.full.min.css',
  'pdf-generation/styles/semantic-2.4.1.min.css',
  'pdf-generation/styles/digital-journeys-0-1-0-min.css',
]

// Pool of puppeteer browsers to choose from
const browserPool = new BrowserPool({
  browserPlugins: [new PuppeteerPlugin(puppeteer, {
    maxOpenPagesPerBrowser: 10,
    retireBrowserAfterPageCount: 75,
    launchOptions: {
      headless: true,
      args: ['--no-sandbox']
    }
  })],
});

/**
 * Renders the given formio submission as a pdf.
 * @param {*} formData Form definition of form to render (Form.io representation)
 * @param {*} submissionData Submission data for the form to render
 * @returns Rendered PDF (bytestring representation) of the given form definition/submission
 */
module.exports = async function generatePdf(formData, submissionData) {
  let page = null;
  try {
    page = await browserPool.newPage();
    page.on('pageerror', ({ message }) => log(message))

    page.setViewport({
      width: 1024,
      height: 1070
    });

    await loadFormioPage(page);

    // Render the given Formio submission
    await page.evaluate(async (formData, submissionData, viewportHeight) => {
      await window.createForm(formData, submissionData, viewportHeight);
    }, formData, submissionData, 600);
    
    // Wait for the submission to finish rendering
    await page.waitForSelector('#formio-form-rendered');

    // Export pdf using `html2pdf.js` - this returns the pdf as a byte string.
    // This is used in place of the built in puppeteer pdf functionality as it
    // handles page breaks in a gracefuly way that works seamlessly with Formio forms.

    const pdf = await page.pdf({
        format: 'letter',
        printBackground: true,
        margin: {
          top: '60px',
          right: '0px',
          bottom: '64px',
          left: '0px'
      },
    });
    
    return pdf.toString('binary');
  } finally {
    if(page) {
      await page.close();
    }
  }
}

/**
 * Opens the formio html through a file url
 * and adds the internal script tags and styles to the page
 */
async function loadFormioPage(page) {
  await page.goto(url.pathToFileURL('./pdf-generation/formio.html'));

  for (const path of externalScripts) {
    await page.addScriptTag({ path });
  }

  for (const path of externalStyles) {
    await page.addStyleTag({ path });
  }
}
