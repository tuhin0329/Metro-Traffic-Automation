#!/usr/bin/env node
/**
 * build_complete_conclusion_suite.js
 * ──────────────────────────────────
 * Master script that generates the complete, synchronized Metro vs. Car conclusion suite
 * across the 24 active corridors (MC-01 to MC-24; Yellow Line MC-25 excluded).
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

console.log('🚀 Starting Metro vs. Car Conclusion Suite Generation (24 Active Corridors)...');

// ─── 1. Load Checkpoints & 24 Active Segments ───────────────────────────────
const checkpoints = fs.readdirSync('output/checkpoints')
  .filter(f => f.endsWith('.json') && !f.includes('2026-09-23'))
  .sort();

const segments = JSON.parse(fs.readFileSync('segments.json', 'utf8'));
const validRouteIds = new Set(segments.map(s => s.id));

const ssDir = path.join(__dirname, 'output', 'screenshots');
const conclusionDir = path.join(__dirname, 'output', 'conclusion');
const summaryDir = path.join(conclusionDir, 'summary_tables');
const anomalyDir = path.join(conclusionDir, 'flagged_anomalies');
const corridorDir = path.join(conclusionDir, 'corridor_reports');

[conclusionDir, summaryDir, anomalyDir, corridorDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Remove MC-25 report if present
const mc25ReportPath = path.join(corridorDir, 'MC-25_report.md');
if (fs.existsSync(mc25ReportPath)) {
  fs.unlinkSync(mc25ReportPath);
  console.log('🗑️ Removed obsolete MC-25_report.md (Yellow Line)');
}

// Distance calculation
function haversine(c1, c2) {
  const [lat1, lon1] = c1.split(',').map(s => parseFloat(s.trim()));
  const [lat2, lon2] = c2.split(',').map(s => parseFloat(s.trim()));
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const distances = {};
segments.forEach(s => {
  distances[s.id] = Math.round(haversine(s.from_metro, s.to_metro) * 1.3 * 10) / 10;
});

// ─── 2. Classify Every Scraped Record (24 Active Corridors Only) ─────────────
let rawRecords = [];
let walkingAnomalies = [];
let missingAnomalies = [];
let cleanOperational = [];

for (const cpFile of checkpoints) {
  const data = JSON.parse(fs.readFileSync(path.join('output/checkpoints', cpFile)));
  const parts = cpFile.replace('checkpoint_', '').replace('.json', '').split('_');
  const dateStr = parts[0];
  const dayName = parts[1];

  for (const [routeId, slotMap] of Object.entries(data)) {
    if (!validRouteIds.has(routeId)) continue; // Skip MC-25 (Yellow Line)
    const corridor = segments.find(s => s.id === routeId) || {};
    for (const [slot, d] of Object.entries(slotMap)) {
      const slotFolder = slot.replace(/:/g, '_').replace(/ /g, '_');
      const expectedSs = path.join(ssDir, dateStr, slotFolder, routeId, 'metro.jpg');
      const ssExists = fs.existsSync(expectedSs);

      const record = {
        date: dateStr, day: dayName, routeId, line: corridor.line || 'Unknown',
        from: corridor.from || '', to: corridor.to || '', isMaster: corridor.is_master || false,
        slot, metroMin: d.metroMin || 0, carMin: d.carMin || 0,
        metroUsed: d.metroUsed || 'N/A',
        metroRawDetails: d.metroRawDetails || '',
        metroSsPath: ssExists ? expectedSs : (d.metroSsPath || ''),
        hasScreenshot: ssExists,
        isWalkingFallback: false,
        isMissingMetro: false
      };

      if (d.metroMin && (d.metroUsed === 'N/A' || (d.metroRawDetails && d.metroRawDetails.includes('via ')))) {
        record.isWalkingFallback = true;
        walkingAnomalies.push(record);
      } else if (!d.metroMin) {
        record.isMissingMetro = true;
        missingAnomalies.push(record);
      } else if (d.metroMin && d.carMin && d.metroMin > 2 && d.carMin > 1) {
        cleanOperational.push(record);
      }
      rawRecords.push(record);
    }
  }
}

console.log(`✓ Processed ${rawRecords.length} total queries across 24 active corridors`);
console.log(`  - Clean Operational: ${cleanOperational.length}`);
console.log(`  - Walking Fallbacks: ${walkingAnomalies.length}`);
console.log(`  - Missing Metro:     ${missingAnomalies.length}`);

// ─── 3. Export CSV Files (Metro vs. Car) ────────────────────────────────────
const cleanCsvHeader = 'Date,Day,RouteId,Line,From,To,IsMaster,Slot,MetroMin,CarMin,CarMetroRatio,Winner,TimeSavedVsCar\n';
const cleanCsvRows = cleanOperational.map(r => {
  const winner = r.metroMin < r.carMin ? 'Metro' : r.carMin < r.metroMin ? 'Car' : 'Tie';
  const carRatio = (r.carMin / r.metroMin).toFixed(2);
  const saved = r.carMin - r.metroMin;
  return `${r.date},${r.day},${r.routeId},${r.line},"${r.from}","${r.to}",${r.isMaster},${r.slot},${r.metroMin},${r.carMin},${carRatio},${winner},${saved}`;
}).join('\n');
fs.writeFileSync(path.join(summaryDir, 'clean_dataset.csv'), cleanCsvHeader + cleanCsvRows);
console.log(`✓ Exported clean_dataset.csv (${cleanOperational.length} rows)`);

const rawCsvHeader = 'Date,Day,RouteId,Line,From,To,IsMaster,Slot,MetroMin,CarMin,IsWalkingFallback,IsMissingMetro,DataTier\n';
const rawCsvRows = rawRecords.map(r => {
  const tier = r.isWalkingFallback ? 'WalkingFallback' : r.isMissingMetro ? 'MissingMetro' : 'CleanOperational';
  return `${r.date},${r.day},${r.routeId},${r.line},"${r.from}","${r.to}",${r.isMaster},${r.slot},${r.metroMin},${r.carMin},${r.isWalkingFallback},${r.isMissingMetro},${tier}`;
}).join('\n');
fs.writeFileSync(path.join(summaryDir, 'all_raw_dataset.csv'), rawCsvHeader + rawCsvRows);
console.log(`✓ Exported all_raw_dataset.csv (${rawRecords.length} rows)`);

const walkCsvHeader = 'Date,Day,RouteId,Line,From,To,Slot,WalkingFallbackMin,CarMin,ScrapedDetails,HasScreenshot,ScreenshotPath\n';
const walkCsvRows = walkingAnomalies.map(r => {
  return `${r.date},${r.day},${r.routeId},${r.line},"${r.from}","${r.to}",${r.slot},${r.metroMin},${r.carMin},"${r.metroRawDetails.replace(/"/g, '""')}",${r.hasScreenshot},"${r.metroSsPath}"`;
}).join('\n');
fs.writeFileSync(path.join(anomalyDir, 'walking_fallback_audit.csv'), walkCsvHeader + walkCsvRows);
console.log(`✓ Exported walking_fallback_audit.csv (${walkingAnomalies.length} rows)`);

// ─── 4. Statistical Computations (Metro vs. Car) ────────────────────────────
const N = cleanOperational.length;
const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
const std = a => { const m = avg(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const median = arr => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const metroAvg = avg(cleanOperational.map(r => r.metroMin));
const carAvg = avg(cleanOperational.map(r => r.carMin));
const metroSD = std(cleanOperational.map(r => r.metroMin));
const carSD = std(cleanOperational.map(r => r.carMin));

let mWins = 0, cWins = 0, ties = 0;
cleanOperational.forEach(r => {
  if (r.metroMin < r.carMin) mWins++;
  else if (r.carMin < r.metroMin) cWins++;
  else ties++;
});

const diffs = cleanOperational.map(r => r.carMin - r.metroMin);
const meanDiff = avg(diffs);
const sdDiff = std(diffs);
const tStat = meanDiff / (sdDiff / Math.sqrt(N));
const cohenD = meanDiff / sdDiff;

const lines = ['Blue', 'Green', 'Orange', 'Purple'];
const lineStats = {};
lines.forEach(l => {
  const items = cleanOperational.filter(r => r.line === l);
  if (!items.length) return;
  const mw = items.filter(r => r.metroMin < r.carMin).length;
  const corridors = [...new Set(items.map(r => r.routeId))];
  lineStats[l] = {
    n: items.length, corridors: corridors.length,
    metroAvg: avg(items.map(r => r.metroMin)),
    carAvg: avg(items.map(r => r.carMin)),
    metroWinRate: (mw / items.length) * 100,
    timeSaved: avg(items.map(r => r.carMin)) - avg(items.map(r => r.metroMin))
  };
});

const slots = ['12:00 AM', '10:00 AM', '1:00 PM', '7:00 PM'];
const slotStats = {};
slots.forEach(slot => {
  const items = cleanOperational.filter(r => r.slot === slot);
  if (!items.length) return;
  const mw = items.filter(r => r.metroMin < r.carMin).length;
  slotStats[slot] = {
    n: items.length,
    metroAvg: avg(items.map(r => r.metroMin)),
    carAvg: avg(items.map(r => r.carMin)),
    metroWinRate: (mw / items.length) * 100
  };
});

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const corridorStats = {};
segments.forEach(s => {
  const items = cleanOperational.filter(r => r.routeId === s.id);
  if (!items.length) return;
  const mw = items.filter(r => r.metroMin < r.carMin).length;
  const d = distances[s.id] || 0;
  corridorStats[s.id] = {
    id: s.id, line: s.line, from: s.from, to: s.to, isMaster: s.is_master,
    n: items.length, dist: d,
    metroAvg: avg(items.map(r => r.metroMin)),
    carAvg: avg(items.map(r => r.carMin)),
    metroSD: std(items.map(r => r.metroMin)),
    carSD: std(items.map(r => r.carMin)),
    metroMin: Math.min(...items.map(r => r.metroMin)),
    metroMax: Math.max(...items.map(r => r.metroMin)),
    carMin: Math.min(...items.map(r => r.carMin)),
    carMax: Math.max(...items.map(r => r.carMin)),
    timeSaved: avg(items.map(r => r.carMin)) - avg(items.map(r => r.metroMin)),
    ratio: avg(items.map(r => r.carMin)) / avg(items.map(r => r.metroMin)),
    metroWinRate: (mw / items.length) * 100,
    slots: {}
  };
  slots.forEach(slot => {
    const slotItems = items.filter(r => r.slot === slot);
    if (!slotItems.length) return;
    corridorStats[s.id].slots[slot] = {
      n: slotItems.length,
      metroAvg: avg(slotItems.map(r => r.metroMin)),
      carAvg: avg(slotItems.map(r => r.carMin)),
      winner: avg(slotItems.map(r => r.metroMin)) <= avg(slotItems.map(r => r.carMin)) ? '🚇 Metro' : '🚗 Car'
    };
  });
});

// ─── 5. Generate 24 Corridor Reports (Metro vs. Car) ────────────────────────
segments.forEach(seg => {
  const c = corridorStats[seg.id];
  if (!c) return;
  const emoji = { Blue: '🔵', Green: '🟢', Orange: '🟠', Purple: '🟣' }[seg.line] || '';
  const winner = c.metroAvg <= c.carAvg ? '🚇 Metro' : '🚗 Car';
  const items = cleanOperational.filter(r => r.routeId === seg.id);

  const dayStats = {};
  dayOrder.forEach(day => {
    const dayItems = items.filter(r => r.day === day);
    if (!dayItems.length) return;
    dayStats[day] = {
      n: dayItems.length,
      metro: avg(dayItems.map(r => r.metroMin)),
      car: avg(dayItems.map(r => r.carMin))
    };
  });

  const content = `# ${seg.id}: ${seg.from} → ${seg.to}

**Line:** ${emoji} ${seg.line} | **Type:** ${seg.is_master ? '🔴 Macro (Full Line)' : '🔵 Micro (Segment)'}  
**Distance:** ~${c.dist} km | **Clean Data Points:** ${c.n} | **Overall Winner:** ${winner}

---

## Summary Statistics (Metro vs. Car)

| Mode | Average | Min | Max | Std Dev | Median |
|:-----|:-------:|:---:|:---:|:-------:|:------:|
| 🚇 **Metro** | **${c.metroAvg.toFixed(1)} min** | ${c.metroMin} | ${c.metroMax} | ${c.metroSD.toFixed(1)} | ${median(items.map(r=>r.metroMin)).toFixed(0)} |
| 🚗 **Car** | **${c.carAvg.toFixed(1)} min** | ${c.carMin} | ${c.carMax} | ${c.carSD.toFixed(1)} | ${median(items.map(r=>r.carMin)).toFixed(0)} |

**Metro vs Car:** Metro saves **+${c.timeSaved.toFixed(1)} min** per trip (${c.ratio.toFixed(2)}x faster)  
**Metro Win Rate:** **${c.metroWinRate.toFixed(1)}%** (${items.filter(r => r.metroMin < r.carMin).length}/${c.n} trips)

---

## Time-of-Day Breakdown

| Slot | Metro | Car | Fastest | Gap (Car - Metro) |
|:-----|:-----:|:---:|:-------:|:-----------------:|
${slots.map(slot => {
  const s = c.slots[slot];
  if (!s) return `| ${slot} | — | — | No data | — |`;
  const gap = s.carAvg - s.metroAvg;
  return `| **${slot}** | **${s.metroAvg.toFixed(1)}** | ${s.carAvg.toFixed(1)} | ${s.winner} | ${gap >= 0 ? '+' : ''}${gap.toFixed(1)} min |`;
}).join('\n')}

## Day-of-Week Performance

| Day | N | Metro | Car |
|:----|:---:|:-----:|:---:|
${dayOrder.map(day => {
  const d = dayStats[day];
  if (!d) return `| ${day} | 0 | — | — |`;
  return `| **${day}** | ${d.n} | ${d.metro.toFixed(1)} | ${d.car.toFixed(1)} |`;
}).join('\n')}
`;
  fs.writeFileSync(path.join(corridorDir, `${seg.id}_report.md`), content);
});
console.log('✓ Regenerated all 24 corridor reports (Metro vs. Car)');
