const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const { getTravelTime, randomDelay } = require('./scraper');

const outDir = path.join(__dirname, "output");

// Create organized subdirectories
const excelDir = path.join(outDir, "excel");
const checkpointDir = path.join(outDir, "checkpoints");
const screenshotDir = path.join(outDir, "screenshots");
const logDir = path.join(outDir, "logs");
[outDir, excelDir, checkpointDir, screenshotDir, logDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Setup a scraper.txt file to log all console output
const logFile = fs.createWriteStream(path.join(logDir, 'scraper.txt'), { flags: 'a' });
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

function calcRatio(carMin, metroMin) {
  if (!carMin || !metroMin || metroMin <= 0) return "N/A";
  return (carMin / metroMin).toFixed(2) + "x";
}

function calcDiff(carMin, metroMin) {
  if (!carMin || !metroMin) return "N/A";
  const diff = carMin - metroMin;
  if (diff > 0) return `${diff} min (Metro Faster)`;
  if (diff < 0) return `${Math.abs(diff)} min (Car Faster)`;
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

// Helper: get organized screenshot directory for a given date, time slot, and corridor
function getScreenshotDir(dateIST, slotStr, routeId) {
  const slotFolder = slotStr.replace(/[:\\/\s]/g, '_');
  const ssDir = path.join(screenshotDir, dateIST, slotFolder, routeId);
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });
  return ssDir;
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
    customTimeArg = "4times";
  } else {
    targetSlots = [customTimeArg];
  }
  const routesToScrape = (targetRouteId && targetRouteId.toLowerCase() !== "all") 
    ? segments.filter(r => r.id.toUpperCase() === targetRouteId.toUpperCase()) 
    : segments;

  console.log(`\n==============================================================================`);
  console.log(` ⏰ METRO vs. CAR SCRAPER ENGINE (${targetSlots.join(" | ")})`);
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

  const checkpointPath = path.join(checkpointDir, `checkpoint_${dateStamp}.json`);
  const filePath = path.join(excelDir, `Metro_vs_Car_Data_${dateStamp}.xlsx`);

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
          console.log(`\n   ⏰ Slot: [${targetTime}] — Searching synchronized Metro vs Car data...`);

          // Organized screenshot paths: output/screenshots/YYYY-MM-DD/slot/MC-01/{metro.jpg, car.jpg}
          const ssDir = getScreenshotDir(dateIST, targetTime, route.id);
          const metroSsPath = path.join(ssDir, `metro.jpg`);
          const carSsPath = path.join(ssDir, `car.jpg`);

          const isNow = customTimeArg && customTimeArg.toLowerCase() === "now";

          const metroFrom = route.from_metro || route.from;
          const metroTo = route.to_metro || route.to;
          const carFrom = route.from_car || route.from;
          const carTo = route.to_car || route.to;
          const carWaypoints = Array.isArray(route.car_waypoints) ? route.car_waypoints : [];

          // Fetch Metro and Car in PARALLEL for maximum speed
          const [metroResult, carResult] = await Promise.all([
            getTravelTime(browser, metroFrom, metroTo, "metro", {
              keepPageOpen: false,
              targetTime: isNow ? null : targetTime,
              screenshotPath: metroSsPath
            }),
            getTravelTime(browser, carFrom, carTo, "driving", {
              keepPageOpen: false,
              targetTime: isNow ? null : targetTime,
              screenshotPath: carSsPath,
              waypoints: carWaypoints
            })
          ]);

          const metroData = {
            timeRaw: metroResult.success ? metroResult.durationText : "N/A",
            timeMin: metroResult.success ? metroResult.minutes : null,
            distanceKm: (metroResult.success && metroResult.distanceKm) ? metroResult.distanceKm : route.metro_km,
            actualMetro: metroResult.success ? metroResult.actualMetro : "N/A",
            walkTime: metroResult.success ? metroResult.walkTime : "N/A",
            fullRoute: metroResult.success ? metroResult.fullRoute : "N/A",
            rawDetails: metroResult.success ? metroResult.rawDetails : "N/A",
            url: metroResult.url || "",
            screenshotPath: metroResult.success && fs.existsSync(metroSsPath) ? metroSsPath : null
          };
          console.log(`      🚇 Metro: ${metroData.timeRaw} (${metroData.distanceKm} km) | Metro Used: ${metroData.actualMetro} | Walk: ${metroData.walkTime} ${metroResult.success ? "" : "(Failed)"}`);

          const carData = {
            timeRaw: carResult.success ? carResult.durationText : "N/A",
            timeMin: carResult.success ? carResult.minutes : null,
            distanceKm: (carResult.success && carResult.distanceKm) ? carResult.distanceKm : route.car_km,
            rawDetails: carResult.success ? carResult.rawDetails : "N/A",
            url: carResult.url || "",
            screenshotPath: carResult.success && fs.existsSync(carSsPath) ? carSsPath : null
          };
          console.log(`      🚗 Car: ${carData.timeRaw} (${carData.distanceKm} km) ${carResult.success ? "" : "(Failed)"}`);

          const scrapedAtStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          resultsByRoute[route.id][targetTime] = {
            scrapedAt: scrapedAtStr,
            metroKm: metroData.distanceKm,
            metroTimeRaw: metroData.timeRaw,
            metroMin: metroData.timeMin,
            metroUsed: metroData.actualMetro,
            metroWalk: metroData.walkTime,
            metroFullRoute: metroData.fullRoute,
            metroRawDetails: metroData.rawDetails,
            metroUrl: metroData.url,
            metroSsPath: metroData.screenshotPath,
            carKm: carData.distanceKm,
            carTimeRaw: carData.timeRaw,
            carMin: carData.timeMin,
            carRawDetails: carData.rawDetails,
            carUrl: carData.url,
            carSsPath: carData.screenshotPath,
            diffText: calcDiff(carData.timeMin, metroData.timeMin),
            ratioText: calcRatio(carData.timeMin, metroData.timeMin)
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
    const sheetName = slot.replace(/[:\\/]/g, "_");
    let sheet = workbook.getWorksheet(sheetName);
    if (sheet) {
      workbook.removeWorksheet(sheetName);
    }
    sheet = workbook.addWorksheet(sheetName);

    const headers = [
      "Date", "Day of Week", "Scraped At", "Corridor ID", "Metro Line", "Macro/Micro", "From", "To",
      "Metro Distance (km)", "Car Distance (km)",
      "Time Slot", "Peak Classification",
      "Actual Metro Taken", "Metro Walk (min)", "Metro Time (min)", "Metro Route Details", "Metro Raw Details",
      "Car Time (min)", "Car Raw Details",
      "Time Difference (Car vs Metro)", "Ratio (Car/Metro)", "Winning Mode", "Time Savings (%)",
      "Metro Link", "Car Link", "Metro Screenshot", "Car Screenshot"
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

      if (sData.metroMin && sData.carMin) {
        if (sData.metroMin < sData.carMin) {
          winningMode = "Metro";
          timeSavings = (((sData.carMin - sData.metroMin) / sData.carMin) * 100).toFixed(1) + "% (vs Car)";
        } else if (sData.carMin < sData.metroMin) {
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
        route.is_master ? "Macro (Full)" : "Micro (Segment)",
        route.from,
        route.to,
        sData.metroKm || route.metro_km || "",
        sData.carKm || route.car_km || "",
        slot,
        getPeakClassification(slot),
        sData.metroUsed || "N/A",
        sData.metroWalk || "N/A",
        sData.metroMin || "",
        sData.metroFullRoute || "N/A",
        sData.metroRawDetails || "N/A",
        sData.carMin || "",
        sData.carRawDetails || "N/A",
        sData.diffText || "",
        sData.ratioText || "",
        winningMode,
        timeSavings,
        sData.metroUrl ? { text: "Open Maps", hyperlink: sData.metroUrl } : "",
        sData.carUrl ? { text: "Open Maps", hyperlink: sData.carUrl } : "",
        sData.metroSsPath || "",
        sData.carSsPath || ""
      ];
      const addedRow = sheet.addRow(rowData);

      addedRow.eachCell((cell, colNumber) => {
        if (colNumber === 20 || colNumber === 22) {
          const val = String(cell.value || "");
          if (val.includes("Metro Faster") || val === "Metro") {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6E0B4" } };
          } else if (val.includes("Car Faster") || val === "Car") {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
          }
        }
      });
    }

    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: sheet.getColumn(sheet.columnCount).letter + '1' };
  });

  // 2. Create All Periods Combined sheet
  const summarySheetName = "All Periods Combined";
  if (workbook.getWorksheet(summarySheetName)) {
    workbook.removeWorksheet(summarySheetName);
  }
  const summarySheet = workbook.addWorksheet(summarySheetName);
  
  const allSlotsSet = new Set();
  for (const routeId in resultsByRoute) {
    for (const slot in resultsByRoute[routeId]) {
      allSlotsSet.add(slot);
    }
  }
  const allSlots = Array.from(allSlotsSet);

  const sumHeaders = ["Corridor ID", "Metro Line", "From", "To", "Metro Distance (km)", "Car Distance (km)"];
  allSlots.forEach(slot => {
    sumHeaders.push(
      `${slot} Scraped At`,
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
      route.to,
      route.metro_km || "",
      route.car_km || ""
    ];
    allSlots.forEach(slot => {
      const sData = rRes[slot] || {};
      let fasterMode = "N/A";
      let timeSavings = "N/A";
      
      if (sData.metroMin && sData.carMin) {
        if (sData.metroMin < sData.carMin) {
          fasterMode = "Metro";
          timeSavings = (((sData.carMin - sData.metroMin) / sData.carMin) * 100).toFixed(1) + "% (vs Car)";
        } else if (sData.carMin < sData.metroMin) {
          fasterMode = "Car";
          timeSavings = (((sData.metroMin - sData.carMin) / sData.metroMin) * 100).toFixed(1) + "% (vs Metro)";
        } else {
          fasterMode = "Tie";
          timeSavings = "0%";
        }
      }

      rowData.push(
        sData.scrapedAt || "",
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
    
    addedRow.eachCell((cell, colNumber) => {
      if (colNumber >= 12 && (colNumber - 12) % 9 === 0) { 
        const val = String(cell.value || "");
        if (val === "Metro") {
          cell.font = { bold: true, color: { argb: "FF38761D" } };
        } else if (val === "Car") {
          cell.font = { bold: true, color: { argb: "FF2F5597" } };
        }
      }
    });
  }

  summarySheet.views = [{ state: 'frozen', ySplit: 1, xSplit: 4 }];
  summarySheet.autoFilter = { from: 'A1', to: summarySheet.getColumn(summarySheet.columnCount).letter + '1' };

  await workbook.xlsx.writeFile(filePath);
}
