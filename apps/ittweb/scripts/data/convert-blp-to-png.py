#!/usr/bin/env python3
"""
Convert BLP files from ReplaceableTextures to PNG files in itt icons folder

This script converts missing icons from .blp format to .png format
and copies them to the itt icons folder with lowercase names.

Usage: python scripts/data/convert-blp-to-png.py

Requires: pip install pillow-blp
"""

import os
import sys
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent.parent
# island-troll-tribes is a sibling of websites repo
ISLAND_TROLL_TRIBES_DIR = ROOT_DIR.parent.parent.parent / 'island-troll-tribes'
REPLACEABLE_TEXTURES_DIR = ISLAND_TROLL_TRIBES_DIR / 'imports' / 'ReplaceableTextures'
COMMAND_BUTTONS_DIR = REPLACEABLE_TEXTURES_DIR / 'CommandButtons'
COMMAND_BUTTONS_DISABLED_DIR = REPLACEABLE_TEXTURES_DIR / 'CommandButtonsDisabled'
ITT_ICONS_DIR = ROOT_DIR / 'public' / 'icons' / 'itt'

# Missing icons to convert (target PNG name -> source BLP name)
MISSING_ICONS = [
    {'target': 'btnmammothboots.png', 'source': 'BTNMammothBoots.blp', 'dir': 'CommandButtons'},
    {'target': 'disbtnfeedpet.png', 'source': 'DISBTNFeedPet.blp', 'dir': 'CommandButtons'},
    # Note: btncripple.png doesn't seem to exist in the game files
]

def check_pillow_blp():
    """Check if pillow-blp is available"""
    try:
        from PIL import Image
        import blp
        return True
    except ImportError:
        print('❌ pillow-blp package not found!')
        print('   Install it with: pip install pillow-blp')
        return False

def convert_blp_to_png(blp_path, png_path):
    """Convert BLP file to PNG"""
    try:
        from PIL import Image
        import blp
        
        # Open BLP file
        with open(blp_path, 'rb') as f:
            blp_image = blp.BlpImage(f)
        
        # Convert to PIL Image
        image = blp_image.to_pil()
        
        # Save as PNG
        image.save(png_path, 'PNG')
        return True
    except Exception as e:
        print(f'  ❌ Error converting {os.path.basename(blp_path)}: {e}')
        return False

def main():
    print('🔄 Converting BLP files to PNG...\n')
    
    # Check if pillow-blp is available
    if not check_pillow_blp():
        sys.exit(1)
    
    # Check directories
    if not COMMAND_BUTTONS_DIR.exists():
        print(f'❌ CommandButtons directory not found: {COMMAND_BUTTONS_DIR}')
        sys.exit(1)
    
    if not ITT_ICONS_DIR.exists():
        print(f'❌ ITT icons directory not found: {ITT_ICONS_DIR}')
        sys.exit(1)
    
    converted = 0
    skipped = 0
    not_found = 0
    
    print('📋 Processing missing icons...\n')
    
    for icon in MISSING_ICONS:
        source_dir = COMMAND_BUTTONS_DIR if icon['dir'] == 'CommandButtons' else COMMAND_BUTTONS_DISABLED_DIR
        source_path = source_dir / icon['source']
        dest_path = ITT_ICONS_DIR / icon['target']
        
        # Check if already exists
        if dest_path.exists():
            print(f'⏭️  Skipped: {icon["target"]} (already exists)')
            skipped += 1
            continue
        
        # Check if source exists
        if not source_path.exists():
            print(f'❌ Not found: {icon["source"]}')
            not_found += 1
            continue
        
        # Convert
        print(f'🔄 Converting: {icon["source"]} -> {icon["target"]}')
        success = convert_blp_to_png(source_path, dest_path)
        
        if success:
            print(f'  ✅ Converted successfully')
            converted += 1
        else:
            not_found += 1
    
    print('\n' + '=' * 50)
    print('📊 Summary:')
    print(f'  ✅ Converted: {converted}')
    print(f'  ⏭️  Skipped: {skipped}')
    print(f'  ❌ Not found/Failed: {not_found}')
    print('=' * 50)
    
    if converted > 0:
        print(f'\n✅ Successfully converted {converted} icons!')

if __name__ == '__main__':
    main()

