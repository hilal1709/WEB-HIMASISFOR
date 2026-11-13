"""
Generator ilustrasi Lottie buatan tangan untuk beranda Kampus v3 (SISFOR UISI).

Pemakaian:  python scripts/lottie/build.py            → menulis semua JSON ke public/lottie/
Palet:      "light" (garis navy, aksen maroon & emas — untuk latar cream/putih)
            "dark"  (garis putih, aksen emas — untuk latar maroon/navy), file berakhiran -dark.json
Aturan:     warna solid saja (tanpa gradien), 260×260, 30 fps, loop 4 detik.
Animasi:    garis digambar (trim path), bentuk "pop" (scale), gerak posisi/rotasi, lalu memudar di akhir loop.
"""
import json
import math
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "lottie")
FR, OP, SIZE = 30, 120, 260


def rgb(h, a=1):
    h = h.lstrip("#")
    return [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)] + [a]


PALETTES = {
    "light": dict(line=rgb("#14213D"), a1=rgb("#6E1423"), a2=rgb("#C9A227"), soft=rgb("#C9A227"), soft_op=18, base=rgb("#FFFFFF")),
    "dark": dict(line=rgb("#FFFFFF"), a1=rgb("#C9A227"), a2=rgb("#E6D3A1"), soft=rgb("#FFFFFF"), soft_op=14, base=rgb("#4E0E19")),
}

EO, EI = {"x": [0.33], "y": [0]}, {"x": [0.2], "y": [1]}
LO, LI = {"x": [0.0], "y": [0.0]}, {"x": [1.0], "y": [1.0]}


# ---------- primitif ----------
def st(v):
    return {"a": 0, "k": v}


def anim(keys, linear=False):
    k = []
    for idx, (t, v) in enumerate(keys):
        e = {"t": t, "s": v if isinstance(v, list) else [v]}
        if idx < len(keys) - 1:
            e["o"], e["i"] = (LO, LI) if linear else (EO, EI)
        k.append(e)
    return {"a": 1, "k": k}


def prop(v):
    return v if isinstance(v, dict) else st(list(v) if isinstance(v, (tuple, list)) else v)


def tr(p=(0, 0), a=(0, 0), s=(100, 100), r=0, o=100):
    return {"ty": "tr", "p": prop(p), "a": prop(a), "s": prop(s), "r": prop(r), "o": prop(o), "sk": st(0), "sa": st(0)}


def group(items, name="g", **t):
    return {"ty": "gr", "nm": name, "it": items + [tr(**t)]}


def path(pts, closed=False, ins=None, outs=None):
    n = len(pts)
    z = [[0, 0]] * n
    return {"ty": "sh", "ks": st({"i": ins or z, "o": outs or z, "v": [list(p) for p in pts], "c": closed})}


def arc(cx, cy, r, a0, a1, steps=12):
    """Busur sebagai polyline halus (derajat, 0 = kanan, searah jarum jam)."""
    pts = []
    for k in range(steps + 1):
        a = math.radians(a0 + (a1 - a0) * k / steps)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def stroke(c, w=4, op=100):
    return {"ty": "st", "c": st(c), "o": st(op), "w": st(w), "lc": 2, "lj": 2}


def fill(c, op=100):
    return {"ty": "fl", "c": st(c), "o": st(op), "r": 1}


def rect(w, h, cx, cy, r=6):
    return {"ty": "rc", "d": 1, "s": st([w, h]), "p": st([cx, cy]), "r": st(r)}


def ellipse(w, h, x, y):
    return {"ty": "el", "d": 1, "s": st([w, h]), "p": st([x, y])}


def trim(t0, t1, end=100):
    return {"ty": "tm", "s": st(0), "e": anim([(t0, 0), (t1, end)]), "o": st(0), "m": 1}


def pop(t0, dur=14):
    return anim([(t0, [0, 0]), (t0 + dur, [108, 108]), (t0 + dur + 6, [100, 100])])


def layer(shapes, ind=1):
    return {
        "ddd": 0, "ind": ind, "ty": 4, "nm": f"l{ind}", "sr": 1,
        "ks": {"o": anim([(0, 0), (6, 100), (OP - 12, 100), (OP, 0)]), "r": st(0), "p": st([0, 0, 0]), "a": st([0, 0, 0]), "s": st([100, 100, 100])},
        "ao": 0, "shapes": shapes, "ip": 0, "op": OP, "st": 0, "bm": 0,
    }


def doc(name, shapes):
    # urutan: shape pertama tergambar paling atas → balik agar daftar ditulis dari belakang ke depan
    return {"v": "5.7.4", "fr": FR, "ip": 0, "op": OP, "w": SIZE, "h": SIZE, "nm": name, "ddd": 0, "assets": [], "layers": [layer(list(reversed(shapes)))]}


# ---------- ilustrasi (fungsi(P) → daftar shape dari belakang ke depan) ----------
def erp_nodes(P):
    hub, nodes = (130, 130), [(56, 64), (204, 64), (56, 196), (204, 196)]
    s = [group([rect(220, 220, 130, 130, 40), fill(P["soft"], P["soft_op"])], "bg", s=pop(0, 16))]
    for i, (x, y) in enumerate(nodes):
        t0 = 12 + i * 7
        s.append(group([path([hub, (x, y)]), stroke(P["line"], 3, 55), trim(t0, t0 + 18)], f"link{i}"))
    for i, (x, y) in enumerate(nodes):
        t0 = 26 + i * 7
        s.append(group([rect(62, 42, 0, 0, 10), fill(P["base"]), stroke(P["line"], 3)], f"node{i}", p=(x, y), s=pop(t0)))
        s.append(group([path([(-16, -4), (16, -4)]), path([(-16, 6), (6, 6)]), stroke(P["a2"] if i % 2 else P["line"], 3), trim(t0 + 10, t0 + 22)], f"txt{i}", p=(x, y)))
    s.append(group([ellipse(40, 40, 0, 0), fill(P["a1"])], "hub", p=hub, s=pop(2, 12)))
    s.append(group([ellipse(14, 14, 0, 0), fill(P["base"])], "hubdot", p=hub, s=pop(10, 10)))
    return s


def lecturer(P):
    s = [group([rect(124, 84, 160, 92, 8), fill(P["soft"], P["soft_op"] + 6)], "boardbg", s=pop(0, 14), a=(160, 92), p=(160, 92))]
    s.append(group([rect(124, 84, 160, 92, 8), stroke(P["line"], 3.5), trim(0, 22)], "board"))
    s.append(group([path([(160, 134), (160, 160)]), path([(140, 172), (160, 160), (180, 172)]), stroke(P["line"], 3.5), trim(14, 28)], "stand"))
    s.append(group([path([(112, 118), (136, 98), (154, 108), (178, 78), (204, 88)]), stroke(P["a1"], 4), trim(24, 52)], "chart"))
    s.append(group([ellipse(12, 12, 0, 0), fill(P["a2"])], "dot", p=(204, 88), s=pop(50, 10)))
    s.append(group([path([(112, 66), (146, 66)]), path([(112, 76), (132, 76)]), stroke(P["line"], 3, 60), trim(18, 34)], "text"))
    s.append(group([ellipse(30, 30, 62, 104), stroke(P["line"], 3.5), fill(P["base"]), trim(8, 22)], "head"))
    s.append(group([path([(38, 214), (38, 156), (62, 134), (86, 156), (86, 214)]), stroke(P["line"], 3.5), trim(12, 34)], "body"))
    s.append(group([path([(80, 150), (112, 120)]), stroke(P["a1"], 4), trim(30, 40)], "arm",
                   r=anim([(40, 0), (54, -6), (68, 0), (82, -6), (96, 0)]), a=(80, 150), p=(80, 150)))
    s.append(group([path([(20, 214), (240, 214)]), stroke(P["line"], 2.5, 35), trim(0, 18)], "floor"))
    return s


