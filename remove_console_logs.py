#!/usr/bin/env python3
"""
Script to remove console.log statements from JavaScript/TypeScript files
"""

import os
import re
import argparse
from pathlib import Path
from typing import List, Tuple

# File extensions to process
VALID_EXTENSIONS = {'.js', '.jsx', '.ts', '.tsx'}

# Directories to skip
SKIP_DIRS = {'node_modules', '.git', 'dist', 'build', '.next', 'out', '__pycache__'}


def should_process_file(file_path: Path) -> bool:
    """Check if file should be processed"""
    # Check extension
    if file_path.suffix not in VALID_EXTENSIONS:
        return False
    
    # Check if in skip directory
    for part in file_path.parts:
        if part in SKIP_DIRS:
            return False
    
    return True


def remove_console_logs(content: str) -> Tuple[str, int]:
    """
    Remove console.log statements from content
    Returns: (cleaned_content, number_of_removals)
    """
    count = 0
    
    # Pattern 1: Single line console.log
    # Matches: console.log(...);
    pattern1 = r'^\s*console\.log\([^)]*\);?\s*$'
    lines = content.split('\n')
    new_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check for single-line console.log
        if re.match(pattern1, line):
            count += 1
            i += 1
            continue
        
        # Check for multi-line console.log
        if re.search(r'^\s*console\.log\(', line):
            # Find the closing parenthesis
            paren_count = line.count('(') - line.count(')')
            temp_line = line
            j = i
            
            while paren_count > 0 and j < len(lines) - 1:
                j += 1
                temp_line += '\n' + lines[j]
                paren_count += lines[j].count('(') - lines[j].count(')')
            
            # If we found a complete console.log statement
            if paren_count == 0:
                count += 1
                i = j + 1
                continue
        
        new_lines.append(line)
        i += 1
    
    return '\n'.join(new_lines), count


def process_file(file_path: Path, dry_run: bool = False) -> Tuple[bool, int]:
    """
    Process a single file
    Returns: (was_modified, number_of_removals)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        cleaned_content, removals = remove_console_logs(original_content)
        
        if removals > 0:
            if not dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned_content)
            return True, removals
        
        return False, 0
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, 0


def find_files(root_dir: Path) -> List[Path]:
    """Find all JavaScript/TypeScript files in directory"""
    files = []
    
    for root, dirs, filenames in os.walk(root_dir):
        # Remove skip directories from dirs list (modifies in-place)
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        
        for filename in filenames:
            file_path = Path(root) / filename
            if should_process_file(file_path):
                files.append(file_path)
    
    return files


def main():
    parser = argparse.ArgumentParser(
        description='Remove console.log statements from JavaScript/TypeScript files'
    )
    parser.add_argument(
        'directory',
        nargs='?',
        default='.',
        help='Directory to process (default: current directory)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be removed without making changes'
    )
    parser.add_argument(
        '--verbose',
        '-v',
        action='store_true',
        help='Show detailed output for each file'
    )
    
    args = parser.parse_args()
    
    root_dir = Path(args.directory).resolve()
    
    if not root_dir.exists():
        print(f"Error: Directory '{root_dir}' does not exist")
        return 1
    
    print(f"Scanning directory: {root_dir}")
    if args.dry_run:
        print("DRY RUN MODE - No files will be modified\n")
    
    # Find all files
    files = find_files(root_dir)
    print(f"Found {len(files)} JavaScript/TypeScript files\n")
    
    # Process files
    total_removals = 0
    modified_files = []
    
    for file_path in files:
        was_modified, removals = process_file(file_path, args.dry_run)
        
        if was_modified:
            modified_files.append(file_path)
            total_removals += removals
            
            if args.verbose:
                relative_path = file_path.relative_to(root_dir)
                print(f"{'[DRY RUN] ' if args.dry_run else ''}Removed {removals} console.log(s) from: {relative_path}")
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Files scanned: {len(files)}")
    print(f"Files modified: {len(modified_files)}")
    print(f"Total console.log statements removed: {total_removals}")
    
    if args.dry_run and modified_files:
        print("\nRun without --dry-run to apply changes")
    
    if modified_files and args.verbose:
        print("\nModified files:")
        for file_path in modified_files:
            relative_path = file_path.relative_to(root_dir)
            print(f"  - {relative_path}")
    
    return 0


if __name__ == '__main__':
    exit(main())
