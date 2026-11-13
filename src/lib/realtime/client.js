"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Pusher sisi klien (dimuat malas agar tidak membebani bundel awal).
 *   useChannel("site", { refresh: (d) => … })
 *   usePresence("presence-studio") → { members, me }
 */
let instance;
let loading;

export function getPusher() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  if (typeof window === "undefined" || !key) return Promise.resolve(null);
  if (instance) return Promise.resolve(instance);
  loading ??= import("pusher-js").then(({ default: Pusher }) => {
    instance = new Pusher(key, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
      channelAuthorization: { endpoint: "/api/pusher/auth", transport: "ajax" },
    });
    return instance;
  });
  return loading;
}

/** Socket id koneksi ini — dikirim ke API agar pengirim tidak menerima event miliknya sendiri. */
export const socketId = () => instance?.connection?.socket_id ?? null;

export function useChannel(name, handlers, enabled = true) {
  const ref = useRef(handlers);
  ref.current = handlers;
  useEffect(() => {
    if (!enabled || !name) return;
    let channel;
    let alive = true;
    const bound = [];
    getPusher().then((p) => {
      if (!p || !alive) return;
      channel = p.channel(name) ?? p.subscribe(name);
      for (const ev of Object.keys(ref.current)) {
        const fn = (data) => ref.current[ev]?.(data);
        channel.bind(ev, fn);
        bound.push([ev, fn]);
      }
    });
    return () => {
      alive = false;
      bound.forEach(([ev, fn]) => channel?.unbind(ev, fn));
    };
  }, [name, enabled]);
}

/** Status koneksi: "connecting" | "connected" | "unavailable" | "off". */
export function useConnection() {
  const [state, setState] = useState("connecting");
  useEffect(() => {
    let p;
    const on = ({ current }) => setState(current);
    getPusher().then((x) => {
      p = x;
      if (!p) return setState("off");
      setState(p.connection.state);
      p.connection.bind("state_change", on);
    });
    return () => p?.connection.unbind("state_change", on);
  }, []);
  return state;
}

export function usePresence(name, enabled = true) {
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    let channel;
    let alive = true;
    const sync = () => {
      if (!channel?.members) return;
      const list = [];
      channel.members.each((m) => list.push({ id: m.id, ...m.info }));
      setMembers(list);
      setMe(channel.members.me?.id ?? null);
    };
    getPusher().then((p) => {
      if (!p || !alive) return;
      channel = p.subscribe(name);
      channel.bind("pusher:subscription_succeeded", sync);
      channel.bind("pusher:member_added", sync);
      channel.bind("pusher:member_removed", sync);
    });
    return () => {
      alive = false;
      if (channel) {
        channel.unbind("pusher:subscription_succeeded", sync);
        channel.unbind("pusher:member_added", sync);
        channel.unbind("pusher:member_removed", sync);
        instance?.unsubscribe(name);
      }
    };
  }, [name, enabled]);
  return { members, me };
}
