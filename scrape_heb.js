import puppeteer from 'puppeteer-extra';
import fs from 'fs';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
  }
});

let rawJson = fs.readFileSync('heb_cookies.json');
let hebCookies = JSON.parse(rawJson);

const SHOP = 'https://www.heb.com/browse/shop';
const SORTAZ_PARAM = '?Ns=product.displayName%7C0';
const ITEMS_PER_PAGE = 60;

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

const findTotalPages = (numResultsString) => {
  const numResults = parseInt(numResultsString.replace(' results', ''));
  return numResults / ITEMS_PER_PAGE;
};

(async () => {
  await client.connect();

  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();


  await page.goto('https://www.heb.com');
  await page.setCookie(...hebCookies);
  await page.setViewport({width: 1920, height: 1080});

  for (const [depName, url] of Object.entries(DEPARTMENTS)) {

  }

  await page.goto(DEPARTMENTS['Fruits & Vegitables'] + SORTAZ_PARAM);
  const numResultsSelector = await page.waitForSelector('text/results');
  const numResultsString = await numResultsSelector.evaluate(el => el.textContent);
  console.log(numResultsString);

  //await browser.close();
  await client.close();
})();


