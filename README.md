# env
NODE_ENV=development
PORT=3050
SESSION_SECRET=sessionkey

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=1234
DB_DATABASE=server

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
SESSION_COOKIE_SECURE=false
# run
docker compose up -d
docker compose ps
npm run start