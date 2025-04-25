<<<<<<< HEAD

=======
# ConnectMind

ConnectMind is a platform focused on creating meaningful, intentional connections between people, supported by AI. It helps users form meaningful professional or personal relationships by thoughtfully matching based on values, goals, and preferences.

## Features

- Reflective onboarding process
- Values and preferences-based matching
- AI-powered compatibility analysis
- Secure authentication
- Real-time match updates
- Thoughtful connection suggestions

## Tech Stack

- Next.js
- TypeScript
- Firebase (Authentication, Firestore)
- OpenAI GPT-4
- Tailwind CSS
- Framer Motion

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/connectmind.git
   cd connectmind
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase and OpenAI API keys

4. Set up Firebase:

   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Add your Firebase configuration to `.env.local`

5. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/         # React components
├── lib/               # Library configurations
├── pages/             # Next.js pages
├── services/          # Business logic and API calls
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for their powerful language models
- Firebase for their excellent backend services
- The Next.js team for their amazing framework
>>>>>>> 735dae9 (signup forms)
