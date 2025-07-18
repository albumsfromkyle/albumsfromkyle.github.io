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

This website was developed on my personal setup with my personal monitors. While I did try to test the layout on different devices, I was not extremely rigorous. It *should* look fine on most other browsers, monitor sizes, and devices (yes, this website is phone-friendly as well). Although with my lack of experience in web development, I'm sure there are many situations I forgot to test. If you find a situation where things look terrible, let me know and I can try to fix it.


## Music updates
As for music updates, I plan on updating this with my listened-to music every month or two.
Leading up to the end of the year in particular is when updates may be more frequent, as I am finalizing my end-of-year lists then.
Otherwise, it will just be updated whenever I have enough to share, and whenever I have time.


## Repository structure
The repository structure is pretty self-explanatory, but here is a quick rundown:
* `css/` contains the website styling and fonts
* `csv/` contains all the CSVs of my year-end album/song lists
    - My lists of favorite albums for a given year are named `<year>.csv`
    - My lists of favorite songs are a given year are named `<year>_songs.csv`
* `images/` contains all the images used on the website, including icons and album art
* `js/` contains the JavaScript backend of the website
* `scripts/` contains python scripts which are used by me during development to help organization of all my albums/songs data (none of these scripts are used by the website)
* The actual HTML files for the website are located in the root directory
    - `index.html` is the main homepage containing the album/song lists
    - `base_index.html` is the main homepage without any of the lists in it (this is not used in the website, this is just for a reference)
    - `site-info.html` contains information about the website and its purpose
    - `resources.html` contains links to my Spotify playlists and resources I use to help me find music

The only noteworthy design decision I will mention is that rather than have an individual HTML page for each year or each list, I instead have a single homepage (`index.html`) which loads in data from a CSV file into an HTML table. So, that same page is able of displaying every list from every year as long as there is a CSV able to be loaded in. The year, list, and format can be determined by URL parameters. This is the only page that uses JavaScript, as the other pages (`site-info.html` and `resources.html`) are purely text based.

For the album art grid display on the website, things work a bit differently. Dynamically loading hundreds of images was (shockingly) not great for performance (primarily on mobile). My JavaScript code already loads in all the tables/lists dynamically, so I still use the dynamic loading to quickly prototype the website design during development. However when pushing a commit, I turn off all dynamic loading, and simply copy/paste in the static HTML code into `index.html`. That way the website does not need to dynamically create/load anything when being loaded. While that solution is a bit jank, and makes the HTML file thousands of lines longer than it needs to be, it works so I'm keeping it.