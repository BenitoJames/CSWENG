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

// Facebook Page Plugin responsive width sync
const fbWrap = document.getElementById("fb-embed-wrap");
const fbIframe = document.getElementById("fb-page-iframe");
if (fbWrap && fbIframe) {
  const syncFbWidth = () => {
    const w = Math.max(280, Math.min(500, Math.floor(fbWrap.clientWidth)));
    const pageUrl = encodeURIComponent("https://www.facebook.com/profile.php?id=61550748301155");
    const nextSrc = `https://www.facebook.com/plugins/page.php?href=${pageUrl}&tabs=timeline&width=${w}&height=460&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;
    if (fbIframe.getAttribute("data-w") !== String(w)) {
      fbIframe.setAttribute("data-w", String(w));
      fbIframe.width = String(w);
      fbIframe.src = nextSrc;
    }
  };
  window.addEventListener("load", syncFbWidth, { once: true });
  syncFbWidth();
}

const MESSENGER_URL = "https://m.me/61550748301155";

const form = document.getElementById("booking-form");
const sent = document.getElementById("booking-sent");
const statusEl = document.getElementById("booking-status");
const preview = document.getElementById("booking-preview");
const phoneInput = document.getElementById("phone");
const dateInput = document.getElementById("date");
dateInput.min = new Date().toISOString().split("T")[0];

phoneInput.addEventListener("input", () => {
  const digits = phoneInput.value.replace(/[\s-]/g, "");
  const valid = /^(\+?63|0)9\d{9}$/.test(digits);
  phoneInput.setCustomValidity(valid || !digits ? "" : "Enter a valid mobile number, e.g. 0917 123 4567");
});

const formatDay = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-PH", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });
};

const formatTime = (value) => {
  const [h, m] = value.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const buildMessage = () => {
  const f = form.elements;
  return [
    `Customer Name: ${f.owner.value.trim()}`,
    `Mobile #: ${f.phone.value.trim()}`,
    `Pet Name: ${f.pet.value.trim()}`,
    `Breed: ${f.breed.value.trim()}`,
    `Preffered Day: ${formatDay(f.date.value)}`,
    `Preffered Time: ${formatTime(f.time.value)}`
  ].join("\n");
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    area.remove();
    return ok;
  }
};

const showCopyResult = (ok) => {
  statusEl.textContent = ok
    ? "Your details are copied. Paste them into the Messenger chat with Pawlish and press send."
    : "Copy the details below, then paste them into the Messenger chat with Pawlish and press send.";
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const message = buildMessage();
  preview.textContent = message;
  form.hidden = true;
  sent.hidden = false;
  copyText(message).then(showCopyResult);
  window.open(MESSENGER_URL, "_blank", "noopener");
  sent.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("copy-again").addEventListener("click", () => {
  copyText(preview.textContent).then(showCopyResult);
});

document.getElementById("edit-booking").addEventListener("click", () => {
  sent.hidden = true;
  form.hidden = false;
});

document.getElementById("year").textContent = new Date().getFullYear();

// Hero quick nav
const sectionSelect = document.getElementById("section-select");

sectionSelect.addEventListener("change", () => {
  const sectionId = sectionSelect.value;

  if (!sectionId) return;

  const destination = document.getElementById(sectionId);

  if (destination) {
    destination.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  sectionSelect.value = "";
});
