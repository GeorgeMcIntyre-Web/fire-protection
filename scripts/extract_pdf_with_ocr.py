"""
Extract text from PDF engineering drawings using OCR
This handles image-based PDFs that don't have extractable text
"""
import os
import sys
from pathlib import Path

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    from PIL import Image
    import pytesseract
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

try:
    import pdf2image
    HAS_PDF2IMAGE = True
except ImportError:
    HAS_PDF2IMAGE = False

def extract_text_with_ocr(pdf_path):
    """Extract text using OCR from image-based PDFs"""
    if not HAS_OCR or not HAS_PDF2IMAGE:
        return None, {'error': 'OCR libraries not available. Install: pip install pytesseract pdf2image pillow'}
    
    text_content = []
    metadata = {}
    
    try:
        # Convert PDF pages to images
        images = pdf2image.convert_from_path(pdf_path, dpi=300)
        metadata['total_pages'] = len(images)
        
        print(f"  Converting {len(images)} page(s) to images for OCR...")
        
        # Perform OCR on each page
        for page_num, image in enumerate(images, 1):
            try:
                print(f"  Processing page {page_num} with OCR...")
                text = pytesseract.image_to_string(image, lang='eng')
                if text.strip():
                    text_content.append(f"--- Page {page_num} ---\n{text}\n")
            except Exception as e:
                text_content.append(f"--- Page {page_num} ---\n[OCR Error: {e}]\n")
                
    except Exception as e:
        return None, {'error': str(e)}
    
    return '\n'.join(text_content), metadata

def extract_tables_and_annotations(pdf_path):
    """Try to extract tables and annotations from PDF"""
    if not HAS_PDFPLUMBER:
        return None
    
    tables_content = []
    metadata = {}
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            metadata['total_pages'] = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages, 1):
                # Try to extract tables
                tables = page.extract_tables()
                if tables:
                    for table_num, table in enumerate(tables, 1):
                        tables_content.append(f"\n--- Page {page_num}, Table {table_num} ---\n")
                        for row in table:
                            if row:
                                tables_content.append(" | ".join([str(cell) if cell else "" for cell in row]))
                        tables_content.append("\n")
                
                # Try to extract annotations/forms
                if hasattr(page, 'annots') and page.annots:
                    tables_content.append(f"\n--- Page {page_num} Annotations ---\n")
                    for annot in page.annots:
                        tables_content.append(str(annot))
                    tables_content.append("\n")
                    
    except Exception as e:
        return None, {'error': str(e)}
    
    return '\n'.join(tables_content), metadata

def process_pdf_advanced(pdf_path):
    """Process a PDF with advanced extraction methods"""
    print(f"\n{'='*80}")
    print(f"Processing: {os.path.basename(pdf_path)}")
    print(f"{'='*80}")
    
    results = {
        'filename': os.path.basename(pdf_path),
        'path': str(pdf_path),
        'text': '',
        'tables': '',
        'metadata': {},
        'methods_used': []
    }
    
    # Try to extract tables first (faster)
    if HAS_PDFPLUMBER:
        print("  Attempting table/annotation extraction...")
        tables, meta = extract_tables_and_annotations(pdf_path)
        if tables:
            results['tables'] = tables
            results['methods_used'].append('table_extraction')
            print(f"  ✓ Extracted tables/annotations")
        if meta:
            results['metadata'].update(meta)
    
    # Try OCR if no text was found
    if not results['text'] and HAS_OCR and HAS_PDF2IMAGE:
        print("  Attempting OCR extraction...")
        text, meta = extract_text_with_ocr(pdf_path)
        if text:
            results['text'] = text
            results['methods_used'].append('OCR')
            print(f"  ✓ Extracted text via OCR")
        if meta:
            results['metadata'].update(meta)
    
    if not results['text'] and not results['tables']:
        print("  ⚠ No extractable content found")
        results['warning'] = 'No extractable content'
    
    return results

def main():
    drawings_dir = r"C:\Users\George\source\repos\fire-protection_data\EngineeringDrawings"
    
    if not os.path.exists(drawings_dir):
        print(f"ERROR: Directory not found: {drawings_dir}")
        sys.exit(1)
    
    # Check for required libraries
    if not HAS_OCR:
        print("WARNING: OCR libraries not available.")
        print("For full text extraction from image-based PDFs, install:")
        print("  pip install pytesseract pdf2image pillow")
        print("  Also install Tesseract OCR: https://github.com/tesseract-ocr/tesseract")
        print("\nContinuing with table extraction only...\n")
    
    # Get all PDF files
    pdf_files = list(Path(drawings_dir).glob("*.pdf"))
    
    if not pdf_files:
        print(f"No PDF files found in {drawings_dir}")
        sys.exit(1)
    
    print(f"Found {len(pdf_files)} PDF file(s)")
    
    # Process each PDF
    results = []
    for pdf_file in sorted(pdf_files):
        result = process_pdf_advanced(pdf_file)
        if result:
            results.append(result)
    
    # Summary
    print(f"\n\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Processed {len(results)} out of {len(pdf_files)} PDF files")
    
    # Save results
    output_file = os.path.join(drawings_dir, "extracted_content_advanced.txt")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("ENGINEERING DRAWINGS CONTENT EXTRACTION (ADVANCED)\n")
        f.write("="*80 + "\n\n")
        
        for result in results:
            f.write(f"\n{'='*80}\n")
            f.write(f"FILE: {result['filename']}\n")
            f.write(f"{'='*80}\n\n")
            f.write(f"Path: {result['path']}\n")
            f.write(f"Methods Used: {', '.join(result['methods_used']) if result['methods_used'] else 'None'}\n")
            f.write(f"Total Pages: {result['metadata'].get('total_pages', 'Unknown')}\n")
            
            if result.get('warning'):
                f.write(f"\nWARNING: {result['warning']}\n")
            
            if result['tables']:
                f.write(f"\nExtracted Tables/Annotations:\n")
                f.write("-"*80 + "\n")
                f.write(result['tables'])
                f.write("\n" + "-"*80 + "\n")
            
            if result['text']:
                f.write(f"\nExtracted Text (OCR):\n")
                f.write("-"*80 + "\n")
                f.write(result['text'])
                f.write("\n" + "-"*80 + "\n")
            
            f.write("\n\n")
    
    print(f"\nAdvanced extraction summary saved to: {output_file}")

if __name__ == "__main__":
    main()

