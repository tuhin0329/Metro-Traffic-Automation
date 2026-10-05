# 📊 KOLKATA METRO vs CAR — MASTER ANALYSIS REPORT (24 VERIFIED CORRIDORS)

**Analysis Period:** 2026-08-30 to 2026-10-05 (36 Active Days)  
**Total Raw Queries:** 3337 | **Clean Operational:** 2826 | **Walking Fallbacks Excluded:** 222 | **Missing Metro:** 289  
**Active Corridors:** 24 across 4 Operational Metro Lines (Blue, Green, Orange, Purple)  
**Time Slots:** 12:00 AM (Night Base) | 10:00 AM (Morning Peak) | 1:00 PM (Midday) | 7:00 PM (Evening Peak)

---

## 1. 🏆 Overall Mode Competitiveness (Metro vs. Car: N = 2826)

| Metric | Metro 🚇 | Car 🚗 | Tie 🤝 |
|:-------|:--------:|:------:|:------:|
| **Outright Wins** | **2326** | 362 | 138 |
| **Win Rate** | **82.3%** | 12.8% | 4.9% |
| **Avg Time (min)** | **16.9 min** | 26.1 min | — |
| **Std Dev (min)** | ±7.4 | ±13.0 | — |
| **Avg Operating Speed** | **28.6 km/h** | 19.2 km/h | — |

