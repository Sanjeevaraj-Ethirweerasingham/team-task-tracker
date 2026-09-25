# 📋 TeamTrack - Daily Task Management Dashboard

A modern, real-time task management and team workload tracking application. Designed as a fast, lightweight, and user-friendly alternative to heavy tools like Jira for daily team syncs and project management.

![TeamTrack Dashboard](https://via.placeholder.com/1000x500.png?text=TeamTrack+Dashboard)

## ✨ Features

* 📊 **KPI Dashboard**: Get a bird's-eye view of total tasks, pending, blocked, and completed work.
* 📋 **Multiple Task Views**: 
  * **List View**: Detailed, sortable table of all tasks.
  * **Kanban Board**: Drag-and-drop style column view (Pending, In Progress, Blocked, Completed).
  * **Calendar View**: Visual timeline of due dates.
* 👥 **Team Workload Tracking**: Monitor individual team members' bandwidth and task completion rates with visual charts.
* ⚡ **Real-time Sync**: Powered by Supabase Realtime—changes made by one user instantly appear on everyone else's screen.
* 🔐 **Authentication**: Secure email/password login system.
* 📥 **Data Portability**: Bulk import and export tasks via CSV.

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS
* **Backend / Database**: Supabase (PostgreSQL)
* **Authentication**: Supabase Auth
* **Icons & Charts**: Lucide React, Recharts
* **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. You will also need a free [Supabase](https://supabase.com/) account.

### 1. Clone the repository
```bash
git clone https://github.com/Sanjeevaraj-Ethirweerasingham/team-task-tracker.git
cd team-task-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Database Setup (Supabase)
1. Create a new project in Supabase.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. You will need to run the SQL migration script to create the tables, Row Level Security (RLS) policies, and Realtime triggers. *(Note: Ensure you run the initialization SQL script provided with this project).*
4. Go to **Authentication > Providers > Email** and toggle **OFF** "Confirm email" to allow instant sign-ups for your team.

### 4. Environment Variables
Create a `.env.local` file in the root of the project and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser. The first person to sign up will be logged in automatically!

## ☁️ Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your terminal to deploy.
3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel project's Environment Variables settings.

Alternatively, connect your GitHub repository directly to Vercel via the Vercel dashboard for automatic deployments on `git push`.

## 📄 License
This project is open-source and available under the MIT License.