def industry(P):
    s = [group([path([(16, 206), (244, 206)]), stroke(P["line"], 2.5, 35), trim(0, 16)], "ground")]
    s.append(group([rect(26, 88, 44, 162, 4), fill(P["soft"], P["soft_op"] + 6), stroke(P["line"], 3.5), trim(4, 26)], "silo1"))
    s.append(group([rect(26, 70, 76, 171, 4), fill(P["soft"], P["soft_op"] + 6), stroke(P["line"], 3.5), trim(8, 28)], "silo2"))
    s.append(group([path([(96, 206), (96, 150), (116, 138), (116, 150), (136, 138), (136, 206)]), stroke(P["line"], 3.5), trim(12, 32)], "plant"))
    s.append(group([path([(104, 150), (104, 102), (114, 102), (114, 144)]), stroke(P["line"], 3.5), trim(16, 30)], "chimney"))
    for k in range(3):
        t0 = 30 + k * 16
        s.append(group([ellipse(14 + k * 4, 14 + k * 4, 0, 0), fill(P["line"], 25)], f"smoke{k}",
                       p=anim([(t0, [109, 96]), (t0 + 40, [118 + k * 6, 46])]), o=anim([(t0, 0), (t0 + 8, 100), (t0 + 40, 0)])))
    s.append(group([rect(58, 38, 194, 156, 4), fill(P["base"]), stroke(P["line"], 3.5), trim(18, 36)], "screen"))
    s.append(group([path([(160, 182), (228, 182), (222, 192), (166, 192)], closed=True), fill(P["line"], 90)], "kbd", s=pop(34, 10), a=(194, 186), p=(194, 186)))
    s.append(group([path([(178, 164), (188, 154), (196, 160), (210, 146)]), stroke(P["a1"], 3.5), trim(40, 56)], "trend"))
    s.append(group([path([(140, 150), (152, 132), (166, 128)]), stroke(P["a2"], 3, 80), trim(44, 60)], "link"))
    s.append(group([ellipse(10, 10, 0, 0), fill(P["a2"])], "packet", p=anim([(56, [140, 150]), (70, [152, 132]), (84, [166, 128])]), s=pop(54, 6)))
    return s


def grad_path(P):
    steps = [(24, 214), (78, 214), (78, 168), (132, 168), (132, 122), (186, 122), (186, 76)]
    s = [group([path([(14, 216), (246, 216)]), stroke(P["line"], 2.5, 35), trim(0, 16)], "ground")]
    s.append(group([path([(24, 216), (78, 216), (78, 170), (132, 170), (132, 124), (186, 124), (186, 216)], closed=True), fill(P["soft"], P["soft_op"] + 6)], "fill", o=anim([(20, 0), (50, 100)])))
    s.append(group([path(steps), stroke(P["line"], 4), trim(4, 54)], "stairs"))
    s.append(group([path([(186, 76), (186, 26)]), stroke(P["line"], 4), trim(54, 64)], "pole"))
    s.append(group([path([(186, 26), (230, 26), (219, 39), (230, 52), (186, 52)], closed=True), fill(P["a1"])], "flag", a=(186, 39), p=(186, 39), s=anim([(62, [0, 100]), (76, [100, 100])])))
    s.append(group([ellipse(16, 16, 0, 0), fill(P["a2"])], "walker",
                   p=anim([(10, [50, 202]), (24, [104, 156]), (40, [158, 110]), (56, [176, 108])]), s=pop(8, 8)))
    return s


def shield_audit(P):
    shield = [(130, 30), (204, 56), (198, 132), (130, 220), (62, 132), (56, 56)]
    s = [group([path(shield, closed=True), fill(P["soft"], P["soft_op"] + 8)], "shieldbg", s=pop(0, 16), a=(130, 120), p=(130, 120))]
    s.append(group([path(shield, closed=True), stroke(P["line"], 4), trim(0, 30)], "shield"))
    s.append(group([path(arc(130, 112, 22, 180, 360, 10)), stroke(P["a2"], 6)], "shackle", p=anim([(30, [0, -14]), (60, [0, -14]), (70, [0, 0])])))
    s.append(group([rect(66, 52, 130, 142, 8), fill(P["a1"])], "lock", s=pop(34, 12), a=(130, 142), p=(130, 142)))
    s.append(group([ellipse(12, 12, 130, 136), path([(130, 140), (130, 154)]), fill(P["base"]), stroke(P["base"], 4)], "key", s=pop(64, 8), a=(130, 144), p=(130, 144)))
    return s


def _gear(P, cx, cy, r, teeth, color, rot_dir, t0):
    items = []
    for k in range(teeth):
        items.append(group([rect(r * 0.42, r * 0.5, 0, -r, 3), fill(color)], f"tooth{k}", r=360 / teeth * k))
    items.append(group([ellipse(r * 2, r * 2, 0, 0), fill(color)], "body"))
    items.append(group([ellipse(r * 0.7, r * 0.7, 0, 0), fill(P["base"])], "hole"))
    return group(items, "gear", p=(cx, cy), s=pop(t0, 14), r=anim([(0, 0), (OP, 360 * rot_dir)], linear=True))


def erp_gears(P):
    s = [group([ellipse(200, 200, 130, 130), fill(P["soft"], P["soft_op"])], "bg", s=pop(0, 16), a=(130, 130), p=(130, 130))]
    s.append(_gear(P, 104, 116, 46, 10, P["line"], 1, 4))
    s.append(_gear(P, 172, 176, 30, 8, P["a1"], -1.5, 14))
    s.append(group([path([(40, 214), (220, 214)]), stroke(P["a2"], 4), trim(20, 44)], "line"))
    return s


def data_chart(P):
    s = [group([path([(24, 214), (236, 214)]), stroke(P["line"], 2.5, 40), trim(0, 14)], "base")]
    heights = [56, 92, 72, 126, 160]
    for i, h in enumerate(heights):
        x, t0 = 46 + i * 42, 6 + i * 5
        last = i == len(heights) - 1
        s.append(group([rect(26, h, 0, -h / 2, 6), fill(P["a1"] if last else P["soft"], 100 if last else P["soft_op"] + 30)], f"bar{i}", p=(x, 212), s=anim([(t0, [100, 0]), (t0 + 22, [100, 100])])))
    pts = [(46, 146), (88, 112), (130, 124), (172, 82), (214, 46)]
    s.append(group([path(pts), stroke(P["line"], 3.5), trim(28, 64)], "trend"))
    s.append(group([ellipse(16, 16, 0, 0), fill(P["a2"])], "dot", p=(214, 46), s=pop(62, 10)))
    return s


