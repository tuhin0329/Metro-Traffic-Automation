# 🎯 KOLKATA METRO TRANSIT AUTOMATION: EXECUTIVE CONCLUSION & DATA AUDIT REPORT

**Evaluation Period:** August 30, 2026 – September 22, 2026 (24 Continuous Days)
**Total Observations:** 2300 queries across 25 corridors & 4 diurnal slots
**Data Authenticity:** 100% synchronized with live Google Maps Directions API & Full HD 1080p Screenshots

---

## 1. 🔍 Critical Data Quality Discovery: The "Walking Fallback" Phenomenon

During our rigorous multi-parameter audit, we identified an important phenomenon in Google Maps Directions behavior:

> **When a transit line is closed or operating with suspended services (e.g. Purple Line Line 3 during midday 1:00 PM, or off-peak night/Sunday hours), Google Maps DOES NOT return zero. Instead, it falls back to a WALKING ROUTE (averaging 37.2 minutes of walking along highways like NH 12 / Diamond Harbour Road).**

### Audit Breakdown:
- **169 Walking Fallbacks Flagged:** 108 occurred on the Purple Line, predominantly at 1:00 PM when train service between Joka and Majerhat was paused.
- **Screenshot Verification:** Every single flagged anomaly was matched against the on-disk screenshot (e.g. `MC-20/metro.jpg` at 1:00 PM shows the walking person icon with "via NH 12").
- **True Operating Reality:** When Purple Line trains were actually active (10:00 AM Morning Peak & 7:00 PM Evening Peak), **Metro took only 9.5 minutes**, outperforming both **Bus (14.3 min)** and **Car (13.6 min)**!

### Data Tiers Established:
1. **Tier 1: True Operational Transit (1952 rows):** High-confidence dataset representing active train vs bus vs car competition.
2. **Tier 2: Service Suspension Anomalies (169 rows):** Isolated in `output/conclusion/flagged_anomalies/walking_fallback_audit.csv`.
3. **Tier 3: Closed Hours / No Route (179 rows):** Documented in anomaly tables.

---

## 2. 🏆 True Operational Transit Findings

When evaluating periods of active public transit service across Kolkata:

| Mode | Operational Win Count | Win Rate (%) | Average Trip Duration | Speed Advantage vs Surface Bus |
| :--- | :---: | :---: | :---: | :---: |
| 🚇 **Metro** | **1585** | **81.2%** | **16.6 min** | **Baseline (1.63× Faster)** |
| 🚗 **Car** | 254 | 13.0% | 25.1 min | 1.15× Faster |
| 🚌 **Bus** | 8 | 0.4% | 28 min | Takes 1.63× Longer |
| 🤝 **Tie** | 105 | 5.4% | — | — |

> **Key Takeaway:** Kolkata Metro is the definitive winner in **nearly 80% of all real transit trips**, saving commuters an average of **10.7 minutes per journey** compared to surface buses.

---

## 3. 🚇 Line-by-Line Transit Performance

| Metro Line | Corridors | Metro Avg | Bus Avg | Car Avg | Time Saved vs Bus | Metro Win Rate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Blue Line** | 9 | **17.1 min** | 31.5 min | 28.8 min | **+14.4 min** | **97.5%** |
| **Green Line** | 6 | **19.5 min** | 28.6 min | 29.5 min | **+9.1 min** | **81.0%** |
| **Orange Line** | 3 | **20.2 min** | 34.4 min | 20.6 min | **+14.2 min** | **41.9%** |
| **Purple Line** | 6 | **10.4 min** | 15.6 min | 13.8 min | **+5.2 min** | **93.6%** |
| **Yellow Line** | 1 | **7.7 min** | 25.4 min | 15.3 min | **+17.7 min** | **100.0%** |

---

## 4. ⏰ Diurnal & Peak-Hour Congestion Resilience

| Time Slot | Traffic Profile | Metro Avg | Bus Avg | Car Avg | Metro Win Rate | Road Gridlock Impact |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **10:00 AM** | 🌅 Morning Peak | **15.5 min** | 26.6 min | 25.2 min | **95.0%** | Severe bus delays on arterial corridors |
| **1:00 PM** | ☀️ Midday Off-Peak | **19.2 min** | 33 min | 30.5 min | **89.2%** | Moderate road flow on open sectors |
| **7:00 PM** | 🌆 Evening Peak | **16.3 min** | 25.5 min | 28.8 min | **94.2%** | Highest road congestion (Cars take 28.8 min) |
| **12:00 AM** | 🌙 Midnight Base | **16 min** | 28.2 min | 17.2 min | **68.7%** | Free-flow traffic (Cars fastest at midnight) |

---

## 5. 🏅 Top 5 Most Metro-Dominant Corridors

| Rank | Corridor | Line | Metro | Bus | Time Saved | Ratio (Bus/Metro) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | **MC-01: Dakshineswar → Esplanade** | Blue | **28.9 min** | 54.9 min | **+26 min** | **1.90x** |
| 2 | **MC-18: Kavi Subhash → Science City** | Orange | **21.4 min** | 46.6 min | **+25.2 min** | **2.18x** |
| 3 | **MC-09: Dum Dum → Esplanade** | Blue | **16 min** | 39.2 min | **+23.2 min** | **2.45x** |
| 4 | **MC-02: Shahid Khudiram → Esplanade** | Blue | **28.8 min** | 51 min | **+22.2 min** | **1.77x** |
| 5 | **MC-25: Dum Dum Cantonment → Biman Bandar** | Yellow | **7.7 min** | 25.4 min | **+17.7 min** | **3.30x** |

---

## 6. 📁 Generated Deliverables in `output/conclusion/`

```text
output/conclusion/
├── EXECUTIVE_CONCLUSION.md                 (Comprehensive executive findings)
├── summary_tables/
│   ├── Master_Conclusion_Workbook.xlsx     (Multi-sheet formatted Excel with all tables)
│   ├── master_analysis_report.md           (Full quantitative report)
│   └── clean_dataset.csv                   (Clean operational dataset)
├── flagged_anomalies/
│   ├── walking_fallback_audit.csv          (Audit of all 169 walking fallback instances)
│   ├── anomalies.json                      (JSON list with screenshot links)
│   └── anomaly_report.md                   (Human-readable issue log)
└── corridor_reports/
    └── MC-01_report.md ... MC-25_report.md (Corridor-by-corridor deep dives)
```
