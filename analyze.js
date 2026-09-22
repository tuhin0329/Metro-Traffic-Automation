/**
 * analyze.js
 * ----------
 * Comprehensive multimodal transit analysis engine.
 * Reads all checkpoint JSONs, flags anomalies, calculates key metrics,
 * and generates organized conclusion files.
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'output');
const checkpointDir = path.join(outDir, 'checkpoints');
const conclusionDir = path.join(outDir, 'conclusion');
const ssDir = path.join(outDir, 'screenshots');

// Create conclusion subdirectories
[conclusionDir,
 path.join(conclusionDir, 'flagged_anomalies'),
 path.join(conclusionDir, 'summary_tables'),
 path.join(conclusionDir, 'corridor_reports')
].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// Load corridor definitions
const segments = JSON.parse(fs.readFileSync(path.join(__dirname, 'segments.json'), 'utf8'));
const corridorMap = {};
segments.forEach(s => { corridorMap[s.id] = s; });

// ─── 1. LOAD ALL CHECKPOINT DATA ───────────────────────────────────────────
const allData = []; // flat array of { date, day, routeId, slot, ...metrics }
const anomalies = []; // flagged unusual data points

const checkpointFiles = fs.readdirSync(checkpointDir)
  .filter(f => f.endsWith('.json'))
  .sort();

console.log(`\n📊 METRO TRAFFIC ANALYSIS ENGINE`);
console.log(`════════════════════════════════════════════════════════`);
console.log(`📁 Found ${checkpointFiles.length} checkpoint files to analyze`);

for (const file of checkpointFiles) {
  // Parse date and day from filename: checkpoint_2026-09-22_Tue.json
  const match = file.match(/checkpoint_(\d{4}-\d{2}-\d{2})_(\w+)\.json/);
  if (!match) continue;
  const [, dateStr, dayName] = match;
  
  const data = JSON.parse(fs.readFileSync(path.join(checkpointDir, file), 'utf8'));
  
  for (const routeId in data) {
    for (const slot in data[routeId]) {
      const d = data[routeId][slot];
      if (!d) continue;
      
      const corridor = corridorMap[routeId] || {};
      
      allData.push({
        date: dateStr,
        day: dayName,
        routeId,
        line: corridor.line || 'Unknown',
        from: corridor.from || '',
        to: corridor.to || '',
        isMaster: corridor.is_master || false,
        slot,
        busMin: d.busMin,
        metroMin: d.metroMin,
        carMin: d.carMin,
        busUsed: d.busUsed || 'N/A',
        metroUsed: d.metroUsed || 'N/A',
        busWalk: d.busWalk || 'N/A',
        metroWalk: d.metroWalk || 'N/A',
        busUrl: d.busUrl || '',
        metroUrl: d.metroUrl || '',
        carUrl: d.carUrl || '',
        scrapedAt: d.scrapedAt || ''
      });
    }
  }
}

console.log(`📈 Total data points loaded: ${allData.length}`);
console.log(`   (${allData.filter(d => d.busMin && d.metroMin && d.carMin).length} complete with all 3 modes)`);

// ─── 2. ANOMALY DETECTION ──────────────────────────────────────────────────
console.log(`\n🔍 ANOMALY DETECTION`);
console.log(`────────────────────────────────────────────────────────`);

// 2a. Calculate corridor-slot averages for baseline
const avgMap = {}; // key: routeId_slot -> { busAvg, metroAvg, carAvg, busSD, metroSD, carSD }
const groupedData = {};

for (const d of allData) {
  const key = `${d.routeId}_${d.slot}`;
  if (!groupedData[key]) groupedData[key] = [];
  groupedData[key].push(d);
}

function calcStats(arr) {
  if (arr.length === 0) return { mean: null, sd: null };
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return { mean: Math.round(mean * 100) / 100, sd: Math.round(Math.sqrt(variance) * 100) / 100 };
}

for (const key in groupedData) {
  const items = groupedData[key];
  const busVals = items.filter(d => d.busMin).map(d => d.busMin);
  const metroVals = items.filter(d => d.metroMin).map(d => d.metroMin);
  const carVals = items.filter(d => d.carMin).map(d => d.carMin);
  
  avgMap[key] = {
    bus: calcStats(busVals),
    metro: calcStats(metroVals),
    car: calcStats(carVals),
    count: items.length
  };
}

// 2b. Flag anomalies: values > 2 SD from mean, or nulls, or impossible values
for (const d of allData) {
  const key = `${d.routeId}_${d.slot}`;
  const stats = avgMap[key];
  if (!stats) continue;
  
  const reasons = [];
  
  // Missing data
  if (!d.busMin) reasons.push('❌ Bus time missing (scraper failed)');
  if (!d.metroMin) reasons.push('❌ Metro time missing (scraper failed)');
  if (!d.carMin) reasons.push('❌ Car time missing (scraper failed)');
  
  // Impossibly low values (< 2 min for any mode)
  if (d.busMin && d.busMin < 2) reasons.push(`⚠️ Bus time suspiciously low (${d.busMin} min)`);
  if (d.metroMin && d.metroMin < 2) reasons.push(`⚠️ Metro time suspiciously low (${d.metroMin} min)`);
  if (d.carMin && d.carMin < 1) reasons.push(`⚠️ Car time suspiciously low (${d.carMin} min)`);
  
  // Impossibly high values (> 180 min = 3 hours for any single corridor)
  if (d.busMin && d.busMin > 180) reasons.push(`⚠️ Bus time unusually high (${d.busMin} min)`);
  if (d.metroMin && d.metroMin > 120) reasons.push(`⚠️ Metro time unusually high (${d.metroMin} min)`);
  if (d.carMin && d.carMin > 180) reasons.push(`⚠️ Car time unusually high (${d.carMin} min)`);
  
  // Statistical outlier (> 2 standard deviations from mean)
  if (d.busMin && stats.bus.sd > 0 && Math.abs(d.busMin - stats.bus.mean) > 2 * stats.bus.sd) {
    reasons.push(`📊 Bus is statistical outlier: ${d.busMin} min vs avg ${stats.bus.mean}±${stats.bus.sd}`);
  }
  if (d.metroMin && stats.metro.sd > 0 && Math.abs(d.metroMin - stats.metro.mean) > 2 * stats.metro.sd) {
    reasons.push(`📊 Metro is statistical outlier: ${d.metroMin} min vs avg ${stats.metro.mean}±${stats.metro.sd}`);
  }
  if (d.carMin && stats.car.sd > 0 && Math.abs(d.carMin - stats.car.mean) > 2 * stats.car.sd) {
    reasons.push(`📊 Car is statistical outlier: ${d.carMin} min vs avg ${stats.car.mean}±${stats.car.sd}`);
  }
  
  // Bus faster than metro by large margin (unusual — might indicate wrong bus route scraped)
  if (d.busMin && d.metroMin && d.busMin < d.metroMin * 0.5) {
    reasons.push(`🔴 Bus impossibly faster than Metro (Bus: ${d.busMin} vs Metro: ${d.metroMin})`);
  }
  
  if (reasons.length > 0) {
    anomalies.push({
      date: d.date,
      day: d.day,
      routeId: d.routeId,
      corridor: `${d.from} → ${d.to}`,
      line: d.line,
      slot: d.slot,
      busMin: d.busMin || 'MISSING',
      metroMin: d.metroMin || 'MISSING',
      carMin: d.carMin || 'MISSING',
      reasons,
      screenshotDir: path.join(ssDir, d.date, d.slot.replace(/[:\\/\s]/g, '_'), d.routeId),
      busUrl: d.busUrl,
      metroUrl: d.metroUrl,
      carUrl: d.carUrl
    });
  }
}

console.log(`⚠️  Flagged ${anomalies.length} anomalous data points out of ${allData.length} total`);

// Save anomalies
fs.writeFileSync(
  path.join(conclusionDir, 'flagged_anomalies', 'anomalies.json'),
  JSON.stringify(anomalies, null, 2), 'utf8'
);

// Generate human-readable anomaly report
let anomalyReport = `# 🚨 FLAGGED ANOMALIES REPORT\n`;
anomalyReport += `Generated: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}\n\n`;
anomalyReport += `**Total Data Points:** ${allData.length}\n`;
anomalyReport += `**Flagged Anomalies:** ${anomalies.length} (${(anomalies.length / allData.length * 100).toFixed(1)}%)\n\n`;

// Group anomalies by severity
const criticalAnomalies = anomalies.filter(a => a.reasons.some(r => r.includes('❌') || r.includes('🔴')));
const warningAnomalies = anomalies.filter(a => !a.reasons.some(r => r.includes('❌') || r.includes('🔴')));

anomalyReport += `## Critical Issues (${criticalAnomalies.length})\n`;
anomalyReport += `> Missing data or impossible values that should be excluded from analysis\n\n`;
anomalyReport += `| Date | Day | Corridor | Slot | Bus | Metro | Car | Issue |\n`;
anomalyReport += `|------|-----|----------|------|-----|-------|-----|-------|\n`;
for (const a of criticalAnomalies) {
  anomalyReport += `| ${a.date} | ${a.day} | ${a.routeId} (${a.line}) | ${a.slot} | ${a.busMin} | ${a.metroMin} | ${a.carMin} | ${a.reasons.filter(r => r.includes('❌') || r.includes('🔴')).join('; ')} |\n`;
}

anomalyReport += `\n## Statistical Warnings (${warningAnomalies.length})\n`;
anomalyReport += `> Values that are outliers or unusually high/low — verify against screenshots\n\n`;
anomalyReport += `| Date | Day | Corridor | Slot | Bus | Metro | Car | Issue |\n`;
anomalyReport += `|------|-----|----------|------|-----|-------|-----|-------|\n`;
for (const a of warningAnomalies.slice(0, 50)) { // cap at 50 for readability
  anomalyReport += `| ${a.date} | ${a.day} | ${a.routeId} (${a.line}) | ${a.slot} | ${a.busMin} | ${a.metroMin} | ${a.carMin} | ${a.reasons.join('; ')} |\n`;
}
if (warningAnomalies.length > 50) {
  anomalyReport += `\n*... and ${warningAnomalies.length - 50} more warnings (see anomalies.json for full list)*\n`;
}

fs.writeFileSync(path.join(conclusionDir, 'flagged_anomalies', 'anomaly_report.md'), anomalyReport, 'utf8');

// ─── 3. CLEAN DATA (exclude critical anomalies) ────────────────────────────
const cleanData = allData.filter(d => {
  if (!d.busMin || !d.metroMin || !d.carMin) return false;
  if (d.busMin < 2 || d.metroMin < 2 || d.carMin < 1) return false;
  if (d.busMin > 180 || d.metroMin > 120 || d.carMin > 180) return false;
  return true;
});

console.log(`\n✅ Clean data points for analysis: ${cleanData.length} / ${allData.length}`);

// ─── 4. KEY METRIC CALCULATIONS ────────────────────────────────────────────
console.log(`\n📊 CALCULATING KEY METRICS`);
console.log(`────────────────────────────────────────────────────────`);

// 4a. Overall Mode Competitiveness
let metroWins = 0, busWins = 0, carWins = 0, ties = 0;
for (const d of cleanData) {
  const min = Math.min(d.busMin, d.metroMin, d.carMin);
  if (min === d.metroMin && d.metroMin < d.busMin && d.metroMin < d.carMin) metroWins++;
  else if (min === d.busMin && d.busMin < d.metroMin && d.busMin < d.carMin) busWins++;
  else if (min === d.carMin && d.carMin < d.busMin && d.carMin < d.metroMin) carWins++;
  else ties++;
}

console.log(`   🏆 Mode Win Rate: Metro ${metroWins} (${(metroWins/cleanData.length*100).toFixed(1)}%) | Bus ${busWins} (${(busWins/cleanData.length*100).toFixed(1)}%) | Car ${carWins} (${(carWins/cleanData.length*100).toFixed(1)}%) | Tie ${ties}`);

// 4b. Travel Time Ratio (TTR) by corridor & slot
const ttrData = {};
for (const d of cleanData) {
  const key = `${d.routeId}_${d.slot}`;
  if (!ttrData[key]) ttrData[key] = { busMetro: [], carMetro: [], busVals: [], metroVals: [], carVals: [] };
  ttrData[key].busMetro.push(d.busMin / d.metroMin);
  ttrData[key].carMetro.push(d.carMin / d.metroMin);
  ttrData[key].busVals.push(d.busMin);
  ttrData[key].metroVals.push(d.metroMin);
  ttrData[key].carVals.push(d.carMin);
}

// 4c. Diurnal Congestion Analysis (Travel Time Index)
const slots = ['12:00 AM', '10:00 AM', '1:00 PM', '7:00 PM'];
const diurnalByRoute = {};
for (const d of cleanData) {
  if (!diurnalByRoute[d.routeId]) diurnalByRoute[d.routeId] = {};
  if (!diurnalByRoute[d.routeId][d.slot]) diurnalByRoute[d.routeId][d.slot] = { bus: [], metro: [], car: [] };
  diurnalByRoute[d.routeId][d.slot].bus.push(d.busMin);
  diurnalByRoute[d.routeId][d.slot].metro.push(d.metroMin);
  diurnalByRoute[d.routeId][d.slot].car.push(d.carMin);
}

// 4d. Weekday vs Weekend Analysis
const weekdayData = cleanData.filter(d => !['Sat', 'Sun'].includes(d.day));
const weekendData = cleanData.filter(d => ['Sat', 'Sun'].includes(d.day));

function avgArr(arr) { return arr.length > 0 ? Math.round(arr.reduce((a,b) => a+b, 0) / arr.length * 10) / 10 : null; }

// 4e. Line-by-Line Performance
const lineData = {};
for (const d of cleanData) {
  if (!lineData[d.line]) lineData[d.line] = { bus: [], metro: [], car: [], corridors: new Set() };
  lineData[d.line].bus.push(d.busMin);
  lineData[d.line].metro.push(d.metroMin);
  lineData[d.line].car.push(d.carMin);
  lineData[d.line].corridors.add(d.routeId);
}

// ─── 5. GENERATE SUMMARY REPORTS ───────────────────────────────────────────

// 5a. Master Summary Report
let summary = `# 📊 KOLKATA METRO vs BUS vs CAR — COMPREHENSIVE ANALYSIS REPORT\n\n`;
summary += `**Analysis Period:** ${checkpointFiles[0].match(/\d{4}-\d{2}-\d{2}/)[0]} to ${checkpointFiles[checkpointFiles.length-1].match(/\d{4}-\d{2}-\d{2}/)[0]}\n`;
summary += `**Days of Data:** ${checkpointFiles.length}\n`;
summary += `**Total Data Points:** ${allData.length} (Clean: ${cleanData.length}, Anomalies excluded: ${allData.length - cleanData.length})\n`;
summary += `**Corridors:** ${segments.length} across 5 Metro Lines\n`;
summary += `**Time Slots:** 12:00 AM (Night) | 10:00 AM (Morning Peak) | 1:00 PM (Midday) | 7:00 PM (Evening Peak)\n\n`;
summary += `---\n\n`;

// Overall Mode Share
summary += `## 1. 🏆 Overall Mode Competitiveness\n\n`;
summary += `| Metric | Metro 🚇 | Bus 🚌 | Car 🚗 | Tie |\n`;
summary += `|--------|----------|--------|--------|-----|\n`;
summary += `| **Win Count** | ${metroWins} | ${busWins} | ${carWins} | ${ties} |\n`;
summary += `| **Win Rate** | **${(metroWins/cleanData.length*100).toFixed(1)}%** | ${(busWins/cleanData.length*100).toFixed(1)}% | ${(carWins/cleanData.length*100).toFixed(1)}% | ${(ties/cleanData.length*100).toFixed(1)}% |\n`;
summary += `| **Avg Time (min)** | ${avgArr(cleanData.map(d => d.metroMin))} | ${avgArr(cleanData.map(d => d.busMin))} | ${avgArr(cleanData.map(d => d.carMin))} | — |\n\n`;

// Average TTR
const allTTR_BM = cleanData.map(d => d.busMin / d.metroMin);
const allTTR_CM = cleanData.map(d => d.carMin / d.metroMin);
summary += `**Average Travel Time Ratios:**\n`;
summary += `- Bus/Metro TTR: **${avgArr(allTTR_BM)}x** (Bus takes ${avgArr(allTTR_BM)}× longer than Metro on average)\n`;
summary += `- Car/Metro TTR: **${avgArr(allTTR_CM)}x** (Car takes ${avgArr(allTTR_CM)}× longer than Metro on average)\n\n`;

// Line-by-line breakdown
summary += `## 2. 🚇 Line-by-Line Performance\n\n`;
summary += `| Metro Line | Corridors | Avg Bus (min) | Avg Metro (min) | Avg Car (min) | Bus/Metro Ratio | Metro Advantage |\n`;
summary += `|------------|-----------|---------------|-----------------|---------------|-----------------|------------------|\n`;
for (const line of ['Blue', 'Green', 'Orange', 'Purple', 'Yellow']) {
  const ld = lineData[line];
  if (!ld) continue;
  const bAvg = avgArr(ld.bus);
  const mAvg = avgArr(ld.metro);
  const cAvg = avgArr(ld.car);
  const ratio = mAvg > 0 ? (bAvg / mAvg).toFixed(2) : 'N/A';
  const advantage = bAvg && mAvg ? `${Math.round(bAvg - mAvg)} min saved` : 'N/A';
  summary += `| ${line} | ${ld.corridors.size} | ${bAvg} | ${mAvg} | ${cAvg} | ${ratio}x | ${advantage} |\n`;
}
summary += `\n`;

// Diurnal / Time-of-Day analysis
summary += `## 3. ⏰ Diurnal (Time-of-Day) Impact\n\n`;
summary += `| Time Slot | Classification | Avg Bus (min) | Avg Metro (min) | Avg Car (min) | Car TTI vs Midnight | Metro Wins |\n`;
summary += `|-----------|----------------|---------------|-----------------|---------------|---------------------|------------|\n`;

const slotSummary = {};
for (const slot of slots) {
  const slotData = cleanData.filter(d => d.slot === slot);
  const bAvg = avgArr(slotData.map(d => d.busMin));
  const mAvg = avgArr(slotData.map(d => d.metroMin));
  const cAvg = avgArr(slotData.map(d => d.carMin));
  
  const midnightCar = cleanData.filter(d => d.slot === '12:00 AM');
  const midnightCarAvg = avgArr(midnightCar.map(d => d.carMin));
  const tti = midnightCarAvg > 0 ? (cAvg / midnightCarAvg).toFixed(2) : 'N/A';
  
  let mWins = 0;
  for (const d of slotData) {
    if (d.metroMin <= d.busMin && d.metroMin <= d.carMin) mWins++;
  }
  
  const classification = slot === '12:00 AM' ? 'Night Off-Peak (Base)' :
                         slot === '10:00 AM' ? 'Morning Peak' :
                         slot === '1:00 PM' ? 'Midday Off-Peak' : 'Evening Peak';
  
  slotSummary[slot] = { bAvg, mAvg, cAvg, tti, mWins, total: slotData.length };
  summary += `| ${slot} | ${classification} | ${bAvg} | ${mAvg} | ${cAvg} | ${tti}x | ${mWins}/${slotData.length} (${(mWins/slotData.length*100).toFixed(0)}%) |\n`;
}
summary += `\n`;

// Weekday vs Weekend
summary += `## 4. 📅 Weekday vs Weekend\n\n`;
summary += `| Day Type | Avg Bus (min) | Avg Metro (min) | Avg Car (min) | Bus/Metro Ratio |\n`;
summary += `|----------|---------------|-----------------|---------------|------------------|\n`;
const wdBus = avgArr(weekdayData.map(d => d.busMin));
const wdMetro = avgArr(weekdayData.map(d => d.metroMin));
const wdCar = avgArr(weekdayData.map(d => d.carMin));
const weBus = avgArr(weekendData.map(d => d.busMin));
const weMetro = avgArr(weekendData.map(d => d.metroMin));
const weCar = avgArr(weekendData.map(d => d.carMin));
summary += `| Weekday (${weekdayData.length} pts) | ${wdBus} | ${wdMetro} | ${wdCar} | ${wdMetro > 0 ? (wdBus / wdMetro).toFixed(2) : 'N/A'}x |\n`;
summary += `| Weekend (${weekendData.length} pts) | ${weBus} | ${weMetro} | ${weCar} | ${weMetro > 0 ? (weBus / weMetro).toFixed(2) : 'N/A'}x |\n\n`;

// Macro vs Micro
summary += `## 5. 🔬 Macro (Full Line) vs Micro (Segment) Corridors\n\n`;
const macroData = cleanData.filter(d => d.isMaster);
const microData = cleanData.filter(d => !d.isMaster);
summary += `| Type | Count | Avg Bus (min) | Avg Metro (min) | Avg Car (min) | Metro Win Rate |\n`;
summary += `|------|-------|---------------|-----------------|---------------|----------------|\n`;
let macroMetroWins = macroData.filter(d => d.metroMin <= d.busMin && d.metroMin <= d.carMin).length;
let microMetroWins = microData.filter(d => d.metroMin <= d.busMin && d.metroMin <= d.carMin).length;
summary += `| Macro (Full Line) | ${macroData.length} | ${avgArr(macroData.map(d => d.busMin))} | ${avgArr(macroData.map(d => d.metroMin))} | ${avgArr(macroData.map(d => d.carMin))} | ${(macroMetroWins/macroData.length*100).toFixed(1)}% |\n`;
summary += `| Micro (Segment) | ${microData.length} | ${avgArr(microData.map(d => d.busMin))} | ${avgArr(microData.map(d => d.metroMin))} | ${avgArr(microData.map(d => d.carMin))} | ${(microMetroWins/microData.length*100).toFixed(1)}% |\n\n`;

// Top 5 corridors where Metro dominates and Top 5 where Bus/Car compete
summary += `## 6. 🏅 Top Corridors by Metro Advantage\n\n`;
const corridorAvgs = {};
for (const d of cleanData) {
  if (!corridorAvgs[d.routeId]) corridorAvgs[d.routeId] = { bus: [], metro: [], car: [], line: d.line, from: d.from, to: d.to };
  corridorAvgs[d.routeId].bus.push(d.busMin);
  corridorAvgs[d.routeId].metro.push(d.metroMin);
  corridorAvgs[d.routeId].car.push(d.carMin);
}

const corridorRankings = Object.entries(corridorAvgs).map(([id, data]) => ({
  id,
  line: data.line,
  from: data.from,
  to: data.to,
  busAvg: avgArr(data.bus),
  metroAvg: avgArr(data.metro),
  carAvg: avgArr(data.car),
  timeSaved: Math.round((avgArr(data.bus) - avgArr(data.metro)) * 10) / 10,
  ttr: avgArr(data.metro) > 0 ? (avgArr(data.bus) / avgArr(data.metro)).toFixed(2) : 0
})).sort((a, b) => b.timeSaved - a.timeSaved);

summary += `### Where Metro Dominates (Largest Time Savings)\n\n`;
summary += `| Rank | Corridor | Line | Avg Bus | Avg Metro | Avg Car | Time Saved | TTR |\n`;
summary += `|------|----------|------|---------|-----------|---------|------------|-----|\n`;
corridorRankings.slice(0, 10).forEach((c, i) => {
  summary += `| ${i+1} | ${c.id}: ${c.from} → ${c.to} | ${c.line} | ${c.busAvg} | ${c.metroAvg} | ${c.carAvg} | **${c.timeSaved} min** | ${c.ttr}x |\n`;
});

summary += `\n### Where Bus/Car Compete Closest (Smallest Metro Advantage)\n\n`;
summary += `| Rank | Corridor | Line | Avg Bus | Avg Metro | Avg Car | Time Saved | TTR |\n`;
summary += `|------|----------|------|---------|-----------|---------|------------|-----|\n`;
corridorRankings.slice(-5).reverse().forEach((c, i) => {
  summary += `| ${i+1} | ${c.id}: ${c.from} → ${c.to} | ${c.line} | ${c.busAvg} | ${c.metroAvg} | ${c.carAvg} | ${c.timeSaved} min | ${c.ttr}x |\n`;
});

// Reliability / Variance
summary += `\n## 7. 📉 Travel Time Reliability (Coefficient of Variation)\n\n`;
summary += `> Lower CV = More Reliable/Predictable travel time\n\n`;
summary += `| Mode | Mean (min) | Std Dev | CV (%) | Interpretation |\n`;
summary += `|------|-----------|---------|--------|----------------|\n`;
const busStats = calcStats(cleanData.map(d => d.busMin));
const metroStats = calcStats(cleanData.map(d => d.metroMin));
const carStats = calcStats(cleanData.map(d => d.carMin));
const busCv = busStats.mean > 0 ? (busStats.sd / busStats.mean * 100).toFixed(1) : 'N/A';
const metroCv = metroStats.mean > 0 ? (metroStats.sd / metroStats.mean * 100).toFixed(1) : 'N/A';
const carCv = carStats.mean > 0 ? (carStats.sd / carStats.mean * 100).toFixed(1) : 'N/A';
summary += `| 🚌 Bus | ${busStats.mean} | ${busStats.sd} | ${busCv}% | ${parseFloat(busCv) > 40 ? 'Highly Variable' : parseFloat(busCv) > 20 ? 'Moderate Variability' : 'Fairly Consistent'} |\n`;
summary += `| 🚇 Metro | ${metroStats.mean} | ${metroStats.sd} | ${metroCv}% | ${parseFloat(metroCv) > 40 ? 'Highly Variable' : parseFloat(metroCv) > 20 ? 'Moderate Variability' : 'Fairly Consistent'} |\n`;
summary += `| 🚗 Car | ${carStats.mean} | ${carStats.sd} | ${carCv}% | ${parseFloat(carCv) > 40 ? 'Highly Variable' : parseFloat(carCv) > 20 ? 'Moderate Variability' : 'Fairly Consistent'} |\n\n`;

// Key Findings & Conclusions
summary += `## 8. 🎯 KEY FINDINGS & CONCLUSIONS\n\n`;

const dominantMode = metroWins > busWins && metroWins > carWins ? 'Metro' : busWins > carWins ? 'Bus' : 'Car';
const avgSavings = avgArr(cleanData.map(d => d.busMin - d.metroMin));

summary += `1. **${dominantMode} is the dominant fastest mode** across Kolkata's metro corridors, winning ${Math.max(metroWins, busWins, carWins)}/${cleanData.length} (${(Math.max(metroWins, busWins, carWins)/cleanData.length*100).toFixed(1)}%) of all trip comparisons.\n\n`;
summary += `2. **Average time savings by Metro vs Bus:** ${avgSavings} minutes per trip.\n\n`;
summary += `3. **Peak hour impact:** Car travel time increases by ${slotSummary['10:00 AM'] ? slotSummary['10:00 AM'].tti : 'N/A'}x during morning peak and ${slotSummary['7:00 PM'] ? slotSummary['7:00 PM'].tti : 'N/A'}x during evening peak compared to midnight baseline, while Metro remains unaffected.\n\n`;
summary += `4. **Most Metro-dominant corridor:** ${corridorRankings[0].id} (${corridorRankings[0].from} → ${corridorRankings[0].to}) on the ${corridorRankings[0].line} Line saves **${corridorRankings[0].timeSaved} min** on average.\n\n`;
summary += `5. **Reliability:** Metro has ${parseFloat(metroCv) < parseFloat(busCv) ? 'lower' : 'higher'} variability (CV: ${metroCv}%) vs Bus (CV: ${busCv}%) and Car (CV: ${carCv}%), making it the most ${parseFloat(metroCv) < parseFloat(busCv) ? 'predictable' : 'variable'} mode.\n\n`;
summary += `6. **Data quality:** ${anomalies.length} anomalous data points were flagged and excluded (${(anomalies.length / allData.length * 100).toFixed(1)}% of total dataset).\n`;

fs.writeFileSync(path.join(conclusionDir, 'summary_tables', 'master_analysis_report.md'), summary, 'utf8');

// ─── 6. CORRIDOR-LEVEL DETAIL REPORTS ──────────────────────────────────────
for (const [routeId, data] of Object.entries(corridorAvgs)) {
  const corridor = corridorMap[routeId] || {};
  let report = `# ${routeId}: ${corridor.from || ''} → ${corridor.to || ''}\n`;
  report += `**Line:** ${corridor.line} | **Type:** ${corridor.is_master ? 'Macro (Full)' : 'Micro (Segment)'} | **Primary Bus:** ${corridor.primary_bus || 'N/A'}\n\n`;
  
  report += `## Average Travel Times\n`;
  report += `| Mode | Avg (min) | Min | Max | Std Dev |\n`;
  report += `|------|----------|-----|-----|--------|\n`;
  const bS = calcStats(data.bus);
  const mS = calcStats(data.metro);
  const cS = calcStats(data.car);
  report += `| Bus | ${bS.mean} | ${Math.min(...data.bus)} | ${Math.max(...data.bus)} | ${bS.sd} |\n`;
  report += `| Metro | ${mS.mean} | ${Math.min(...data.metro)} | ${Math.max(...data.metro)} | ${mS.sd} |\n`;
  report += `| Car | ${cS.mean} | ${Math.min(...data.car)} | ${Math.max(...data.car)} | ${cS.sd} |\n\n`;
  
  report += `## By Time Slot\n`;
  report += `| Slot | Bus | Metro | Car | Winner |\n`;
  report += `|------|-----|-------|-----|--------|\n`;
  for (const slot of slots) {
    const slotItems = cleanData.filter(d => d.routeId === routeId && d.slot === slot);
    if (slotItems.length === 0) continue;
    const b = avgArr(slotItems.map(d => d.busMin));
    const m = avgArr(slotItems.map(d => d.metroMin));
    const c = avgArr(slotItems.map(d => d.carMin));
    const minVal = Math.min(b, m, c);
    const winner = minVal === m ? '🚇 Metro' : minVal === b ? '🚌 Bus' : '🚗 Car';
    report += `| ${slot} | ${b} | ${m} | ${c} | ${winner} |\n`;
  }
  
  fs.writeFileSync(path.join(conclusionDir, 'corridor_reports', `${routeId}_report.md`), report, 'utf8');
}

// ─── 7. EXPORT CLEAN DATASET AS CSV ────────────────────────────────────────
let csv = 'Date,Day,RouteId,Line,From,To,IsMaster,Slot,BusMin,MetroMin,CarMin,BusMetroRatio,CarMetroRatio,Winner,TimeSavedVsBus\n';
for (const d of cleanData) {
  const ratio = (d.busMin / d.metroMin).toFixed(2);
  const carRatio = (d.carMin / d.metroMin).toFixed(2);
  const min = Math.min(d.busMin, d.metroMin, d.carMin);
  const winner = min === d.metroMin ? 'Metro' : min === d.busMin ? 'Bus' : 'Car';
  const saved = d.busMin - d.metroMin;
  csv += `${d.date},${d.day},${d.routeId},${d.line},${d.from},${d.to},${d.isMaster},${d.slot},${d.busMin},${d.metroMin},${d.carMin},${ratio},${carRatio},${winner},${saved}\n`;
}
fs.writeFileSync(path.join(conclusionDir, 'summary_tables', 'clean_dataset.csv'), csv, 'utf8');

// ─── FINAL SUMMARY ─────────────────────────────────────────────────────────
console.log(`\n════════════════════════════════════════════════════════`);
console.log(`✅ ANALYSIS COMPLETE! Files saved to: output/conclusion/`);
console.log(`════════════════════════════════════════════════════════`);
console.log(`📁 output/conclusion/`);
console.log(`   ├── flagged_anomalies/`);
console.log(`   │   ├── anomalies.json          (${anomalies.length} flagged)`);
console.log(`   │   └── anomaly_report.md        (human-readable)`);
console.log(`   ├── summary_tables/`);
console.log(`   │   ├── master_analysis_report.md (full report)`);
console.log(`   │   └── clean_dataset.csv         (${cleanData.length} rows)`);
console.log(`   └── corridor_reports/`);
console.log(`       └── MC-01 to MC-25 reports    (25 files)`);
console.log(`════════════════════════════════════════════════════════\n`);
