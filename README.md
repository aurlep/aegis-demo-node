# aegis-demo-node

Express + session login. Target for Aegis-generated scanner pipelines.

## Run

```bash
npm install
npm start
# open http://localhost:3000/login
# demo creds: demo@example.com / demo1234
```

## Endpoints

- `GET /` — public landing
- `GET /login` / `POST /login` — form auth
- `GET /dashboard` — requires session
- `GET /api/items` — requires session
- `POST /logout`
- `GET /healthz`
