/* Nadiana — padrão dos relatórios em PDF (jsPDF 2.5 + autoTable 3.8). Só tema claro.
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
   <script src="https://fabianodsf12-beep.github.io/nadiana-design/v1/tokens.js"></script>
   <script src="https://fabianodsf12-beep.github.io/nadiana-design/v1/pdf.js"></script>

   const r = await NadianaPDF.novo({titulo: "Aplicações da semana", subtitulo: "Fazenda Reata · soja 26/27",
                                    logo: "https://fabianodsf12-beep.github.io/nadiana-design/v1/logos/nadiana-simbolo.png"});
   r.kpis([{rotulo: "Área aplicada", valor: "142,51", unidade: "ha"}, ...]);
   r.secao("Produtos");
   r.tabela({cabecalho: ["Produto","Dose","Total"], linhas: [...], numericas: [1,2], total: ["Total","","488,6 L"]});
   r.texto("Observação ...");
   r.salvar("aplicacoes-semana.pdf");

   O logo precisa ser servido pelo mesmo endereço da página (não funciona abrindo o arquivo direto do disco).
   Fonte: Barlow (texto) e Barlow Condensed (título e números), lidas de fonts/*.ttf ao lado deste arquivo,
   porque o jsPDF não lê woff2. Se as fontes não carregarem (página aberta direto do disco, sem rede),
   o relatório sai em Helvetica, como antes. */
