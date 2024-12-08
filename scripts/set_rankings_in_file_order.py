import sys
import csv
import os.path


if __name__ == "__main__":
    # Get the user command line arguments
    if len(sys.argv) < 2:
        print("[ERROR] Need to pass in 1 argument: the path to the csv")
        print("Run again as 'python3 set_new_rankings.py <path/to/source.csv>'")
        exit()

    source_csv_path = sys.argv[1] # CSV file with all the albums and hidden rankings in it

    # Operate on the CSV
    new_data = [] # Will store all of the new data to write to the final CSV
    with open(source_csv_path,'r') as source_csv:
        source_reader = csv.reader(source_csv)

        # Get the number of albums to accurate set the hidden rankings
        num_albums = sum(1 for row in source_csv)
        source_csv.seek(0)
        source_reader = csv.reader(source_csv)

        # Loop through the source list
        new_data.append(next(source_reader))
        for index, source_row in enumerate(source_reader):
            if source_row == []:
                new_data.append([])
                continue
            new_data.append(source_row[0:7] + [num_albums - index + 1])
    

    # Write all the data at once at the end
    with open(source_csv_path, 'w', newline='') as dest_csv:
        csvwriter = csv.writer(dest_csv)
        csvwriter.writerows(new_data)
