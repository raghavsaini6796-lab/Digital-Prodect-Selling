const fs = require('fs');
const { execSync } = require('child_process');

async function run() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const lines = envFile.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Split on first equals sign
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    
    const key = trimmed.substring(0, index).trim();
    const value = trimmed.substring(index + 1).trim();
    
    // Only upload keys that are not completely empty
    if (key && value) {
      console.log(`Uploading ${key}...`);
      try {
        // Upload to all environments (production, preview, development)
        execSync(`echo ${value} | npx vercel env add ${key} production`, { stdio: 'pipe' });
        execSync(`echo ${value} | npx vercel env add ${key} preview`, { stdio: 'pipe' });
        execSync(`echo ${value} | npx vercel env add ${key} development`, { stdio: 'pipe' });
        console.log(`✓ Added ${key}`);
      } catch (err) {
        // Ignored, might already exist
        console.log(`- Skipped ${key} (might already exist)`);
      }
    }
  }
}

run().catch(console.error);
