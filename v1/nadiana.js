/* Nadiana — comportamentos dos componentes nd-. Sem dependências.
   <script src="https://fabianodsf12-beep.github.io/nadiana-design/v1/nadiana.js" defer></script> */
(function(){
  var N = {};

  /* Aviso rápido: Nadiana.aviso("Execução registrada", {icone:"circle-check", acao:"Desfazer", aoAgir:fn}) */
  N.aviso = function(texto, op){
    op = op || {};
    /* Com uma folha aberta, o aviso vai dentro dela para não ficar escondido atrás */
    var pai = document.querySelector("dialog.nd-folha[open]") || document.body;
    var box = pai.querySelector(":scope > .nd-toasts");
    if (!box) { box = document.createElement("div"); box.className = "nd-toasts"; box.setAttribute("role","status"); box.setAttribute("aria-live","polite"); pai.appendChild(box); }
    var t = document.createElement("div"); t.className = "nd-toast";
    t.innerHTML = '<svg class="nd-ic" aria-hidden="true"><use href="#i-' + (op.icone || "circle-check") + '"/></svg><span></span>';
    t.querySelector("span").textContent = texto;
    if (op.acao) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = op.acao;
      b.onclick = function(){ if (op.aoAgir) op.aoAgir(); fechar(); };
      t.appendChild(b);
    }
    box.appendChild(t);
    var timer = setTimeout(fechar, op.tempo || 4000);
    function fechar(){ clearTimeout(timer); t.classList.add("sai"); setTimeout(function(){ t.remove(); }, 220); }
    return fechar;
  };

  /* Tema: Nadiana.tema() diz "light"/"dark"; Nadiana.trocarTema() alterna e lembra a escolha */
  N.tema = function(){
    var t = document.documentElement.dataset.theme;
    return t || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  };
  N.trocarTema = function(){
    var novo = N.tema() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem("nadiana.tema", novo); } catch(e) {}
    document.dispatchEvent(new CustomEvent("nd-tema", {detail: novo}));
    return novo;
  };
  try { var salvo = localStorage.getItem("nadiana.tema"); if (salvo) document.documentElement.dataset.theme = salvo; } catch(e) {}
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(){
    document.dispatchEvent(new CustomEvent("nd-tema", {detail: N.tema()}));
  });

  /* Formatação no padrão brasileiro */
  N.num = function(v, casas){ return Number(v).toLocaleString("pt-BR", {minimumFractionDigits: casas || 0, maximumFractionDigits: casas || 0}); };
  N.reais = function(v){ return Number(v).toLocaleString("pt-BR", {style: "currency", currency: "BRL"}); };
  N.data = function(d){ return new Date(d).toLocaleDateString("pt-BR", {timeZone: "UTC"}); };

  /* Seletor, abas e filtros: um clique marca o botão; o evento "nd-muda" avisa a página */
  document.addEventListener("click", function(e){
    var b = e.target.closest(".nd-seg button, .nd-abas button, .nd-filtro, [data-nd-abrir], [data-nd-fechar], [data-nd-tema]");
    if (!b) return;
    if (b.matches(".nd-seg button")) {
      Array.prototype.forEach.call(b.parentNode.children, function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      b.parentNode.dispatchEvent(new CustomEvent("nd-muda", {bubbles: true, detail: b.value || b.textContent.trim()}));
    } else if (b.matches(".nd-abas button")) {
      Array.prototype.forEach.call(b.parentNode.children, function(x){
        var sel = x === b; x.setAttribute("aria-selected", sel ? "true" : "false");
        var p = x.getAttribute("aria-controls"); if (p && document.getElementById(p)) document.getElementById(p).hidden = !sel;
      });
      b.parentNode.dispatchEvent(new CustomEvent("nd-muda", {bubbles: true, detail: b.value || b.textContent.trim()}));
    } else if (b.matches(".nd-filtro")) {
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
      b.dispatchEvent(new CustomEvent("nd-muda", {bubbles: true}));
    } else if (b.hasAttribute("data-nd-abrir")) {
      var d = document.getElementById(b.getAttribute("data-nd-abrir")); if (d && d.showModal) d.showModal();
    } else if (b.hasAttribute("data-nd-fechar")) {
      var f = b.closest("dialog"); if (f) f.close();
    } else if (b.hasAttribute("data-nd-tema")) {
      N.trocarTema();
    }
  });
  /* Folha: tocar fora fecha */
  document.addEventListener("click", function(e){
    if (e.target.matches && e.target.matches("dialog.nd-folha")) e.target.close();
  });

  window.Nadiana = N;
})();
