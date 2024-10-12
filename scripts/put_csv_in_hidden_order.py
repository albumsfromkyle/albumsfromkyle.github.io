import sys
import csv
import os.path


if __name__ == "__main__":
    # Get the user command line arguments
    if len(sys.argv) < 2:
        print("[ERROR] Need to pass in 1 argument: the path to the exported csv and the path to output the results")
        print("Run again as 'python3 set_new_rankings.py <path/to/source.csv>'")
        exit()

    source_csv_path = sys.argv[1] # CSV file with all the albums and hidden rankings in it

    # Create the destination folder if it does not exist
    if not os.path.isfile("output.csv"):
        file = open("output.csv", 'w', newline='')
        file.close()

    # Operate on the CSV
    new_data = [] # Will store all of the new data to write to the final CSV
    with open(source_csv_path,'r') as source_csv:
        csvreader = csv.reader(source_csv)

        header = next(csvreader)

        sorted_rows = sorted(csvreader, key=lambda row: int(row[7]), reverse=True)
    

    # Write all the data at once at the end
    with open("output.csv", 'w', newline='') as dest_csv:
        csvwriter = csv.writer(dest_csv)
        csvwriter.writerow(header)
        csvwriter.writerows(sorted_rows)
