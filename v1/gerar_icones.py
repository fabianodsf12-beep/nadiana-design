#!/usr/bin/env python3
"""Gera v1/icones.js com os ícones Lucide usados nos projetos Nadiana.

Os ícones vêm do pacote lucide-static (licença ISC). Para acrescentar um ícone,
ponha o nome dele em ICONES (veja os nomes em https://lucide.dev/icons) e rode:

    npm pack lucide-static@0.460.0 && tar xzf lucide-static-0.460.0.tgz
    python3 v1/gerar_icones.py package/icons
"""
import pathlib
import re
import sys

VERSAO = "0.460.0"
ICONES = [
    # navegação
    "house", "layout-dashboard", "menu", "arrow-left", "chevron-left", "chevron-right", "chevron-down",
    "ellipsis", "x", "search", "sliders-horizontal", "settings", "user", "log-out", "bell",
    # ações
    "plus", "check", "pencil", "trash-2", "download", "upload", "share-2", "refresh-cw", "eye", "copy",
    # situação
    "circle-check", "circle-x", "triangle-alert", "info", "clock", "wifi", "wifi-off", "sun", "moon",
    # dados
    "chart-column", "chart-line", "table", "list", "file-text", "clipboard-list", "calendar", "calendar-days",
    # campo
    "map", "map-pin", "tractor", "sprout", "wheat", "droplet", "droplets", "cloud-rain", "wind",
    "thermometer", "fuel", "package", "flask-conical", "spray-can", "warehouse", "truck",
]

pasta = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "package/icons")
simbolos = []
for n in ICONES:
    svg = (pasta / f"{n}.svg").read_text(encoding="utf-8")
    corpo = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
    corpo = re.sub(r"\s+", " ", corpo).replace("> <", "><").strip()
    simbolos.append(f'<symbol id="i-{n}" viewBox="0 0 24 24">{corpo}</symbol>')

js = f"""/* Nadiana — ícones Lucide v{VERSAO} (ISC, https://lucide.dev). Gerado por gerar_icones.py. Não edite à mão.
   Uso: <script src="https://fabianodsf12-beep.github.io/nadiana-design/v1/icones.js"></script> e, na página,
   <svg class="nd-ic" aria-hidden="true"><use href="#i-tractor"/></svg> */
(function(){{
  var s = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">{''.join(simbolos)}</svg>';
  function por(){{ document.body.insertAdjacentHTML("afterbegin", s); }}
  if (document.body) por(); else document.addEventListener("DOMContentLoaded", por);
  window.NadianaIcones = {ICONES!r};
}})();
"""
destino = pathlib.Path(__file__).resolve().parent / "icones.js"
destino.write_text(js, encoding="utf-8")
print(f"icones.js gerado: {len(ICONES)} ícones, {destino.stat().st_size // 1024} KB")
