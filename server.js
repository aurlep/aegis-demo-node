// Aegis demo: Express + session login. Target for scanner pipelines.
const express = require("express");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || require("crypto").randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  }),
);

const USERS = { "demo@example.com": "demo1234" };
const ITEMS = [
  { id: 1, name: "Widget", price: 19.99 },
  { id: 2, name: "Gadget", price: 24.5 },
  { id: 3, name: "Sprocket", price: 8.75 },
];

const loginPage = (error) => `<!doctype html>
<title>Login</title>
<h1>Sign in</h1>
${error ? `<p style="color:red">${error}</p>` : ""}
<form method="post" action="/login">
  <label>Email <input name="email" type="email" required></label><br>
  <label>Password <input name="password" type="password" required></label><br>
  <button type="submit">Sign in</button>
</form>`;

app.get("/", (_req, res) => {
  res.send("<h1>Aegis demo (Node)</h1><a href='/login'>Sign in</a>");
});

app.get("/login", (_req, res) => res.send(loginPage(null)));

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (USERS[email] && USERS[email] === password) {
    req.session.email = email;
    return res.redirect("/dashboard");
  }
  return res.status(401).send(loginPage("Invalid credentials"));
});

const requireAuth = (req, res, next) => {
  if (!req.session.email) return res.redirect("/login");
  next();
};

app.get("/dashboard", requireAuth, (req, res) => {
  const rows = ITEMS.map((i) => `<li>${i.name} — $${i.price}</li>`).join("");
  res.send(`<!doctype html><title>Dashboard</title>
<h1>Welcome, ${req.session.email}</h1><ul>${rows}</ul>
<form method="post" action="/logout"><button>Sign out</button></form>`);
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

app.get("/api/items", (req, res) => {
  if (!req.session.email) return res.status(401).json({ error: "unauthorized" });
  res.json({ items: ITEMS });
});

/* ---------------------------------------------------------------------------
 * Token API. The form login above exercises ZAP's `browser` and `form` auth;
 * this exercises `json` auth with `headers` session management, which had no
 * target anywhere in the demo estate and so was never actually run.
 *
 * Deliberately a bearer token in a JSON body, under field names that are NOT
 * `username`/`password` -- guessing those was the bug this target exists to
 * catch.
 * ------------------------------------------------------------------------- */
const TOKENS = new Map();

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || USERS[email] !== password) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const token = require("crypto").randomBytes(24).toString("hex");
  TOKENS.set(token, email);
  res.json({ access_token: token, token_type: "Bearer", email });
});

const requireBearer = (req, res, next) => {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const email = TOKENS.get(token);
  if (!email) return res.status(401).json({ error: "unauthorized" });
  req.tokenEmail = email;
  next();
};

app.get("/api/v1/profile", requireBearer, (req, res) => {
  res.json({ email: req.tokenEmail, roles: ["user"] });
});

app.get("/api/v1/items", requireBearer, (_req, res) => res.json({ items: ITEMS }));

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`listening on ${PORT}`));
