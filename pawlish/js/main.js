// Header: solid background once the page scrolls
const topbar = document.querySelector(".topbar");
const onScroll = () => topbar.classList.toggle("scrolled", window.scrollY > 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.querySelector(".menu-toggle");
const setMenu = (open) => {
  document.body.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
document.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Logo always returns to the top of the page
document.querySelectorAll(".brand").forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  setMenu(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", location.pathname + location.search);
}));

// Arched photos: only swap in the photo once it actually loads,
// so a missing file keeps the branded fallback instead of a blank box.
document.querySelectorAll(".arch[data-img]").forEach((el) => {
  const img = new Image();
  img.onload = () => {
    // img.src is absolute, so the url() doesn't resolve against /css
    el.style.setProperty("--img", `url("${img.src}")`);
    el.classList.add("has-img");
  };
  img.src = el.dataset.img;
});

// Reveal sections as they scroll into view
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// Service menu tabs
const tabs = document.querySelectorAll(".menu-tab");
const selectTab = (tab) => {
  tabs.forEach((t) => {
    const active = t === tab;
    t.setAttribute("aria-selected", String(active));
    t.tabIndex = active ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !active;
  });
};
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// Booking form: no backend yet, so validate and show a confirmation
const form = document.getElementById("booking-form");
const dateInput = document.getElementById("date");
dateInput.min = new Date().toISOString().split("T")[0];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const pet = form.pet.value.trim();
  form.innerHTML = `
    <div class="form-success">
      <span class="logo-mark" aria-hidden="true"></span>
      <h3>Thank you.</h3>
      <p>We've received your request for ${pet.replace(/[<>&"]/g, "")}. Our team will text or call to confirm your appointment.</p>
    </div>`;
});

document.getElementById("year").textContent = new Date().getFullYear();
