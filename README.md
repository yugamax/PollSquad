PollSquad — Community Polling Platform 🗳️

A modern, comic-style polling app built with React, Next.js, and Firebase where users vote, earn points, boost polls, and manage their data with full privacy control.


---

🔥 New Feature: List-Based Poll Interface

📋 List Layout — cleaner, faster poll browsing

🗳️ Modal Voting — open any poll to vote in a full-screen modal

🧑‍🎓 Profile Integration — show creator photo & college (if enabled)

✔️ Voted Indicators — see which polls you've answered

🔢 Multi-Question Support — all questions handled inside the modal



---

🔐 Authentication & Privacy

🔑 Login Required — polls are visible only after signing in

👁️ Profile Visibility Toggle — users choose what info to display

🛡️ Privacy by Default — no personal data shown without consent



---

⭐ Core Features

List-style poll feed with quick stats

Modal voting with progress bars & real-time updates

Points system (earn points for answering polls)

Boosting system (use points to promote polls)

Data requests for detailed datasets

Real-time Firestore sync

Responsive UI with smooth animations



---

📁 Project Structure (Detailed)

pollsquad/  
├── app/  
│   ├── page.tsx                 # Root page (redirects to dashboard)  
│   ├── dashboard/  
│   │   └── page.tsx             # Main dashboard ✅ FIXED  
│   ├── my-polls/  
│   │   └── page.tsx             # User's created polls ✅ NEW  
│   ├── create-poll/  
│   │   └── page.tsx             # Poll creation form  
│   ├── requests/  
│   │   └── page.tsx             # Data requests management  
│   ├── settings/  
│   │   └── page.tsx             # User settings  
│   ├── profile/  
│   │   └── page.tsx             # Profile settings ✅ NEW  
│   ├── datasets/  
│   │   └── page.tsx             # Dataset downloads  
│   ├── layout.tsx               # Root layout with providers  
│   └── globals.css              # Comic theme & styles  
├── components/  
│   ├── auth/  
│   │   ├── sign-in-modal.tsx    # Notification-style sign-in modal  
│   │   └── login-page.tsx       # Login page component  
│   ├── layout/  
│   │   ├── header.tsx           # Top navigation  
│   │   ├── sidebar.tsx          # Side navigation ✅ UPDATED  
│   │   └── dashboard-layout.tsx # Dashboard wrapper with auth  
│   ├── poll/  
│   │   ├── poll-card.tsx        # Poll display & voting  
│   │   ├── poll-feed.tsx        # Poll list with sorting  
│   │   ├── create-poll-modal.tsx# Poll creation form  
│   │   ├── boost-modal.tsx      # Boost purchase modal  
│   │   ├── export-button.tsx    # CSV/XLSX export  
│   │   └── request-data-modal.tsx# Data access requests  
│   └── ui/                      # shadcn/ui components  
├── lib/  
│   ├── firebase.ts              # Firebase config ✅  
│   ├── auth-context.tsx         # Auth state management ✅ CORRECT LOCATION  
│   ├── theme-context.tsx        # Theme management  
│   ├── db-types.ts              # TypeScript interfaces  
│   ├── db-service.ts            # Firestore CRUD operations ✅  
│   ├── points-service.ts        # Points calculation logic  
│   ├── export-service.ts        # CSV/XLSX export helpers  
│   └── request-service.ts       # Data request operations  
├── types/                       # Type definitions (may not exist yet)  
├── contexts/                    # ❌ DOES NOT EXIST - this was the issue!  
├── functions/                   # Cloud Functions  
│   ├── src/  
│   │   └── index.ts             # Email notifications  
│   └── package.json  
├── firebase.json                # Firebase configuration  
├── firestore.rules              # Firestore security rules  
├── firestore.indexes.json       # Firestore indexes  
└── .env.example                 # Environment variables template


---

🔒 Firebase Security (Short Version)

Polls: read/write only for authenticated users

Votes: users can read/create/delete only their own votes

No Vote Editing: votes cannot be modified after submission



---

🧩 Data Model Overview

users: profile, settings, points

polls: title, questions[], tags, boosts

votes: user selections per question

requests: data access requests + approval status



---

🎯 Points & Boosts

Start with 30 points

+5 points for completing a poll

Boost costs: 6h = 60, 24h = 120, 72h = 240



---

🛠️ Setup (Quick)

1. git clone → npm install


2. Copy .env.example → .env.local


3. Add Firebase config


4. Run locally: npm run dev


5. Deploy rules & indexes:

firebase deploy --only firestore:rules,firestore:indexes




---

🧪 What to Test

Dashboard loads without errors

Poll feed appears after login

Modal voting works smoothly

Voted status updates immediately



---

🐞 Troubleshooting

Polls not visible → check auth + Firestore rules

Votes not recording → verify userUid + database rules

Poll feed empty → ensure polls use the correct questions[] format



---