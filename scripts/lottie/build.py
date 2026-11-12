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
