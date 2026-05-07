# Focus. (Or: Yet Another Productivity App You'll Use To Avoid Real Work)

Welcome to **Focus**. It's a lightweight, blazing fast, local-first productivity app designed specifically for people who are tired of pretending that moving a Jira ticket across 4 columns actually constitutes "work."

You asked for a tool to reduce activation friction, and you got one. It's brutally simple, strictly local, and completely devoid of confetti animations when you finish a task. Because you're an adult. Doing your job is the reward.

## Why does this exist?

Because enterprise productivity SaaS is actually just a very expensive way to organize your procrastination. You open a typical app, see 17 glowing red notifications, 47 overdue tasks, an activity feed of your coworkers doing things, and suddenly your brain diffuses. You close the tab and check Twitter. 

We fixed that.

## "Killer" Features

*   **No Backend, No Cloud:** Your data is yours. It lives in `localStorage`. If you clear your cache, it's gone. Consider it forced bankruptcy for your terrible ideas. If AWS us-east-1 goes down, you still have to work. Sorry.
*   **Command Palette Input:** You can type `#frontend +bug /deep !pin > Fix the damn thing` and it magically parses into form fields. Because clicking a dropdown menu 4 times is a violation of your human rights.
*   **Current Focus Mode:** When you start a task, the rest of the app violently dims into the background and your single active task becomes a massive, unignorable banner. You have ONE task. Everything else is noise.
*   **Resume Last Session:** When you open the app tomorrow morning, it violently throws the exact task you abandoned yesterday right in your face. "Cold start" solved. Drink your coffee and click resume.
*   **The "Why Stuck?" Field:** When you mark a task as blocked, it asks you why. "Waiting on Steve" is an acceptable answer. "Mentally avoiding writing unit tests" is also acceptable, but at least now you have to admit it to yourself.
*   **High Security PIN Lock:** A totally-not-overengineered 4-digit PIN that secures your session. Will it stop a state-sponsored hacker? No. Will it stop your roommate from seeing that your next action is "google how to center a div again"? Yes.

## Tech Stack

*   **React + TypeScript + Vite**: Because waiting more than 300ms for a build step is unacceptable.
*   **TailwindCSS v4**: Because writing standard CSS implies you have time to care about semantic class names.
*   **Zustand**: Because Redux requires writing 400 lines of boilerplate to toggle a boolean, and Context API makes your React tree look like a fractal.
*   **localStorage**: The ultimate database. It scales infinitely (up to 5MB).

## How to run this masterpiece

1.  Clone it (you know how to do this).
2.  Run `npm install`.
3.  Run `npm run dev`.
4.  Set a PIN that you will inevitably forget.
5.  Actually do your work for once.

## Contributing

Please don't submit PRs adding:
* Gamification (no badges, no streaks)
* Social features (we don't care what your friends are doing)
* A backend
* Charts and graphs

Keep it execution-oriented. 
