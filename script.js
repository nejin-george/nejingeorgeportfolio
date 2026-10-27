const progress = document.querySelector(".scroll-progress");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${percent}%`;
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();


menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function (event) {
    const href = this.getAttribute("href");

    if (!href || href === "#") return;

    const target = document.getElementById(href.substring(1));

    if (!target) {
      console.error("Navigation target not found:", href);
      return;
    }

    event.preventDefault();

    // Update the URL and scroll to the selected section.
    history.replaceState(null, "", href);

    target.scrollIntoView({
      behavior: "auto",
      block: "start"
    });

    // Close the menu after starting navigation.
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

nav.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function (event) {
    const targetId = this.getAttribute("href");
    const target = document.querySelector(targetId);

    if (target) {
      event.preventDefault();

      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(null, "", targetId);
    }
  });
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
}

document.getElementById("year").textContent = new Date().getFullYear();

/* Interactive neon ribbon background */
(() => {
  const canvas = document.getElementById("flowing-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let width = 0;
  let height = 0;
  let frame = 0;
  let lastTime = 0;

  const mouse = {
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5
  };

  const colors = [
    [0, 220, 255],   // Cyan
    [50, 100, 255],  // Electric blue
    [170, 40, 255],  // Purple
    [255, 0, 190]    // Magenta
  ];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function pointerMove(event) {
    mouse.targetX = event.clientX / width;
    mouse.targetY = event.clientY / height;
  }

  window.addEventListener("resize", resize);

  window.addEventListener("pointermove", pointerMove, {
    passive: true
  });

  window.addEventListener("pointerleave", () => {
    mouse.targetX = 0.5;
    mouse.targetY = 0.5;
  });

  function ribbon(time, index) {
    const color = colors[index % colors.length];

    const centerY =
      height * (0.28 + index * 0.14) +
      Math.sin(time * 0.00035 + index * 1.5) * height * 0.08 +
      (mouse.y - 0.5) * height * (0.18 + index * 0.035);

    const amplitude = height * (0.055 + index * 0.012);
    const frequency = 0.007 + index * 0.0007;
    const phase = time * (0.0007 + index * 0.00008)
      + mouse.x * 4;

    ctx.beginPath();

    for (let x = -20; x <= width + 20; x += 5) {
      const wave =
        Math.sin(x * frequency + phase) * amplitude +
        Math.sin(x * frequency * 0.48 - phase * 1.4)
          * amplitude * 0.48;

      const y = centerY + wave;

      if (x === -20) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    const gradient = ctx.createLinearGradient(
      0, centerY - amplitude * 1.6,
      width, centerY + amplitude * 1.6
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(
      0.2,
      `rgba(${color.join(",")},0.05)`
    );
    gradient.addColorStop(
      0.5,
      `rgba(${color.join(",")},0.72)`
    );
    gradient.addColorStop(
      0.8,
      `rgba(${color.join(",")},0.12)`
    );
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 18 + index * 3;
    ctx.lineCap = "round";

    ctx.shadowColor = `rgb(${color.join(",")})`;
    ctx.shadowBlur = 28;

    ctx.stroke();

    // Fine, bright highlight running along the ribbon
    ctx.beginPath();

    for (let x = -20; x <= width + 20; x += 5) {
      const wave =
        Math.sin(x * frequency + phase) * amplitude +
        Math.sin(x * frequency * 0.48 - phase * 1.4)
          * amplitude * 0.48;

      const y = centerY + wave;

      if (x === -20) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.lineWidth = 1.4;
    ctx.shadowBlur = 12;
    ctx.strokeStyle =
      `rgba(${color.join(",")},0.65)`;

    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function animate(time) {
    frame = requestAnimationFrame(animate);

    // Limit animation work to roughly 30 FPS
    if (time - lastTime < 33) return;
    lastTime = time;

    mouse.x += (mouse.targetX - mouse.x) * 0.045;
    mouse.y += (mouse.targetY - mouse.y) * 0.045;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(8, 9, 16, 0.22)";
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "screen";

    for (let i = 0; i < 4; i++) {
      ribbon(time, i);
    }

    ctx.globalCompositeOperation = "source-over";
  }

  resize();

  if (reducedMotion.matches) {
    ctx.fillStyle = "#080910";
    ctx.fillRect(0, 0, width, height);
  } else {
    frame = requestAnimationFrame(animate);
  }

  reducedMotion.addEventListener("change", () => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, width, height);

    if (reducedMotion.matches) {
      ctx.fillStyle = "#080910";
      ctx.fillRect(0, 0, width, height);
    } else {
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    }
  });
})();

