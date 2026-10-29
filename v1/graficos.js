/* Nadiana — padrão dos gráficos Chart.js 4. Carregue depois do Chart.js:
   <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
   <script src="https://fabianodsf12-beep.github.io/nadiana-design/v1/graficos.js"></script>

   NadianaGraficos.aplicar();                       // uma vez, antes de criar os gráficos
   const cor = NadianaGraficos.cores();             // {graf1..graf4, outros, ...} do tema atual
   new Chart(el, NadianaGraficos.barras({...}));    // ou .linhas({...})

   Regras: até 4 séries (graf-1 a graf-4, sempre nessa ordem); o resto vai em "Outros".
   Série única não precisa de legenda: o título do cartão diz o que é. */
(function(){
  function v(n){ return getComputedStyle(document.documentElement).getPropertyValue("--" + n).trim(); }
  function fmt(x, casas){ return Number(x).toLocaleString("pt-BR", {maximumFractionDigits: casas == null ? 1 : casas}); }
  function curto(x){
    var a = Math.abs(x);
    if (a >= 1e6) return fmt(x / 1e6, 1) + " mi";
    if (a >= 1e3) return fmt(x / 1e3, a >= 1e4 ? 0 : 1) + " mil";
    return fmt(x);
  }
  var graficos = [];

  var G = {
    cores: function(){
      return { graf1: v("graf-1"), graf2: v("graf-2"), graf3: v("graf-3"), graf4: v("graf-4"), outros: v("graf-outros"),
        ink: v("ink"), muted: v("muted"), line: v("line"), line2: v("line2"), panel: v("panel") };
    },
    serie: function(i){ return ["graf-1","graf-2","graf-3","graf-4"][i] ? v(["graf-1","graf-2","graf-3","graf-4"][i]) : v("graf-outros"); },
    fmt: fmt, curto: curto,

    aplicar: function(){
      var C = window.Chart, c = G.cores(); if (!C) return;
      C.defaults.font.family = v("font-body") || "Barlow, system-ui, sans-serif";
      C.defaults.font.size = 13;
      C.defaults.color = c.muted;
      C.defaults.borderColor = c.line2;
      C.defaults.maintainAspectRatio = false;
      C.defaults.animation.duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400;
      C.defaults.plugins.legend.display = false;
      var tt = C.defaults.plugins.tooltip;
      tt.backgroundColor = c.panel; tt.titleColor = c.ink; tt.bodyColor = c.ink; tt.borderColor = c.line; tt.borderWidth = 1;
      tt.padding = 10; tt.cornerRadius = 8; tt.boxPadding = 4; tt.usePointStyle = true;
      tt.titleFont = {weight: "600"}; tt.caretSize = 0;
      C.defaults.scale.grid.color = c.line2;
      C.defaults.scale.border = {display: false};
      C.defaults.scale.ticks.color = c.muted;
      C.defaults.locale = "pt-BR";
    },

    /* Barras: {rotulos, series:[{nome, dados, token?}], unidade:"L", horizontal:false, rotuloNaPonta:true}
       token: nome de uma cor fixa para a série, ex. "graf-outros" para o convencional */
    barras: function(o){
      var hz = !!o.horizontal, un = o.unidade ? " " + o.unidade : "";
      return {
        type: "bar",
        data: { labels: o.rotulos, datasets: o.series.map(function(s, i){ return {
          label: s.nome, data: s.dados, _token: s.token, backgroundColor: s.token ? v(s.token) : G.serie(o.series.length === 1 ? 0 : i),
          maxBarThickness: 24, borderRadius: {topLeft: hz ? 0 : 4, topRight: 4, bottomRight: hz ? 4 : 0, bottomLeft: 0},
          borderSkipped: "start", borderColor: G.cores().panel, borderWidth: o.series.length > 1 ? {left: 1, right: 1} : 0
        }; }) },
        options: {
          indexAxis: hz ? "y" : "x",
          layout: { padding: (o.rotuloNaPonta !== false && o.series.length === 1) ? { top: hz ? 0 : 22, right: hz ? 56 : 0 } : 0 },
          interaction: { mode: "index", intersect: false },
          scales: {
            x: hz ? { beginAtZero: true, ticks: { callback: function(x){ return curto(x); } } } : { grid: { display: false } },
            y: hz ? { grid: { display: false } } : { beginAtZero: true, ticks: { callback: function(x){ return curto(x); } } }
          },
          plugins: {
            legend: { display: o.series.length > 1, position: "top", align: "start", labels: { usePointStyle: true, pointStyle: "rectRounded", boxWidth: 10, boxHeight: 10, color: G.cores().ink } },
            tooltip: { callbacks: { label: function(ctx){ return " " + ctx.dataset.label + ": " + fmt(hz ? ctx.parsed.x : ctx.parsed.y) + un; } } },
            ndRotulo: { ativo: o.rotuloNaPonta !== false && o.series.length === 1, unidade: un }
          }
        },
        plugins: [rotuloNaPonta]
      };
    },

    /* Linhas: {rotulos, series:[{nome, dados}], unidade:"ha", area:false} */
    linhas: function(o){
      var un = o.unidade ? " " + o.unidade : "";
      return {
        type: "line",
        data: { labels: o.rotulos, datasets: o.series.map(function(s, i){
          var cor = s.token ? v(s.token) : G.serie(i);
          return { label: s.nome, data: s.dados, _token: s.token, borderColor: cor, backgroundColor: o.area ? cor + "1A" : cor, fill: !!o.area,
            borderWidth: 2, tension: 0.3, pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2,
            pointHoverBorderColor: G.cores().panel, pointBackgroundColor: cor, borderCapStyle: "round", borderJoinStyle: "round" };
        }) },
        options: {
          interaction: { mode: "index", intersect: false },
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: function(x){ return curto(x); } } } },
          plugins: {
            legend: { display: o.series.length > 1, position: "top", align: "start", labels: { usePointStyle: true, pointStyle: "line", boxWidth: 16, color: G.cores().ink } },
            tooltip: { callbacks: { label: function(ctx){ return " " + ctx.dataset.label + ": " + fmt(ctx.parsed.y) + un; } } }
          }
        },
        plugins: [linhaGuia]
      };
    },

    /* Lembra o gráfico para trocar as cores quando o tema mudar */
    registrar: function(ch){ graficos.push(ch); return ch; }
  };

  /* Valor na ponta da barra (série única), na cor do texto */
  var rotuloNaPonta = { id: "ndRotulo", afterDatasetsDraw: function(ch, a, op){
    if (!op || !op.ativo) return;
    var ctx = ch.ctx, hz = ch.options.indexAxis === "y";
    ctx.save(); ctx.fillStyle = v("ink"); ctx.font = "600 13px " + (v("font-body") || "sans-serif");
    ctx.textAlign = hz ? "left" : "center"; ctx.textBaseline = hz ? "middle" : "bottom";
    ch.getDatasetMeta(0).data.forEach(function(el, i){
      var val = ch.data.datasets[0].data[i]; if (val == null) return;
      ctx.fillText(fmt(val) + op.unidade, hz ? el.x + 6 : el.x, hz ? el.y : el.y - 6);
    });
    ctx.restore();
  }};
  /* Linha vertical sob o cursor nos gráficos de linha */
  var linhaGuia = { id: "ndGuia", afterDraw: function(ch){
    var at = ch.tooltip && ch.tooltip.getActiveElements(); if (!at || !at.length) return;
    var x = at[0].element.x, a = ch.chartArea, ctx = ch.ctx;
    ctx.save(); ctx.strokeStyle = v("line"); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, a.top); ctx.lineTo(x, a.bottom); ctx.stroke(); ctx.restore();
  }};

  function retemar(){
    if (!window.Chart) return;
    G.aplicar();
    graficos.forEach(function(ch){
      var n = ch.data.datasets.length;
      ch.data.datasets.forEach(function(d, i){
        var cor = d._token ? v(d._token) : G.serie(ch.config.type === "bar" && n === 1 ? 0 : i);
        if (ch.config.type === "line") { d.borderColor = cor; d.pointBackgroundColor = cor; d.backgroundColor = d.fill ? cor + "1A" : cor; d.pointHoverBorderColor = v("panel"); }
        else { d.backgroundColor = cor; d.borderColor = v("panel"); }
      });
      ["x","y"].forEach(function(k){ var s = ch.options.scales[k]; if (s) { s.ticks.color = v("muted"); s.grid.color = v("line2"); } });
      var lg = ch.options.plugins.legend; if (lg && lg.labels) lg.labels.color = v("ink");
      var tt = ch.options.plugins.tooltip; tt.backgroundColor = v("panel"); tt.titleColor = v("ink"); tt.bodyColor = v("ink"); tt.borderColor = v("line");
      ch.update("none");
    });
  }
  document.addEventListener("nd-tema", function(){ requestAnimationFrame(retemar); });
  new MutationObserver(function(){ requestAnimationFrame(retemar); }).observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});

  window.NadianaGraficos = G;
})();
