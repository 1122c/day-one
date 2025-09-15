# WeNetwork - Beta Testing

**WeNetwork** is a modern networking platform that connects people based on shared values, goals, and genuine interests. Our AI-powered matching system helps you build meaningful relationships that support your personal and professional growth.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/day-one.git
   cd day-one
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # OpenAI Configuration (for AI features)
   OPENAI_API_KEY=your_openai_api_key

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🌐 Alternative Testing Options

### Option 1: Live Demo (Easiest)

**Perfect for non-technical users and quick previews**



### Option 2: Docker (For Consistent Environment)

**Great for testing in isolated environments**

1. **Install Docker** - [Download here](https://www.docker.com/get-started)

2. **Run with Docker**

   ```bash
   # Build the Docker image
   docker build -t wenetwork .

   # Run the container
   docker run -p 3000:3000 --env-file .env.local wenetwork
   ```

3. **Access the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Option 3: Mobile Testing

**Test on your phone or tablet**

#### iOS (iPhone/iPad)

1. **Using Safari**:

   - Open Safari on your iOS device
   - Navigate to the live demo URL
   - Tap the share button
   - Select "Add to Home Screen"

2. **Using TestFlight** (if available):
   - Install TestFlight from the App Store
   - Join our beta program with the invitation code
   - Install the WeNetwork beta app

#### Android

1. **Using Chrome**:

   - Open Chrome on your Android device
   - Navigate to the live demo URL
   - Tap the menu (three dots)
   - Select "Add to Home screen"

2. **Using Google Play Console** (if available):
   - Join our internal testing track
   - Install the WeNetwork beta app

### Option 4: Cloud Development Environments

**No local setup required**

#### GitHub Codespaces

1. **Fork the repository** to your GitHub account
2. **Open in Codespaces**:
   - Click the "Code" button
   - Select "Codespaces" tab
   - Click "Create codespace on main"
3. **Set up environment variables** in the Codespace
4. **Run the development server**

#### Gitpod

1. **Open in Gitpod**: [https://gitpod.io/#https://github.com/your-username/day-one](https://gitpod.io/#https://github.com/your-username/day-one)
2. **Wait for the environment to load**
3. **Set up environment variables**
4. **Run the development server**

#### Replit

1. **Import from GitHub**:
   - Go to [Replit](https://replit.com)
   - Click "Import from GitHub"
   - Enter the repository URL
2. **Set up environment variables** in the Secrets tab
3. **Run the project**

### Option 5: Staging Environment

**Pre-production testing with real data**

- **Staging URL**: [https://wenetwork-staging.vercel.app](https://wenetwork-staging.vercel.app)
- **Features**: Full production-like environment
- **Data**: Persistent test data
- **Access**: Requires beta tester credentials

### Option 6: Browser Extensions & Tools

**Enhanced testing capabilities**

#### Chrome DevTools

- **Device Simulation**: Test responsive design
- **Network Throttling**: Test slow connections
- **Performance Analysis**: Monitor app performance

#### Browser Extensions

- **React Developer Tools**: Debug React components
- **Redux DevTools**: Inspect state management
- **Lighthouse**: Performance and accessibility testing

## 🔧 Firebase Setup

WeNetwork uses Firebase for authentication, database, and storage. You'll need to set up a Firebase project:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication

### 3. Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for beta testing
4. Select a location for your database

### 4. Get Configuration Keys

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" and select Web
4. Copy the configuration object
5. Add these values to your `.env.local` file

## 🎯 Features

### Core Functionality

- **User Authentication**: Secure sign-up and sign-in with Firebase
- **Profile Creation**: Comprehensive onboarding flow
- **AI-Powered Matching**: Smart algorithm for finding compatible connections
- **Real-time Chat**: Instant messaging with other users
- **Discovery**: Browse and discover potential connections
- **Notifications**: Real-time updates and alerts
- **Privacy Controls**: Advanced privacy settings and controls

### Technical Features

- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Firebase Integration**: Authentication, Firestore, and Storage
- **OpenAI Integration**: AI-powered conversation suggestions
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: WebSocket connections for live features

## 📱 Pages & Navigation

- **Landing Page** (`/`): Welcome page with feature overview
- **Authentication** (`/auth/signin`, `/auth/signup`): User login and registration
- **Onboarding** (`/onboarding`): Profile setup and preferences
- **Discover** (`/discover`): Browse potential connections
- **Matches** (`/matches`): View your current matches
- **Messages** (`/messages`): Chat with your connections
- **Notifications** (`/notifications`): View alerts and updates
- **Settings** (`/settings`): Account and privacy settings

## 🧪 Testing

Run the test suite to ensure everything is working correctly:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to set up the same environment variables in your production environment:

- Firebase configuration
- OpenAI API key
- NextAuth secret

## 🐛 Troubleshooting

### Common Issues

**1. "Firebase: Error (auth/invalid-api-key)"**

- Ensure your Firebase API key is correct in `.env.local`
- Check that the key is prefixed with `NEXT_PUBLIC_`

**2. "Module not found" errors**

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**3. "Firestore permission denied"**

- Check your Firestore security rules
- Ensure authentication is properly configured

**4. Port already in use**

- Kill the process using port 3000: `lsof -ti:3000 | xargs kill -9`
- Or use a different port: `npm run dev -- -p 3001`

### Getting Help

If you encounter issues not covered here:

1. Check the [Issues](https://github.com/your-username/day-one/issues) page
2. Create a new issue with:
   - Your operating system
   - Node.js version (`node --version`)
   - Error messages (if any)
   - Steps to reproduce the issue

## 📋 Beta Testing Guidelines

### Testing Scenarios

#### Scenario 1: New User Journey

1. **Landing Page Experience**

   - Review the welcome message and features
   - Test the call-to-action buttons
   - Check mobile responsiveness

2. **Registration Process**

   - Create a new account with email/password
   - Verify email confirmation (if enabled)
   - Test password strength requirements

3. **Onboarding Flow**
   - Complete profile setup step-by-step
   - Test form validation and error handling
   - Upload profile pictures and test image processing

#### Scenario 2: Returning User Experience

1. **Login Process**

   - Sign in with existing credentials
   - Test "Remember me" functionality
   - Test password reset flow

2. **Dashboard Navigation**
   - Explore all main sections
   - Test responsive navigation
   - Check notification indicators

#### Scenario 3: Social Features

1. **Discovery & Matching**

   - Browse potential connections
   - Test filtering and search options
   - Send and respond to connection requests

2. **Messaging System**

   - Start new conversations
   - Test real-time message delivery
   - Test file/image sharing (if available)

3. **Profile Management**
   - Update personal information
   - Modify privacy settings
   - Test profile visibility options

#### Scenario 4: Edge Cases & Error Handling

1. **Network Issues**

   - Test with slow internet connection
   - Test offline/online transitions
   - Test with poor network conditions

2. **Input Validation**

   - Test with invalid email formats
   - Test with extremely long text inputs
   - Test with special characters

3. **Browser Compatibility**
   - Test on different browsers (Chrome, Firefox, Safari, Edge)
   - Test on different screen sizes
   - Test on mobile devices

### What to Test

1. **User Registration & Login**

   - Create a new account
   - Sign in with existing account
   - Password reset functionality

2. **Profile Setup**

   - Complete onboarding flow
   - Update profile information
   - Upload profile pictures

3. **Matching System**

   - Browse potential connections
   - Test matching algorithm
   - Send connection requests

4. **Messaging**

   - Start conversations
   - Send and receive messages
   - Test real-time updates

5. **Settings & Privacy**
   - Update account settings
   - Modify privacy preferences
   - Test notification settings

### Reporting Issues

When reporting bugs, please include:

- **Device/Browser**: What device and browser you're using
- **Steps to Reproduce**: Detailed steps to recreate the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable

### Feedback

We welcome feedback on:

- User experience and interface design
- Feature suggestions
- Performance issues
- Overall app functionality

## 🔒 Privacy & Security

- All user data is encrypted and stored securely
- We use industry-standard authentication methods
- Your personal information is never shared without consent
- You can delete your account and data at any time

## 📞 Support

For beta testing support:

## 📄 License

This project is currently in private beta. All rights reserved.

---

**Thank you for participating in our beta test!** Your feedback is invaluable in helping us build the best networking platform possible.

## 🏗️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ai/             # AI-related components
│   ├── chat/           # Chat functionality
│   ├── connections/    # Connection management
│   ├── discovery/      # Discovery features
│   ├── matches/        # Matching system
│   ├── notifications/  # Notification system
│   ├── onboarding/     # User onboarding
│   ├── privacy/        # Privacy controls
│   └── settings/       # Settings pages
├── contexts/           # React contexts
├── lib/               # Utility libraries
├── pages/             # Next.js pages
├── services/          # Business logic services
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

### Key Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: OpenAI API
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel (recommended)

### Contributing

This is a private beta repository. If you're a beta tester and want to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Happy Testing! 🎉**
