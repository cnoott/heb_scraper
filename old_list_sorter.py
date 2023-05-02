from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium_stealth import stealth
import time


url = 'https://www.heb.com/category/shop/fruit-vegetables/2863/490020?page=1'

chrome_options = Options()
chrome_options.add_argument('start-maximized')
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option('useAutomationExtension', False)

driver = webdriver.Chrome('./chromedriver', chrome_options=chrome_options)

stealth(driver,
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.53 Safari/537.36',
        languages=["en-US", "en"],
        vendor="Google Inc.",
        platform="Win32",
        webgl_vendor="Intel Inc.",
        renderer="Intel Iris OpenGL Engine",
        fix_hairline=True,
        )


driver.get(url)

soup = BeautifulSoup(driver.page_source, 'html.parser')
print(soup.prettify())
product_card_class_name = 'sc-1xszbkg-0 sc-ss7bh7-0 tvZSR dDtdYG'

product_cards = driver.find_elements(By.CLASS_NAME, product_card_class_name)

#for product_card in product_cards:
time.sleep(10)

driver.quit()
