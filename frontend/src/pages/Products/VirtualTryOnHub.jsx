import React from "react";
import { Link } from "react-router-dom";

const TRY_ON_MODES = [
  {
    id: "glasses",
    emoji: "🕶",
    title: "Glasses Try-On",
    desc: "Try on sunglasses & eyewear live with face mesh AR tracking.",
    color: "from-yellow-500/20 to-amber-500/10",
    border: "border-yellow-400/30",
    badge: "bg-yellow-400/20 text-yellow-300",
    tip: "Face the camera · Good lighting",
    link: "/shop?category=6994c47ff9d51654f4094c59",
  },
  {
    id: "shirt",
    emoji: "👕",
    title: "Shirt Try-On",
    desc: "See how a shirt fits on your body in real time using body pose AI.",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-400/30",
    badge: "bg-blue-400/20 text-blue-300",
    tip: "Step back 1.5m · Both shoulders visible",
    link: "/shop?category=6900bc9676e7515e04cae0b1",
  },
  {
    id: "jewellery",
    emoji: "💍",
    title: "Jewellery Try-On",
    desc: "Virtually wear necklaces & pendants at your neck in live AR.",
    color: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-400/30",
    badge: "bg-purple-400/20 text-purple-300",
    tip: "Shoulders & neck visible · Face forward",
    link: "/shop?category=69bef420f3e398363d98ffdd",
  },
  {
    id: "earring",
    emoji: "💎",
    title: "Earring Try-On",
    desc: "Preview earrings hanging from your ears using ear landmark tracking.",
    color: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-400/30",
    badge: "bg-rose-400/20 text-rose-300",
    tip: "Face forward · Both ears visible",
    link: "/shop",
  },
  {
    id: "watch",
    emoji: "⌚",
    title: "Watch Try-On",
    desc: "Try on watches on your wrist with wrist landmark rotation alignment.",
    color: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-400/30",
    badge: "bg-amber-400/20 text-amber-300",
    tip: "Raise wrist toward camera · Elbow in frame",
    link: "/shop",
  },
  {
    id: "furniture",
    emoji: "🪑",
    title: "Furniture Try-On",
    desc: "Visualise furniture on your floor — no body needed, just point at the floor.",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-400/30",
    badge: "bg-emerald-400/20 text-emerald-300",
    tip: "Point camera at the floor · Step back 2m+",
    link: "/shop",
  },
];

const VirtualTryOnHub = () => (
  <div className="min-h-screen bg-[#080c18] text-white">
    {/* Hero */}
    <div className="relative overflow-hidden pt-20 pb-16 text-center px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-yellow-400/10 blur-[120px] rounded-full" />
      </div>
      <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 text-yellow-300 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
        ✨ AI-Powered · Real-Time AR
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
        Virtual Try-On Studio
      </h1>
      <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
        See products on you before you buy — powered by MediaPipe AI body tracking. 
        No downloads. Just your camera.
      </p>
    </div>

    {/* Cards grid */}
    <div className="max-w-5xl mx-auto px-5 pb-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {TRY_ON_MODES.map((m) => (
        <Link
          key={m.id}
          to={m.link}
          className={`group relative rounded-3xl bg-gradient-to-br ${m.color} border ${m.border} p-6 hover:scale-[1.025] transition-all duration-300 hover:shadow-xl hover:shadow-black/30 cursor-pointer`}
        >
          <div className="text-5xl mb-4">{m.emoji}</div>
          <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-3 ${m.badge}`}>
            AR Try-On
          </span>
          <h3 className="text-lg font-extrabold text-white mb-2">{m.title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">{m.desc}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>💡</span>
            <span>{m.tip}</span>
          </div>
          {/* Arrow */}
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white/70 group-hover:border-white/30 transition-all">
            →
          </div>
        </Link>
      ))}
    </div>

    {/* How it works */}
    <div className="border-t border-white/5 py-16 px-5">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-black text-white mb-10">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n:"1", title:"Open a product", desc:"Find an item that has a Try-On button.", icon:"🔍" },
            { n:"2", title:"Tap Try-On", desc:"The AI model loads automatically from CDN.", icon:"🤖" },
            { n:"3", title:"See it on you", desc:"Real-time AR overlay on your body — live!", icon:"📸" },
          ].map(s => (
            <div key={s.n} className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-2xl">
                {s.icon}
              </div>
              <p className="text-xs text-yellow-400 font-black uppercase tracking-widest">Step {s.n}</p>
              <p className="text-base font-bold text-white">{s.title}</p>
              <p className="text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default VirtualTryOnHub;
