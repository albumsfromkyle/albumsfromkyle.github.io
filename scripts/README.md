# Scripts
This section contains scripts that aid me in organizing my music

## organize_exported_songs.py
The goal of this script is to take the exported CSV from [exportify.net](https://exportify.net/), and re-format it into a more readable state, which I can then directly upload to my website.

### How to use
1) Go to [Exportify](https://exportify.net/) and click `Get Started`
2) Allow Exportify to link to your Spotify playlist. Exportify should then take you to a list of all your spotify playlists
3) Find the playlist you want to export and select `Export`. This will download a CSV file titled the same thing as your playlist, which will contain all the songs' information in that playlist.
4) Run the script as `python3 organize_exported_songs.py <path/to/exported.csv> <path/to/output.csv>`
    - For example inside the `scripts/` directory, run `python3 organize_exported_songs.py songs_2024.csv ../csv/2024_songs.csv`

### Things to note
* This script **WILL NOT** modify or delete the input CSV file. You must delete it manually if that's what you want.
* This script **PRESERVES** *some* manual edits to the CSV data. If you **REMOVE** data (such as removing a secondary artist, or removing the "feat." from a song title), then those changes **WILL** be preserved. If you **ADD** new data (besides adding genre info), then those changes will be **OVERWRITTEN** (although I cannot think of any cases where you would want to add data).
* This script **DOES NOT** automatically fill in the song genre. Spotify's genre classification is horrible (which is what Exportify uses), so I ignore it when transfering the data. So, genre information must be input manually (although as mentioned previously, that information will be preserved when running the script again, so you will only need to do this once per song).
