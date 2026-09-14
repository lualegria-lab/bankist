# Bankist

Bankist is a responsive landing page with a separate mock banking dashboard for
a fictional minimalist bank. It was built as part of Jonas Schmedtmann's
JavaScript course, following his original design and interaction patterns.

## Features

- Smooth scrolling navigation
- Sticky navigation with menu fade animation
- Tabbed operations section
- Lazy-loaded feature images
- Scroll reveal animations
- Testimonial slider with dots and keyboard controls
- Accessible account modal with focus trapping
- Mock client login with generated usernames and dashboard routing
- Account dashboard with movements, balances, summaries, transfers, loans,
  sorting, account closing, and an auto-logout timer
- Reduced-motion support for users who prefer fewer animations
- Responsive layout for desktop, tablet, and mobile screens

## Technologies

- HTML
- CSS
- Vanilla JavaScript

## Run Locally

From the project folder, start a static server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8000/
```

After logging in from the homepage, the app redirects to:

```text
http://127.0.0.1:8000/app.html
```

## Demo Logins

```text
user: js
PIN: 1111

user: jd
PIN: 2222
```

## Credits

Copyright by Jonas Schmedtmann.

This web was made following his JS course and his design. Additional small
updates were made for responsiveness, accessibility, and project-specific copy.
