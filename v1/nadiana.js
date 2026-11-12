/* Nadiana — comportamentos dos componentes nd-. Sem dependências.
   <script src="https://fabianodsf12-beep.github.io/nadiana-design/v1/nadiana.js" defer></script> */
(function(){
  var N = {};
  /* Endereço da base (para achar o símbolo usado na abertura) */
  var BASE = ((document.currentScript && document.currentScript.src) || "").replace(/[^\/]*$/, "");

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

  /* ---------- Toque e troca de tela ---------- */

  /* Menu que nasce do botão: <button data-nd-menu="m1" aria-haspopup="menu" aria-expanded="false">, <div class="nd-menu" id="m1" role="menu">.
     Abre e fecha no botão; fecha ao escolher, ao tocar fora, com Esc e com Tab; setas sobem e descem */
  function botaoDoMenu(m){ return m.id ? document.querySelector('[data-nd-menu="' + m.id + '"]') : null; }
  function itensDoMenu(m){ return Array.prototype.slice.call(m.querySelectorAll(":scope > button:not([disabled]), :scope > a")); }
  function fechaMenu(m, focar){
    if (!m.classList.contains("aberto")) return; m.classList.remove("aberto");
    var b = botaoDoMenu(m); if (b) { b.setAttribute("aria-expanded", "false"); if (focar) b.focus(); }
  }
  N.menu = function(m, abrir){
    if (typeof m === "string") m = document.getElementById(m); if (!m) return;
    if (abrir == null) abrir = !m.classList.contains("aberto");
    document.querySelectorAll(".nd-menu.aberto").forEach(function(x){ if (x !== m) fechaMenu(x); });
    if (!abrir) { fechaMenu(m); return; }
    m.classList.add("aberto"); var b = botaoDoMenu(m); if (b) b.setAttribute("aria-expanded", "true");
    var it = itensDoMenu(m); if (it[0]) it[0].focus({preventScroll: true});
  };
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-nd-menu]");
    if (b) { e.preventDefault(); N.menu(b.getAttribute("data-nd-menu")); return; }
    var item = e.target.closest && e.target.closest(".nd-menu > button, .nd-menu > a");
    document.querySelectorAll(".nd-menu.aberto").forEach(function(m){
      if (item && m.contains(item)) fechaMenu(m, true); else if (!m.contains(e.target)) fechaMenu(m);
    });
  });
  document.addEventListener("keydown", function(e){
    var m = document.querySelector(".nd-menu.aberto"); if (!m) return;
    if (e.key === "Escape") { e.preventDefault(); fechaMenu(m, true); return; }
    if (e.key === "Tab") { fechaMenu(m); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); var it = itensDoMenu(m), i = it.indexOf(document.activeElement);
      i = e.key === "ArrowDown" ? (i + 1) % it.length : (i <= 0 ? it.length - 1 : i - 1); if (it[i]) it[i].focus();
    }
  });

  /* Número que rola: Nadiana.rolar(el, 4). Num .nd-selo, troca o número, dá um pulinho e some quando zera */
  var lerNum = function(t){ var v = parseFloat(String(t).replace(/\./g, "").replace(",", ".")); return isNaN(v) ? 0 : v; };
  N.rolar = function(el, novo){
    var txt = typeof novo === "number" ? N.num(novo, Math.round(novo) === novo ? 0 : 2) : String(novo);
    var atual = el._ndRola != null ? el._ndRola : lerNum(el.textContent), v = lerNum(novo);
    el._ndRola = v;
    if (el.classList.contains("nd-selo")) {
      el.textContent = txt; el.hidden = !v;
      if (!calmo() && v) { el.classList.remove("pinga"); void el.offsetWidth; el.classList.add("pinga"); }
      return;
    }
    el.classList.add("nd-rola");
    if (calmo() || v === atual) { el.innerHTML = ""; var s0 = document.createElement("span"); s0.textContent = txt; el.appendChild(s0); return; }
    el.classList.toggle("desce", v < atual);
    var velho = el.lastElementChild;
    if (!velho || velho.tagName !== "SPAN") { velho = document.createElement("span"); velho.textContent = el.textContent; el.textContent = ""; el.appendChild(velho); }
    Array.prototype.slice.call(el.children).forEach(function(x){ if (x !== velho) x.remove(); });
    velho.className = "sai";
    var n = document.createElement("span"); n.className = "entra"; n.textContent = txt; el.appendChild(n);
    setTimeout(function(){ velho.remove(); n.className = ""; }, 320);
  };

  /* Troca de tela: Nadiana.trocar(telaAtual, telaNova, {modo}) troca o hidden das duas;
     ou Nadiana.trocar(function(){ …a troca do app… }, {modo, para}).
     modo: "suave" (abas, padrão), "frente" (abrir), "volta" (voltar),
     "cresce" (cartão vira a tela nova: {cartao}) e "encolhe" (a tela volta para o cartão: {cartao}).
     Usa as View Transitions do navegador; sem elas, a tela nova só aparece subindo de leve */
  N.trocar = function(a, b, op){
    var muda, de, para;
    if (typeof a === "function") { muda = a; op = b || {}; de = op.de || null; para = op.para || null; }
    else { op = op || {}; de = a; para = b; muda = function(){ if (de) de.hidden = true; if (para) para.hidden = false; }; }
    var modo = op.modo || "suave", c = op.cartao || null;
    var antes = modo === "cresce" ? c : modo === "encolhe" ? de : null;
    var depois = modo === "cresce" ? para : modo === "encolhe" ? c : null;
    if (calmo() || !document.startViewTransition) {
      muda();
      var alvo = depois || para;
      if (alvo && !calmo()) {
        alvo.classList.remove("nd-aparece", "frente", "volta"); void alvo.offsetWidth;
        alvo.classList.add("nd-aparece"); if (modo === "frente" || modo === "volta") alvo.classList.add(modo);
        alvo.addEventListener("animationend", function fim(){ alvo.classList.remove("nd-aparece", "frente", "volta"); alvo.removeEventListener("animationend", fim); });
      }
      return Promise.resolve();
    }
    var html = document.documentElement;
    html.dataset.ndTroca = modo === "encolhe" ? "cresce" : modo;
    if (antes) antes.style.viewTransitionName = "nd-cresce";
    var vt = document.startViewTransition(function(){
      muda(); if (antes) antes.style.viewTransitionName = ""; if (depois) depois.style.viewTransitionName = "nd-cresce";
    });
    html._ndVt = vt;
    return vt.finished.catch(function(){}).then(function(){
      if (depois) depois.style.viewTransitionName = ""; if (antes) antes.style.viewTransitionName = "";
      if (html._ndVt === vt) delete html.dataset.ndTroca;
    });
  };

  /* Marcador da navegação que desliza: .nd-nav.desliza (o marcador é criado aqui).
     Segue o item com aria-current="page" (ou aria-selected="true"), quando a página troca o item ou o tamanho muda */
  var obsNavTam = window.ResizeObserver ? new ResizeObserver(function(){ requestAnimationFrame(marcaNav); }) : null;
  var obsNav = new MutationObserver(function(){ marcaNav(); });
  function marcaNav(){
    document.querySelectorAll(".nd-nav.desliza").forEach(function(n){
      var m = n.querySelector(":scope > .nd-nav-marca");
      if (!m) { m = document.createElement("i"); m.className = "nd-nav-marca parado"; m.setAttribute("aria-hidden", "true"); n.prepend(m); }
      if (!n._ndObs) { n._ndObs = 1; if (obsNavTam) obsNavTam.observe(n); obsNav.observe(n, {attributes: true, subtree: true, attributeFilter: ["aria-current", "aria-selected"]}); }
      var at = n.querySelector(':scope > [aria-current="page"], :scope > [aria-selected="true"]');
      if (!at || !at.offsetWidth) { m.style.opacity = "0"; return; }
      m.style.opacity = "";
      var largo = matchMedia("(min-width:900px)").matches, alvo = largo ? at : (at.querySelector(".nd-ic") || at);
      var nr = n.getBoundingClientRect(), r = alvo.getBoundingClientRect();
      var x = r.left - nr.left - n.clientLeft + n.scrollLeft, y = r.top - nr.top - n.clientTop + n.scrollTop;
      var w = r.width + "px", h = r.height + "px", t = "translate(" + x + "px," + y + "px)";
      if (m.style.width !== w) m.style.width = w; if (m.style.height !== h) m.style.height = h; if (m.style.transform !== t) m.style.transform = t;
      if (m.classList.contains("parado")) requestAnimationFrame(function(){ requestAnimationFrame(function(){ m.classList.remove("parado"); }); });
      if (n._ndAtual && n._ndAtual !== at && !calmo()) {
        var ic = at.querySelector(".nd-ic"); if (ic) { ic.classList.remove("pula"); void ic.getBoundingClientRect(); ic.classList.add("pula"); }
      }
      n._ndAtual = at;
    });
  }
  N.marcaNav = marcaNav;
  addEventListener("resize", marcaNav);
  quando(function(){ marcaNav(); if (document.fonts) document.fonts.ready.then(marcaNav); });

  /* ---------- Carregamento ---------- */

  /* Esqueleto que vira conteúdo: Nadiana.pronto(el) mostra o .conteudo; Nadiana.pronto(el, false) volta ao .esqueleto */
  N.pronto = function(el, sim){
    if (sim === false) { el.removeAttribute("data-pronto"); el.setAttribute("aria-busy", "true"); }
    else { el.setAttribute("data-pronto", ""); el.removeAttribute("aria-busy"); }
  };

  /* Abertura com o símbolo: Nadiana.abertura("Abrindo o Painel") cobre a tela (só aparece se demorar mais de 400 ms, ou {atraso});
     Nadiana.abertura.frase("Buscando a planilha") troca a frase; Nadiana.abertura.fim() some com ela */
  N.abertura = function(texto, op){
    op = op || {};
    var a = document.querySelector(".nd-abertura");
    if (!a) {
      a = document.createElement("div"); a.className = "nd-abertura"; a.setAttribute("role", "status"); a.setAttribute("aria-live", "polite");
      a.innerHTML = '<div class="roda"><svg viewBox="0 0 112 112" aria-hidden="true"><circle class="fundo" cx="56" cy="56" r="50"/><circle class="arco" cx="56" cy="56" r="50"/></svg><img alt="Nadiana"></div><p></p>';
      a.querySelector("img").src = op.simbolo || BASE + "logos/nadiana-simbolo.svg";
      a.hidden = true; document.body.appendChild(a);
    }
    a.classList.remove("sai"); clearTimeout(a._ndSai);
    a.querySelector("p").textContent = texto || "Carregando";
    clearTimeout(a._ndAtraso);
    var atraso = op.atraso == null ? 400 : op.atraso;
    if (atraso && a.hidden) a._ndAtraso = setTimeout(function(){ a.hidden = false; }, atraso); else a.hidden = false;
    return a;
  };
  N.abertura.frase = function(t){ var a = document.querySelector(".nd-abertura"); if (a) a.querySelector("p").textContent = t; };
  N.abertura.fim = function(){
    var a = document.querySelector(".nd-abertura"); if (!a) return;
    clearTimeout(a._ndAtraso);
    if (a.hidden || calmo()) { a.remove(); return; }
    a.classList.add("sai"); a._ndSai = setTimeout(function(){ a.remove(); }, 340);
  };

  /* Barra com etapas: var c = Nadiana.etapas(el, ["Conectando à planilha", "Lendo os talhões"], {titulo, demora, textoDemora});
     c.etapa(1) passa para a etapa 2; c.progresso(0.6) manda a barra quando o app sabe a porcentagem; c.fim() completa.
     Se passar do tempo de demora (4 s), aparece o aviso de demora */
  N.etapas = function(el, lista, op){
    op = op || {};
    var titulo = op.titulo || "Carregando";
    el.classList.add("nd-etapas"); el.setAttribute("aria-busy", "true");
    el.innerHTML = '<div class="topo"><span></span><b>0%</b></div><div class="nd-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i style="--v:0%"></i></div><ol></ol>' +
      '<div class="nd-msg aviso" hidden><svg class="nd-ic" aria-hidden="true"><use href="#i-clock"/></svg><span></span></div>';
    el.querySelector(".topo span").textContent = titulo;
    var barra = el.querySelector(".nd-barra"), pct = el.querySelector(".topo b"), ol = el.querySelector("ol"), msg = el.querySelector(".nd-msg");
    barra.setAttribute("aria-label", titulo);
    msg.querySelector("span").textContent = op.textoDemora || "Está demorando mais que o normal. A planilha pode estar lenta.";
    var lis = (lista || []).map(function(t){ var li = document.createElement("li"); li.innerHTML = "<i></i><span></span>"; li.lastChild.textContent = t; ol.appendChild(li); return li; });
    var atual = 0, prog = 0, auto = true, n = Math.max(1, lis.length);
    function poe(p){ prog = Math.max(prog, Math.min(1, p)); var v = Math.round(prog * 100);
      barra.firstChild.style.setProperty("--v", v + "%"); barra.setAttribute("aria-valuenow", v); pct.textContent = v + "%"; }
    function etapa(i){
      atual = i;
      lis.forEach(function(li, j){ var c = j < i ? "feita" : j === i ? "agora" : "";
        if (li.className !== c) { li.className = c; li.firstChild.innerHTML = c === "feita" ? '<svg class="nd-ic" aria-hidden="true"><use href="#i-circle-check"/></svg>' : ""; } });
      if (auto) poe(i / n);
    }
    /* entre uma etapa e outra a barra anda devagar, sem passar da etapa em curso */
    var anda = setInterval(function(){ if (!auto) return; var alvo = (atual + .85) / n; if (prog < alvo) poe(prog + (alvo - prog) * .08); }, 200);
    var demora = setTimeout(function(){ msg.hidden = false; }, op.demora || 4000);
    etapa(0);
    return {
      etapa: etapa,
      progresso: function(p){ auto = false; poe(p); },
      fim: function(){ clearInterval(anda); clearTimeout(demora); etapa(lis.length); poe(1); msg.hidden = true; el.removeAttribute("aria-busy"); }
    };
  };

  window.Nadiana = N;
})();
