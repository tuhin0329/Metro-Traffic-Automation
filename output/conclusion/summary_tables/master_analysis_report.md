# 📊 KOLKATA METRO vs CAR — MASTER ANALYSIS REPORT (24 VERIFIED CORRIDORS)

**Analysis Period:** 2026-08-30 to 2026-09-27 (28 Active Days)  
**Total Raw Queries:** 2568 | **Clean Operational:** 2180 | **Walking Fallbacks Excluded:** 170 | **Missing Metro:** 218  
**Active Corridors:** 24 across 4 Operational Metro Lines (Blue, Green, Orange, Purple)  
**Time Slots:** 12:00 AM (Night Base) | 10:00 AM (Morning Peak) | 1:00 PM (Midday) | 7:00 PM (Evening Peak)

---

## 1. 🏆 Overall Mode Competitiveness (Metro vs. Car: N = 2180)

| Metric | Metro 🚇 | Car 🚗 | Tie 🤝 |
|:-------|:--------:|:------:|:------:|
| **Outright Wins** | **1777** | 281 | 122 |
| **Win Rate** | **81.5%** | 12.9% | 5.6% |
| **Avg Time (min)** | **16.9 min** | 25.6 min | — |
| **Std Dev (min)** | ±7.4 | ±12.5 | — |
| **Avg Operating Speed** | **28.1 km/h** | 19.5 km/h | — |

