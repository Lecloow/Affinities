# Customizing the Event

If you want to create your own event, you will probably need to modify several parts of the project. I tried to make everything as easy to customize as possible and documented the most important components.

If you have any questions, feel free to contact me.
If you encounter a bug, please open an issue on the GitHub repository.
If you'd like to contribute, feel free to fork the project and submit a pull request.

## 1. Create Your Registration Forms

First, fork or clone the repository.

You will need to create your own registration forms so participants can sign up. Your forms should include:

* A predefined class field (not a free-text field, to ensure consistent values).
* Several multiple-choice questions about participants' personalities and interests.

Once your forms are ready and you want to import the data, you will need to modify the entire `backend-go/utils/answers.go` file to match your form structure.

Make sure everything works correctly before importing data, otherwise you may encounter many issues later.

## 2. Configure the Event Rules

If you want to customize the event rules (number of hints per day, points awarded per guess, hint types, etc.), edit:

`backend-go/utils/rules.go`

Also, don't forget to update `eventStartDate`. Otherwise, the event will start in 2026. Double-check your timezone settings (UTC, local time, etc.).

## 3. Hosting

You will need to deploy the application on a server.

For the backend, I personally use [Render](https://render.com/). The Starter or Standard plan should be sufficient. In my experience, the Standard plan comfortably handled around 330 users with the previous Python backend (the Go backend is significantly faster) while using less than 10% of the available resources.

> Note: Don't forget to delete or suspend the service after the event if you no longer need it. Render uses a pay-as-you-go pricing model.

For the frontend, I use GitHub Pages, which is completely free. A GitHub Action is already included to automatically build and deploy the frontend. You will only need to purchase a domain name and configure it with GitHub Pages.

For the PostgreSQL database, I also use Render's free plan. It should be sufficient for around 500 users, and likely more, although I haven't tested larger deployments.

## 4. Deployment

Dev:
```bash
cd backend-go
cp .env.example .env
```
```bash
go run .
```

You will need to configure your database credentials in the `.env` file.
You can also define an `ADMIN_TOKEN`. This is highly recommended. If no admin token is provided, every user will have administrator privileges.

For development, set:

```env
ENV=dev
```
This enables verbose logging.

Prod:
Build command
```bash
cd backend-go && go build
```
Start command
```bash
cd backend-go && ./backend
```
Same here make sure to fill in your DB credentials and an admin token (very important) in the render secrets settings.
If there is no admin token, everybody is an admin, which means, everybody can reimport the data or delete any user.

For the frontend, the GitHub actions will build the app, you will just have to put your render url in the secrets and variables settings.

### 5. Importing the Data

Once the application is running, open [Bruno](https://usebruno.com) and execute the `importData` endpoint.
PS: You can access the bruno documentation (all endpoints) here [Documentation](./Affinities-documentation.html)

You will need to provide:
- `baseUrl` (your Render URL)
- your `ADMIN_TOKEN`

The import process can take a long time depending on the number of users.
On my machine, importing data locally takes roughly one second per user.

Once the import is complete, you can use [TablePlus](https://tableplus.com) (or any other PostgreSQL client) to inspect the database.
You can now run the createMatches endpoint to generate the matches for the users.
When it's done, you can run the createHints endpoint to generate the hints for the matches.
And you're done! Enjoy the event!

## Credits

If you use this project as a base for your own event, you must keep the original credits to the author (Thomas Conchon) in:
- the application UI
- the documentation / README

## 6. Frontend (Local Development)

You may use Tailscale (optional) if you want to access the frontend from another device.
Make sure you have bun installed.

```bash
cd frontend
cp .env.example .env
```
Fill in either your Render Url, or your Tailscale url (or IP)
```bash
bun install
bun run dev --host
```
