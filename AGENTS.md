# Project Guidelines

## Project Overview

- This is a React 18 single-page application for the 21 Express Employee Self Service (ESS) frontend.
- It uses Create React App (`react-scripts`), React Router 6, Tailwind CSS, Axios/fetch, and React Loadable.
- The frontend communicates with the REST backend through `REACT_APP_BACKEND_HOST`.
- The project name in `package.json` is `fleet-management`.

## Architecture

- `public/index.html` is the HTML entry template and contains the React `#root` element.
- `src/index.js` is the JavaScript entry point; it mounts `<App />` into `#root`.
- `src/App.js` owns the top-level router. `/` is the login page and `*` routes are delegated to `ContentLayout`.
- `src/components/content-layout/index.js` owns authenticated application routes and lazy loads feature modules with `react-loadable`.
- Feature modules live under `src/components/apps-library/` and are grouped by domain: dashboard, masters, menu, operations, and users.
- Shared layout/navigation code lives under `src/components/` and `src/components/user-control/`.

## Routing and Authentication

- Use `react-router-dom` v6 APIs such as `useNavigate`, `navigate`, `Routes`, and `Route`.
- Dynamic routes use colon parameters, for example `:id`, `:uid`, `:code`, `:platNumber`, and `:resi`.
- After login, use `src/loginportal.js` as the active login implementation. The root `loginportal.js` is duplicated legacy code and is not imported by `src/App.js`.
- Store the authenticated account in `localStorage` as `account`.
- Store the API key returned by login in `localStorage` as `token`.
- Send authenticated API requests with:

```js
Authorization: `Basic ${token}`
```

- Read the API base URL with `process.env.REACT_APP_BACKEND_HOST`.
- Do not introduce secret values or credentials into frontend source code. The backend URL is safe to expose in the CRA build, but authentication secrets are not.
- When authentication is missing or rejected, clear `account` and `token` and redirect to `/`.
- Prefer extending `ContentLayout` routes when adding a feature page, and preserve existing URL capitalization and route groups.

## Environment Variables

- Use `REACT_APP_BACKEND_HOST`, not `REACT_APP_BACKEND_URL`.
- Development `.env` example:

```env
REACT_APP_BACKEND_HOST=http://localhost:5000
```

- CRA exposes variables only when they start with `REACT_APP_`.
- Restart `npm start` after changing `.env` because CRA injects environment variables at build/start time.
- Docker builds require `REACT_APP_BACKEND_HOST` as a build argument:

```powershell
docker build --build-arg REACT_APP_BACKEND_HOST=https://api.example.com -t wh_frontend .
```

- Do not rely on unrelated hardcoded fallback URLs unless the surrounding module already has that compatibility pattern.

## Code Style

- Use JavaScript and JSX consistently with the existing React 18 patterns.
- Preserve semicolons and two-space indentation where files already follow them.
- Use functional components and hooks. Do not introduce class components unless required by an existing dependency pattern.
- Keep feature components close to their routes under `src/components/apps-library/<domain>/`.
- Use named, descriptive state variables and keep API helpers close to the component that owns the request.
- Use camelCase for variables, state setters, and function names, for example `storedAccount`, `handleLogin`, and `setUsername`.
- Use PascalCase for React components and exports, for example `LoginPortal` and `ContentLayout`.
- Keep one component per file and place it near its owning route or feature domain.
- Use descriptive handler names with an action prefix, such as `handleLogin`, `handleLogout`, or `handleWebMenuList`.
- Separate state, effects, API handlers, and return JSX in a predictable order. Keep async API logic in named functions near the component that owns it.
- Avoid introducing unrelated abstractions or shared helpers unless the same logic is used by multiple components.
- Use Axios for existing Axios-based modules and `fetch` for existing fetch-based modules; prefer consistency within the touched module.
- Handle loading, empty, error, 401, and confirmation states where a feature has asynchronous actions.
- Treat API response shapes from this project as being under `express21.results.data`; read actual neighboring modules before assuming a different shape.

## CSS and Visual Style

- Follow the existing Tailwind-first pattern; utility classes are preferred over new CSS rules.
- Keep `src/index.css` and `src/App.css` limited to global Tailwind directives or existing global styles.
- Preserve the project's existing visual language: blue brand colors, light gray surfaces, white panels, restrained shadows, compact spacing, and clear form labels.
- Use existing border, rounded, transition, hover, focus, loading, and error patterns from neighboring components when possible.
- Prefer responsive Tailwind prefixes such as `sm`, `md`, and `lg`; avoid viewport-specific custom CSS unless required.
- Do not scale text directly with viewport width and do not add decorative gradient-heavy effects beyond the existing blue login brand style.
- Before adding custom CSS to `src/App.css`, `src/index.css`, or a new stylesheet, provide a plan describing:
  - the visual problem that utility classes cannot solve;
  - the exact files to be changed;
  - the proposed CSS scope and reuse intent;
  - which existing classes or visual patterns it follows.
- Do not add global CSS selectors or utility names that conflict with existing Tailwind styles.
- If a stylesheet is necessary, keep selectors scoped to the component and document the reason in the change summary.

## API Conventions

- Build URLs from `process.env.REACT_APP_BACKEND_HOST` plus the backend path.
- Include the token for protected endpoints:

```js
const token = localStorage.getItem("token");
```

- Guard against missing tokens instead of sending `Authorization: Basic null`.
- Use `encodeURIComponent` for dynamic query values where appropriate.
- Check HTTP status and provide user-facing error messages instead of only logging to the console.
- Avoid broad refactors across feature modules; change the smallest owning component and preserve response parsing conventions.

## Build and Test

Run commands from the project root:

```powershell
npm install
npm start
npm test
npm run build
```

- `npm start` runs `react-scripts start` and serves the CRA development app, normally at `http://localhost:3000`.
- `npm run build` creates the production bundle in `build/` and disables sourcemaps via the package script on Windows.
- `npm test` runs CRA/Jest tests in watch mode unless passed CI or one-shot flags.
- For focused validation in CI or automation:

```powershell
npm test -- --watchAll=false
npm run build
```

- Update or add focused tests for changed behavior. Existing `src/App.test.js` is a CRA placeholder and may require modernization before it is considered a meaningful regression test.

## Change Guidelines

- Start from the nearest owning component or route before searching broadly.
- Make the smallest coherent change and preserve existing route names, API payloads, and localStorage keys.
- Do not remove legacy routes or duplicate login implementations unless the task explicitly includes cleanup and compatibility verification.
- Do not replace React Loadable or migrate the router/state libraries during routine feature changes.
- Verify routing through `src/App.js` and `src/components/content-layout/index.js` whenever adding or changing protected pages.
- After code edits, perform the narrowest relevant test or build check before broader validation.
- Report any unrelated existing failures separately instead of fixing them opportunistically.
