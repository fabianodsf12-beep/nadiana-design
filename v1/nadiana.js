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

  /* ---------- Movimento ---------- */
  var calmo = function(){ return matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var vibra = function(ms){ try { if (navigator.vibrate) navigator.vibrate(ms); } catch(e) {} };
  var quando = function(fn){ if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); };

  /* Toque com onda: qualquer elemento com .nd-onda */
  document.addEventListener("pointerdown", function(e){
    var b = e.target.closest && e.target.closest(".nd-onda"); if (!b || calmo() || b.disabled) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, g = document.createElement("span");
    g.className = "nd-onda-gota";
    g.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
    b.appendChild(g); g.addEventListener("animationend", function(){ g.remove(); });
  });

  /* Botão com estado: <button class="nd-btn primario nd-estado" data-enviando="Enviando…" data-feito="Salvo">Salvar execução</button>
     Nadiana.estado(botao, "enviando") → Nadiana.estado(botao, "feito") (volta sozinho) ou Nadiana.estado(botao, null) */
  function prepara(b){
    if (b.querySelector(":scope > .rot")) return;
    var rot = document.createElement("span"); rot.className = "rot";
    while (b.firstChild) rot.appendChild(b.firstChild);
    var env = document.createElement("span"); env.className = "env"; env.setAttribute("aria-hidden", "true");
    env.innerHTML = '<i class="nd-giro"></i><span></span>'; env.lastChild.textContent = b.dataset.enviando || "Enviando…";
    var ok = document.createElement("span"); ok.className = "ok"; ok.setAttribute("aria-hidden", "true");
    ok.innerHTML = '<svg class="nd-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1"/></svg><span></span>';
    ok.lastChild.textContent = b.dataset.feito || "Salvo";
    b.append(rot, env, ok);
  }
  N.estado = function(b, estado){
    prepara(b); clearTimeout(b._ndVolta);
    if (!estado) { delete b.dataset.estado; b.removeAttribute("aria-busy"); b.disabled = false; return; }
    b.dataset.estado = estado;
    if (estado === "enviando") { b.setAttribute("aria-busy", "true"); b.disabled = true; }
    if (estado === "feito") { b.removeAttribute("aria-busy"); vibra(30); b._ndVolta = setTimeout(function(){ N.estado(b, null); }, 1800); }
  };

  /* Segurar para confirmar: <button class="nd-btn nd-segurar" data-tempo="1200">Segure para excluir</button>
     Ao encher, dispara o evento "nd-confirma" no botão */
  var seg = {b: null, ini: 0, raf: 0};
  function comeca(e){
    var b = e.target.closest && e.target.closest(".nd-segurar"); if (!b || b.disabled) return;
    if (e.type === "keydown") { if (e.repeat || (e.key !== " " && e.key !== "Enter")) return; e.preventDefault(); }
    if (seg.b) return;
    if (!b.querySelector(":scope > .enche")) { var en = document.createElement("span"); en.className = "enche"; b.prepend(en); }
    var tempo = +(b.dataset.tempo || 1200);
    seg.b = b; seg.ini = performance.now(); b.classList.remove("volta");
    var passo = function(t){
      if (seg.b !== b) return;
      var p = Math.min(1, (t - seg.ini) / tempo); b.style.setProperty("--p", p);
      if (p >= 1) { seg.b = null; vibra(40); b.dispatchEvent(new CustomEvent("nd-confirma", {bubbles: true}));
        setTimeout(function(){ b.classList.add("volta"); b.style.setProperty("--p", 0); }, 400); return; }
      seg.raf = requestAnimationFrame(passo);
    };
    seg.raf = requestAnimationFrame(passo);
  }
  function para(){ if (!seg.b) return; var b = seg.b; seg.b = null; cancelAnimationFrame(seg.raf); b.classList.add("volta"); b.style.setProperty("--p", 0); }
  document.addEventListener("pointerdown", comeca); document.addEventListener("keydown", comeca);
  ["pointerup", "pointercancel", "keyup"].forEach(function(ev){ document.addEventListener(ev, para); });
  document.addEventListener("pointerout", function(e){ if (seg.b && e.target.closest && e.target.closest(".nd-segurar") === seg.b && !seg.b.contains(e.relatedTarget)) para(); });
  document.addEventListener("contextmenu", function(e){ if (e.target.closest && e.target.closest(".nd-segurar")) e.preventDefault(); });

  /* Seletor com pílula que desliza: .nd-seg.desliza ou .nd-desliza (a pílula é criada aqui).
     Ela se reposiciona ao tocar, quando o seletor aparece ou muda de tamanho e quando a página troca o aria-pressed */
  var obsTam = window.ResizeObserver ? new ResizeObserver(function(){ requestAnimationFrame(pilulas); }) : null;
  var obsMarca = new MutationObserver(function(){ requestAnimationFrame(pilulas); });
  function pilulas(){
    document.querySelectorAll(".nd-seg.desliza, .nd-desliza").forEach(function(g){
      var p = g.querySelector(":scope > .pilula");
      if (!p) { p = document.createElement("i"); p.className = "pilula"; p.setAttribute("aria-hidden", "true"); g.prepend(p); }
      if (!g._ndObs) { g._ndObs = 1; if (obsTam) obsTam.observe(g); obsMarca.observe(g, {attributes: true, subtree: true, attributeFilter: ["aria-pressed"]}); }
      var b = g.querySelector(':scope > button[aria-pressed="true"]'); if (!b || !b.offsetWidth) return;
      var w = b.offsetWidth + "px", t = "translateX(" + b.offsetLeft + "px)";
      if (p.style.width !== w) p.style.width = w;
      if (p.style.transform !== t) p.style.transform = t;
    });
  }
  N.pilulas = pilulas;
  document.addEventListener("click", function(e){ if (e.target.closest && e.target.closest(".nd-seg.desliza, .nd-desliza")) requestAnimationFrame(pilulas); });
  addEventListener("resize", pilulas);
  quando(function(){ pilulas(); if (document.fonts) document.fonts.ready.then(pilulas); });

  /* Números que contam: <span data-nd-conta="142.51" data-casas="2">142,51</span>
     Sobe até o valor quando aparece na tela. Nadiana.contar(el, novoValor) conta do valor atual até o novo */
  N.contar = function(el, alvo){
    var c = +(el.dataset.casas || 0), de = el._ndValor || 0;
    if (alvo == null) alvo = +el.dataset.ndConta; else { el.dataset.ndConta = alvo; }
    el._ndValor = alvo;
    if (calmo()) { el.textContent = N.num(alvo, c); return; }
    var t0 = performance.now(), dur = 1000;
    var passo = function(t){ var p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      el.textContent = N.num(de + (alvo - de) * k, c); if (p < 1) requestAnimationFrame(passo); };
    requestAnimationFrame(passo);
  };
  /* Confirmação com visto desenhado: Nadiana.feito(el) toca de novo; também toca quando aparece na tela */
  function tocaFeito(el){ if (calmo()) return; el.classList.remove("toca"); void el.getBoundingClientRect(); el.classList.add("toca"); }
  N.feito = function(el){ tocaFeito(el); vibra(30); };
  quando(function(){
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){
      if (!e.isIntersecting) return; io.unobserve(e.target);
      if (e.target.matches("[data-nd-conta]")) N.contar(e.target); else tocaFeito(e.target);
    }); }, {threshold: .5});
    document.querySelectorAll("[data-nd-conta], .nd-feito").forEach(function(x){ io.observe(x); });
    document.querySelectorAll(".nd-estado").forEach(prepara);
  });

  window.Nadiana = N;
})();
