const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const { getTravelTime, randomDelay } = require('./scraper');

const outDir = path.join(__dirname, "output");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Setup a scraper.txt file to log all console output
const logFile = fs.createWriteStream(path.join(outDir, 'scraper.txt'), { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;
console.log = function (...args) {
  originalLog.apply(console, args);
  logFile.write(args.join(' ') + '\n');
};
console.error = function (...args) {
  originalError.apply(console, args);
  logFile.write('ERROR: ' + args.join(' ') + '\n');
};

// 1. Load segments from segments.json
function loadSegments() {
  const content = fs.readFileSync('segments.json', 'utf8');
  return JSON.parse(content);
}

function timeToMin(str) {
  if (!str) return null;
  let m = 0;
  const hr = str.match(/(\d+)\s*(?:hr|hour|h)/i);
  const mn = str.match(/(\d+)\s*(?:min|m)/i);
  if (hr) m += parseInt(hr[1], 10) * 60;
  if (mn) m += parseInt(mn[1], 10);
  return m > 0 ? m : null;
}

function calcRatio(busMin, metroMin) {
  if (!busMin || !metroMin || metroMin <= 0) return "N/A";
  return (busMin / metroMin).toFixed(2) + "x";
}

function calcDiff(busMin, metroMin) {
  if (!busMin || !metroMin) return "N/A";
  const diff = busMin - metroMin;
  if (diff > 0) return `${diff} min (Metro Faster)`;
  if (diff < 0) return `${Math.abs(diff)} min (Bus Faster)`;
  return "Equal";
}

function getPeakClassification(slotStr) {
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
  const dayType = isWeekend ? "Weekend" : "Weekday";
  if (String(slotStr).includes("10:00 AM")) return `${dayName} (${dayType}) - Morning Peak`;
  if (String(slotStr).includes("1:00 PM")) return `${dayName} (${dayType}) - Mid-day Off-Peak`;
  if (String(slotStr).includes("7:00 PM")) return `${dayName} (${dayType}) - Evening Peak`;
  if (String(slotStr).includes("12:00 AM")) return `${dayName} (${dayType}) - Night Off-Peak`;
  return `${dayName} (${dayType}) - ${slotStr}`;
}

(async () => {
  const segments = loadSegments();
  let targetSlots = [];
  const targetRouteId = process.argv[2];
  let customTimeArg = process.argv[3];
  
  if (customTimeArg && customTimeArg.toLowerCase() === "now") {
    const ist = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const h = ist.getHours();
    const m = ist.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    targetSlots = [`${h12}:${String(m).padStart(2, '0')} ${ampm}`];
  } else if (!customTimeArg || customTimeArg.toLowerCase() === "4times") {
    targetSlots = ["10:00 AM", "1:00 PM", "7:00 PM", "12:00 AM"];
    customTimeArg = "4times"; // to prevent isNow logic
  } else {
    targetSlots = [customTimeArg];
  }
  const routesToScrape = (targetRouteId && targetRouteId.toLowerCase() !== "all") 
    ? segments.filter(r => r.id.toUpperCase() === targetRouteId.toUpperCase()) 
    : segments;

  console.log(`\n==============================================================================`);
  console.log(` ⏰ METRO SCRAPER ENGINE (${targetSlots.join(" | ")})`);
  console.log(`==============================================================================`);
  console.log(`🛣️ Routes to process: ${routesToScrape.length} corridors`);
  console.log(`🎯 Time Slots:        ${targetSlots.join(" | ")}`);
  console.log(`==============================================================================\n`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--window-position=-32000,-32000",
      "--window-size=1920,1080",
      "--lang=en-US,en"
    ]
  });

  let dateIST = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 10);
  let dayName = new Date().toLocaleDateString('en-US', { timeZone: "Asia/Kolkata", weekday: 'short' });
  
  if (process.env.BACKFILL_DATE) {
    const d = new Date(process.env.BACKFILL_DATE);
    dateIST = d.toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 10);
    dayName = d.toLocaleDateString('en-US', { timeZone: "Asia/Kolkata", weekday: 'short' });
  }

  const dateStamp = `${dateIST}_${dayName}`; 

  const checkpointPath = path.join(outDir, `checkpoint_${dateStamp}.json`);
  const filePath = path.join(outDir, `Bus_vs_Metro_Data_${dateStamp}.xlsx`);

  let resultsByRoute = {};
  if (fs.existsSync(checkpointPath)) {
    try {
      resultsByRoute = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
      console.log(`✅ Loaded existing checkpoint with ${Object.keys(resultsByRoute).length} completed routes.`);
    } catch (e) {
      console.log(`⚠️ Could not read checkpoint file, starting fresh.`);
    }
  }

  try {
    for (const route of routesToScrape) {
      if (resultsByRoute[route.id]) {
        const allSlotsCompleted = targetSlots.every(slot => resultsByRoute[route.id][slot]);
        if (allSlotsCompleted) {
          console.log(`\n⏭️ Route [${route.id}] already completed in checkpoint. Skipping...`);
          continue;
        }
      }
      console.log(`\n──────────────────────────────────────────────────────────────────────────────`);
      console.log(`🚀 PROCESSING CORRIDOR [${route.id}]: ${route.line} | ${route.from} -> ${route.to}`);
      console.log(`──────────────────────────────────────────────────────────────────────────────`);
      if (!resultsByRoute[route.id]) resultsByRoute[route.id] = {};

      try {
        for (const targetTime of targetSlots) {
          if (resultsByRoute[route.id][targetTime]) {
            console.log(`   ⏰ Slot: [${targetTime}] — Already completed. Skipping.`);
            continue;
          }
          console.log(`\n   ⏰ Slot: [${targetTime}] — Searching synchronized Bus vs Metro data...`);

          let allowedBuses = [];
          if (route.primary_bus) allowedBuses.push(route.primary_bus);
          if (route.backup_buses && route.backup_buses.length) allowedBuses.push(...route.backup_buses);

          const busFrom = route.from_bus || route.from;
          const busTo = route.to_bus || route.to;
          const busSsPath = path.join(outDir, `ss_bus_${route.id}_${targetTime.replace(/[:\/\s]/g, '_')}.jpg`);
          const isNow = customTimeArg && customTimeArg.toLowerCase() === "now";

          const metroFrom = route.from_metro || route.from;
          const metroTo = route.to_metro || route.to;
          const metroSsPath = path.join(outDir, `ss_metro_${route.id}_${targetTime.replace(/[:\/\s]/g, '_')}.jpg`);

          const carSsPath = path.join(outDir, `ss_car_${route.id}_${targetTime.replace(/[:\/\s]/g, '_')}.jpg`);

          // Fetch Bus, Metro, and Car in PARALLEL for maximum speed
          const [busResult, metroResult, carResult] = await Promise.all([
            getTravelTime(browser, busFrom, busTo, "bus", {
              allowedBuses,
              keepPageOpen: false,
              targetTime: isNow ? null : targetTime,
              screenshotPath: busSsPath
            }),
            getTravelTime(browser, metroFrom, metroTo, "metro", {
              keepPageOpen: false,
              targetTime: isNow ? null : targetTime,
              screenshotPath: metroSsPath
            }),
            getTravelTime(browser, busFrom, busTo, "driving", {
              keepPageOpen: false,
              targetTime: isNow ? null : targetTime,
              screenshotPath: carSsPath
            })
          ]);

          const busData = {
            timeRaw: busResult.success ? busResult.durationText : "N/A",
            timeMin: busResult.success ? busResult.minutes : null,
            actualBus: busResult.success ? busResult.actualBus : "N/A",
            walkTime: busResult.success ? busResult.walkTime : "N/A",
            fullRoute: busResult.success ? busResult.fullRoute : "N/A",
            rawDetails: busResult.success ? busResult.rawDetails : "N/A",
            url: busResult.url || "",
            screenshotPath: busResult.success && fs.existsSync(busSsPath) ? busSsPath : null
          };
          console.log(`      🚌 Bus: ${busData.timeRaw} | Bus Used: ${busData.actualBus} | Walk: ${busData.walkTime} ${busResult.success ? "" : "(Failed)"}`);

          const metroData = {
            timeRaw: metroResult.success ? metroResult.durationText : "N/A",
            timeMin: metroResult.success ? metroResult.minutes : null,
            actualMetro: metroResult.success ? metroResult.actualMetro : "N/A",
            walkTime: metroResult.success ? metroResult.walkTime : "N/A",
            fullRoute: metroResult.success ? metroResult.fullRoute : "N/A",
            rawDetails: metroResult.success ? metroResult.rawDetails : "N/A",
            url: metroResult.url || "",
            screenshotPath: metroResult.success && fs.existsSync(metroSsPath) ? metroSsPath : null
          };
          console.log(`      🚇 Metro: ${metroData.timeRaw} | Metro Used: ${metroData.actualMetro} | Walk: ${metroData.walkTime} ${metroResult.success ? "" : "(Failed)"}`);

          const carData = {
            timeRaw: carResult.success ? carResult.durationText : "N/A",
            timeMin: carResult.success ? carResult.minutes : null,
            url: carResult.url || "",
            screenshotPath: carResult.success && fs.existsSync(carSsPath) ? carSsPath : null
          };
          console.log(`      🚗 Car: ${carData.timeRaw} ${carResult.success ? "" : "(Failed)"}`);

          const scrapedAtStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          resultsByRoute[route.id][targetTime] = {
            scrapedAt: scrapedAtStr,
            busTimeRaw: busData.timeRaw,
            busMin: busData.timeMin,
            busUsed: busData.actualBus,
            busWalk: busData.walkTime,
            busFullRoute: busData.fullRoute,
            busRawDetails: busData.rawDetails,
            busUrl: busData.url,
            busSsPath: busData.screenshotPath,
            metroTimeRaw: metroData.timeRaw,
            metroMin: metroData.timeMin,
            metroUsed: metroData.actualMetro,
            metroWalk: metroData.walkTime,
            metroFullRoute: metroData.fullRoute,
            metroRawDetails: metroData.rawDetails,
            metroUrl: metroData.url,
            metroSsPath: metroData.screenshotPath,
            carTimeRaw: carData.timeRaw,
            carMin: carData.timeMin,
            carUrl: carData.url,
            carSsPath: carData.screenshotPath,
            diffText: calcDiff(busData.timeMin, metroData.timeMin),
            ratioText: calcRatio(busData.timeMin, metroData.timeMin)
          };
          
          await randomDelay(2000, 4000);
        }

        // Save checkpoint and export intermediate Excel after every route completes its slots
        fs.writeFileSync(checkpointPath, JSON.stringify(resultsByRoute, null, 2), 'utf8');
        console.log(`\n  💾 Saved checkpoint & updated Excel file for Route [${route.id}]...`);
        
        await exportToExcel(routesToScrape, targetSlots, resultsByRoute, filePath);
      } catch (innerErr) {
        console.error(`❌ Error scraping route [${route.id}]. Skipping to next route. Error:`, innerErr.message);
      }
    }

    console.log(`\n🎉 SUCCESS! All routes completed and saved to: ${filePath}\n`);
  } catch (err) {
    console.error("❌ Fatal error in scheduled 4-times scraper:", err);
  } finally {
    await browser.close();
  }
})();

