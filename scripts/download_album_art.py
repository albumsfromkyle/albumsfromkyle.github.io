import sys
import csv
import requests
import json
from pathlib import Path


seen = []


def get_track_ids(source_csv_path):
    # Use https://www.spotify-backup.com/ to export a playlist that contains the individual track IDs
    track_ids = []
    with open(source_csv_path, 'r', newline='') as source_csv:
        csvreader = csv.reader(source_csv)

        # If using the above website, there is no header
        
        for row in csvreader:
            track_ids.append(row[0])
    
    return track_ids


def send_spotify_art_GET(track_id):
    url = "https://www.spotifycover.art/api/apee?inputType=tracks&id=" + track_id

    try:
        response = requests.get(url)
        if response.status_code == 200: # Request was successful
            return response.text # This will be a JSON file
        else:
            return ""

    except requests.exceptions.RequestException as e:
        return ""


def download_image_from_url(url, year, artist_name, album_name, size):
    # If this URL has already been seen, skip downloading
    if url in seen:
        return False
    seen.append(url)

    Path("../images/albums/" + year + "/").mkdir(parents=True, exist_ok=True)
    filename = "../images/albums/" + year + "/" + artist_name + "_" + album_name + "_" + str(size) + ".jpg"

    # Skip if this image is already downloaded
    if Path(filename).is_file():
        return False

    # Otherwise, download the image
    response = requests.get(url)
    if response.status_code == 200: # Request was successful
        # Create local file to download to
        
        with open(filename, "wb") as file:
            file.write(response.content)
        return True
    
    return False


if __name__ == "__main__":
    # Get the user command line arguments
    if len(sys.argv) < 2:
        print("[ERROR] Need to pass in 1 argument: the path to the exported csv containing the TRACK IDs")
        print("Run again as 'python3 download_album_art.py /path/to/exported.csv'")
        exit()

    source_csv_path = sys.argv[1]

    # Step 1: Obtain a list of all TRACK IDs from the input playlist CSV
    track_ids = get_track_ids(source_csv_path)

    # Step 2: For each track, send a GET request to www.spotifycover.art and get the response
    for track_id in track_ids:
        response = send_spotify_art_GET(track_id)
        response = json.loads(response)
        
        # Skip if there was no response
        if len(response) == 0:
            continue

        # Step 3: Parse the JSON response to obtain a link to the album arts
        url_640 = response["album"]["images"][0]["url"] # 640x640 image
        url_300 = response["album"]["images"][1]["url"] # 300x300 image
        url_64 = response["album"]["images"][2]["url"] # 64x64 image
    
        # Step 4: Download the images from the links
        album_name = response["album"]["name"]
        artist_name = response["album"]["artists"][0]["name"]
        year = response["album"]["release_date"][0:4]

        # Sanitize album/artist
        artist_name = ''.join(c for c in artist_name if c.isalnum())
        album_name = ''.join(c for c in album_name if c.isalnum())
        if len(year) < 4:
            continue

        download_image_from_url(url_640, year, artist_name, album_name, 640)
        download_image_from_url(url_300, year, artist_name, album_name, 300)
        download_image_from_url(url_64, year, artist_name, album_name, 64)

