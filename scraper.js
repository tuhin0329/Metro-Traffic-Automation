/**
 * scraper.js
 * ----------
 * Core scraping function: given an origin and destination place name,
 * opens Google Maps directions in headless Chrome and extracts the
 * duration shown for a given travel mode.
 */

const puppeteer = require("puppeteer");

async function setArriveByTime(page, timeStr) {
  try {
    // Wait for the dropdown button to be visible
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('div[role="button"], button')).some(e => {
        if (e.offsetWidth === 0 || e.offsetHeight === 0) return false;
        const t = (e.textContent||'').trim();
        return t.includes('Leave now') || t.includes('Depart at') || t.includes('Arrive by');
      });
    }, { timeout: 10000 }).catch(() => {});

    // Set an ID on the dropdown and click it
    const dropdownSet = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div[role="button"], button')).filter(e => {
        if (e.offsetWidth === 0 || e.offsetHeight === 0) return false;
        const t = (e.textContent||'').trim();
        return t.includes('Leave now') || t.includes('Depart at') || t.includes('Arrive by');
      });
      if (btns.length > 0) {
         btns[0].id = 'my-custom-dropdown';
         return true;
      }
      return false;
    });
    
    if (!dropdownSet) return false;
    await page.click('#my-custom-dropdown');
    await new Promise(r => setTimeout(r, 1500));

    // Wait for 'Depart at' option
    await page.waitForFunction(() => {
      const opts = Array.from(document.querySelectorAll('li, div[role="menuitemradio"], div[role="menuitem"], div[role="option"]'));
      return opts.some(e => (e.textContent||'').includes('Depart at') || (e.textContent||'').includes('Arrive by'));
    }, { timeout: 5000 }).catch(() => {});

    // Set an ID on 'Depart at' option and click it
    const departAtSet = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li, div[role="menuitemradio"], div[role="menuitem"], div[role="option"]')).filter(e => {
         if (e.offsetWidth === 0 || e.offsetHeight === 0) return false;
         return (e.textContent||'').includes('Arrive by') || (e.textContent||'').includes('Depart at');
      });
      if (items.length > 0) {
         items[0].id = 'my-custom-depart-at';
         return true;
      }
      return false;
    });
    
    if (departAtSet) {
        await page.click('#my-custom-depart-at');
    }
    await new Promise(r => setTimeout(r, 1500));

    // Type the time and hit enter
    const inputEl = await page.$('input[name="transit-time"], input[class*="LgGJQc"]');
    if (inputEl) {
      await inputEl.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await inputEl.type(timeStr, { delay: 100 });
      await page.keyboard.press('Enter');
      
      // Wait for results to reload
      try {
        await page.waitForFunction(() => {
           return document.querySelectorAll('div[id^="section-directions-trip-"], div[data-trip-index]').length > 0;
        }, { timeout: 10000 });
      } catch(e) {}
      await new Promise(r => setTimeout(r, 3000));
      return true;
    }
  } catch (e) {}
  return false;
}

function getWindowTimes(targetTime) {
  const match = String(targetTime).match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return [targetTime];
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  const times = [targetTime];
  let totalMins = (h % 12) * 60 + m;
  if (ampm === 'PM') totalMins += 12 * 60;

  const offsets = [30, -30];
  for (const off of offsets) {
    let newM = (totalMins + off + 1440) % 1440;
    let newH = Math.floor(newM / 60);
    let newMin = newM % 60;
    let newAmpm = newH >= 12 ? 'PM' : 'AM';
    let h12 = newH % 12 || 12;
    times.push(`${h12}:${String(newMin).padStart(2, '0')} ${newAmpm}`);
  }
  return times;
}

function randomDelay(minMs, maxMs) {
  const t = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((res) => setTimeout(res, t));
}

