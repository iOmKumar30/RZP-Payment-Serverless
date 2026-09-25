export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader(
    "Set-Cookie",
    "relf_admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
  );
  return res.status(204).end();
}
