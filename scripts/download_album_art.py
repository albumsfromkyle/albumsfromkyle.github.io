import os
import requests
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Configure the Spotify developer values needed
# https://developer.spotify.com/dashboard/
CLIENT_ID = '35be824d954c4a7c8d93a687cabd8fbf'
CLIENT_SECRET = ""
REDIRECT_URI = 'http://127.0.0.1:8888/callback'
SCOPE = 'playlist-read-private'

PLAYLIST_ID = "1dMXP1fy7ylPeqJh4i4o41"                      # EDIT HERE
OUTPUT_DIR = '../images/albums/2025'                        # EDIT HERE

with open("./client_secret.txt", 'r') as file:
    CLIENT_SECRET = file.read().strip()


# Authenticate
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope=SCOPE
))


# Gets all the trackIDs for each song in a playlist
def get_all_tracks(playlist_id):
    tracks = []
    results = sp.playlist_items(playlist_id)
    tracks.extend(results['items'])

    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])

    return tracks


# Downloads an image from a URL to the given filepath
def download_image(url, filename):
    response = requests.get(url)
    if response.status_code == 200:
        with open(filename, 'wb') as f:
            f.write(response.content)


# Downloads all the album art for every song in the given playlist
if __name__ == "__main__":
    # Make output directory
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Get all the songs' trackIDs
    tracks = get_all_tracks(PLAYLIST_ID)
    print(f"Found {len(tracks)} tracks in the playlist.")

    # For each song, download the album art
    for item in tracks:
        track = item['track']
        if not track:
            continue

        # Extract track info
        album = track['album']
        album_name = album['name'].replace("/", "-")
        artist_name = track['artists'][0]['name'].replace("/", "-")
        
        # Format info to match my filename structure
        artist_name = artist_name.split(",")[0] # Split at the first comma (do this to conform with what the old website code expects)
        artist_name = ''.join(c for c in artist_name if c.isalnum()).lower()
        album_name = ''.join(c for c in album_name if c.isalnum()).lower()

        # Download the 300x300 image
        image_url = next((img['url'] for img in album['images'] if img['height'] == 300), None)
        if not image_url:
            print(f"Skipping (no 300x300): {artist_name} - {album_name}")
            continue

        filename = f"{OUTPUT_DIR}/{artist_name}_{album_name}_300.jpg"
        if not os.path.exists(filename):
            print(f"Downloading: {filename}")
            download_image(image_url, filename)
        else:
            print(f"Already exists: {filename}")
