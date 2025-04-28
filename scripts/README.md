# Scripts
This section contains scripts that aid me in organizing my music. These interface mostly with exported CSV files of my spotify playlists.


# How-To
## Update the albums list
1) Export the Google Sheets as a CSV
2) Copy the exported CSV into the /scripts directory
3) Run `python3 format_sheets_albums.py <exported_csv> ../csv/<year>.csv`
    - This will trim the excess data off the sheet, while maintaining the previously set hidden rankings
4) Run `python3 put_csv_in_hidden_order.py ../csv/<year>.csv`
    - This will put the CSV file into the same order as the hidden rankings, for ease of editing later on
5) Edit `download_album_art.py` to make sure it is referencing the correct year and playlist ID
    - This only needs to be done once per year
5) Run `powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\download_album_art.py'"`
    - This will download the album art for the new albums
6) Edit the year's CSV file (`../csv/<year>.csv`) to be in the desired order
7) Run `python3 set_rankings_in_file_order.py ../csv/<year>.csv`
    - This will set all the hidden rankings to match the order of the file
8) Edit `create_organized_playlist.py` to make sure it is referencing the correct year and playlist ID
    - This only needs to be done once per year
9) Run `powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\create_organized_playlist.py'"`
    - This will create the organized Spotify playlist in the same order as the CSV
10) Run `rm .cache`

11) Edit the `RECREATE_GRIDS` variable within `main.js` to be `TRUE`
12) On the website, go into developer tools and copy the entire `album-grids` element, and replace the existing element in `index.html`
13) Undo the changes to `main.js`


## Update the songs list
1) Edit `pull_songs_list.py` to make sure it is referencing the correct year and playlist ID
    - This only needs to be done once per year
2) Run `powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\pull_songs_list.py'"`
    - This will pull all the songs from my Spotify "Songs 20XX" playlist and put them in the year's CSV


<!-- ---------------------------------------------------------------------------------------- -->


## create_organized_playlist.py
This script creates a new organized playlist in the same order as the year's matching CSV file.

### How to use
0) Make sure the unorganized Spotify playlist has all the same songs/albums that are in `csv/<year>.csv`
1) Go to the overall albums playlist for the desired year. Click `Share` and `Copy Link to Playlist`.
2) Paste the playlist link into any text field. Look at the link, and note the PlaylistID, which is the value between `/playlist/` and `?si=`. 
    - For example, the PlaylistID for the link `https://open.spotify.com/playlist/1dMXP1fy7ylPeqJh4i4o41?si=7c4c7e720bc340df` is `1dMXP1fy7ylPeqJh4i4o41`
3) Open the script in a text editor. Edit the variable value for `PLAYLIST_ID` to match your playlist, and update the `YEAR` to match your desired year
    - This should only have to be done once a year when making a new "Year 20XX" playlist
4) This script **NEEDS TO RUN IN WINDOWS**, so from WSL it must be run by: `powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\create_organized_playlist.py'"`


### Things to note
* This needs to be run in the `scripts/` directory so the file paths work correctly


<!-- ---------------------------------------------------------------------------------------- -->


## download_album_art.py
The goal of this script is to automate the process of downloading album art images.

### How to use
1) Go to the playlist you want to download the album arts from in Spotify. Click `Share` and `Copy Link to Playlist`
2) Paste the playlist link into any text field. Look at the link, and note the PlaylistID, which is the value between `/playlist/` and `?si=`. 
    - For example, the PlaylistID for the link `https://open.spotify.com/playlist/1dMXP1fy7ylPeqJh4i4o41?si=7c4c7e720bc340df` is `1dMXP1fy7ylPeqJh4i4o41`
3) Open the script in a text editor. Edit the variable value for `PLAYLIST_ID` to match your playlist, and update the `OUTPUT_DIR` to match your desired location
    - This should only have to be done once a year when making a new "Year 20XX" playlist
4) This script **NEEDS TO RUN IN WINDOWS**, so from WSL it must be run by: `powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\download_album_art.py'"`

### Things to note
* This script **will not** re-download existing images.
* Some manual edits may need to be made to the images. To check if this is needed, go onto the website with the console open, and check for errors when loading the grid.
    - These edits will almost always be for albums that either (1) have multiple artists, or (2) are made by artists with a comma in their name (e.g. Tyler, the Creator). For those cases, the HTML will always cut off at the first comma of the first artist. So, abbreviate "Tyler, the Creator" to just "Tyler". Just to double check, look for the path that is in the console error message to see what it should be.
    - Another possible error case is when the actual year an album came out differs from the year Spotify thinks the album came out.


<!-- ---------------------------------------------------------------------------------------- -->


## format_sheets_albums.py
The goal of this script is to take the exported CSV from my personal Google Sheets, and re-format it to fit my website's format.

### How to use
1) Go to the desired year's Google Sheets album tracker
2) Export the main page as a CSV, and move it into the `csv/` directory
4) Run the script as `python3 format_sheets_albums.py <exported_csv> <output_csv>`
    - For example inside the `scripts/` directory, run `python3 format_sheets_albums.py exported.csv ../csv/2024.csv`

### Things to note
* The output CSV path **NEEDS** to be one of the `csv/` albums files with a year in its name


<!-- ---------------------------------------------------------------------------------------- -->


## pull_songs_list.py
Pulls the info from my Spotify songs list, and creates the corresponding "_songs" CSV

### How to use
1) Go to the playlist you want to download the album arts from in Spotify. Click `Share` and `Copy Link to Playlist`
2) Paste the playlist link into any text field. Look at the link, and note the PlaylistID, which is the value between `/playlist/` and `?si=`. 
    - For example, the PlaylistID for the link `https://open.spotify.com/playlist/1dMXP1fy7ylPeqJh4i4o41?si=7c4c7e720bc340df` is `1dMXP1fy7ylPeqJh4i4o41`
3) Open the script in a text editor. Edit the variable value for `PLAYLIST_ID` to match your playlist, and update the `YEAR` to match your desired year
    - This should only have to be done once a year when making a new "Year 20XX" playlist
4) This script **NEEDS TO RUN IN WINDOWS**, so from WSL it must be run by: `powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\pull_songs_list.py'"`


### Things to note
* The output CSV path **NEEDS** to be one of the `csv/` albums files with a year in its name


<!-- ---------------------------------------------------------------------------------------- -->


## put_csv_in_hidden_order.py
This script reorganizes a CSV by the by putting it in order of values of the hidden ranking.

### How to use
1) Run the script as `python3 put_csv_in_hidden_order.py <path/to/source.csv>`
    - For example inside the `scripts/` directory, run `python3 put_csv_in_hidden_order.py ../csv/2024.csv`

### Things to note
* This **will** modify the source file


<!-- ---------------------------------------------------------------------------------------- -->


## set_rankings_in_file_order.py
This script will set the hidden rankings of a CSV file to be in the same order as the rows are organized.

### How to use
1) Run the script as `python3 set_rankings_in_file_order.py <path/to/csv_to_edit>`
    - For example inside the `scripts/` directory, run `python3 set_rankings_in_file_order.py ../csv/2024.csv`

### Things to note
* ...