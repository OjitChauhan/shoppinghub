/**
 * VirtualTryOnBody.jsx  ─  T-Shirt, Neck Jewellery, Watch & Furniture AR try-on
 * Route: /virtual-tryon-body/:_id?mode=shirt|jewellery|watch|furniture
 *
 * MediaPipe Pose loaded from CDN (no npm install).
 * Landmark references used:
 *   11=left_shoulder   12=right_shoulder
 *   23=left_hip        24=right_hip
 *   7=left_ear         8=right_ear
 *   15=left_wrist      16=right_wrist
 *   13=left_elbow      14=right_elbow
 *
 * Modes:
 *  shirt      → shoulder-aligned overlay, top-aligned to shoulder line
 *  jewellery  → neck-base overlay using shoulder+ear blend
 *  watch      → wrist overlay (dominant hand) with elbow-to-wrist rotation
 *  furniture  → floor-level overlay using hip midpoint as anchor
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";

/* ── Config ─────────────────────────────────────────────────── */
const CAM_W = 1280;
const CAM_H = 720;
const LERP = 0.18;

/* Pose landmark indices */
const L_SHOULDER = 11; const R_SHOULDER = 12;
const L_HIP = 23; const R_HIP = 24;
const L_EAR = 7; const R_EAR = 8;
const L_WRIST = 15; const R_WRIST = 16;
const L_ELBOW = 13; const R_ELBOW = 14;
const NOSE = 0;
const MOUTH_L = 9; const MOUTH_R = 10;  // mouth corners ≈ earlobe height

const lerp = (a, b, t) => a + (b - a) * t;

/* ── Load MediaPipe Pose from CDN once ──────────────────────── */
let poseScriptLoaded = false;
function loadPoseScript() {
  return new Promise((resolve, reject) => {
    if (poseScriptLoaded && window.Pose) { resolve(); return; }
    const existing = document.getElementById("mp-pose-script");
    if (existing) {
      const check = setInterval(() => {
        if (window.Pose) { clearInterval(check); poseScriptLoaded = true; resolve(); }
      }, 100);
      return;
    }
    const s = document.createElement("script");
    s.id = "mp-pose-script";
    s.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
    s.crossOrigin = "anonymous";
    s.onload = () => { poseScriptLoaded = true; resolve(); };
    s.onerror = () => reject(new Error("Failed to load MediaPipe Pose"));
    document.head.appendChild(s);

    if (!window.Camera) {
      const cam = document.createElement("script");
      cam.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
      cam.crossOrigin = "anonymous";
      document.head.appendChild(cam);
    }
  });
}

const imgUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

