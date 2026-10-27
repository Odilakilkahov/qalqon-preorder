// Qalqon landing: mobile menu, FAQ accordion (one open at a time), language memory.
(() => {
  const btn = document.querySelector(".menu-btn");
  const panel = document.getElementById("mobile-nav");
  if (btn && panel) {
    const setOpen = (open) => {
      panel.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => {
      setOpen(btn.getAttribute("aria-expanded") !== "true");
    });
    panel.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("open")) {
        setOpen(false);
        btn.focus();
      }
    });
  }

  const items = document.querySelectorAll(".faq details");
  items.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      items.forEach((o) => {
        if (o !== d) o.open = false;
      });
    });
  });

  document.querySelectorAll("[data-lang]").forEach((a) => {
    a.addEventListener("click", () => {
      try {
        localStorage.setItem("qalqon-lang", a.getAttribute("data-lang"));
      } catch {
        /* storage blocked */
      }
    });
  });

  const form = document.getElementById("preorder-form");
  if (form) {
    const loadedAt = Date.now();
    const lang = document.documentElement.lang === "ru" ? "ru" : "uz";
    const TEXT = {
      ru: {
        ok: "Спасибо! Мы свяжемся с вами в Telegram или по телефону.",
        err: "Не получилось отправить. Проверьте телефон и попробуйте ещё раз.",
      },
      uz: {
        ok: "Rahmat! Siz bilan Telegram yoki telefon orqali bog‘lanamiz.",
        err: "Yuborilmadi. Telefon raqamni tekshirib, qayta urinib ko‘ring.",
      },
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = document.getElementById("preorder-status");
      const btn = form.querySelector("button[type=submit]");
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const telegram = form.telegram.value.trim();
      const message =
        (lang === "ru" ? "Telegram: " : "Telegram: ") +
        (telegram || "—") +
        " · Qalqon Plus — " +
        (lang === "ru" ? "предзаказ" : "oldindan buyurtma");
      btn.disabled = true;
      statusEl.className = "preorder-status";
      statusEl.textContent = "";
      try {
        const r = await fetch("https://automation.178-105-119-125.sslip.io/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "quick",
            name,
            phone,
            message,
            lang,
            source: "qalqon-preorder-ghpages",
            website: form.website.value,
            elapsedMs: Date.now() - loadedAt,
          }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.ok) throw new Error(data.code || "error");
        statusEl.textContent = TEXT[lang].ok;
        statusEl.className = "preorder-status ok";
        form.reset();
      } catch {
        statusEl.textContent = TEXT[lang].err;
        statusEl.className = "preorder-status err";
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
