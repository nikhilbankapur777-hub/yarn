/* =====================================================================
   THE YARN BASKET — shared script (index.html + shop.html)
   ===================================================================== */
(() => {
  "use strict";

  /* ---------- helpers & settings ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const SITE = {
    name: "The Yarn Basket",
    handle: "@the._.yarnbasket",
    instagram: "https://www.instagram.com/the._.yarnbasket/",
    dm: "https://ig.me/m/the._.yarnbasket",
    logo: "images/logo.jpg"
  };

  const icon = {
    ig: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    prev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`,
    next: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>`
  };

  /* ---------- placeholder art (used until real photos are added) ---------- */
  const PH_COLORS = ["#f4a6b8", "#a9c5a0", "#fff3a8", "#9dc0e8", "#f2b59f"];
  function ph(label, seed) {
    let h = 0;
    for (const c of String(seed || label)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const bg = PH_COLORS[h % PH_COLORS.length];
    const text = String(label || SITE.name).slice(0, 28).replace(/[<>&]/g, "");
    const lines = Array.from({ length: 14 }, (_, i) => `<path d="M-50 ${i * 70} L850 ${i * 70 + 160}"/>`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" fill="${bg}"/><g stroke="#3b1620" stroke-opacity=".14" stroke-width="6" stroke-dasharray="2 22" stroke-linecap="round">${lines}</g><g transform="translate(400 360)"><circle r="170" fill="#fffdf6" stroke="#3b1620" stroke-width="10"/><g fill="none" stroke="#3b1620" stroke-width="9" stroke-linecap="round"><path d="M-150 -70 Q0 -10 150 -80"/><path d="M-165 10 Q0 90 165 0"/><path d="M-120 100 Q10 150 130 90"/><path d="M-60 -150 Q-20 0 -70 155"/><path d="M60 -155 Q110 0 50 160"/><path d="M160 90 C260 150 300 230 220 300"/></g></g><text x="400" y="725" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="44" fill="#3b1620">${text}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && !t.dataset.phDone) {
      t.dataset.phDone = "1";
      t.src = ph(t.dataset.ph || t.alt || SITE.name, t.getAttribute("src"));
    }
  }, true);
  const imgSrc = (s, label) => (s ? s : ph(label, label));

  /* ---------- data ---------- */
  const getJSON = (u) => fetch(u, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(u + " → " + r.status); return r.json(); });
  const shopP = getJSON("shop.json").catch((e) => { console.warn("[yarn-basket]", e.message); return null; });
  const imgP = getJSON("imagined.json").catch((e) => { console.warn("[yarn-basket]", e.message); return null; });

  const money = (n, cur) => cur + Number(n).toLocaleString("en-IN");
  const normalize = (p) => {
    const imgs = (Array.isArray(p.images) ? p.images : [p.image]).filter(Boolean);
    const price = Number(p.price), mrp = Number(p.mrp);
    const hasPrice = isFinite(price) && price > 0;
    const hasMrp = hasPrice && isFinite(mrp) && mrp > price;
    return {
      id: String(p.id || p.name || "item"),
      name: p.name || "Untitled piece",
      images: imgs.length ? imgs : [""],
      price: hasPrice ? price : null,
      mrp: hasMrp ? mrp : null,
      disc: hasMrp ? Math.round((1 - price / mrp) * 100) : 0,
      description: p.description || "",
      details: Array.isArray(p.details) ? p.details : [],
      category: p.category || "",
      badge: p.badge || "",
      featured: Boolean(p.featured),
      inStock: p.inStock !== false
    };
  };

  /* ---------- chrome: top bar, nav, footer ---------- */
  const siteTop = $("#site-top");
  if (siteTop) {
    siteTop.innerHTML = `
      <div class="topbar"><span>Every piece is crocheted by hand</span><span aria-hidden="true">✦</span>
        <a href="${SITE.instagram}" target="_blank" rel="noopener">${icon.ig}${SITE.handle}</a></div>
      <header class="nav">
        <div class="nav-inner">
          <div class="nav-left">
            <button class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
            <nav class="nav-links" aria-label="Primary">
              <a href="shop.html" ${page === "shop" ? 'aria-current="page"' : ""}>Shop</a>
              <a href="index.html#about">About</a>
              <a href="index.html#how">How it works</a>
            </nav>
          </div>
          <a class="brand" href="index.html"><img class="brand-logo" src="${SITE.logo}" alt="" width="46" height="46" data-ph="YB"><span>The Yarn Basket</span></a>
          <div class="nav-right"><a class="btn btn--sm" href="shop.html">Shop now</a></div>
        </div>
        <nav class="menu" id="menu" aria-label="Mobile">
          <a href="shop.html">Shop</a><a href="index.html#about">About</a><a href="index.html#how">How it works</a><a href="index.html#custom">Custom orders</a>
        </nav>
      </header>`;
    const burger = $(".burger"), menu = $("#menu");
    const setMenu = (o) => { burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); menu.classList.toggle("open", o); };
    burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }

  const buildFoot = (cfg) => {
    const el = $("#site-foot");
    if (!el) return;
    const wa = cfg.whatsapp ? `https://wa.me/${String(cfg.whatsapp).replace(/\D/g, "")}` : "";
    el.innerHTML = `
      <footer class="footer">
        <div class="footer-grid">
          <div>
            <p class="footer-word display">The Yarn<br>Basket</p>
            <div class="footer-cols">
              <div><h3>Explore</h3><ul>
                <li><a href="shop.html">Shop</a></li><li><a href="index.html#about">Our story</a></li>
                <li><a href="index.html#how">How it works</a></li><li><a href="index.html#custom">Custom orders</a></li></ul></div>
              <div><h3>Say hello</h3><ul>
                <li><a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a></li>
                <li><a href="${SITE.dm}" target="_blank" rel="noopener">Send a DM</a></li>
                ${wa ? `<li><a href="${wa}" target="_blank" rel="noopener">WhatsApp</a></li>` : ""}</ul></div>
            </div>
          </div>
          <div class="follow-card">
            <h3>Follow the basket</h3>
            <p>New pieces, works in progress and custom orders — all on Instagram.</p>
            <div class="follow-actions">
              <a class="btn btn--light" href="${SITE.instagram}" target="_blank" rel="noopener">${icon.ig} Follow ${SITE.handle}</a>
              ${wa ? `<a class="btn btn--wa" href="${wa}" target="_blank" rel="noopener">WhatsApp us</a>` : ""}
            </div>
          </div>
        </div>
        <p class="footer-bottom">© ${new Date().getFullYear()} The Yarn Basket · Handmade with love</p>
      </footer>`;
  };

  /* ---------- fixed layers: page wipe, cursor, trail ---------- */
  document.body.insertAdjacentHTML("afterbegin", `<div class="wipe" aria-hidden="true"></div>`);

  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduce) return;
    const u = new URL(a.href, location.href);
    const norm = (p) => p.replace(/index\.html$/, "");
    if (u.origin !== location.origin || norm(u.pathname) === norm(location.pathname) || !/\.html$|\/$/.test(u.pathname)) return;
    e.preventDefault();
    sessionStorage.setItem("yb-wipe", "1");
    root.classList.add("is-leaving");
    setTimeout(() => { location.href = u.href; }, 620);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("is-leaving"); });

  if (fine && !reduce) {
    root.classList.add("has-cursor");
    const cur = document.createElement("div");
    cur.className = "cursor";
    cur.innerHTML = `<div class="cursor-ring"></div><div class="cursor-dot"></div>`;
    document.body.appendChild(cur);
    const ring = $(".cursor-ring", cur), dot = $(".cursor-dot", cur);
    let mx = -100, my = -100, rx = -100, ry = -100;

    const cv = $("#trail"), ctx = cv ? cv.getContext("2d") : null;
    const pts = [];
    const fit = () => { if (!cv) return; const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    fit(); addEventListener("resize", fit);

    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      pts.push({ x: mx, y: my, t: performance.now() });
      if (pts.length > 60) pts.shift();
    }, { passive: true });
    addEventListener("pointerdown", () => cur.classList.add("is-down"));
    addEventListener("pointerup", () => cur.classList.remove("is-down"));
    document.addEventListener("pointerover", (e) => {
      const v = e.target.closest && e.target.closest("[data-cursor]");
      const l = e.target.closest && e.target.closest("a,button,[role=button],input,textarea");
      cur.classList.toggle("is-view", !!v);
      cur.classList.toggle("is-link", !v && !!l);
      ring.textContent = v ? v.dataset.cursor : "";
    });

    const loop = (now) => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      if (ctx) {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        while (pts.length && now - pts[0].t > 650) pts.shift();
        ctx.lineCap = "round";
        for (let i = 1; i < pts.length; i++) {
          const a = clamp(1 - (now - pts[i].t) / 650, 0, 1);
          ctx.strokeStyle = `rgba(217,80,111,${(a * 0.9).toFixed(3)})`;
          ctx.lineWidth = 1.5 + a * 3.5;
          ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    /* gentle 3D tilt on product cards */
    let tilted = null;
    const untilt = (el) => { if (el) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); } };
    document.addEventListener("pointermove", (e) => {
      const c = e.target.closest && e.target.closest("[data-tilt]");
      if (tilted && tilted !== c) untilt(tilted);
      tilted = c || null;
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 9).toFixed(2) + "deg");
      c.style.setProperty("--rx", (-((e.clientY - r.top) / r.height - 0.5) * 9).toFixed(2) + "deg");
    });
  } else {
    const cv = $("#trail"); if (cv) cv.remove();
  }

  /* ---------- text splitting ---------- */
  $$("[data-letters]").forEach((el) => {
    const txt = el.textContent.trim();
    el.setAttribute("aria-label", txt);
    let i = 0;
    el.innerHTML = txt.split(/\s+/).map((w) =>
      `<span class="word" aria-hidden="true">${[...w].map((c) => `<span class="ch" style="--i:${i++}">${c}</span>`).join("")}</span>`).join("");
  });
  if (root.classList.contains("js-anim")) {
    $$("[data-words]").forEach((el) => {
      const t = el.textContent.trim();
      el.setAttribute("aria-label", t);
      el.innerHTML = t.split(/\s+/).map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(" ");
      el.classList.add("split-words");
    });
  }

  /* ---------- marquee ---------- */
  $$("[data-marquee]").forEach((el) => {
    const html = el.dataset.marquee.split("|").map((t) => `<span>${esc(t)}</span><i>✦</i>`).join("");
    el.innerHTML = `<div class="marquee-track">${html.repeat(4)}</div>`;
  });

  /* ---------- reveal on scroll ---------- */
  let io = null;
  if (root.classList.contains("js-anim")) {
    io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  }
  function prepReveal(scope = document) {
    if (!io) return;
    $$("[data-reveal]", scope).forEach((el) => {
      if (el.classList.contains("reveal")) return;
      const i = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--i", i % 5);
      el.style.setProperty("--dir", i % 2 ? -1 : 1);
      el.classList.add("reveal");
      io.observe(el);
    });
    $$(".split-words, [data-thread]", scope).forEach((el) => io.observe(el));
  }

  /* ---------- scroll-linked parallax ---------- */
  const hero = $("#home"), orbsClip = $(".orbs-clip");
  let ticking = false;
  const update = () => {
    ticking = false;
    const H = innerHeight;
    if (hero) hero.style.setProperty("--hp", clamp(scrollY / (hero.offsetHeight || 1), 0, 1).toFixed(3));
    if (orbsClip) {
      const r = orbsClip.getBoundingClientRect();
      orbsClip.firstElementChild.style.setProperty("--sp", clamp((H - r.top) / (H + r.height), 0, 1).toFixed(3));
    }
  };
  if (!reduce) {
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ---------- imagined.json → about / hero / gallery images ---------- */
  imgP.then((data) => {
    const list = (data && Array.isArray(data.images)) ? data.images : [];
    const map = Object.fromEntries(list.map((i) => [i.id, i]));
    $$("img[data-img]").forEach((img) => {
      const it = map[img.dataset.img];
      if (it) { img.alt = it.alt || img.alt || ""; img.dataset.ph = img.dataset.ph || it.alt || it.id; img.src = it.src; }
      else img.src = ph(img.dataset.ph || img.dataset.img, img.dataset.img);
    });
    $$("[data-caption]").forEach((el) => { const it = map[el.dataset.caption]; el.textContent = it && it.caption ? it.caption : ""; });

    const g = $("#gallery");
    if (g) {
      const items = list.filter((i) => /^gallery/i.test(i.id));
      if (!items.length) { g.hidden = true; return; }
      g.style.setProperty("--n", Math.min(items.length, 4));
      g.innerHTML = items.map((i) =>
        `<a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Open The Yarn Basket on Instagram"><img src="${esc(i.src)}" alt="${esc(i.alt || "Handmade crochet")}" data-ph="${esc(i.alt || "Crochet")}" loading="lazy"></a>`).join("");
      g.hidden = false;
    }
  });

  /* ---------- HOME: featured orbs ---------- */
  if (page === "home") {
    shopP.then((data) => {
      const wrap = $("#orbs");
      if (!wrap) return;
      if (!data || !Array.isArray(data.products) || !data.products.length) {
        wrap.innerHTML = `<p class="shop-msg">Add your pieces to <b>shop.json</b> and they’ll appear here. (If you opened this file directly, run a local server — see the README note.)</p>`;
        return;
      }
      const cur = (data.settings && data.settings.currency) || "₹";
      const all = data.products.map(normalize);
      const feat = all.filter((p) => p.featured);
      const list = (feat.length ? feat : all).slice(0, 4);
      wrap.innerHTML = list.map((p) => `
        <a class="orb" href="shop.html#${encodeURIComponent(p.id)}" data-cursor="View" data-reveal>
          <span class="orb-img"><img src="${esc(imgSrc(p.images[0], p.name))}" alt="${esc(p.name)}" data-ph="${esc(p.name)}" loading="lazy"></span>
          <span class="orb-name">${esc(p.name)}</span>
          ${p.price ? `<span class="orb-price"><b>${money(p.price, cur)}</b>${p.mrp ? `<s>${money(p.mrp, cur)}</s>` : ""}</span>` : ""}
        </a>`).join("");
      prepReveal(wrap);
    });
  }

  /* ---------- SHOP: grid + preview modal ---------- */
  if (page === "shop") {
    const grid = $("#pgrid"), msg = $("#shop-msg"), count = $("#shop-count");
    let cfg = { currency: "₹", slideMs: 1800, whatsapp: "" };
    let products = [];
    let modal = null;

    const card = (p) => `
      <button class="pcard" data-id="${esc(p.id)}" data-cursor="View" data-tilt data-reveal aria-label="Preview ${esc(p.name)}">
        <span class="pmedia">
          <img class="p1" src="${esc(imgSrc(p.images[0], p.name))}" alt="${esc(p.name)}" data-ph="${esc(p.name)}" loading="lazy">
          ${p.images[1] ? `<img class="p2" src="${esc(p.images[1])}" alt="" aria-hidden="true" data-ph="${esc(p.name)}" loading="lazy">` : ""}
          ${p.inStock ? (p.badge ? `<span class="pbadge">${esc(p.badge)}</span>` : "") : `<span class="psold">Sold out</span>`}
          ${p.disc ? `<span class="pdisc">-${p.disc}%</span>` : ""}
        </span>
        <span class="pbody">
          <span class="pname">${esc(p.name)}</span>
          ${p.price ? `<span class="pprice"><b>${money(p.price, cfg.currency)}</b>${p.mrp ? `<s>${money(p.mrp, cfg.currency)}</s>` : ""}</span>` : ""}
        </span>
      </button>`;

    /* modal ------------------------------------------------------- */
    const buildModal = () => {
      const m = document.createElement("div");
      m.className = "modal"; m.id = "modal"; m.setAttribute("aria-hidden", "true");
      m.innerHTML = `
        <div class="modal-backdrop" data-close></div>
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="m-title" tabindex="-1">
          <button class="modal-close" data-close aria-label="Close preview">${icon.x}</button>
          <div class="gal">
            <div class="bars"></div>
            <div class="stage"></div>
            <button class="zone zone-prev" tabindex="-1" aria-hidden="true"></button>
            <button class="zone zone-next" tabindex="-1" aria-hidden="true"></button>
            <button class="arrow arrow-prev" aria-label="Previous photo">${icon.prev}</button>
            <button class="arrow arrow-next" aria-label="Next photo">${icon.next}</button>
            <div class="thumbs"></div>
          </div>
          <div class="info"></div>
        </div>`;
      document.body.appendChild(m);
      return m;
    };

    let cur = null, idx = 0, timer = null, paused = false, remaining = 1800, startedAt = 0, dur = 1800, lastFocus = null;

    const setPlay = (state) => {
      const img = $$(".slide img", modal)[idx], bar = $$(".bar i", modal)[idx];
      if (img) img.style.animationPlayState = state;
      if (bar) bar.style.animationPlayState = state;
    };
    const schedule = (ms) => {
      clearTimeout(timer);
      remaining = ms; startedAt = performance.now();
      timer = setTimeout(() => show(idx + 1), ms);
    };
    const pause = () => {
      if (paused || !cur || cur.images.length < 2) return;
      paused = true; clearTimeout(timer);
      remaining = Math.max(80, remaining - (performance.now() - startedAt));
      setPlay("paused");
    };
    const resume = () => {
      if (!paused) return;
      paused = false; setPlay("running"); schedule(remaining);
    };
    function show(i) {
      const n = cur.images.length;
      idx = (i + n) % n;
      clearTimeout(timer);
      $$(".slide", modal).forEach((s, k) => s.classList.toggle("active", k === idx));
      $$(".bar", modal).forEach((b, k) => {
        b.classList.toggle("done", k < idx);
        const f = b.firstElementChild;
        f.style.animation = "none"; f.style.width = k < idx ? "100%" : "0";
        if (k === idx) { void f.offsetWidth; f.style.animation = `fill ${dur}ms linear forwards`; }
      });
      $$(".thumb", modal).forEach((t, k) => t.classList.toggle("active", k === idx));
      remaining = dur;
      if (n > 1) { if (paused) setPlay("paused"); else schedule(dur); }
    }

    const orderLinks = (p) => {
      const digits = String(cfg.whatsapp || "").replace(/\D/g, "");
      const text = `Hi The Yarn Basket! I'd love to order "${p.name}" (code ${p.id})${p.price ? " – " + money(p.price, cfg.currency) : ""}.`;
      const label = p.inStock ? "Order" : "Ask about a restock";
      if (digits) {
        return `<a class="btn btn--wa" href="https://wa.me/${digits}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">${label} on WhatsApp ${icon.arrow}</a>
                <a class="btn btn--ghost" href="${SITE.dm}" target="_blank" rel="noopener">Or message on Instagram</a>`;
      }
      return `<a class="btn" href="${SITE.dm}" target="_blank" rel="noopener">${label} via Instagram DM ${icon.arrow}</a>`;
    };

    const openProduct = (p) => {
      if (!modal) {
        modal = buildModal();
        modal.addEventListener("click", (e) => {
          if (e.target.closest("[data-close]")) closeProduct();
          else if (e.target.closest(".arrow-next, .zone-next")) show(idx + 1);
          else if (e.target.closest(".arrow-prev, .zone-prev")) show(idx - 1);
          else { const t = e.target.closest(".thumb"); if (t) show(Number(t.dataset.i)); }
        });
        const gal = $(".gal", modal);
        gal.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") pause(); });
        gal.addEventListener("pointerleave", () => resume());
        gal.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") pause(); });
        gal.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") setTimeout(resume, 250); });
        document.addEventListener("visibilitychange", () => { document.hidden ? pause() : resume(); });
      }
      lastFocus = document.activeElement;
      cur = p; paused = false;
      dur = Number(cfg.slideMs) || 1800;
      $(".gal", modal).style.setProperty("--dur", dur + "ms");
      const n = p.images.length;
      $(".stage", modal).innerHTML = p.images.map((s, i) =>
        `<div class="slide"><img src="${esc(imgSrc(s, p.name))}" alt="${esc(p.name)} — photo ${i + 1} of ${n}" data-ph="${esc(p.name)}"></div>`).join("");
      $(".bars", modal).innerHTML = n > 1 ? p.images.map(() => `<div class="bar"><i></i></div>`).join("") : "";
      $(".thumbs", modal).innerHTML = n > 1 ? p.images.map((s, i) =>
        `<button class="thumb" data-i="${i}" aria-label="Show photo ${i + 1}"><img src="${esc(imgSrc(s, p.name))}" alt="" data-ph="${esc(p.name)}"></button>`).join("") : "";
      $$(".arrow, .zone", modal).forEach((b) => { b.style.display = n > 1 ? "" : "none"; });
      $(".info", modal).innerHTML = `
        <div class="info-top">${p.category ? `<span class="tag">${esc(p.category)}</span>` : ""}${p.badge ? `<span class="tag tag--butter">${esc(p.badge)}</span>` : ""}${p.inStock ? "" : `<span class="tag">Sold out</span>`}</div>
        <h2 id="m-title">${esc(p.name)}</h2>
        <p class="code">Item code · ${esc(p.id)}</p>
        ${p.price ? `<div class="price"><b>${money(p.price, cfg.currency)}</b>${p.mrp ? `<s>${money(p.mrp, cfg.currency)}</s><span class="save">Save ${p.disc}%</span>` : ""}</div>` : ""}
        ${p.description ? `<p class="desc">${esc(p.description)}</p>` : ""}
        ${p.details.length ? `<ul class="details">${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}
        <div class="cta">${orderLinks(p)}</div>
        <p class="fine">Mention item code <b>${esc(p.id)}</b> when you message us — we’ll confirm colours, availability and delivery.</p>`;

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      history.replaceState(null, "", "#" + encodeURIComponent(p.id));
      show(0);
      $(".modal-panel", modal).focus({ preventScroll: true });
    };

    const closeProduct = () => {
      if (!modal || !modal.classList.contains("open")) return;
      clearTimeout(timer);
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      history.replaceState(null, "", location.pathname + location.search);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };

    document.addEventListener("keydown", (e) => {
      if (!modal || !modal.classList.contains("open")) return;
      if (e.key === "Escape") closeProduct();
      else if (e.key === "ArrowRight") show(idx + 1);
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "Tab") {
        const f = $$("button:not([tabindex='-1']), a[href]", modal).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    /* load shop.json ---------------------------------------------- */
    shopP.then((data) => {
      if (!data || !Array.isArray(data.products)) {
        msg.hidden = false;
        msg.innerHTML = `Couldn’t load <b>shop.json</b>. If you opened this page by double-clicking the file, browsers block that — run a local server (see the README) or upload the site to your host.`;
        count.textContent = "";
        buildFoot(cfg);
        return;
      }
      cfg = { ...cfg, ...(data.settings || {}) };
      products = data.products.map(normalize);
      buildFoot(cfg);
      count.textContent = products.length
        ? `${products.length} handmade piece${products.length === 1 ? "" : "s"} · tap any piece for a full preview`
        : "New pieces are on the hook — check back soon.";
      grid.innerHTML = products.map(card).join("");
      prepReveal(grid);
      grid.addEventListener("click", (e) => {
        const c = e.target.closest(".pcard");
        if (c) openProduct(products.find((p) => p.id === c.dataset.id));
      });
      const fromHash = () => {
        const id = decodeURIComponent(location.hash.slice(1));
        const p = id && products.find((x) => x.id === id);
        if (p) openProduct(p);
      };
      setTimeout(fromHash, sessionStorage.getItem("yb-opened") ? 200 : 1100);
      sessionStorage.setItem("yb-opened", "1");
      addEventListener("hashchange", fromHash);
    });
  } else {
    shopP.then((data) => buildFoot((data && data.settings) || {}));
  }

  /* ---------- entry sequence ---------- */
  const ready = () => root.classList.add("is-ready");
  const curtain = $("#curtain");
  prepReveal(document);

  if (root.classList.contains("wipe-cover")) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove("wipe-cover");
      root.classList.add("wipe-out");
      sessionStorage.removeItem("yb-wipe");
      setTimeout(() => root.classList.remove("wipe-out"), 950);
      setTimeout(ready, 350);
    }));
    if (curtain) curtain.remove();
  } else if (curtain && root.classList.contains("has-curtain")) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);
    setTimeout(ready, 1900);
    setTimeout(() => curtain.remove(), 3300);
  } else {
    if (curtain) curtain.remove();
    ready();
  }
  setTimeout(ready, 4500); // safety net
})();
