import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).send("Method Not Allowed");
    }

    const { token } = req.query || {};
    if (!token) return res.status(400).send("Missing token");

    const secret = process.env.DONATION_SSO_SECRET;
    if (!secret) return res.status(500).send("SSO not configured");

    // Verify signature and claims
    const payload = jwt.verify(token, secret);
    if (payload.iss !== "main-app" || payload.aud !== "donation-app") {
      return res.status(403).send("Invalid token claims");
    }

    // Optional: check roles in payload
    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const allowed = new Set(["ADMIN", "RELF_EMPLOYEE", "FACILITATOR", "TUTOR"]);
    const isAllowed = roles.some((r) => allowed.has(r));
    if (!isAllowed) return res.status(403).send("Forbidden");

    // Set a short-lived HTTP-only cookie (server-trusted session)
    // If your SPA’s ProtectedRoute checks a cookie, use that; else, redirect to a route that sets localStorage.
    // Example: use a short cookie just to pass the gate; frontend can also read a subsequent page parameter.
    res.setHeader("Set-Cookie", [
      // Cookie for ~5 minutes
      `relf_admin=true; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${
        5 * 60
      }`,
    ]);

    // Redirect to the dashboard
    return res.redirect(302, "/admin/sso-ok");
  } catch (e) {
    console.error("SSO error:", e);
    return res.status(401).send("Invalid or expired token");
  }
}
