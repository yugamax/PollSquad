# PollSquad - Community Polling Platform

A modern, playful polling platform where users earn points by answering polls, can boost their own polls to the top, and request access to detailed poll data. Built with React, Next.js, Firebase, and a vibrant comic-style aesthetic.

## Features

### Core Features
- **Google Sign-In Authentication** - Secure auth with Firebase Authentication
- **Poll Creation** - Create multi-option polls with tags and descriptions
- **Vote & Earn Points** - Answer polls and earn points based on engagement
- **Points System** - Earn bonus points for answering undersampled polls
- **Boost Polls** - Spend points to push your polls to the top for 6-72 hours
- **Export Results** - Download poll results as CSV or Excel files
- **Data Access Requests** - Request access to detailed poll data with owner approval
- **Real-time Feed** - See polls sorted by boost status and recency
- **User Dashboard** - Track points, created polls, and voting history

### Technical Highlights
- Comic-style UI with playful micro-interactions (Framer Motion)
- Responsive design with Tailwind CSS
- Real-time data synchronization via Firestore
- Cloud Functions for email notifications
- Row-level security with Firestore rules
- Automatic point rewards and poll ranking

## Project Structure

\`\`\`
pollsquad/
├── app/
│   ├── page.tsx                 # Login page
│   ├── dashboard/
│   │   └── page.tsx             # Main dashboard
│   ├── requests/
│   │   └── page.tsx             # Data requests management
│   ├── layout.tsx               # Root layout with providers
│   └── globals.css              # Comic theme & styles
├── components/
│   ├── auth/
│   │   ├── login-button.tsx     # Google Sign-In button
│   │   └── login-page.tsx       # Login page component
│   ├── layout/
│   │   ├── header.tsx           # Top navigation
│   │   └── dashboard-layout.tsx # Dashboard wrapper with auth
│   ├── poll/
│   │   ├── poll-card.tsx        # Poll display & voting
│   │   ├── poll-feed.tsx        # Poll list with sorting
│   │   ├── create-poll-modal.tsx# Poll creation form
│   │   ├── boost-modal.tsx      # Boost purchase modal
│   │   ├── export-button.tsx    # CSV/XLSX export
│   │   └── request-data-modal.tsx# Data access requests
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── firebase.ts              # Firebase config
│   ├── auth-context.tsx         # Auth state management
│   ├── db-types.ts              # TypeScript interfaces
│   ├── db-service.ts            # Firestore CRUD operations
│   ├── points-service.ts        # Points calculation logic
│   ├── export-service.ts        # CSV/XLSX export helpers
│   └── request-service.ts       # Data request operations
├── functions/                   # Cloud Functions
│   ├── src/
│   │   └── index.ts             # Email notifications
│   └── package.json
├── firebase.json                # Firebase configuration
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore indexes
└── .env.example                 # Environment variables template
\`\`\`

## Installation & Setup

### Prerequisites
- Node.js 18+
- Firebase project (create at [firebase.google.com](https://firebase.google.com))
- Gmail account with app-specific password (for Cloud Functions)

### Step 1: Clone & Install

\`\`\`bash
git clone <repo-url>
cd pollsquad
npm install
cd functions && npm install && cd ..
\`\`\`

### Step 2: Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Set up authentication:
   - Go to **Authentication** > **Sign-in method**
   - Enable **Google** provider
3. Create a Firestore database:
   - Go to **Firestore Database** > **Create database**
   - Start in production mode
   - Choose a region

### Step 3: Environment Variables

1. Copy `.env.example` to `.env.local`
2. Get your Firebase config from Project Settings:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
3. Update `.env.local` with your Firebase credentials:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   \`\`\`

### Step 4: Deploy Firestore Rules & Indexes

\`\`\`bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes
\`\`\`

### Step 5: Setup Cloud Functions (Optional - for email notifications)

1. Set up Gmail with app-specific password
2. Configure environment variables in Firebase:
   \`\`\`bash
   firebase functions:config:set gmail.email="your_email@gmail.com"
   firebase functions:config:set gmail.password="your_app_password"
   \`\`\`
3. Deploy functions:
   \`\`\`bash
   firebase deploy --only functions
   \`\`\`

### Step 6: Local Development

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` and sign in with your Google account.

