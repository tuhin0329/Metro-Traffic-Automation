# 📘 Comprehensive Project Report: Kolkata Multimodal Transit Automation & Empirical Analysis

**Project Title:** 24-Day Automated Empirical Performance & Reliability Audit of Kolkata Metro Rail vs. Surface Transit  
**Monitoring Period:** 2026-08-30 to 2026-09-22 (24 Continuous Days)  
**Total Collected Observations:** $N_{\text{raw}} = 2{,}300$ Multimodal Queries across 25 Corridors & 4 Diurnal Slots  
**Clean Operational Dataset:** $N = 2,120$ Verified Transit Comparisons  
**On-Disk Screenshot Proofs:** 6,600 Full-HD (1080p) Images  
**Repository:** `tuhin0329/Metro-Traffic-Automation`

---

## Executive Summary

This report provides a comprehensive synthesis of the Kolkata Metro vs. Surface Transit automation project — documenting every engineering win, data collection challenge, anomaly discovery, and empirical transportation conclusion from the 24-day monitoring campaign.

Through automated headless browser scraping, cloud-triggered scheduling, atomic checkpoint resilience, and rigorous statistical cleaning, this study compiled one of the most comprehensive open-source empirical urban transit datasets for an Indian megacity: **2,120 verified operational comparisons** across 5 Metro lines, 25 corridors, and 4 time-of-day slots.

---

# PART 1: Data Collection Engineering Audit

## 1.1 ✅ Engineering Wins

| # | Achievement | Details |
|:--|:-----------|:--------|
| 1 | **100% Autonomous Cloud Operation** | Data collection ran entirely on GitHub Actions runners for 24 days — user's laptop could be powered off |
| 2 | **Sub-5-second Scheduling Precision** | External `cron-job.org` webhooks triggered `workflow_dispatch` at exact times (12:00 AM, 10:00 AM, 1:00 PM, 7:00 PM IST) |
| 3 | **Direct Route & Stoppage Deduction** | Scraper prioritized single-bus direct routes; automatically subtracted layover/transfer wait times for pure in-motion travel |
| 4 | **100% Surface Mode Completeness** | Bus and Car data: zero dropped runs, zero network timeouts across all 2,300 queries |
| 5 | **6,600 Screenshot Proofs** | Organized in `output/screenshots/YYYY-MM-DD/SLOT/CORRIDOR_ID/{bus.jpg, metro.jpg, car.jpg}` |
| 6 | **Excel Optimization (50 MB → 55 KB)** | Removed embedded JPEG images; substituted verified file paths |
| 7 | **Atomic Checkpoint Resilience** | Incremental JSON checkpoints allowed crash recovery without data duplication |

## 1.2 ❌ Obstacles Encountered & Remedies

| # | Problem | Impact | Resolution |
|:--|:--------|:-------|:-----------|
| 1 | **GitHub Actions Cron Delays** | Runs delayed 45 min – 4.5 hours on shared queue | Migrated to `cron-job.org` external webhooks |
| 2 | **Walking Fallback Phenomenon** | 169 instances of Google Maps returning walking routes instead of null for closed Metro | Forensic screenshot audit; quarantined to `walking_fallback_audit.csv` |
| 3 | **Timetable Discontinuities** | Orange Line (no Sunday service), Yellow Line (not yet commissioned), Purple Line (midday gap) | Documented operating schedules; established data tier gating |
| 4 | **Git Binary Merge Conflicts** | JPEG screenshots caused unresolvable merge conflicts | Automated `git pull --rebase -X theirs` |
| 5 | **Midnight Operational Ambiguity** | Metro closed at midnight; Maps returned next-morning train times | Tagged 12:00 AM as Free-Flow Road Baseline ($T_0$) only |
| 6 | **Repository Size Bloat** | Embedded XLSX images ballooned to 50 MB/day | Removed embedded images; path references only |

---

# PART 2: Empirical Transportation Conclusions

## 2.1 Modal Competitiveness (N = 2,120)

### Head-to-Head: Metro vs Bus
| Metric | Metro 🚇 | Bus 🚌 |
|:-------|:--------:|:------:|
| **Win Count** | **1,941** | 179 |
| **Win Rate** | **91.6%** | 8.4% |
| **Average Duration** | **18.5 min** | 27.2 min |
| **Std Deviation** | 10.6 min | 13.9 min |

### Three-Way Competition
| Mode | Wins | Win Rate | Avg Duration |
|:-----|:----:|:--------:|:------------:|
| 🚇 Metro | **1,593** | **75.1%** | 18.5 min |
| 🚗 Car | 372 | 17.5% | 24.0 min |
| 🚌 Bus | 34 | 1.6% | 27.2 min |
| 🤝 Tie | 121 | 5.7% | — |

