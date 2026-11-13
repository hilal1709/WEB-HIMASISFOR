import "server-only";
import Pusher from "pusher";

/**
 * Pusher sisi server. Kanal:
 *   site            — publik; event `refresh` { paths } → halaman terbuka memuat ulang data.
 *   private-admin   — admin; event `layanan:new`, `home:draft`, `home:published`.
 *   presence-studio — siapa yang sedang membuka Studio Beranda.
 * Tanpa kredensial (mis. dev lokal tanpa .env) semua siaran menjadi no-op.
 */
let client;
function pusher() {
  if (client !== undefined) return client;
  const { PUSHER_APP_ID: appId, PUSHER_SECRET: secret, NEXT_PUBLIC_PUSHER_KEY: key, NEXT_PUBLIC_PUSHER_CLUSTER: cluster } = process.env;
  client = appId && secret && key ? new Pusher({ appId, key, secret, cluster: cluster || "ap1", useTLS: true }) : null;
  return client;
}

/** Kirim event; kegagalan jaringan tidak pernah menggagalkan request utama. */
export async function broadcast(channel, event, data = {}, socketId) {
  const p = pusher();
  if (!p) return false;
  try {
    await p.trigger(channel, event, data, socketId ? { socket_id: socketId } : undefined);
    return true;
  } catch (error) {
    console.error("[realtime]", channel, event, error?.message ?? error);
    return false;
  }
}

/** Beritahu pengunjung bahwa path tertentu punya data baru. */
export const refreshSite = (paths) => broadcast("site", "refresh", { paths, at: Date.now() });

export function authorizeChannel(socketId, channel, user) {
  const p = pusher();
  if (!p) return null;
  if (channel.startsWith("presence-")) {
    return p.authorizeChannel(socketId, channel, {
      user_id: String(user.id ?? user.email ?? user.name),
      user_info: { name: user.name || user.email || "Admin" },
    });
  }
  return p.authorizeChannel(socketId, channel);
}