def strategy_target(P):
    s = []
    for k, (d, col) in enumerate([(190, P["line"]), (128, P["line"]), (66, P["line"])]):
        s.append(group([ellipse(d, d, 118, 140), stroke(col, 3.5), trim(k * 8, k * 8 + 24)], f"ring{k}"))
    s.append(group([ellipse(150, 150, 118, 140), fill(P["soft"], P["soft_op"])], "ringfill", s=pop(4, 16), a=(118, 140), p=(118, 140)))
    s.append(group([ellipse(30, 30, 118, 140), fill(P["a1"])], "bull", s=pop(30, 10), a=(118, 140), p=(118, 140)))
    arrow = group([path([(0, 0), (70, -56)]), stroke(P["line"], 4),
                   ], "shaft")
    head = group([path([(0, 0), (16, 2), (4, -12)], closed=True), fill(P["line"])], "head")
    fletch = group([path([(70, -56), (86, -54), (76, -46)], closed=True), path([(70, -56), (68, -72), (60, -62)], closed=True), fill(P["a2"])], "fletch")
    s.append(group([arrow, head, fletch], "arrow",
                   p=anim([(36, [250, 30]), (54, [120, 138]), (120, [120, 138])]),
                   r=anim([(54, 0), (60, -4), (66, 2), (72, 0)])))
    return s


def badge(P):
    s = []
    for k, (x0, x1) in enumerate([(108, 84), (152, 176)]):
        s.append(group([path([(x0, 150), (x1, 226), (x1 + (10 if k else -10), 206), (x1 + (28 if k else -28), 214), (x0 + (20 if k else -20), 150)], closed=True), fill(P["a1"])], f"ribbon{k}",
                       p=anim([(26, [0, -40]), (44, [0, 0])]), o=anim([(26, 0), (34, 100)])))
    teeth = []
    for k in range(16):
        a = math.radians(360 / 16 * k)
        teeth.append((130 + 70 * math.cos(a), 104 + 70 * math.sin(a)))
        a2 = math.radians(360 / 16 * k + 11.25)
        teeth.append((130 + 60 * math.cos(a2), 104 + 60 * math.sin(a2)))
    s.append(group([path(teeth, closed=True), fill(P["soft"], P["soft_op"] + 10)], "rosettebg", s=pop(0, 16), a=(130, 104), p=(130, 104)))
    s.append(group([path(teeth, closed=True), stroke(P["line"], 3), trim(0, 30)], "rosette"))
    s.append(group([ellipse(84, 84, 130, 104), fill(P["a2"])], "core", s=pop(20, 14), a=(130, 104), p=(130, 104)))
    s.append(group([ellipse(60, 60, 130, 104), stroke(P["base"], 3), trim(34, 50)], "inner"))
    s.append(group([path([(110, 112), (130, 86), (150, 112)]), path([(118, 102), (142, 102)]), stroke(P["base"], 5)], "A", s=pop(46, 10), a=(130, 100), p=(130, 100)))
    return s


def trophy(P):
    cup = [(82, 52), (178, 52), (172, 104), (150, 134), (110, 134), (88, 104)]
    s = [group([path(cup, closed=True), fill(P["a2"])], "cupfill", o=anim([(20, 0), (40, 100)]))]
    s.append(group([path(cup, closed=True), stroke(P["line"], 4), trim(0, 26)], "cup"))
    s.append(group([path(arc(82, 80, 24, 90, 270, 10)), stroke(P["line"], 4), trim(24, 36)], "hl"))
    s.append(group([path(arc(178, 80, 24, -90, 90, 10)), stroke(P["line"], 4), trim(24, 36)], "hr"))
    s.append(group([path([(130, 134), (130, 170)]), stroke(P["line"], 5), trim(30, 40)], "stem"))
    s.append(group([rect(84, 16, 130, 178, 4), fill(P["a1"])], "plinth", s=pop(36, 10), a=(130, 178), p=(130, 178)))
    s.append(group([rect(110, 22, 130, 204, 5), fill(P["line"], 90)], "base", s=pop(40, 10), a=(130, 204), p=(130, 204)))
    s.append(group([path([(106, 70), (114, 64)]), stroke(P["base"], 4, 70)], "glint", o=anim([(44, 0), (52, 100)])))
    return [group(s, "all", s=anim([(56, [100, 100]), (64, [104, 96]), (72, [98, 103]), (80, [100, 100])]), a=(130, 210), p=(130, 210))]


def medal(P):
    """Medali berpita: pita V jatuh dari atas, cakram pop, bintang tergambar lalu berkilau."""
    s = [group([path([(92, 34), (118, 34), (142, 112), (116, 112)], closed=True), fill(P["a1"])], "rib-l",
               p=anim([(0, [0, -60]), (16, [0, 4]), (22, [0, 0])]))]
    s.append(group([path([(168, 34), (142, 34), (118, 112), (144, 112)], closed=True), fill(P["line"], 85)], "rib-r",
                   p=anim([(4, [0, -60]), (20, [0, 4]), (26, [0, 0])])))
    s.append(group([ellipse(96, 96, 130, 160), fill(P["a2"])], "disc", s=pop(20, 12), a=(130, 160), p=(130, 160)))
    s.append(group([ellipse(72, 72, 130, 160), stroke(P["base"], 4, 80), trim(30, 46)], "ring"))
    star = []
    for k in range(10):
        r = 24 if k % 2 == 0 else 10
        a = math.radians(-90 + k * 36)
        star.append((130 + r * math.cos(a), 160 + r * math.sin(a)))
    s.append(group([path(star, closed=True), stroke(P["line"], 3.5), trim(40, 58)], "star"))
    s.append(group([path(star, closed=True), fill(P["base"])], "starfill", o=anim([(56, 0), (64, 100)])))
    for k, (x, y) in enumerate([(70, 120), (196, 134), (186, 212)]):
        s.append(group([path([(x - 7, y), (x + 7, y)]), stroke(P["a2"], 3.5), path([(x, y - 7), (x, y + 7)]), stroke(P["a2"], 3.5)], f"spark{k}",
                       s=anim([(62 + k * 6, [0, 0]), (70 + k * 6, [120, 120]), (80 + k * 6, [0, 0])]), a=(x, y), p=(x, y)))
    return [group(s, "all", r=anim([(64, 0), (74, -5), (84, 4), (94, 0)]), a=(130, 34), p=(130, 34))]


def calendar(P):
    s = [group([rect(176, 170, 130, 138, 14), fill(P["base"]), stroke(P["line"], 3.5), trim(0, 24)], "frame")]
    s.append(group([rect(176, 40, 130, 73, 12), fill(P["a1"])], "head", s=anim([(14, [100, 0]), (26, [100, 100])]), a=(130, 53), p=(130, 53)))
    for k, x in enumerate([92, 168]):
        s.append(group([rect(10, 30, x, 54, 5), fill(P["line"])], f"ring{k}", s=pop(20 + k * 4, 10), a=(x, 54), p=(x, 54)))
    cells = []
    for r in range(3):
        for c in range(5):
            cells.append((70 + c * 30, 126 + r * 30))
    for k, (x, y) in enumerate(cells):
        s.append(group([rect(16, 12, x, y, 3), fill(P["line"], 22)], f"c{k}", s=pop(24 + k * 1.5, 8), a=(x, y), p=(x, y)))
    s.append(group([ellipse(30, 30, 130, 156), stroke(P["a1"], 4), trim(54, 72)], "mark"))
    s.append(group([rect(16, 12, 130, 156, 3), fill(P["a2"])], "today", s=pop(66, 8), a=(130, 156), p=(130, 156)))
    s.append(group([rect(176, 40, 130, 73, 12), fill(P["a1"], 70)], "flip", s=anim([(80, [100, 100]), (92, [100, 0])]), a=(130, 53), p=(130, 53), o=anim([(80, 0), (82, 100), (92, 0)])))
    return s


