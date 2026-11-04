/**
 * Registry ikon Sisfor DS.
 *
 * Setiap ikon punya fallback lucide (selalu tersedia) dan slot `lordicon`.
 * Untuk mengaktifkan animasi Lordicon: unduh ikon (format Lottie JSON) dari
 * https://lordicon.com, simpan di `public/icons/lordicon/<nama>.json`, lalu
 * isi `lordicon: "/icons/lordicon/<nama>.json"` (atau URL CDN https://cdn.lordicon.com/<id>.json).
 * Selama `lordicon` masih null, komponen <AppIcon> menampilkan ikon lucide.
 */
import {
  LayoutDashboard, FileText, UserSquare2, Trophy, Images, BookOpen, FolderOpen,
  LogOut, Trash2, Pencil, Plus, Upload, Copy, Search, Globe, Palette, Bell,
  CheckCircle2, AlertTriangle, Info, XCircle, Menu, X, Eye, Save, RefreshCw,
} from "lucide-react";

export const ICONS = {
  dashboard: { fallback: LayoutDashboard, lordicon: null },
  content: { fallback: FileText, lordicon: null },
  profile: { fallback: UserSquare2, lordicon: null },
  trophy: { fallback: Trophy, lordicon: null },
  gallery: { fallback: Images, lordicon: null },
  book: { fallback: BookOpen, lordicon: null },
  media: { fallback: FolderOpen, lordicon: null },
  logout: { fallback: LogOut, lordicon: null },
  trash: { fallback: Trash2, lordicon: null },
  edit: { fallback: Pencil, lordicon: null },
  plus: { fallback: Plus, lordicon: null },
  upload: { fallback: Upload, lordicon: null },
  copy: { fallback: Copy, lordicon: null },
  search: { fallback: Search, lordicon: null },
  globe: { fallback: Globe, lordicon: null },
  palette: { fallback: Palette, lordicon: null },
  bell: { fallback: Bell, lordicon: null },
  success: { fallback: CheckCircle2, lordicon: null },
  warning: { fallback: AlertTriangle, lordicon: null },
  info: { fallback: Info, lordicon: null },
  error: { fallback: XCircle, lordicon: null },
  menu: { fallback: Menu, lordicon: null },
  close: { fallback: X, lordicon: null },
  eye: { fallback: Eye, lordicon: null },
  save: { fallback: Save, lordicon: null },
  refresh: { fallback: RefreshCw, lordicon: null },
};
