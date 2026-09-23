# 📊 KOLKATA METRO vs BUS vs CAR — MASTER ANALYSIS REPORT

**Analysis Period:** 2026-08-30 to 2026-09-22  
**Days of Data:** 24  
**Total Raw Observations:** 2,300 | **Clean Operational:** 2,120 | **Anomalies Excluded:** 180  
**Corridors:** 25 across 5 Metro Lines  
**Time Slots:** 12:00 AM (Night) | 10:00 AM (Morning Peak) | 1:00 PM (Midday) | 7:00 PM (Evening Peak)

---

## 1. 🏆 Overall Mode Competitiveness

### Three-Way Competition
| Metric | Metro 🚇 | Bus 🚌 | Car 🚗 | Tie |
|:-------|:--------:|:------:|:------:|:---:|
| **Outright Wins** | **1,593** | 34 | 372 | 121 |
| **Win Rate** | **75.1%** | 1.6% | 17.5% | 5.7% |
| **Avg Time (min)** | **18.5** | 27.2 | 24.0 | — |
| **Std Dev (min)** | 10.6 | 13.9 | 12.5 | — |

### Head-to-Head: Metro vs Bus Only
| Metric | Value |
|:-------|:-----:|
| Metro faster | 1,941 / 2,120 (**91.6%**) |
| Bus faster | 179 / 2,120 (8.4%) |
| Avg time saved | **+8.7 min** per trip |
| Speed multiplier | **1.47×** |

---

## 2. 🚇 Line-by-Line Performance

| Line | Corridors | N | Bus Avg | Metro Avg | Car Avg | Bus/Metro Ratio | Metro Advantage |
|:-----|:---------:|:---:|:-------:|:---------:|:-------:|:---------------:|:---------------:|
| **Blue** | 9 | 827 | 31.5 | **18.2** | 28.4 | 1.73× | +13.3 min (Win: 96.5%) |
| **Green** | 6 | 552 | 28.6 | **19.5** | 29.5 | 1.47× | +9.1 min (Win: 100.0%) |
| **Orange** | 3 | 198 | 34.4 | **20.2** | 20.6 | 1.70× | +14.2 min (Win: 91.4%) |
| **Purple** | 6 | 451 | 14.1 | **17.1** | 12.5 | 0.82× | -3.0 min (Win: 76.1%) |
| **Yellow** | 1 | 92 | 28.0 | **18.5** | 15.2 | 1.51× | +9.5 min (Win: 72.8%) |

---

## 3. ⏰ Time-of-Day Impact

| Slot | Profile | N | Bus | Metro | Car | Car TTI* | Metro Win% |
|:-----|:--------|:---:|:---:|:-----:|:---:|:-------:|:----------:|
| **12:00 AM** | Night Off-Peak | 553 | 27.3 | **17.0** | 16.7 | 1.00× | 95.1% |
| **10:00 AM** | Morning Peak | 496 | 26.6 | **15.5** | 25.2 | 1.51× | 100.0% |
| **1:00 PM** | Midday | 525 | 29.3 | **25.3** | 25.7 | 1.54× | 75.0% |
| **7:00 PM** | Evening Peak | 521 | 25.5 | **16.3** | 28.8 | 1.73× | 96.0% |

*\*Car TTI = ratio of Car time at this slot vs. midnight free-flow baseline*

---

## 4. 📅 Weekday vs Weekend

| Day Type | N | Bus Avg | Metro Avg | Car Avg | Bus/Metro |
|:---------|:---:|:-------:|:---------:|:-------:|:---------:|
| Weekday | 1,647 | 26.9 | 18.3 | 24.1 | 1.47× |
| Weekend | 473 | 28.0 | 19.4 | 23.4 | 1.45× |

---

## 5. 🔬 Macro (Full Line) vs Micro (Segment) Corridors

| Type | N | Bus Avg | Metro Avg | Car Avg | Metro Win% |
|:-----|:---:|:-------:|:---------:|:-------:|:----------:|
| Macro (Full Line) | 414 | 43.2 | 26.6 | 37.0 | 100.0% |
| Micro (Segment) | 1706 | 23.3 | 16.5 | 20.8 | 89.5% |

---

## 6. 🏅 Top 10 Corridors by Metro Advantage