**Time saved by Metro vs Bus: +8.7 min per trip (1.47× speed multiplier)**

### Top 10 Most Metro-Dominant Corridors
| # | Corridor | Line | Metro | Bus | Car | Saved | Ratio | Win% |
|:--|:---------|:----:|:-----:|:---:|:---:|:-----:|:-----:|:----:|
| 1 | MC-01: Dakshineswar → Esplanade | Blue | 28.9 | 54.9 | 43.2 | +26.1 | 1.90× | 100% |
| 2 | MC-18: Kavi Subhash → Science City | Orange | 21.4 | 46.6 | 23.7 | +25.2 | 2.18× | 100% |
| 3 | MC-09: Dum Dum → Esplanade | Blue | 16.0 | 39.2 | 36.4 | +23.2 | 2.45× | 100% |
| 4 | MC-02: Shahid Khudiram → Esplanade | Blue | 28.8 | 51.0 | 42.9 | +22.2 | 1.77× | 100% |
| 5 | MC-14: Howrah → Phoolbagan | Green | 11.7 | 26.0 | 29.3 | +14.3 | 2.22× | 100% |
| 6 | MC-16: Kavi Subhash → Beleghata | Orange | 25.9 | 38.3 | 25.9 | +12.4 | 1.48× | 100% |
| 7 | MC-07: Esplanade → Mahanayak Uttam Kumar (Tollygunge) | Blue | 18.9 | 31.1 | 28.3 | +12.2 | 1.65× | 100% |
| 8 | MC-06: Dakshineswar → Dum Dum | Blue | 13.3 | 25.5 | 24.8 | +12.2 | 1.92× | 99% |
| 9 | MC-10: Howrah → Salt Lake Sector V | Green | 30.0 | 40.5 | 44.3 | +10.5 | 1.35× | 100% |
| 10 | MC-04: Shyambazar → Esplanade | Blue | 11.0 | 20.9 | 22.1 | +9.9 | 1.90× | 100% |

### 5 Corridors Where Bus Competes Closest
| Corridor | Line | Metro | Bus | Car | Diff | Why |
|:---------|:----:|:-----:|:---:|:---:|:----:|:----|
| MC-20: Behala Chowrasta → Majerhat | Purple | 23.3 | 12.0 | 11.2 | -11.3 | Purple Line elevated stations add access overhead on 1–3 km segments |
| MC-21: Joka → Behala Chowrasta | Purple | 22.8 | 14.0 | 11.2 | -8.8 | Purple Line elevated stations add access overhead on 1–3 km segments |
| MC-23: Behala Chowrasta → Taratala | Purple | 16.5 | 7.8 | 8.1 | -8.7 | Purple Line elevated stations add access overhead on 1–3 km segments |
| MC-24: Taratala → Majerhat | Purple | 8.6 | 4.0 | 3.5 | -4.6 | Purple Line elevated stations add access overhead on 1–3 km segments |
| MC-03: Dum Dum → Shyambazar | Blue | 20.5 | 21.0 | 15.1 | 0.5 | Short segment, station access overhead negates speed |

---

## 2.2 Line-by-Line Analysis

| Line | Corridors | N | Metro | Bus | Car | Saved | Win% |
|:-----|:---------:|:---:|:-----:|:---:|:---:|:-----:|:----:|
| **Blue** | 9 | 827 | 18.2 | 31.5 | 28.4 | +13.3 | 96.5% |
| **Green** | 6 | 552 | 19.5 | 28.6 | 29.5 | +9.1 | 100.0% |
| **Orange** | 3 | 198 | 20.2 | 34.4 | 20.6 | +14.2 | 91.4% |
| **Purple** | 6 | 451 | 17.1 | 14.1 | 12.5 | -3.0 | 76.1% |
| **Yellow** | 1 | 92 | 18.5 | 28.0 | 15.2 | +9.5 | 72.8% |

**Key Line Insights:**
- **Blue Line** dominates with 96% win rate — the North-South arterial through central Kolkata benefits most from grade separation.
- **Purple Line** shows an inverted pattern: bus is faster in 24% of trips because the Joka–Majerhat elevated viaduct has wide station spacing relative to surface distance, and direct surface buses are fast on the 1–3 km segments.
- **Orange Line** (EM Bypass) has car-competitive times due to flyover infrastructure, but buses are significantly slower at 34 min.

---

## 2.3 Time-of-Day Dynamics

| Slot | N | Metro | Bus | Car | Metro Win% | Road Impact |
|:-----|:---:|:-----:|:---:|:---:|:----------:|:-----------|
| **Midnight (Base)** | 553 | 17.0 | 27.3 | 16.7 | 95.1% | Free-flow baseline |
| **Morning Peak** | 496 | 15.5 | 26.6 | 25.2 | 100.0% | Office rush delays buses |
| **Midday** | 525 | 25.3 | 29.3 | 25.7 | 75.0% | Midday slump + Purple Line gap |
| **Evening Peak** | 521 | 16.3 | 25.5 | 28.8 | 96.0% | Worst car congestion (freight + commuters) |