def grad_cap(P):
    board = [(130, 70), (222, 104), (130, 138), (38, 104)]
    cap = group([
        group([path([(84, 118), (84, 160), (130, 176), (176, 160), (176, 118)]), fill(P["line"])], "crown"),
        group([path(board, closed=True), fill(P["a1"])], "board"),
        group([path(board, closed=True), stroke(P["line"], 3)], "edge"),
        group([ellipse(12, 12, 130, 104), fill(P["a2"])], "button"),
        group([path([(130, 104), (194, 116), (194, 150)]), stroke(P["a2"], 4), group([rect(12, 18, 194, 156, 3), fill(P["a2"])], "tuft")], "tassel",
              r=anim([(20, 0), (34, 10), (48, -6), (62, 6), (76, 0)]), a=(194, 116), p=(194, 116)),
    ], "cap",
        p=anim([(0, [0, 40]), (24, [0, -34]), (44, [0, 6]), (54, [0, 0])]),
        r=anim([(0, -8), (24, 6), (44, -2), (54, 0)]))
    shadow = group([ellipse(120, 16, 130, 222), fill(P["line"], 18)], "shadow", s=anim([(0, [100, 100]), (24, [60, 60]), (44, [104, 104]), (54, [100, 100])]), a=(130, 222), p=(130, 222))
    return [shadow, cap]


def rocket_pmb(P):
    s = [group([rect(92, 122, 70, 140, 10), fill(P["base"]), stroke(P["line"], 3.5), trim(0, 20)], "form")]
    for k in range(4):
        y = 102 + k * 22
        s.append(group([path([(42, y), (98 - (k % 2) * 18, y)]), stroke(P["line"], 3, 50), trim(10 + k * 4, 22 + k * 4)], f"ln{k}"))
    s.append(group([rect(58, 18, 70, 186, 6), fill(P["a1"])], "btn", s=pop(28, 10), a=(70, 186), p=(70, 186)))
    trail = [(118, 150), (150, 128), (176, 136), (196, 104), (222, 60)]
    s.append(group([path(trail), stroke(P["a2"], 3, 70), trim(36, 70)], "trail"))
    plane = group([path([(0, 0), (34, 12), (8, 18)], closed=True), fill(P["line"]), path([(8, 18), (34, 12), (14, 26)], closed=True), fill(P["a1"])], "plane", a=(17, 13), p=(17, 13))
    s.append(group([plane], "mover",
                   p=anim([(34, [118, 150]), (46, [150, 128]), (56, [176, 136]), (64, [196, 104]), (72, [222, 60]), (120, [222, 60])]),
                   r=anim([(34, -30), (46, -40), (56, -10), (64, -48), (72, -55)])))
    return s


def campus(P):
    s = [group([path([(18, 214), (242, 214)]), stroke(P["line"], 2.5, 35), trim(0, 14)], "ground")]
    s.append(group([path([(48, 210), (48, 112), (212, 112), (212, 210)], closed=True), fill(P["soft"], P["soft_op"] + 4)], "wallbg", o=anim([(10, 0), (30, 100)])))
    s.append(group([path([(40, 112), (130, 64), (220, 112)], closed=True), fill(P["a1"])], "roof", s=pop(14, 14), a=(130, 100), p=(130, 100)))
    s.append(group([path([(48, 210), (48, 112), (212, 112), (212, 210)]), stroke(P["line"], 3.5), trim(4, 26)], "wall"))
    for k in range(5):
        x = 70 + k * 30
        s.append(group([path([(x, 124), (x, 202)]), stroke(P["line"], 3, 70), trim(20 + k * 3, 34 + k * 3)], f"col{k}"))
    for k in range(4):
        x = 85 + k * 30
        s.append(group([rect(14, 18, x, 150, 2), fill(P["a2"])], f"win{k}", s=pop(40 + k * 5, 8), a=(x, 150), p=(x, 150)))
    s.append(group([rect(26, 38, 130, 191, 3), fill(P["line"])], "door", s=anim([(36, [100, 0]), (46, [100, 100])]), a=(130, 210), p=(130, 210)))
    s.append(group([path([(130, 64), (130, 26)]), stroke(P["line"], 3), trim(48, 56)], "pole"))
    s.append(group([path([(130, 26), (156, 32), (130, 40)], closed=True), fill(P["a2"])], "flag", s=anim([(54, [0, 100]), (64, [100, 100])]), a=(130, 33), p=(130, 33)))
    return s


def empty_news(P):
    s = [group([rect(140, 170, 120, 130, 10), fill(P["base"]), stroke(P["line"], 3.5), trim(0, 20)], "page")]
    for k in range(5):
        y = 76 + k * 24
        s.append(group([path([(72, y), (168 - (k % 3) * 22, y)]), stroke(P["line"], 3, 35), trim(8 + k * 3, 20 + k * 3)], f"ln{k}"))
    s.append(group([rect(52, 34, 98, 190, 6), fill(P["soft"], P["soft_op"] + 20)], "img", s=pop(22, 10), a=(98, 190), p=(98, 190)))
    lens = group([ellipse(54, 54, 0, 0), fill(P["base"], 60), stroke(P["a1"], 5), path([(20, 20), (44, 44)]), stroke(P["a1"], 8)], "lens")
    s.append(group([lens], "glass", p=anim([(24, [190, 80]), (54, [96, 120]), (84, [176, 168]), (110, [190, 80])]), s=pop(22, 10)))
    return s


# ---------- ikon kecil (≈48–64px di layar): garis 9px, detail minimal, cakram emas lembut ----------
W = 9


def _disc(P):
    return group([ellipse(236, 236, 130, 130), fill(P["soft"], P["soft_op"] + 4)], "disc", s=pop(0, 16), a=(130, 130), p=(130, 130))


def qa_campus(P):
    return [
        _disc(P),
        group([path([(52, 112), (130, 58), (208, 112)], closed=True), fill(P["a1"])], "roof", s=pop(6, 14), a=(130, 100), p=(130, 100)),
        group([path([(66, 116), (66, 196), (194, 196), (194, 116)]), stroke(P["line"], W), trim(10, 30)], "wall"),
        *[group([path([(x, 132), (x, 176)]), stroke(P["line"], W - 2), trim(22 + k * 4, 34 + k * 4)], f"col{k}") for k, x in enumerate([96, 130, 164])],
        group([path([(48, 204), (212, 204)]), stroke(P["line"], W), trim(4, 18)], "ground"),
        group([path([(130, 58), (130, 28)]), stroke(P["line"], 6), trim(34, 42)], "pole"),
        group([path([(130, 28), (154, 35), (130, 42)], closed=True), fill(P["a2"])], "flag", s=anim([(40, [0, 100]), (50, [100, 100])]), a=(130, 35), p=(130, 35)),
    ]


