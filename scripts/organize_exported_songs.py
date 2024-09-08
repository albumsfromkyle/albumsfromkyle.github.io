import sys
import csv


# Checks the existing list to see if a genre has been manually input
def get_genre(dest_csv_path, album):
    # Read the existing CSV and try to copy the genre in there
    # If an existing CSV does not exist, this does nothing
    with open(dest_csv_path, 'r', newline='') as dest_csv:
        csvreader = csv.reader(dest_csv)

        for row in csvreader: # Can afford to be inefficient since list sizes are small
            if album in row: # Use the album, since there are the least amount of manual edits needed for album names
                return row[3] # The column containing the genre info

    return ""


# Checks the existing list to see if a certain value (artist name, song name) should be truncated
# This function essentially preserves all the manual edits I make in the CSV (as long as I am only REMOVING data, and not ADDING)
def get_truncated_value(dest_csv_path, value, index):
    # If an existing CSV does not exist, this does nothing
    with open(dest_csv_path, 'r', newline='') as dest_csv:
        csvreader = csv.reader(dest_csv)

        for row in csvreader: # Can afford to be inefficient since list sizes are small
            if row[index] in value: # Check if there is a truncated version of the value in each row
                return row[index] # If so, use the truncated value
    
    return value


if __name__ == "__main__":
    # Get the user command line arguments
    if len(sys.argv) < 3:
        print("[ERROR] Need to pass in 2 arguments: the path to the exported csv and the path to output the results")
        print("Run again as 'python3 organize_exported_songs.py path/to/exported.csv path/to/output.csv'")
        exit()

    source_csv_path = sys.argv[1]
    dest_csv_path = sys.argv[2]


    # Operate on the CSV
    new_data = [] # Will store all of the new data to write to the final CSV
    with open(source_csv_path, 'r', newline='') as source_csv:
        csvreader = csv.reader(source_csv)
        
        # Handle header
        next(csvreader)
        new_data.append(["Song", "Album", "Artist", "Genre", "Hidden Ranking"])
        
        # Iterate through the actual data and save the important data
        for r, row in enumerate(csvreader):
            song = get_truncated_value(dest_csv_path, row[0], 0)
            album = row[1]
            artist = get_truncated_value(dest_csv_path, row[2], 2)
            genres = get_genre(dest_csv_path, album)
            hidden_ranking = r + 1

            new_data.append([song, album, artist, genres, hidden_ranking])
            
        
    # Write all the data at once at the end
    with open(dest_csv_path, 'w', newline='') as dest_csv:
        csvwriter = csv.writer(dest_csv)
        csvwriter.writerows(new_data)