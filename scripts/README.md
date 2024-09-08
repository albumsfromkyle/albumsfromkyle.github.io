# Scripts
This section contains scripts that aid me in organizing my music


## organize_exported_songs.py
The goal of this script is to take the exported CSV from [Exportify](https://exportify.net/), and re-format it into a more readable state, which I can then directly upload to my website.

### How to use
1) Go to [Exportify](https://exportify.net/) and click `Get Started`
2) Allow Exportify to link to your Spotify playlist. Exportify should then take you to a list of all your spotify playlists
3) Find the playlist you want to export and select `Export`. This will download a CSV file titled the same thing as your playlist, which will contain all the songs' information in that playlist. Move this file to a known location that can be accessed by the script.
4) Run the script as `python3 organize_exported_songs.py <path/to/exported.csv> <path/to/output.csv>`
    - For example inside the `scripts/` directory, run `python3 organize_exported_songs.py songs_2024.csv ../csv/2024_songs.csv`

### Things to note
* This script **will not** modify or delete the input CSV file. You must delete it manually if that's what you want.
* This script **preserves** *some* manual edits to the CSV data. If you **remove** data (such as removing a secondary artist, or removing the "feat." from a song title), then those changes **will** be preserved. If you **add** new data (besides adding genre info), then those changes will be **overwritten** (although I cannot think of any cases where you would want to add data).
* This script **does not** automatically fill in the song genre. Spotify's genre classification is horrible (which is what Exportify uses), so I ignore it when transfering the data. So, genre information must be input manually (although as mentioned previously, that information will be preserved when running the script again, so you will only need to do this once per song).


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
