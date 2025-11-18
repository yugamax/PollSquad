# PollSquad - Community Polling Platform

A modern, playful polling platform where users earn points by answering polls, can boost their own polls to the top, and request access to detailed poll data. Built with React, Next.js, Firebase, and a vibrant comic-style aesthetic.

## 🎯 **NEW FEATURE: List-Based Poll Interface**

### **Updated Poll Display Features:**
- ✅ **List Layout** - Clean, scannable list of polls instead of cards
- ✅ **Modal Voting** - Click any poll to open detailed voting window  
- ✅ **Profile Integration** - Show user profile pictures and college info (if visible)
- ✅ **Quick Poll Info** - Vote count, question count, and tags at a glance
- ✅ **Voted Status** - Clear indicators for polls you've already voted on
- ✅ **Multi-Question Support** - Handle single or multiple questions in modal

### **User Profile Privacy:**
- **Profile Visibility Setting** - Users control if their profile info is shown
- **Conditional Display** - Profile pictures and college names only shown if enabled
- **Privacy by Default** - Profile visibility defaults to enabled but can be disabled

### **How the New UI Works:**
1. **Poll List View**: Compact list showing poll title, creator, vote count, and quick stats
2. **Click to Vote**: Click any poll row to open detailed voting modal
3. **Modal Interface**: Full-screen voting experience with all questions and options
4. **Real-time Updates**: Vote counts and status update immediately
5. **Profile Privacy**: Respects user privacy settings for profile information

### **Modal Voting Experience:**
- **Poll Header**: Shows creator info, poll title, and total votes
- **Question-by-Question**: Each question displayed separately with options
- **Progress Bars**: Visual representation of current vote distribution  
- **Individual Voting**: Submit votes for each question independently
- **Status Indicators**: Clear feedback on voted vs unvoted questions

## Features

### Core Features
- **List-Based Poll Feed** - Clean, efficient browsing of available polls
- **Modal Voting Interface** - Detailed voting experience in popup window
- **Profile Privacy Controls** - Users control visibility of profile information
- **Authentication-Required Voting** - Secure voting system for registered users
- **Multi-Question Poll Support** - Handle complex polls with multiple questions
- **Real-time Vote Tracking** - Live updates of vote counts and percentages
- **Visual Progress Indicators** - Progress bars and percentage displays
- **Responsive Design** - Works seamlessly on desktop and mobile

### Privacy & Profile Features
- **Profile Visibility Toggle** - Control whether profile info is public
- **Selective Information Display** - Show/hide profile picture and college info
- **Privacy-First Design** - No personal information shown without consent
- **User-Controlled Data** - Full control over what others can see

### Access Control Details
- **Unauthenticated Access**: Sign-in prompt with features preview - no poll data visible
- **Authenticated Access**: Full poll browsing, voting, creation, and management
- **Data Security**: Complete protection of poll content and user data
- **Privacy Protection**: User voting history and personal data secured

### Voting System Details
- **Authentication Required**: Must sign in to view any polls
- **Secure Voting**: Only authenticated users can vote on polls
- **Vote Validation**: Prevents duplicate votes on same question
- **Real-time Updates**: Vote counts update immediately without page refresh
- **Visual Indicators**: Selected options, voted status, and progress bars
- **Points Rewards**: Earn points for every poll completed

## 🎯 **NEW FEATURE: Authentication-Required Poll Access**

### **Updated Authentication Flow:**
- ✅ **Login Prompt** - Unauthenticated users see compelling sign-in screen
- ✅ **Features Preview** - Show what they can do after signing in
- ✅ **No Poll Data** - Complete privacy protection until authentication
- ✅ **Seamless Sign-In** - One-click Google authentication
- ✅ **Immediate Access** - Full poll feed unlocked after sign-in

### **Security Benefits:**
- **Complete Privacy** - No poll content visible without authentication
- **User Data Protection** - All voting history and preferences secured
- **Engagement Incentive** - Clear value proposition encourages registration
- **Clean UX** - Professional authentication flow with feature benefits

## Project Structure (Corrected)

```
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
```

## 🚀 **NEXT STEPS - Testing the Complete Fix**

### Step 1: Test Dashboard Loading
1. **Save all files** and restart dev server: `Ctrl+C` then `npm run dev`
2. **Navigate to**: http://localhost:3000/dashboard
3. **Check browser console** for these logs without errors

### Step 2: Expected Behavior
- ✅ Dashboard renders with original design
- ✅ No "Cannot read properties of undefined" errors
- ✅ PollFeed shows loading state, then either polls or "No polls available"
- ✅ Refresh button works without errors

### Step 3: Test Error Handling
- If getFeedPolls fails, you should see a proper error message with "Try Again" button
- If no polls exist, you should see "No Polls Available" message
- Loading states should display properly

