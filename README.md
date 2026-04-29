# 🏙️ Urba Chat

A modern, real-time team communication platform built with Next.js and Supabase. Think Slack — channels, direct messages, file sharing, and role-based administration, all in one clean interface.

> 🚀 **Live App:** [Deployed on Vercel](#) <!-- Replace with your Vercel URL -->

---

## ✨ Features

- 💬 **Real-time Messaging** — Instant channel and direct messages powered by Supabase Realtime
- 📢 **Channels** — Create and manage public or private team channels
- 📨 **Direct Messages** — Private one-on-one conversations between members
- 👤 **User Profiles** — View and manage member profiles across the platform
- 🔐 **Authentication** — Secure email-based auth with Supabase Auth
- 🛡️ **Role-Based Access Control** — Admin, leader, and member roles with scoped permissions
- 🔎 **Global Search** — Search across channels and messages
- 📁 **File Uploads** — Share files within conversations via Supabase Storage
- ⚙️ **Admin Panel** — Full workspace management for administrators
- 📱 **Responsive Design** — Works seamlessly on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Backend & DB | [Supabase](https://supabase.com/) (Postgres, Auth, Realtime, Storage) |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI |
| State Management | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| Rich Text | Tiptap Editor |
| Animations | Framer Motion |

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/minen27/urbaa.git
cd urbaa
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> You can find these values in your Supabase project under **Settings → API**.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, verification pages
│   ├── (main)/          # Main app (dashboard, channels, DMs)
│   └── api/             # API routes (auth, admin, messages)
├── components/
│   ├── admin/           # Admin management UI
│   ├── auth/            # Auth forms and flows
│   ├── channel/         # Channel views and creation
│   ├── chat/            # Message composer and list
│   ├── layout/          # Sidebar, navigation, shell
│   ├── profile/         # User profile components
│   ├── search/          # Global search UI
│   └── ui/              # Shared UI primitives
├── lib/                 # Supabase clients, helpers, hooks
└── types/               # TypeScript type definitions
```

---

## ☁️ Deployment

This app is deployed on **[Vercel](https://vercel.com)** — the recommended platform for Next.js applications.

> ⚠️ **Note:** This project uses server-side features (API routes, Supabase SSR) and **cannot** be hosted on GitHub Pages. Use Vercel or a similar platform that supports Node.js.

To deploy your own instance:
1. Fork this repository
2. Import it into [Vercel](https://vercel.com/new)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

---

## 📄 License

MIT © [minen27](https://github.com/minen27)
