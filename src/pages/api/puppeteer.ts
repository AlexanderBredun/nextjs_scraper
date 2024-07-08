// src/pages/api/puppeteer.ts

import fs from 'fs';
import validURL from 'valid-url';
import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { setTimeout } from "node:timers/promises";

import setupBrowser from '../../utils/setupBrowser';
import { Browser } from 'puppeteer';

type tItem = {
    address: string;
    phone: string;
    name: string;
}

function extractItemsLinks() {
    const extractedElements = document.querySelectorAll<HTMLLinkElement>('.Nv2PK > a');
    const items = [];
    for (let element of extractedElements) {
        items.push(element.href);
    }
    return items;
}
function extractItemsData(): tItem {
    const extractedElementPhone = document.querySelector<HTMLElement>('[data-item-id^="phone:"] .Io6YTe');
    const extractedElementAddress = document.querySelector<HTMLElement>('[data-item-id="address"] .Io6YTe');
    const extractedElementName = document.querySelector<HTMLElement>('.DUwDvf');
    return {
        phone: extractedElementPhone?.innerText || '',
        address: extractedElementAddress?.innerText || '',
        name: extractedElementName?.innerText || '',
    };
}

async function getPlaceCoords(place: string, browser: Browser) {
    const page = await browser.newPage();

    // Задаем исходный URL
    const url = `https://www.google.com/maps/place/${encodeURIComponent(place)}`;
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Ждем, пока URL изменится на тот, который содержит координаты
    await page.waitForFunction('window.location.href.includes("@")', { timeout: 10000 });

    // Получаем текущий URL
    const currentUrl = page.url();

    console.log('Current URL:', currentUrl);
    page.close();
    // Извлекаем координаты из URL
    const match = currentUrl.match(/\/@[-.\d]+,[-.\d]+,\d+z\//);
    if (match) {
        return match[0];
    } else {
        console.log('Coordinates not found in URL');
        return false;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const method = req.method;

    try {
        switch (method) {

            case "GET": {
                const keyword = req.query?.keyword as string;
                const place = req.query?.place as string;
                const itemCount = Number(req.query?.itemsCount);
                const scrollDelay = 800;
                /**
                 * Check if the keyword presented
                 */
                if (!keyword) {
                    return res.status(400).json({ msg: "Не работает без ключевого слова" })
                }
                if (!place) {
                    return res.status(400).json({ msg: "Не работает без города" })
                }

                // Create the puppeteer instance
                const { browser, page } = await setupBrowser();
                const coords = await getPlaceCoords(place, browser);
                if (!coords) {
                    return res.status(500).send({ msg: `Ошибка при попытке получения координат места: ${place}` });
                }
                // Navigate to the URL
                await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(keyword)}${coords}`, { waitUntil: "networkidle2", timeout: 60000 });
                await page.waitForSelector('.Nv2PK');

                let itemsLinks: string[] = [];
                let itemsData: tItem[] = [];
                const processedLinks: string[] = [];
                const loaderSelector = '[role="feed"] .qjESne';
                //qjESne  loader
                try {
                    while (itemsLinks.length < itemCount) {
                        const linksCount = await page.evaluate(`document.querySelectorAll('.Nv2PK > a').length`);
                        console.log(linksCount)
                        const extractedLinks = await page.evaluate(extractItemsLinks);

                        itemsLinks = Array.from(new Set(extractedLinks));

                        for (let i = 0; i < itemsLinks.length; i++) {
                            const element = itemsLinks[i];
                            if (processedLinks.includes(element)) {
                                continue;
                            }
                            await page.click(`a[href="${element}"]`);
                            await page.waitForSelector('.Io6YTe');
                            const extractedData = await page.evaluate(extractItemsData);
                            itemsData.push(extractedData);
                            processedLinks.push(element);
                            console.log(`got data`, i, itemsLinks.length);
                            await setTimeout(100);
                        }
                        try {
                            await page.waitForSelector(loaderSelector, { timeout: 200 })
                        } catch (error) {
                            console.log("The element didn't appear.")
                            break;
                        }
                        await page.evaluate(`document.querySelector('${loaderSelector}').scrollIntoView({ block: "end"})`);
                        await setTimeout(1100);
                        try {
                            await page.waitForSelector(loaderSelector, { timeout: 200 })
                        } catch (error) {
                            console.log("The element didn't appear.")
                            break;
                        }
                        console.log(itemsLinks.length < itemCount, itemsLinks.length)
                        await setTimeout(scrollDelay);
                    }
                    console.log(itemsLinks.length, 'after')
                } catch (e) {
                    console.log(e)
                }

                await browser.close();

                // Return the response of the screenshot URL
                return res.send({ data: itemsData });
            }

            default:
                // Method not allowed
                return res.status(405).send({ msg: "Method Not Allowed!" });
        }
    } catch (error: any) {
        // Handler error;
        console.error(error.message);
        if (error.message.includes('.Nv2PK')) {
            return res.status(500).send({ msg: "По запросу нет реузьтатов" });
        }
        // Never send the error message to the client. It's a security risk.
        return res.status(500).send({ msg: "An error occured. Please try again!", error: error.message });
    }

}