// src/lib/jump.js

/**
 * เลื่อนไปยัง element เป้าหมาย (รองรับ offset จาก fixed header)
 * @param {HTMLElement} el
 * @param {object} opts { behavior, offsetPx, focus, highlightMs }
 */
export function ensureVisible(el, opts = {}) {
  const {
    behavior = "smooth",
    offsetPx = 0,   // ความสูง header
    focus = false,  // โฟกัส element หลังเลื่อน
    highlightMs = 0 // ไฮไลท์ชั่วคราวหลังเลื่อน
  } = opts;

  // ใช้ scrollIntoView ก่อน เพื่อให้ browser หา position ให้
  el.scrollIntoView({ behavior, block: "start" });

  // ถ้ามี offset ก็เลื่อนชดเชยอีกนิด
  if (offsetPx) {
    window.scrollBy({ top: -offsetPx, left: 0, behavior });
  }

  if (focus) {
    // พอเลื่อนเสร็จแล้วโฟกัสให้ accessibility
    setTimeout(() => {
      if (typeof el.focus === "function") el.focus({ preventScroll: true });
    }, 10);
  }

  if (highlightMs > 0) {
    el.classList.add("jump-highlight");
    setTimeout(() => el.classList.remove("jump-highlight"), highlightMs);
  }
}

/**
 * รอจน DOM มี element (retry แบบ requestAnimationFrame) แล้วค่อยเลื่อน
 * ใช้เมื่อเรา navigate ก่อน และ DOM เพิ่งเรนเดอร์
 */
export function jumpToAnchorAfterRouteChange(anchorId, options = {}) {
  const { maxTries = 40, ...rest } = options;
  let tries = 0;

  function tryScroll() {
    const el = document.getElementById(anchorId);
    if (el) {
      ensureVisible(el, rest);
      return;
    }
    if (tries++ < maxTries) requestAnimationFrame(tryScroll);
  }

  requestAnimationFrame(tryScroll);
}

/**
 * รวมขั้นตอน: แนบ hash ใน URL + navigate + เมื่อ DOM มาแล้วเลื่อน
 * ใช้กับปุ่ม/ลิงก์ภายในแอป
 */
export function navigateAndJump(navigate, path, anchorId, options = {}) {
  const withHash = anchorId ? `${path}#${anchorId}` : path;
  navigate(withHash);
  if (anchorId) jumpToAnchorAfterRouteChange(anchorId, options);
}

/**
 * ใช้ในหน้า “ปลายทาง” เพื่อรองรับการเข้าผ่าน URL ตรงที่มี #hash
 * ใส่ใน useEffect ของหน้าปลายทางตอน mount
 */
export function initHashJumpOnMount(options = {}) {
  if (typeof window === "undefined") return;
  const hash = window.location.hash?.replace(/^#/, "");
  if (!hash) return;

  // กรณี hash มีจริง ให้รอ DOM แล้วเลื่อน
  jumpToAnchorAfterRouteChange(hash, options);
}
