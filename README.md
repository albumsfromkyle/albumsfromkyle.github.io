# Albums From Kyle

## What is this?
This is a website for me to share my music hobby! 

Each year I have the goal of listening to at least 100 new albums. 
At the end of the year, I make lists of my favorite albums of the year and this website is the place for me to share those lists with others!

Right now, I have two lists I make for each year: 
* My favorite albums released that year
* My favorite individual songs released that year

There are Spotify playlists for each of these lists as well, so you can easily listen in yourself!


## How can I visit the website?
To actually see the website, just go to [`https://albumsfromkyle.github.io/`](https://albumsfromkyle.github.io/). It is hosted for free using [Github Pages](https://pages.github.com/). All the source code for the website can be viewed here in this repository.


## Development context
This is purely a personal passion project. However, even though I have a great passion for music, I am not much of a fan of web development.
Let that set the expectations for this project as a whole. It definitely won't be fancy and updates will be infrequent (besides adding new music).
This is **not** meant to be professional at all, I am using pure HTML/CSS/JavaScript and purposely using as few tools/libraries as possible.
I am putting up with web development so I can achieve my greater goal of sharing music with others.
Even with that said, feedback/suggestions are always accepted and appreciated if there is anything you would like to see added or changed!

For the time being this website will ONLY be for developed for the desktop experience
(and will only be tested using Google Chrome on my personal computer with the monitors I have at home).
I have no idea how this will function on other sized monitors, on other web browsers, or how it will look on a phone.
Given my skills with web development, my hopes are not high. A phone-friendly version is something that *might* come in the future, but there are no guarantees.

For now, please be patient as I slowly develop this and add functionality. 


## Music updates
As for music updates, I plan on updating this with my listened-to music every month or two.
Leading up to the end of the year in particular is when updates may be more frequent, as I am finalizing my end-of-year lists then.
Otherwise, it will just be updated whenever I have enough to share, and whenever I have time.


## Repository structure
The repository structure is pretty self-explanatory, but here is a quick rundown:
* `css/` contains the website styling and fonts.
* `csv/` contains all the CSVs of my year-end album/song lists.
    - My lists of favorite albums for a given year are denoted as `<year>.csv`.
    - My lists of favorite songs are a given year are denoted as `<year>_songs.csv`.
* `images/` contains all the images used on the website, as well as copies of album art (to maybe be used later)
* `js/` contains the JavaScript backend of the website.
* `scripts/` contains python scripts which are used only to aid in my organization of albums/songs data (and as such are not used by the website).
* The actual HTML files for the website are located in the root directory.
    - `index.html` is the main homepage containing the album/song lists.
    - `site-info.html` contains information about the website and its purpose.
    - `resources.html` contains links to my Spotify playlists and websites I use to help me find music.

The only noteworthy design decision I will mention is that rather than have an individual HTML page for each year or each list, I instead have a single "homepage" (`index.html`) which loads in data from a CSV file into an HTML table. So, that same page is able of displaying every list from every year as long as there is a CSV able to be loaded in. This is the only page that uses JavaScript, as the other pages (`site-info.html` and `resources.html` are purely text based).