### Step 7: Deploy to Firebase Hosting

\`\`\`bash
npm run build
firebase deploy --only hosting
\`\`\`

## Firebase Firestore Data Model

### collections/users
\`\`\`typescript
{
  uid: string
  displayName: string
  email: string
  photoURL?: string
  points: number
  createdAt: Timestamp
  settings: {
    emailNotifications: boolean
  }
}
\`\`\`

### collections/polls
\`\`\`typescript
{
  pollId: string (auto-generated)
  ownerUid: string
  ownerName: string
  ownerImage?: string
  title: string
  options: [
    { id: string, text: string, votesCount: number }
  ]
  tags: string[]
  totalVotes: number
  createdAt: Timestamp
  expiresAt?: Timestamp
  boostedUntil?: Timestamp
  visible: boolean
}
\`\`\`

### collections/votes
\`\`\`typescript
{
  voteId: string (auto-generated)
  pollId: string
  userUid: string
  selectedOptions: string[]
  createdAt: Timestamp
}
\`\`\`

### collections/requests
\`\`\`typescript
{
  reqId: string (auto-generated)
  pollId: string
  requesterUid: string
  requesterName: string
  requesterEmail: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: Timestamp
  respondedAt?: Timestamp
  approverUid?: string
}
\`\`\`

## Points System

### Points Allocation
- **Base Points**: 5 points per poll answer
- **Streak Bonus**: +10 points for 3+ consecutive answers
- **Undersampled Bonus**: +15 points for polls with < 50 total votes
- **Boost Cost**: 50-200 points depending on boost duration

### Boost Pricing
- **6 Hours**: 50 points
- **24 Hours**: 100 points
- **72 Hours**: 200 points

## API Endpoints

All operations are performed via Firestore and client-side. Cloud Functions handle:
- Email notifications on data requests
- Request approval emails
- Automated point calculations

## Customization

### Change Colors
Edit the color palette in `app/globals.css`:
\`\`\`css
:root {
  --primary: #FF6B6B;      /* Red */
  --accent: #4ECDC4;       /* Teal */
  --success: #95E1D3;      /* Mint */
  --warning: #FFE66D;      /* Yellow */
}
\`\`\`

### Adjust Points
Edit `lib/points-service.ts` to modify point rewards and costs.

### Change Boost Durations
Edit `components/poll/boost-modal.tsx` to add/remove boost options.

## Performance Optimization

- Memoized auth context to prevent unnecessary re-renders
- Lazy loading of poll feeds with pagination
- Cached user data in React components
- Optimized Firestore indexes for common queries
- CSS-in-JS for dynamic theming

## Security

- **Authentication**: Google Sign-In with Firebase Auth
- **Authorization**: Firestore rules enforce user-level access control
- **Data Privacy**: Only poll owners can access/approve data requests
- **Rate Limiting**: Voting limited to once per poll per user

## Deployment Checklist

- [ ] Firebase project created
- [ ] Authentication configured
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Environment variables set
- [ ] Cloud Functions deployed (optional)
- [ ] App built and tested locally
- [ ] Deployed to Firebase Hosting

## Troubleshooting

### "Access denied" errors
- Ensure you're signed in with Google
- Check Firebase security rules in firestore.rules
- Verify user has proper Firestore permissions

### Votes not being recorded
- Check browser console for errors
- Ensure database rules allow vote creation
- Verify user is authenticated

### Emails not sending
- Ensure Cloud Functions are deployed
- Check Gmail app-specific password is correct
- Verify Firebase Functions environment variables

## Future Enhancements

- [ ] Leaderboard page with top users
- [ ] Poll categories and advanced filtering
- [ ] User profiles with poll history
- [ ] In-app notifications system
- [ ] Poll comments/discussions
- [ ] Mobile app with React Native
- [ ] Analytics dashboard for poll creators
- [ ] A/B testing for poll options

## License

MIT License - feel free to use this for your projects!

## Support

For issues or questions, please open an GitHub issue or contact support.
#   P o l l S q u a d  
 