def qa_student(P):
    left = [(130, 92), (98, 76), (56, 78), (56, 186), (98, 184), (130, 200)]
    right = [(130, 92), (162, 76), (204, 78), (204, 186), (162, 184), (130, 200)]
    flip = group([path([(130, 92), (162, 76), (204, 78), (204, 186), (162, 184), (130, 200)], closed=True), fill(P["base"]), stroke(P["line"], W - 3)], "flip",
                 s=anim([(46, [100, 100]), (62, [0, 100]), (78, [-100, 100]), (90, [-100, 100])]), a=(130, 140), p=(130, 140), o=anim([(44, 0), (46, 100), (86, 100), (90, 0)]))
    return [
        _disc(P),
        group([path(left, closed=True), fill(P["base"])], "lpage"),
        group([path(right, closed=True), fill(P["base"])], "rpage"),
        group([path(left), stroke(P["line"], W), trim(4, 26)], "left"),
        group([path(right), stroke(P["line"], W), trim(4, 26)], "right"),
        group([path([(130, 92), (130, 200)]), stroke(P["line"], W - 2), trim(20, 30)], "spine"),
        *[group([path([(74, y), (112, y + 6)]), stroke(P["line"], 5, 45), trim(26 + k * 4, 36 + k * 4)], f"l{k}") for k, y in enumerate([108, 130, 152])],
        group([path([(172, 76), (172, 120), (182, 110), (192, 120), (192, 77)], closed=True), fill(P["a1"])], "mark", s=anim([(30, [100, 0]), (42, [100, 100])]), a=(182, 76), p=(182, 76)),
        flip,
    ]


def qa_alumni(P):
    board = [(130, 34), (196, 60), (130, 86), (64, 60)]
    cap = group([
        group([path([(98, 74), (98, 98), (130, 108), (162, 98), (162, 74)]), fill(P["line"])], "crown"),
        group([path(board, closed=True), fill(P["a1"])], "board"),
        group([path([(130, 60), (182, 70), (182, 98)]), stroke(P["a2"], 6), group([rect(12, 16, 182, 104, 3), fill(P["a2"])], "tuft")], "tassel",
              r=anim([(40, 0), (52, 10), (64, -6), (76, 0)]), a=(182, 70), p=(182, 70)),
    ], "cap", p=anim([(14, [0, -50]), (30, [0, 6]), (38, [0, 0])]), o=anim([(14, 0), (20, 100)]))
    return [
        _disc(P),
        group([path(arc(130, 222, 70, 200, 340, 14)), stroke(P["line"], W), trim(4, 24)], "shoulders"),
        group([ellipse(76, 76, 130, 132), fill(P["base"]), stroke(P["line"], W), trim(8, 26)], "head"),
        cap,
    ]


def qa_industry(P):
    return [
        _disc(P),
        group([path([(104, 92), (104, 74), (156, 74), (156, 92)]), stroke(P["line"], W), trim(8, 20)], "handle"),
        group([rect(150, 104, 130, 146, 14), fill(P["base"]), stroke(P["line"], W), trim(0, 24)], "case"),
        group([path([(55, 140), (205, 140)]), stroke(P["line"], W - 3), trim(20, 32)], "seam"),
        group([rect(30, 22, 130, 140, 5), fill(P["a1"])], "latch", s=pop(30, 10), a=(130, 140), p=(130, 140)),
        group([path([(150, 196), (178, 168), (198, 178), (226, 146)]), stroke(P["a2"], 8), trim(44, 64)], "growth"),
        group([path([(208, 144), (228, 144), (228, 164)]), stroke(P["a2"], 8), trim(62, 70)], "arrow"),
    ]


# ---------- jalur kelulusan (dipakai di permukaan navy/maroon → varian dark) ----------
def thesis_book(P):
    """Skripsi: buku terbuka, halaman kanan membalik, baris teks tergambar, pena mengangguk."""
    left = [(44, 92), (44, 196), (130, 206), (130, 102)]
    right = [(130, 102), (130, 206), (216, 196), (216, 92)]
    s = [group([path(left, closed=True), fill(P["soft"], P["soft_op"])], "lpage")]
    s.append(group([path(right, closed=True), fill(P["soft"], P["soft_op"])], "rpage"))
    s.append(group([path(left, closed=True), stroke(P["line"], 4), trim(0, 22)], "lbook"))
    s.append(group([path(right, closed=True), stroke(P["line"], 4), trim(4, 26)], "rbook"))
    for k, y in enumerate([124, 144, 164]):
        s.append(group([path([(60, y - 2), (114, y + 4)]), stroke(P["line"], 3.5, 70), trim(24 + k * 6, 34 + k * 6)], f"tl{k}"))
    s.append(group([path([(146, 122), (200, 116)]), stroke(P["a1"], 4), trim(40, 50)], "hl"))
    flip = group([path([(130, 102), (130, 206), (190, 196), (190, 92)], closed=True), fill(P["a2"], 70)], "flip",
                 s=anim([(50, [100, 100]), (64, [0, 100]), (78, [-100, 100]), (84, [-100, 100])]), a=(130, 150), p=(130, 150),
                 o=anim([(48, 0), (52, 100), (80, 100), (86, 0)]))
    s.append(flip)
    pen = group([path([(170, 40), (206, 76)]), stroke(P["a1"], 7), path([(206, 76), (214, 88), (200, 82)], closed=True), fill(P["a1"])], "pen",
                r=anim([(30, 0), (42, -10), (54, 6), (66, 0)]), a=(206, 80), p=(206, 80))
    s.append(pen)
    return s


def pkm_bulb(P):
    """PKM: bola lampu tergambar, filamen menyala emas, sinar memancar berurutan."""
    bulb = arc(130, 106, 54, 140, 400, 18) + [(150, 170), (110, 170)]
    s = [group([path(bulb, closed=True), fill(P["a2"])], "glow", o=anim([(26, 0), (40, 90), (70, 60), (90, 90)]))]
    s.append(group([path(bulb, closed=True), stroke(P["line"], 4), trim(0, 24)], "bulb"))
    s.append(group([path([(112, 120), (122, 104), (130, 120), (138, 104), (148, 120)]), stroke(P["a1"], 4), trim(20, 34)], "fil"))
    for k, y in enumerate([182, 196]):
        s.append(group([path([(110, y), (150, y)]), stroke(P["line"], 5), trim(10 + k * 4, 20 + k * 4)], f"base{k}"))
    s.append(group([path([(120, 210), (140, 210)]), stroke(P["line"], 5), trim(18, 26)], "tip"))
    for k, a in enumerate([200, 235, 270, 305, 340]):
        r0, r1 = 72, 90
        x0, y0 = 130 + r0 * math.cos(math.radians(a)), 106 + r0 * math.sin(math.radians(a))
        x1, y1 = 130 + r1 * math.cos(math.radians(a)), 106 + r1 * math.sin(math.radians(a))
        s.append(group([path([(x0, y0), (x1, y1)]), stroke(P["a1"], 4.5), trim(36 + k * 4, 44 + k * 4)], f"ray{k}"))
    return s


