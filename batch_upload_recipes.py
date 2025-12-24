#!/usr/bin/env python3
"""
Batch upload script to create resources from markdown and text files.
Reads all .md and .txt files from the recipes folder and uploads them to the vector database.
usage: python batch_upload_recipes.py <recipes_folder> <api_url>
"""

import os
import json
import requests
from pathlib import Path
from typing import List, Dict

# Configuration
RECIPES_FOLDER = r"C:\Repos\Recipes\recipes"
API_URL = "http://localhost:3000/api/resources"

def read_text_file(file_path: Path) -> str:
    """Read the content of a text or markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

def create_resource(content: str, chunkingStrategy: str = "none") -> Dict:
    """Create a resource by calling the API endpoint."""
    try:
        response = requests.post(
            API_URL,
            json={"content": content, "chunkingStrategy": chunkingStrategy},
            headers={"Content-Type": "application/json"},
            timeout=60  # 60 second timeout for embedding generation
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return None

def get_text_files(folder_path: str) -> List[Path]:
    """Get all .md and .txt files from the specified folder."""
    folder = Path(folder_path)
    if not folder.exists():
        print(f"Error: Folder {folder_path} does not exist!")
        return []
    
    md_files = list(folder.glob("*.md"))
    txt_files = list(folder.glob("*.txt"))
    all_files = md_files + txt_files
    return sorted(all_files)

def main():
    """Main function to process all markdown and text files."""
    print(f"Scanning for .md and .txt files in: {RECIPES_FOLDER}")
    text_files = get_text_files(RECIPES_FOLDER)
    
    if not text_files:
        print("No .md or .txt files found in the recipes folder.")
        return
    
    print(f"Found {len(text_files)} file(s)")
    print("-" * 60)
    
    successful = 0
    failed = 0
    
    for i, file_path in enumerate(text_files, 1):
        print(f"\n[{i}/{len(text_files)}] Processing: {file_path.name}")
        
        # Determine chunking strategy based on file extension
        file_ext = file_path.suffix.lower()
        if file_ext == '.md':
            chunking_strategy = "#"
        elif file_ext == '.txt':
            chunking_strategy = "."
        else:
            chunking_strategy = "none"
        
        # Read file content
        content = read_text_file(file_path)
        if content is None:
            print(f"  ❌ Failed to read file")
            failed += 1
            continue
        
        if not content.strip():
            print(f"  ⚠️  File is empty, skipping")
            continue
        
        print(f"  📄 Content length: {len(content)} characters")
        print(f"  🔧 Chunking strategy: {chunking_strategy}")
        
        # Create resource via API
        result = create_resource(content, chunkingStrategy=chunking_strategy)
        
        if result and result.get("success"):
            print(f"  ✅ Success: {result.get('message', 'Resource created')}")
            successful += 1
        else:
            error_msg = result.get("error", "Unknown error") if result else "Request failed"
            print(f"  ❌ Failed: {error_msg}")
            failed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("BATCH UPLOAD SUMMARY")
    print("=" * 60)
    print(f"Total files processed: {len(text_files)}")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print("=" * 60)

if __name__ == "__main__":
    main()

