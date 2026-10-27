(() => {
  const govEl = document.getElementById("gov");
  const villeEl = document.getElementById("ville");
  const imadaEl = document.getElementById("imada");
  const qEl = document.getElementById("q");
  const tbody = document.getElementById("tbody");
  const countEl = document.getElementById("count");
  const resultEl = document.getElementById("result");

  /** Unique key for a gouvernorat */
  const govKey = (r) => r.govFr;
  /** Unique key for a ville within a gouvernorat */
  const villeKey = (r) => `${r.govFr}||${r.villeFr}`;
  /** Unique key for an imada row */
  const rowKey = (r) => `${r.govFr}||${r.villeFr}||${r.imadaFr}||${r.cp}`;

  const byGov = new Map();
  for (const r of DATA) {
    if (!byGov.has(r.govFr)) {
      byGov.set(r.govFr, { fr: r.govFr, ar: r.govAr, villes: new Map() });
    }
    const g = byGov.get(r.govFr);
    if (!g.villes.has(r.villeFr)) {
      g.villes.set(r.villeFr, { fr: r.villeFr, ar: r.villeAr, imadas: [] });
    }
    g.villes.get(r.villeFr).imadas.push(r);
  }

  const govList = [...byGov.values()].sort((a, b) =>
    a.fr.localeCompare(b.fr, "fr")
  );

  function option(value, labelFr, labelAr) {
    const o = document.createElement("option");
    o.value = value;
    o.textContent = labelAr ? `${labelFr} — ${labelAr}` : labelFr;
    return o;
  }

  function resetSelect(el, placeholder) {
    el.innerHTML = "";
    el.appendChild(option("", placeholder));
  }

  function fillGov() {
    resetSelect(govEl, "— Choisir / اختر —");
    for (const g of govList) {
      govEl.appendChild(option(g.fr, g.fr, g.ar));
    }
  }

  function fillVille(govFr) {
    resetSelect(villeEl, "— Choisir / اختر —");
    villeEl.disabled = !govFr;
    imadaEl.disabled = true;
    resetSelect(imadaEl, "— Choisir / اختر —");
    if (!govFr) return;
    const villes = [...byGov.get(govFr).villes.values()].sort((a, b) =>
      a.fr.localeCompare(b.fr, "fr")
    );
    for (const v of villes) {
      villeEl.appendChild(option(v.fr, v.fr, v.ar));
    }
  }

  function fillImada(govFr, villeFr) {
    resetSelect(imadaEl, "— Choisir / اختر —");
    imadaEl.disabled = !(govFr && villeFr);
    if (!govFr || !villeFr) return;
    const imadas = byGov.get(govFr).villes.get(villeFr).imadas
      .slice()
      .sort((a, b) => a.imadaFr.localeCompare(b.imadaFr, "fr"));
    for (const r of imadas) {
      const o = option(rowKey(r), r.imadaFr, r.imadaAr);
      o.dataset.cp = r.cp;
      imadaEl.appendChild(o);
    }
  }

  function findRow(key) {
    return DATA.find((r) => rowKey(r) === key);
  }

  function showResult(r) {
    if (!r) {
      resultEl.classList.add("hidden");
      return;
    }
    resultEl.classList.remove("hidden");
    document.getElementById("cp").textContent = r.cp;
    document.getElementById("fr-gov").textContent = r.govFr;
    document.getElementById("fr-ville").textContent = r.villeFr;
    document.getElementById("fr-imada").textContent = r.imadaFr;
    document.getElementById("ar-gov").textContent = r.govAr;
    document.getElementById("ar-ville").textContent = r.villeAr;
    document.getElementById("ar-imada").textContent = r.imadaAr;
  }

  function filteredRows() {
    const gov = govEl.value;
    const ville = villeEl.value;
    const q = qEl.value.trim().toLowerCase();

    let rows = DATA;
    if (gov) rows = rows.filter((r) => r.govFr === gov);
    if (ville) rows = rows.filter((r) => r.villeFr === ville);
    if (q) {
      rows = rows.filter((r) =>
        [r.govFr, r.villeFr, r.imadaFr, r.govAr, r.villeAr, r.imadaAr, r.cp]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return rows;
  }

  function renderTable() {
    const rows = filteredRows();
    countEl.textContent = `${rows.length.toLocaleString("fr-FR")} résultat(s)`;
    const frag = document.createDocumentFragment();
    const limit = Math.min(rows.length, 400);
    for (let i = 0; i < limit; i++) {
      const r = rows[i];
      const tr = document.createElement("tr");
      tr.dataset.key = rowKey(r);
      tr.innerHTML = `
        <td><span class="fr">${escapeHtml(r.govFr)}</span><span class="ar-line" lang="ar" dir="rtl">${escapeHtml(r.govAr)}</span></td>
        <td><span class="fr">${escapeHtml(r.villeFr)}</span><span class="ar-line" lang="ar" dir="rtl">${escapeHtml(r.villeAr)}</span></td>
        <td><span class="fr">${escapeHtml(r.imadaFr)}</span><span class="ar-line" lang="ar" dir="rtl">${escapeHtml(r.imadaAr)}</span></td>
        <td class="cp-cell">${escapeHtml(r.cp)}</td>`;
      frag.appendChild(tr);
    }
    tbody.replaceChildren(frag);
    if (rows.length > limit) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" style="color:var(--muted);text-align:center">… ${rows.length - limit} lignes supplémentaires — affinez la recherche</td>`;
      tbody.appendChild(tr);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function syncFromSelects() {
    const key = imadaEl.value;
    if (key) {
      const r = findRow(key);
      showResult(r);
      highlightRow(key);
    } else {
      showResult(null);
    }
    renderTable();
  }

  function highlightRow(key) {
    for (const tr of tbody.querySelectorAll("tr")) {
      tr.classList.toggle("active", tr.dataset.key === key);
    }
  }

  function selectRow(r) {
    govEl.value = r.govFr;
    fillVille(r.govFr);
    villeEl.value = r.villeFr;
    fillImada(r.govFr, r.villeFr);
    imadaEl.value = rowKey(r);
    showResult(r);
    renderTable();
    highlightRow(rowKey(r));
  }

  govEl.addEventListener("change", () => {
    fillVille(govEl.value);
    showResult(null);
    renderTable();
  });

  villeEl.addEventListener("change", () => {
    fillImada(govEl.value, villeEl.value);
    showResult(null);
    renderTable();
  });

  imadaEl.addEventListener("change", syncFromSelects);

  let timer;
  qEl.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(renderTable, 120);
  });

  tbody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-key]");
    if (!tr) return;
    const r = findRow(tr.dataset.key);
    if (r) selectRow(r);
  });

  fillGov();
  renderTable();
})();
