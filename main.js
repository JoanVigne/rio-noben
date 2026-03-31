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
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  if (form) {
    const status = form.querySelector("[data-form-status]");
    const setStatus = (msg) => {
      if (status) status.textContent = msg;
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") ?? "").trim();
      const email = String(fd.get("email") ?? "").trim();
      const message = String(fd.get("message") ?? "").trim();

      if (!name || !email || !message) {
        setStatus("Merci de remplir tous les champs.");
        return;
      }

      const subject = encodeURIComponent("Demande de rendez-vous");
      const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${message}`);
      setStatus("Ouverture de votre client email…");
      window.location.href = `mailto:nobenrio@proton.me?subject=${subject}&body=${body}`;
    });
  }
})();
