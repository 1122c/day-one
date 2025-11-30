# WeNetwork - Beta Testing Guide

**WeNetwork** is a modern networking platform that connects people based on shared values, goals, and genuine interests. Our AI-powered matching system helps you build meaningful relationships that support your personal and professional growth.

---

## 📋 Table of Contents

1. [Getting Started - What You Need](#getting-started---what-you-need)
2. [Complete Setup Instructions](#complete-setup-instructions)
3. [Firebase Setup (Required)](#firebase-setup-required)
4. [OpenAI Setup (Optional)](#openai-setup-optional)
5. [Running the Application](#running-the-application)
6. [Beta Testing Responsibilities](#beta-testing-responsibilities)
7. [What to Test](#what-to-test)
8. [Reporting Issues](#reporting-issues)
9. [Maintenance & Updates](#maintenance--updates)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Getting Started - What You Need

This guide is written for people **without a technical background**. We'll walk through every step together.

### What This App Needs to Run

Think of running this app like setting up a new phone - you need to:
1. **Install the basic software** (like installing an operating system)
2. **Download the app files** (like downloading an app from the App Store)
3. **Connect to services** (like connecting to WiFi or your email account)
4. **Start using it** (like opening the app)

### Your Responsibilities as Beta Tester/Maintainer

As the person running beta testing, you will be responsible for:

- ✅ **Setting up and running the application** locally or on a server
- ✅ **Managing user testing** - recruiting testers, coordinating test sessions
- ✅ **Monitoring the application** - checking that it's running properly
- ✅ **Collecting and reporting feedback** - gathering bug reports and user feedback
- ✅ **Basic maintenance** - keeping the app updated, restarting if it crashes
- ✅ **Backend services** - managing Firebase account, OpenAI account, and their costs

**You are NOT responsible for:**
- ❌ Writing or modifying code
- ❌ Fixing technical bugs (report them instead)
- ❌ Making feature changes
- ❌ Handling complex technical issues beyond basic troubleshooting

---

## 🛠️ Complete Setup Instructions

### Step 1: Install Required Software

You need to install three things on your computer. Don't worry - they're all free!

#### A. Install Node.js (Required)

**What it is:** Node.js is the engine that runs this web application. It's like the operating system for web apps.

**How to install:**

1. **Go to the Node.js website**: [https://nodejs.org/](https://nodejs.org/)
2. **Click the big green button** that says "Download Node.js" (it will show something like "v20.x.x LTS")
   - **LTS** means "Long Term Support" - this is the stable version you want
3. **Download the installer** for your operating system:
   - **Windows**: Download the `.msi` file
   - **Mac**: Download the `.pkg` file
   - **Linux**: Follow the instructions for your specific Linux distribution
4. **Run the installer**:
   - **Windows**: Double-click the `.msi` file and follow the installation wizard (click "Next" through all the prompts)
   - **Mac**: Double-click the `.pkg` file and follow the installation prompts
5. **Verify installation**:
   - **Windows**: Open "Command Prompt" (search for "cmd" in the Start menu)
   - **Mac/Linux**: Open "Terminal" (search for "Terminal" in Applications or press `Cmd+Space` and type "Terminal")
   - Type this command and press Enter:
     ```bash
     node --version
     ```
   - You should see a version number like `v20.11.0` or similar
   - Also type this command:
     ```bash
     npm --version
     ```
   - You should see a version number like `10.2.4` or similar
   - If you see version numbers, you're all set! ✅

**Troubleshooting:**
- If you get "command not found" or "node is not recognized", try restarting your computer after installation
- Make sure you downloaded the LTS (Long Term Support) version, not the "Current" version

#### B. Install Git (Required)

**What it is:** Git is a tool that lets you download and update the application code.

**How to install:**

1. **Go to the Git website**: [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. **The website should automatically detect your operating system** and show you the right download
3. **Click "Download"** for your operating system
4. **Run the installer**:
   - **Windows**: Double-click the installer and click "Next" through all prompts (the default options are fine)
   - **Mac**: Double-click the `.dmg` file, then double-click the `.pkg` file inside, and follow the prompts
5. **Verify installation**:
   - Open Terminal (Mac/Linux) or Command Prompt (Windows)
   - Type this command and press Enter:
     ```bash
     git --version
     ```
   - You should see something like `git version 2.42.0` or similar ✅

#### C. Install a Code Editor (Recommended)

**What it is:** You'll need a text editor to create and edit a configuration file. Any text editor works, but we recommend VS Code.

**VS Code (Recommended):**
1. Go to [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Click "Download" for your operating system
3. Run the installer and follow the prompts

**Alternative - Simple Text Editors:**
- **Windows**: Notepad works fine (it comes with Windows)
- **Mac**: TextEdit works fine (it comes with Mac)
- **Linux**: Gedit, Nano, or any text editor works

---

### Step 2: Download the Application Code

**What you're doing:** Getting the application files onto your computer.

#### Option A: Using Git (Recommended)

1. **Decide where to put the project**
   - **Windows**: Create a folder like `C:\Users\YourName\Projects` (or use your Documents folder)
   - **Mac/Linux**: Create a folder in your home directory like `~/Projects` or use your Documents folder

2. **Open Terminal/Command Prompt** and navigate to that folder:
   - **Windows**:
     ```bash
     cd C:\Users\YourName\Documents
     ```
   - **Mac/Linux**:
     ```bash
     cd ~/Documents
     ```

3. **Clone the repository** (replace `your-username` with the actual GitHub username):
   ```bash
   git clone https://github.com/your-username/day-one.git
   ```

4. **Enter the project folder**:
   ```bash
   cd day-one
   ```

#### Option B: Download as ZIP (If Git doesn't work)

1. Go to the GitHub repository page
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to a folder on your computer
5. Open Terminal/Command Prompt and navigate to the extracted folder

---

### Step 3: Install Application Dependencies

**What you're doing:** Installing all the extra code libraries that the application needs to work. This is like installing all the apps and plugins needed for your phone to work properly.

1. **Make sure you're in the project folder** (you should have run `cd day-one` in the previous step)

2. **Run the installation command**:
   ```bash
   npm install
   ```

3. **Wait for it to finish** - this might take 2-5 minutes. You'll see lots of text scrolling by. This is normal! You'll know it's done when you see your command prompt again (no more scrolling text).

   **What success looks like:**
   - You should see something like "added 500 packages" at the end
   - No red error messages
   - You're back to the command prompt

   **What failure looks like:**
   - Red error messages
   - "npm ERR!" messages
   - Installation stops early

**Troubleshooting:**
- If you see errors about permissions, you might need administrator/root access
- If you see network errors, check your internet connection
- Sometimes running `npm install` twice fixes weird issues

---

### Step 4: Create Environment Variables File

**What you're doing:** Creating a secret configuration file that stores your API keys and passwords. This file tells the app how to connect to Firebase and OpenAI.

1. **Navigate to the project folder** in Terminal/Command Prompt (if you're not already there):
   ```bash
   cd day-one
   ```

2. **Create the configuration file**:
   - **Windows (Command Prompt)**:
     ```bash
     type nul > .env.local
     ```
   - **Mac/Linux**:
     ```bash
     touch .env.local
     ```
   - **Alternative for all systems:** You can also create this file using a text editor (see next step)

3. **Open the `.env.local` file in your text editor**:
   - **VS Code**: `code .env.local`
   - **Windows Notepad**: `notepad .env.local`
   - **Mac TextEdit**: `open -a TextEdit .env.local`
   - Or just navigate to the folder in Finder/File Explorer and create a new file named `.env.local`

4. **Copy and paste this template** into the file (you'll fill in the actual values later):
   ```env
   # Firebase Configuration (Required)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

   # OpenAI Configuration (Optional - app works without this but AI features will be disabled)
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Save the file** (keep it open - you'll come back to fill in the values after setting up Firebase)

**Important Notes:**
- The file must be named exactly `.env.local` (starts with a dot, no extension)
- Make sure there are no spaces around the `=` sign
- Don't put quotes around the values (unless the value itself contains special characters)
- This file contains secrets - never share it or commit it to GitHub (it should already be in .gitignore)

---

## 🔧 Firebase Setup (Required)

**What Firebase is:** Firebase is Google's service that handles user accounts (sign up, sign in, password reset) and stores all the app's data (user profiles, messages, matches, etc.). You MUST set this up - the app won't work without it.

**Why it's required:** Without Firebase, users can't create accounts or save any information. Everything would be lost when they refresh the page.

**Cost:** Firebase has a free tier (Spark Plan) that should be sufficient for beta testing. You only pay if you exceed the free limits.

### Firebase Setup - Step by Step

#### Part 1: Create a Firebase Account and Project

1. **Go to Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Sign in with your Google account** (or create a Google account if you don't have one)

3. **Click "Create a project"** (or "Add project" if you have other projects)

4. **Enter a project name**:
   - Use something descriptive like "WeNetwork Beta" or "WeNetwork Testing"
   - Click "Continue"

5. **Google Analytics (Optional)**:
   - You can enable Google Analytics if you want to track usage
   - For beta testing, you can disable it (toggle it off)
   - Click "Continue" or "Create project"

6. **Wait for the project to be created** - this takes about 30 seconds
   - Click "Continue" when it's done

**You now have a Firebase project! ✅**

#### Part 2: Enable Authentication

**What this does:** Allows users to create accounts, sign in, and reset passwords.

1. **In your Firebase project**, look at the left sidebar menu
2. **Click on "Authentication"** (it has a key icon 🔑)
3. **Click "Get started"** button
4. **Click on the "Sign-in method" tab** at the top
5. **Find "Email/Password"** in the list of sign-in providers
6. **Click on "Email/Password"**
7. **Toggle the "Enable" switch** to ON (it should turn blue)
8. **Click "Save"**
9. **Email/Password authentication is now enabled! ✅**

#### Part 3: Create Firestore Database

**What this does:** Creates a database to store all app data (user profiles, messages, matches, etc.).

1. **In your Firebase project**, look at the left sidebar menu
2. **Click on "Firestore Database"** (it has a database icon 🗄️)
3. **Click "Create database"** button
4. **Choose "Start in test mode"**:
   - This means anyone with the database URL can read/write for 30 days
   - This is perfect for beta testing
   - Click "Next"
5. **Select a location** for your database:
   - Choose a location close to where most of your testers are
   - If unsure, choose "us-central" (United States)
   - Click "Enable"
6. **Wait for the database to be created** - this takes about 30 seconds

**Your database is now created! ✅**

**Important:** After 30 days, Firebase will email you about the test mode expiration. You'll need to either:
- Set up proper security rules (requires technical knowledge)
- Extend test mode (if Firebase allows it)
- This is something you'll need to handle or get help with

#### Part 4: Get Your Firebase Configuration Keys

**What you're doing:** Getting the secret codes that let your app connect to your Firebase project.

1. **In your Firebase project**, click the **gear icon ⚙️** next to "Project Overview" in the left sidebar
2. **Click "Project settings"** from the dropdown menu
3. **Scroll down** to the section labeled "Your apps" (it might say "SDK setup and configuration")
4. **If you see web apps already listed**: Click on one to see its config
5. **If you don't see any web apps** (or want to create a new one):
   - Click the **web icon `</>`** (it says "Add app" or looks like `</>`)
   - Give it a nickname like "WeNetwork Web" or "Beta Testing"
   - **Do NOT check the box for Firebase Hosting** (you don't need it)
   - Click "Register app"
6. **You'll see a code block** that looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyAbc123def456ghi789jkl",
     authDomain: "wenetwork-beta.firebaseapp.com",
     projectId: "wenetwork-beta",
     storageBucket: "wenetwork-beta.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

7. **Copy each value** from this code block to your `.env.local` file:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

8. **Update your `.env.local` file** - it should look like this (with your actual values):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbc123def456ghi789jkl
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wenetwork-beta.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=wenetwork-beta
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wenetwork-beta.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

9. **Save the `.env.local` file**

**Important:**
- Remove the quotes (`"`) from around the values
- Make sure there are no spaces before or after the `=` sign
- Each value should be on its own line

**Your Firebase setup is complete! ✅**

---

## 🤖 OpenAI Setup (Optional)

**What OpenAI is:** OpenAI provides AI features like conversation suggestions and smart matching insights.

**Is it required?** No, the app will work without it, but AI features will be disabled.

**Cost:** OpenAI charges based on usage. For beta testing with a few users, costs should be minimal (likely under $5-10/month).

### OpenAI Setup - Step by Step

1. **Go to OpenAI's website**: [https://platform.openai.com/](https://platform.openai.com/)

2. **Sign up or log in** with your email

3. **Add a payment method** (OpenAI requires this even for the free tier):
   - Click on your profile icon (top right)
   - Go to "Billing" or "Settings" → "Billing"
   - Add a credit card or payment method
   - **Set usage limits** to prevent unexpected charges:
     - Go to "Billing" → "Usage limits"
     - Set a monthly spending limit (e.g., $10/month) for peace of mind

4. **Create an API key**:
   - Click on your profile icon (top right)
   - Go to "API keys" or "View API keys"
   - Click "Create new secret key"
   - Give it a name like "WeNetwork Beta"
   - **Copy the key immediately** - you won't be able to see it again!
   - Click "Create secret key"

5. **Add the key to your `.env.local` file**:
   ```env
   OPENAI_API_KEY=sk-...your-actual-key-here...
   ```

6. **Save the `.env.local` file**

**Important Security Notes:**
- Never share your API key with anyone
- Never commit it to GitHub (it should be in .gitignore)
- If you accidentally share it, delete it and create a new one immediately
- Monitor your usage in the OpenAI dashboard to avoid unexpected charges

---

## 🚀 Running the Application

**What you're doing:** Starting the web server so you can access the app in your browser.

### Starting the Development Server

1. **Open Terminal/Command Prompt**

2. **Navigate to the project folder**:
   ```bash
   cd day-one
   ```
   (Or wherever you saved the project)

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Wait for it to start** - you should see something like:
   ```
   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - ready started server on 0.0.0.0:3000
   ```

5. **Open your web browser** and go to: [http://localhost:3000](http://localhost:3000)

6. **You should see the WeNetwork app!** 🎉

**What "localhost:3000" means:**
- `localhost` means "this computer"
- `3000` is the port number (like a door number for the web server)
- Only people on your computer can access it at this address

### Keeping the Server Running

- **The server must stay running** for the app to work
- **Keep the Terminal/Command Prompt window open** - if you close it, the app stops working
- **To stop the server**: Press `Ctrl+C` (or `Cmd+C` on Mac) in the Terminal window
- **To restart**: Run `npm run dev` again

### Making the App Accessible to Others (Advanced)

If you want other people to test the app on their devices:

**Option 1: Same WiFi Network (Easiest)**
1. Find your computer's local IP address:
   - **Mac/Linux**: Run `ifconfig` or `ip addr` and look for your IP (usually starts with 192.168.x.x)
   - **Windows**: Run `ipconfig` and look for "IPv4 Address"
2. Have testers visit: `http://YOUR_IP_ADDRESS:3000` (replace with your actual IP)
3. Make sure your firewall allows connections on port 3000

**Option 2: Deploy to a Cloud Service (Recommended for Beta Testing)**
- Deploy to Vercel, Netlify, or Heroku
- This makes the app accessible to anyone with the URL
- See the "Deployment" section for instructions

---

## 📋 Beta Testing Responsibilities

As the person responsible for beta testing, here's what you need to handle:

### Daily/Weekly Tasks

1. **Monitor Application Status**
   - Check that the app is running (if running locally, make sure the server is up)
   - If deployed, check that the deployed version is accessible
   - Look for error messages in the browser console or server logs

2. **Monitor Firebase Console**
   - Check [Firebase Console](https://console.firebase.google.com/) regularly
   - Monitor usage (make sure you're not exceeding free tier limits)
   - Check for any security alerts or warnings
   - Monitor Firestore Database usage

3. **Monitor OpenAI Usage** (if using OpenAI)
   - Check [OpenAI Dashboard](https://platform.openai.com/) for usage and costs
   - Review API usage to ensure it's reasonable
   - Check that spending limits are set and working

4. **Coordinate User Testing**
   - Recruit beta testers
   - Schedule testing sessions
   - Provide testers with access (URL, login credentials if needed)
   - Communicate testing objectives and feedback processes

### Weekly/Monthly Tasks

1. **Collect and Organize Feedback**
   - Gather bug reports from testers
   - Compile user feedback and feature requests
   - Document common issues or patterns
   - Create summary reports

2. **Update Dependencies** (if comfortable)
   - Periodically run `npm update` to get security patches
   - Test after updates to ensure nothing breaks
   - If unsure, skip this and report any security concerns to the developer

3. **Backup Important Data**
   - Export user data from Firebase if needed
   - Keep copies of configuration files
   - Document any custom settings

4. **Review Costs**
   - Check Firebase billing (should be free for beta testing)
   - Check OpenAI billing (if using)
   - Report any unexpected charges

### When Things Break

1. **Check the Troubleshooting section** below
2. **Try basic fixes**:
   - Restart the development server
   - Clear browser cache
   - Check that all services are running
3. **Document the issue**:
   - Take screenshots
   - Note error messages
   - Record steps to reproduce
4. **Report to the developer** (see "Reporting Issues" section)

---

## 🧪 What to Test

### Core User Flows to Test

#### 1. User Registration & Login
- [ ] **Sign Up**: Create a new account with email and password
- [ ] **Email Validation**: Try invalid email formats (should show error)
- [ ] **Password Strength**: Try weak passwords (should show requirements)
- [ ] **Sign In**: Log in with an existing account
- [ ] **Password Reset**: Request a password reset email
- [ ] **Stay Logged In**: Close browser and reopen - should still be logged in

#### 2. Onboarding Flow
- [ ] **Complete Profile**: Go through all onboarding steps
- [ ] **Skip Steps**: Try skipping optional steps
- [ ] **Form Validation**: Try submitting incomplete forms
- [ ] **Upload Photos**: Upload profile pictures
- [ ] **Save Progress**: Leave and come back - should save progress

#### 3. Discovery & Matching
- [ ] **Browse Profiles**: View suggested matches
- [ ] **Filter/Search**: Use filters to find specific types of users
- [ ] **Send Connection Requests**: Request to connect with other users
- [ ] **Accept/Decline**: Respond to incoming connection requests
- [ ] **View Match Details**: Click on matches to see full profiles

#### 4. Messaging
- [ ] **Start Conversation**: Send first message to a match
- [ ] **Send Messages**: Send text messages
- [ ] **Receive Messages**: Have another user send you messages
- [ ] **Real-time Updates**: Messages should appear immediately
- [ ] **Message History**: Previous messages should be visible

#### 5. Profile Management
- [ ] **Edit Profile**: Update personal information
- [ ] **Change Photos**: Add/remove profile photos
- [ ] **Privacy Settings**: Change visibility and privacy options
- [ ] **Notification Settings**: Enable/disable different notifications

#### 6. Settings & Preferences
- [ ] **Account Settings**: Update email, password
- [ ] **Privacy Controls**: Test different privacy levels
- [ ] **Notification Preferences**: Toggle different notification types
- [ ] **Delete Account**: Test account deletion (create a test account first!)

### Technical Things to Check

- [ ] **Page Load Speed**: Pages should load within 2-3 seconds
- [ ] **Mobile Responsiveness**: Test on phone/tablet - everything should work
- [ ] **Browser Compatibility**: Test in Chrome, Firefox, Safari, Edge
- [ ] **Error Handling**: Try breaking things - app should show helpful error messages
- [ ] **Offline Behavior**: What happens with no internet? (some features should work)
- [ ] **Concurrent Users**: Have multiple people use it at the same time

### Things That Should NOT Happen

❌ **Users should NOT see:**
- Blank white screens
- "Error 500" or similar server errors
- Infinite loading spinners
- Data loss (information disappearing)
- Security errors or warnings
- Confusing error messages

❌ **The app should NOT:**
- Crash when clicking buttons
- Lose data when refreshing the page
- Allow unauthorized access to other users' data
- Show other users' private information

---

## 📝 Reporting Issues

When you or your testers find problems, report them clearly so they can be fixed quickly.

### Issue Report Template

Create an issue report with this information:

**1. Title**
- Brief description: "Login button doesn't work" or "Profile photo won't upload"

**2. Device & Browser**
- Device: Windows PC, Mac, iPhone, Android, etc.
- Browser: Chrome 120, Safari 17, Firefox 121, etc.
- Screen size: Desktop (1920x1080), Mobile (iPhone 12), Tablet (iPad), etc.

**3. Steps to Reproduce**
- Step-by-step instructions to make the bug happen:
  1. Go to the sign-in page
  2. Enter email "test@example.com"
  3. Enter password "test123"
  4. Click "Sign In" button
  5. [What happens next]

**4. Expected Behavior**
- What SHOULD happen: "User should be logged in and redirected to dashboard"

**5. Actual Behavior**
- What ACTUALLY happens: "Nothing happens, button doesn't respond"

**6. Screenshots/Videos**
- Take screenshots of the problem
- Record a short video if possible
- Include any error messages shown

**7. Console Errors** (if you can check)
- Open browser Developer Tools (F12 or Right-click → Inspect)
- Go to "Console" tab
- Copy any red error messages
- Include these in your report

**8. Frequency**
- Does this happen: Every time? Sometimes? Only on certain devices?

**9. Workaround**
- Is there a way to avoid the issue or work around it?

### Example Issue Report

```
Title: Cannot upload profile photo on mobile

Device & Browser: iPhone 13, Safari 17.2, iOS 17.2

Steps to Reproduce:
1. Log in to the app
2. Go to Profile settings
3. Click "Upload Photo"
4. Select a photo from camera roll
5. Click "Save"

Expected Behavior: Photo should upload and appear in profile

Actual Behavior: Photo selector opens, but after selecting photo, nothing happens. No error message shown.

Screenshots: [attached]

Console Errors: 
- "TypeError: Cannot read property 'files' of undefined"
- Error at ProfilePhotoUpload.tsx:45

Frequency: Happens every time on iPhone. Works fine on desktop Chrome.

Workaround: None - cannot upload photos on mobile.
```

### Where to Report Issues

1. **GitHub Issues** (if you have access):
   - Go to the repository's Issues page
   - Click "New Issue"
   - Fill out the template above

2. **Email/Document** (if no GitHub access):
   - Create a shared document (Google Docs, Notion, etc.)
   - Add issues as they're reported
   - Share with the developer regularly

3. **Issue Tracking Tool**:
   - Use tools like Trello, Asana, or Jira if provided

---

## 🔄 Maintenance & Updates

### Keeping the App Updated

**When to update:**
- When the developer releases new features or bug fixes
- When security vulnerabilities are discovered
- Periodically (monthly) to get latest improvements

**How to update:**

1. **Save your current `.env.local` file** - make a backup copy

2. **Pull the latest code**:
   ```bash
   cd day-one
   git pull origin main
   ```
   (Or download the latest ZIP and replace files if not using Git)

3. **Update dependencies**:
   ```bash
   npm install
   ```

4. **Test the app** to make sure everything still works:
   ```bash
   npm run dev
   ```

5. **Check your `.env.local` file** - make sure it still has all your API keys

### Monitoring Costs

**Firebase Costs:**
- Check [Firebase Console](https://console.firebase.google.com/) → Billing
- Free tier includes:
  - 50K reads/day
  - 20K writes/day
  - 1GB storage
  - 10GB/month bandwidth
- For beta testing, you should stay well within free tier
- Monitor usage to avoid surprises

**OpenAI Costs:**
- Check [OpenAI Dashboard](https://platform.openai.com/) → Usage
- Set spending limits in Billing settings
- Costs are typically very low for beta testing ($1-10/month)
- If costs spike unexpectedly, disable OpenAI features temporarily

### Regular Maintenance Checklist

**Daily:**
- [ ] Verify app is running (if running locally)
- [ ] Check for any error notifications

**Weekly:**
- [ ] Review Firebase usage (stay within free tier)
- [ ] Review OpenAI usage and costs (if applicable)
- [ ] Check for any security alerts in Firebase
- [ ] Test that core features still work

**Monthly:**
- [ ] Review and organize bug reports
- [ ] Check for app updates
- [ ] Backup important configuration files
- [ ] Review costs and usage trends
- [ ] Update this checklist based on what you learn

### Handling Service Disruptions

**If Firebase is down:**
- Check [Firebase Status](https://status.firebase.google.com/)
- Wait for Google to resolve it
- Notify testers that the app is temporarily unavailable

**If OpenAI API is down:**
- Check [OpenAI Status](https://status.openai.com/)
- The app should still work, just without AI features
- Wait for OpenAI to resolve it

**If your server crashes:**
- Restart the development server: `npm run dev`
- If it keeps crashing, check the error messages
- Report persistent issues to the developer

---

## 🐛 Troubleshooting

### Common Problems and Solutions

#### Problem 1: "An unexpected error occurs" when trying to sign in

**Cause:** Firebase is not properly configured

**Solution:**
1. Check that your `.env.local` file exists in the project root folder
2. Verify all 6 Firebase environment variables are set:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
3. Make sure there are no typos or extra spaces
4. Restart your development server (stop with `Ctrl+C`, then run `npm run dev` again)
5. Check the browser console (F12) for specific error messages
6. Verify in Firebase Console that Email/Password authentication is enabled

#### Problem 2: "Firebase: Error (auth/invalid-api-key)"

**Solution:**
- Double-check your Firebase API key in `.env.local`
- Make sure the key starts with `NEXT_PUBLIC_`
- Verify you copied the key from the correct Firebase project
- Go to Firebase Console → Project Settings and copy the key again

#### Problem 3: "Firebase: Error (auth/operation-not-allowed)"

**Solution:**
- Go to Firebase Console → Authentication → Sign-in method
- Find "Email/Password" and click on it
- Make sure it's enabled (toggle should be ON)
- Click "Save"

#### Problem 4: "Module not found" or "Cannot find module" errors

**Solution:**
1. Delete the `node_modules` folder
2. Delete `package-lock.json` file (if it exists)
3. Run `npm install` again
4. Wait for installation to complete
5. Try running `npm run dev` again

#### Problem 5: Port 3000 is already in use

**Solution - Option 1 (Kill the process):**
- **Mac/Linux:**
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```
- **Windows:**
  ```bash
  netstat -ano | findstr :3000
  taskkill /PID <PID_NUMBER> /F
  ```
  (Replace `<PID_NUMBER>` with the number from the previous command)

**Solution - Option 2 (Use a different port):**
- Run the app on a different port:
  ```bash
  npm run dev -- -p 3001
  ```
- Then access it at `http://localhost:3001`

#### Problem 6: "Firestore permission denied"

**Solution:**
- Check that Firestore Database is created and running
- Verify you started Firestore in "test mode" (for development)
- Check that authentication is properly configured
- Review Firestore security rules in Firebase Console
- Make sure your Firebase config keys are correct

#### Problem 7: App works locally but not for other users

**Cause:** `localhost` only works on your computer

**Solution:**
- Deploy the app to a cloud service (Vercel, Netlify, etc.)
- Or use your local IP address if users are on the same WiFi
- See "Making the App Accessible to Others" section above

#### Problem 8: Changes don't appear after updating code

**Solution:**
1. Stop the development server (`Ctrl+C`)
2. Clear your browser cache (Ctrl+Shift+Delete, or Cmd+Shift+Delete on Mac)
3. Restart the development server (`npm run dev`)
4. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

#### Problem 9: "npm install" fails with errors

**Solution:**
- Make sure you have Node.js version 18 or higher (`node --version`)
- Check your internet connection
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- If on Windows, try running Command Prompt as Administrator
- Sometimes running `npm install` twice fixes network-related issues

#### Problem 10: Can't create `.env.local` file

**Solution:**
- **Windows:** Make sure "Show file extensions" is enabled in File Explorer
- Create the file using a text editor and save it as `.env.local` (including the dot at the start)
- Or use Command Prompt: `type nul > .env.local`
- **Mac/Linux:** Use Terminal: `touch .env.local`
- Make sure you're in the project root folder (the same folder as `package.json`)

### Getting More Help

If you've tried the troubleshooting steps and nothing works:

1. **Check the browser console** for errors:
   - Press F12 (or Right-click → Inspect)
   - Go to "Console" tab
   - Look for red error messages
   - Take a screenshot

2. **Check the server logs**:
   - Look at your Terminal/Command Prompt where `npm run dev` is running
   - Look for error messages in red
   - Copy the error text

3. **Document everything**:
   - What you were trying to do
   - What error messages you saw
   - What troubleshooting steps you tried
   - Your operating system and Node.js version

4. **Report the issue** (see "Reporting Issues" section above)

---

## 🌐 Deployment Options (For Making App Publicly Accessible)

If you want to make the app accessible to beta testers who aren't on your local network, you need to deploy it. Here are the easiest options:

### Option 1: Vercel (Recommended - Easiest)

**What it is:** Vercel is a platform specifically designed for Next.js apps. It's free for personal projects.

**Steps:**
1. Create account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`
3. In your project folder, run: `vercel`
4. Follow the prompts (use default settings)
5. Add your environment variables in Vercel dashboard
6. Deploy: `vercel --prod`

**Pros:** Free, easy, automatic HTTPS, works great with Next.js
**Cons:** None really for beta testing

### Option 2: Netlify

**Steps:**
1. Create account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository (or drag and drop your project folder)
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables in Netlify dashboard
6. Deploy

**Pros:** Free, easy, good documentation
**Cons:** Slightly more setup than Vercel for Next.js

### Option 3: Railway / Render

**Steps:**
1. Create account at [railway.app](https://railway.app) or [render.com](https://render.com)
2. Connect your GitHub repository
3. Add environment variables
4. Deploy

**Pros:** Free tiers available, good for full-stack apps
**Cons:** May require more configuration

---

## 📱 Mobile Testing

### Testing on Your Phone

**If running locally:**
1. Make sure your phone is on the same WiFi network as your computer
2. Find your computer's local IP address (see "Making the App Accessible to Others" above)
3. On your phone's browser, go to: `http://YOUR_IP_ADDRESS:3000`

**If deployed:**
1. Just visit the deployed URL on your phone's browser
2. You can bookmark it or "Add to Home Screen" for app-like experience

### Testing on Multiple Devices

- Test on different phone models (iPhone, Android)
- Test on different screen sizes (phone, tablet, desktop)
- Test on different browsers (Safari, Chrome, Firefox)
- Test in both portrait and landscape orientations

---

## 🔒 Security & Privacy Notes

### Protecting API Keys

- **Never share your `.env.local` file**
- **Never commit it to GitHub** (it should be in `.gitignore`)
- **Don't post screenshots** that show your API keys
- **If a key is compromised**, delete it and create a new one immediately

### User Data

- All user data is stored in Firebase
- You can view data in Firebase Console → Firestore Database
- **Never share user data** with unauthorized people
- **Respect user privacy** - only access data necessary for beta testing

### Firebase Security

- After 30 days, Firebase test mode expires
- You'll need to set up proper security rules (requires technical knowledge)
- Until then, anyone with the database URL can access data
- For beta testing, this is usually acceptable
- For production, proper security rules are essential

---

## 📞 Support & Resources

### Useful Links

- **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
- **OpenAI Dashboard**: [https://platform.openai.com/](https://platform.openai.com/)

### Getting Help

1. **Check this README** - many common issues are covered
2. **Check the Troubleshooting section** above
3. **Search error messages** on Google - often others have had the same issue
4. **Report issues** to the developer (see "Reporting Issues" section)

---

## 📄 Final Notes

### What You've Accomplished

By following this guide, you should now have:
- ✅ All required software installed
- ✅ The application downloaded and set up
- ✅ Firebase configured and connected
- ✅ OpenAI configured (optional)
- ✅ The app running on your computer
- ✅ An understanding of what to test and how to report issues

### Remember

- **The app must stay running** for it to work (keep Terminal open)
- **Back up your `.env.local` file** - you'll need it if you reinstall
- **Monitor costs** regularly to avoid surprises
- **Document issues** clearly when reporting bugs
- **Test regularly** to catch problems early

### Next Steps

1. **Test the app yourself** - go through all the features
2. **Recruit beta testers** - get friends, family, or colleagues to try it
3. **Set up a feedback system** - Google Form, Notion, or GitHub Issues
4. **Schedule regular check-ins** - weekly reviews of feedback and issues
5. **Monitor the app** - check daily that everything is working

---

**Thank you for taking on beta testing! Your work is invaluable in making WeNetwork great.** 🎉

**Good luck, and happy testing!** 🚀
