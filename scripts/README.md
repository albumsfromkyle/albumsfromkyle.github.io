# Scripts
This section contains scripts that aid me in organizing my music. These interface mostly with exported CSV files of my spotify playlists.


<!-- ---------------------------------------------------------------------------------------- -->


## organize_albums_playlist.py
This script takes a backed-up CSV of my "Albums <Year>" Spotify playlist, and organizes it to match the ordering of the HTML table on the website (organized by hidden ranking). This can then be imported back into Spotify to have as the "Organized Albums <Year>" playlist.

### How to use
1) Go to the playlist you want to download the album arts from in Spotify. Click `Share` and `Copy Link to Playlist`
2) Go to [Spotify Backup](https://www.spotify-backup.com/), paste in the playlist link, and click `Generate Backup`. This will download a CSV of your playlist. Move this file to a known location that can be accessed by the script.
3) Cd into the `scrips/` directory, and run the script as `python3 download_album_art.py <year you are organizing> <path/to/exported.csv> <path/to/organized.csv>`
    - For example, `python3 organize_albums_playlist.py 2024 backup.csv organized_2024_albums.csv`
4) Go back to [Spotify Backup](https://www.spotify-backup.com/) and click `Import` at the top
5) Type in the name of the playlist you want to create
6) Click `Upload Your Playlist`, navigate to the outputted CSV file, and select it
    - If using WSL, it might be easier to copy the outputted CSV back to somewhere on your windows file system
7) Allow [Spotify Backup](https://www.spotify-backup.com/) to link to your Spotify account if it asks
    - If you want to unlink it, login to your Spotify account on the **INTERNET** (this cannot be done through the Spotify app), and go to "Manage Apps". (You can click here to go there: https://www.spotify.com/us/account/apps/). Then find `spotify-backup`, and hit `Remove Access`.
8) Click `Import Playlist`. The resulting Spotify playlist should appear in your profile in a minute

### Things to note
* This script **will not** modify or delete the input CSV file. You must delete it manually if that's what you want.
* This needs to be run in the `scripts/` directory so the file paths work correctly
* VERY IMPORTANT: This requires both the `csv/<year>.csv` file, and the exported Spotify playlist to be MATCHING (in terms of the songs listed in the CSV file existing in the Spotify playlist)! The program will error whenever they don't match, but just be aware it may require A LOT of manual fixes. (This also means it acts as a spellchecker for song/album/artist names)


<!-- ---------------------------------------------------------------------------------------- -->


## organize_exported_albums.py
The goal of this script is to take the exported CSV from my personal Google Sheets, and re-format it to fit my website's format.

### How to use
1) Go to the desired year's Google Sheets album tracker
2) Export the main page as a CSV, and move it into the `csv/` directory
4) Run the script as `python3 organize_exported_albums.py <path/to/exported.csv> <path/to/output.csv>`
    - For example inside the `scripts/` directory, run `python3 organize_exported_albums.py exported.csv ../csv/2024.csv`

### Things to note
* This script **will** modify the input CSV file, so make a backup if you do not want the data to potentially be lost.
* This script should be run right after exporting the Google Sheets
* It is hard-coded to my current setup, so if that changes in the future the script will need to be adjusted
* The output CSV path **NEEDS** to be one of the `csv/` albums files with a year in its name

<!-- ---------------------------------------------------------------------------------------- -->


## organize_exported_songs.py
The goal of this script is to take the exported CSV from [Exportify](https://exportify.net/), and re-format it into a more readable state, which I can then directly upload to my website.

### How to use
1) Go to [Exportify](https://exportify.net/) and click `Get Started`
2) Allow Exportify to link to your Spotify playlist. Exportify should then take you to a list of all your spotify playlists
    - If you want to unlink it, login to your Spotify account on the **INTERNET** (this cannot be done through the Spotify app), and go to "Manage Apps". (You can click here to go there: https://www.spotify.com/us/account/apps/). Then find `Exportify`, and hit `Remove Access`.
3) Find the playlist you want to export and select `Export`. This will download a CSV file titled the same thing as your playlist, which will contain all the songs' information in that playlist. Move this file to a known location that can be accessed by the script.
4) Run the script as `python3 organize_exported_songs.py <path/to/exported.csv> <path/to/output.csv>`
    - For example inside the `scripts/` directory, run `python3 organize_exported_songs.py songs_2024.csv ../csv/2024_songs.csv`

### Things to note
* This script **will not** modify or delete the input CSV file. You must delete it manually if that's what you want.
* This script **preserves** *some* manual edits to the CSV data. If you **remove** data (such as removing a secondary artist, or removing the "feat." from a song title), then those changes **will** be preserved. If you **add** new data (besides adding genre info), then those changes will be **overwritten** (although I cannot think of any cases where you would want to add data).
* This script **does not** automatically fill in the song genre. Spotify's genre classification is horrible (which is what Exportify uses), so I ignore it when transferring the data. So, genre information must be input manually (although as mentioned previously, that information will be preserved when running the script again, so you will only need to do this once per song).


<!-- ---------------------------------------------------------------------------------------- -->


## download_album_art.py
The goal of this script is to automate the process of downloading album art images. This uses two tools:
* [Spotify Backup](https://www.spotify-backup.com/) - Which exports a spotify playlist, but importantly includes the **track ID** for each song. Other alternatives can be used, as long as you have the track ID, although small modifications to the script will be needed
* [Spotify Cover Art](https://www.spotifycover.art/) - Which shows the album art when given a track ID
This downloads 3 images of the album art in different sizes (64x64, 300x300, and 640x640)

### How to use
1) Go to the playlist you want to download the album arts from in Spotify. Click `Share` and `Copy Link to Playlist`
2) Go to [Spotify Backup](https://www.spotify-backup.com/), paste in the playlist link, and click `Generate Backup`. This will download a CSV of your playlist. Move this file to a known location that can be accessed by the script.
3) Cd into the `scrips/` directory, and run the script as `python3 download_album_art.py <path/to/exported.csv>`
    - For example, `python3 download_album_art.py albums_2024.csv`

### Things to note
* This script **will not** modify or delete the input CSV file. You must delete it manually if that's what you want.
* This script will **take some time** to complete, especially if you are downloading a lot of album arts at once. Just give it time.
* This script will output all the images to `images/albums/<year>/`, and titles the images as `<artist>_<albums>_<size>.jpg`.
* This script **will not** re-download existing images.
