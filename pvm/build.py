"""Baut index.html (installierbare App) aus game.src.html + engine.js.   python3 build.py"""
from pathlib import Path
here = Path(__file__).parent
src = (here / "game.src.html").read_text()
engine = (here / "engine.js").read_text()
src = src.replace("<!--ENGINE-->", "<script>\n" + engine + "\n</script>")
title_end = src.index("</title>") + len("</title>")
style_start = src.index("<style>"); style_end = src.index("</style>") + len("</style>")
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
out = (head + src[title_end:style_start].strip() + "\n" + src[style_start:style_end].replace("<style>", reset, 1)
       + "\n</head>\n<body>\n" + src[style_end:].strip() + "\n</body>\n</html>\n")
(here / "index.html").write_text(out)
print("index.html gebaut")
