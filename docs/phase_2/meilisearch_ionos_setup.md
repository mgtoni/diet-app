# Setting up Meilisearch on IONOS VPS (via Cloud Panel)

Based on your requirement, here is a step-by-step guide to deploying Meilisearch on your IONOS Virtual Private Server (VPS) directly from your web browser, without needing to use SSH.

This guide assumes your IONOS VPS is running a standard Linux distribution like **Ubuntu 20.04 or 22.04**.

## 1. Access the IONOS Remote Console

Instead of using an SSH client on your computer, you can use the built-in terminal in the IONOS dashboard:

1. Log in to your [IONOS Cloud Panel](https://login.ionos.com/).
2. Navigate to **Server & Cloud** and select your VPS from the list.
3. In the top menu or the server actions, click on **Actions** > **Access KVM Console** (or **Remote Console**).
4. A new browser window will open showing the server's screen.
5. When prompted, type `root` as the login and press Enter.
6. Type your server's root password and press Enter. *(Note: As you type the password, nothing will show on the screen for security reasons. Just type it and hit Enter).*

## 2. Install Docker & Docker Compose

The easiest and most reliable way to run Meilisearch is via Docker.
In the console, type the following commands (press Enter after each line):

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## 3. Create Meilisearch Environment

Create a directory for your Meilisearch data and configuration:

```bash
mkdir -p /opt/meilisearch
cd /opt/meilisearch
```

## 4. Define Docker Compose File

Create a `docker-compose.yml` file in the `/opt/meilisearch` directory using the `nano` text editor:

```bash
nano docker-compose.yml
```

In the nano editor, type out or paste the following configuration (if your browser allows pasting into the console, use `Ctrl+Shift+V` or the console's paste tool):

```yaml
version: '3'
services:
  meilisearch:
    image: getmeili/meilisearch:v1.6
    environment:
      # Replace 'YOUR_MASTER_KEY' with a long, secure random string!
      - MEILI_MASTER_KEY=YOUR_MASTER_KEY 
      - MEILI_ENV=production
    ports:
      - "7700:7700"
    volumes:
      - ./meili_data:/meili_data
    restart: unless-stopped
```

To save and exit the nano editor:
1. Press `Ctrl + X`
2. Press `Y` to confirm you want to save
3. Press `Enter` to confirm the file name

## 5. Start Meilisearch

Run the container in detached mode:

```bash
docker compose up -d
```

Meilisearch is now running! To access it from your app, you will use your server's public IP address.

## 6. Find Your Server's IP Address

1. Go back to the **IONOS Cloud Panel** tab.
2. In the server details page, look for the **IP Address** section.
3. Copy the public IPv4 address.

## 7. App Configuration

Update your `.env.local` or Vercel environment variables in this Next.js project:

```env
MEILISEARCH_HOST=http://your_server_ip:7700
# Use the MEILI_MASTER_KEY you set in the docker-compose file.
MEILISEARCH_API_KEY=YOUR_MASTER_KEY
```

> [!NOTE]
> The app's `FoodService` will automatically detect the presence of `MEILISEARCH_HOST` and prioritise it over Open Food Facts for lightning-fast search!
