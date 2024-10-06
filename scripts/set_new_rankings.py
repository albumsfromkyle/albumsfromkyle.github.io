import sys
import csv
import os.path


if __name__ == "__main__":
    # Get the user command line arguments
    if len(sys.argv) < 3:
        print("[ERROR] Need to pass in 2 argument: the path to the exported csv and the path to output the results")
        print("Run again as 'python3 set_new_rankings.py <path/to/source.csv> <path/to/list.csv> <path/to/output.csv>'")
        exit()

    source_csv_path = sys.argv[1] # CSV file with all the albums and hidden rankings in it
    list_path = sys.argv[2] # CSV file with the list of "good" albums in order
    dest_csv_path = sys.argv[3] # Output file

    # Create the destination folder if it does not exist
    if not os.path.isfile(dest_csv_path):
        file = open(dest_csv_path, 'w', newline='')
        file.close()

    # Operate on the CSV
    new_data = [] # Will store all of the new data to write to the final CSV
    with open(list_path, 'r', newline='') as list_csv, open(source_csv_path,'r') as source_csv:
        list_reader = csv.reader(list_csv)
        source_reader = csv.reader(source_csv)

        # Get the number of albums to accurate set the hidden rankings
        num_albums = sum(1 for row in source_csv)
        ist_csv.seek(0)
            list_reader = csv.reader(list_csv)

        # Loop through the source list, and check if each album is in the list
        # If so, update it's hidden ranking
        # Otherwise, just copy over the data as is
        for source_row in source_reader:
            current_album = source_row[0]
            hidden_ranking = source_row[7]

            # Determine if this album is in the list
            list_csv.seek(0)
            list_reader = csv.reader(list_csv)
            for index, list_row in enumerate(list_reader):
                if list_row[0] == current_album:
                    hidden_ranking = num_albums - index
                    print("Got hidden ranking", hidden_ranking, "for " + current_album)
            
            new_data.append(source_row[0:7] + [hidden_ranking])
    

    # Write all the data at once at the end
    with open(dest_csv_path, 'w', newline='') as dest_csv:
        csvwriter = csv.writer(dest_csv)
        csvwriter.writerows(new_data)
