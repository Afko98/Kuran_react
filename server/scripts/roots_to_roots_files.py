import json
import os
from collections import defaultdict

def split_by_pages(input_file, output_folder="pages"):

    # Load the main JSON file
    print(f"Loading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"Created folder: {output_folder}")
    else:
        print(f"Using existing folder: {output_folder}")
    
    for key, value in data.get('roots', {}).items(): # Use a different loop variable name than the key name 'roots'
        with open(f"{output_folder}/{key}.json", 'w', encoding='utf-8') as f:
            json.dump(value, f, ensure_ascii=False, indent=2)

    with open(f"{output_folder}/addons.json", 'w', encoding='utf-8') as f:
        json.dump(data.get('addons', {}), f, ensure_ascii=False, indent=2)
        

if __name__ == "__main__":
    # Input file (the merged JSON with all chapters)
    input_file = "../data/roots/roots_one_file/roots.json"
    
    # Output folder where page files will be saved
    output_folder = "../data/roots/roots_files"
    
    # Run the split
    split_by_pages(input_file, output_folder)