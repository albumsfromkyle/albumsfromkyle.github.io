import glob
import os

# Directory to search
root_dir = "../images/albums"

# Get all files in the directory and subdirectories
for file_path in glob.glob(f'{root_dir}/**/*', recursive=True):
    if os.path.isfile(file_path):
        if "_300.jpg" not in file_path:
            continue
        print("\"" + file_path.replace("../", "") + "\",")