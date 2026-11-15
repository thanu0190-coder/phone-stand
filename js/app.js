// Phone Stand - plain JavaScript, no libraries, no fetch (works offline).
(function () {
  var R = window.ROSTER, P = window.PHONES = window.PHONES || {}, state = {}, D = {};
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  // 1. Load every phone file listed in the roster (works from file:// too)
  var left = R.length;
  R.forEach(function (s) {
    var el = document.createElement("script");
    el.src = "phones/" + s.reg + ".js";
    el.onload = function () { state[s.reg] = P[s.reg] ? "ok" : "bad"; done(); };
    el.onerror = function () { state[s.reg] = "none"; done(); };
    document.head.appendChild(el);
  });
  function done() { if (--left === 0) start(); }

  // 2. Clean the data so a small student mistake cannot break the page
  function clean(p) {
    var a = Array.isArray(p.apps) ? p.apps : String(p.apps || "").split(",");
    return {
      phone: String(p.phone || "").trim(), android: String(p.android || "").replace(/[^\d.]/g, ""),
      ram: Number(p.ram) || 0, rom: Number(p.rom) || 0,
      apps: a.map(function (x) { return String(x).trim(); }).filter(Boolean).slice(0, 3),
      pro: String(p.pro || "").trim(), con: String(p.con || "").trim()
    };
  }
  function start() {
    R.forEach(function (s) { if (state[s.reg] === "ok") D[s.reg] = clean(P[s.reg]); });
    var vs = {};
    Object.keys(D).forEach(function (k) { if (D[k].android) vs[D[k].android] = 1; });
    $("av").innerHTML = '<option value="">All Android versions</option>' +
      Object.keys(vs).sort(function (a, b) { return b - a; }).map(function (v) { return '<option value="' + v + '">Android ' + v + "</option>"; }).join("");
    ["q", "av", "st"].forEach(function (id) { $(id).addEventListener("input", draw); });
    window.addEventListener("resize", draw);
    $("stand").addEventListener("click", function (e) { var c = e.target.closest(".phone"); if (c && !c.classList.contains("empty")) c.classList.toggle("flip"); });
    $("stand").addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.classList.contains("phone")) e.target.classList.toggle("flip"); });
    progress(); draw(); fun();
  }

  function progress() {
    var n = Object.keys(D).length, t = R.length, pc = Math.round(n / t * 100);
    $("count").textContent = n; $("total").textContent = t; $("pct").textContent = pc + "%"; $("bar").style.width = pc + "%";
  }
  function hue(reg) { for (var i = 0; i < R.length; i++) if (R[i].reg === reg) return Math.round(i * 137.5) % 360; return 200; }

  function card(s) {
    var p = D[s.reg], h = hue(s.reg);
    if (!p) {
      var bad = state[s.reg] === "bad";
      return '<div class="phone empty' + (bad ? " bad" : "") + '" style="--h:' + h + '"><div class="in"><div class="face front"><span style="font-size:1.6rem">' + (bad ? "&#9888;" : "&#128274;") + '</span><b>' + esc(s.name) + '</b><span>' + (bad ? "File has a mistake" : "Not added yet") + '</span><small>' + s.reg + '</small></div></div></div>';
    }
    return '<div class="phone" tabindex="0" style="--h:' + h + '"><div class="in">' +
      '<div class="face front"><div class="who">' + esc(s.name) + '</div><div class="mod">' + esc(p.phone || "My phone") + '</div>' +
      '<span class="tag">Android ' + esc(p.android || "?") + '</span><span class="tag">' + p.ram + ' GB RAM &middot; ' + p.rom + ' GB</span><small>' + s.reg + '</small></div>' +
      '<div class="face back"><h4>Top apps</h4><ol>' + p.apps.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + '</ol>' +
      '<h4>&#128077; Pro</h4><p>' + esc(p.pro) + '</p><h4>&#128078; Con</h4><p>' + esc(p.con) + '</p></div></div></div>';
  }

  function draw() {
    var q = $("q").value.toLowerCase().trim(), av = $("av").value, st = $("st").value;
    var list = R.filter(function (s) {
      var p = D[s.reg];
      if (st === "added" && !p) return false;
      if (st === "none" && p) return false;
      if (av && (!p || p.android !== av)) return false;
      var t = s.name + " " + s.reg + (p ? " " + p.phone + " " + p.apps.join(" ") : "");
      return t.toLowerCase().indexOf(q) > -1;
    });
    var stand = $("stand"), cols = Math.max(1, Math.min(6, Math.floor((stand.clientWidth - 20) / 172))), html = "";
    for (var i = 0; i < list.length; i += cols)
      html += '<div class="shelf" style="--cols:' + cols + '">' + list.slice(i, i + cols).map(card).join("") + "</div>";
    stand.innerHTML = html || '<p class="hint">No phones match your search.</p>';
  }

  // 3. Fun section built from the data
  var KW = { Battery: /batter|backup/, Camera: /camera|photo|selfie/, Display: /display|screen|amoled|bright/, Speed: /fast|speed|perform|smooth|lag|slow|hang/,
    Price: /price|cheap|budget|cost|afford|value/, Storage: /storage|space|memory/, Charging: /charg/, Heating: /heat|hot/, Design: /design|look|slim|light|weight/, Sound: /sound|speaker|audio/ };
  function top(map, n) { return Object.keys(map).map(function (k) { return [map[k].label || k, map[k].n]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, n); }
  function bump(m, k, label) { if (!m[k]) m[k] = { n: 0, label: label }; m[k].n++; }
  function bars(title, items) {
    var mx = items.length ? items[0][1] : 1;
    return '<div class="box"><h3>' + title + "</h3>" + (items.length ? items.map(function (i) {
      return '<div class="row"><span>' + esc(i[0]) + '</span><div class="b"><i style="width:' + i[1] / mx * 100 + '%"></i></div><em>' + i[1] + "</em></div>";
    }).join("") : '<p class="muted">Waiting for data...</p>') + "</div>";
  }
  function fun() {
    var ks = Object.keys(D), apps = {}, pros = {}, cons = {}, vers = {}, ram = 0, rom = 0, best = null;
    ks.forEach(function (k) {
      var p = D[k];
      ram += p.ram; rom += p.rom; bump(vers, p.android || "?", "Android " + (p.android || "?"));
      p.apps.forEach(function (a) { bump(apps, a.toLowerCase(), a.charAt(0).toUpperCase() + a.slice(1)); });
      Object.keys(KW).forEach(function (w) { if (KW[w].test(p.pro.toLowerCase())) bump(pros, w, w); if (KW[w].test(p.con.toLowerCase())) bump(cons, w, w); });
      if (!best || p.ram > D[best].ram) best = k;
    });
    var n = ks.length, nm = {}; R.forEach(function (s) { nm[s.reg] = s.name; });
    function tile(v, l) { return '<div class="tile"><b>' + v + "</b><span>" + l + "</span></div>"; }
    var pop = top(vers, 1)[0];
    $("fun").innerHTML = "<h2>&#127881; Fun facts from our class</h2><div class=\"tiles\">" +
      tile(n, "phones on the stand") + tile(n ? (ram / n).toFixed(1) + " GB" : "-", "average RAM") + tile(n ? Math.round(rom / n) + " GB" : "-", "average storage (ROM)") +
      tile(pop ? esc(pop[0]) : "-", "most common Android") + tile(best ? esc(nm[best].split(" ")[0]) + " (" + D[best].ram + " GB)" : "-", "RAM champion") +
      '</div><div class="boxes">' + bars("Most used apps", top(apps, 6)) + bars("Common pros", top(pros, 5)) + bars("Common cons", top(cons, 5)) + "</div>";
  }
})();
