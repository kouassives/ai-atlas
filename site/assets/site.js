document.addEventListener("DOMContentLoaded", () => {
  for (const [filterId, targets] of [["skill-filter", "[data-search]"], ["agent-filter", "[data-search]"]]) {
    const input = document.getElementById(filterId);
    if (!input) continue;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll(targets).forEach((el) => {
        const hay = (el.getAttribute("data-search") || "").toLowerCase();
        el.style.display = !q || hay.includes(q) ? "" : "none";
      });
    });
  }
});