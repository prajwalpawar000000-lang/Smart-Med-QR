# 🏥 Smart MED QR

> **Scan • Know • Use • Stay Safe**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

A web application that generates QR codes for medical inventory, allowing instant retrieval of medicine information, safety guidelines, and batch verification via a simple smartphone scan.

---

## 📑 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Google Sheet + Apps Script Setup](#-google-sheet--apps-script-setup)
- [Environment Variables](#-environment-variables)
- [Demo Walkthrough](#-demo-walkthrough)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Future Improvements](#-future-improvements)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 📖 About

**Smart MED QR** addresses the critical issue of medicine mismanagement, confusion, and adverse drug events due to lack of accessible information. Often, patient instruction leaflets are lost, or older adults struggle to read the microscopic print on medicine strips. 

This project was built for the **Avishkar State Level Research Competition**. 

Our philosophy is simple:
- 📱 **Scan:** Use any standard smartphone camera.
- 🧠 **Know:** Instantly retrieve generic names, strengths, and expiry dates.
- 💊 **Use:** Read clear, large-font directions and dosages.
- 🛡️ **Stay Safe:** Prevent adverse reactions by knowing exact indications and verifying authentic batches.

---

## ✨ Features

- [x] **Dynamic QR Code Generation:** Instantly generate printable QR labels for any medicine.
- [x] **Serverless Database:** Uses Google Sheets as a free, easily manageable database backend.
- [x] **Mobile-First Patient View:** Clean, large-typography interface designed specifically for mobile devices reading the QR code.
- [x] **Batch Verification:** Verify the authenticity and expiration status of medicines via batch number search.
- [x] **Admin Dashboard:** Full CRUD operations to manage the medicine database.
- [x] **PWA Ready:** Can be installed on mobile devices for quick access.
- [x] **Expiration Alerts:** Color-coded badges instantly flag expired or expiring-soon medications.
- [x] **Search & Filter:** Quickly find inventory by generic or brand names.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend Framework** | React 18 | Component-based UI library |
| **Build Tool** | Vite | Next-generation frontend tooling |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Routing** | React Router v6 | Declarative routing |
| **Icons** | Lucide React | Clean, consistent SVG icons |
| **QR Generation** | qrcode.react | React component for QR generation |
| **Backend / DB** | Google Apps Script + Google Sheets | Free, serverless REST API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm (Node Package Manager)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/smart-med-qr.git
   cd smart-med-qr
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment**
   Copy the example environment file and update it with your Google Apps Script Web App URL.
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

---

## 📊 Google Sheet + Apps Script Setup

To power the backend, you need to configure a Google Sheet and deploy an Apps Script.

1. **Create a new Google Sheet** at [sheets.google.com](https://sheets.google.com).
2. **Name it** 'Smart MED QR Database'.
3. **Rename the first sheet tab** to `Medicines`.
4. **Add exact column headers in Row 1** (A through O): 
   `Sr. No`, `Generic Name`, `Brand Name`, `Strength`, `Dosage Form`, `Route`, `Use/Indication`, `Dose`, `Direction for Use`, `Manufacturer`, `Batch No.`, `Mfg. Date`, `Exp. Date`, `Manufacturing Licence No.`, `Medicine Page Link`.
5. **Add seed data** to Rows 2-6 (Refer to `apps-script/SHEET_TEMPLATE.md` for sample data).
6. Go to **Extensions → Apps Script** in the Google Sheets menu.
7. **Replace the `Code.gs` content** with the code found in `apps-script/Code.gs` of this repository.
8. **Update `BASE_URL`** in the script to match your frontend production URL (e.g., `https://your-app.vercel.app`).
9. Click **Deploy → New deployment**.
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
10. **Deploy and Authorize** the script.
11. **Copy the Web app URL** and paste it into your local `.env` file as `VITE_API_URL`.

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | The Google Apps Script Web App URL | Yes | `''` |
| `VITE_APP_TITLE` | The title of the web application | No | `Smart MED QR` |

---

## 📱 Demo Walkthrough

1. **Adding a medicine:** Open the Admin Dashboard, click "Add Medicine", and fill in details like Paracetamol 500mg.
2. **Generating a QR code:** Once added, click the QR icon next to the medicine in the list.
3. **Downloading the label:** The system generates a clean, printable label with the QR code and basic medicine details. Print this and attach it to the medicine box.
4. **Scanning the QR:** Use any smartphone camera to scan the printed label.
5. **Viewing the information:** The phone will open the specific Medicine Information Page (e.g., `/m/1`), showing large-text, easy-to-read instructions, indications, and expiry status.
6. **Verifying a batch:** Navigate to the Batch Verification tool on the home page, enter the batch number, and confirm if the medicine is authentic and safe to use.

---

## 🌐 Deployment

The application is a standard Vite React app, which builds to static files and can be deployed anywhere.

### Vercel (Recommended)
1. Push your code to GitHub.
2. Go to Vercel and "Import Project".
3. Select your repository.
4. Add your `VITE_API_URL` environment variable.
5. Click **Deploy**.

### Netlify
1. Connect your GitHub repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Site Settings.
5. Deploy Site.

### Firebase Hosting
1. Install CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Init: `firebase init hosting` (Set public dir to `dist`, configure as SPA).
4. Build: `npm run build`
5. Deploy: `firebase deploy`

---

## 📁 Project Structure

\`\`\`
smart-med-qr/
├── apps-script/            # Backend Google Apps Script code & templates
│   ├── Code.gs
│   └── SHEET_TEMPLATE.md
├── public/                 # Static assets (favicons, manifest)
├── src/                    
│   ├── components/         # Reusable UI components
│   ├── pages/              # Main route pages (Home, Admin, Patient View)
│   ├── services/           # API integration and Google Sheet calls
│   ├── utils/              # Helper functions (date formatting, etc.)
│   ├── App.jsx             # Main routing configuration
│   └── main.jsx            # React entry point
├── .env.example            # Environment variables template
├── index.html              # HTML entry point
├── package.json            # Project dependencies
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite build configuration
\`\`\`

---

## 🚀 Future Improvements

1. **Pharmacy Login:** Implement secure authentication so individual pharmacists can manage their own distinct inventories.
2. **Manufacturer Verification:** Introduce digitally signed QR codes using asymmetric cryptography to prevent counterfeiting completely.
3. **Scan Analytics:** Track scan counts, geographical locations, and timestamps to provide insights to health administrators.
4. **Voice Readout (TTS):** Integrate the Web Speech API to provide text-to-speech capabilities for illiterate or visually impaired users.
5. **Drug Interaction Checker:** Warn patients if two scanned medicines have known adverse interactions.
6. **Multilingual Expansion:** Support local languages like Hindi, Tamil, Telugu, and Bengali to increase accessibility.
7. **Offline-First:** Implement full offline mode with IndexedDB caching and Service Workers for areas with poor connectivity.
8. **Blockchain Verification:** Utilize blockchain for tamper-proof supply chain tracking from manufacturer to patient.
9. **Government Database Integration:** Sync with CDSCO (Central Drugs Standard Control Organisation) databases for real-time drug recall alerts.
10. **SMS-Based Verification:** Allow users with feature phones to verify batch numbers via a simple SMS gateway.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgements

- Built for the **Avishkar State Level Research Competition**.
- Icons provided by [Lucide React](https://lucide.dev/).
- QR code generation by [qrcode.react](https://github.com/zpao/qrcode.react).
- Styling framework by [Tailwind CSS](https://tailwindcss.com/).