(function(){
  var T = (window.NadianaTokens || {}).light || {};
  function rgb(h){ h = (h || "#000000").replace("#",""); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
  var C = { ink: rgb(T.ink), muted: rgb(T.muted), line: rgb(T.line), line2: rgb(T.line2), panel2: rgb(T.panel2),
            verde: rgb(T["nadiana-verde"]), petroleo: rgb(T["nadiana-petroleo"]), soft: rgb(T["brand-soft"]) };
  var M = 15; // margem em mm
  var BASE = ((document.currentScript && document.currentScript.src) || "").replace(/[^\/]*$/, "");
  /* [arquivo, família, estilo]: Barlow 400 e 600 no texto, Barlow Condensed 600 em título e números */
  var FONTES = [["Barlow-400.ttf", "Barlow", "normal"], ["Barlow-600.ttf", "Barlow", "bold"], ["BarlowCondensed-600.ttf", "BarlowCondensed", "bold"]];
  var lidas = null;
  function lerFontes(){
    if (!lidas) lidas = Promise.all(FONTES.map(function(f){
      return fetch(BASE + "fonts/" + f[0]).then(function(r){ if (!r.ok) throw new Error(f[0]); return r.arrayBuffer(); }).then(function(buf){
        var u = new Uint8Array(buf), s = "";
        for (var i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768));
        return [f[0], f[1], f[2], btoa(s)];
      });
    })).catch(function(){ lidas = null; return null; });
    return lidas;
  }

  function carregar(src){
    return new Promise(function(ok){
      if (!src) return ok(null);
      var im = new Image(); im.crossOrigin = "anonymous";
      im.onload = function(){
        try { var c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
              c.getContext("2d").drawImage(im, 0, 0); ok({url: c.toDataURL("image/png"), w: im.naturalWidth, h: im.naturalHeight}); }
        catch(e) { ok(null); }
      };
      im.onerror = function(){ ok(null); };
      im.src = src;
    });
  }

  function hoje(){ return new Date().toLocaleDateString("pt-BR"); }

  window.NadianaPDF = {
    novo: function(op){
      op = op || {};
      var J = window.jspdf && window.jspdf.jsPDF;
      if (!J) throw new Error("Carregue o jsPDF antes de pdf.js");
      var doc = new J({unit: "mm", format: "a4", orientation: op.paisagem ? "landscape" : "portrait"});
      var W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
      return Promise.all([carregar(op.logo), lerFontes()]).then(function(res){
        var logo = res[0], fontes = res[1], FT = "helvetica", FN = "helvetica";
        if (fontes) { fontes.forEach(function(f){ doc.addFileToVFS(f[0], f[3]); doc.addFont(f[0], f[1], f[2]); }); FT = "Barlow"; FN = "BarlowCondensed"; }
        var r = { doc: doc, y: 0 };

        function cabecalho(){
          var y = M;
          if (logo) { var lh = 9, lw = lh * logo.w / logo.h; doc.addImage(logo.url, "PNG", M, y, lw, lh); }
          else { doc.setFont(FT,"bold"); doc.setFontSize(12); doc.setTextColor.apply(doc, C.petroleo); doc.text("NADIANA", M, y + 5); }
          doc.setFont(FT,"normal"); doc.setFontSize(8.5); doc.setTextColor.apply(doc, C.muted);
          doc.text("Gerado em " + hoje(), W - M, y + 4.5, {align: "right"});
          y += 13;
          doc.setFillColor.apply(doc, C.verde); doc.rect(M, y, 18, 1.2, "F");
          doc.setDrawColor.apply(doc, C.line2); doc.setLineWidth(0.2); doc.line(M + 18, y + 0.6, W - M, y + 0.6);
          return y + 8;
        }
        r.y = cabecalho();
        doc.setFont(FN,"bold"); doc.setFontSize(22); doc.setTextColor.apply(doc, C.petroleo);
        doc.text(op.titulo || "Relatório", M, r.y + 2); r.y += 8;
        if (op.subtitulo) { doc.setFont(FT,"normal"); doc.setFontSize(10.5); doc.setTextColor.apply(doc, C.muted); doc.text(op.subtitulo, M, r.y + 1); r.y += 7; }
        r.y += 3;

        function espaco(h){ if (r.y + h > H - M - 10) { doc.addPage(); r.y = cabecalho(); } }

        r.secao = function(t){
          espaco(14); r.y += 3;
          doc.setFont(FN,"bold"); doc.setFontSize(14); doc.setTextColor.apply(doc, C.ink);
          doc.text(t, M, r.y + 4); r.y += 9;
          return r;
        };
        r.texto = function(t){
          doc.setFont(FT,"normal"); doc.setFontSize(10); doc.setTextColor.apply(doc, C.ink);
          var ls = doc.splitTextToSize(t, W - 2 * M); espaco(ls.length * 4.6 + 2);
          doc.text(ls, M, r.y + 3.5, {lineHeightFactor: 1.4}); r.y += ls.length * 4.6 + 3;
          return r;
        };
        /* Números em destaque: até 4 por linha */
        r.kpis = function(lista){
          var n = Math.min(lista.length, 4), g = 4, w = (W - 2 * M - g * (n - 1)) / n, h = 20;
          for (var i = 0; i < lista.length; i += n) {
            espaco(h + 4);
            lista.slice(i, i + n).forEach(function(k, j){
              var x = M + j * (w + g);
              doc.setFillColor.apply(doc, C.panel2); doc.setDrawColor.apply(doc, C.line2); doc.setLineWidth(0.2);
              doc.roundedRect(x, r.y, w, h, 2.5, 2.5, "FD");
              doc.setFont(FT,"bold"); doc.setFontSize(7.5); doc.setTextColor.apply(doc, C.muted);
              doc.text(k.rotulo.toUpperCase(), x + 4, r.y + 6.5, {charSpace: 0.3});
              doc.setFont(FN,"bold"); doc.setFontSize(18); doc.setTextColor.apply(doc, C.ink);
              doc.text(String(k.valor), x + 4, r.y + 15);
              if (k.unidade) { var vw = doc.getTextWidth(String(k.valor)); doc.setFont(FT,"normal"); doc.setFontSize(9); doc.setTextColor.apply(doc, C.muted); doc.text(k.unidade, x + 5.5 + vw, r.y + 15); }
            });
            r.y += h + 4;
          }
          r.y += 2; return r;
        };
        /* Tabela: numericas = índices das colunas alinhadas à direita; total = linha final opcional */
        r.tabela = function(o){
          var est = {}; (o.numericas || []).forEach(function(i){ est[i] = {halign: "right"}; });
          doc.autoTable({
            startY: r.y, head: [o.cabecalho], body: o.linhas, foot: o.total ? [o.total] : undefined,
            margin: {left: M, right: M, top: M + 22, bottom: M + 8}, theme: "plain", columnStyles: est,
            styles: {font: FT, fontSize: 9.5, textColor: C.ink, cellPadding: {top: 2.6, bottom: 2.6, left: 3, right: 3}, lineColor: C.line2, lineWidth: {bottom: 0.2}},
            headStyles: {fillColor: C.panel2, textColor: C.muted, fontStyle: "bold", fontSize: 7.5, lineColor: C.line, lineWidth: {bottom: 0.3}},
            footStyles: {fillColor: false, textColor: C.ink, fontStyle: "bold", lineColor: C.line, lineWidth: {top: 0.3}},
            didParseCell: function(d){ if ((d.section === "head" || d.section === "foot") && est[d.column.index]) d.cell.styles.halign = "right";
                                       if (d.section === "head") d.cell.text = d.cell.text.map(function(t){ return t.toUpperCase(); }); },
            willDrawPage: function(d){ if (d.pageNumber > 1) cabecalho(); }
          });
          r.y = doc.lastAutoTable.finalY + 6; return r;
        };
        r.salvar = function(nome){
          var n = doc.getNumberOfPages();
          for (var p = 1; p <= n; p++) {
            doc.setPage(p);
            doc.setDrawColor.apply(doc, C.line2); doc.setLineWidth(0.2); doc.line(M, H - M, W - M, H - M);
            doc.setFont(FT,"normal"); doc.setFontSize(8); doc.setTextColor.apply(doc, C.muted);
            doc.text("Nadiana Agronegócios" + (op.titulo ? " · " + op.titulo : ""), M, H - M + 4.5);
            doc.text("Página " + p + " de " + n, W - M, H - M + 4.5, {align: "right"});
          }
          if (nome) doc.save(nome);
          return doc;
        };
        return r;
      });
    }
  };
})();
