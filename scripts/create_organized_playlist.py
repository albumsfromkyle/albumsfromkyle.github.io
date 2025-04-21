import csv
import spotipy
from collections import defaultdict
import spotipy
from spotipy.oauth2 import SpotifyOAuth


# Configure the Spotify developer values needed
# https://developer.spotify.com/dashboard/
CLIENT_ID = "35be824d954c4a7c8d93a687cabd8fbf"
CLIENT_SECRET = ""
REDIRECT_URI = "http://127.0.0.1:8888/callback"
SCOPE = "playlist-read-private playlist-modify-public playlist-modify-private"

UNORG_PLAYLIST_ID = "1dMXP1fy7ylPeqJh4i4o41"                    # EDIT HERE
YEAR = "2025"                                                   # EDIT HERE
INPUT_CSV = "../csv/" + YEAR + ".csv"

with open("./client_secret.txt", "r") as file:
    CLIENT_SECRET = file.read().strip()


# Authenticate
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope=SCOPE
))


# Get the order of albums from the year's CSV
def read_album_order(csv_path):
    with open(csv_path, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        return [row["Album"] for row in reader]


# Get the order of songs from within the unorganized playlist
def get_playlist_tracks(playlist_id):
    tracks = []
    results = sp.playlist_items(playlist_id)
    while results:
        for item in results["items"]:
            track = item["track"]
            if track is None:
                continue
            album_name = track["album"]["name"]
            track_id = track["id"]
            if track_id:
                tracks.append({
                    "track_id": track_id,
                    "album_name": album_name
                })
        results = sp.next(results) if results["next"] else None
    return tracks


# Store the order of SONGS in the unorganized playlist
album_to_tracks = defaultdict(list)
for track in get_playlist_tracks(UNORG_PLAYLIST_ID):
    album_to_tracks[track["album_name"]].append(track["track_id"])

# Edit the playlist to be in the order of the albums list
ordered_track_ids = []
for album in read_album_order(INPUT_CSV):
    if album in album_to_tracks:
        ordered_track_ids.extend(album_to_tracks[album])
    else:
        print(f"[ERROR] Album not found in playlist: {album}")

# Save the organized results to a new playlist
user_id = sp.current_user()["id"]
new_playlist = sp.user_playlist_create(user=user_id, name="Organized Albums "+YEAR, public=False)
for i in range(0, len(ordered_track_ids), 100):
    sp.playlist_add_items(new_playlist["id"], ordered_track_ids[i:i+100])
