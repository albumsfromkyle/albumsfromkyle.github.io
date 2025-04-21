import sys
import csv
import os.path


# Checks the existing CSV list to see if a hidden rating value exists already or not
# If so, the current hidden ranking is return. Otherwise, the it it set to be around albums with the same rating as it.
def get_hidden_ranking(dest_csv_path, album, rating, index):
    # If an existing CSV does not exist, this does nothing
    with open(dest_csv_path, 'r', newline='') as dest_csv:
        csvreader = csv.reader(dest_csv)
        next(csvreader)

        # Search CSV file for the current album
        for row in csvreader:
            if row[1] == album and row[index]:
                return row[index]
    
    # Default to putting the album at the end of the rankings
    return 0


if __name__ == "__main__":
    # Get the user command line arguments
    if len(sys.argv) < 3:
        print("[ERROR] Need to pass in 2 argument: the path to the exported csv and the path to output the results")
        print("Run again as 'python3 format_sheets_albums.py <exported_csv> <output_csv>'")
        exit()

    source_csv_path = sys.argv[1]
    dest_csv_path = sys.argv[2]

    # Create the destination folder if it does not exist
    if not os.path.isfile(dest_csv_path):
        file = open(dest_csv_path, 'w', newline='')
        file.close()

    # Operate on the CSV
    new_data = []
    with open(source_csv_path, 'r', newline='') as source_csv:
        csvreader = csv.reader(source_csv)

        # Skip the header
        next(csvreader)
        new_data.append(["Album", "Artist", "Genre", "Release Date", "Listened On", "Favorite Songs", "Rating", "Hidden Ranking"])

        # Loop through each row and format the data
        for row in csvreader:
            # Only add rows that contain actual data (no empty rows)
            empty = True
            for cell in row[0:7]: 
                if cell.strip() != '':
                    empty = False
                    break
            
            if not empty:
                # Checks the current CSV to see if there is a hidden ranking already
                hidden_ranking = get_hidden_ranking(dest_csv_path, row[1], row[6], 7)
                new_data.append(row[0:7] + [hidden_ranking])


    # Write all the data at once at the end
    with open(dest_csv_path, 'w', newline='') as dest_csv:
        csvwriter = csv.writer(dest_csv)
        csvwriter.writerows(new_data)
