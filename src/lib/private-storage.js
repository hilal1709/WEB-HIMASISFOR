const cleanName = (name) => String(name || "dokumen").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100);

export async function uploadPrivateFiles(folder, files) {
  const url = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_SCHOLARSHIP_BUCKET || "scholarship-applications";
  if (!files.length) return [];
  if (!url || !key) throw new Error("Supabase Storage belum dikonfigurasi.");
  const uploaded = [];
  for (const file of files) {
    if (!file || typeof file === "string" || file.size === 0) continue;
    if (file.size > 10 * 1024 * 1024) throw new Error("Setiap berkas maksimal 10 MB.");
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) throw new Error("Berkas harus PDF, JPG, atau PNG.");
    const path = `${folder}/${Date.now()}-${cleanName(file.name)}`;
    const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": file.type, "x-upsert": "false" },
      body: Buffer.from(await file.arrayBuffer()),
    });
    if (!response.ok) throw new Error("Gagal mengunggah berkas ke penyimpanan privat.");
    uploaded.push({ path, name: file.name, type: file.type, size: file.size });
  }
  return uploaded;
}

export async function createPrivateSignedUrl(path, expiresIn = 300) {
  const url = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_SCHOLARSHIP_BUCKET || "scholarship-applications";
  if (!url || !key || !path) throw new Error("Penyimpanan privat belum dikonfigurasi.");
  const response = await fetch(`${url}/storage/v1/object/sign/${bucket}/${encodeURIComponent(path).replace(/%2F/g, "/")}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn }),
  });
  if (!response.ok) throw new Error("Gagal membuat tautan berkas.");
  const result = await response.json();
  if (!result?.signedURL) throw new Error("Tautan berkas tidak tersedia.");
  if (String(result.signedURL).startsWith("http")) return result.signedURL;
  return `${url}${String(result.signedURL).startsWith("/storage/v1") ? "" : "/storage/v1"}${result.signedURL}`;
}
