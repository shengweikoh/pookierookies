# Pookie Rookies

Welcome to **Pookie Rookies**! This project is a web application designed to help users manage tasks, meetings, and group activities efficiently. Built with React for the frontend and Django for the backend, it leverages Firebase for database storage and integrates several APIs to enhance functionality.

[Deployed Application](https://pookie-rookies.web.app)
NOTE: Check on the health of the backend server: (https://pookierookies-backend.duckdns.org/health/) before trying the application!
Sometimes it down D:

---

## 🚀 Features

### 1. Task Management
- Assign tasks to team members with priority levels (Low, Medium, High).
- Automated sending of emails upon task assignment and task reminder.
- Track task progress, description, and due dates.

### 2. Meeting Scheduling
- Create, finalize, and manage meetings with polls to decide dates and locations.
- Send email reminders for meetings.
- Automated creation of events in Google Calendar and invitation via email.

### 3. Group Management
- Add, view, edit, and delete group members.
- Filter members by groups or roles for easier navigation.

### 4. Calendar Integration
- Visualize tasks and meetings using Google Calendar.
- Interactive event pop-ups for details and updates.

### 5. Email Integration
- Fetch and display emails using Gmail API.
- Summarize email content with a Gemini API.

---

## 🛠️ Tech Stack

### Frontend
- **React**: For building a dynamic and interactive user interface.
- **CSS**: Custom styles for responsive and user-friendly designs.
- **FullCalendar**: Calendar library for task and meeting visualization.

### Backend
- **Django**: Provides robust server-side logic.
- **Firebase**: Handles data storage, authentication, and hosting.
- **Gmail API & Google Calendar API**: Enables seamless email and calendar integrations.

### Deployment
- **Firebase Hosting**: Hosts the React frontend for production.
- **AWS (EC2)**: Dockerized backend services deployed in an EC2 cluster with HTTPS.
- **Firestore Database**: Database for web application

---

## 📂 Project Structure

```plaintext
root/
├── frontend/                  # React frontend
│   ├── src/                  # Source files
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   └── vercel.json           # Vercel configuration
├── backend/                  # Django backend
│   ├── app/                  # Main app logic
│   ├── manage.py             # Django entry point
│   ├── requirements.txt      # Backend dependencies
│   └── Dockerfile            # Backend Docker configuration
├── README.md                 # Project documentation
└── .gitignore                # Ignored files for Git

📦 Installation and Setup

Prerequisites

	•	Node.js (v16+)
	•	Python (v3.9+)
	•	Docker
	•	Firebase account and credentials
	•	Google Cloud project with Gmail and Calendar APIs enabled

Steps

	1.	Clone the Repository

git clone https://github.com/shengweikoh/pookierookies.git
cd pookierookies


	2.	Frontend Setup

cd frontend
npm install
npm run start


	3.	Backend Setup

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver


	4.	Environment Variables
	•	Create a .env file in both frontend and backend directories with the required API keys and Firebase credentials.
