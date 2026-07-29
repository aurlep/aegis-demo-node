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

### Cookie session (form login)

- `GET /` — public landing
- `GET /login` / `POST /login` — form auth, fields named `email` / `password`
- `GET /dashboard` — requires session
- `GET /api/items` — requires session
- `POST /logout`
- `GET /healthz`

### Token API (bearer)

Exists so ZAP's `json` authentication and `headers` session management have a
target — the cookie login above only exercises `browser` and `form`.

- `POST /api/auth/login` — `{"email": "...", "password": "..."}` → `{"access_token": "..."}`
- `GET /api/v1/profile` — requires `Authorization: Bearer <token>`
- `GET /api/v1/items` — requires `Authorization: Bearer <token>`

Note the credential fields are `email`/`password`, not `username`/`password`.
That is on purpose: a DAST config that assumes the latter authenticates against
nothing and scans only the public surface, without reporting an error.

Aegis DAST config for this target:

| field | value |
|---|---|
| Authentication method | `json` |
| Session | `headers` |
| Login path | `/login` |
| Credential POST path | `/api/auth/login` |
| Username field | `email` |
| Password field | `password` |
| Session header | `Authorization` |
| Header value | `Bearer {%json:access_token%}` |
