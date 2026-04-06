(function () {
  const header = document.querySelector(".site-header");
  const burger = document.querySelector(".burger");
  const menu = document.querySelector("#menu");
  const year = document.querySelector("#year");
  const form = document.querySelector("[data-contact-form]");

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add("is-elevated");
    else header.classList.remove("is-elevated");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && menu) {
    const setOpen = (open) => {
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    };

    burger.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (e) => {
      if (e.target && e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("is-open")) return;
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (burger.contains(t) || menu.contains(t)) return;
      setOpen(false);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener(
      "resize",
      () => {
        if (window.matchMedia("(min-width: 1101px)").matches) setOpen(false);
      },
      { passive: true }
    );
  }

  if (form) {
    const CONTACT_LAST_SENT_KEY = "rio_contact_last_sent";
    const CONTACT_COOLDOWN_MS = 60 * 1000;

    const getLastSentAt = () => {
      try {
        const raw = localStorage.getItem(CONTACT_LAST_SENT_KEY);
        const n = raw ? parseInt(raw, 10) : NaN;
        return Number.isFinite(n) ? n : 0;
      } catch {
        return 0;
      }
    };

    const setLastSentAt = () => {
      try {
        localStorage.setItem(CONTACT_LAST_SENT_KEY, String(Date.now()));
      } catch {
        /* private mode or quota */
      }
    };

    const status = form.querySelector("[data-form-status]");
    const submitBtn = form.querySelector('button[type="submit"]');
    const setStatus = (msg) => {
      if (status) status.textContent = msg;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") ?? "").trim();
      const email = String(fd.get("email") ?? "").trim();
      const message = String(fd.get("message") ?? "").trim();

      if (!name || !email || !message) {
        setStatus("Merci de remplir tous les champs.");
        return;
      }

      const lastSent = getLastSentAt();
      if (lastSent > 0 && Date.now() - lastSent < CONTACT_COOLDOWN_MS) {
        setStatus("Vous avez déjà envoyé un message il y a moins d'une minute.");
        return;
      }

      const action = form.getAttribute("action");
      if (!action) {
        setStatus("Configuration du formulaire incomplète.");
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      setStatus("Envoi en cours…");

      try {
        const res = await fetch(action, {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });
        let data = {};
        try {
          data = await res.json();
        } catch {
          /* non-JSON response */
        }

        if (res.ok) {
          setLastSentAt();
          setStatus("Merci ! Votre message a bien été envoyé.");
          form.reset();
        } else if (data && typeof data.error === "string") {
          setStatus(data.error);
        } else {
          setStatus("Impossible d’envoyer le message. Réessayez plus tard.");
        }
      } catch {
        setStatus("Problème de connexion. Réessayez dans un instant.");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();
