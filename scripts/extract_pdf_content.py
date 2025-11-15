"""
Extract text and metadata from PDF engineering drawings
"""
import os
import sys
from pathlib import Path

try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

def extract_with_pypdf2(pdf_path):
    """Extract text using PyPDF2"""
    text_content = []
    metadata = {}
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Extract metadata
            if pdf_reader.metadata:
                metadata = {
                    'title': pdf_reader.metadata.get('/Title', ''),
                    'author': pdf_reader.metadata.get('/Author', ''),
                    'subject': pdf_reader.metadata.get('/Subject', ''),
                    'creator': pdf_reader.metadata.get('/Creator', ''),
                    'producer': pdf_reader.metadata.get('/Producer', ''),
                    'creation_date': str(pdf_reader.metadata.get('/CreationDate', '')),
                    'modification_date': str(pdf_reader.metadata.get('/ModDate', ''))
                }
            
            # Extract text from each page
            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    text = page.extract_text()
                    if text.strip():
                        text_content.append(f"--- Page {page_num} ---\n{text}\n")
                except Exception as e:
                    text_content.append(f"--- Page {page_num} ---\n[Error extracting text: {e}]\n")
            
            metadata['total_pages'] = len(pdf_reader.pages)
            
    except Exception as e:
        return None, {'error': str(e)}
    
    return '\n'.join(text_content), metadata

def extract_with_pdfplumber(pdf_path):
    """Extract text using pdfplumber (more accurate)"""
    text_content = []
    metadata = {}
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            metadata['total_pages'] = len(pdf.pages)
            
            # Extract text from each page
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    text = page.extract_text()
                    if text:
                        text_content.append(f"--- Page {page_num} ---\n{text}\n")
                except Exception as e:
                    text_content.append(f"--- Page {page_num} ---\n[Error extracting text: {e}]\n")
            
            # Try to extract metadata
            if hasattr(pdf, 'metadata') and pdf.metadata:
                metadata.update(pdf.metadata)
                
    except Exception as e:
        return None, {'error': str(e)}
    
    return '\n'.join(text_content), metadata

def process_pdf(pdf_path):
    """Process a single PDF file"""
    print(f"\n{'='*80}")
    print(f"Processing: {os.path.basename(pdf_path)}")
    print(f"{'='*80}")
    
    # Try pdfplumber first (more accurate), then PyPDF2
    if HAS_PDFPLUMBER:
        text, metadata = extract_with_pdfplumber(pdf_path)
        method = "pdfplumber"
    elif HAS_PYPDF2:
        text, metadata = extract_with_pypdf2(pdf_path)
        method = "PyPDF2"
    else:
        print("ERROR: No PDF library available. Please install pdfplumber or PyPDF2")
        return None
    
    print(f"Extraction method: {method}")
    print(f"Total pages: {metadata.get('total_pages', 'Unknown')}")
    
    if 'error' in metadata:
        print(f"ERROR: {metadata['error']}")
        return None
    
    # Print metadata
    if metadata:
        print("\nMetadata:")
        for key, value in metadata.items():
            if value and key != 'total_pages':
                print(f"  {key}: {value}")
    
    # Print text summary
    if text:
        text_lines = text.split('\n')
        non_empty_lines = [line for line in text_lines if line.strip()]
        print(f"\nExtracted {len(non_empty_lines)} lines of text")
        print(f"Total characters: {len(text)}")
        
        # Show first 500 characters as preview
        preview = text[:500].replace('\n', ' ')
        print(f"\nText preview (first 500 chars):")
        print(f"  {preview}...")
        
        return {
            'filename': os.path.basename(pdf_path),
            'path': str(pdf_path),
            'text': text,
            'metadata': metadata,
            'method': method
        }
    else:
        print("WARNING: No text extracted (may be image-based PDF)")
        return {
            'filename': os.path.basename(pdf_path),
            'path': str(pdf_path),
            'text': '',
            'metadata': metadata,
            'method': method,
            'warning': 'No text extracted'
        }

def main():
    drawings_dir = r"C:\Users\George\source\repos\fire-protection_data\EngineeringDrawings"
    
    if not os.path.exists(drawings_dir):
        print(f"ERROR: Directory not found: {drawings_dir}")
        sys.exit(1)
    
    # Get all PDF files
    pdf_files = list(Path(drawings_dir).glob("*.pdf"))
    
    if not pdf_files:
        print(f"No PDF files found in {drawings_dir}")
        sys.exit(1)
    
    print(f"Found {len(pdf_files)} PDF file(s)")
    
    # Process each PDF
    results = []
    for pdf_file in sorted(pdf_files):
        result = process_pdf(pdf_file)
        if result:
            results.append(result)
    
    # Summary
    print(f"\n\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Processed {len(results)} out of {len(pdf_files)} PDF files")
    
    # Save results to a text file
    output_file = os.path.join(drawings_dir, "extracted_content_summary.txt")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("ENGINEERING DRAWINGS CONTENT EXTRACTION SUMMARY\n")
        f.write("="*80 + "\n\n")
        
        for result in results:
            f.write(f"\n{'='*80}\n")
            f.write(f"FILE: {result['filename']}\n")
            f.write(f"{'='*80}\n\n")
            f.write(f"Path: {result['path']}\n")
            f.write(f"Extraction Method: {result['method']}\n")
            f.write(f"Total Pages: {result['metadata'].get('total_pages', 'Unknown')}\n")
            
            if result['metadata']:
                f.write("\nMetadata:\n")
                for key, value in result['metadata'].items():
                    if value and key != 'total_pages':
                        f.write(f"  {key}: {value}\n")
            
            if result.get('warning'):
                f.write(f"\nWARNING: {result['warning']}\n")
            
            if result['text']:
                f.write(f"\nExtracted Text:\n")
                f.write("-"*80 + "\n")
                f.write(result['text'])
                f.write("\n" + "-"*80 + "\n")
            else:
                f.write("\nNo text extracted from this PDF.\n")
            
            f.write("\n\n")
    
    print(f"\nSummary saved to: {output_file}")

if __name__ == "__main__":
    main()

