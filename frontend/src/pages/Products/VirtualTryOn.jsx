/**
 * VirtualTryOn.jsx
 * Route: /virtual-tryon/:_id
 * Product passed via navigate state: { image, name, brand, price, description }
 * Falls back to /api/products/:id if state is missing.
 *
 * Canvas mirror approach:
 *   - Video: CSS scaleX(-1) for selfie view
 *   - Canvas: NO CSS transform — mirror applied inside ctx via ctx.transform(-1,0,0,1,cw,0)
 *   - This keeps ctx.rotate() direction correct (CSS mirror inverts rotation)
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import * as faceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

/* ── Config ─────────────────────────────────────────────────── */
const CAM_W = 1280;
const CAM_H  = 720;
const LERP   = 0.20;

/* ── Landmark indices ────────────────────────────────────────── */
const LM_LEFT_OUTER  = 130;
const LM_RIGHT_OUTER = 359;
const LM_NOSE_BRIDGE = 168;
const LM_FOREHEAD    = 10;
const LM_CHIN        = 152;

/* ── Image URL ───────────────────────────────────────────────── */
const imgUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

/* ── Lerp ────────────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t;

/* ═══════════════════════════════════════════════════════════════
   AR VIEWPORT
══════════════════════════════════════════════════════════════ */
const ARViewport = ({ product, cameraActive, onStart, status, onStatusChange }) => {
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);

  const faceMeshRef    = useRef(null);
  const cameraUtilsRef = useRef(null);
  const landmarksRef   = useRef(null);
  const glassImgRef    = useRef(null);
  const rafRef         = useRef(null);

  const smooth = useRef({ cx: 0, cy: 0, w: 0, roll: 0, pitch: 0 });

  const fpsFrame   = useRef(0);
  const fpsTimer   = useRef(0);
  const [localFps,      setLocalFps]      = useState(0);
  const [localTracking, setLocalTracking] = useState(false);

  /* Load product image */
  useEffect(() => {
    glassImgRef.current = null;
    if (!product?.image) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl(product.image);
    img.onload  = () => { glassImgRef.current = img; };
    img.onerror = () => { glassImgRef.current = null; };
  }, [product]);

  /* MediaPipe */
  useEffect(() => {
    const fm = new faceMesh.FaceMesh({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
    });
    fm.setOptions({
      maxNumFaces: 1, refineLandmarks: true,
      minDetectionConfidence: 0.65, minTrackingConfidence: 0.65,
    });
    fm.onResults((res) => {
      landmarksRef.current = res.multiFaceLandmarks?.[0] ?? null;
    });
    fm.initialize()
      .then(() => onStatusChange?.("ready"))
      .catch(() => onStatusChange?.("error"));
    faceMeshRef.current = fm;
    return () => fm.close?.();
  }, [onStatusChange]);

  /* Canvas resize */
  useEffect(() => {
    const sync = () => {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width  = containerRef.current.offsetWidth;
      canvasRef.current.height = containerRef.current.offsetHeight;
    };
    sync();
    const ro = new ResizeObserver(sync);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* Draw
   *
   * KEY FIX: ctx.transform(-1, 0, 0, 1, cw, 0) mirrors the canvas
   * coordinate space (same as CSS scaleX(-1) on the video) WITHOUT
   * inverting ctx.rotate(), so the roll angle is applied correctly.
   * landmark.x is used as-is (no 1-x flip needed after the ctx transform).
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const lm     = landmarksRef.current;
    const img    = glassImgRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const cw  = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    if (!lm || !img) return;

    // Mirror transform: matches CSS scaleX(-1) on the video element
    ctx.save();
    ctx.transform(-1, 0, 0, 1, cw, 0);

    const px = (l) => l.x * cw;
    const py = (l) => l.y * ch;

    const lO   = lm[LM_LEFT_OUTER],  rO   = lm[LM_RIGHT_OUTER];
    const nose = lm[LM_NOSE_BRIDGE], fore = lm[LM_FOREHEAD], chin = lm[LM_CHIN];

    const midPx  = (px(lO) + px(rO)) / 2;
    const midPy  = (py(lO) + py(rO)) / 2;
    const eyeW   = Math.hypot(px(rO) - px(lO), py(rO) - py(lO)) * 1.65;
    const aspect = img.naturalWidth / (img.naturalHeight || 1);
    const roll   = Math.atan2(py(rO) - py(lO), px(rO) - px(lO));

    const faceH      = Math.abs(py(chin) - py(fore)) || 1;
    const pitchShift = ((py(nose) - py(fore)) / faceH - 0.40) * (eyeW / aspect) * 1.0;

    const s = smooth.current;
    s.cx    = lerp(s.cx,    midPx,      LERP);
    s.cy    = lerp(s.cy,    midPy,      LERP);
    s.w     = lerp(s.w,     eyeW,       LERP);
    s.roll  = lerp(s.roll,  roll,       LERP);
    s.pitch = lerp(s.pitch, pitchShift, LERP);

    const sw = s.w, sh = sw / aspect;

    ctx.translate(s.cx, s.cy + s.pitch);
    ctx.rotate(s.roll);
    ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
    ctx.restore();
  }, []);

  /* Render loop */
  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);
    const now = performance.now();
    fpsFrame.current++;
    if (now - fpsTimer.current > 1000) {
      setLocalFps(fpsFrame.current);
      fpsFrame.current = 0;
      fpsTimer.current = now;
    }
    setLocalTracking(!!landmarksRef.current);
    draw();
  }, [draw]);

  /* Start camera */
  const internalStart = useCallback(async () => {
    try {
      cameraUtilsRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current)
            await faceMeshRef.current.send({ image: videoRef.current });
        },
        width: CAM_W, height: CAM_H, facingMode: "user",
      });
      await cameraUtilsRef.current.start();
      onStart?.();
      loop();
    } catch (e) {
      console.error("Camera error:", e);
      onStatusChange?.("error");
    }
  }, [loop, onStart, onStatusChange]);

  /* Cleanup */
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    cameraUtilsRef.current?.stop();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden bg-black"
      style={{ aspectRatio: `${CAM_W}/${CAM_H}` }}
    >
      {/* Mirrored video feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
        playsInline muted
      />

      {/* Canvas — NO CSS mirror, mirrored inside ctx */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />

      {/* HUD */}
      {cameraActive && (
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-20">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs text-white font-mono">
            <span className={`w-2 h-2 rounded-full ${localTracking ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {localTracking ? "Face Locked" : "Searching…"}
          </div>
          <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs text-white font-mono">
            {localFps} fps
          </div>
        </div>
      )}

      {/* Product badge at bottom */}
      {cameraActive && product && (
        <div className="absolute bottom-4 inset-x-4 flex justify-center z-20 pointer-events-none">
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl">
            <img
              src={imgUrl(product.image)} alt=""
              className="w-8 h-8 rounded-lg object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div>
              <p className="text-xs font-bold text-white leading-none">{product.name}</p>
              <p className="text-xs text-yellow-400 font-bold mt-0.5">
                ₹{product?.price?.toLocaleString?.("en-IN") ?? product?.price}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Corner brackets while active */}
      {cameraActive && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[
            "top-4 left-4 border-t-2 border-l-2",
            "top-4 right-4 border-t-2 border-r-2",
            "bottom-4 left-4 border-b-2 border-l-2",
            "bottom-4 right-4 border-b-2 border-r-2",
          ].map((cls, i) => (
            <div key={i} className={`absolute w-7 h-7 border-yellow-400/70 rounded-sm ${cls}`} />
          ))}
        </div>
      )}

      {/* Start overlay */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10"
             style={{ background: "linear-gradient(160deg,rgba(8,12,24,0.97) 0%,rgba(16,28,56,0.95) 100%)" }}>

          {product && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full" />
                <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-yellow-400/20 bg-white/5 shadow-2xl">
                  <img
                    src={imgUrl(product.image)} alt={product.name}
                    className="w-full h-full object-contain p-3"
                    onError={(e) => { e.target.src = "https://placehold.co/144?text=?"; }}
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg leading-tight">{product.name}</p>
                {product.brand && <p className="text-slate-400 text-sm mt-0.5">{product.brand}</p>}
                <p className="text-yellow-400 font-extrabold text-xl mt-1">
                  ₹{product?.price?.toLocaleString?.("en-IN") ?? product?.price}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {["📷 Allow camera", "🔆 Good lighting", "👤 Centre your face"].map((t) => (
              <span key={t} className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>

          <button
            onClick={internalStart}
            disabled={status === "loading"}
            className={`px-10 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200
              ${status !== "loading"
                ? "bg-yellow-400 hover:bg-yellow-300 text-black shadow-xl shadow-yellow-400/25 hover:scale-105 active:scale-95"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}
          >
            {status === "loading"
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />Loading AI…</span>
              : "🕶️  Start Try-On"}
          </button>

          {status === "error" && (
            <p className="text-red-400 text-xs">Failed to load AI model. Check your internet connection.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
const VirtualTryOnPro = () => {
  const { _id }    = useParams();
  const location   = useLocation();
  const navigate   = useNavigate();

  const [product,      setProduct]      = useState(location.state ?? null);
  const [loadingProd,  setLoadingProd]  = useState(!location.state);
  const [fetchError,   setFetchError]   = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [mpStatus,     setMpStatus]     = useState("loading");

  const handleMpStatus = useCallback((s) => setMpStatus(s), []);

  /* Fetch product by ID when state is not passed */
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

  return (
    <div className="min-h-screen bg-[#080c18] text-white">

      {/* ── Sticky top bar ────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm font-bold tracking-widest text-slate-300 uppercase">Virtual Try-On</span>
          </div>
          <span className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-0.5 rounded-full font-semibold">
            AI Beta
          </span>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
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
          <div className="grid lg:grid-cols-[1fr_280px] gap-8">

            {/* Left – AR viewport */}
            <div className="space-y-3">
              <ARViewport
                product={product}
                cameraActive={cameraActive}
                onStart={() => setCameraActive(true)}
                status={mpStatus}
                onStatusChange={handleMpStatus}
              />
              {cameraActive && (
                <p className="text-center text-xs text-slate-500">
                  💡 Move close to the camera · ☀️ Good lighting helps · 👤 Keep face centered
                </p>
              )}
            </div>

            {/* Right – Product info card */}
            {product && (
              <div className="flex flex-col gap-4">

                {/* Image + info */}
                <div className="rounded-3xl border border-white/8 bg-white/4 p-5 flex flex-col items-center gap-4">
                  <div className="w-full aspect-square max-w-[180px] rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
                    <img
                      src={imgUrl(product.image)} alt={product.name}
                      className="w-full h-full object-contain p-3"
                      onError={(e) => { e.target.src = "https://placehold.co/200?text=?"; }}
                    />
                  </div>
                  <div className="text-center w-full">
                    {product.brand && (
                      <p className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1">{product.brand}</p>
                    )}
                    <h2 className="text-base font-extrabold text-white leading-tight">{product.name}</h2>
                    <p className="text-2xl font-black text-yellow-400 mt-2">
                      ₹{product?.price?.toLocaleString?.("en-IN") ?? product?.price}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</p>
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">{product.description}</p>
                  </div>
                )}

                {/* Actions */}
                <button
                  onClick={() => navigate(`/product/${_id}`)}
                  className="w-full py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/20"
                >
                  View Full Details →
                </button>

                {/* Tech features */}
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Powered By</p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {[
                      "468-point face mesh tracking",
                      "Real-time pitch & roll correction",
                      "Canvas mirror-correct overlay",
                      "Adaptive smooth lerp filter",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="text-yellow-400">✓</span> {f}
                      </li>
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

export default VirtualTryOnPro;