async function getValidTripDuration(page, expectedMode, allowedBuses = []) {
  return await page.evaluate((expected, allowed) => {
    const trips = document.querySelectorAll('div[id^="section-directions-trip-"], div[data-trip-index]');
    
    for (let index = 0; index < trips.length; index++) {
      const trip = trips[index];
      // 1. Validation
      const badgeEls = trip.querySelectorAll('[class*="fontBodyMedium"] span, .ivN21e span, [class*="badge"], span[style*="background"]');
      const texts = Array.from(badgeEls).map(el => el.textContent.trim()).filter(t => t.length > 0 && t.length < 20 && !/min|hr|:|km|walk|from|to|\?|^\d+[hm]$/i.test(t));
      
      let hasBusText = false;
      let hasMetroText = false;

      for (const t of texts) {
         if (/Line/i.test(t) || /Blue/i.test(t) || /Green/i.test(t) || /Purple/i.test(t) || /Orange/i.test(t) || /Yellow/i.test(t)) {
            hasMetroText = true;
         } else if (allowed && allowed.length > 0 && allowed.includes(t)) {
            hasBusText = true;
         } else if (/^[A-Z]+\d+[A-Z]*(\-\d+)?$/.test(t) || /^\d+[A-Z]+(\-\d+)?$/.test(t) || /^\d{2,3}$/.test(t) || /^[A-Z]+\-\d+$/.test(t)) {
            hasBusText = true;
         }
      }

      let hasBusIcon = false;
      let hasMetroIcon = false;
      const icons = Array.from(trip.querySelectorAll('img')).map(img => (img.src || '').toLowerCase());
      for (const src of icons) {
         if (src.includes('mapfiles/transit/')) {
            if (src.includes('subway') || src.includes('metro') || src.includes('train')) hasMetroIcon = true;
            if (src.includes('bus')) hasBusIcon = true;
         }
      }

      const isBus = hasBusText || hasBusIcon;
      
      let isValid = false;
      if (expected === 'bus') {
         isValid = isBus && !hasMetroIcon && !hasMetroText;
      } else if (expected === 'metro') {
         isValid = !hasBusIcon && !hasBusText;
      } else if (expected === 'driving') {
         isValid = true;
      }

      // 2. Extraction (if valid)
      if (isValid) {
          const candidates = Array.from(trip.querySelectorAll("div, span"))
            .map((el) => el.textContent.trim())
            .map(t => {
               const cleaned = t.replace(/typically\s+/i, '').trim();
               const rangeMatch = cleaned.match(/((\d+\s*(?:hr|hour|h|min|m|mins)?)\s*(?:to|[\-\–\—])\s*(\d+\s*(?:hr|hour|h)?\s*\d*\s*(?:min|m|mins)?))/i);
               if (rangeMatch && (rangeMatch[0].includes('min') || rangeMatch[0].includes('hr'))) {
                 return rangeMatch[0].trim();
               }
               const singleMatch = cleaned.match(/(?:about\s+)?((\d+\s*(?:hr|hour|h))?\s*(\d+\s*(?:min|m|mins)))/i);
               if (singleMatch) {
                 return singleMatch[1].trim();
               }
               return null;
            })
            .filter(Boolean);
         
         if (candidates.length > 0) {
            let actualMetro = "N/A";
            let actualBus = "N/A";
            let walkTime = "N/A";

            // Find actual vehicle names from the badges we parsed earlier
            const metroNames = texts.filter(t => /Line|Blue|Green|Purple|Orange|Yellow/i.test(t));
            if (metroNames.length > 0) actualMetro = metroNames.join(", ");
            
            const busNames = texts.filter(t => /^[A-Z]+\d+[A-Z]*(\-\d+)?$/.test(t) || /^\d+[A-Z]+(\-\d+)?$/.test(t) || /^\d{2,3}$/.test(t) || /^[A-Z]+\-\d+$/.test(t));
            if (busNames.length > 0) actualBus = busNames.join(", ");
            
            // If they are missing from text but we had icons, set a generic fallback
            if (actualMetro === "N/A" && hasMetroIcon) actualMetro = "Metro";
            if (actualBus === "N/A" && hasBusIcon) actualBus = "Bus";

            // Try to find Walk time in the raw inner text (e.g. "Walk 5 min")
            let totalWalkMins = 0;
            const walkMatches = trip.innerText.match(/Walk\s+(\d+)\s*min/gi);
            if (walkMatches) {
               walkMatches.forEach(m => {
                  const numMatch = m.match(/(\d+)/);
                  if (numMatch) totalWalkMins += parseInt(numMatch[1], 10);
               });
               if (totalWalkMins > 0) {
                  walkTime = `${totalWalkMins} min`;
               }
            }

            const fullRouteArr = Array.from(trip.querySelectorAll('img, [class*="fontBodyMedium"] span, .ivN21e span, [class*="badge"], span[style*="background"]')).map(el => {
                if(el.tagName === 'IMG') {
                    const alt = el.getAttribute('aria-label')||el.alt||'';
                    if(alt.includes('Walk')) return 'Walk';
                    if(alt.includes('Bus')) return 'Bus';
                    if(alt.includes('Subway')||alt.includes('Metro')) return 'Metro';
                    if(alt.includes('Train')) return 'Train';
                    return '';
                } else {
                    const text = el.textContent.trim();
                    return (/min|hr|:|km|walk|from|to|\\?|^\\d+[hm]$/i.test(text)) ? '' : text;
                }
            }).filter(t => t.length > 0 && t !== '');
            let fullRoute = "";
            for(let i=0; i<fullRouteArr.length; i++) {
                if (i>0 && (fullRouteArr[i-1] === 'Bus' || fullRouteArr[i-1] === 'Metro' || fullRouteArr[i-1] === 'Train')) {
                    fullRoute += " " + fullRouteArr[i];
                } else {
                    fullRoute += (fullRoute.length > 0 ? " > " : "") + fullRouteArr[i];
                }
            }
            
            if (walkTime && walkTime !== "N/A" && fullRoute.includes('Walk')) {
               fullRoute += ` (Total Walk: ${walkTime})`;
            }

            let rawTripText = trip.innerText || "";
            rawTripText = rawTripText.replace(/\n+/g, ' | ').trim();

            return {
               tripIndex: index,
               durationText: candidates[0],
               actualBus: actualBus,
               actualMetro: actualMetro,
               walkTime: walkTime,
               fullRoute: fullRoute || (expected === 'driving' ? 'Driving' : ''),
               rawDetails: rawTripText
            };
         } else {
            console.log(`[Trip Reject] Valid but no duration found.`);
         }
      } else {
         console.log(`[Trip Reject] expected=${expected} isBus=${isBus} hasMetroIcon=${hasMetroIcon} hasMetroText=${hasMetroText} hasBusIcon=${hasBusIcon} hasBusText=${hasBusText} texts=[${texts.join(',')}] icons=[${icons.join(',')}]`);
      }
    }
    return null;
  }, expectedMode, allowedBuses);
}

