#!/bin/bash
# Catalog Arizona Repository Documents
# Project: Quality Assurance Document Lifecycle Management

set -e

ARIZONA_REPO="/Users/christian/Repos/my-personal-assistant-private/areas/business/investments/real-estate/arizona-move"
CATALOG_FILE="AI-Agent-Team-Document-Library/implementation-documents/document-management/ARIZONA-DOCUMENT-CATALOG.md"

echo "🔍 Cataloging Arizona Repository Documents..."

cat > "$CATALOG_FILE" << EOF
# Arizona Repository Document Catalog
**Generated:** $(date)
**Source:** $ARIZONA_REPO
**Purpose:** Complete inventory for quality review process

## 📊 **Document Inventory Summary**

EOF

# Count documents
RENTAL_COUNT=$(find "$ARIZONA_REPO/rentals" -name "R*.md" | wc -l | xargs)
PRIMARY_COUNT=$(find "$ARIZONA_REPO/home" -name "*.md" | wc -l | xargs)
MASTER_COUNT=$(find "$ARIZONA_REPO" -maxdepth 1 -name "MASTER*.md" | wc -l | xargs)

cat >> "$CATALOG_FILE" << EOF
- **Rental Property Analyses**: $RENTAL_COUNT documents (R02-R13)
- **Primary Residence Analyses**: $PRIMARY_COUNT documents (area analyses)
- **Master Documents**: $MASTER_COUNT documents (INDEX, PROPERTIES-LIST)
- **Total Documents**: $((RENTAL_COUNT + PRIMARY_COUNT + MASTER_COUNT)) for quality review

---

## 📁 **Rental Property Analyses**

EOF

echo "### Documents Found:" >> "$CATALOG_FILE"
find "$ARIZONA_REPO/rentals" -name "R*.md" | sort | while read file; do
    filename=$(basename "$file")
    echo "- **$filename**: $file" >> "$CATALOG_FILE"
done

cat >> "$CATALOG_FILE" << EOF

---

## 🏠 **Primary Residence Area Analyses**

EOF

# Catalog home area directories
for area_dir in "$ARIZONA_REPO/home"/*; do
    if [ -d "$area_dir" ]; then
        area_name=$(basename "$area_dir")
        if [ "$area_name" != "PDFs" ] && [ "$area_name" != "other-areas" ]; then
            echo "### $area_name Analysis" >> "$CATALOG_FILE"
            find "$area_dir" -name "*.md" | sort | while read file; do
                filename=$(basename "$file")
                echo "- **$filename**: $file" >> "$CATALOG_FILE"
            done
            echo "" >> "$CATALOG_FILE"
        fi
    fi
done

cat >> "$CATALOG_FILE" << EOF

---

## 📋 **Master Documents**

EOF

find "$ARIZONA_REPO" -maxdepth 1 -name "*.md" | sort | while read file; do
    filename=$(basename "$file")
    echo "- **$filename**: $file" >> "$CATALOG_FILE"
done

cat >> "$CATALOG_FILE" << EOF

---

## 🎯 **Quality Review Readiness**

### **Documents Ready for Processing**
- [x] **Rental Analyses**: All R02-R13 properties identified
- [x] **Primary Residences**: All area analyses located  
- [x] **Master Documents**: INDEX and summary files cataloged
- [x] **File Paths**: Complete paths documented for automated processing

### **Next Actions**
1. **Archive Originals**: Preserve current versions in phase-1-original/
2. **Create Working Copies**: Copy to phase-2-reviewed/ for quality processing
3. **Begin Quality Review**: Apply two-model review system to each document
4. **Track Progress**: Update manifest as documents are processed

---

**Catalog Complete - Ready for Quality Review Process**
EOF

echo "✅ Arizona document catalog created:"
echo "   📄 $CATALOG_FILE"
echo "   📊 Found: $RENTAL_COUNT rental analyses, $PRIMARY_COUNT primary residence analyses, $MASTER_COUNT master documents"
echo ""
echo "🚀 Ready to begin document archival and quality review process"
