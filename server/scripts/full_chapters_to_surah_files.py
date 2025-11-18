import json
import os
from collections import defaultdict

def split_by_pages(input_file, output_folder="pages"):
    """
    Split the main JSON file into separate files by page numbers (604 pages).
    Each page file contains all verses from that page, organized by chapters.
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
    
    # Organize verses by page number
    print("\nOrganizing verses by page...")
    pages_data = defaultdict(lambda: defaultdict(list))
    
    for chapter in data.get('chapters', []):
        chapter_id = chapter.get('chapter_id')
        chapter_info = {
            'chapter_id': chapter_id,
            'name_arabic': chapter.get('name_arabic'),
            'name_simple': chapter.get('name_simple'),
            'revelation_place': chapter.get('revelation_place'),
            'verses_count': chapter.get('verses_count')
        }
        
        for verse in chapter.get('verses', []):
            page_number = verse.get('page_number')
            juz_number = verse.get('juz_number')
            
            # Store verse with chapter info
            pages_data[page_number][chapter_id].append({
                'verse': verse,
                'chapter_info': chapter_info,
                'juz_number': juz_number
            })
    
    total_pages = len(pages_data)
    print(f"Found verses across {total_pages} pages")
    print("=" * 60)
    
    # Create a file for each page
    for page_num in sorted(pages_data.keys()):
        page_chapters = pages_data[page_num]
        
        # Get juz_number from first verse on page
        first_chapter_id = min(page_chapters.keys())
        juz_number = page_chapters[first_chapter_id][0]['juz_number']
        
        # Build the page structure
        page_structure = {
            "page_number": page_num,
            "juz_number": juz_number,
            "chapters": []
        }
        
        # Process each chapter on this page
        for chapter_id in sorted(page_chapters.keys()):
            chapter_verses_data = page_chapters[chapter_id]
            
            # Get chapter info
            chapter_info = chapter_verses_data[0]['chapter_info']
            
            # Get all verses for this chapter on this page
            verses = [item['verse'] for item in chapter_verses_data]
            
            # Determine if this is the beginning of the surah
            first_verse_number = verses[0].get('verse_number')
            beginning_of_surah = (first_verse_number == 1)
            
            # Build chapter structure
            chapter_structure = {
                "chapter_id": chapter_info['chapter_id'],
                "name_arabic": chapter_info['name_arabic'],
                "name_simple": chapter_info['name_simple'],
                "revelation_place": chapter_info['revelation_place'],
                "verses_count": chapter_info['verses_count'],
                "beginning_of_surah": beginning_of_surah,
                "verses": verses
            }
            
            page_structure['chapters'].append(chapter_structure)
        
        # Create filename: page_1.json, page_2.json, etc.
        filename = f"{page_num}.json"
        filepath = os.path.join(output_folder, filename)
        
        # Write to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(page_structure, f, ensure_ascii=False, indent=2)
        
        # Print progress
        chapters_info = []
        for chapter in page_structure['chapters']:
            chapter_name = chapter['name_simple']
            verse_count = len(chapter['verses'])
            beginning = "START" if chapter['beginning_of_surah'] else "CONT"
            chapters_info.append(f"{chapter_name} ({beginning}, {verse_count}v)")
        
        chapters_str = " + ".join(chapters_info)
        print(f"✓ Page {page_num:3d} (Juz {juz_number:2d}): {chapters_str}")
    
    print("=" * 60)
    print(f"\n✓ Successfully created {total_pages} page files in '{output_folder}/' folder")
    print(f"✓ Files named as: page_1.json, page_2.json, ..., page_{total_pages}.json")

if __name__ == "__main__":
    # Input file (the merged JSON with all chapters)
    input_file = "../data/all_chapters.json"
    
    # Output folder where page files will be saved
    output_folder = "../data/pages"
    
    # Run the split
    split_by_pages(input_file, output_folder)