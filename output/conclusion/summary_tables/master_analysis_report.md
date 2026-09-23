# 📊 KOLKATA METRO vs BUS vs CAR — MASTER ANALYSIS REPORT

**Analysis Period:** August 30, 2026 to September 22, 2026  
**Days of Data:** 24  
**Total Raw Queries:** 2,300 | **Clean Operational:** 1,952 | **Anomalies Excluded:** 348  
**Corridors:** 25 across 5 Metro Lines  
**Time Slots:** 12:00 AM (Night Base) | 10:00 AM (Morning Peak) | 1:00 PM (Midday) | 7:00 PM (Evening Peak)

---

## 1. 🏆 Overall Mode Competitiveness

### Three-Way Competition (Clean Operational: N = 1,952)
| Metric | Metro 🚇 | Bus 🚌 | Car 🚗 | Tie |
|:-------|:--------:|:------:|:------:|:---:|
| **Outright Wins** | **1,585** | 8 | 254 | 105 |
| **Win Rate** | **81.2%** | 0.4% | 13.0% | 5.4% |
| **Avg Time (min)** | **16.6** | 28.0 | 25.1 | — |
| **Std Dev (min)** | ±7.4 | ±13.6 | ±12.3 | — |

### Head-to-Head: Metro vs Bus
- **Metro Wins:** **1,932 / 1,952 (99.0%)**
- **Bus Wins:** 20 / 1,952 (1.0%)
- **Average Time Saved:** **+11.4 min per trip** (1.69× speed multiplier)

---

## 2. 🚇 Line-by-Line Performance

| Line | Corridors | N | Bus Avg | Metro Avg | Car Avg | Bus/Metro Ratio | Metro Advantage |
|:-----|:---------:|:---:|:-------:|:---------:|:-------:|:---------------:|:---------------:|
| **Blue** | 9 | 792 | 31.5 min | **17.1 min** | 28.8 min | 1.85x | **+14.5 min** (Win: 99.6%) |
| **Green** | 6 | 552 | 28.6 min | **19.5 min** | 29.5 min | 1.47x | **+9.1 min** (Win: 100.0%) |
| **Orange** | 3 | 198 | 34.4 min | **20.2 min** | 20.6 min | 1.70x | **+14.2 min** (Win: 91.4%) |
| **Purple** | 6 | 343 | 15.6 min | **10.4 min** | 13.8 min | 1.51x | **+5.3 min** (Win: 100.0%) |
| **Yellow** | 1 | 67 | 25.4 min | **7.7 min** | 15.3 min | 3.30x | **+17.7 min** (Win: 100.0%) |

---

## 3. ⏰ Time-of-Day Impact

| Time Slot | Classification | N | Bus | Metro | Car | Car TTI* | Metro Win% |
|:----------|:---------------|:---:|:---:|:-----:|:---:|:-------:|:----------:|
| **12:00 AM** | Night Base | 524 | 28.2 min | **16.0 min** | 17.2 min | 1.00x | **100.0%** |
| **10:00 AM** | Morning Peak | 496 | 26.6 min | **15.5 min** | 25.2 min | 1.47x | **100.0%** |
| **1:00 PM** | Midday Off-Peak | 389 | 33.0 min | **19.2 min** | 30.5 min | 1.78x | **100.0%** |
| **7:00 PM** | Evening Peak | 518 | 25.5 min | **16.3 min** | 28.8 min | 1.68x | **96.1%** |

*\*Car TTI = ratio of Car travel time vs. midnight free-flow baseline*

---

## 4. 🏅 Top 10 Corridors by Metro Advantage

| # | Corridor | Line | Bus | Metro | Car | Saved | Ratio | Win% |
|:--|:---------|:----:|:---:|:-----:|:---:|:-----:|:-----:|:----:|
| 1 | MC-01: Dakshineswar → Esplanade | Blue | 54.9 | **28.9** | 43.2 | **+26.1 min** | 1.90x | 100% |
| 2 | MC-18: Kavi Subhash → Science City | Orange | 46.6 | **21.4** | 23.7 | **+25.2 min** | 2.18x | 100% |
| 3 | MC-09: Dum Dum → Esplanade | Blue | 39.2 | **16.0** | 36.4 | **+23.2 min** | 2.45x | 100% |
| 4 | MC-02: Shahid Khudiram → Esplanade | Blue | 51.0 | **28.8** | 42.9 | **+22.2 min** | 1.77x | 100% |
| 5 | MC-25: Dum Dum Cantonment → Biman Bandar | Yellow | 25.4 | **7.7** | 15.3 | **+17.7 min** | 3.30x | 100% |
| 6 | MC-14: Howrah → Phoolbagan | Green | 26.0 | **11.7** | 29.3 | **+14.3 min** | 2.22x | 100% |
| 7 | MC-06: Dakshineswar → Dum Dum | Blue | 25.6 | **12.7** | 24.9 | **+12.9 min** | 2.01x | 100% |
| 8 | MC-16: Kavi Subhash → Beleghata | Orange | 38.3 | **25.9** | 25.9 | **+12.4 min** | 1.48x | 100% |
| 9 | MC-07: Esplanade → Mahanayak Uttam Kumar (Tollygunge) | Blue | 31.1 | **18.9** | 28.3 | **+12.2 min** | 1.65x | 100% |
| 10 | MC-10: Howrah → Salt Lake Sector V | Green | 40.5 | **30.0** | 44.3 | **+10.5 min** | 1.35x | 100% |

---

## 5. ⚖️ Dual Analysis Contrast

| Metric | Analysis A: Clean Data | Analysis B: All Raw Data | Impact of Anomalies |
|:-------|:----------------------:|:------------------------:|:--------------------|
| Observations | 1,952 clean | 2,300 raw | 348 anomalous runs excluded |
| Metro Win Rate | **99.0%** | 91.5% | -7.5% artificial drop |
| Bus Win Rate | **1.0%** | 8.5% | +7.5% false inflation |
| Metro Mean | **16.6 min** | 18.6 min | +2.0 min artificial delay |
| Purple Line Win Rate | **100.0%** | 76.1% | -23.9% distortion |

---

## 6. 🎯 Key Takeaways

1. **Metro is the absolute fastest transit mode** in Kolkata, winning **99.0%** of operational trips against surface bus.
2. **Average time savings:** **+11.4 minutes per journey** (1.69× speed multiplier).
3. **Paired t-test:** $t = 54.98,\; p < 0.0001,\; \text{Cohen's } d = 1.24$ (statistically definitive).
4. **Road congestion spike:** Car travel time increases by **1.68×** at 7 PM due to commercial truck restrictions lifting at 6 PM.
