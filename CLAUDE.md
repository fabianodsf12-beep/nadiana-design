# Base de design Nadiana

Este repositório é a base de design de todos os projetos da Nadiana Agronegócios, publicada no GitHub Pages em https://fabianodsf12-beep.github.io/nadiana-design/v1/. Vários apps carregam estes arquivos direto desse endereço: uma mudança aqui aparece em todos eles.

## Ao mudar a base

- Leia `v1/README.md` antes. Ele é o manual da marca.
- `v1/tokens.json` é a fonte única dos valores e deve ficar igual ao `project/tokens.json` do Design System "Nadiana" no claude.ai (https://claude.ai/artifact/RJR1bMDsYXqaLHa9YU91JV). Mudou um, leve para o outro.
- `v1/tokens.css`, `v1/tokens.js` e `v1/icones.js` são gerados por `v1/gerar_tokens.py` e `v1/gerar_icones.py`. Não edite à mão.
- Em `v1/`, só mudanças que não quebram os apps: nada de renomear ou tirar classe `nd-`, variável CSS ou função de `nadiana.js`, `graficos.js` e `pdf.js`. Mudança que quebra vai para `v2/`.
- Componente novo: prefixo `nd-`, só variáveis de `tokens.css`, tema claro e escuro, alvos de toque de 44px, foco visível. Mostre na `v1/vitrine.html` e descreva no `v1/README.md`.
- Não invente cor: se faltar uma, proponha ao usuário antes.
- Confira a vitrine no celular e no computador, nos dois temas, antes de enviar.
- Textos em português do Brasil, sem emojis.