def biz_shop(P):
    """Bisnis: kanopi bergelombang pop, etalase tergambar, papan "buka" berayun, grafik naik."""
    s = [group([path([(52, 116), (52, 204), (208, 204), (208, 116)]), stroke(P["line"], 4), trim(0, 20)], "wall")]
    s.append(group([rect(56, 52, 98, 166, 4), fill(P["soft"], P["soft_op"]), stroke(P["line"], 3.5)], "window", s=pop(16, 10), a=(98, 166), p=(98, 166)))
    s.append(group([path([(150, 204), (150, 146), (186, 146), (186, 204)]), stroke(P["line"], 4), trim(18, 30)], "door"))
    awn = [(40, 116), (60, 72), (200, 72), (220, 116)]
    s.append(group([path(awn, closed=True), fill(P["a1"])], "awning", s=pop(6, 12), a=(130, 72), p=(130, 72)))
    for k in range(4):
        x = 40 + k * 45
        s.append(group([path(arc(x + 22.5, 116, 22.5, 0, 180, 8)), fill(P["a1"])], f"sc{k}", s=pop(10 + k * 2, 10), a=(x + 22.5, 116), p=(x + 22.5, 116)))
    s.append(group([path([(130, 72), (130, 52)]), stroke(P["line"], 3)], "hook"))
    sign = group([rect(44, 22, 130, 40, 4), fill(P["a2"])], "sign", r=anim([(30, 0), (40, 12), (52, -8), (64, 4), (74, 0)]), a=(130, 30), p=(130, 30))
    s.append(sign)
    s.append(group([path([(72, 186), (90, 172), (104, 178), (122, 154)]), stroke(P["a2"], 5), trim(42, 60)], "growth"))
    return s


def rulebook(P):
    """Regulasi: buku pedoman tergambar, pita pembatas turun, tanda pasal pop, butir dicentang berurutan."""
    left = [(40, 96), (40, 200), (130, 212), (130, 108)]
    right = [(130, 108), (130, 212), (220, 200), (220, 96)]
    s = []
    for k, x in enumerate([86, 174]):
        rib = [(x - 8, 196), (x - 8, 236), (x, 228), (x + 8, 236), (x + 8, 196)]
        s.append(group([path(rib, closed=True), fill(P["a1"] if k == 0 else P["a2"])], f"rib{k}",
                       s=anim([(28 + k * 6, [100, 0]), (40 + k * 6, [100, 100])]), a=(x, 196), p=(x, 196)))
    s.append(group([path(left, closed=True), fill(P["base"])], "lfill"))
    s.append(group([path(right, closed=True), fill(P["base"])], "rfill"))
    s.append(group([path(left, closed=True), fill(P["soft"], P["soft_op"])], "lsoft"))
    s.append(group([path(left, closed=True), stroke(P["line"], 4), trim(0, 22)], "lbook"))
    s.append(group([path(right, closed=True), stroke(P["line"], 4), trim(4, 26)], "rbook"))
    for k, y in enumerate([132, 152, 172]):
        s.append(group([path([(58, y - 2), (112, y + 4)]), stroke(P["line"], 3.5, 70), trim(22 + k * 5, 32 + k * 5)], f"tl{k}"))
    s.append(group([path([(56, 116), (100, 118)]), stroke(P["a2"], 5), trim(18, 28)], "head"))
    for k, y in enumerate([130, 158, 186]):
        box = rect(14, 14, 152, y, 3)
        s.append(group([box, stroke(P["line"], 3)], f"box{k}", s=pop(30 + k * 6, 10), a=(152, y), p=(152, y)))
        s.append(group([path([(147, y), (151, y + 4), (158, y - 4)]), stroke(P["a2"], 3.5), trim(44 + k * 8, 52 + k * 8)], f"tick{k}"))
        s.append(group([path([(168, y), (204, y - 3)]), stroke(P["line"], 3, 70), trim(32 + k * 6, 42 + k * 6)], f"tx{k}"))
    return s


def briefcase(P):
    """Magang: tas kerja tergambar, gagang & gesper pop, kartu ID tergantung berayun pelan."""
    s = []
    body = rect(150, 100, 130, 150, 10)
    s.append(group([body, fill(P["base"])], "bfill"))
    s.append(group([rect(150, 100, 130, 150, 10), fill(P["soft"], P["soft_op"])], "bsoft"))
    s.append(group([rect(150, 100, 130, 150, 10), stroke(P["line"], 4), trim(0, 24)], "body"))
    s.append(group([path([(96, 100), (96, 86), (164, 86), (164, 100)]), stroke(P["line"], 4), trim(10, 26)], "handle"))
    s.append(group([path([(55, 140), (205, 140)]), stroke(P["line"], 3.5, 70), trim(18, 32)], "seam"))
    s.append(group([rect(26, 18, 130, 140, 4), fill(P["a2"])], "clasp", s=pop(28, 12), a=(130, 140), p=(130, 140)))
    # kartu ID tergantung di sisi kanan, berayun (rotasi pada titik gantung)
    tag = [
        path([(196, 112), (206, 150)]), stroke(P["line"], 3),
        rect(30, 40, 206, 172, 4), fill(P["a1"]),
    ]
    s.append(group(tag, "tag", a=(196, 112), p=(196, 112),
                   r=anim([(30, -10), (60, 8), (90, -6), (119, -10)]), s=pop(30, 12)))
    s.append(group([path([(198, 166), (214, 166)]), stroke(P["base"], 3)], "tagline",
                   a=(196, 112), p=(196, 112), r=anim([(30, -10), (60, 8), (90, -6), (119, -10)]), o=anim([(36, 0), (44, 100)])))
    return s


