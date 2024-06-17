import requests
from bs4 import BeautifulSoup
import codecs
import os
import re

# Path to the file
output_file_path = 'girlName.txt'  # Replace with the desired directory path

# Ensure the file is writable or create it if it does not exist
if not os.path.exists(output_file_path):
    open(output_file_path, 'w').close()

if not os.access(output_file_path, os.W_OK):
    print(f"{output_file_path} is not writable. Attempting to set write permissions.")
    try:
        os.chmod(output_file_path, 0o666)  # Sets read and write permissions for all users
        if os.access(output_file_path, os.W_OK):
            print(f"Write permissions set successfully for {output_file_path}.")
        else:
            print(f"Failed to set write permissions for {output_file_path}.")
            exit(1)
    except Exception as e:
        print(f"Error setting permissions: {e}")
        exit(1)

# URLs to scrape
urls = [
        'https://he.wikipedia.org/wiki/%D7%A7%D7%98%D7%92%D7%95%D7%A8%D7%99%D7%94:%D7%A9%D7%9E%D7%95%D7%AA_%D7%A4%D7%A8%D7%98%D7%99%D7%99%D7%9D_%D7%9C%D7%A0%D7%A9%D7%99%D7%9D',
        'https://he.wikipedia.org/wiki/%D7%A7%D7%98%D7%92%D7%95%D7%A8%D7%99%D7%94:%D7%A9%D7%9E%D7%95%D7%AA_%D7%A4%D7%A8%D7%98%D7%99%D7%99%D7%9D_%D7%A2%D7%91%D7%A8%D7%99%D7%99%D7%9D_%D7%9C%D7%A0%D7%A9%D7%99%D7%9D',
     ]

def scrape_wikipedia_page(url):
    # Send a GET request to the URL
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the HTML content of the page
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the div with class 'mw-category mw-category-columns'
        category_div = soup.find('div', class_='mw-category mw-category-columns')

        # Check if category_div is found
        if category_div is None:
            print(f"No 'mw-category mw-category-columns' div found in {url}")
            return []

        # Extract the text of each item in the list
        items = []
        for item in category_div.find_all('li'):
            item_text = item.get_text()
            # Remove text within parentheses
            item_text = re.sub(r'\([^)]*\)', '', item_text).strip()
            items.append(item_text)
        
        return items
    else:
        print(f"Failed to retrieve the page. Status code: {response.status_code}")
        return []

# Scrape each page and combine the results
all_items = []
for url in urls:
    items = scrape_wikipedia_page(url)
    all_items.extend(items)

# Print the list of items to debug
print("Scraped items:")
for item in all_items:
    print(item)

# Append the items to the existing file
with codecs.open(output_file_path, 'a', encoding='utf-8') as file:
    for item in all_items:
        file.write(item + '\n')

print(f"Appended {len(all_items)} items to {output_file_path}")
