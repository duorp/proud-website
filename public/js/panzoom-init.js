document.addEventListener("DOMContentLoaded", () => {
  console.log("[panzoom] init");

  if (!window.Panzoom) {
    console.error("[panzoom] Panzoom library not loaded");
    return;
  }

  const elems = document.querySelectorAll("#poster-tile, #poster-tile-2");
  if (!elems.length) {
    console.warn("[panzoom] no poster tiles found");
    return;
  }

  elems.forEach((elem) => {
    const panzoom = Panzoom(elem, {
      startScale: 1,
      minScale: 1,
      maxScale: 5,
    });

    // Wheel zoom on the parent so the whole viewport is the hit area
    elem.parentElement?.addEventListener("wheel", panzoom.zoomWithWheel, { passive: false });

    console.log("[panzoom] ready", elem.id, panzoom);
  });
});