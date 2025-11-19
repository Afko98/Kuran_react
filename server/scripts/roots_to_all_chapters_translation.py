import json

def transfer_translations(chapters_file, roots_file, output_file):
    """
    Transfer translation_bh from roots.json to template_full_chapters.json
    by matching text_uthmani with text fields.
    """
    
    # Load both JSON files
    print("Loading JSON files...")
    with open(chapters_file, 'r', encoding='utf-8') as f:
        chapters_data = json.load(f)
    
    with open(roots_file, 'r', encoding='utf-8') as f:
        roots_data = json.load(f)
    
    # Create a lookup dictionary from roots.json
    # Key: text field, Value: translation_bh
    print("Building translation lookup dictionary...")
    translation_lookup = {}
    
    for root_key, root_info in roots_data.get('roots', {}).items():
        for word in root_info.get('words', []):
            text = word.get('text', '')
            translation_bh = word.get('translation_bh', '')
            
            # Store the translation (overwrite if duplicate, keeping last occurrence)
            if text and translation_bh:
                translation_lookup[text] = translation_bh
    
    print(f"Found {len(translation_lookup)} translations in roots.json")
    
    # Update chapters data
    print("Updating chapters with translations...")
    matches_found = 0
    total_words = 0
    
    for chapter in chapters_data.get('chapters', []):
        for verse in chapter.get('verses', []):
            for word in verse.get('words', []):
                total_words += 1
                text_uthmani = word.get('text_uthmani', '')
                
                # Look up translation
                if text_uthmani in translation_lookup:
                    word['translation_bh'] = translation_lookup[text_uthmani]
                    matches_found += 1
    
    print(f"\nStatistics:")
    print(f"Total words processed: {total_words}")
    print(f"Matches found: {matches_found}")
    print(f"Match rate: {(matches_found/total_words*100):.2f}%")
    
    # Save updated data
    print(f"\nSaving to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(chapters_data, f, ensure_ascii=False, indent=2)
    
    print("Done!")

if __name__ == "__main__":
    # File paths
    chapters_file = "../templates/template_full_chapters.json"
    roots_file = "../data/roots/roots_one_file/roots.json"
    output_file = "../data/all_chapters.json"
    
    # Run the transfer
    transfer_translations(chapters_file, roots_file, output_file)