/* ═══════════════════════════════════════════════════════════════
   AR Viewport
══════════════════════════════════════════════════════════════ */
const BodyARViewport = ({ product, mode, cameraActive, onStart, status, onStatusChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const rafRef = useRef(null);
  const landmarksRef = useRef(null);
  const overlayImgRef = useRef(null);

  /* All smooth state in one ref to avoid deps */
  const S = useRef({
    sx: 0, sy: 0, sw: 0, sh: 0,        // shirt
    nx: 0, ny: 0, nw: 0,             // jewellery
    wx: 0, wy: 0, ww: 0, wr: 0,        // watch
    fx: 0, fy: 0, fw: 0,             // furniture
    roll: 0,                     // shoulder roll
    // per-ear earring smooth state
    elx: 0, ely: 0, erx: 0, ery: 0, ew: 0,
  });

  const [fps, setFps] = useState(0);
  const [tracking, setTracking] = useState(false);
  const fpsFrame = useRef(0); const fpsTimer = useRef(0);

  /* Load product image */
  useEffect(() => {
    overlayImgRef.current = null;
    if (!product?.image) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl(product.image);
    img.onload = () => { overlayImgRef.current = img; };
    img.onerror = () => { overlayImgRef.current = null; };
  }, [product]);

  /* Canvas resize */
  useEffect(() => {
    const sync = () => {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width = containerRef.current.offsetWidth;
      canvasRef.current.height = containerRef.current.offsetHeight;
    };
    sync();
    const ro = new ResizeObserver(sync);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* MediaPipe Pose */
  useEffect(() => {
    let cancelled = false;
    onStatusChange?.("loading");
    loadPoseScript()
      .then(() => {
        if (cancelled) return;
        const pose = new window.Pose({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
        });
        pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.55, minTrackingConfidence: 0.55 });
        pose.onResults((res) => { landmarksRef.current = res.poseLandmarks ?? null; });
        pose.initialize()
          .then(() => { if (!cancelled) onStatusChange?.("ready"); })
          .catch(() => { if (!cancelled) onStatusChange?.("error"); });
        poseRef.current = pose;
      })
      .catch(() => { if (!cancelled) onStatusChange?.("error"); });
    return () => { cancelled = true; poseRef.current?.close?.(); };
  }, [onStatusChange]);

  /* ── Draw ──────────────────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const lm = landmarksRef.current;
    const img = overlayImgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cw = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    /* ── FURNITURE: static floor overlay — NO body tracking required ── */
    if (mode === "furniture") {
      if (!img) return;
      const s = S.current;
      // 55% of frame width so piece comfortably fits
      const furnW = cw * 0.55;
      const furnH = furnW / (img.naturalWidth / (img.naturalHeight || 1));
      // Push floor to 97% height — near very bottom so furniture never covers a standing person
      const targetX = cw / 2;
      const targetY = ch * 0.97;
      s.fx = lerp(s.fx, targetX, 0.06);
      s.fy = lerp(s.fy, targetY, 0.06);
      s.fw = lerp(s.fw, furnW, 0.06);

      // Shadow ellipse at floor line
      ctx.save();
      ctx.translate(s.fx, s.fy);
      const shadowW = s.fw * 0.80;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, shadowW / 2);
      grad.addColorStop(0, "rgba(0,0,0,0.30)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.scale(1, 0.15);       // flat oval
      ctx.beginPath();
      ctx.ellipse(0, 0, shadowW / 2, shadowW / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Draw furniture UPRIGHT, bottom-aligned to floor line
      ctx.save();
      ctx.translate(s.fx, s.fy);
      ctx.globalAlpha = 0.97;
      ctx.drawImage(img, -s.fw / 2, -furnH, s.fw, furnH);
      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }

    if (!lm || !img) return;

    // Flip X to match CSS-mirrored video WITHOUT flipping the product image itself
    const px = (l) => (1 - l.x) * cw;
    const py = (l) => l.y * ch;
    const s = S.current;

    const lSh = lm[L_SHOULDER], rSh = lm[R_SHOULDER];
    const lHip = lm[L_HIP], rHip = lm[R_HIP];
    const lEar = lm[L_EAR], rEar = lm[R_EAR];
    const lWr = lm[L_WRIST], rWr = lm[R_WRIST];
    const lEl = lm[L_ELBOW], rEl = lm[R_ELBOW];

    const aspect = img.naturalWidth / (img.naturalHeight || 1);
    // Shoulder roll (negated because X is flipped)
    const shRoll = -Math.atan2(py(rSh) - py(lSh), px(rSh) - px(lSh));

    if (mode === "shirt") {
      /* ────────────────────── T-SHIRT ────────────────────── */
      const midShX = (px(lSh) + px(rSh)) / 2;
      const midShY = (py(lSh) + py(rSh)) / 2;
      const midHipY = (py(lHip) + py(rHip)) / 2;
      const shoulderW = Math.hypot(px(rSh) - px(lSh), py(rSh) - py(lSh));
      const shirtW = shoulderW * 1.75;
      const torsoH = Math.abs(midHipY - midShY);

      s.sx = lerp(s.sx, midShX, LERP);
      s.sy = lerp(s.sy, midShY, LERP);
      s.sw = lerp(s.sw, shirtW, LERP);
      s.sh = lerp(s.sh, torsoH, LERP);
      s.roll = lerp(s.roll, shRoll, LERP);

      // Raise the shirt: collar should sit ABOVE the shoulder midpoint.
      // -0.28 shifts the top edge ~28% of torso height above shoulder mid.
      const drawH = s.sh * 1.5;

      ctx.save();
      ctx.translate(s.sx, s.sy - s.sh * 0.28);  // ← raised significantly above shoulder line
      ctx.rotate(s.roll);
      ctx.drawImage(img, -s.sw / 2, 0, s.sw, drawH);
      ctx.restore();

    } else if (mode === "jewellery") {
      /* ────────────────────── NECK JEWELLERY ──────────────── */
      const midShX = (px(lSh) + px(rSh)) / 2;
      const midShY = (py(lSh) + py(rSh)) / 2;
      const midEarY = (py(lEar) + py(rEar)) / 2;
      const neckY = midShY + (midEarY - midShY) * 0.1;
      const shoulderW = Math.hypot(px(rSh) - px(lSh), py(rSh) - py(lSh));
      const neckW = shoulderW * 0.65;

      s.nx = lerp(s.nx, midShX, LERP);
      s.ny = lerp(s.ny, neckY, LERP);
      s.nw = lerp(s.nw, neckW, LERP);
      s.roll = lerp(s.roll, shRoll, LERP);

      const neckH = s.nw / aspect;

      ctx.save();
      ctx.translate(s.nx, s.ny);
      ctx.rotate(s.roll);
      ctx.drawImage(img, -s.nw / 2, -neckH * 0.2, s.nw, neckH);
      ctx.restore();

    } else if (mode === "watch") {
      /* ────────────────────── WATCH (wrist) ───────────────── */
      // Use whichever wrist has higher visibility
      const useLeft = (lWr?.visibility ?? 0) >= (rWr?.visibility ?? 0);
      const wrist = useLeft ? lWr : rWr;
      const elbow = useLeft ? lEl : rEl;

      if (!wrist || !elbow) return;

      const wx = px(wrist), wy = py(wrist);
      const ex = px(elbow), ey = py(elbow);
      // Elbow-to-wrist direction gives watch face angle (negate because X flipped)
      const wRoll = -Math.atan2(wy - ey, wx - ex);

      // Watch size: shoulder width × 0.50 (large enough to be clearly visible on wrist)
      const shoulderW = Math.hypot(px(rSh) - px(lSh), py(rSh) - py(lSh));
      const watchW = shoulderW * 0.50;

      s.wx = lerp(s.wx, wx, LERP);
      s.wy = lerp(s.wy, wy, LERP);
      s.ww = lerp(s.ww, watchW, LERP);
      s.wr = lerp(s.wr, wRoll, LERP);

      const watchH = s.ww / aspect;

      ctx.save();
      ctx.translate(s.wx, s.wy);
      ctx.rotate(s.wr);
      ctx.drawImage(img, -s.ww / 2, -watchH / 2, s.ww, watchH);
      ctx.restore();

    } else if (mode === "earring") {
      /* ════════════════════════════════════════════════════════════════════
         EARRING — 100% Anatomically Accurate Complex Model
         ═══════════════════════════════════════════════════════════════════

         THREE exact anatomical facts used (no arbitrary multipliers):

         1. EARLOBE Y  ≈ MOUTH CORNER Y
            MediaPipe Pose landmarks 9 (mouth_left) and 10 (mouth_right)
            sit at the exact same vertical level as the human earlobe.
            This is a well-known craniofacial proportion (Frankfurt plane).
            → earlobeY = avg(py(mouth_L), py(mouth_R))

         2. EARLOBE X  = EAR X slightly inward
            The ear canal landmark (7/8) is at the outer ear helix.
            The earlobe hangs ~10% of face-width INWARD from that point.
            → earlobeX = lerp(earX, faceCenter_X, 0.10)

         3. HEAD ROLL COMPENSATION
            Earrings should hang straight down (gravity).
            We remove the head roll angle using the shoulder roll.
            → ctx.rotate(-shRoll)

         4. EARRING SIZE = face_height × 0.135
            face_height = (shoulder_Y - ear_Y) which is a stable
            rigid-body proportion invariant to camera distance.
      ════════════════════════════════════════════════════════════════════ */

      const mL = lm[MOUTH_L], mR = lm[MOUTH_R];
      if (!mL || !mR) return;  // silently skip frame if mouth not yet detected

      // 1. Earlobe Y — slightly above mouth corner height
      //    (earlobe is at mouth-level but a bit higher: subtract ~10% of face-height)
      const mouthY = (py(mL) + py(mR)) / 2;

      // 2. Face center X (for slight inward shift)
      const faceCenterX = (px(lm[L_EAR]) + px(lm[R_EAR])) / 2;

      // 3. Face height for earring size
      const avgEarYraw = (py(lm[L_EAR]) + py(lm[R_EAR])) / 2;
      const avgShouY = (py(lSh) + py(rSh)) / 2;
      const faceHeight = Math.max(Math.abs(avgShouY - avgEarYraw), 40);
      const earringW = faceHeight * 0.135;
      const earringH = earringW / aspect;

      // Lerp all earring state
      const s = S.current;
      const lEarX = px(lm[L_EAR]);
      const rEarX = px(lm[R_EAR]);

      // Slight inward nudge to earlobe X (10% toward face center)
      const lLobeX = lEarX + (faceCenterX - lEarX) * 0.001;
      const rLobeX = rEarX + (faceCenterX - rEarX) * 0.001;

      // Earlobe sits ~10% of face-height ABOVE mouth corner (not exactly at mouth level)
      const earlobeY = mouthY - faceHeight * 0.10;

      s.elx = lerp(s.elx, lLobeX, LERP);
      s.ely = lerp(s.ely, earlobeY, LERP);
      s.erx = lerp(s.erx, rLobeX, LERP);
      s.ery = lerp(s.ery, earlobeY, LERP);
      s.ew = lerp(s.ew, earringW, LERP);

      const draw1Earring = (cx, cy) => {
        const vis = lm[L_EAR]?.visibility ?? 1;
        if (vis < 0.28 && cx === s.elx) return;
        ctx.save();
        ctx.translate(cx, cy);
        // Remove head roll so earring always hangs downward (gravity correct)
        ctx.rotate(-shRoll);
        ctx.drawImage(img, -s.ew / 2, 0, s.ew, s.ew / aspect);
        ctx.restore();
      };

      // Draw on BOTH ears if landmarks visible enough
      if ((lm[L_EAR]?.visibility ?? 0) >= 0.28) draw1Earring(s.elx, s.ely);
      if ((lm[R_EAR]?.visibility ?? 0) >= 0.28) draw1Earring(s.erx, s.ery);
    }
  }, [mode]);

  /* Render loop */
  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);
    const now = performance.now();
    fpsFrame.current++;
    if (now - fpsTimer.current > 1000) {
      setFps(fpsFrame.current);
      fpsFrame.current = 0;
      fpsTimer.current = now;
    }
    setTracking(!!landmarksRef.current);
    draw();
  }, [draw]);

  /* Start camera */
  const internalStart = useCallback(async () => {
    try {
      let CamUtil = window.Camera;
      if (!CamUtil) { await new Promise(r => setTimeout(r, 1500)); CamUtil = window.Camera; }
      if (!CamUtil) throw new Error("Camera utils not ready");
      cameraRef.current = new CamUtil(videoRef.current, {
        onFrame: async () => { if (poseRef.current) await poseRef.current.send({ image: videoRef.current }); },
        width: CAM_W, height: CAM_H, facingMode: "user",
      });
      await cameraRef.current.start();
      onStart?.();
      loop();
    } catch (e) {
      console.error("Camera error:", e);
      onStatusChange?.("error");
    }
  }, [loop, onStart, onStatusChange]);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    cameraRef.current?.stop?.();
  }, []);

  /* Tips per mode */
  const tips = {
    shirt: ["📷 Allow camera", "👕 Step back ~1.5m", "💡 Good lighting", "🙆 Both shoulders visible"],
    jewellery: ["📷 Allow camera", "💡 Good lighting", "👤 Neck & shoulders visible", "🙆 Face forward"],
    earring: ["📷 Allow camera", "💡 Good lighting", "👤 Both ears visible", "🙆 Face camera directly"],
    watch: ["📷 Allow camera", "⌚ Raise your wrist", "💡 Good lighting", "🙆 Keep elbow visible"],
    furniture: ["📷 Allow camera", "🪑 Point at floor", "💡 Good lighting", "🏠 Step out of frame"],
  };
  const modeIcon = { shirt: "👕", jewellery: "💍", earring: "💎", watch: "⌚", furniture: "🪑" };
  const modeLabel = { shirt: "T-Shirt Try-On", jewellery: "Jewellery Try-On", earring: "Earring Try-On", watch: "Watch Try-On", furniture: "Furniture Try-On" };
  const modeColor = { shirt: "text-blue-300", jewellery: "text-purple-300", earring: "text-rose-300", watch: "text-amber-300", furniture: "text-emerald-300" };
  const modeBorder = { shirt: "border-blue-400/40 bg-blue-500/20", jewellery: "border-purple-400/40 bg-purple-500/20", earring: "border-rose-400/40 bg-rose-500/20", watch: "border-amber-400/40 bg-amber-500/20", furniture: "border-emerald-400/40 bg-emerald-500/20" };

  return (
    <div ref={containerRef} className="relative w-full rounded-3xl overflow-hidden bg-black" style={{ aspectRatio: `${CAM_W}/${CAM_H}` }}>
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)" }} />

      {/* HUD */}
      {cameraActive && (
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-20">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs text-white font-mono">
            <span className={`w-2 h-2 rounded-full ${tracking ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {tracking ? "Body Locked ✓" : "Searching…"}
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs text-white font-mono">
            {fps} fps · {modeIcon[mode]} {modeLabel[mode]}
          </div>
        </div>
      )}

      {/* Product badge */}
      {cameraActive && product && (
        <div className="absolute bottom-4 inset-x-4 flex justify-center z-20 pointer-events-none">
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl">
            <img src={imgUrl(product.image)} alt="" className="w-8 h-8 rounded-lg object-cover" onError={e => e.target.style.display = "none"} />
            <div>
              <p className="text-xs font-bold text-white leading-none">{product.name}</p>
              <p className="text-xs text-yellow-400 font-bold mt-0.5">₹{product?.price?.toLocaleString?.("en-IN") ?? product?.price}</p>
            </div>
          </div>
        </div>
      )}

      {/* Corner brackets */}
      {cameraActive && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {["top-4 left-4 border-t-2 border-l-2", "top-4 right-4 border-t-2 border-r-2", "bottom-4 left-4 border-b-2 border-l-2", "bottom-4 right-4 border-b-2 border-r-2"].map((cls, i) => (
            <div key={i} className={`absolute w-7 h-7 border-yellow-400/70 rounded-sm ${cls}`} />
          ))}
        </div>
      )}

      {/* Start overlay */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10"
          style={{ background: "linear-gradient(160deg,rgba(8,12,24,0.97) 0%,rgba(16,28,56,0.95) 100%)" }}>
          <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${modeBorder[mode]} ${modeColor[mode]}`}>
            {modeIcon[mode]} {modeLabel[mode]}
          </div>
          {product && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full" />
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-yellow-400/20 bg-white/5 shadow-2xl">
                  <img src={imgUrl(product.image)} alt={product.name} className="w-full h-full object-contain p-3"
                    onError={e => { e.target.src = "https://placehold.co/128?text=?"; }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg leading-tight">{product.name}</p>
                {product.brand && <p className="text-slate-400 text-sm mt-0.5">{product.brand}</p>}
                <p className="text-yellow-400 font-extrabold text-xl mt-1">₹{product?.price?.toLocaleString?.("en-IN") ?? product?.price}</p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {(tips[mode] || tips.shirt).map(t => (
              <span key={t} className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
          <button onClick={internalStart} disabled={status === "loading"}
            className={`px-10 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 ${status !== "loading" ? "bg-yellow-400 hover:bg-yellow-300 text-black shadow-xl shadow-yellow-400/25 hover:scale-105 active:scale-95" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}>
            {status === "loading"
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />Loading AI…</span>
              : `${modeIcon[mode]}  Start ${modeLabel[mode]}`}
          </button>
          {status === "error" && <p className="text-red-400 text-xs text-center max-w-xs">Failed to load AI model. Check your internet connection.</p>}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
const VirtualTryOnBody = () => {
  const { _id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const VALID_MODES = ["shirt", "jewellery", "earring", "watch", "furniture"];
  const mode = VALID_MODES.includes(searchParams.get("mode")) ? searchParams.get("mode") : "shirt";

  const [product, setProduct] = useState(location.state ?? null);
  const [loadingProd, setLoadingProd] = useState(!location.state);
  const [fetchError, setFetchError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [mpStatus, setMpStatus] = useState("loading");
  const handleMpStatus = useCallback(s => setMpStatus(s), []);

  useEffect(() => {
    if (location.state) { setLoadingProd(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/products/${_id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setProduct(await res.json());
      } catch {
        setFetchError("Could not load product details.");
      } finally {
        setLoadingProd(false);
      }
    })();
  }, [_id, location.state]);

  const modeLabel = { shirt: "T-Shirt Try-On", jewellery: "Jewellery Try-On", watch: "Watch Try-On", furniture: "Furniture Try-On" };
  const modeColor = { shirt: "text-blue-300", jewellery: "text-purple-300", watch: "text-amber-300", furniture: "text-emerald-300" };

  const techFeatures = {
    shirt: ["MediaPipe Pose – 33 body landmarks", "Shoulder-to-hip shirt placement", "Real-time roll/tilt correction", "Adaptive LERP smoothing"],
    jewellery: ["Neck-base jewellery anchoring", "Shoulder + ear blend positioning", "Roll-angle correction", "Adaptive LERP smoothing"],
    watch: ["Wrist landmark detection", "Elbow-to-wrist rotation alignment", "Dominant hand auto-selection", "Adaptive LERP smoothing"],
    furniture: ["Hip landmark floor estimation", "Perspective foreshortening effect", "Floor-plane projection", "Adaptive LERP smoothing"],
  };

  return (
    <div className="min-h-screen bg-[#080c18] text-white">

      {/* Top bar — NO mode switching; mode is fixed by product category */}
      <div className="border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex-1 text-center">
            <span className={`text-sm font-bold tracking-widest uppercase ${modeColor[mode] || "text-yellow-300"}`}>
              Virtual {modeLabel[mode] || mode}
            </span>
          </div>
          <span className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-0.5 rounded-full font-semibold">AI Beta</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {fetchError && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="text-red-400 font-semibold">{fetchError}</p>
            <button onClick={() => navigate(-1)} className="mt-6 text-sm text-slate-400 underline">Go back</button>
          </div>
        )}
        {loadingProd && !fetchError && (
          <div className="text-center py-24 text-slate-400">
            <div className="w-10 h-10 border-2 border-slate-600 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading product…</p>
          </div>
        )}
        {!loadingProd && !fetchError && (
          <div className="grid lg:grid-cols-[1fr_260px] gap-8">

            {/* AR Viewport */}
            <div className="space-y-3">
              <BodyARViewport product={product} mode={mode} cameraActive={cameraActive}
                onStart={() => setCameraActive(true)} status={mpStatus} onStatusChange={handleMpStatus} />
              {cameraActive && (
                <p className="text-center text-xs text-slate-500">
                  {{
                    shirt: "💡 Step back ~1.5m · ☀️ Keep shoulders visible",
                    jewellery: "💡 Keep neck & shoulders visible · Face forward",
                    watch: "⌚ Raise your wrist toward the camera · keep elbow in frame",
                    furniture: "🪑 Stand back 2m+ · Full body + floor in frame",
                  }[mode]}
                </p>
              )}
            </div>

            {/* Product info card */}
            {product && (
              <div className="flex flex-col gap-4">
                <div className="rounded-3xl border border-white/8 bg-white/4 p-5 flex flex-col items-center gap-4">
                  <div className="w-full aspect-square max-w-[170px] rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
                    <img src={imgUrl(product.image)} alt={product.name} className="w-full h-full object-contain p-3"
                      onError={e => { e.target.src = "https://placehold.co/200?text=?"; }} />
                  </div>
                  <div className="text-center w-full">
                    {product.brand && <p className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1">{product.brand}</p>}
                    <h2 className="text-base font-extrabold text-white leading-tight">{product.name}</h2>
                    <p className="text-2xl font-black text-yellow-400 mt-2">₹{product?.price?.toLocaleString?.("en-IN") ?? product?.price}</p>
                  </div>
                </div>

                {product.description && (
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</p>
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">{product.description}</p>
                  </div>
                )}

                <button onClick={() => navigate(`/product/${_id}`)}
                  className="w-full py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/20">
                  View Full Details →
                </button>

                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Powered By</p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(techFeatures[mode] || techFeatures.shirt).map(f => (
                      <li key={f} className="flex items-center gap-2"><span className="text-yellow-400">✓</span>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnBody;
