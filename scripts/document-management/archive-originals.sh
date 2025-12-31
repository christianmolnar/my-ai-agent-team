#!/bin/bash
# Archive Original Arizona Documents
# Project: Quality Assurance Document Lifecycle Management

set -e

ARIZONA_REPO="/Users/christian/Repos/my-personal-assistant-private/areas/business/investments/real-estate/arizona-move"
PHASE_1_DIR="AI-Agent-Team-Document-Library/implementation-documents/arizona-analysis/phase-1-original"
PHASE_2_DIR="AI-Agent-Team-Document-Library/implementation-documents/arizona-analysis/phase-2-reviewed"

echo "📦 Archiving Original Arizona Documents..."

# Create organized subdirectories in phase-1-original
mkdir -p "$PHASE_1_DIR/rentals"
mkdir -p "$PHASE_1_DIR/primary-residences"
mkdir -p "$PHASE_1_DIR/master-documents"

# Create corresponding subdirectories in phase-2-reviewed  
mkdir -p "$PHASE_2_DIR/rentals"
mkdir -p "$PHASE_2_DIR/primary-residences"
mkdir -p "$PHASE_2_DIR/master-documents"

echo "🏠 Processing rental property analyses..."
# Copy rental analyses (R02-R13 and summaries)
find "$ARIZONA_REPO/rentals" -name "*.md" | while read file; do
    filename=$(basename "$file")
    echo "   📄 Archiving: $filename"
    cp "$file" "$PHASE_1_DIR/rentals/$filename"
    cp "$file" "$PHASE_2_DIR/rentals/$filename"
done

echo "🏡 Processing primary residence analyses..."  
# Copy primary residence analyses from all area subdirectories
for area_dir in "$ARIZONA_REPO/home"/*; do
    if [ -d "$area_dir" ]; then
        area_name=$(basename "$area_dir")
        if [ "$area_name" != "PDFs" ]; then
            mkdir -p "$PHASE_1_DIR/primary-residences/$area_name"
            mkdir -p "$PHASE_2_DIR/primary-residences/$area_name"
            
            find "$area_dir" -name "*.md" | while read file; do
                filename=$(basename "$file")
                echo "   📄 Archiving [$area_name]: $filename"
                cp "$file" "$PHASE_1_DIR/primary-residences/$area_name/$filename"
                cp "$file" "$PHASE_2_DIR/primary-residences/$area_name/$filename"
            done
        fi
    fi
done

echo "📋 Processing master documents..."
# Copy master documents from root
find "$ARIZONA_REPO" -maxdepth 1 -name "*.md" | while read file; do
    filename=$(basename "$file")
    echo "   📄 Archiving: $filename"
    cp "$file" "$PHASE_1_DIR/master-documents/$filename"
    cp "$file" "$PHASE_2_DIR/master-documents/$filename"
done

# Count archived documents
RENTAL_ARCHIVED=$(find "$PHASE_1_DIR/rentals" -name "*.md" | wc -l | xargs)
PRIMARY_ARCHIVED=$(find "$PHASE_1_DIR/primary-residences" -name "*.md" | wc -l | xargs)  
MASTER_ARCHIVED=$(find "$PHASE_1_DIR/master-documents" -name "*.md" | wc -l | xargs)
TOTAL_ARCHIVED=$((RENTAL_ARCHIVED + PRIMARY_ARCHIVED + MASTER_ARCHIVED))

echo ""
echo "✅ Document archival complete:"
echo "   📂 Rental Analyses: $RENTAL_ARCHIVED documents"
echo "   📂 Primary Residences: $PRIMARY_ARCHIVED documents"  
echo "   📂 Master Documents: $MASTER_ARCHIVED documents"
echo "   📊 Total Archived: $TOTAL_ARCHIVED documents"
echo ""
echo "📁 Documents preserved in: $PHASE_1_DIR"
echo "📁 Working copies ready in: $PHASE_2_DIR"
echo ""
echo "🚀 Ready to begin quality review process"
