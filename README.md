# Facility Management System (FacMan)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), using Prisma, PostgreSQL, and Material UI. It is fully containerized and runs in Docker.

## Getting Started (Docker)

### 1. Build and Run with Docker Compose

```bash
docker-compose up --build
```
- This will start both the app (Next.js) and the database (PostgreSQL) in containers.
- The app will be available at [http://localhost:3000](http://localhost:3000)

### 2. Seed the Database (Initial Data)
seed script is located at:
✅ prisma/seed.mjs

After the containers are running, seed the database with initial data (admin user, facilities, announcement):

```bash
docker-compose exec app npm run seed
```
- Default admin login: `admin@facman.com` / `admin123`

### 3. Access Prisma Studio (Database GUI)
To visually browse and edit your database:

1. Make sure port 5555 is exposed in your `docker-compose.yml` under the `app` service:
   ```yaml
   ports:
     - "3000:3000"
     - "5555:5555"
   ```
2. Start Prisma Studio:
   ```bash
   docker-compose exec app npx prisma studio --hostname 0.0.0.0
   ```

   Option: Run with nohup (best for persistent background)
   ```bash
   docker compose exec app nohup npx prisma studio &
   ```
   
   
4. Open [http://localhost:5555](http://localhost:5555) in your browser.

---

## Development (Non-Docker)
If you want to run locally (not in Docker):

```bash
npm install
npm run dev
```

---

## Project Structure
- **Next.js** app in `/src`
- **Prisma** schema in `/prisma/schema.prisma`
- **Seed script** in `/prisma/seed.mjs`
- **Docker** config in `Dockerfile` and `docker-compose.yml`

---

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## Notes
- All data is stored in the Dockerized PostgreSQL database. If you restart containers, your data persists in the Docker volume (`db_data`).
- To reset the database, you can remove the volume: `docker-compose down -v`
- For any issues, check logs with `docker-compose logs app` or `docker-compose logs db`.
