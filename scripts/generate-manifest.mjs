#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENCODED_DIR = path.join(__dirname, '../public/encoded');
const MANIFEST_PATH = path.join(__dirname, '../manifest.json');

function parseEncFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const parts = fileContent.split('METADATA:');
  
  if (parts.length !== 2) {
    throw new Error(`Invalid .enc file format: ${filePath}`);
  }
  
  const metadata = JSON.parse(parts[1].trim());
  const filename = path.basename(filePath);
  
  return {
    content: parts[0],
    metadata: {
      ...metadata,
      filename,
      id: ''
    }
  };
}

function scanDirectory(dirPath, type) {
  const result = {};
  
  if (!fs.existsSync(dirPath)) {
    return result;
  }
  
  const monthDirs = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const monthDir of monthDirs) {
    if (!monthDir.isDirectory()) continue;
    
    const monthPath = path.join(dirPath, monthDir.name);
    const files = fs.readdirSync(monthPath);
    
    const mediaFiles = [];
    
    for (const file of files) {
      if (!file.endsWith('.enc')) continue;
      
      const filePath = path.join(monthPath, file);
      const { metadata } = parseEncFile(filePath);
      
      if (metadata.filename.endsWith('-thumb.enc')) continue;
      
      const thumbPath = path.join(monthPath, metadata.filename.replace('.enc', '-thumb.enc'));
      if (fs.existsSync(thumbPath)) {
        metadata.thumbnail = path.basename(thumbPath);
      }
      
      mediaFiles.push(metadata);
    }
    
    if (mediaFiles.length > 0) {
      result[monthDir.name] = mediaFiles.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
  }
  
  return result;
}

function generateId(type, month, index) {
  const num = String(index + 1).padStart(3, '0');
  return `${type.charAt(0)}-${month}-${num}`;
}

function assignIds(files, type, month) {
  const typeChar = type === 'videos' ? 'v' : 'p';
  files.forEach((file, index) => {
    file.id = generateId(typeChar, month, index);
  });
}

function generateManifest() {
  const videosDir = path.join(ENCODED_DIR, 'videos');
  const picturesDir = path.join(ENCODED_DIR, 'pictures');
  
  const videos = scanDirectory(videosDir, 'videos');
  const pictures = scanDirectory(picturesDir, 'pictures');
  
  Object.keys(videos).forEach(month => {
    assignIds(videos[month], 'videos', month);
  });
  
  Object.keys(pictures).forEach(month => {
    assignIds(pictures[month], 'pictures', month);
  });
  
  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    videos,
    pictures
  };
}

function main() {
  try {
    console.log('Generating manifest.json...');
    const manifest = generateManifest();
    
    const manifestContent = JSON.stringify(manifest, null, 2);
    fs.writeFileSync(MANIFEST_PATH, manifestContent, 'utf-8');
    
    const totalVideos = Object.values(manifest.videos).reduce((sum, files) => sum + files.length, 0);
    const totalPictures = Object.values(manifest.pictures).reduce((sum, files) => sum + files.length, 0);
    
    console.log('Manifest generated successfully!');
    console.log(`- Videos: ${totalVideos} files in ${Object.keys(manifest.videos).length} months`);
    console.log(`- Pictures: ${totalPictures} files in ${Object.keys(manifest.pictures).length} months`);
    console.log(`- Manifest saved to: ${MANIFEST_PATH}`);
  } catch (error) {
    console.error('Error generating manifest:', error);
    process.exit(1);
  }
}

main();