def credit_swap(P):
    """Konversi SKS: jam pasir tergambar dan butirnya turun, panah tukar, lembar transkrip baris demi baris + centang."""
    s = []
    # jam pasir (kiri)
    glass = [(46, 70), (110, 70), (84, 130), (110, 190), (46, 190), (72, 130)]
    s.append(group([path(glass, closed=True), fill(P["base"])], "gfill"))
    s.append(group([path(glass, closed=True), fill(P["soft"], P["soft_op"])], "gsoft"))
    s.append(group([path(glass, closed=True), stroke(P["line"], 4), trim(0, 22)], "glass"))
    s.append(group([path([(40, 70), (116, 70)]), stroke(P["line"], 5)], "gtop", s=pop(14, 10), a=(78, 70), p=(78, 70)))
    s.append(group([path([(40, 190), (116, 190)]), stroke(P["line"], 5)], "gbot", s=pop(16, 10), a=(78, 190), p=(78, 190)))
    # pasir atas menyusut, bawah tumbuh
    s.append(group([path([(58, 84), (98, 84), (78, 116)], closed=True), fill(P["a2"])], "sandtop",
                   s=anim([(20, [100, 100]), (90, [30, 30])]), a=(78, 116), p=(78, 116)))
    s.append(group([path([(56, 184), (100, 184), (78, 160)], closed=True), fill(P["a2"])], "sandbot",
                   s=anim([(20, [20, 20]), (90, [100, 100])]), a=(78, 184), p=(78, 184)))
    s.append(group([ellipse(5, 5, 78, 0), fill(P["a2"])], "grain",
                   p=anim([(24, [0, 132]), (40, [0, 176]), (41, [0, 132]), (57, [0, 176]), (58, [0, 132]), (74, [0, 176])], linear=True)))
    # panah tukar (tengah)
    s.append(group([path([(122, 116), (148, 116)]), stroke(P["a1"], 4), trim(30, 40)], "arr1"))
    s.append(group([path([(142, 110), (149, 116), (142, 122)]), stroke(P["a1"], 4), trim(38, 44)], "arr1h"))
    s.append(group([path([(148, 144), (122, 144)]), stroke(P["a1"], 4), trim(36, 46)], "arr2"))
    s.append(group([path([(128, 138), (121, 144), (128, 150)]), stroke(P["a1"], 4), trim(44, 50)], "arr2h"))
    # lembar transkrip (kanan)
    sheet = rect(72, 110, 194, 130, 6)
    s.append(group([sheet, fill(P["base"])], "sfill", s=pop(26, 12), a=(194, 130), p=(194, 130)))
    s.append(group([rect(72, 110, 194, 130, 6), stroke(P["line"], 4), trim(26, 46)], "sheet"))
    s.append(group([path([(170, 90), (204, 90)]), stroke(P["a1"], 5), trim(40, 48)], "shead"))
    for k, y in enumerate([112, 132, 152]):
        s.append(group([path([(170, y), (200, y)]), stroke(P["line"], 3.5, 70), trim(46 + k * 7, 56 + k * 7)], f"row{k}"))
        s.append(group([path([(208, y), (213, y + 4), (220, y - 5)]), stroke(P["a2"], 3.5), trim(60 + k * 8, 68 + k * 8)], f"ok{k}"))
    s.append(group([ellipse(16, 16, 214, 174), fill(P["a1"])], "seal", s=pop(86, 12), a=(214, 174), p=(214, 174)))
    return s


def certificate(P):
    """Bootcamp: lembar sertifikat tergambar, baris teks muncul berurutan, segel emas pop lalu pita turun."""
    s = []
    s.append(group([rect(170, 120, 122, 112, 6), fill(P["base"])], "cfill"))
    s.append(group([rect(170, 120, 122, 112, 6), fill(P["soft"], P["soft_op"])], "csoft"))
    s.append(group([rect(170, 120, 122, 112, 6), stroke(P["line"], 4), trim(0, 22)], "sheet"))
    s.append(group([rect(150, 100, 122, 112, 3), stroke(P["a2"], 2, 70), trim(10, 30)], "inner"))
    s.append(group([path([(64, 82), (140, 82)]), stroke(P["line"], 5), trim(22, 32)], "title"))
    for i, (x1, t) in enumerate([(160, 30), (128, 36), (148, 42)]):
        s.append(group([path([(64, 104 + i * 16), (x1, 104 + i * 16)]), stroke(P["line"], 3, 60), trim(t, t + 10)], f"row{i}"))
    # pita
    s.append(group([path([(176, 176), (170, 214), (182, 204), (190, 214), (188, 176)], closed=True), fill(P["a1"])], "ribbon",
                   p=anim([(52, [0, -18]), (64, [0, 0])]), o=anim([(52, 0), (56, 100)])))
    s.append(group([ellipse(46, 46, 182, 162), fill(P["a2"])], "seal", s=pop(44, 12), a=(182, 162), p=(182, 162)))
    s.append(group([path([(172, 162), (179, 169), (192, 155)]), stroke(P["base"], 4), trim(56, 66)], "tick"))
    return s


def laptop_code(P):
    """Bootcamp/course: laptop terbuka tergambar, baris kode mengetik bergantian, kursor berkedip."""
    s = []
    s.append(group([rect(150, 96, 130, 112, 8), fill(P["base"])], "sfill"))
    s.append(group([rect(150, 96, 130, 112, 8), stroke(P["line"], 4), trim(0, 20)], "screen"))
    s.append(group([path([(40, 172), (220, 172), (206, 186), (54, 186)], closed=True), stroke(P["line"], 4), trim(10, 26)], "base"))
    rows = [(72, 92, 120, 24), (86, 108, 150, 32), (86, 124, 132, 40), (72, 140, 104, 48)]
    for i, (x0, y, x1, t) in enumerate(rows):
        c = P["a2"] if i == 1 else P["line"]
        s.append(group([path([(x0, y), (x1, y)]), stroke(c, 4, 85), trim(t, t + 8)], f"code{i}"))
    s.append(group([rect(4, 12, 112, 140, 1), fill(P["a1"])], "caret",
                   o=anim([(56, 0), (57, 100), (66, 100), (67, 0), (76, 0), (77, 100), (86, 100), (87, 0), (96, 0), (97, 100)])))
    return s


def service_bell(P):
    """Layanan: bel loket tergambar, tombol ditekan, bel bergoyang dan gelombang bunyi memancar."""
    s = []
    dome = arc(130, 170, 62, 180, 360, 16)
    wig = anim([(40, 0), (46, -9), (52, 8), (58, -5), (64, 3), (70, 0)])
    s.append(group([path(dome + [(68, 170)], True), fill(P["base"])], "dfill", a=(130, 176), p=(130, 176), r=wig))
    s.append(group([path(dome + [(68, 170)], True), fill(P["soft"], P["soft_op"])], "dsoft", a=(130, 176), p=(130, 176), r=wig))
    s.append(group([path(dome), stroke(P["line"], 4), trim(0, 22)], "dome", a=(130, 176), p=(130, 176), r=wig))
    s.append(group([path(arc(130, 170, 44, 200, 250, 6)), stroke(P["a2"], 4), trim(18, 30)], "shine", a=(130, 176), p=(130, 176), r=wig))
    s.append(group([path([(56, 176), (204, 176)]), stroke(P["line"], 5), trim(8, 24)], "base"))
    s.append(group([group([path([(130, 108), (130, 96)]), stroke(P["line"], 4)], "stem"), group([rect(24, 8, 130, 94, 3), fill(P["a1"])], "cap")], "knob",
                   p=anim([(26, [0, 0]), (36, [0, 0]), (40, [0, 6]), (46, [0, 0])]), s=pop(22, 10), a=(130, 100)))
    for k, pts in enumerate([[(60, 104), (44, 90)], [(200, 104), (216, 90)], [(130, 72), (130, 52)]]):
        s.append(group([path(pts), stroke(P["a2"], 4), trim(44 + k * 2, 56 + k * 2)], f"ring{k}", o=anim([(44, 0), (48, 100), (84, 100), (96, 0)])))
    return s


