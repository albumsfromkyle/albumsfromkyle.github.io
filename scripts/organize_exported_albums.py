import sys
import csv

# Does two things:
# 1) Trims the CSV data so that it only includes the "useful" data
#       - "Useful" meaning the data in the first 6 columns, and NOT the organization data to the right of my big list
# 2) Duplicates the values in the "Ratings" column into a new "Hidden Rankings" column
#
# This script should be run on all new ALBUMS CSVs when importing new versions
#       - This is NOT NEEDED for a songs CSV

# Get the user command line arguments
if len(sys.argv) < 2:
    print("[ERROR] Need to pass in 2 arguments: the path to the exported csv and the path to output the results")
    print("Run again as 'python3 organize_exported_songs.py path/to/exported.csv path/to/output.csv'")
    exit()

source_csv_path = sys.argv[1]

# Operate on the CSV
new_data = [] # Will store all of the new data to write to the final CSV
with open(source_csv_path, 'r', newline='') as source_csv:
    csvreader = csv.reader(source_csv)

    next(csvreader)
    new_data.append(["Artist", "Album", "Genre", "Release Date", "Listened On", "Favorite Songs", "Rating", "Hidden Ranking"])

    for row in csvreader:

        release_year = row[3].split("/")[2]
        if release_year not in source_csv_path:
            continue

        # Only add rows that contain actual data
        empty = True
        for cell in row[0:7]: 
            if cell.strip() != '':
                empty = False
                break
        
        if empty == False:
            new_data.append(row[0:7] + [row[6]]) # Duplicates the ranking

        
# Write all the data at once at the end
with open(source_csv_path, 'w', newline='') as source_csv:
    csvwriter = csv.writer(source_csv)
    csvwriter.writerows(new_data)
