// src/utils/setupBrowser.ts

import { Browser, LaunchOptions } from 'puppeteer';
import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
// Puppeteer extra is a wrapper around puppeteer,
import puppeteer from 'puppeteer-extra';
const chromiumPack = "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";
// Stealth plugin to make puppeteer look like a real browser


// require('puppeteer-extra-plugin-stealth/evasions/chrome.app');
// require('puppeteer-extra-plugin-stealth/evasions/chrome.csi');
// require('puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes');
// require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime');
// require('puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow');
// require('puppeteer-extra-plugin-stealth/evasions/media.codecs');
// require('puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency');
// require('puppeteer-extra-plugin-stealth/evasions/navigator.languages');
// require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions');
// require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins');
// require('puppeteer-extra-plugin-stealth/evasions/navigator.vendor');
// require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver');
// require('puppeteer-extra-plugin-stealth/evasions/sourceurl');
// require('puppeteer-extra-plugin-stealth/evasions/user-agent-override');
// require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor');
// require('puppeteer-extra-plugin-stealth/evasions/window.outerdimensions');
// require('puppeteer-extra-plugin-stealth/evasions/defaultArgs');
// require('puppeteer-extra-plugin-user-preferences');
// require('puppeteer-extra-plugin-user-data-dir');

import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use the plugin
puppeteer.use(StealthPlugin());

async function setupBrowser(options?: LaunchOptions) {
    let browser: Browser;
    // Create the browser instance
    if(process.env.NODE_ENV === 'production') {
        browser = await puppeteerCore.launch({
            ...options,
            args: chromium.args,
            // args: [
            //     "--no-sandbox",
            //     "--disable-setuid-sandbox",
            //     "--window-size=1920,1080"
            // ],
            executablePath: await chromium.executablePath(chromiumPack),
            headless: true
        });
    } else {
        browser = await puppeteer.launch({
            ...options,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--window-size=1920,1080"
            ],
            headless: false
        });
    }
   

    // Use built-in page from the browser instance
    const page = (await browser.pages())[0];

    // Set the viewport of the page to 1920x1080. To make sure the screenshot is full HD
    await page.setViewport({ width: 1920, height: 1080 });

    // Return the browser and page instance
    return { page, browser }
}

export default setupBrowser