def stamp(P):
    """Layanan: lembar surat tergambar, stempel turun mengecap, tinta pop lalu tanda centang tergambar."""
    s = []
    s.append(group([rect(150, 120, 130, 176, 8), fill(P["base"]), stroke(P["line"], 3.5), trim(0, 20)], "sheet"))
    for k, y in enumerate([140, 158, 176]):
        s.append(group([path([(76, y), (150 - k * 18, y)]), stroke(P["line"], 3, 60), trim(10 + k * 3, 22 + k * 3)], f"ln{k}"))
    s.append(group([ellipse(46, 46, 166, 200), stroke(P["a1"], 4), trim(48, 60)], "ink", s=pop(46, 8), a=(166, 200), p=(166, 200)))
    s.append(group([path([(152, 200), (162, 210), (182, 190)]), stroke(P["a1"], 4.5), trim(58, 70)], "check"))
    move = anim([(20, [0, -70]), (40, [0, -70]), (46, [0, 0]), (52, [0, 0]), (64, [0, -70]), (96, [0, -70]), (110, [0, -120])])
    st_ = [
        group([rect(52, 18, 166, 150, 4), fill(P["a1"])], "pad"),
        group([rect(44, 22, 166, 132, 4), fill(P["line"])], "body"),
        group([rect(10, 26, 166, 110, 4), fill(P["line"])], "neck"),
        group([ellipse(30, 30, 166, 94), fill(P["a2"])], "grip"),
    ]
    s.append(group(st_, "stamp", p=move, a=(0, 0), o=anim([(16, 0), (22, 100), (100, 100), (110, 0)])))
    return s


def wallet(P):
    """Beasiswa: dompet tergambar, kartu meluncur masuk dari atas, keping koin pop di saku."""
    s = []
    # kartu masuk (di belakang dompet)
    s.append(group([rect(110, 70, 130, 0, 8), fill(P["a1"]), rect(22, 16, 98, -16, 3), fill(P["a2"])], "card",
                   p=anim([(14, [0, 70]), (40, [0, 112]), (52, [0, 104])]), o=anim([(14, 0), (20, 100)])))
    s.append(group([rect(170, 116, 130, 160, 16), fill(P["base"])], "wfill"))
    s.append(group([rect(170, 116, 130, 160, 16), fill(P["soft"], P["soft_op"])], "wsoft"))
    s.append(group([rect(170, 116, 130, 160, 16), stroke(P["line"], 4), trim(0, 26)], "wallet"))
    s.append(group([path([(45, 134), (215, 134)]), stroke(P["line"], 3.5, 70), trim(10, 30)], "seam"))
    s.append(group([rect(54, 36, 200, 160, 10), fill(P["base"]), rect(54, 36, 200, 160, 10), stroke(P["line"], 4)], "clasp", s=pop(26, 12), a=(200, 160), p=(200, 160)))
    s.append(group([ellipse(12, 12, 188, 160), fill(P["a2"])], "dot", s=pop(34, 10), a=(188, 160), p=(188, 160)))
    s.append(group([ellipse(30, 30, 92, 190), fill(P["a2"]), ellipse(18, 18, 92, 190), stroke(P["line"], 2.5, 60)], "coin",
                   s=pop(44, 12), a=(92, 190), p=anim([(44, [92, 200]), (58, [92, 190]), (90, [92, 186]), (119, [92, 190])])))
    return s


def envelope_sent(P):
    """Kontak: amplop tergambar, tutup amplop melipat turun, segel emas pop, lalu amplop melesat dengan garis laju."""
    s = []
    fly = anim([(0, [0, 0]), (62, [0, 0]), (74, [-8, 4]), (92, [26, -14]), (104, [26, -14])])
    body = [
        group([rect(150, 100, 130, 150, 8), fill(P["base"])], "bfill"),
        group([rect(150, 100, 130, 150, 8), fill(P["soft"], P["soft_op"])], "bsoft"),
        group([rect(150, 100, 130, 150, 8), stroke(P["line"], 4), trim(0, 22)], "body"),
        group([path([(55, 200), (112, 152)]), stroke(P["line"], 3, 70), trim(14, 26)], "fl"),
        group([path([(205, 200), (148, 152)]), stroke(P["line"], 3, 70), trim(14, 26)], "fr"),
        # tutup: segitiga berporos di tepi atas; skala-y -100 (terbuka) → 100 (tertutup)
        group([path([(55, 100), (130, 156), (205, 100)], True), fill(P["base"]), stroke(P["line"], 4)], "flap",
              a=(130, 100), p=(130, 100), s=anim([(24, [100, -100]), (40, [100, -100]), (54, [100, 100])])),
        group([ellipse(28, 28, 130, 154), fill(P["a2"])], "seal", s=pop(54, 8), a=(130, 154), p=(130, 154)),
        group([ellipse(12, 12, 130, 154), fill(P["a1"])], "dot", s=pop(58, 8), a=(130, 154), p=(130, 154)),
    ]
    s.append(group(body, "env", p=fly))
    for k, y in enumerate([126, 150, 174]):
        s.append(group([path([(40 - k * 6, y), (8, y)]), stroke(P["a1"] if k == 1 else P["a2"], 4)], f"speed{k}",
                       o=anim([(72, 0), (78, 100), (98, 100), (106, 0)]),
                       p=anim([(72, [20, 0]), (92, [-6, 0])])))
    return s


SPECS = [
    ("medal", medal, ["light", "dark"]),
    ("erp-nodes", erp_nodes, ["light"]),
    ("lecturer", lecturer, ["light"]),
    ("industry", industry, ["light"]),
    ("grad-path", grad_path, ["light"]),
    ("shield-audit", shield_audit, ["dark"]),
    ("erp-gears", erp_gears, ["dark"]),
    ("data-chart", data_chart, ["light", "dark"]),
    ("strategy-target", strategy_target, ["dark"]),
    ("badge", badge, ["dark"]),
    ("trophy", trophy, ["dark"]),
    ("calendar", calendar, ["light"]),
    ("grad-cap", grad_cap, ["light"]),
    ("rocket-pmb", rocket_pmb, ["dark"]),
    ("campus", campus, ["light"]),
    ("empty-news", empty_news, ["light"]),
    # ikon skala kecil (garis tebal) untuk kartu tautan cepat
    ("qa-campus", qa_campus, ["light"]),
    ("qa-student", qa_student, ["light"]),
    ("qa-alumni", qa_alumni, ["light"]),
    ("qa-industry", qa_industry, ["light"]),
    # jalur kelulusan
    ("thesis-book", thesis_book, ["dark"]),
    ("pkm-bulb", pkm_bulb, ["dark"]),
    ("biz-shop", biz_shop, ["dark"]),
    # regulasi akademik
    ("rulebook", rulebook, ["dark"]),
    # magang
    ("briefcase", briefcase, ["light", "dark"]),
    # konversi sks
    ("credit-swap", credit_swap, ["light", "dark"]),
    # bootcamp & course
    ("certificate", certificate, ["light", "dark"]),
    ("laptop-code", laptop_code, ["light", "dark"]),
    # layanan akademik
    ("service-bell", service_bell, ["light", "dark"]),
    ("stamp", stamp, ["light", "dark"]),
    # kontak
    ("envelope-sent", envelope_sent, ["light", "dark"]),
    # beasiswa
    ("wallet", wallet, ["light", "dark"]),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    only = set(sys.argv[1:])
    for name, fn, variants in SPECS:
        if only and name not in only:
            continue
        for v in variants:
            fname = f"{name}.json" if v == "light" else f"{name}-dark.json"
            data = doc(name, fn(PALETTES[v]))
            with open(os.path.join(OUT, fname), "w", encoding="utf-8") as f:
                json.dump(data, f, separators=(",", ":"))
            print(f"{fname:26s} {os.path.getsize(os.path.join(OUT, fname)):6d} B")


if __name__ == "__main__":
    main()
