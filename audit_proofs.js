const fs = require('fs');
const path = require('path');

const checkpoints = fs.readdirSync('output/checkpoints').filter(f => f.endsWith('.json')).sort();
const missingMap = {}; // routeId -> { count, details: [] }
const fallbackMap = {}; // routeId -> { count, details: [] }
const totalByRoute = {};
let totalScreenshotsFound = 0;
let totalScreenshotsMissing = 0;
let checkedEntries = 0;

for (const cpFile of checkpoints) {
  const dateMatch = cpFile.match(/checkpoint_(\d{4}-\d{2}-\d{2})_(\w+)\.json/);
  if (!dateMatch) continue;
  const [_, dateStr, day] = dateMatch;
  const data = JSON.parse(fs.readFileSync(path.join('output/checkpoints', cpFile), 'utf8'));

  for (const routeId in data) {
    if (!totalByRoute[routeId]) totalByRoute[routeId] = 0;
    for (const slot in data[routeId]) {
      totalByRoute[routeId]++;
      checkedEntries++;
      const entry = data[routeId][slot];
      const slotFolder = slot.replace(/[:\\/\s]/g, '_');
      
      // Check screenshots on disk
      const busSs = path.join('output/screenshots', dateStr, slotFolder, routeId, 'bus.jpg');
      const metroSs = path.join('output/screenshots', dateStr, slotFolder, routeId, 'metro.jpg');
      const carSs = path.join('output/screenshots', dateStr, slotFolder, routeId, 'car.jpg');
      
      [busSs, metroSs, carSs].forEach(p => {
        if (fs.existsSync(p)) totalScreenshotsFound++;
        else totalScreenshotsMissing++;
      });

      // Check missing
      if (!entry.busMin || !entry.metroMin || !entry.carMin) {
        if (!missingMap[routeId]) missingMap[routeId] = { count: 0, details: [] };
        missingMap[routeId].count++;
        missingMap[routeId].details.push({
          date: dateStr, day, slot,
          missing: [!entry.busMin?'Bus':null, !entry.metroMin?'Metro':null, !entry.carMin?'Car':null].filter(Boolean).join(', ')
        });
      }

      // Check walking fallback (Metro closed, Maps gave walking route)
      if (entry.metroMin && (entry.metroUsed === 'N/A' || (entry.metroRawDetails && entry.metroRawDetails.includes('via ')))) {
        if (!fallbackMap[routeId]) fallbackMap[routeId] = { count: 0, details: [] };
        fallbackMap[routeId].count++;
        fallbackMap[routeId].details.push({
          date: dateStr, day, slot,
          metroMin: entry.metroMin,
          raw: entry.metroRawDetails,
          ssExists: fs.existsSync(metroSs),
          ssPath: metroSs
        });
      }
    }
  }
}

console.log('=== TOTAL DATA POINTS CHECKED ===');
console.log('Total entries:', checkedEntries);
console.log('Screenshots found on disk:', totalScreenshotsFound);
console.log('Screenshots missing on disk:', totalScreenshotsMissing);

console.log('\n=== ROUTES WITH MISSING DATA ===');
for (const r in missingMap) {
  console.log(r + ': ' + missingMap[r].count + ' missing occurrences');
  const reasons = {};
  missingMap[r].details.forEach(d => {
    const k = d.slot + ' (' + d.missing + ')';
    reasons[k] = (reasons[k] || 0) + 1;
  });
  console.log('   Breakdown:', JSON.stringify(reasons));
  console.log('   Dates sample:', missingMap[r].details.slice(0, 3).map(x => x.date + ' ' + x.day + ' ' + x.slot));
}

console.log('\n=== ROUTES WITH WALKING FALLBACK ANOMALY (Metro substituted by Walk) ===');
for (const r in fallbackMap) {
  console.log(r + ': ' + fallbackMap[r].count + ' walking fallback occurrences');
  const slots = {};
  fallbackMap[r].details.forEach(d => {
    slots[d.slot] = (slots[d.slot] || 0) + 1;
  });
  console.log('   Slot Breakdown:', JSON.stringify(slots));
  console.log('   Sample raw text:', fallbackMap[r].details[0].raw);
  console.log('   Screenshot verified on disk?', fallbackMap[r].details[0].ssExists ? 'YES (' + fallbackMap[r].details[0].ssPath + ')' : 'NO');
}
