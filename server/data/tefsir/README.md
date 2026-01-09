# Tafsir Organization

## Statistics
- Total Chapters: 114
- Unique Content Blocks: 1875
- Total Ayah Mappings: 6210 (missing few? total need to be 6236?)

## Directory Structure
```
./tafsir_organized/
├── chapters/          # Chapter-wise JSON indexes (one file per chapter)
├── content_store/     # Unique HTML content blocks (deduplicated)
├── master_index.json  # Overview and statistics
├── ayah_index.json    # Complete ayah→content mapping
└── README.md          # This file
```

## Usage

### Get content for specific ayah:
```python
import json
from pathlib import Path

def get_ayah_content(chapter, ayah):
    with open('ayah_index.json', 'r', encoding='utf-8') as f:
        index = json.load(f)
    
    key = f"{chapter}:{ayah}"
    if key not in index:
        return None
    
    content_ref = index[key]
    
    # Handle single or multiple content blocks
    refs = [content_ref] if isinstance(content_ref, str) else content_ref
    
    contents = []
    for ref in refs:
        with open(ref, 'r', encoding='utf-8') as f:
            contents.append(f.read())
    
    return '\n\n'.join(contents)

# Example
content = get_ayah_content("5", "3")
print(content)
```