## 🔧 **TROUBLESHOOTING - If Issues Persist**

### Issue: Still getting "Cannot read properties of undefined"
**Solution:**
1. Check browser console for detailed error logs
2. Verify getFeedPolls returns an array (check db-service.ts)
3. Clear browser cache completely

### Issue: Import errors in other components
**Solution:**
1. Update any remaining `@/` imports to relative paths
2. Check TypeScript errors in VS Code
3. Restart dev server after path changes

### Issue: Polls not loading
**Solution:**
1. Check Firebase connection logs
2. Verify Firestore security rules
3. Test with manual poll creation

## Firebase Firestore Security Rules

Updated rules to support authenticated-only access:

```javascript
// Polls: Public read access for authenticated users only
match /polls/{pollId} {
  allow read: if request.auth != null; // Only authenticated users can read polls
  allow write: if request.auth != null; // Only authenticated users can create/update
}

// Votes: Authenticated users can create and read their own votes
match /votes/{voteId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.userUid;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userUid;
  allow delete: if request.auth != null && request.auth.uid == resource.data.userUid; // NEW: Allow vote deletion
  allow update: if false; // Votes cannot be updated once created
}
```

## Vote Management API

1. **Vote Submission**: `submitVote()` records vote and updates poll counts
2. **Vote Removal**: `removeVote()` deletes vote record and decreases counts
3. **Vote Validation**: `getUserVotesForPoll()` tracks user voting history
4. **Real-time Updates**: Vote counts reflect immediately in UI after any change

## Updated Security Model

The platform now implements **authentication-required access** for all poll data:

1. **Landing Page**: Unauthenticated users see sign-in prompt with feature benefits
2. **Poll Access**: All poll viewing requires authentication
3. **Voting System**: Full voting functionality only available to signed-in users
4. **Data Protection**: Complete privacy protection for poll content and user data
5. **Engagement**: Clear value proposition encourages user registration

## Voting API Workflow

1. **Poll Display**: `getFeedPolls()` loads all visible polls
2. **Vote Submission**: `submitVote()` records vote and updates poll counts  
3. **Vote Validation**: `getUserVotesForPoll()` prevents duplicate voting
4. **Points Award**: `awardPoints()` gives points for voting participation
5. **Real-time Updates**: Vote counts reflect immediately in UI

## Features

### Core Features
- **Google Sign-In Authentication** - Secure auth with Firebase Authentication via notification-style modal
- **Multi-Question Polls** - Create polls with multiple questions under one title
- **Vote & Earn Points** - Answer polls and earn points based on engagement
- **Points System** - Earn bonus points for answering undersampled polls
- **Boost Polls** - Spend points to push your polls to the top for 6-72 hours
- **Export Results** - Download poll results as CSV or Excel files
- **Data Access Requests** - Request access to detailed poll data with owner approval
- **Real-time Feed** - See polls sorted by boost status and recency
- **User Dashboard** - Track points, created polls, and voting history
- **Guest Access** - First-time users can view the homepage and sign in directly via modal

