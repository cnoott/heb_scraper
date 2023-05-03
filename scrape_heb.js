import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import fs from 'fs';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({
  blockTrackers: true, 
}));

const uri = process.env.MONGO_URI;
const PROXY = process.env.PROXY;
const PROXY_USER = process.env.PROXY_USER;
const PROXY_PASS = process.env.PROXY_PASS;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
  }
});

let rawJson = fs.readFileSync('heb_cookies.json');
let hebCookies = JSON.parse(rawJson);

const SHOP = 'https://www.heb.com/browse/shop';
const SORT_AZ_PARAM = '?Ns=product.displayName%7C0';
const ITEMS_PER_PAGE = 60;
const PRODUCT_CARD_SELECTOR = 'a.sc-1xszbkg-0.sc-1y1q51o-0.tvZSR.jMdoBe.sc-1y1q51o-1.eLHupe.sc-1i1qhi9-0.bqfYYk';
const PRODUCT_NAME_SELECTOR1 = 'h1.sc-1hc0hyf-4.eWWWvF';
const PRODUCT_NAME_SELECTOR2 = 'h1#desktop-pdp-product-name'; //Could be either or

const DEPARTMENTS = {
  'Fruits & Vegitables': 'https://www.heb.com/category/shop/fruit-vegetables/2863/490020',
  'Meat & Seafood': 'https://www.heb.com/category/shop/meat-seafood/2863/490023',
  'Bakery & Bread': 'https://www.heb.com/category/shop/bakery-bread/2863/490014',
  'Dairy & Eggs' : 'https://www.heb.com/category/shop/dairy-eggs/2863/490016',
  'Deli & Prepared Food' : 'https://www.heb.com/category/shop/deli-prepared-food/2863/490017',
  'Pantry': 'https://www.heb.com/category/shop/pantry/2863/490024',
  'Frozen Food': 'https://www.heb.com/category/shop/frozen-food/2863/490019',
  'Beverages': 'https://www.heb.com/category/shop/beverages/2863/490015',
  'Everyday Essentials': 'https://www.heb.com/category/shop/everyday-essentials/2863/490018',
  'Health & Beauty': 'https://www.heb.com/category/shop/health-beauty/2863/490021',
  'Home & Outdoor': 'https://www.heb.com/category/shop/home-outdoor/2863/490022',
  'Baby & Kids': 'https://www.heb.com/category/shop/baby-kids/2863/489924',
  'Pets': 'https://www.heb.com/category/shop/pets/2863/490025',
};


const departmentCol = client.db('HebProductData').collection('departments');

function delay(time) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}
const scrapeDepartment = async (department, numPages, page) => {
  let pagesScraped = department.pagesScraped;
  for (let pageNum = pagesScraped; pageNum <= numPages; pageNum++) {
    await page.goto(`${department.url}${SORT_AZ_PARAM}&page=${pageNum+1}`);
    const productLinks = await page.$$(PRODUCT_CARD_SELECTOR);
    for (const productLink of productLinks) {
      const href = await productLink.evaluate(link => link.href);
      await page.goto(href);
    }

    departmentCol.updateOne(
      { _id: department._id },
      { pagesScraped: pageNum }
    );
  }
};

(async () => {
  await client.connect();
  const departments = await departmentCol.find().toArray();

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`
  });
  const page = await browser.newPage();


  await page.goto('https://www.heb.com');
  //await page.setCookie(...hebCookies);
  await page.setViewport({width: 1900, height: 1200});
/*
  for (const department of departments) {
    if (department.finishedScraping) {
      continue;
    } 
    await page.goto(department.url + SORT_AZ_PARAM);
    //get number of results and pages
    const numResultsSelector = await page.waitForSelector('text/results');
    const numResultsString = await numResultsSelector.evaluate(el => el.textContent);
    const numResults = parseInt(numResultsString.replace('results', ''));
    const numPages = Math.ceil(numResults / ITEMS_PER_PAGE);

    if (department.pagesScraped >= numPages) {
      console.log('already scrapped all the pages for ', department.name);
      departmentCol.updateOne(
        { _id: department._id },
        { finishedScraping: true}
      );
      continue;
    }

    if (department.startedScraping) {
      console.log('Continuing to scrape ', department.name);
    } else {
      console.log('Starting to scrape ', department.name);

    }
  }
  */

  await delay(12000);
  await page.goto(DEPARTMENTS['Fruits & Vegitables'] + SORT_AZ_PARAM);
  const productLinks = await page.$$(PRODUCT_CARD_SELECTOR);
  await delay(12000);

  for (const link of productLinks) {
    const hrefValue = await link.evaluate(link => link.href);
    await page.goto('https://www.heb.com/product-detail/h-e-b-texas-backyard-jalapeno-grill-rack-13-86-in/1065353');

    let productName;
    try {
      await page.waitForSelector(PRODUCT_NAME_SELECTOR1);
      productName = await page.$eval(PRODUCT_NAME_SELECTOR1, element => element.textContent.trim());
    } catch (error) {
      await page.waitForSelector(PRODUCT_NAME_SELECTOR2);
      productName = await page.$eval(PRODUCT_NAME_SELECTOR2, element => element.textContent.trim());
    }
    console.log(productName);
    break;
  }

//await browser.close();
await client.close();
})();


