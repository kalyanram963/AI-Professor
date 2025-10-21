📚 AI Professor: Your Smart Learning Companion
✨ Introduction
AI Professor is an innovative web application designed to revolutionize your learning experience. Powered by Google's Gemini AI, it acts as your personal tutor, offering a suite of intelligent tools to help you study smarter, not harder. From instant doubt solving to personalized quizzes and progress tracking, AI Professor is here to guide you on your educational journey.

🚀 Features
Dive into a rich learning environment with these powerful features:

🗣️ Ask the Professor (AI Chat): Get instant answers and explanations to any academic question, powered by Gemini AI. Supports text and voice input/output.

📝 Notes Summarizer: Paste lengthy notes or upload documents (TXT, PDF, DOCX, XLSX) and get concise, organized summaries in Markdown format.

🧠 AI-Generated Quizzes: Create custom multiple-choice quizzes on any topic, with adjustable difficulty and number of questions (1-10). Track your scores!

🗓️ Personal Study Plan: Plan your study sessions, set goals, and even add reminders to your Google Calendar.

❓ Doubt Solver (Text + Image + Camera): Snap a picture of a problem or type your question, and get detailed solutions and explanations.

📈 Progress Analytics: Visualize your learning journey with charts tracking quiz scores, notes summarized, and chat interactions over time.

📖 Vocabulary Builder: Learn new words with definitions, examples, and usage. Save your vocabulary list for future review.

💡 Aptitude & Reasoning: Generate and practice aptitude questions on various topics (Logical, Quantitative, Verbal) with detailed explanations.

🔬 Science Lab (Coming Soon): Explore scientific concepts and conduct virtual experiments.

🏛️ History & Culture (Coming Soon): Delve into historical events and cultural insights.

🎯 Daily Challenges (Coming Soon): Engage in bite-sized learning challenges to boost your knowledge.

🗂️ Flashcards: Create and review digital flashcards for effective memorization.

🔐 User Authentication: Securely register and log in with email and password.

🌟 User Profile & XP System: Earn XP for learning activities and unlock badges as you progress!

🌙 Dark Mode: Switch between light and dark themes for comfortable viewing.

📂 Project Structure
The project is organized into a clear and modular structure to enhance maintainability and scalability:

/ai-professor-app
|-- /public
|-- /src
|   |-- /assets         // Images, Icons (e.g., SVG icons, static images)
|   |-- /components     // Reusable UI Components (e.g., Modal, Button, Card)
|   |-- /pages          // Different sections/features of the application (e.g., Vocabulary, Aptitude, Flashcards, DailyChallenges, HistoryCulture, ScienceLab)
|   |-- /styles         // Global CSS or SCSS files for styling
|   |-- /services       // Modules for API calls (e.g., Gemini API, Firebase interactions)
|   |-- /utils          // General utility and helper functions (e.g., renderMarkdown)
|   |-- App.jsx         // Main application component, handles routing and global state
|   |-- index.jsx       // Entry point for React application rendering
|-- package.json        // Project dependencies and scripts
|-- .env                // Environment variables (e.g., API Keys, Firebase config)
|-- README.md           // This documentation file

🛠️ Technologies Used
Frontend: React.js

Styling: Custom CSS (inspired by Tailwind principles for responsiveness)

State Management: React Hooks (useState, useEffect, useRef, useCallback)

Backend: Google Firebase (Authentication, Firestore Database)

AI Integration: Google Gemini 2.0 Flash API (for text and multimodal generation)

Charting: Chart.js (for progress analytics)

Speech: Web Speech API (SpeechRecognition, SpeechSynthesis)

⚙️ Setup and Installation (Local Development)
To run AI Professor on your local machine:

Clone the repository:

git clone <your-repo-url>
cd ai-professor-app

Install dependencies:

npm install
# or
yarn install

Firebase Project Setup:

Go to the Firebase Console.

Create a new project.

Add a Web App to your project.

Copy your Firebase configuration object.

Enable Firestore Database: Start in production mode and set up security rules (as per Firebase documentation, typically allowing authenticated reads/writes).

Enable Email/Password Authentication: In Firebase Authentication, enable the Email/Password sign-in method.

Enable Gemini API: Ensure your Google Cloud project linked to Firebase has the Gemini API enabled.

Environment Variables:

Create a .env file in the root of your project.

Add your Firebase API Key and optionally your Gemini API Key (though for Canvas, it's often injected):

REACT_APP_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
REACT_APP_GEMINI_API_KEY="YOUR_GEMINI_API_KEY" # Optional, if not using Canvas injection
# Add other Firebase config details if you prefer to load them from .env

Note: The provided App.jsx automatically attempts to use Canvas-injected variables (__firebase_config, __app_id, __initial_auth_token). For pure local development outside Canvas, you'd typically hardcode the full firebaseConfig object or load it entirely from .env.

Run the application:

npm start
# or
yarn start

The app will open in your browser, usually at http://localhost:3000.

💡 Usage
Register: On first visit, you'll be prompted to register. Create an account with your email and a strong password.

Login: After registration, or on subsequent visits, log in with your credentials.

Navigate: Use the sidebar to explore different learning modules (Ask Professor, Notes, Quizzes, etc.).

Interact: Follow the on-screen instructions within each section to generate content, answer questions, or solve doubts.

Track Progress: Visit the "Progress" section to see your learning statistics.

Manage Profile: In "Settings," view your XP and badges, and toggle the theme.

🤝 Contributing
Contributions are welcome! If you have suggestions, bug reports, or want to contribute code, please feel free to:

Fork the repository.

Create a new branch (git checkout -b feature/your-feature-name).

Make your changes.

Commit your changes (git commit -m 'Add new feature').

Push to the branch (git push origin feature/your-feature-name).

Open a Pull Request.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

📧 Contact
For any questions or feedback, please reach out!"# AI-Professor" 
