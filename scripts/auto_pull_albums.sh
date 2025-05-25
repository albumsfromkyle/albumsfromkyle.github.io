#!/bin/bash

# Step 1: Update the "main.js" file to allow dynamic updating of the grids
sed -i 's/let RECREATE_GRIDS = false;/let RECREATE_GRIDS = true;/g' ../js/main.js

# Step 2: Pull all the songs from the "Organized Albums 20XX" playlist
# This will update the CSV to match the playlist
powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\pull_albums_list.py'"

# Step 3: Download all new album art (unless explicitly told not to, for when just reorganizing)
if [ $1 != skip_art ]; then
    powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\albumsfromkyle.github.io\\scripts\\download_album_art.py'"
fi

# Step 4: Update the hidden rankings for each album in the CSV
python3 set_rankings_in_file_order.py ../csv/2025.csv
read -p "Manually copy over the new HTML into index.html. Press 'enter' when done:"

# Step 5: Set "main.js" back to only display static lists
sed -i 's/let RECREATE_GRIDS = true;/let RECREATE_GRIDS = false;/g' ../js/main.js
rm .cache
