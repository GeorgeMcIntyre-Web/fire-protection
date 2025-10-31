/**
 * Native Share API Utilities
 * Provides native sharing capabilities for mobile devices
 */

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Check if Web Share API is available
 */
export function isShareAvailable(): boolean {
  return 'share' in navigator;
}

/**
 * Check if file sharing is supported
 */
export function isFileShareAvailable(): boolean {
  return isShareAvailable() && navigator.canShare !== undefined;
}

/**
 * Share content using native share dialog
 */
export async function share(data: ShareData): Promise<boolean> {
  if (!isShareAvailable()) {
    console.warn('Web Share API is not supported');
    return false;
  }

  try {
    // Check if we can share files
    if (data.files && data.files.length > 0) {
      if (!navigator.canShare || !navigator.canShare({ files: data.files })) {
        console.warn('File sharing is not supported');
        // Try sharing without files
        const { files, ...restData } = data;
        await navigator.share(restData);
        return true;
      }
    }

    await navigator.share(data);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name === 'AbortError') {
      console.log('Share was cancelled');
      return false;
    }
    console.error('Share failed:', error);
    return false;
  }
}

/**
 * Share a URL
 */
export async function shareUrl(url: string, title?: string, text?: string): Promise<boolean> {
  return share({ url, title, text });
}

/**
 * Share text content
 */
export async function shareText(text: string, title?: string): Promise<boolean> {
  return share({ text, title });
}

/**
 * Share file(s)
 */
export async function shareFiles(files: File[], title?: string, text?: string): Promise<boolean> {
  return share({ files, title, text });
}

/**
 * Share project details
 */
export async function shareProject(project: {
  name: string;
  description?: string;
  id: string;
}): Promise<boolean> {
  const url = `${window.location.origin}/projects/${project.id}`;
  const text = project.description || `Check out this project: ${project.name}`;
  
  return share({
    title: project.name,
    text,
    url,
  });
}

/**
 * Share document
 */
export async function shareDocument(document: {
  name: string;
  url?: string;
  file?: File;
}): Promise<boolean> {
  if (document.file) {
    return shareFiles([document.file], document.name);
  } else if (document.url) {
    return shareUrl(document.url, document.name);
  }
  return false;
}

/**
 * Share report or data export
 */
export async function shareReport(
  reportName: string,
  data: Blob,
  filename: string
): Promise<boolean> {
  const file = new File([data], filename, { type: data.type });
  return shareFiles([file], reportName);
}

/**
 * Fallback share using clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    
    // Fallback method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Share with fallback to clipboard
 */
export async function shareWithFallback(data: ShareData): Promise<{
  success: boolean;
  method: 'share' | 'clipboard' | 'none';
}> {
  // Try native share first
  if (isShareAvailable()) {
    const success = await share(data);
    if (success) {
      return { success: true, method: 'share' };
    }
  }

  // Fallback to clipboard
  const textToShare = [data.title, data.text, data.url].filter(Boolean).join('\n\n');
  
  if (textToShare) {
    const success = await copyToClipboard(textToShare);
    return { 
      success, 
      method: success ? 'clipboard' : 'none' 
    };
  }

  return { success: false, method: 'none' };
}

/**
 * Get share capabilities
 */
export function getShareCapabilities(): {
  canShare: boolean;
  canShareFiles: boolean;
  canCopyToClipboard: boolean;
} {
  return {
    canShare: isShareAvailable(),
    canShareFiles: isFileShareAvailable(),
    canCopyToClipboard: 'clipboard' in navigator,
  };
}
