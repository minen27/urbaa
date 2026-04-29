# 🏙️ Urba Chat

A modern, real-time team communication platform built with Next.js and Supabase. Think Slack — channels, direct messages, file sharing, and role-based administration, all in one clean interface.



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




