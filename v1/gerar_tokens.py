#!/usr/bin/env python3
"""Gera v1/tokens.css e v1/tokens.js a partir de v1/tokens.json.

tokens.json é a fonte única (a mesma do Design System "Nadiana" no claude.ai).
Depois de mudar uma cor, espaço ou canto lá, copie o tokens.json para cá e rode:

    python3 v1/gerar_tokens.py
"""
import json
import pathlib

PASTA = pathlib.Path(__file__).resolve().parent
T = json.loads((PASTA / "tokens.json").read_text(encoding="utf-8"))


def nome(n):
    return "--" + n.replace(".", "_")


claro, escuro = [], []
for tk in T["color"]["tokens"]:
    v = tk["value"]
    if isinstance(v, dict):
        claro.append(f"{nome(tk['name'])}:{v['light']}")
        if v.get("dark") and v["dark"] != v["light"]:
            escuro.append(f"{nome(tk['name'])}:{v['dark']}")
    else:
        claro.append(f"{nome(tk['name'])}:{v}")

outros = []
for fam in ("spacing", "radius", "shadow"):
    for tk in T.get(fam, {}).get("tokens", []):
        outros.append(f"{nome(tk['name'])}:{tk['value']}")
for k, v in T["type"]["families"].items():
    outros.append(f"--font-{k}:{v}")

faces = []
for f in T["type"]["fonts"]:
    faces.append(
        "@font-face{font-family:'%s';font-weight:%s;font-style:normal;font-display:swap;src:url('%s') format('woff2')}"
        % (f["family"], f["weight"], f["file"])
    )

estilos = []
for g in T["type"]["groups"]:
    for s in g["styles"]:
        r = [f"font-family:var(--font-{g['family']})", f"font-size:{s['fontSize']}", f"font-weight:{s['fontWeight']}"]
        if "lineHeight" in s:
            r.append(f"line-height:{s['lineHeight']}")
        else:
            r.append("line-height:1.05")
        if "letterSpacing" in s:
            r.append(f"letter-spacing:{s['letterSpacing']};text-transform:uppercase")
        estilos.append(f".nd-{s['name']}{{{';'.join(r)}}}")

css = f"""/* Nadiana — gerado de tokens.json por gerar_tokens.py. Não edite à mão. */
{chr(10).join(faces)}
:root{{
  {';'.join(claro)};
  {';'.join(outros)};
  color-scheme:light;
}}
@media (prefers-color-scheme: dark){{
  :root:not([data-theme="light"]){{{';'.join(escuro)};color-scheme:dark}}
}}
:root[data-theme="dark"]{{{';'.join(escuro)};color-scheme:dark}}
{chr(10).join(estilos)}
"""
(PASTA / "tokens.css").write_text(css, encoding="utf-8")
print("tokens.css gerado:", len(claro), "cores,", len(outros), "outros tokens,", len(estilos), "estilos de texto")

# tokens.js: as mesmas cores para JavaScript (PDF, canvas), tema claro e escuro
cores = {"light": {}, "dark": {}}
for tk in T["color"]["tokens"]:
    v = tk["value"]
    cl = v["light"] if isinstance(v, dict) else v
    es = (v.get("dark") or cl) if isinstance(v, dict) else v
    cores["light"][tk["name"]] = cl
    cores["dark"][tk["name"]] = es
(PASTA / "tokens.js").write_text(
    "/* Nadiana — gerado de tokens.json por gerar_tokens.py. Não edite à mão. */\nwindow.NadianaTokens = "
    + json.dumps(cores, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print("tokens.js gerado")
