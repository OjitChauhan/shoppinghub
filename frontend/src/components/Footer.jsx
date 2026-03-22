import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter, FaCode } from "react-icons/fa";

const teamMembers = [
    {
        name: "Ojit",
        role: "Lead Architect",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ojit",
        color: "#D4AF37",
        bio: "Crafting digital experiences with precision and passion.",
    },
    {
        name: "Kuldeep",
        role: "Full Stack Wizard",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kuldeep",
        color: "#3CBEAC",
        bio: "Turning coffee into scalable, performant codebases.",
        social: {
            github: "https://github.com/kuldeep",
            linkedin: "https://linkedin.com/in/kuldeep",
            twitter: "https://twitter.com/kuldeep"
        }
    },
    {
        name: "Rachit",
        role: "UI/UX Master",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachit",
        color: "#EFAF76",
        bio: "Designing interfaces that feel like second nature.",
    },
    {
        name: "Rangoli",
        role: "Frontend Artist",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rangoli",
        color: "#rose-500",
        bio: "Bringing static designs to life with fluid motion.",
    },
];

const Footer = () => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <footer className="relative w-full bg-primary-dark dark:bg-[#080d1a] pt-20 pb-10 overflow-hidden border-t border-zinc-800/50">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                {/* Interaction Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase"
                    >
                        The Minds <span className="text-secondary">Behind The Vision</span>
                    </motion.h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                        {isRevealed ? "Meet the team" : "Click the core to reveal"}
                    </p>
                </div>

                {/* Mystery Box / Reveal Trigger */}
                <div className="relative z-10 mb-20">
                    <AnimatePresence mode="wait">
                        {!isRevealed ? (
                            <motion.div
                                key="box"
                                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                onClick={() => setIsRevealed(true)}
                                className="cursor-pointer group relative"
                            >
                                {/* The "Box" - A premium geometric monolith */}
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-900 border-2 border-secondary/50 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] group-hover:shadow-[0_0_80px_rgba(212,175,55,0.3)] transition-all duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <FaCode className="text-4xl text-secondary group-hover:scale-125 transition-transform duration-500" />

                                    {/* Rotating Rings */}
                                    <div className="absolute inset-0 border border-secondary/20 rounded-full scale-150 animate-[spin_10s_linear_infinite]"></div>
                                    <div className="absolute inset-0 border border-secondary/10 rounded-full scale-125 animate-[spin_15s_linear_reverse_infinite]"></div>
                                </div>

                                {/* Floating Labels */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="absolute -top-8 -right-8 bg-secondary text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl"
                                >
                                    Classified
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="team"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                            >
                                {teamMembers.map((member, index) => (
                                    <motion.div
                                        key={member.name}
                                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                                        whileHover={{ y: -10 }}
                                        className="group relative bg-[#0c1222] border border-zinc-800 p-6 rounded-[2rem] hover:border-secondary/50 transition-all duration-500"
                                    >
                                        <div className="w-20 h-20 rounded-2xl bg-zinc-900 mb-4 overflow-hidden shadow-xl">
                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>

                                        <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{member.name}</h3>
                                        <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-4">{member.role}</p>
                                        <p className="text-zinc-500 text-xs leading-relaxed mb-6 italic">{member.bio}</p>

                                        <div className="flex gap-3">
                                            {[FaGithub, FaLinkedin, FaTwitter].map((Icon, i) => (
                                                <a key={i} href="#" className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-secondary hover:border-secondary transition-all">
                                                    <Icon size={14} />
                                                </a>
                                            ))}
                                        </div>

                                        <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-100 transition-opacity">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }}></div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Traditional Footer Bottom */}
                <div className="w-full pt-12 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start">
                        <h1 className="text-2xl font-black text-white tracking-tighter">
                            SHOPX <span className="text-secondary">STORE</span>
                        </h1>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">
                            © 2026 Premium E-commerce Experience
                        </p>
                    </div>

                    <div className="flex gap-8">
                        {["Privacy", "Terms", "Support", "Careers"].map((link) => (
                            <a key={link} href="#" className="text-zinc-500 hover:text-secondary text-[10px] font-black uppercase tracking-widest transition-colors">
                                {link}
                            </a>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsRevealed(!isRevealed)}
                        className="px-6 py-2 rounded-xl border border-zinc-700 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                    >
                        {isRevealed ? "Hide Team" : "Secret Room"}
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
