#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

echo "⚙️  Patching zweig_vogel_drag.js …"
patch -u zweig_vogel_drag.js <<'PATCH'
@@
-  let dragging = false;
-  let pointerId = null;
+  let dragging = false;
+  let pointerId = null;
+  // Merker für „kürzlich am Vogel getappt/gezogen“
+  const BIRD_TOUCH_GRACE_MS = 600;
+
+  function markBirdTouch() {
+    window.isBirdDragging = true;                 
+    window._justTouchedBirdUntil = performance.now() + BIRD_TOUCH_GRACE_MS;
+  }
+  function clearBirdTouch() {
+    window.isBirdDragging = false;
+  }
@@
   function onPointerDown(e) {
     if (e.button != null && e.button !== 0) return; // nur linker Button
-
-      dragging = true;
-      pointerId = e.pointerId ?? null;
-      vogel.setPointerCapture?.(pointerId);
+    dragging = true;
+    markBirdTouch();
+    pointerId = e.pointerId ?? null;
+    vogel.setPointerCapture?.(pointerId);
@@
-  function onPointerUp() {
-      dragging = false;
-      pointerId = null;
-    }
+  function onPointerUp() {
+    dragging = false;
+    clearBirdTouch();
+    pointerId = null;
+  }
PATCH

echo "⚙️  Patching navigation.js …"
patch -u navigation.js <<'PATCH'
@@
-  // Swipe-Navigation (respektiert Vogel-Drag)
-  let globalStartX = 0;
-  document.body.addEventListener(
-    'touchstart',
-    (e) => {
-      if (!window.isBirdDragging) globalStartX = e.touches[0].clientX;
-    },
-    { passive: true }
-  );
-
-  document.body.addEventListener('touchend', (e) => {
-    if (window.isBirdDragging) return;
-    const diff = globalStartX - e.changedTouches[0].clientX;
-    if (Math.abs(diff) > 50) {
-      const list = Array.from(items);
-      const activeIdx = list.findIndex((i) => i.classList.contains('menu-item-active'));
-      let newIdx = activeIdx + (diff > 0 ? 1 : -1);
-      if (newIdx < 0) newIdx = list.length - 1;
-      if (newIdx >= list.length) newIdx = 0;
-      list[newIdx].click();
-    }
-  });
+  // Swipe-Navigation (respektiert Vogel-Interaktionen)
+  let globalStartX = 0;
+  let globalStartTime = 0;
+
+  const onBirdArea = (el) =>
+    el && (el.id === 'bg-vogel' || (el.closest && el.closest('#bg-vogel')));
+
+  document.body.addEventListener('touchstart', (e) => {
+    if (onBirdArea(e.target)) return;
+    if (window.isBirdDragging) return;
+    if (performance.now() < (window._justTouchedBirdUntil || 0)) return;
+    globalStartX = e.touches[0].clientX;
+    globalStartTime = performance.now();
+  }, { passive: true });
+
+  document.body.addEventListener('touchend', (e) => {
+    if (window.isBirdDragging) return;
+    if (performance.now() < (window._justTouchedBirdUntil || 0)) return;
+    if (onBirdArea(e.target)) return;
+
+    const diff = globalStartX - e.changedTouches[0].clientX;
+    const dt = performance.now() - globalStartTime;
+
+    const MIN_SWIPE_PX = 60;
+    const MAX_SWIPE_MS = 800;
+    if (Math.abs(diff) > MIN_SWIPE_PX && dt < MAX_SWIPE_MS) {
+      const list = Array.from(items);
+      const activeIdx = list.findIndex((i) => i.classList.contains('menu-item-active'));
+      let newIdx = activeIdx + (diff > 0 ? 1 : -1);
+      if (newIdx < 0) newIdx = list.length - 1;
+      if (newIdx >= list.length) newIdx = 0;
+      list[newIdx].click();
+    }
+  }, { passive: true });
PATCH

echo "✅ Patch angewendet. Bitte Browser-Cache leeren und testen."
