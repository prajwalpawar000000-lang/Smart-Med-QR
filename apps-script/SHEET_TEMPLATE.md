# Google Sheet Template Setup

To use the Google Apps Script backend, you need to set up your Google Sheet exactly as described below.

## Instructions

1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Rename the spreadsheet to **"Smart MED QR Database"**.
3. Rename the default sheet at the bottom from "Sheet1" to **"Medicines"**.
4. In Row 1, carefully copy and paste the following headers exactly as they appear (case and space sensitive).

## Exact Column Headers (Row 1)

| Column | Header Name | Suggested Formatting |
|---|---|---|
| A | `Sr. No` | Number, Center Aligned |
| B | `Generic Name` | Plain Text |
| C | `Brand Name` | Plain Text |
| D | `Strength` | Plain Text |
| E | `Dosage Form` | Plain Text |
| F | `Route` | Plain Text |
| G | `Use/Indication` | Plain Text, Wrap Text |
| H | `Dose` | Plain Text |
| I | `Direction for Use` | Plain Text, Wrap Text |
| J | `Manufacturer` | Plain Text |
| K | `Batch No.` | Plain Text, Center Aligned |
| L | `Mfg. Date` | Date (`YYYY-MM-DD` or `MM/YYYY`) |
| M | `Exp. Date` | Date (`YYYY-MM-DD` or `MM/YYYY`) |
| N | `Manufacturing Licence No.` | Plain Text |
| O | `Medicine Page Link` | URL / Link |

## Seed Data (Rows 2-6)

Copy and paste the following 5 sample rows into your sheet for testing purposes.

| Sr. No | Generic Name | Brand Name | Strength | Dosage Form | Route | Use/Indication | Dose | Direction for Use | Manufacturer | Batch No. | Mfg. Date | Exp. Date | Manufacturing Licence No. | Medicine Page Link |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Paracetamol | Crocin Advance | 500mg | Tablet | Oral | Fever, Mild to moderate pain | 1-2 tablets every 4-6 hrs | Take with food to avoid stomach upset | GSK Pharma | PAR-2023-A1 | 2023-01-15 | 2026-01-14 | ML-12345-DL | `https://smartmedqr.vercel.app/m/1` |
| 2 | Amoxicillin | Moxikind | 250mg | Capsule | Oral | Bacterial infections | 1 capsule every 8 hrs | Complete the full course as prescribed | Mankind Pharma | AMX-55B-99 | 2023-05-10 | 2025-05-09 | ML-98765-MH | `https://smartmedqr.vercel.app/m/2` |
| 3 | Cetirizine | Zyrtec | 10mg | Tablet | Oral | Allergies, Hay fever | 1 tablet daily | May cause drowsiness. Avoid driving. | J&J India | CET-0092-X | 2023-08-20 | 2025-08-19 | ML-44556-GJ | `https://smartmedqr.vercel.app/m/3` |
| 4 | Metformin | Gluconorm | 500mg | Tablet (SR) | Oral | Type 2 Diabetes | 1 tablet twice daily | Take immediately after meals | Lupin Ltd | MET-112-Q2 | 2023-11-05 | 2026-11-04 | ML-77665-MP | `https://smartmedqr.vercel.app/m/4` |
| 5 | Ibuprofen + Paracetamol | Combiflam | 400mg + 325mg | Tablet | Oral | Pain relief, Inflammation | 1 tablet every 8 hrs | Do not exceed recommended dose | Sanofi India | CMB-88X-22 | 2024-02-10 | 2027-02-09 | ML-33445-KA | `https://smartmedqr.vercel.app/m/5` |

## Visual Guidelines (What it should look like)

- **Header Row:** Make it bold and give it a light gray background color for readability.
- **Freeze Row 1:** Go to View > Freeze > 1 Row, so headers stay visible when scrolling down.
- **Column Widths:** Expand columns G (Use/Indication) and I (Direction for Use) as they will contain longer text. Enable Text Wrapping for these columns.

*Note: All seed data is sample data for demonstration purposes only.*
