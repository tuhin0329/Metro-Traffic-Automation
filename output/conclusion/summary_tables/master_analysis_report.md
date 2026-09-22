# 📊 KOLKATA METRO vs BUS vs CAR — COMPREHENSIVE ANALYSIS REPORT

**Analysis Period:** 2026-08-30 to 2026-09-22
**Days of Data:** 24
**Total Data Points:** 2300 (Clean: 2120, Anomalies excluded: 180)
**Corridors:** 25 across 5 Metro Lines
**Time Slots:** 12:00 AM (Night) | 10:00 AM (Morning Peak) | 1:00 PM (Midday) | 7:00 PM (Evening Peak)

---

## 1. 🏆 Overall Mode Competitiveness

| Metric | Metro 🚇 | Bus 🚌 | Car 🚗 | Tie |
|--------|----------|--------|--------|-----|
| **Win Count** | 1593 | 34 | 372 | 121 |
| **Win Rate** | **75.1%** | 1.6% | 17.5% | 5.7% |
| **Avg Time (min)** | 18.5 | 27.2 | 24 | — |

**Average Travel Time Ratios:**
- Bus/Metro TTR: **1.6x** (Bus takes 1.6× longer than Metro on average)
- Car/Metro TTR: **1.5x** (Car takes 1.5× longer than Metro on average)

## 2. 🚇 Line-by-Line Performance

| Metro Line | Corridors | Avg Bus (min) | Avg Metro (min) | Avg Car (min) | Bus/Metro Ratio | Metro Advantage |
|------------|-----------|---------------|-----------------|---------------|-----------------|------------------|
| Blue | 9 | 31.5 | 18.2 | 28.4 | 1.73x | 13 min saved |
| Green | 6 | 28.6 | 19.5 | 29.5 | 1.47x | 9 min saved |
| Orange | 3 | 34.4 | 20.2 | 20.6 | 1.70x | 14 min saved |
| Purple | 6 | 14.1 | 17.1 | 12.5 | 0.82x | -3 min saved |
| Yellow | 1 | 28 | 18.5 | 15.2 | 1.51x | 10 min saved |

## 3. ⏰ Diurnal (Time-of-Day) Impact

| Time Slot | Classification | Avg Bus (min) | Avg Metro (min) | Avg Car (min) | Car TTI vs Midnight | Metro Wins |
|-----------|----------------|---------------|-----------------|---------------|---------------------|------------|
| 12:00 AM | Night Off-Peak (Base) | 27.3 | 17 | 16.7 | 1.00x | 362/553 (65%) |
| 10:00 AM | Morning Peak | 26.6 | 15.5 | 25.2 | 1.51x | 471/496 (95%) |
| 1:00 PM | Midday Off-Peak | 29.3 | 25.3 | 25.7 | 1.54x | 351/525 (67%) |
| 7:00 PM | Evening Peak | 25.5 | 16.3 | 28.8 | 1.72x | 490/521 (94%) |

## 4. 📅 Weekday vs Weekend

| Day Type | Avg Bus (min) | Avg Metro (min) | Avg Car (min) | Bus/Metro Ratio |
|----------|---------------|-----------------|---------------|------------------|
| Weekday (1647 pts) | 26.9 | 18.3 | 24.1 | 1.47x |
| Weekend (473 pts) | 28 | 19.4 | 23.4 | 1.44x |

## 5. 🔬 Macro (Full Line) vs Micro (Segment) Corridors

| Type | Count | Avg Bus (min) | Avg Metro (min) | Avg Car (min) | Metro Win Rate |
|------|-------|---------------|-----------------|---------------|----------------|
| Macro (Full Line) | 414 | 43.2 | 26.6 | 37 | 84.1% |
| Micro (Segment) | 1706 | 23.3 | 16.5 | 20.8 | 79.1% |

## 6. 🏅 Top Corridors by Metro Advantage

### Where Metro Dominates (Largest Time Savings)

