# Simple RSC ⚛️

> A simple React Server Components implementation that you can build yourself 🙌

[Watch the live demo with Dan Abramov here!](https://www.youtube.com/watch?v=Fctw7WjmxpU)

## ⭐️ Goals

- 🌊 Show how React server components are streamed to the browser with a simple Node server.
- ⚙️ Demo a build process to bundle server components and handle client components with the `"use client"` directive.
- 📝 Reveal how a server component requests appear to the client with a developer panel.

## Getting started

First, install dependencies with "peer dependency" errors disabled:

```bash
npm i --legacy-peer-deps
```

_This is due to experimental version conflicts. React Server Components are still quite new!_

Then, start the Node development server:

```bash
npm run dev
```

This should trigger a build and start your server at http://localhost:3000.

## Project structure

This project is broken up into the `app/` and `server/` directories. The most important entrypoints are listed below:

```sh
# 🥞 your full-stack application
app/ 
  page.jsx # server entrypoint.
  _client.jsx # client script that requests and renders your `page.jsx`.

# 💿 your backend that builds and renders the `app/`
server.js
```

## 🙋‍♀️ What is _not_ included?

- **File-based routing conventions.** This repo includes a _single_ index route, with support for processing query params. If you need multiple routes, you can try [NextJS' new `app/` directory.](https://beta.nextjs.org/docs/routing/defining-routes)
- **Advance bundling for CSS-in-JS.** [A Tailwind script](https://tailwindcss.com/docs/installation/play-cdn) is included for playing with styles.
- **Advice on production deploys.** This is a _learning tool_ to show how React Server Components are used, _not_ the bedrock for your next side project! See [React's updated "Start a New React Project" guide](https://react.dev/learn/start-a-new-react-project) for advice on building production-ready apps.