### Technical Highlights
- Comic-style UI with playful micro-interactions (Framer Motion)
- Responsive design with Tailwind CSS
- Multi-question poll support with individual question voting
- Real-time data synchronization via Firestore
- Cloud Functions for email notifications
- Row-level security with Firestore rules
- Automatic point rewards and poll ranking
- Seamless first-time user onboarding with notification-style sign-in modal

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
    profileVisibility: boolean // NEW: Control profile visibility
  }
  profile?: { // NEW: Extended profile information
    bio?: string
    college?: string
    course?: string
    year?: string
    location?: string
    interests?: string[]
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
  description?: string
  questions: [
    {
      id: string,
      question: string,
      options: [
        { id: string, text: string, votesCount: number }
      ],
      totalVotes: number
    }
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
  questionId: string
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
  pollTitle: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: Timestamp
  respondedAt?: Timestamp
  approverUid?: string
}
\`\`\`

## Points System

### Points Allocation
- **Starting Points**: 30 points for new accounts
- **Poll Completion**: 5 points per fully completed poll (all questions answered)
- **Consecutive Poll Bonus**: +10 additional points for every 5 consecutive poll completions
- **Own Poll Voting**: Poll creators can vote on their own polls but receive no points
- **One-Time Rewards**: Points awarded only once per poll, regardless of question count
- **Boost Cost**: 60-240 points depending on boost duration

### Boost Pricing
- **6 Hours**: 60 points
- **24 Hours**: 120 points
- **72 Hours**: 240 points

### Voting Rules
- **Public Polls**: Any authenticated user can vote and earn points
- **Own Polls**: Creators can participate in their own polls without point rewards
- **Duplicate Prevention**: One vote per question per user, points awarded once per poll
- **Completion Tracking**: Must answer all questions to be eligible for points

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

### Polls not showing up after creation

1. **Check browser console** for any JavaScript errors
2. **Verify poll format** in Firestore - should have `questions` array, not `options`
3. **Check Firestore security rules** allow read access to polls collection
4. **Verify poll has `visible: true`** field in Firestore
5. **Run the migration script** above if you have old format polls
6. **Clear browser cache** and refresh the page
7. **Check if polls exist** by running this query in Firebase Console:
   ```javascript
   // In Firebase Console > Firestore
   db.collection('polls').where('visible', '==', true).limit(5).get()
   ```
8. **Test with a simple poll** - create a basic poll with just title and 2 options
9. **Check network tab** in browser dev tools for failed API calls
10. **Verify Firebase project ID** matches your environment variables

### Common poll display issues

**Issue: Polls created but dashboard shows "No polls available"**
- Check browser console for getFeedPolls errors
- Verify Firestore indexes are deployed: `firebase deploy --only firestore:indexes`
- Ensure user has read permissions in firestore.rules
- Test with different browser/incognito mode

**Issue: Polls exist in Firestore but getFeedPolls returns empty array**
- Check that polls have `visible: true` field
- Verify `questions` array format (not old `options` format)
- Check for JavaScript errors in poll processing
- Test the getFeedPolls function directly in browser console

### Poll creation fails with format errors

1. **Ensure you're using the latest version** of the create poll components
2. **Check that polls are being created with `questions` format** in Firestore
3. **Verify all required fields** are filled (title, at least 2 options per question)
4. **Check browser console** for detailed error messages

### Firestore "invalid data" errors

If you see errors like "Unsupported field value: undefined":

1. **Update your code** to filter out undefined values before saving to Firestore
2. **Use conditional object spreading** for optional fields:
   ```javascript
   const data = {
     title: poll.title,
     ...(poll.description && { description: poll.description }),
     ...(poll.ownerImage && { ownerImage: poll.ownerImage })
   }
   ```
3. **Never pass `undefined` directly** to Firestore - use `null` or omit the field entirely
4. **Check your createPoll function** follows the updated format that filters undefined values

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

## 🔧 **RECENT FIXES: Profile Settings & Vote Tracking**

### **Issues Resolved:**
- ✅ **Profile Settings Added** - Added profile settings option to sidebar navigation with user icon
- ✅ **Vote Tracking Fixed** - Fixed issue where votes from different accounts were being mixed up
- ✅ **Checkbox Alignment** - Fixed misaligned tick marks in checkboxes on desktop mode
- ✅ **Account Switching** - Proper vote data clearing when switching between accounts
- ✅ **Points System Updated** - New accounts start with 25 points, earn 5 points per completed poll

### **Points System Details:**
- **New Account**: Start with 40 points
- **Complete Poll**: +5 points (must answer ALL questions in one poll)
- **Consecutive Poll Bonus**: +10 additional points for every 5 consecutive poll completions
- **One-Time Reward**: Points awarded only once per poll completion
- **No Question-Level Points**: Individual questions no longer give points

### **New Points System:**
- **Starting Points** - All new accounts begin with 30 points automatically
- **Poll Completion Rewards** - Earn 5 points only when you complete ALL questions in a poll
- **No Per-Question Points** - Points are no longer awarded for individual questions
- **Completion Tracking** - System tracks which polls you've fully completed to prevent double rewards
- **Consecutive Bonus** - Additional 10 points for every 5 consecutive poll completions

### **Profile Settings Integration:**
- **Sidebar Navigation** - Added "Profile Settings" link with user icon between Home and Settings
- **Easy Access** - Direct navigation to profile customization page at `/profile`
- **Consistent UI** - Follows same design patterns as other sidebar items
- **User-Friendly** - Clear icon and label for easy identification

### **Vote Tracking Improvements:**
- **User-Specific Votes** - Each user account now properly tracks only their own votes
- **Account Switching** - Switching accounts properly clears and reloads vote data with immediate effect
- **Enhanced Logging** - Improved debugging logs for better vote tracking verification
- **Data Integrity** - Prevents vote leakage between different user accounts with double verification
- **Separate Effects** - Split useEffect hooks for user changes vs poll changes for better performance

### **UI/UX Fixes:**
- **Checkbox Centering** - Tick marks now properly centered in checkboxes using flexbox alignment
- **Font Weight** - Made checkmarks bold for better visibility and consistency
- **Responsive Alignment** - Fixed alignment issues across different screen sizes
- **Visual Consistency** - Checkboxes look consistent across all voting interfaces

### **Technical Improvements:**
- **Effect Separation** - Split user tracking and poll tracking into separate useEffect hooks
- **State Management** - Better clearing of vote states when switching accounts
- **Performance** - Reduced unnecessary re-renders by optimizing dependency arrays
- **Debug Logging** - Enhanced console logs for easier troubleshooting