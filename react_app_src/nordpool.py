# Import necessary libraries
from selenium import webdriver
import os
from bs4 import BeautifulSoup
import time
import json
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

chrome_options = Options()

# Function to scrape data from Nordpool website
def scrape_nordpool_data():

    driver = webdriver.Chrome()
    
    # Open Nordpool website
    driver.get('https://data.nordpoolgroup.com/auction/day-ahead/prices?deliveryDate=latest&currency=EUR&aggregation=Hourly&deliveryAreas=AT')
    
    # Wait for page to load
    time.sleep(5)

    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    # Find all table rows containing data
    rows = soup.find_all('tr', class_='dx-row dx-data-row dx-column-lines')

    # Initialize empty list to store extracted data
    data = []
    i = 0
    
    # Iterate through each row and extract data
    for row in rows:
        if i < 12:
            # Extract text from each cell in the row
            row_data = [cell.get_text(strip=True) for cell in row.find_all('td')]
            data.append(row_data)
        else:
            break
        i += 1

    driver.quit()
    
    # Return the scraped data
    return data
