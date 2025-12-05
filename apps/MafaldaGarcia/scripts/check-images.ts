#!/usr/bin/env ts-node

/**
 * Development script to check available images in Firebase Storage
 * Run with: npm run check-images
 */

import { createImageService } from '../src/features/api/firebase';

async function checkImages() {
  console.log('🔍 Checking Firebase Storage for available images...\n');

  try {
    const imageService = createImageService();
    
    // Define the image paths that we need for the Mafalda Garcia site
    const requiredImagePaths = [
      'hero.jpg',
      'canvas.jpg',
      'connecting-souls.jpg',
      'yus-esate.jpg',
      'lines-of-separation.jpg',
      'collaborative-movement.jpg',
      'borderline-manifesto.jpg',
      'freedom-manifesto.jpg',
      'publication1.jpg',
      'publication2.jpg',
      'gallery1.jpg',
      'gallery2.jpg',
      'gallery3.jpg',
      'gallery4.jpg',
      'gallery5.jpg',
      'gallery6.jpg'
    ];

    // Get all available images from Firebase Storage
    const availableImages = await imageService.getAvailableImages('');
    
    console.log('📊 IMAGE STATUS REPORT');
    console.log('======================\n');
    
    console.log(`📁 Total images in Firebase Storage: ${availableImages.length}`);
    console.log(`📋 Required images for website: ${requiredImagePaths.length}\n`);
    
    // Check each required image
    console.log('🔍 CHECKING REQUIRED IMAGES:');
    console.log('============================');
    
    const missingImages: string[] = [];
    const foundImages: string[] = [];
    
    requiredImagePaths.forEach((path, index) => {
      const isAvailable = availableImages.includes(path);
      const status = isAvailable ? '✅' : '❌';
      const number = (index + 1).toString().padStart(2, '0');
      
      console.log(`${number}. ${status} ${path}`);
      
      if (isAvailable) {
        foundImages.push(path);
      } else {
        missingImages.push(path);
      }
    });
    
    console.log('\n📈 SUMMARY:');
    console.log('===========');
    console.log(`✅ Found: ${foundImages.length} images`);
    console.log(`❌ Missing: ${missingImages.length} images`);
    console.log(`📊 Coverage: ${Math.round((foundImages.length / requiredImagePaths.length) * 100)}%\n`);
    
    if (missingImages.length > 0) {
      console.log('📝 MISSING IMAGES TO UPLOAD:');
      console.log('============================');
      missingImages.forEach((image, index) => {
        console.log(`${index + 1}. ${image}`);
      });
      console.log('');
    }
    
    if (availableImages.length > requiredImagePaths.length) {
      console.log('🔍 EXTRA IMAGES IN STORAGE:');
      console.log('===========================');
      const extraImages = availableImages.filter(img => !requiredImagePaths.includes(img));
      extraImages.forEach((image, index) => {
        console.log(`${index + 1}. ${image}`);
      });
      console.log('');
    }
    
    // Test getting URLs for available images
    if (foundImages.length > 0) {
      console.log('🔗 TESTING IMAGE URLS:');
      console.log('======================');
      try {
        const imageUrls = await imageService.getImageUrlsWithPlaceholders(foundImages);
        console.log('✅ Successfully generated URLs for available images');
        
        // Show first few URLs as examples
        const sampleUrls = Object.entries(imageUrls).slice(0, 3);
        sampleUrls.forEach(([path, url]) => {
          console.log(`   ${path}: ${url.substring(0, 80)}...`);
        });
        if (foundImages.length > 3) {
          console.log(`   ... and ${foundImages.length - 3} more`);
        }
      } catch (error) {
        console.log('❌ Error generating image URLs:', error instanceof Error ? error.message : String(error));
      }
    }
    
    console.log('\n✨ Check complete!');
    
  } catch (error) {
    console.error('❌ Error checking images:', error instanceof Error ? error.message : String(error));
    console.error('Make sure your Firebase configuration is correct.');
    process.exit(1);
  }
}

// Run the script
checkImages();
