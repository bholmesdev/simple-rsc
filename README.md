# Simple RSC ⚛️

> A simple React Server Components implementation that you can build yourself.

[Watch the "build from scratch" code-along video](https://www.youtube.com/watch?v=MaebEqhZR84) to learn how all of the pieces fit together. Or... just read the in-line documentation in this codebase :)

## Goals

- 🌊 Show how React server components are streamed to the browser with a simple Node server.
- ⚙️ Demo a build process to bundle server components and handle client components with the `"use client"` directive.

## Getting started

Install dependencies using `npm` and start the Node development server:

```bash
npm i
npm run dev
```

This should trigger a build and start your server at http://localhost:3000.

### Developer note on the `dev` script

You'll notice the `dev` script maps to the following command in the `package.json`:

```bash
node --conditions react-server server.js
```

The `--conditions` flag is part of the [Node.js conditional exports system](https://nodejs.org/api/cli.html#-c-condition---conditionscondition). This allows packages to export different versions of a module depending on your environment.

When passed `react-server`, `react-server-dom-esm` will expose a server-only module that omits React's client-side or browser-specific APIs, ensuring compatibility with the server-rendered environment.

## Project structure

This project is broken up into the `app/` and `server/` directories. The most important entrypoints are listed below:

```sh
# Your full-stack application
app/
  page.jsx # server entrypoint.
  _client.jsx # client script that requests and renders your `page.jsx`.

# Your backend that builds and renders the `app/`
server.js
```

## What is _not_ included?

- **File-based routing conventions.** This repo includes a _single_ index route, with support for processing query params. If you need multiple routes, you can try [NextJS' new `app/` directory.](https://beta.nextjs.org/docs/routing/defining-routes)
- **Advance bundling for CSS-in-JS.** [A Tailwind script](https://tailwindcss.com/docs/installation/play-cdn) is included for playing with styles.
- **Advice on production deploys.** This is a learning tool to show how React Server Components are used, not the bedrock for your next side project. See [React's updated "Start a New React Project" guide](https://react.dev/learn/start-a-new-react-project) for advice on building production-ready apps.
