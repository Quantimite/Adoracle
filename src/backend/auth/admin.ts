// src/backend/auth/admin.ts
// The "site admin" is whoever deployed Adoracle. They see the one-time platform setup guide.
// Set ADMIN_EMAILS="you@example.com,other@example.com". If it is not set, everyone is treated as admin
// (fine while you are the only user, set it before inviting others).
export function isSiteAdmin(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!list.length) return true;
  return !!email && list.includes(email.toLowerCase());
}
