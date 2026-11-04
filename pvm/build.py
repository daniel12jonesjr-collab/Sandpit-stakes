"""Baut aus game.src.html zwei Dateien:
  index.html     installierbare App (three.js lokal, Spielregeln eingebettet)
  preview.html   Einzeldatei fuer die Vorschau (three.js vom CDN)

    python3 build.py
"""
from pathlib import Path

here = Path(__file__).parent
src = (here / "game.src.html").read_text()
engine = (here / "engine.js").read_text()
engine_tag = "<script>\n" + engine + "\n</script>"

# ---- Vorschau (Einzeldatei)
CDN = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/"
preview = src.replace("<!--THREE-->", '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n'
                      + "".join(f'<script src="{CDN}{p}"></script>\n' for p in ["loaders/GLTFLoader.js", "libs/meshopt_decoder.js", "utils/SkeletonUtils.js"])) \
             .replace("<!--ENGINE-->", engine_tag)
(here / "preview.html").write_text(preview)

# ---- Installierbare App
title_end = src.index("</title>") + len("</title>")
style_start = src.index("<style>")
style_end = src.index("</style>") + len("</style>")
head = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Sandpit Grind</title>
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#000000">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Grind">
<link rel="apple-touch-icon" href="icon-180.png">
"""
reset = ("<style>\n  :root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }\n"
         "  [hidden] { display: none !important; }\n  html, body { margin: 0; }\n  body { overscroll-behavior: none; }")
body = src[style_end:].replace("<!--THREE-->", '<script src="three.min.js"></script>\n<script src="lib/GLTFLoader.js"></script>\n<script src="lib/meshopt_decoder.js"></script>\n<script src="lib/SkeletonUtils.js"></script>').replace("<!--ENGINE-->", engine_tag)
out = (head + src[title_end:style_start].strip() + "\n" + src[style_start:style_end].replace("<style>", reset, 1)
       + "\n</head>\n<body>\n" + body.strip() + "\n</body>\n</html>\n")
(here / "index.html").write_text(out)
print("index.html und preview.html gebaut")