async function exportToExcel(routesToScrape, targetSlots, resultsByRoute, filePath) {
  const workbook = new ExcelJS.Workbook();

  const allKnownSlots = new Set(targetSlots);
  for (const r in resultsByRoute) {
    for (const s in resultsByRoute[r]) {
      allKnownSlots.add(s);
    }
  }
  const effectiveSlots = Array.from(allKnownSlots).sort((a,b) => {
    return new Date("2000/01/01 " + a) - new Date("2000/01/01 " + b);
  });

  // 1. Create or Replace Individual Sheets for Each Time Period
  effectiveSlots.forEach(slot => {
    const sheetName = slot.replace(/[:\/]/g, "_");
    let sheet = workbook.getWorksheet(sheetName);
    if (sheet) {
      workbook.removeWorksheet(sheetName);
    }
    sheet = workbook.addWorksheet(sheetName);

    const headers = [
      "Date", "Day of Week", "Scraped At", "Corridor ID", "Metro Line", "Primary Bus", "Macro/Micro", "From", "To",
      "Time Slot", "Peak Classification",
      "Actual Bus Taken", "Bus Walk (min)", "Bus Time (min)", "Bus Route Details", "Bus Raw Details",
      "Actual Metro Taken", "Metro Walk (min)", "Metro Time (min)", "Metro Route Details", "Metro Raw Details",
      "Car Time (min)",
      "Time Difference", "Ratio (Bus/Metro)", "Winning Mode", "Time Savings (%)",
      "Bus Link", "Metro Link", "Car Link", "Bus Screenshot", "Metro Screenshot", "Car Screenshot"
    ];
    const hdrRow = sheet.addRow(headers);
    hdrRow.font = { bold: true, color: { argb: "FFFFFFFF" }, name: 'Segoe UI', size: 11 };
    hdrRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };

    const dateIST = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 10);
    const dayName = new Date().toLocaleDateString('en-US', { timeZone: "Asia/Kolkata", weekday: 'long' });

    for (const route of routesToScrape) {
      const rRes = resultsByRoute[route.id] || {};
      const sData = rRes[slot] || {};
      
      let winningMode = "N/A";
      let timeSavings = "N/A";

      if (sData.busMin && sData.metroMin && sData.carMin) {
        const minTime = Math.min(sData.busMin, sData.metroMin, sData.carMin);
        if (minTime === sData.busMin && minTime < sData.metroMin && minTime < sData.carMin) {
          winningMode = "Bus";
          timeSavings = (((sData.metroMin - sData.busMin) / sData.metroMin) * 100).toFixed(1) + "% (vs Metro)";
        } else if (minTime === sData.metroMin && minTime < sData.busMin && minTime < sData.carMin) {
          winningMode = "Metro";
          timeSavings = (((sData.busMin - sData.metroMin) / sData.busMin) * 100).toFixed(1) + "% (vs Bus)";
        } else if (minTime === sData.carMin && minTime < sData.busMin && minTime < sData.metroMin) {
          winningMode = "Car";
          timeSavings = (((sData.metroMin - sData.carMin) / sData.metroMin) * 100).toFixed(1) + "% (vs Metro)";
        } else {
          winningMode = "Tie";
          timeSavings = "0%";
        }
      }

      const rowData = [
        dateIST,
        dayName,
        sData.scrapedAt || "N/A",
        route.id,
        route.line,
        route.primary_bus || "N/A",
        route.is_master ? "Macro (Full)" : "Micro (Segment)",
        route.from,
        route.to,
        slot,
        getPeakClassification(slot),
        sData.busUsed || "N/A",
        sData.busWalk || "N/A",
        sData.busMin || "",
        sData.busFullRoute || "N/A",
        sData.busRawDetails || "N/A",
        sData.metroUsed || "N/A",
        sData.metroWalk || "N/A",
        sData.metroMin || "",
        sData.metroFullRoute || "N/A",
        sData.metroRawDetails || "N/A",
        sData.carMin || "",
        sData.diffText || "",
        sData.ratioText || "",
        winningMode,
        timeSavings,
        sData.busUrl ? { text: "Open Maps", hyperlink: sData.busUrl } : "",
        sData.metroUrl ? { text: "Open Maps", hyperlink: sData.metroUrl } : "",
        sData.carUrl ? { text: "Open Maps", hyperlink: sData.carUrl } : "",
        "", "", ""
      ];
      const addedRow = sheet.addRow(rowData);
      addedRow.height = 135;
      const rowIndex = addedRow.number;

      const modes = [
        { path: sData.busSsPath, colIdx: 29 }, 
        { path: sData.metroSsPath, colIdx: 30 }, 
        { path: sData.carSsPath, colIdx: 31 }  
      ];

      for (const mode of modes) {
        if (mode.path && fs.existsSync(mode.path)) {
            try {
                const imgId = workbook.addImage({ filename: mode.path, extension: 'jpeg' });
                sheet.addImage(imgId, { 
                    tl: { col: mode.colIdx, row: rowIndex - 1 },
                    ext: { width: 240, height: 135 }
                });
            } catch(e) {
                console.log("Failed to add image", mode.path);
            }
        }
      }

      sheet.getColumn(30).width = 35;
      sheet.getColumn(31).width = 35;
      sheet.getColumn(32).width = 35;
      addedRow.eachCell((cell, colNumber) => {
        if (colNumber === 23 || colNumber === 25) { // Time Difference or Winning Mode
          const val = String(cell.value || "");
          if (val.includes("Metro Faster") || val === "Metro") {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6E0B4" } }; // light green
          } else if (val.includes("Bus Faster") || val === "Bus") {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCE4D6" } }; // light orange
          } else if (val === "Car") {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } }; // light blue
          }
        }
      });
    }

    sheet.getColumn(30).width = 30; // Bus Screenshot Column width
    sheet.getColumn(31).width = 30; // Metro Screenshot Column width
    sheet.getColumn(32).width = 30; // Car Screenshot Column width

    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: sheet.getColumn(sheet.columnCount).letter + '1' };
  });

  // 2. Create All Periods Combined sheet
  const summarySheetName = "All Periods Combined";
  if (workbook.getWorksheet(summarySheetName)) {
    workbook.removeWorksheet(summarySheetName);
  }
  const summarySheet = workbook.addWorksheet(summarySheetName);
  
  // Gather all unique slots from resultsByRoute
  const allSlotsSet = new Set();
  for (const routeId in resultsByRoute) {
    for (const slot in resultsByRoute[routeId]) {
      allSlotsSet.add(slot);
    }
  }
  // Sort slots by time if possible, or just keep insertion order. For simplicity, convert to Array
  const allSlots = Array.from(allSlotsSet);

  const sumHeaders = ["Corridor ID", "Metro Line", "From", "To"];
  allSlots.forEach(slot => {
    sumHeaders.push(
      `${slot} Scraped At`,
      `${slot} Actual Bus`,
      `${slot} Bus Walk`,
      `${slot} Bus (min)`,
      `${slot} Bus Route`,
      `${slot} Bus Raw Details`,
      `${slot} Actual Metro`,
      `${slot} Metro Walk`,
      `${slot} Metro (min)`,
      `${slot} Metro Route`,
      `${slot} Metro Raw Details`,
      `${slot} Car (min)`,
      `${slot} Faster Mode`,
      `${slot} Savings (%)`
    );
  });
  const sumHdrRow = summarySheet.addRow(sumHeaders);
  sumHdrRow.font = { bold: true, color: { argb: "FFFFFFFF" }, name: 'Segoe UI', size: 11 };
  sumHdrRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5597" } };

  for (const route of routesToScrape) {
    const rRes = resultsByRoute[route.id] || {};
    const rowData = [
      route.id,
      route.line,
      route.from,
      route.to
    ];
    allSlots.forEach(slot => {
      const sData = rRes[slot] || {};
      let fasterMode = "N/A";
      let timeSavings = "N/A";
      
      if (sData.busMin && sData.metroMin && sData.carMin) {
        const minTime = Math.min(sData.busMin, sData.metroMin, sData.carMin);
        if (minTime === sData.busMin && minTime < sData.metroMin && minTime < sData.carMin) {
          fasterMode = "Bus";
          timeSavings = (((sData.metroMin - sData.busMin) / sData.metroMin) * 100).toFixed(1) + "% (vs Metro)";
        } else if (minTime === sData.metroMin && minTime < sData.busMin && minTime < sData.carMin) {
          fasterMode = "Metro";
          timeSavings = (((sData.busMin - sData.metroMin) / sData.busMin) * 100).toFixed(1) + "% (vs Bus)";
        } else if (minTime === sData.carMin && minTime < sData.busMin && minTime < sData.metroMin) {
          fasterMode = "Car";
          timeSavings = (((sData.metroMin - sData.carMin) / sData.metroMin) * 100).toFixed(1) + "% (vs Metro)";
        } else {
          fasterMode = "Tie";
          timeSavings = "0%";
        }
      }

      rowData.push(
        sData.scrapedAt || "",
        sData.busUsed || "",
        sData.busWalk || "",
        sData.busMin || "",
        sData.busFullRoute || "",
        sData.busRawDetails || "",
        sData.metroUsed || "",
        sData.metroWalk || "",
        sData.metroMin || "",
        sData.metroFullRoute || "",
        sData.metroRawDetails || "",
        sData.carMin || "",
        fasterMode,
        timeSavings
      );
    });
    const addedRow = summarySheet.addRow(rowData);
    
    // Highlight Faster Mode columns
      addedRow.eachCell((cell, colNumber) => {
      // Faster Mode column is at 17, 31, 45... so (colNumber - 17) % 14 === 0
      if (colNumber >= 17 && (colNumber - 17) % 14 === 0) { 
        const val = String(cell.value || "");
        if (val === "Metro") {
          cell.font = { bold: true, color: { argb: "FF38761D" } }; // dark green
        } else if (val === "Bus") {
          cell.font = { bold: true, color: { argb: "FFA64D79" } }; // dark pink/purple
        } else if (val === "Car") {
          cell.font = { bold: true, color: { argb: "FF2F5597" } }; // dark blue
        }
      }
    });
  }

  summarySheet.views = [{ state: 'frozen', ySplit: 1, xSplit: 4 }];
  summarySheet.autoFilter = { from: 'A1', to: summarySheet.getColumn(summarySheet.columnCount).letter + '1' };

  await workbook.xlsx.writeFile(filePath);
}



