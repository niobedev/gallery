const MIME_TYPES: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mov': 'video/quicktime',
  'avi': 'video/x-msvideo'
};

export async function decodeFile(filename: string, type: 'pictures' | 'videos'): Promise<Blob> {
  const response = await fetch(`encoded/${type}/${filename}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${filename}`);
  }

  const fileContent = await response.text();

  // Remove all newlines to handle multi-line base64 content
  const normalizedContent = fileContent.replace(/\n/g, '');

  const parts = normalizedContent.split('METADATA:');

  if (parts.length !== 2) {
    throw new Error(`Invalid .enc file format: ${filename}`);
  }

  const base64Content = parts[0];
  const metadata = JSON.parse(parts[1].trim());
  const ext = metadata.originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  return MIME_TYPES[ext] || 'application/octet-stream';
}