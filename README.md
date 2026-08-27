<div align="center">

# 🩺 DiagnoXpert

### AI-Powered Medical Report Analyzer

Turn complex lab reports into clear, actionable insights.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)




</div>

---

## 📖 About The Project

**DiagnoXpert** is a full-stack web application that helps patients understand their medical lab reports without needing a medical degree. Users upload a report (PDF or image), and the platform extracts the data via OCR, interprets the results in plain language, and connects users with the right specialist doctors for follow-up all through a clean, real-time chat-driven interface.

It was built as a Final Year Project (FYP), with a strong focus on production quality architecture: type-safe APIs, real-time communication, secure authentication, and a modular, scalable codebase.

> 🔗 **Live Website:** [https://diagno-xpert.vercel.app/](#)


>  🔗 **Technical Report** [https://doi.org/10.5281/zenodo.22125705](#)

---

## ✨ Key Features

- 🔍 **OCR-Powered Report Scanning**: Upload lab reports as PDF or image and extract structured data automatically
- 🤖 **AI-Assisted Interpretation**: Get plain-language explanations of medical results
- 💬 **Real-Time Chat**: Live messaging between patients and doctors with instant notifications
- 👨‍⚕️ **Doctor Directory**: Browse specialists by category (dentist, eye specialist, gastroenterologist, psychiatrist, orthopedic surgeon, and more)
- 🔐 **Secure Authentication**: Email/password and Google OAuth sign-in via NextAuth
- 📁 **Report History**: Revisit past scans and chat history anytime
- 🔔 **Notifications**: Stay updated on new messages and events in real time
- 🌗 **Light/Dark Theme**: Fully responsive, accessible UI with theme toggling
- ✉️ **Email Workflows**: Automated password reset and account emails

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router) + TypeScript |
| **Styling / UI** | Tailwind CSS, shadcn/ui, Radix Primitives |
| **State Management** | Redux Toolkit |
| **Database** | MongoDB + Mongoose |
| **Authentication** | NextAuth.js (Credentials + Google OAuth) |
| **File Storage** | Cloudinary |
| **OCR / Report Parsing** | PDF.js, Python OCR service |
| **Email** | Nodemailer |
| **Testing** | Vitest / unit test suite |

---

## 📂 Project Structure

```
diagno_xpert/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/       # Reusable UI & feature components
│   ├── features/         # Redux slices (auth, home, chat history)
│   ├── ApiServices/       # Client-side API service layer
│   ├── models/            # Mongoose schemas
│   ├── lib/                # Core utilities (DB connect, OCR, validation)
│   ├── helper/             # Email templates, Cloudinary setup, chat export
│   ├── hooks/               # Custom React hooks
│   └── types/                # Shared TypeScript types
├── public/                    # Static assets & icons
├── tests/                      # Unit tests
└── ...config files
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A MongoDB instance (local or Atlas)
- Cloudinary account (for image/file uploads)
- Google Cloud OAuth credentials (for Google sign-in)

### Installation

```bash
# Clone the repository
git clone https://github.com/Saira1302/DiagnoXpert-A-medical-report-Analyzer.git

# Move into the project directory
cd DiagnoXpert-A-medical-report-Analyzer/diagno_xpert

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# then fill in your own values in .env

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app running.

### Environment Variables

This project requires a `.env` file with your own credentials. See `.env.example` for the full list of required variables, which typically include:

```
MONGODB_URI=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
```

> ⚠️ Never commit your `.env` file — it's already excluded via `.gitignore`.

---

## 🧪 Running Tests

```bash
npm run test
```

---

## 🗺️ Roadmap

- [ ] Multi-language report support
- [ ] Downloadable AI-generated health summaries
- [ ] Appointment scheduling with doctors
- [ ] Mobile app version


---

<div align="center">

Built with ❤️ as a Final Year Project

</div>
