# PrimeSA_Salon Website

PrimeSA_Salon is a responsive Next.js salon website backed by Prisma and PostgreSQL. Salon details, services, prices, bookings, administrator accounts, gallery entries, and customer ratings are persisted in the database. Newly uploaded salon images are stored in Cloudinary, not on the web server's filesystem.

## DEVELOPER SETUP

### Required software

- Node.js 24.16.0 (see `.node-version`)
- npm
- PostgreSQL 14 or newer for local development and production
- A Cloudinary account for dashboard image uploads

### Installation commands

```bash
npm install
Copy-Item .env.example .env
```

### Environment configuration

Update the values in `.env` before starting the app. Use a PostgreSQL connection string; SQLite is not supported by the production Prisma schema.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
AUTH_SECRET="a unique random secret of at least 32 characters"
ADMIN_EMAIL="sahil.lume@gmail.com"
ADMIN_PASSWORD="a unique password with at least 16 characters"
ADMIN_CURRENT_EMAIL="existing-admin@example.com"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

Generate a secret rather than using the example value:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Keep `.env` private; it is ignored by Git. Never commit or expose `AUTH_SECRET`, `ADMIN_PASSWORD`, `DATABASE_URL`, or `CLOUDINARY_API_SECRET`. Cloudinary values are read only by server-side upload actions. Do not prefix secrets with `NEXT_PUBLIC_`.
`.env.example` contains placeholders only and is safe to upload. `TARGET_DATABASE_URL` is only needed temporarily when importing the existing SQLite records; do not set it in Render.

### Database setup

```bash
npx prisma generate
npm run db:migrate:deploy
npm run admin:setup
npm run db:seed
```

