# eduStack - Student Data Dashboard

Empowering Education with Data Clarity.

## Overview
eduStack is a professional, web-based student data dashboard designed for university administrative use. It allows users to seamlessly upload student academic records (CSV/Excel), stores them in a robust relational database with support for dynamic columns, and provides a blazing-fast, modern search and analytics interface.

## Prerequisites
- Node.js 18+ installed

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   The project uses SQLite for zero-setup local development. The database file will be created automatically in the root folder (`dev.db`).
   Run the following command to push the schema to the database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Access the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing with Sample Data
A sample CSV file is provided in `public/test_data.csv`. You can download it from `http://localhost:3000/test_data.csv` and use the **Upload Data** button on the dashboard to test the ingestion pipeline.

## Features
- **File Upload:** Upload CSV or Excel (.xlsx) files. The schema dynamically handles varying columns (like varying subjects per semester) and maps them gracefully into a JSON store.
- **Robust Storage:** Powered by Prisma ORM and SQLite (easily swappable to PostgreSQL).
- **Fast Search:** Live-updating search bar for instant student lookups by Name or ID.
- **Analytics & Export:** View semester performance trends (using Recharts) and export a student's record as CSV.
- **Premium UI:** Glassmorphism, animations, and clean layouts using TailwindCSS and Lucide Icons.

## Technology Stack
- Next.js (App Router, API Routes)
- Prisma ORM
- TailwindCSS
- Recharts, Lucide React
- Papaparse & XLSX

*Built with ❤️ for educational administration.*
