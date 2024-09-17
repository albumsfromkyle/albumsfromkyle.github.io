import sys
import csv
import os.path

# Does two things:
# 1) Trims the CSV data so that it only includes the "useful" data
#       - "Useful" meaning the data in the first 6 columns, and NOT the organization data to the right of my big list
# 2) Duplicates the values in the "Ratings" column into a new "Hidden Rankings" column if a previous hidden ranking does not exist
#
# This script should be run on all new ALBUMS CSVs when importing new versions
#       - This is NOT NEEDED for a songs CSV


# Sets all breakpoints to be 0
breakpoints = {k:v for k, v in zip([x/2 for x in range(0, 21, 1)], [-1 for x in range(0, 21, 1)])}
def set_breakpoints():
    with open(dest_csv_path, 'r', newline='') as dest_csv:
        csvreader = csv.reader(dest_csv)

        # Skip the header
        for row in csvreader:
            break

        # Loop through and record the minimum hidden ranking for each possible rating value
        for row in csvreader: # Can afford to be inefficient since list sizes are small
            # Skip albums that are not from the year being worked on
            release_year = row[3].split("/")[2] if row[3] != "" else "0000"
            if release_year not in dest_csv_path:
                continue

            rating = float(row[6])
            hidden_ranking = int(row[7])

            if (hidden_ranking > breakpoints[rating]):
                breakpoints[rating] = hidden_ranking

    # Fixes any gaps in the breakpoints (in case no album exists with a certain rating)
    for rating in [x/2 for x in range(0, 21, 1)]:
        if breakpoints[rating] != -1:
            continue

        copy_rating = rating
        while breakpoints[copy_rating] == 1 and copy_rating > 0.0:
            copy_rating -= 0.5

        breakpoints[rating] = breakpoints[copy_rating]


# Checks the existing CSV list to see if a hidden rating value exists already or not
# If so, the current value is return. Otherwise, the it it set to be around albums with the same rating as it.
def get_truncated_value(dest_csv_path, album, rating, index):
    # If an existing CSV does not exist, this does nothing
    with open(dest_csv_path, 'r', newline='') as dest_csv:
        csvreader = csv.reader(dest_csv)

        for row in csvreader: # Can afford to be inefficient since list sizes are small
            if row[1] == album and row[index]: # Check if there is a truncated version of the value in each row
                return row[index] # If so, use the truncated value
    
    return breakpoints[float(rating)] if (breakpoints[float(rating)] != -1) else rating


if __name__ == "__main__":
    # Get the user command line arguments
    if len(sys.argv) < 3:
        print("[ERROR] Need to pass in 2 argument: the path to the exported csv and the path to output the results")
        print("Run again as 'python3 organize_exported_songs.py path/to/exported.csv path/to/output.csv'")
        exit()

    source_csv_path = sys.argv[1]
    dest_csv_path = sys.argv[2]

    # Create the destination folder if it does not exist
    if not os.path.isfile(dest_csv_path):
        file = open(dest_csv_path, 'w', newline='')
        file.close()

    # Operate on the CSV
    new_data = [] # Will store all of the new data to write to the final CSV
    with open(source_csv_path, 'r', newline='') as source_csv:
        csvreader = csv.reader(source_csv)

        # Skip the header
        next(csvreader)
        new_data.append(["Artist", "Album", "Genre", "Release Date", "Listened On", "Favorite Songs", "Rating", "Hidden Ranking"])

        set_breakpoints()

        # Loop through each row and format the data
        for row in csvreader:
            # Skip albums that are not from the year being worked on
            release_year = row[3].split("/")[2] if row[3] != "" else "0000"
            if release_year not in dest_csv_path:
                continue

            # Only add rows that contain actual data (no empty rows)
            empty = True
            for cell in row[0:7]: 
                if cell.strip() != '':
                    empty = False
                    break
            
            if empty == False:
                # Checks the current CSV to see if there is a hidden ranking already
                hidden_ranking = get_truncated_value(dest_csv_path, row[1], row[6], 7)
                new_data.append(row[0:7] + [hidden_ranking])

            
    # Write all the data at once at the end
    with open(dest_csv_path, 'w', newline='') as dest_csv:
        csvwriter = csv.writer(dest_csv)
        csvwriter.writerows(new_data)
