You are a senior full-stack engineer.

## Goal
Build a responsive household task management web app that can be hosted on GitHub Pages (static hosting only).

## Important Constraint
- The app MUST be frontend-only (no custom backend server)
- Use a Backend-as-a-Service if needed (e.g. Supabase or Firebase)
- The app is in german

## Tech Stack
- Frontend: React + TypeScript (Vite preferred)
- Backend: Supabase (PostgreSQL + API + optional auth)

## Features

### Users
- Predefined users:
  - Linus
  - Ruben
  - Markus
- User selection on app start (no login required)

### Tasks
- Tasks can be:
  - Assigned to one user
  - Assigned to all users
- Each task has:
  - Title
  - Assigned user(s)
  - Deadline (optional)
  - Completed state

### Recurring Tasks Logic

- Linus & Ruben:
  - Alternate weekly:
    - One cleans bathroom
    - Other cleans room / vacuums / hallway

- Weekly task:
  - Every Friday:
    - Everyone throws laundry into laundry chute

- Markus:
  - Every 2 weeks:
    - Clean bathroom
    - Vacuum hallway

### UI / UX
- Minimal, clean, mobile-first design
- Must work well on iPhone Safari
- Show:
  - Tasks
  - Deadlines
  - Completion state
  - Weekly streaks

### Mobile Experience
- PWA support (installable on iPhone)
- If possible:
  - Push notifications via Supabase or browser notifications

### Hosting
- Must be deployable via GitHub Pages
- Provide build + deploy instructions

### Deliverables
- Full code
- Supabase setup (tables, schema)
- Deployment guide
- Simple architecture explanation

### Bonus
- Streak tracking
- Simple stats
- Dark mode

Keep everything simple, clean, and practical.
Avoid overengineering.