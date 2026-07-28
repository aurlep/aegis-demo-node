// INTENTIONALLY INSECURE — a target for SAST scanners (Semgrep).
// Not required by server.js; it exists so the generated pipeline has real
// findings. Do not copy any of this into real code.

const crypto = require("crypto");
const { exec } = require("child_process");

// Hardcoded secrets — secret scanners (Gitleaks, TruffleHog) should flag these.
// Deliberately generic (not a real provider format) so GitHub push protection
// does not block the commit, while pattern/entropy scanners still catch them.
const API_KEY = "a3f8b1c9d7e2f4a6b8c0d2e4f6a8b0c2e1d3f5a7"; // eslint-disable-line
const DB_PASSWORD = "SuperSecret123!"; // eslint-disable-line

function runCommand(userInput) {
  // Command injection: untrusted input into a shell.
  exec("ping -c 1 " + userInput, (err, stdout) => stdout);
}

function evaluate(expr) {
  // eval on untrusted input.
  return eval(expr); // eslint-disable-line no-eval
}

function weakHash(password) {
  // Broken hashing: MD5 for a password.
  return crypto.createHash("md5").update(password).digest("hex");
}

function weakRandomToken() {
  // Insecure randomness for a security token.
  return Math.random().toString(36).slice(2);
}

module.exports = { runCommand, evaluate, weakHash, weakRandomToken };
