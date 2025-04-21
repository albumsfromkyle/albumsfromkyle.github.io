import spotipy
from spotipy.oauth2 import SpotifyOAuth
import csv
import sys
import time
import os


# Configure the Spotify developer values needed
# https://developer.spotify.com/dashboard/
CLIENT_ID = "35be824d954c4a7c8d93a687cabd8fbf"
CLIENT_SECRET = ""
REDIRECT_URI = "http://127.0.0.1:8888/callback"
SCOPE = "playlist-read-private playlist-modify-public playlist-modify-private"

PLAYLIST_ID = "78N72f5j0mTbZOkbTlPAJH"                    # EDIT HERE
YEAR = "2025"                                             # EDIT HERE
OUTPUT_CSV = "../csv/" + YEAR + "_songs.csv"

with open("./client_secret.txt", "r") as file:
    CLIENT_SECRET = file.read().strip()


# Authenticate
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope=SCOPE
))


# Preserve the existing genres in the songs list
def load_existing_genres(file_path):
    genre_map = {}
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                key = (row["Song"], row["Artist"])
                genre_map[key] = row["Genre"]
    
    return genre_map


# Get the songs from within the playlist
def get_playlist_tracks(playlist_id):
    tracks = []
    results = sp.playlist_items(playlist_id)
    while results:
        for item in results["items"]:
            track = item["track"]
            if track:
                tracks.append(track)
        results = sp.next(results) if results["next"] else None
    return tracks


# Pull from the Spotify playlist, and convert into the "_songs" CSV
preserved_genres = load_existing_genres(OUTPUT_CSV)
with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ["Song", "Artist", "Album", "Genre"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for track in get_playlist_tracks(PLAYLIST_ID):
        song_name = track["name"]
        artists = track["artists"]
        first_artist = artists[0]["name"] if artists else "-"
        album_name = track["album"]["name"]
        artist_id = artists[0]["id"] if artists else None
        genre = "-"
        
        key = (song_name, first_artist)
        if key in preserved_genres:
            genre = preserved_genres[key]

        writer.writerow({
            "Song": song_name,
            "Artist": first_artist,
            "Album": album_name,
            "Genre": genre
        })
        time.sleep(0.01)