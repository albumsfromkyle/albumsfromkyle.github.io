#!/bin/bash

echo "Usage: ./auto_upload_albums.sh <exported_csv> <year>"
echo "Make sure the CSV has been exported and uploaded into the /scipts directory"

# Step 1: Trim and format the exported CSV to preserve old data
python3 format_sheets_albums.py $1 ../csv/$2.csv

# Step 2: Put the CSV file into the same order as the hidden rankings for ease of editing later on
python3 put_csv_in_hidden_order.py ../csv/$2.csv

# Step 3: Download all new album art
powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\download_album_art.py'"

# Step 4: Update the hidden rankings for each album in the CSV
read -p "Edit the CSV so it is in the desired order. Press 'enter' when done:"
python3 set_rankings_in_file_order.py ../csv/$2.csv

# Step 5: Create the corresponding Spotify playlist
powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\create_organized_playlist.py'"

# Step 6: Update the "main.js" file to allow dynamic updating of the grids
sed -i 's/let RECREATE_GRIDS = false;/let RECREATE_GRIDS = true;/g' ../js/main.js
read -p "Manually copy over the new HTML into index.html. Press 'enter' when done:"

# Step 7: Set "main.js" back to only display static lists
sed -i 's/let RECREATE_GRIDS = true;/let RECREATE_GRIDS = false;/g' ../js/main.js
rm .cache
