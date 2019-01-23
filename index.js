// load puppeteer
const puppeteer = require('puppeteer')

// this wrapper executes this code inmediately
void(async () => {
    // wrapper to catch errors
    try {
        const browser =  await puppeteer.launch()

        // create a new page in the browser
        const page = await browser.newPage()

        // navigate to the webpage
        await page.goto('https://scrapethissite.com/pages/forms/')

        // take and save a screenshot
        await page.screenshot({ path: './data/screenshot/example.png' })

        // generate and save pdf of the page
        await page.pdf({ path: './data/pdf/example.pdf' })

        // close browser
        await browser.close()
    } catch (error) {
        console.log(error)
    }
})()