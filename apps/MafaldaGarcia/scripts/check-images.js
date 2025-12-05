#!/usr/bin/env node

/**
 * Development script to check what images exist in Firebase Storage
 * Run with: npm run check-images
 * 
 * This script scans the Firebase Storage bucket and shows what images are actually there.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkImages() {
  console.log('🔍 Scanning Firebase Storage bucket for images...\n');

  try {
    console.log('📡 Calling API endpoint...');
    
    // Call the API endpoint to get image information
    const response = await fetch('http://localhost:3000/api/images');
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API response received');
    
    console.log('📊 FIREBASE STORAGE BUCKET SCAN');
    console.log('================================\n');
    
    // Show all available images in the bucket
    if (data.availableImages && data.availableImages.length > 0) {
      console.log(`📁 Found ${data.availableImages.length} images in Firebase Storage:\n`);
      
      data.availableImages.forEach((image, index) => {
        const number = (index + 1).toString().padStart(2, '0');
        console.log(`${number}. 📷 ${image}`);
      });
      
      console.log('\n🔗 IMAGE URLS:');
      console.log('==============');
      
      // Show URLs for the first few images
      const sampleImages = data.availableImages.slice(0, 5);
      sampleImages.forEach((image) => {
        const url = data.images[image];
        if (url) {
          console.log(`📷 ${image}:`);
          console.log(`   ${url.substring(0, 100)}...`);
          console.log('');
        }
      });
      
      if (data.availableImages.length > 5) {
        console.log(`... and ${data.availableImages.length - 5} more images`);
        console.log('');
      }
      
    } else {
      console.log('📭 No images found in Firebase Storage bucket');
      console.log('');
      console.log('💡 To add images:');
      console.log('   1. Upload images to your Firebase Storage bucket root');
      console.log('   2. Run this script again to see them');
      console.log('');
    }
    
    // Show metadata if available
    if (data.metadata) {
      console.log('📋 IMAGE METADATA:');
      console.log('==================');
      
      const availableImages = Object.entries(data.metadata).filter(([_, meta]) => meta.available);
      
      if (availableImages.length > 0) {
        availableImages.forEach(([path, meta]) => {
          console.log(`📷 ${path}:`);
          console.log(`   Available: ${meta.available ? '✅ Yes' : '❌ No'}`);
          if (meta.size) console.log(`   Size: ${meta.size} bytes`);
          if (meta.lastModified) console.log(`   Modified: ${meta.lastModified}`);
          console.log('');
        });
      }
    }
    
    console.log('✨ Scan complete!');
    
  } catch (error) {
    console.error('❌ Error scanning images:', error.message);
    console.error('Make sure your development server is running (npm run dev)');
    console.error('and the API endpoint is available at http://localhost:3000/api/images');
    process.exit(1);
  }
}

// Run the script directly
console.log('🚀 Starting Firebase Storage bucket scan...');
checkImages().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
