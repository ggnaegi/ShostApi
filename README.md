# Harmonie Shostakovich

Website and content-management API for Harmonie Shostakovich, a non-profit association. The project aims to keep annual operating costs low and is not intended for commercial use.

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

## Administrator guide

### Access

Open `/admin` on the website and sign in with an authorised Microsoft Entra account. The administration menu provides access to **Config et Galeries**, **Sessions**, **Organisation**, and **Sponsors**. Users without the required permissions are redirected to the public site.

### Config et Galeries

Use this page to create and configure a session year:

1. Enter the year and session title, then select **Créer une session**.
2. Open the corresponding session panel to upload its flyer and gallery photos.
3. Add alternative text, a teaser, and an optional YouTube link.
4. Use the display options to control whether the session appears on the public session page, the photo gallery, and the welcome page.
5. Select **Enregistrer** to save the configuration.

The configured flyer is the image displayed on the public session page. You can also update the title and description of the **Médias & Archives** page here.

### Sessions

Select a year to edit its title, presentation, programme, and teaser. The expandable sections let you manage:

- The conductor and soloists, including portraits and presentations.
- Musicians and their instruments.
- Concert dates, venues, cities, and ticket links.

Use the upload button beside a portrait field to upload an image, then select **Enregistrer** to publish the changes. Empty musician or concert lists are not displayed on the public session page.

### Organisation

Select a year and update the welcome text, ensemble and committee titles, presentations, and image links. Use **Membres du comité** to add, edit, or remove committee members, then select **Enregistrer**.

### Sponsors

Update the benefactors and sponsors titles and texts, then select **Enregistrer les textes**. These text fields allow HTML. Upload sponsor logos with **Ajouter des logos**; use the delete button on a logo to remove it.

### Publishing guidance

- Verify text, image, links, and year before saving: changes are reflected on the public website.
- Use meaningful alternative text for flyers, gallery images, portraits, and sponsor logos.
- Use only trusted, simple HTML in HTML-enabled text fields.
- Keep a local copy of uploaded source images, especially before deleting an existing image.

## Deployment

Pushing to `master` triggers the GitHub Actions workflow in `.github/workflows/master_shosta-flex-2026.yml`, which builds and deploys the Azure Functions API to the production Function App.

## Repository hygiene

- Keep credentials in local settings, Azure App Settings, or GitHub Actions secrets.
- Do not commit generated output such as `bin/`, `obj/`, `dist/`, or `node_modules/`.
- Run the relevant build, test, and lint commands before opening a pull request.
