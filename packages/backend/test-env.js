// Test if .env from root is accessible
// Node.js will need dotenv, but Bun reads .env automatically from cwd and parent dirs

// Try to read .env manually
const fs = require('fs');
const path = require('path');

function findAndLoadEnv() {
  let currentDir = __dirname;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const envPath = path.join(currentDir, '.env');
    console.log(`Checking: ${envPath}`);
    
    if (fs.existsSync(envPath)) {
      console.log(`✓ Found .env at: ${envPath}`);
      const content = fs.readFileSync(envPath, 'utf8');
      
      // Parse simple key=value pairs
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=');
            process.env[key] = value;
          }
        }
      }
      return true;
    }
    
    currentDir = path.dirname(currentDir);
    attempts++;
  }
  
  return false;
}

console.log('Testing .env loading from parent directories...\n');
console.log(`Current directory: ${__dirname}\n`);

if (findAndLoadEnv()) {
  console.log('\n=== Environment Variables Loaded ===');
  console.log('PORT:', process.env.PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
  console.log('VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL);
  console.log('\n✓ .env successfully loaded from project root!');
} else {
  console.log('\n✗ Failed to find .env file');
  process.exit(1);
}
