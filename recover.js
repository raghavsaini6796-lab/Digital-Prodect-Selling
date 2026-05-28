const fs = require('fs');
const readline = require('readline');
const path = require('path');

const transcriptPath = 'C:\\Users\\ragha\\.gemini\\antigravity\\brain\\96b036da-6e43-4572-aabc-e56a06478e91\\.system_generated\\logs\\transcript.jsonl';

const filesToRecover = [
  'src/services/scheduler/scheduler.service.ts',
  'src/services/instagram/instagram.service.ts',
  'src/app/api/instagram/queue/process/route.ts',
  'src/types/instagram.ts',
  'src/app/(dashboard)/dashboard/instagram/page.tsx',
  'src/components/instagram/post-card.tsx',
  'src/components/instagram/template-gallery.tsx'
];

async function recover() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const fileContents = {};

  for await (const line of rl) {
    try {
      const step = JSON.parse(line);
      
      // Look for view_file outputs
      if (step.source === 'TOOL' && step.type === 'CALL_RESULT') {
        // We have to inspect the text content to see if it's a file we want
        const text = step.content || '';
        for (const file of filesToRecover) {
          const absoluteEnding = file.replace(/\//g, '\\\\');
          if (text.includes(file.replace(/\//g, '\\')) || text.includes(file)) {
            // It might be the view_file output! Let's check if it has "Showing lines"
            if (text.includes('Total Lines:')) {
               // Found the original view_file output!
               // Let's only keep the first one we find.
               if (!fileContents[file]) {
                 fileContents[file] = text;
               }
            }
          }
        }
      }
    } catch (err) {
      // ignore JSON parse errors on lines
    }
  }

  // Now process and save them
  for (const [file, text] of Object.entries(fileContents)) {
    console.log(`Found original content for ${file}`);
    
    const lines = text.split('\n');
    const contentLines = [];
    let isCode = false;
    
    for (const l of lines) {
       // Look for the line numbering pattern e.g. "1: import ..."
       const match = l.match(/^(\d+): (.*)$/);
       if (match) {
         contentLines.push(match[2]);
         isCode = true;
       } else if (isCode && l.trim() === '') {
         contentLines.push('');
       }
    }
    
    if (contentLines.length > 0) {
      const fullPath = path.join(process.cwd(), file);
      fs.writeFileSync(fullPath, contentLines.join('\n'), 'utf8');
      console.log(`Recovered ${file}`);
    }
  }
}

recover().catch(console.error);
