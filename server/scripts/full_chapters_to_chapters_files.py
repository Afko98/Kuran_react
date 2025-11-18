import json
import os

def split_chapters_into_files(input_file, output_folder="chapters"):
    """
    Split the main JSON file into separate files for each chapter.
    Creates 114 individual JSON files in the specified output folder.
    """
    
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
    
    # Get all chapters
    chapters = data.get('chapters', [])
    total_chapters = len(chapters)
    
    print(f"\nFound {total_chapters} chapters to process")
    print("=" * 50)
    
    # Process each chapter
    for chapter in chapters:
        chapter_id = chapter.get('chapter_id')
        chapter_name = chapter.get('name_simple', f'Chapter-{chapter_id}')
        
        # Create filename: chapter_1.json, chapter_2.json, etc.
        filename = f"{chapter_id}.json"
        filepath = os.path.join(output_folder, filename)
        
        # Create a new structure with just this chapter
        chapter_data = {
            "chapter": chapter
        }
        
        # Write to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(chapter_data, f, ensure_ascii=False, indent=2)
        
        # Print progress
        verse_count = chapter.get('verses_count', 0)
        print(f"✓ Chapter {chapter_id:3d}: {chapter_name:20s} ({verse_count:3d} verses) -> {filename}")
    
    print("=" * 50)
    print(f"\n✓ Successfully created {total_chapters} chapter files in '{output_folder}/' folder")
    print(f"✓ Files named as: chapter_1.json, chapter_2.json, ..., chapter_114.json")

if __name__ == "__main__":
    # Input file (the merged JSON with all chapters)
    input_file = "../data/all_chapters.json"
    
    # Output folder where chapter files will be saved
    output_folder = "../data/chapters"
    
    # Run the split
    split_chapters_into_files(input_file, output_folder)