| Rank | Corridor | Line | Avg Bus | Avg Metro | Avg Car | Time Saved | TTR |
|------|----------|------|---------|-----------|---------|------------|-----|
| 1 | MC-01: Dakshineswar → Esplanade | Blue | 54.9 | 28.9 | 43.2 | **26 min** | 1.90x |
| 2 | MC-18: Kavi Subhash → Science City | Orange | 46.6 | 21.4 | 23.7 | **25.2 min** | 2.18x |
| 3 | MC-09: Dum Dum → Esplanade | Blue | 39.2 | 16 | 36.4 | **23.2 min** | 2.45x |
| 4 | MC-02: Shahid Khudiram → Esplanade | Blue | 51 | 28.8 | 42.9 | **22.2 min** | 1.77x |
| 5 | MC-14: Howrah → Phoolbagan | Green | 26 | 11.7 | 29.3 | **14.3 min** | 2.22x |
| 6 | MC-16: Kavi Subhash → Beleghata | Orange | 38.3 | 25.9 | 25.9 | **12.4 min** | 1.48x |
| 7 | MC-06: Dakshineswar → Dum Dum | Blue | 25.5 | 13.3 | 24.8 | **12.2 min** | 1.92x |
| 8 | MC-07: Esplanade → Mahanayak Uttam Kumar (Tollygunge) | Blue | 31.1 | 18.9 | 28.3 | **12.2 min** | 1.65x |
| 9 | MC-10: Howrah → Salt Lake Sector V | Green | 40.5 | 30 | 44.3 | **10.5 min** | 1.35x |
| 10 | MC-04: Shyambazar → Esplanade | Blue | 20.9 | 11 | 22.1 | **9.9 min** | 1.90x |

### Where Bus/Car Compete Closest (Smallest Metro Advantage)

| Rank | Corridor | Line | Avg Bus | Avg Metro | Avg Car | Time Saved | TTR |
|------|----------|------|---------|-----------|---------|------------|-----|
| 1 | MC-20: Behala Chowrasta → Majerhat | Purple | 12 | 23.3 | 11.2 | -11.3 min | 0.52x |
| 2 | MC-21: Joka → Behala Chowrasta | Purple | 14 | 22.8 | 11.2 | -8.8 min | 0.61x |
| 3 | MC-23: Behala Chowrasta → Taratala | Purple | 7.8 | 16.5 | 8.1 | -8.7 min | 0.47x |
| 4 | MC-24: Taratala → Majerhat | Purple | 4 | 8.6 | 3.5 | -4.6 min | 0.47x |
| 5 | MC-03: Dum Dum → Shyambazar | Blue | 21 | 20.5 | 15.1 | 0.5 min | 1.02x |

## 7. 📉 Travel Time Reliability (Coefficient of Variation)

> Lower CV = More Reliable/Predictable travel time

| Mode | Mean (min) | Std Dev | CV (%) | Interpretation |
|------|-----------|---------|--------|----------------|
| 🚌 Bus | 27.17 | 13.88 | 51.1% | Highly Variable |
| 🚇 Metro | 18.51 | 10.55 | 57.0% | Highly Variable |
| 🚗 Car | 23.98 | 12.5 | 52.1% | Highly Variable |

## 8. 🎯 KEY FINDINGS & CONCLUSIONS

1. **Metro is the dominant fastest mode** across Kolkata's metro corridors, winning 1593/2120 (75.1%) of all trip comparisons.

2. **Average time savings by Metro vs Bus:** 8.7 minutes per trip.

3. **Peak hour impact:** Car travel time increases by 1.51x during morning peak and 1.72x during evening peak compared to midnight baseline, while Metro remains unaffected.

4. **Most Metro-dominant corridor:** MC-01 (Dakshineswar → Esplanade) on the Blue Line saves **26 min** on average.

5. **Reliability:** Metro has higher variability (CV: 57.0%) vs Bus (CV: 51.1%) and Car (CV: 52.1%), making it the most variable mode.

6. **Data quality:** 491 anomalous data points were flagged and excluded (21.3% of total dataset).
