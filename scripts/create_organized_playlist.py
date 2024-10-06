import sys
import csv


# NOTE: This doesn't work if there are multiple artists with purely non-alphanumeric names
def get_all_artist_songs(csv_path, artist):
    # Clear all non-alphanumeric characters from the artists name
    artist = ''.join(char for char in artist if char.isalnum()).lower()
    print("Artist = \"" + artist + "\"")

    # Look for matches
    matches = []
    with open(csv_path, 'r', newline='') as csv_obj:
        csvreader = csv.reader(csv_obj)

        for r, row in enumerate(csvreader):
            reader_artist = ''.join(char for char in row[2] if char.isalnum()).lower()

            if (artist in reader_artist) or (reader_artist in artist):
                # Strip all commas from the song name
                row[1] = row[1].replace(",", "")

                # Replace the alternate apostrophes with the regular character
                row[1] = row[1].replace("’", "'")
                
                matches.append(row)
    
    return matches


if __name__ == "__main__":
    # Get the user command line arguments
    if len(sys.argv) < 4:
        print("[ERROR] Need to pass in 3 arguments: the year you are organizing, the path to the exported csv, and the path to output the organized results")
        print("Run again as 'python3 create_organized_playlist.py <year> <path/to/exported.csv> <path/to/output.csv>'")
        exit()

    year = sys.argv[1]
    source_csv_path = sys.argv[2]
    dest_csv_path = sys.argv[3]


    with open("../csv/" + year + ".csv", 'r', newline='') as web_csv:
        web_reader = csv.reader(web_csv)
        num_albums = sum(1 for row in web_reader)

        # Reset the reader
        web_csv.seek(0)
        web_reader = csv.reader(web_csv)

        # Skip the header (there should be no header for the source_csv)
        next(web_reader)

         # Will store all of the new data to write to the final CSV
        new_data = [None] * 3 * num_albums

        # Want to loop through the WEBSITE's csv album list so we can organize the "favorite songs" as well
        for r, row in enumerate(web_reader):
            artist = row[1]
            album = row[0]
            fav_songs = row[5].split(", ")
            hidden_ranking = row[7]

            # Find all the songs associated with this artist
            unorg_songs_rows = get_all_artist_songs(source_csv_path, artist)

            # Quick error checking
            # Note some albums can have less than 3 favorite songs, making things more complicated
            if len(fav_songs) > 3:
                print("\n\n[ERROR] The album \"" + album + "\" by \"" + artist + "\" has more than 3 favorite songs!")
                print("This is likely due to there being a comma in a song name.")
                print("Check/fix this and run again...")
                exit()
            
            if len(unorg_songs_rows) < len(fav_songs):
                print("\n\n[ERROR] The album \"" + album + "\" by \"" + artist + "\" has", len(fav_songs), "favorite songs listed, but the scipt only found", len(unorg_songs_rows), "songs in the input playlist CSV!")
                print("Check/fix this and run again...")
                exit()

            if len(fav_songs) < 3:
                print("\n\n[WARNING] The album \"" + album + "\" by \"" + artist + "\" has less than 3 favorite songs listed in the website table!")
                print("They are:")
                [print("\t" + song) for song in fav_songs]
                print("This should only be allowed for albums that have less than 3 songs in them.")
                input("Press any key to continue...")
            

            # Place the songs into the new CSV in the order listed in "Favorite Songs"
            # Unoptimal, but list size is only 3 so don't care
            for i, song_name in enumerate(fav_songs):
                
                found = False

                # Search for the favorite song in the list of songs from that artists
                for unorg_song_row in unorg_songs_rows:
                    if song_name in unorg_song_row or song_name in unorg_song_row[1]:
                        # When found, add the song to the appropriate spot
                        # Calculation explanation (its gross but works and I don't want to make it nicer):
                        # num_albums - int(hidden_ranking)   ==>   Reverses the order of the hidden rankings, so that the best albums start at 1, and the worst at the end
                        # 3 * (...)   ==>   Accounts for the fact that every album has 3 indices reserved for it
                        # ... + i   ==>   Indexes the song correctly among the album's 3 reserved indices
                        # ... - 1   ==>   Makes the entire indexing process start at 0 rather than 1
                        new_data[3 * (num_albums - int(hidden_ranking)) + i - 1] = unorg_song_row
                        unorg_songs_rows.remove(unorg_song_row)
                        found = True
                        break
                
                if not found:
                    print("[ERROR] Song \"" + song_name + "\" not found for album \"" + album + "\" by \"" + artist + "\"!")
                    print("Remaining songs:")
                    [print("\t", row) for row in unorg_songs_rows]
                    print("Common reasons for this error are: 1) spelling mistake, 2) missing special character, 3) Mismatch between favorite songs (changed in one place but not the other).")
                    print("Check/fix this and run again...")
                    exit()
                
        
        # Remove all leftover 'None' entries (since not all albums will have 3 favorite songs)
        new_data = [row for row in new_data if row != None]
    

    # Write all the data at once at the end
    with open(dest_csv_path, 'w', newline='') as dest_csv:
        csvwriter = csv.writer(dest_csv)
        csvwriter.writerows(new_data)