async function getTravelTime(
  browser,
  origin,
  destination,
  mode = "driving",
  { retries = 2, keepPageOpen = false, onReady = null, allowedBuses = [], targetTime = null, screenshotPath = null } = {}
) {
  // Determine URL based on mode
  let url;
  if (mode === "bus") {
    url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit&transit_mode=bus`;
  } else if (mode === "metro") {
    url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit&transit_mode=subway`;
  } else {
    url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  }

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    let page;
    try {
      await new Promise(r => setTimeout(r, 1000));
      page = await browser.newPage();
    } catch (newPageErr) {
      console.error(`Attempt ${attempt} - Failed to create new page (Puppeteer race condition). Retrying...`, newPageErr.message);
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }
    
    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
      );
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1.25 });
      await page.bringToFront(); 
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      } catch (navErr) {
        // Google Maps often throws net::ERR_ABORTED due to Service Workers or History API redirects. 
        // We ignore this and rely on waitForSelector("body").
      }
      // Attempt to wait for the body to show up
      await page.waitForSelector("body", { timeout: 10000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 400));
      
      // Select main travel mode explicitly from UI
      try {
         await page.evaluate((mode) => {
            const btns = Array.from(document.querySelectorAll('button'));
            if (mode === 'driving') {
               const driveBtn = btns.find(b => (b.getAttribute('data-tooltip')||'').includes('Driving'));
               if (driveBtn) driveBtn.click();
            } else {
               const transitBtn = btns.find(b => (b.getAttribute('data-tooltip')||'').includes('Transit'));
               if (transitBtn) transitBtn.click();
            }
         }, mode);
         await new Promise(r => setTimeout(r, 400));
      } catch(e) {}

      // Block unwanted transit modes by using the Options menu (Only for Bus and Metro)
      if (mode !== 'driving') {
        try {
           await page.evaluate((mode) => {
              const btns = Array.from(document.querySelectorAll('button'));
              const optionsBtn = btns.find(b => (b.textContent||'').trim() === 'Options');
              if (optionsBtn) {
                 optionsBtn.click();
              }
           }, mode);
           
           await new Promise(r => setTimeout(r, 400));
           
           await page.evaluate((mode) => {
              const labels = Array.from(document.querySelectorAll('div[role="checkbox"], label, div[role="radio"]'));
              if (mode === 'metro') {
                 const subwayLabel = labels.find(l => (l.textContent||'').trim() === 'Subway');
                 if (subwayLabel) subwayLabel.click();
              } else if (mode === 'bus') {
                 const busLabel = labels.find(l => (l.textContent||'').trim() === 'Bus');
                 if (busLabel) busLabel.click();
              }
              
              // ALWAYS try to select "Less walking" to avoid walking
              const lessWalkLabel = labels.find(l => (l.textContent||'').trim() === 'Less walking');
              if (lessWalkLabel) lessWalkLabel.click();
           }, mode);
           
           await new Promise(r => setTimeout(r, 500));
           // Close options if possible
           await page.evaluate(() => {
              const btns = Array.from(document.querySelectorAll('button'));
              const closeBtn = btns.find(b => (b.textContent||'').trim() === 'Close');
              if (closeBtn) closeBtn.click();
           });
           await new Promise(r => setTimeout(r, 400));
        } catch(e) {}
      }
      
      try {
        await page.waitForFunction(() => {
           return document.querySelectorAll('div[id^="section-directions-trip-"], div[data-trip-index]').length > 0;
        }, { timeout: 10000 });
      } catch(e) {}
      await randomDelay(300, 600); 

      if (targetTime && mode !== 'driving') {
         await setArriveByTime(page, targetTime);
      }
      let tripData = await getValidTripDuration(page, mode, allowedBuses);
      console.log(`Mode: ${mode}, TargetTime: ${mode === 'driving' ? 'direct' : targetTime}, Initial valid duration: ${tripData ? tripData.durationText : 'null'}`);
      
      if (!tripData) {
         let baseTime = targetTime;
         if (!baseTime) {
            const ist = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const h = ist.getHours();
            const m = ist.getMinutes();
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            baseTime = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
         }
         
         const windowTimes = getWindowTimes(baseTime).slice(1); // Skip the first element which is the baseTime itself
         for (const t of windowTimes) {
           const setOk = await setArriveByTime(page, t);
           if (setOk) {
             tripData = await getValidTripDuration(page, mode, allowedBuses);
             console.log(`Mode: ${mode}, TargetTime: ${t}, Fallback valid duration: ${tripData ? tripData.durationText : 'null'}`);
             if (tripData) break;
           }
         }
      }

      if (onReady) await onReady({ page, url, durationText: tripData ? tripData.durationText : null });

      if (screenshotPath) {
         try {
            // Click the trip card to ensure the route is focused, highlighted, and fitted onto the map canvas
            if (tripData && tripData.tripIndex !== undefined) {
               await page.evaluate((idx) => {
                  const trips = document.querySelectorAll('div[id^="section-directions-trip-"], div[data-trip-index]');
                  if (trips && trips[idx]) {
                     trips[idx].click();
                  }
               }, tripData.tripIndex).catch(() => {});
            }
            // Allow complete WebGL map tiles, road labels, and colored route polyline to finish painting
            await new Promise(r => setTimeout(r, 2000));
            await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 85 });
         } catch(e) {
            console.error("Failed to take screenshot:", e);
         }
      } else if (!tripData) {
         await page.screenshot({ path: 'output/debug_fail_screenshot.jpg', type: 'jpeg', quality: 80 }).catch(() => {});
      }

      const finalUrl = page.url();
      if (!keepPageOpen) await page.close();

      if (tripData) {
        return {
          success: true,
          ...tripData,
          minutes: parseDurationToMinutes(tripData.durationText),
          url: finalUrl,
          page: keepPageOpen ? page : null,
          screenshotPath: screenshotPath || null
        };
      }
      if (keepPageOpen) await page.close();
    } catch (err) {
      await page.close().catch(() => {});
      if (attempt > retries) {
        return { success: false, error: err.message };
      }
    }
    await randomDelay(3000, 6000);
  }
  return { success: false, error: "No duration text found after retries" };
}

function parseDurationToMinutes(text) {
  if (!text) return 0;
  const rangeMatch = text.match(/(\d+)\s*[\-\–\—]\s*(\d+)\s*min/i);
  if (rangeMatch) {
    return Math.round((parseInt(rangeMatch[1], 10) + parseInt(rangeMatch[2], 10)) / 2);
  }
  const rangeToMatch = text.match(/(\d+)\s*min\s*to\s*(\d+)\s*hr/i);
  if (rangeToMatch) {
    return Math.round((parseInt(rangeToMatch[1], 10) + parseInt(rangeToMatch[2], 10) * 60) / 2);
  }
  const hrMatch = text.match(/(\d+)\s*hr/i);
  const minMatch = text.match(/(\d+)\s*min/i);
  const hrs = hrMatch ? parseInt(hrMatch[1], 10) : 0;
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
  return hrs * 60 + mins;
}

module.exports = { getTravelTime, randomDelay };

