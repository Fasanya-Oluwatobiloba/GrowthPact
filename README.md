# GrowthPact — Full Setup Guide

## ✅ What's built
- Firebase Auth (email/password sign up, login, logout)
- Firestore real-time database for ALL features
- Streak tracking (auto-updates on login)
- Today's focus tasks (add, tick off, delete)
- Goals tracker (add goals, update progress, delete)
- Community feed (post, like, comment, real-time)
- Bible Study Journal (entries, view all, delete)
- Mental Growth Journal (mood picker, thought patterns, gratitude, trend chart)
- Character & Identity Journal (traits, status, scripture anchors)
- Book Reading Journal (add books, log chapters, add notes)
- Finance Tracker (log expenses, savings goal, category breakdown)
- Personal Sandbox (write, brainstorm, gratitude, dream log, vent)
- Profile (edit name/church, settings, badges, sign out)
- Responsive scaling — works on all phone sizes

---

## Step 1 — Install dependencies

Extract the zip. Inside the `growthpact` folder run:

```bash
npm install --legacy-peer-deps
```

---

## Step 2 — Set up Firebase

### 2a. Create the project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it **GrowthPact** → Continue
3. Disable Google Analytics (optional) → Create project

### 2b. Add a web app
1. Click the **</>** (Web) icon
2. Register app name: **growthpact**
3. Copy the `firebaseConfig` object that appears

### 2c. Paste your config
Open `lib/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_VALUE",
  authDomain:        "PASTE_YOUR_VALUE",
  projectId:         "PASTE_YOUR_VALUE",
  storageBucket:     "PASTE_YOUR_VALUE",
  messagingSenderId: "PASTE_YOUR_VALUE",
  appId:             "PASTE_YOUR_VALUE",
};
```

### 2d. Enable Authentication
1. In Firebase console → **Authentication** → **Get started**
2. Sign-in method → **Email/Password** → Enable → Save

### 2e. Enable Firestore
1. In Firebase console → **Firestore Database** → **Create database**
2. Select **Start in test mode** → choose a region → Done

### 2f. Set Firestore security rules (for test mode)
In Firestore → Rules tab, it should already say:
```
allow read, write: if request.time < timestamp.date(2025, 12, 1);
```
This is fine for testing. Before you publish, update these rules.

---

## Step 3 — Start the app

Make sure your phone and computer are on the **same Wi-Fi network**.

```bash
npx expo start
```

Open **Expo Go** on your phone → tap **Scan QR code** → scan the QR in the terminal.

---

## Project file structure

```
growthpact/
├── app/
│   ├── _layout.jsx          ← Root layout (fonts, auth provider)
│   ├── index.jsx            ← Entry — redirects based on auth state
│   ├── (auth)/
│   │   ├── splash.jsx       ← Welcome screen
│   │   ├── signup.jsx       ← Create account (Firebase Auth)
│   │   ├── login.jsx        ← Sign in
│   │   └── onboarding.jsx   ← Pick growth areas
│   ├── (tabs)/
│   │   ├── home.jsx         ← Dashboard (streak, tasks, areas)
│   │   ├── journals.jsx     ← Journals hub
│   │   ├── community.jsx    ← Social feed
│   │   ├── progress.jsx     ← Goals tracker
│   │   └── profile.jsx      ← Profile + settings
│   ├── (journals)/
│   │   ├── bible.jsx        ← Bible Study Journal
│   │   ├── mental.jsx       ← Mental Growth Journal
│   │   ├── character.jsx    ← Character & Identity
│   │   ├── book.jsx         ← Book Reading Journal
│   │   ├── finance.jsx      ← Finance Tracker
│   │   └── sandbox.jsx      ← Personal Sandbox
│   └── (modals)/
│       └── _layout.jsx
├── components/
│   └── UI.js                ← Btn, Input, Card, Sheet, Empty, etc.
├── constants/
│   └── theme.js             ← Colors, fonts, responsive scaling
├── hooks/
│   └── useAuth.js           ← Auth context + Firebase listener
├── lib/
│   ├── firebase.js          ← Firebase init (FILL IN YOUR CONFIG)
│   └── firestore.js         ← All Firestore CRUD helpers
└── assets/                  ← App icons (replace with real ones)
```

---

## Firestore data structure

```
users/{userId}
  name, email, church, streak, lastActive, level, xp, areas

users/{userId}/tasks/{taskId}
  label, category, done, date, createdAt

users/{userId}/goals/{goalId}
  title, description, category, progress, target, createdAt

users/{userId}/journals/{entryId}
  type (bible|mental|character|sandbox)
  + type-specific fields

users/{userId}/books/{bookId}
  title, author, totalChapters, currentChapter, notes[], color

users/{userId}/expenses/{expenseId}
  amount, description, category, date

users/{userId}/settings/finance
  monthlyGoal, saved

posts/{postId}               ← Community posts (shared)
  text, category, authorId, authorName, likes[], comments[], createdAt
```

---

## Build APK (when you're ready)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to your Expo account (create one free at expo.dev)
eas login

# 3. Configure
eas build:configure

# 4. Build APK (Android)
eas build --platform android --profile preview
```

The APK download link appears in your terminal and at expo.dev when done (~10-15 min build time).

---

## Troubleshooting

| Error | Fix |
|---|---|
| `npm install` fails | Use `npm install --legacy-peer-deps` |
| App not loading on phone | Ensure phone & computer on same Wi-Fi |
| Firebase auth error | Double-check your `lib/firebase.js` config |
| "permission denied" Firestore | Make sure test mode is enabled in Firebase |
| Fonts not loading | Wait a few seconds — they load asynchronously |
| Metro bundler crash | Run `npx expo start --clear` |
