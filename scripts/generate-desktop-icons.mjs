import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, '..');
const svgPath = resolve(projectRoot, 'assets/logo/icon.svg');
const outputDir = resolve(projectRoot, 'assets/logo');

// Icon sizes for Windows ICO format
const iconSizes = [16, 32, 48, 256];

console.log('🎨 Generating Windows icons from SVG...');
console.log(`📂 Source: ${svgPath}`);
console.log(`📂 Output: ${outputDir}`);

async function generateIcons() {
  try {
    // Read the SVG file
    const svgBuffer = readFileSync(svgPath);
    
    // Generate individual PNG files for each size
    const pngBuffers = [];
    
    for (const size of iconSizes) {
      console.log(`  ⚙️  Generating ${size}x${size} PNG...`);
      const pngBuffer = await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      pngBuffers.push({ size, buffer: pngBuffer });
      
      // Also save individual PNG files for reference
      const pngPath = resolve(outputDir, `icon-${size}x${size}.png`);
      writeFileSync(pngPath, pngBuffer);
      console.log(`  ✅ Saved: icon-${size}x${size}.png`);
    }
    
    // Create ICO file manually (basic ICO format)
    // ICO format: ICONDIR header + ICONDIRENTRY entries + PNG data
    const icoPath = resolve(outputDir, 'icon.ico');
    
    // ICO Header (6 bytes)
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);      // Reserved (must be 0)
    header.writeUInt16LE(1, 2);      // Type (1 = ICO)
    header.writeUInt16LE(pngBuffers.length, 4); // Number of images
    
    // Calculate offsets for each image
    let currentOffset = 6 + (16 * pngBuffers.length); // Header + all directory entries
    const entries = [];
    
    for (const { size, buffer } of pngBuffers) {
      const entry = Buffer.alloc(16);
      entry.writeUInt8(size === 256 ? 0 : size, 0); // Width (0 means 256)
      entry.writeUInt8(size === 256 ? 0 : size, 1); // Height (0 means 256)
      entry.writeUInt8(0, 2);          // Color palette (0 = no palette)
      entry.writeUInt8(0, 3);          // Reserved (must be 0)
      entry.writeUInt16LE(1, 4);       // Color planes (1)
      entry.writeUInt16LE(32, 6);      // Bits per pixel (32 for PNG)
      entry.writeUInt32LE(buffer.length, 8); // Image data size
      entry.writeUInt32LE(currentOffset, 12); // Offset to image data
      
      entries.push(entry);
      currentOffset += buffer.length;
    }
    
    // Combine all parts
    const icoBuffer = Buffer.concat([
      header,
      ...entries,
      ...pngBuffers.map(p => p.buffer)
    ]);
    
    writeFileSync(icoPath, icoBuffer);
    console.log(`  ✅ Saved: icon.ico (${icoBuffer.length} bytes)`);
    
    console.log('\n✨ Icon generation complete!');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