- **Average Time Saved by Metro vs Car:** **+8.7 min per trip** (1.51× faster)
- **Paired t-test (Car − Metro):** $t = 43.42,\; p < 0.0001,\; \text{Cohen's } d = 0.93$

---

## 2. 🚇 Line-by-Line Performance & Route Distances

| Line | Corridors | N | Avg Metro Dist | Avg Car Dist | Metro Avg | Car Avg | Metro Speed | Car Speed | Time Saved vs Car | Metro Win Rate |
|:-----|:---------:|:---:|:--------------:|:------------:|:---------:|:-------:|:-----------:|:---------:|:-----------------:|:--------------:|
| **Blue** | 9 | 922 | 8.2 km | 8.1 km | **17.1 min** | 29.0 min | **29.3 km/h** | 17.9 km/h | **+11.9 min** | **95.1%** |
| **Green** | 6 | 642 | 9.0 km | 8.8 km | **19.5 min** | 29.5 min | **28.7 km/h** | 19.2 km/h | **+10.0 min** | **77.9%** |
| **Orange** | 3 | 225 | 7.7 km | 7.7 km | **20.2 min** | 20.8 min | **22.8 km/h** | 23.5 km/h | **+0.6 min** | **42.2%** |
| **Purple** | 6 | 391 | 4.3 km | 4.3 km | **10.4 min** | 13.8 min | **27.2 km/h** | 21.4 km/h | **+3.4 min** | **78.0%** |

---

## 3. ⏰ Time-of-Day Impact

| Time Slot | N | Metro Avg | Car Avg | Metro Speed | Car Speed | Metro Win% |
|:----------|:---:|:---------:|:-------:|:-----------:|:---------:|:----------:|
| **12:00 AM** | 590 | **16.4 min** | 17.5 min | **28.4 km/h** | 25.9 km/h | **55.9%** |
| **10:00 AM** | 552 | **16.0 min** | 25.9 min | **28.7 km/h** | 18.0 km/h | **92.2%** |
| **1:00 PM** | 456 | **19.2 min** | 30.7 min | **27.3 km/h** | 17.2 km/h | **88.4%** |
| **7:00 PM** | 558 | **16.6 min** | 29.7 min | **27.7 km/h** | 16.1 km/h | **91.9%** |

---

## 4. 🛣️ Complete 24-Corridor Distance & Performance Table

| ID | Line | Corridor (`From → To`) | Metro Dist | Car Dist | Metro Avg | Car Avg | Metro Speed | Car Speed | Saved vs Car | Ratio | Win% |
|:---|:----:|:-----------------------|:----------:|:--------:|:---------:|:-------:|:-----------:|:---------:|:------------:|:-----:|:----:|
| **MC-01** | Blue | Dakshineswar → Esplanade | **15.0 km** | **12.4 km** | **28.9 min** | 43.6 min | 31.2 km/h | 17.1 km/h | +14.7 min | 1.51x | 94.4% |
| **MC-02** | Blue | Shahid Khudiram → Esplanade | **14.9 km** | **16.5 km** | **28.9 min** | 43.1 min | 31.0 km/h | 23.0 km/h | +14.2 min | 1.49x | 97.2% |
| **MC-03** | Blue | Shyambazar → Dum Dum | **3.8 km** | **3.5 km** | **7.6 min** | 14.6 min | 30.0 km/h | 14.4 km/h | +7.0 min | 1.92x | 97.4% |
| **MC-04** | Blue | Shyambazar → Esplanade | **5.1 km** | **5.2 km** | **11.0 min** | 22.3 min | 27.8 km/h | 14.0 km/h | +11.3 min | 2.03x | 100.0% |
| **MC-05** | Blue | Kalighat → Esplanade | **5.2 km** | **5.1 km** | **11.0 min** | 18.8 min | 28.4 km/h | 16.3 km/h | +7.8 min | 1.71x | 90.7% |
| **MC-06** | Blue | Dakshineswar → Dum Dum | **6.2 km** | **7.0 km** | **12.8 min** | 25.0 min | 29.2 km/h | 16.8 km/h | +12.2 min | 1.96x | 100.0% |
| **MC-07** | Blue | Esplanade → Mahanayak Uttam Kumar (Tollygunge) | **7.8 km** | **8.3 km** | **18.8 min** | 28.4 min | 24.8 km/h | 17.5 km/h | +9.6 min | 1.51x | 92.5% |
| **MC-08** | Blue | Mahanayak Uttam Kumar (Tollygunge) → Kavi Subhash | **7.1 km** | **6.4 km** | **15.5 min** | 24.1 min | 27.4 km/h | 16.0 km/h | +8.5 min | 1.55x | 85.0% |
| **MC-09** | Blue | Dum Dum → Esplanade | **8.8 km** | **8.8 km** | **16.0 min** | 36.4 min | 33.0 km/h | 14.5 km/h | +20.4 min | 2.28x | 100.0% |
| **MC-10** | Green | Howrah → Salt Lake Sector V | **14.2 km** | **12.4 km** | **30.0 min** | 44.3 min | 28.4 km/h | 16.8 km/h | +14.3 min | 1.48x | 74.8% |
| **MC-11** | Green | Sealdah → Salt Lake Sector V | **8.6 km** | **8.0 km** | **21.3 min** | 25.1 min | 24.2 km/h | 19.1 km/h | +3.8 min | 1.18x | 69.2% |
| **MC-12** | Green | Howrah → Sealdah | **5.6 km** | **6.8 km** | **10.7 min** | 27.2 min | 31.4 km/h | 15.0 km/h | +16.5 min | 2.54x | 100.0% |
| **MC-13** | Green | Phoolbagan → Salt Lake Sector V | **6.6 km** | **4.9 km** | **18.3 min** | 19.3 min | 21.6 km/h | 15.2 km/h | +1.0 min | 1.06x | 55.1% |
| **MC-14** | Green | Howrah → Phoolbagan | **7.7 km** | **7.6 km** | **11.7 min** | 29.5 min | 39.5 km/h | 15.5 km/h | +17.8 min | 2.52x | 100.0% |
| **MC-15** | Green | Esplanade → Salt Lake Sector V | **11.3 km** | **13.3 km** | **25.0 min** | 31.8 min | 27.1 km/h | 25.1 km/h | +6.8 min | 1.27x | 68.2% |
| **MC-16** | Orange | Kavi Subhash → Beleghata | **9.8 km** | **9.8 km** | **25.9 min** | 26.2 min | 22.7 km/h | 22.5 km/h | +0.2 min | 1.01x | 44.0% |
| **MC-17** | Orange | Hemanta Mukhopadhyay → Beleghata | **4.4 km** | **4.4 km** | **13.3 min** | 12.4 min | 19.9 km/h | 21.3 km/h | -0.9 min | 0.93x | 26.7% |
| **MC-18** | Orange | Kavi Subhash → Science City | **8.9 km** | **8.8 km** | **21.5 min** | 24.0 min | 24.9 km/h | 22.0 km/h | +2.5 min | 1.12x | 56.0% |
| **MC-19** | Purple | Joka → Majerhat | **7.9 km** | **7.8 km** | **17.2 min** | 22.5 min | 27.6 km/h | 20.8 km/h | +5.3 min | 1.31x | 86.7% |
| **MC-20** | Purple | Behala Chowrasta → Majerhat | **3.7 km** | **3.7 km** | **9.1 min** | 11.0 min | 24.4 km/h | 20.2 km/h | +1.9 min | 1.21x | 75.9% |
| **MC-21** | Purple | Joka → Behala Chowrasta | **4.2 km** | **4.1 km** | **8.0 min** | 11.1 min | 31.5 km/h | 22.3 km/h | +3.1 min | 1.38x | 88.1% |
| **MC-22** | Purple | Joka → Taratala | **6.6 km** | **6.5 km** | **14.0 min** | 19.5 min | 28.3 km/h | 20.0 km/h | +5.5 min | 1.39x | 92.8% |
| **MC-23** | Purple | Behala Chowrasta → Taratala | **2.4 km** | **2.4 km** | **6.0 min** | 8.0 min | 24.0 km/h | 17.9 km/h | +2.0 min | 1.34x | 79.2% |
| **MC-24** | Purple | Taratala → Majerhat | **1.3 km** | **1.3 km** | **3.0 min** | 3.8 min | 26.0 km/h | 20.7 km/h | +0.8 min | 1.25x | 32.7% |
