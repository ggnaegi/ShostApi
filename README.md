# Harmonie Shostakovich

Website and content-management API for Harmonie Shostakovich, a non-profit association. The project aims to keep annual operating costs near USD 100 and is not intended for commercial use.

The repository contains:

- `UI/`: Angular web application.
- `Shosta.Functions/`: .NET 10 isolated Azure Functions API, with SQL Server persistence and SendGrid email delivery.

## Prerequisites

- Node.js and npm
- .NET 10 SDK
- Azure Functions Core Tools
- Access to the development SQL Server and required service credentials

## Run locally

### API

Configure the API's local settings with the required connection string and service keys. Do not commit credentials or production settings.

```powershell
cd Shosta.Functions
dotnet restore
func start
```

The API runs locally at `http://localhost:7227`.

### Web application

In a second terminal:

```powershell
cd UI
npm ci
npm start
```

Open `http://localhost:4200`. The development environment configuration points the application at the local API.

## Common commands

Run these from `UI/`:

```powershell
npm run build
npm test
npm run lint
```

Run this from `Shosta.Functions/`:

```powershell
dotnet build
```

## Architecture

The Angular application serves the public pages and authenticated administration pages. It reads public content from the Functions API and stores page, session, gallery, sponsor, and organisation data through the API.

The API uses Entity Framework Core with SQL Server. It also integrates with SendGrid for contact messages and an SFTP-backed storage service for uploaded media.

Public read endpoints are intentionally accessible to site visitors. Administrative write endpoints must enforce authentication and authorization server-side; do not put Azure Function keys or other secrets in the Angular application.

## Planned changes

SendGrid is currently used to deliver contact messages but will be replaced with Resend, which offers a free tier and better fits the project's cost target.

## Deployment

Pushing to `master` triggers the GitHub Actions workflow in `.github/workflows/master_shosta-flex-2026.yml`, which builds and deploys the Azure Functions API to the production Function App.

## Repository hygiene

- Keep credentials in local settings, Azure App Settings, or GitHub Actions secrets.
- Do not commit generated output such as `bin/`, `obj/`, `dist/`, or `node_modules/`.
- Run the relevant build, test, and lint commands before opening a pull request.
