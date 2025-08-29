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

PLAYLIST_ID = "0Q6k70RNa5yfCzR7FoWZJT"                    # EDIT HERE
YEAR = "2025"                                             # EDIT HERE
OUTPUT_CSV = "../csv/" + YEAR + ".csv"

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
def preserve_values(file_path):
    genre_map = {}
    rating_map = {}
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                key = (row["Album"], row["Artist"])
                genre_map[key] = row["Genre"]
                rating_map[key] = row["Rating"]
    
    return genre_map, rating_map


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


def group_songs_by_album(tracks, preserved_genres, preserved_ratings):
    groups = []
    for i in range(0, len(tracks), 3):
        chunk = tracks[i:i+3]

        if len(chunk) != 3:
            print(f"[ERROR] Playlist is not a multiple of 3! Some album must be missing songs")
            exit()

        if not (chunk[0]["artists"][0]["name"] == chunk[1]["artists"][0]["name"] == chunk[2]["artists"][0]["name"]):
            print(f"[ERROR] Album \"{chunk[0]['album']['name']}\" does not have 3 songs! Make sure there are 3 songs from each album on the playlist")
            exit()

        # Read in values from the spotify data
        album = chunk[0]["album"]
        album_name = album["name"]
        artists = ", ".join([artist["name"] for artist in album["artists"]])
        release = "1/1/" + YEAR # Could be pulled automatically, but would require reformatting the date string, which I don't want to do
        genre = ""
        songs = ", ".join([track["name"] for track in chunk])
        rating = -1

        # Use the preserved data to update the values set by me
        key = (album_name, artists)
        if key in preserved_genres:
            genre = preserved_genres[key]
        if key in preserved_ratings:
            rating = preserved_ratings[key]

        if rating == -1:
            rating = groups[-1]["Rating"] if groups and groups[-1] else 9 # Adds default rating for album if there is nothing above it in the list
            print(f"[INFO] Added album \"{album_name}\" by \"{artists}\"")
            print(f"       Setting rating to {rating}, update if needed")
            print(f"       Make sure to manually update the genre information\n")
        
        # Save the results
        groups.append({
            "Album": album_name,
            "Artist": artists,
            "Genre": genre,
            "Release Date": release,
            "Listened On": "",
            "Favorite Songs": songs,
            "Rating": rating,
            "Hidden Ranking": 999
        })

        
    
    return groups


# Pull from the Spotify playlist, and convert into year's CSV
preserved_genres, preserved_ratings = preserve_values(OUTPUT_CSV)
tracks = get_playlist_tracks(PLAYLIST_ID)
album_groups = group_songs_by_album(tracks, preserved_genres, preserved_ratings)

with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ["Album", "Artist", "Genre", "Release Date", "Listened On", "Favorite Songs", "Rating", "Hidden Ranking"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for row in album_groups:
        writer.writerow(row)
        time.sleep(0.01)
