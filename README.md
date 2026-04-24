# MovieVault Final Project (No MongoDB Version)

This is a submission-friendly Express + EJS movie project with:
- User registration
- Login / logout
- Add, view, edit, delete movie
- Owner-only edit/delete protection
- Local JSON file storage (no MongoDB needed)

## Quick Start

1. Open the project in VS Code
2. Run:
   npm install
3. Create a `.env` file with:
   SESSION_SECRET=mysecretkey123
   PORT=3000
4. Start the app:
   npm start
5. Open:
   http://localhost:3000

## Notes
- Data is saved in `data/db.json`
- No external database account is required
- Good for local demos, screenshots, and submission testing