- **Average Time Saved by Metro vs Car:** **+9.1 min per trip** (1.54× faster)
- **Paired t-test (Car − Metro):** $t = 49.33,\; p < 0.0001,\; \text{Cohen's } d = 0.93$

---

## 2. 🚇 Line-by-Line Performance & Route Distances

| Line | Corridors | N | Avg Metro Dist | Avg Car Dist | Metro Avg | Car Avg | Metro Speed | Car Speed | Time Saved vs Car | Metro Win Rate |
|:-----|:---------:|:---:|:--------------:|:------------:|:---------:|:-------:|:-----------:|:---------:|:-----------------:|:--------------:|
| **Blue** | 9 | 1198 | 8.2 km | 8.1 km | **17.2 min** | 29.5 min | **29.6 km/h** | 17.6 km/h | **+12.3 min** | **95.7%** |
| **Green** | 6 | 834 | 9.0 km | 8.8 km | **19.4 min** | 30.2 min | **29.2 km/h** | 18.9 km/h | **+10.8 min** | **78.5%** |
| **Orange** | 3 | 291 | 7.7 km | 7.7 km | **20.2 min** | 20.7 min | **25.0 km/h** | 23.7 km/h | **+0.5 min** | **40.2%** |
| **Purple** | 6 | 503 | 4.3 km | 4.3 km | **10.4 min** | 14.2 min | **27.3 km/h** | 20.8 km/h | **+3.8 min** | **81.1%** |

---

## 3. ⏰ Time-of-Day Impact

| Time Slot | N | Metro Avg | Car Avg | Metro Speed | Car Speed | Metro Win% |
|:----------|:---:|:---------:|:-------:|:-----------:|:---------:|:----------:|
| **12:00 AM** | 754 | **16.4 min** | 17.8 min | **30.1 km/h** | 25.5 km/h | **58.2%** |
| **10:00 AM** | 726 | **15.9 min** | 26.2 min | **28.9 km/h** | 17.8 km/h | **92.8%** |
| **1:00 PM** | 599 | **19.2 min** | 31.3 min | **27.4 km/h** | 17.0 km/h | **87.6%** |
| **7:00 PM** | 722 | **16.7 min** | 30.3 min | **27.7 km/h** | 15.9 km/h | **92.1%** |

---

## 4. 🛣️ Complete 24-Corridor Distance & Performance Table

| ID | Line | Corridor (`From → To`) | Metro Dist | Car Dist | Metro Avg | Car Avg | Metro Speed | Car Speed | Saved vs Car | Ratio | Win% |
|:---|:----:|:-----------------------|:----------:|:--------:|:---------:|:-------:|:-----------:|:---------:|:------------:|:-----:|:----:|
| **MC-01** | Blue | Dakshineswar → Esplanade | **15.0 km** | **12.4 km** | **28.9 min** | 44.3 min | 31.1 km/h | 16.8 km/h | +15.4 min | 1.53x | 95.7% |
| **MC-02** | Blue | Shahid Khudiram → Esplanade | **14.9 km** | **16.5 km** | **28.9 min** | 45.8 min | 30.9 km/h | 21.6 km/h | +16.9 min | 1.59x | 97.8% |
| **MC-03** | Blue | Shyambazar → Dum Dum | **3.8 km** | **3.5 km** | **7.7 min** | 14.8 min | 29.6 km/h | 14.2 km/h | +7.1 min | 1.92x | 98.0% |
| **MC-04** | Blue | Shyambazar → Esplanade | **5.1 km** | **5.2 km** | **11.0 min** | 22.6 min | 27.8 km/h | 13.8 km/h | +11.6 min | 2.05x | 100.0% |
| **MC-05** | Blue | Kalighat → Esplanade | **5.2 km** | **5.1 km** | **11.0 min** | 19.1 min | 28.4 km/h | 16.0 km/h | +8.1 min | 1.73x | 92.8% |
| **MC-06** | Blue | Dakshineswar → Dum Dum | **6.2 km** | **7.0 km** | **12.8 min** | 24.9 min | 29.0 km/h | 16.8 km/h | +12.1 min | 1.94x | 100.0% |
| **MC-07** | Blue | Esplanade → Mahanayak Uttam Kumar (Tollygunge) | **7.8 km** | **8.3 km** | **19.0 min** | 28.5 min | 24.6 km/h | 17.4 km/h | +9.5 min | 1.50x | 93.5% |
| **MC-08** | Blue | Mahanayak Uttam Kumar (Tollygunge) → Kavi Subhash | **7.1 km** | **6.4 km** | **15.9 min** | 24.2 min | 26.8 km/h | 15.9 km/h | +8.3 min | 1.52x | 84.2% |
| **MC-09** | Blue | Dum Dum → Esplanade | **8.8 km** | **8.8 km** | **16.0 min** | 36.5 min | 33.0 km/h | 14.5 km/h | +20.5 min | 2.28x | 100.0% |
| **MC-10** | Green | Howrah → Salt Lake Sector V | **14.2 km** | **12.4 km** | **30.0 min** | 44.8 min | 28.4 km/h | 16.6 km/h | +14.8 min | 1.49x | 74.8% |
| **MC-11** | Green | Sealdah → Salt Lake Sector V | **8.6 km** | **8.0 km** | **21.2 min** | 25.4 min | 24.3 km/h | 18.9 km/h | +4.2 min | 1.20x | 70.5% |
| **MC-12** | Green | Howrah → Sealdah | **5.6 km** | **6.8 km** | **10.3 min** | 28.9 min | 32.6 km/h | 14.1 km/h | +18.6 min | 2.81x | 100.0% |
| **MC-13** | Green | Phoolbagan → Salt Lake Sector V | **6.6 km** | **4.9 km** | **18.2 min** | 19.1 min | 21.7 km/h | 15.4 km/h | +0.9 min | 1.05x | 54.7% |
| **MC-14** | Green | Howrah → Phoolbagan | **7.7 km** | **7.6 km** | **11.8 min** | 30.8 min | 39.3 km/h | 14.8 km/h | +19.1 min | 2.62x | 100.0% |
| **MC-15** | Green | Esplanade → Salt Lake Sector V | **11.3 km** | **13.3 km** | **25.0 min** | 32.3 min | 27.1 km/h | 24.7 km/h | +7.3 min | 1.29x | 71.2% |
| **MC-16** | Orange | Kavi Subhash → Beleghata | **9.8 km** | **9.8 km** | **25.9 min** | 26.1 min | 22.7 km/h | 22.6 km/h | +0.1 min | 1.00x | 42.3% |
| **MC-17** | Orange | Hemanta Mukhopadhyay → Beleghata | **4.4 km** | **4.4 km** | **13.2 min** | 12.1 min | 19.9 km/h | 21.8 km/h | -1.1 min | 0.92x | 24.7% |
| **MC-18** | Orange | Kavi Subhash → Science City | **8.9 km** | **8.8 km** | **21.4 min** | 23.8 min | 25.0 km/h | 22.2 km/h | +2.4 min | 1.11x | 53.6% |
| **MC-19** | Purple | Joka → Majerhat | **7.9 km** | **7.8 km** | **17.2 min** | 23.1 min | 27.6 km/h | 20.2 km/h | +6.0 min | 1.35x | 89.7% |
| **MC-20** | Purple | Behala Chowrasta → Majerhat | **3.7 km** | **3.7 km** | **9.1 min** | 11.4 min | 24.4 km/h | 19.4 km/h | +2.3 min | 1.26x | 80.8% |
| **MC-21** | Purple | Joka → Behala Chowrasta | **4.2 km** | **4.1 km** | **8.0 min** | 11.2 min | 31.5 km/h | 21.9 km/h | +3.2 min | 1.40x | 90.8% |
| **MC-22** | Purple | Joka → Taratala | **6.6 km** | **6.5 km** | **14.0 min** | 19.8 min | 28.3 km/h | 19.7 km/h | +5.8 min | 1.42x | 94.4% |
| **MC-23** | Purple | Behala Chowrasta → Taratala | **2.4 km** | **2.4 km** | **6.0 min** | 8.2 min | 24.0 km/h | 17.6 km/h | +2.2 min | 1.36x | 82.6% |
| **MC-24** | Purple | Taratala → Majerhat | **1.3 km** | **1.3 km** | **3.0 min** | 4.0 min | 26.0 km/h | 19.6 km/h | +1.0 min | 1.33x | 36.6% |
