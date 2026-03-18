# ScaleGPT

An AI chat app I built from scratch using React and Node.js. It connects to OpenAI's API and lets you chat with different AI models, save your conversations, upload files, and switch between plans.

Live: [scaleai-production.up.railway.app](https://scaleai-production.up.railway.app)

---

## What it does

- Chat with AI using multiple models (GPT-4o, o3, GPT-4V)
- All chats are saved and organized by date
- Login and register with JWT authentication
- Upload files and images in chat
- Switch between AI models mid-conversation
- Admin dashboard to monitor users and usage
- Pricing page with Free, Beginner, Advanced, and Enterprise plans
- Works well on mobile and desktop

---

## Built with

- React, Tailwind CSS, React Router
- Node.js, Express, MongoDB
- JWT for auth, Multer for file uploads
- Deployed on Railway

---

## Run locally
```bash
git clone https://github.com/tyagirohit01/ScaleGPT.git

cd server && npm install
cd ../client && npm install
```

Server `.env`:
```
MONGODB_URI=
JWT_SECRET=
OPENAI_API_KEY=
```

Client `.env`:
```
VITE_SERVER_URL=http://localhost:5000
```
```bash
cd server && npm run dev
cd client && npm run dev
```

---

## Deploy

Push to GitHub → go to Railway → manually trigger deploy from the dashboard.

---

Built by Rohit Tyagi — [@tyagirohit01](https://github.com/tyagirohit01)