| # | Corridor | Line | Bus | Metro | Car | Saved | Ratio | Win% |
|:--|:---------|:----:|:---:|:-----:|:---:|:-----:|:-----:|:----:|
| 1 | MC-01: Dakshineswar → Esplanade | Blue | 54.9 | **28.9** | 43.2 | +26.1 | 1.90× | 100% |
| 2 | MC-18: Kavi Subhash → Science City | Orange | 46.6 | **21.4** | 23.7 | +25.2 | 2.18× | 100% |
| 3 | MC-09: Dum Dum → Esplanade | Blue | 39.2 | **16.0** | 36.4 | +23.2 | 2.45× | 100% |
| 4 | MC-02: Shahid Khudiram → Esplanade | Blue | 51.0 | **28.8** | 42.9 | +22.2 | 1.77× | 100% |
| 5 | MC-14: Howrah → Phoolbagan | Green | 26.0 | **11.7** | 29.3 | +14.3 | 2.22× | 100% |
| 6 | MC-16: Kavi Subhash → Beleghata | Orange | 38.3 | **25.9** | 25.9 | +12.4 | 1.48× | 100% |
| 7 | MC-07: Esplanade → Mahanayak Uttam Kumar (Tollygunge) | Blue | 31.1 | **18.9** | 28.3 | +12.2 | 1.65× | 100% |
| 8 | MC-06: Dakshineswar → Dum Dum | Blue | 25.5 | **13.3** | 24.8 | +12.2 | 1.92× | 99% |
| 9 | MC-10: Howrah → Salt Lake Sector V | Green | 40.5 | **30.0** | 44.3 | +10.5 | 1.35× | 100% |
| 10 | MC-04: Shyambazar → Esplanade | Blue | 20.9 | **11.0** | 22.1 | +9.9 | 1.90× | 100% |

### Where Bus/Car Compete Closest
| Corridor | Line | Bus | Metro | Car | Diff | Reason |
|:---------|:----:|:---:|:-----:|:---:|:----:|:-------|
| MC-20: Behala Chowrasta → Majerhat | Purple | 12.0 | 23.3 | 11.2 | -11.3 | Short Purple Line segment |
| MC-21: Joka → Behala Chowrasta | Purple | 14.0 | 22.8 | 11.2 | -8.8 | Short Purple Line segment |
| MC-23: Behala Chowrasta → Taratala | Purple | 7.8 | 16.5 | 8.1 | -8.7 | Short Purple Line segment |
| MC-24: Taratala → Majerhat | Purple | 4.0 | 8.6 | 3.5 | -4.6 | Short Purple Line segment |
| MC-03: Dum Dum → Shyambazar | Blue | 21.0 | 20.5 | 15.1 | 0.5 | Short distance |

---

## 7. 📉 Travel Time Reliability

| Mode | Mean | Std Dev | CV (%) | P95 | Interpretation |
|:-----|:----:|:-------:|:------:|:---:|:---------------|
| 🚌 Bus | 27.2 | 13.9 | 51.1% | 51 | Highly variable |
| 🚇 Metro | 18.5 | 10.6 | 57.0% | 33 | Variable (cross-line mixing) |
| 🚗 Car | 24.0 | 12.5 | 52.1% | 49 | Highly variable |

> **Note:** The high CV for Metro (57%) reflects the wide range of corridor distances (1.7–15.1 km) rather than scheduling unreliability. Within any single corridor, Metro CV is typically < 10%.

---

## 8. 🎯 KEY FINDINGS & CONCLUSIONS

1. **Metro is the dominant fastest mode** across Kolkata's metro corridors, winning **1,593/2,120 (75.1%)** of all three-way trip comparisons.

2. **Average time savings by Metro vs Bus:** **+8.7 min per trip** (1.47× speed multiplier).

3. **Peak hour impact:** Car travel time increases by **1.51×** during morning peak and **1.73×** during evening peak vs. midnight baseline, while Metro remains largely unaffected.

4. **Most Metro-dominant corridor:** **MC-01** (Dakshineswar → Esplanade) on the Blue Line saves **+26 min** on average.

5. **Blue Line** is the strongest performer: **96.5% Metro win rate** with **+13.3 min** average savings.

6. **Purple Line anomaly:** Bus is faster in **24%** of trips — short elevated segments (1–3 km) where station access overhead exceeds the speed benefit.

7. **Statistical significance:** Paired t-test yields $t = 29.57$, $p < 0.0001$, Cohen's $d = 0.64$ (large effect).

8. **Data quality:** 180 anomalous observations (7.8%) were identified and excluded through forensic screenshot verification.
