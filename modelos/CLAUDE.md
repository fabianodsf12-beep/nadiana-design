# Projeto Nadiana

Este projeto segue a base de design da Nadiana Agropecuária, publicada em https://fabianodsf12-beep.github.io/nadiana-design/v1/ (repositório `fabianodsf12-beep/nadiana-design`).

## Design: siga sempre a base Nadiana

Antes de criar ou mudar qualquer tela, relatório, PDF ou apresentação, leia as regras em https://github.com/fabianodsf12-beep/nadiana-design/blob/main/v1/README.md e siga.

- Carregue a base pelo endereço publicado, sem copiar os arquivos para o projeto:
  `https://fabianodsf12-beep.github.io/nadiana-design/v1/tokens.css`, `componentes.css`, `icones.js`, `nadiana.js` (e `graficos.js`, `tokens.js`, `pdf.js` quando precisar).
- Cores, espaços e cantos só por variável de `tokens.css` (`var(--brand)`, `var(--space-4)`). Não invente cor nova; se faltar uma, proponha antes de usar.
- Use os componentes `nd-` antes de criar estilo próprio. Página nova começa do `v1/modelo.html` da base.
- Cabeçalho claro com o logo (`.nd-topo`); o verde fica para ações. Navegação com `.nd-app` + `.nd-nav`.
- Ícones só do conjunto Lucide de `icones.js`; gráficos com `graficos.js` (até 4 séries, `graf-1` a `graf-4`, um eixo só); PDF com `pdf.js`.
- Fontes: Barlow (texto) e Barlow Condensed (títulos e números).
- Tema claro e escuro nos aplicativos; PDF só claro.
- Textos em português do Brasil, curtos, com os termos do campo; números no padrão brasileiro com unidade ("142,51 ha", "R$ 7.113,32", "12/10/2026"). Sem emojis.
- Toda situação (atraso, aviso, concluído) tem palavra ou ícone, não só cor.
- Contraste 4,5:1 nos dois temas; foco visível; alvos de toque de 44px ou mais.
- Logo: arquivos de `v1/logos/` da base, sem recolorir; sobre fundo escuro, dentro de placa branca (`.nd-logo`).
- Se o projeto precisar de algo que a base não tem, proponha incluir na base (repositório nadiana-design) em vez de criar só aqui.

A mesma base está no claude.ai como Design System "Nadiana" (https://claude.ai/artifact/RJR1bMDsYXqaLHa9YU91JV). Ao fazer um desenho (Design) ou artifact, use esse design system.