`admin:setup` creates an administrator only when none exists. Put the desired `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (at least 16 characters) in `.env` first. It never prints the password. To explicitly reset an existing account's password, update those two values in `.env` and run `npm run admin:reset-password`. Seeding never creates a default-password account or changes an existing administrator password.

To change the existing administrator's email and password, set `ADMIN_CURRENT_EMAIL` to the current account email, `ADMIN_EMAIL` to the new email, and a unique `ADMIN_PASSWORD` of at least 16 characters in `.env`, then run `npm run admin:update-credentials`. The administrator display name is updated to Sahil Phakathwayo. The script does not print passwords.

The old example administrator password is rejected by the login form. If an earlier seed created an account with that disabled example password, set a new private password in `.env` and run `npm run admin:reset-password` before signing in. The reset script changes only the account matching `ADMIN_EMAIL`.

### Development server

```bash
npm run dev
```

Open http://localhost:3000

### Testing and build

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## RENDER PRODUCTION DEPLOYMENT GUIDE

The project includes `render.yaml`. The easiest setup is a Render Blueprint: it creates the Node.js website and a paid PostgreSQL database together, connects the database to the website, applies Prisma migrations, and enables automatic deploys from GitHub. It does not select a free or expiring database. Check Render's current plan and pricing before approving; nothing is purchased or deployed for you by this guide.

### 1. Upload this project to GitHub

1. Create or sign in to your GitHub account and install [GitHub Desktop](https://desktop.github.com/).
2. In GitHub Desktop, choose **File → Add Local Repository** and select this project folder. If it says the folder is not a repository, choose **Create a Repository**, select this folder, and create it.
3. Review the files GitHub Desktop lists. `.env`, `.env.local`, and local `.db` files must not be included. `.env.example` is safe to include.
4. Enter a commit message such as `Prepare PrimeSA Salon for Render`, click **Commit to main**, then click **Publish repository**. Choose private or public based on your preference.
5. In GitHub, verify that `render.yaml`, `.node-version`, `prisma/schema.prisma`, `prisma/migrations/`, and `.env.example` are present. Do not upload `.env` or the local database file.

### 2. Create the website and PostgreSQL on Render

1. Sign in to Render and select **New → Blueprint**.
2. Connect the GitHub repository you just published and choose the branch (usually `main`).
3. Render reads `render.yaml` and shows the resources it will create: a paid Node.js **Web Service** and a paid **PostgreSQL** database. Review the plan names, region, and current price. Do not select a free database.
4. Confirm the Blueprint only if you are ready to create those services. The website service receives the database's internal connection string as `DATABASE_URL`; keep it private.
5. Add the values Render asks for:
   - `NEXT_PUBLIC_SITE_URL` — the public HTTPS address Render assigns to the website (you can update it after adding a custom domain).
   - `ADMIN_EMAIL` — the administrator email you want to use.
   - `ADMIN_PASSWORD` — a new private password at least 16 characters long. Do not reuse a password previously shared in chat.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — from your Cloudinary account.
   - `AUTH_SECRET` is generated by Render. `DATABASE_URL` is connected from the Blueprint database.

The web service builds with `npm ci --include=dev && npm run build` (the Prisma and TypeScript tools are needed during deployment), applies migrations with `npm run db:migrate:deploy`, starts with `npm start`, and uses `/` as its health check. Every GitHub push to the connected branch can trigger a new deploy. The migration command only applies checked-in migrations; it does not reset or delete records. The seed is deliberately a separate step, so existing local data can be imported first.

If you prefer to create services manually instead, create the paid PostgreSQL database first, then create a Node.js Web Service from the same GitHub repository. Use the build, pre-deploy, start, and health-check commands above, set `DATABASE_URL` to that database's **Internal Database URL**, and add the environment variables listed above.

### 3. Preserve existing local data, then add defaults

This project contains an existing local SQLite database. It is not used in production, and Render cannot automatically copy its records. A one-time importer reads it locally and copies salon details, services, prices, gallery entries, bookings, and admin accounts to PostgreSQL. It does not modify the SQLite source or overwrite PostgreSQL rows. If you have no local records to keep, skip the import steps, but still run the seed in step 6 before continuing to step 4.

The current local database includes a previously created test booking. The importer intentionally copies every booking, so review the appointments before importing if that test record should not appear in the live dashboard.

1. Wait until Render's first deploy succeeds; this creates the PostgreSQL tables but does not seed or reset data.
2. In Render, open the database's **Connect** page and copy its **External Database URL**. Keep it private. If Render asks for an IP allow-list, allow only your current IP for this transfer and remove that temporary allowance afterward.
3. Back up the local database file before importing:

   ```powershell
   Copy-Item prisma\prisma\dev.db prisma\prisma\dev.backup.db
   ```

4. In the project folder on your computer, temporarily add this setting to `.env.local`:

   ```text
   TARGET_DATABASE_URL="paste-the-private-external-database-url-here"
   ```

   `.env.local` is ignored by Git. Never paste the URL into GitHub, this README, or a public chat.
   If `.env.local` already exists, add this one line without replacing its other settings.
5. Run a read-only preview first:

   ```powershell
   npm run db:import:sqlite -- --dry-run
   ```

   Check that the summary shows source records and says nothing was written. Then run the import:

   ```powershell
   npm run db:import:sqlite
   ```

   It imports in one transaction and skips conflicting records rather than overwriting them. The SQLite database is opened read-only.
6. Open the Render Web Service's **Shell** and run:

   ```bash
   npm run db:seed
   ```

   This adds any missing default services and gallery images without replacing existing owner-edited services or duplicating gallery images. Remove only the temporary `TARGET_DATABASE_URL` line from `.env.local` when the import is complete (delete the file only if you created it just for this transfer).

The checked-in initial migration is for a new, empty PostgreSQL database. If you already have a populated PostgreSQL database, stop before creating the Blueprint or applying this migration. Back it up and have its schema reviewed first; never run `prisma migrate reset` or `prisma db push` against production.

### 4. Set up or keep the administrator account

If you imported an existing admin account, keep using its existing email and password. Deployment and seeding do not reset administrator passwords.

If PostgreSQL has no administrator (for example, you skipped the import), open the Render Web Service's **Shell** and run:

```bash
npm run admin:setup
```

This creates the first administrator using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from Render's environment settings and stores a bcrypt password hash. It refuses to create an additional admin if one already exists. Sign in at `/admin/login`. Do not run a password reset unless you intentionally want to change an existing password.

### 5. Configure Cloudinary image uploads

Create a Cloudinary account, then copy its cloud name, API key, and API secret into the Web Service's environment settings. Dashboard uploads are checked and sent server-to-server to Cloudinary; PostgreSQL stores the secure image URL and Cloudinary public ID. Replacing or deleting an uploaded service/gallery photo removes its old Cloudinary asset. The API secret is not sent to browser code, and Render's temporary disk is not used. Bundled images in `public/assets/images/` continue to be served from the project.

### 6. Test the live website

1. Open the Render website URL and check the home, services, gallery, contact, and booking pages.
2. Sign in at `/admin/login`. Update a safe test setting and a service price, save, refresh, and confirm the values remain saved.
3. Create a clearly labelled test booking using test contact details. Confirm it appears in the admin dashboard and that its status can be changed.
4. Upload a test photo from the dashboard, refresh, and confirm it remains visible. Remove the test booking/photo when finished.
5. Check the Render service logs if a page or action fails. Do not share logs containing private connection strings or customer details.

### 7. Add a custom domain

1. In the Render Web Service, open **Settings → Custom Domains** and add the domain you own.
2. Follow the DNS records Render provides at your domain registrar. DNS changes may take time to appear.
3. Wait for Render to verify the domain and issue HTTPS.
4. Update `NEXT_PUBLIC_SITE_URL` in the Web Service environment settings to the final HTTPS domain and redeploy.

For ongoing safety, use Render's database backup options and periodically test a restore. The project has no automatic test script; run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before publishing changes. In Google Search Console, verify the live site and submit `/sitemap.xml`.

## SALON OWNER GUIDE

### How to sign in

Visit `/admin/login` and sign in with the administrator email and password. Use the `admin:reset-password` command above if you need to reset it.

### How to request a customer rating

After an appointment is completed, change its status to **Completed** in the admin dashboard and save. Use **Send review request on WhatsApp** to send the private one-time review link to that customer. Ratings are accepted only for completed appointments, can only be submitted once, and are shown on the homepage without publishing customer names or phone numbers.

### How to change a hairstyle price

Open the admin dashboard and edit the relevant service in the service list. Update the price and save the form.

### How to add a new hairstyle

Go to the admin dashboard and use the "Add service" form. Enter the service name, category, description, price, and duration, then optionally upload a JPEG, PNG, or WebP photo (up to 5 MB). The service, price, Cloudinary image URL, and image reference are stored in PostgreSQL, so they remain after refresh. Use "Edit service" to change a service, its price, visibility, or photo.

### How to upload photographs

Upload service and gallery photos from the admin dashboard. Valid JPEG, PNG, and WebP files up to 5 MB are sent directly from the server to Cloudinary and linked to the selected service or gallery record in PostgreSQL. Replacing or removing dashboard-managed images also removes their Cloudinary assets.

For manually managed image files, use these folders:

- `public/assets/images/logo/` — salon logo
- `public/assets/images/hero/` — homepage hero and salon photography
- `public/assets/images/hairstyles/braids/` — braid service photos
- `public/assets/images/hairstyles/cornrows/` — cornrow service photos
- `public/assets/images/hairstyles/wigs/` — wig service photos
- `public/assets/images/hairstyles/weaves/` — weave service photos
- `public/assets/images/hairstyles/dreadlocks/` — dreadlock service photos
- `public/assets/images/hairstyles/natural-hair/` — natural-hair service photos
- `public/assets/images/hairstyles/other/` — other hairstyle and treatment photos
- `public/assets/images/gallery/` — portfolio/gallery photos

For bundled or manually managed local images, enter the public path (for example, `/assets/images/hairstyles/braids/knotless-braids.jpg`) in the service's optional **Image URL** field. For new owner uploads, use the dashboard upload field; image uploads take precedence over a manually entered URL. Missing or unavailable photos display the site's built-in image placeholder instead of a broken image.

New dashboard uploads are stored in Cloudinary, with image URLs and public IDs stored in PostgreSQL. The repository's bundled assets remain in `public/assets/images/`. Render's local filesystem is never used for new uploaded photos.

### How to change the salon logo

Replace the logo file in `public/assets/images/logo/`; the current profile uses `/assets/images/logo/logo-mark.jpg`. If its filename changes, update the salon profile's `logoUrl` to the new public path.

### How to update WhatsApp and phone numbers

Edit the salon details in the admin dashboard and save the updated contact values.

### How to update business hours

Open the salon details section and edit the business hours text.

### How to view appointment requests

Go to the admin dashboard and review the bookings section for all new customer requests.

### How to publish and hide services

When creating or editing a service, use the visible checkbox to publish or hide it from the public website.

### Image directories

Bundled or manually maintained files can be placed in `public/assets/images/hairstyles/men/`, `braids/`, `cornrows/`, `wigs/`, `weaves/`, `dreadlocks/`, `natural-hair/`, or `other/` (under `hairstyles/`), plus `public/assets/images/logo/`, `public/assets/images/hero/`, and `public/assets/images/gallery/`. Set a service's **Image URL** to connect a bundled image. Owner uploads through the dashboard are stored in Cloudinary and associated with the selected service or gallery entry. If a local or remote image is unavailable, the site displays its image placeholder.

### Seed safety and persistence

The seed is repeatable: services are matched by name and new rows use stable IDs; gallery rows are matched by stable ID or image path. It updates the example salon profile only when migrating the earlier project demo profile, preserves administrator accounts and uploaded images, and hides only the exact old sample service/gallery rows rather than deleting records. Customer bookings are never modified. The seed includes the six supplied services and all 28 bundled gallery photos. Bundled gallery images are WebP files and use the `.webp` extension.

Production uses PostgreSQL migrations and Cloudinary for newly uploaded images; neither the SQLite development file nor Render's ephemeral filesystem is a production datastore.