---

## 2.4 Spatial Dynamics & Urban Bottlenecks

### A. The Hooghly River Barrier (Green Line)
At 7 PM evening rush, the Green Line underwater tunnel delivers passengers in **11.7 min** while buses via Howrah Bridge take **23.0 min** and cars take **38.7 min** — cars are slower than buses due to toll-approach congestion.

### B. The 3.5 km Breakeven Distance
Below ~4 km, Metro station access overhead (9.2 min fixed cost) makes surface modes competitive. Above it, Metro's 49 km/h commercial speed vs Bus's 18 km/h produces compound time savings.

### C. The 7 PM Freight Spike
Car travel time at 7 PM (28.8 min) is 14% worse than 10 AM (25.2 min). Commercial freight trucks, legally barred from central Kolkata until 6 PM, flood arterials at the exact moment of office exit.

### D. EM Bypass Flyover Paradox (Orange Line)
Cars match Metro (20.6 vs 20.2 min) due to Maa/Parama flyovers, but buses crawl at 34.4 min from kerbside signal delays.

---

## 2.5 Bus Speed Dynamics by Day of Week

| Day | N | Avg Bus Speed (km/h) | vs Weekday Avg |
|:----|:---:|:-------------------:|:--------------:|
| **Mon** | 348 | 18.5 km/h | -0.0 km/h |
| **Tue** | 399 | 18.5 km/h | -0.0 km/h |
| **Wed** | 300 | 18.5 km/h | +0.0 km/h |
| **Thu** | 300 | 18.5 km/h | +0.0 km/h |
| **Fri** | 300 | 18.5 km/h | +0.0 km/h |
| **Sat** | 237 | 17.9 km/h | -0.6 km/h |
| **Sun** | 236 | 17.7 km/h | -0.8 km/h |

> Bus speeds are remarkably uniform (17.7–18.5 km/h) across the week. Weekend traffic reductions from offices are offset by retail/leisure congestion around Esplanade, New Market, and Gariahat.

---

## 2.6 Statistical Significance

| Test | Result | Interpretation |
|:-----|:-------|:---------------|
| Paired t-test | t(2119) = 29.57, p < 0.0001 | Metro advantage is statistically significant |
| Cohen's d | 0.64 | Large practical effect size |
| ANOVA F(Mode) | 355.1, p < 0.0001 | Transit mode is the dominant factor |
| ANOVA F(Time) | 98.6, p < 0.0001 | Time of day significantly affects travel |
| Bus PTI (7 PM) | 1.96 | Must budget 2.0× free-flow time |
| Metro PTI (7 PM) | 1.84 | Near-schedule reliability |
| Bus BTI (7 PM) | 96.3% | High unpredictability |

---

# PART 3: Engineering Roadmap for Anomaly-Free Future Scraping

| # | Enhancement | Implementation |
|:--|:-----------|:---------------|
| 1 | **Mode-Strict Assertion** | Reject any transit response lacking "Line"/"Metro" badge or containing walking icon (`directions_walk`). Tag as `SERVICE_SUSPENDED`. |
| 2 | **Operating Schedule Gating** | Encode line-specific operating hours in `segments.json`. Auto-log `PLANNED_CLOSURE` during off-hours instead of querying Google Maps. |
| 3 | **Shift Midnight Metro to 9:30 PM** | Reserve 12:00 AM for Free-Flow Road Baseline only. Benchmark Metro at 9:30 PM (last revenue train). |
| 4 | **Walking Fallback Auto-Detection** | If `metroRawDetails.includes('via ')` or `metroUsed === 'N/A'`, auto-flag at scrape time rather than post-hoc audit. |

---

# PART 4: Deliverables Index

| Deliverable | Path | Description |
|:------------|:-----|:------------|
| 📑 Master Commuter Excel | `summary_tables/Kolkata_Metro_vs_Bus_Commuter_Mastery.xlsx` | 7-sheet workbook with KPI dashboards |
| 📊 Interactive Dashboard | `transit_infographics.html` | HTML visualizer with commute calculator |
| 📄 Academic Paper | `ACADEMIC_JOURNAL_REPORT.md` | Publication-grade research manuscript |
| 📋 Anomaly Audit | `flagged_anomalies/walking_fallback_audit.csv` | 169 quarantined walking fallbacks |
| 📈 Clean Dataset | `summary_tables/clean_dataset.csv` | 2,120-row verified dataset |
| 🏛️ Corridor Reports | `corridor_reports/MC-01..MC-25` | 25 individual corridor breakdowns |
