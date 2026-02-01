document.addEventListener("DOMContentLoaded", () => {
    console.log("[panzoom] init");
  
    const elem = document.getElementById("poster-tile");
    if (!elem) {
      console.warn("[panzoom] #poster-tile not found");
      return;
    }
  
    if (!window.Panzoom) {
      console.error("[panzoom] Panzoom library not loaded");
      return;
    }
  
    const panzoom = Panzoom(elem, {
      maxScale: 5,
      contain: "outside",
    });
  
    // Wheel zoom (important: prevent page scroll stealing if you want)
    elem.parentElement?.addEventListener("wheel", panzoom.zoomWithWheel, { passive: false });
  
    console.log("[panzoom] ready", panzoom);
  });
  