# Javascript search engine

![JS search engine](/imgs/screenshot.jpg)

## Description
A search functionality is always good to have on a website if you want your users to easily access what they are looking for.

That's the reason I made this simple yet efficient search engine for my own website. When the user clicks on the search icon, it fetches a JSON containing all the data we want to search through and dynamically updates a list of matches everytime the user press a key.
Key words founds in the target content are highlighted to make the results look nicer.

To avoid multiple connections to the DB everytime the user presses a key, the data is only fetched once then processed locally.

It takes any JSON format file and look through it. Search is case insensitive.

### Here is a [Live version](https://guimauveb.com) **(Click on the search icon)**

## Features
- Works with any JSON / dictionary format
- Highlights key words found in the results
- Avoids multiple unnecessary connections to the database
