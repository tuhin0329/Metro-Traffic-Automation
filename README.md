# 🚇 Kolkata Metro vs Bus Traffic Automation Engine

[![Automated 4x Daily Traffic Data Collection](https://github.com/tuhin0329/Metro-Traffic-Automation/actions/workflows/traffic_scraper.yml/badge.svg)](https://github.com/tuhin0329/Metro-Traffic-Automation/actions/workflows/traffic_scraper.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-v22-blue.svg)](https://pptr.dev/)
[![ExcelJS](https://img.shields.io/badge/ExcelJS-v4.4.0-darkgreen.svg)](https://github.com/exceljs/exceljs)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An enterprise-grade, 24/7 cloud-automated traffic data collection and research engine comparing **Bus vs Metro vs Driving (Car)** travel times, transfer delays, walking distances, and reliability across **25 key transit corridors** in Kolkata, India.

---

## 📌 Project Overview

This project autonomously captures synchronized real-time transit telemetry across 4 diurnal traffic periods daily. It evaluates multimodal public transit performance across Kolkata's complete metro network (Blue, Green, Purple, Orange, and Yellow Lines) against competing road transport options.

---

## ⏰ Automated 4x Daily Schedule (IST)

Data is collected autonomously 4 times each day in the cloud:

| Time Slot | IST Time | UTC Trigger | Operational Significance |
| :--- | :---: | :---: | :--- |
| 🌙 **Slot 1** | **12:00 AM IST** | `30 18 * * *` | **Late Night Free-Flow Baseline** (Zero congestion theoretical speed) |
| 🌅 **Slot 2** | **10:00 AM IST** | `30 4 * * *` | **Morning Peak Rush Hour** (Maximum commuter influx) |
| ☀️ **Slot 3** | **1:00 PM IST** | `30 7 * * *` | **Midday Inter-Peak** (Normal business-hours traffic) |
| 🌆 **Slot 4** | **7:00 PM IST** | `30 13 * * *` | **Evening Peak Rush Hour** (Return commute congestion) |

---

## 🛣️ Network Coverage (All 25 Transit Corridors)

### 🔵 Blue Line (North–South Corridor)
* **MC-01 (Macro):** Dakshineswar ↔ Esplanade *(Primary Bus: S57)*
* **MC-02 (Macro):** Shahid Khudiram ↔ Esplanade *(Primary Bus: 80A)*
* **MC-03 (Micro):** Dum Dum ↔ Shyambazar *(Primary Bus: S57, Backups: 78, 230, 234)*
* **MC-04 (Micro):** Shyambazar ↔ Esplanade *(Primary Bus: S57, Backups: 78, 34B)*
* **MC-05 (Micro):** Kalighat ↔ Esplanade *(Primary Bus: 80A, Backup: SD-8)*
* **MC-06 (Micro):** Dakshineswar ↔ Dum Dum *(Primary Bus: S57)*
* **MC-07 (Micro):** Esplanade ↔ Mahanayak Uttam Kumar (Tollygunge) *(Primary Bus: S57)*
* **MC-08 (Micro):** Mahanayak Uttam Kumar ↔ Kavi Subhash *(Primary Bus: S57)*
* **MC-09 (Micro):** Dum Dum ↔ Esplanade *(Primary Bus: S57)*

### 🟢 Green Line (East–West Underwater Corridor)
* **MC-10 (Macro):** Howrah Maidan ↔ Salt Lake Sector V *(Primary Bus: S173, Backup: S59)*
* **MC-11 (Micro):** Sealdah ↔ Salt Lake Sector V *(Primary Bus: S173, Backup: S59)*
* **MC-12 (Micro):** Howrah ↔ Sealdah *(Primary Bus: S3W)*
* **MC-13 (Micro):** Phoolbagan ↔ Salt Lake Sector V *(Primary Bus: S3W)*
* **MC-14 (Micro):** Howrah ↔ Phoolbagan *(Primary Bus: S173)*
* **MC-15 (Micro):** Esplanade ↔ Salt Lake Sector V *(Primary Bus: S173)*

### 🟠 Orange Line (EM Bypass Corridor)
* **MC-16 (Macro):** Kavi Subhash ↔ Beleghata *(Primary Bus: VS8, Backups: DN16, 1)*
* **MC-17 (Micro):** Hemanta Mukhopadhyay (Ruby) ↔ Beleghata *(Primary Bus: S3W)*
* **MC-18 (Micro):** Kavi Subhash ↔ Science City *(Primary Bus: VS8)*

### 🟣 Purple Line (Diamond Harbour Road Corridor)
* **MC-19 (Macro):** Joka ↔ Majerhat *(Primary Bus: 12C, Backups: SD-9, ST-28)*
* **MC-20 (Micro):** Behala Chowrasta ↔ Majerhat *(Primary Bus: S3W, Backups: 21, M7D)*
* **MC-21 (Micro):** Joka ↔ Behala Chowrasta *(Primary Bus: S3W, Backups: 21, M7D)*
* **MC-22 (Micro):** Joka ↔ Taratala *(Primary Bus: 12C)*
* **MC-23 (Micro):** Behala Chowrasta ↔ Taratala *(Primary Bus: 12C)*
* **MC-24 (Micro):** Taratala ↔ Majerhat *(Primary Bus: 12C)*

### 🟡 Yellow Line (Airport Extension)
* **MC-25 (Micro):** Dum Dum Cantonment ↔ Biman Bandar (Kolkata Airport) *(Primary Bus: L238)*

---

## 📊 Master Excel Workbook Structure

Every generated workbook (`output/Bus_vs_Metro_Data_YYYY-MM-DD_Day.xlsx`) contains:

1. **`All Periods Combined` (Master Comparison Tab):**
   * Side-by-side comparison of all 4 daily slots.
   * **Color-Coded Highlights:** 🟩 Metro Faster, 🟧 Bus Faster, 🟦 Car Faster.
   * Exact percentage time savings calculated automatically.

2. **Individual Period Tabs (`12_00_AM`, `10_00_AM`, `1_00_PM`, `7_00_PM`):**
   * Contains **32 standardized columns**:
     * Route metadata & transit badges
     * Bus vs Metro vs Car transit durations
     * Walk times and transfer details
     * Clickable Google Maps URLs
     * **Embedded Full HD 1080p Map Screenshots** in Columns 30, 31, and 32.

---

## 💻 Local Commands

```bash
# Sync cloud data to laptop
git pull --rebase

# Run scraper locally for a slot
node scheduled_4times_scraper.js all "10:00 AM"

# Audit historical datasets
node audit_all.js
