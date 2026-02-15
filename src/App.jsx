import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowRight,
    Download,
    ExternalLink,
    Gamepad2,
    Sparkles,
    Zap,
    Target,
    SlidersHorizontal,
    Github,
    Linkedin,
    Mail,
    Info,
} from "lucide-react";

/**
 * Portfolio that *shows* 3Cs / Game Feel via interaction.
 * Single file. Tailwind assumed.
 * Keep as JSX (no TS annotations).
 */

const DEMOREELS = [
    {
        year: 2027,
        title: "Demoreel",
        desc: "5th year of ArtFX (TBD)",
        url: "https://youtu.be/ioKRSxNLGn8",
    },
    {
        year: 2026,
        title: "Demoreel",
        desc: "4th year of ArtFX (TBD)",
        url: "https://youtu.be/ioKRSxNLGn8",
    },
    {
        year: 2025,
        title: "Demoreel",
        desc: "3rd year of ArtFX",
        url: "https://youtu.be/ioKRSxNLGn8",
    },
    {
        year: 2024,
        title: "Demoreel",
        desc: "2nd year of ArtFX",
        url: "https://youtu.be/t4LhAbz9GL8",
    },
];


// NOTE: Put images in /public/projects/... (Vite/Next) and keep paths starting with "/".
// For each project, add multiple screenshots as `images: [{src, alt}]`.
const PROJECTS = [
    {
        title: "Decoratour",
        role: "Game Designer",
        images: [
            { src: "/projects/decoratour/01.jpg", alt: "Decoratour — furniture placement" },
            { src: "/projects/decoratour/02.jpg", alt: "Decoratour — scoring / UI" },
            { src: "/projects/decoratour/03.jpg", alt: "Decoratour — in-game scene" },
            { src: "/projects/decoratour/04.gif", alt: "Decoratour — in-game scene" },
            { src: "/projects/decoratour/05.jpg", alt: "Decoratour — in-game scene" },
        ],
        bullets: ["Camera movement", "Responsive snappy feel"],
        links: [{ label: "Itch.io", url: "https://artfx-school.itch.io/decoratour" }],
        tags: ["Unreal Engine 5.6"],
    },
    {
        title: "Whispering Waters",
        role: "Game Designer",
        images: [
            { src: "/projects/whispering-waters/01.png", alt: "Whispering Waters — shoulder camera" },
            { src: "/projects/whispering-waters/02.gif", alt: "Whispering Waters — corridor readability" },
            { src: "/projects/whispering-waters/03.gif", alt: "Whispering Waters — mood / lighting" },
            { src: "/projects/whispering-waters/04.png", alt: "Whispering Waters — mood / lighting" },
            { src: "/projects/whispering-waters/05.png", alt: "Whispering Waters — mood / lighting" },
        ],
        bullets: [
            "Camera sway + collision-safe shoulder camera",
            "Level feel: custom collisions, clear path",
            "Niagara VFX",
        ],
        tags: ["Unreal Engine 5.6"],
    },
    {
        title: "Fork it up!",
        role: "Level Designer",
        images: [
            { src: "/projects/fork-it-up/01.png", alt: "Fork it up — forklift in workshop" },
            { src: "/projects/fork-it-up/02.gif", alt: "Fork it up — physics interaction" },
            { src: "/projects/fork-it-up/03.png", alt: "Fork it up — level layout" },
            { src: "/projects/fork-it-up/04.gif", alt: "Fork it up — level layout" },
            { src: "/projects/fork-it-up/05.png", alt: "Fork it up — level layout" },
        ],
        bullets: ["Blockout"],
        links: [{ label: "Itchio", url: "https://artfx-school.itch.io/fork-it-up" }],
        tags: ["Unreal Engine 5.6"],
    },
    {
        title: "Time Heist",
        role: "Lead Game Designer",
        images: [
            { src: "/projects/time-heist/01.png", alt: "Time Heist — time-stop moment" },
            { src: "/projects/time-heist/02.png", alt: "Time Heist — platforming sequence" },
            { src: "/projects/time-heist/03.gif", alt: "Time Heist — UI / readability" },
            { src: "/projects/time-heist/04.png", alt: "Time Heist — UI / readability" },
            { src: "/projects/time-heist/05.png", alt: "Time Heist — UI / readability" },
        ],
        bullets: ["Concept", "Documentation", "Communication"],
        tags: ["Unity"],
    },
];

const CONTACTS = {
    email: "ismailyomid@gmail.com",
    linkedin: "https://www.linkedin.com/in/marandi-omid/",
    github: "https://github.com/grosspengu1n",
    itch: "https://grosspenguin.itch.io/",
};

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

const SCROLL_OFFSET = 84; // fallback if we can't measure the top nav

function getScrollOffset() {
    try {
        const nav = document.querySelector("[data-topnav]");
        if (nav) return Math.round(nav.getBoundingClientRect().height + 16);
    } catch (err) {
        // ignore
    }
    return SCROLL_OFFSET;
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function smootherstep(t) {
    t = clamp(t, 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function easeSpring(t, freq = 12, damping = 0.82) {
    const z = clamp(damping, 0.05, 0.999);
    const w = Math.max(0.1, freq) * Math.PI * 2;
    const wd = w * Math.sqrt(1 - z * z);
    const B = (z * w) / wd;

    const spring = (x) => {
        const e = Math.exp(-z * w * x);
        return 1 - e * (Math.cos(wd * x) + B * Math.sin(wd * x));
    };

    const y = spring(t);
    const y1 = spring(1);
    return y1 !== 0 ? y / y1 : y;
}

let __scrollRaf = 0;
let __scrolling = false;

function cancelSmoothScroll() {
    if (__scrollRaf) cancelAnimationFrame(__scrollRaf);
    __scrollRaf = 0;
    __scrolling = false;
}

function getRootScroller() {
    if (typeof document === "undefined") return null;
    return document.scrollingElement || document.documentElement;
}

function smoothScrollTo(targetY, durationMs) {
    const scroller = getRootScroller();
    if (!scroller) return;

    cancelSmoothScroll();

    const startY = scroller.scrollTop || 0;
    const delta = targetY - startY;
    const dist = Math.abs(delta);
    if (dist < 1) return;

    const dur = Math.max(1, durationMs);
    const useSpring = dist >= 220;

    const freq = clamp(8.6 + dist / 1700, 8.6, 12.6);
    const damping = 0.84;

    const start = performance.now();
    __scrolling = true;

    const setY = (y) => {
        scroller.scrollTop = Math.max(0, y);
    };

    const tick = (now) => {
        const t = clamp((now - start) / dur, 0, 1);
        const u = smootherstep(t);
        const eased = useSpring ? easeSpring(u, freq, damping) : easeOutCubic(u);
        setY(startY + delta * eased);

        if (t < 1 && __scrolling) __scrollRaf = requestAnimationFrame(tick);
        else cancelSmoothScroll();
    };

    __scrollRaf = requestAnimationFrame(tick);
}

function handleInternalAnchorClick(e, href) {
    if (!href || typeof href !== "string") return;

    const hash = href.startsWith("#") ? href : `#${href}`;
    const id = hash.slice(1);
    if (!id) return;

    if (e) {
        if (typeof e.preventDefault === "function") e.preventDefault();
        if (typeof e.stopPropagation === "function") e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
    }

    const scroller = getRootScroller();
    if (!scroller) return;

    if (id === "top") {
        const dist = Math.abs((scroller.scrollTop || 0) - 0);
        const dur = clamp(650 + dist * 0.55, 650, 1600);
        smoothScrollTo(0, dur);
        return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const currentY = scroller.scrollTop || 0;
    const targetY = Math.max(0, currentY + rect.top - getScrollOffset());

    const dist = Math.abs(currentY - targetY);
    const dur = clamp(650 + dist * 0.55, 650, 1600);
    smoothScrollTo(targetY, dur);
}

function installAnchorSmoothScroll() {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (window.__MO_ANCHOR_SCROLL_INSTALLED__) return;
    window.__MO_ANCHOR_SCROLL_INSTALLED__ = true;

    const onDocClick = (e) => {
        if (!e || e.defaultPrevented) return;
        if (typeof e.button === "number" && e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const t = e.target;
        if (!t || !t.closest) return;
        const a = t.closest("a");
        if (!a) return;

        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return;

        const target = (a.getAttribute("target") || "").toLowerCase();
        if (target === "_blank") return;

        handleInternalAnchorClick(e, href);
    };

    const cancelOnUser = (e) => {
        if (!__scrolling) return;
        if (e && e.type === "keydown") {
            const k = e.key;
            const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
            if (!scrollKeys.includes(k)) return;
        }
        cancelSmoothScroll();
    };

    document.addEventListener("click", onDocClick, true);
    window.addEventListener("wheel", cancelOnUser, { passive: true });
    window.addEventListener("touchstart", cancelOnUser, { passive: true });
    window.addEventListener("keydown", cancelOnUser);
}

installAnchorSmoothScroll();

function Pill({ children }) {
    return (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            {children}
        </span>
    );
}

function Tag({ children }) {
    return <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-white/70">{children}</span>;
}

function Section({ id, title, icon, subtitle, children }) {
    return (
        <section id={id} className="mx-auto max-w-6xl scroll-mt-24 snap-start [scroll-snap-stop:always] px-4 py-16">
            <div className="mb-7">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
                    {icon}
                    <span>{title}</span>
                </div>
                {subtitle ? <p className="mt-2 max-w-2xl text-sm text-white/70">{subtitle}</p> : null}
            </div>
            {children}
        </section>
    );
}

function NavLink({ href, children, active = false }) {
    const isInternal = typeof href === "string" && href.startsWith("#");

    const handle = (e) => {
        if (isInternal) handleInternalAnchorClick(e, href);
    };

    const className = cn(
        "rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/75 backdrop-blur transition",
        "hover:bg-black/65 hover:text-white",
        active ? "mo-nav-active" : ""
    );

    if (isInternal) {
        return (
            <button type="button" onClick={handle} className={className}>
                {children}
            </button>
        );
    }

    return (
        <a href={href} className={className}>
            {children}
        </a>
    );
}

function TopNav({ active = "top", progress = 0 }) {
    return (
        <div className="fixed left-0 right-0 top-0 z-50" data-topnav>
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-transparent">
                <div className="mo-progress" style={{ width: `${Math.round(progress * 1000) / 10}%` }} />
            </div>

            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                {/* Left pill/backplate */}
                <div className="rounded-3xl border border-white/10 bg-black/55 p-1.5 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
                    <button
                        data-magnetic="btn"
                        type="button"
                        onClick={(e) => handleInternalAnchorClick(e, "#top")}
                        className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-xs font-semibold text-white/85 transition will-change-transform hover:-translate-y-0.5 hover:border-white/22 hover:bg-black/35 hover:shadow-[0_0_24px_rgba(168,85,247,0.18)]"
                    >
                        <div className="h-2 w-2 rounded-full bg-white/70" />
                        <span>Marandi Omid</span>
                    </button>
                </div>

                {/* Right pill/backplate */}
                <div className="hidden items-center gap-2 rounded-3xl border border-white/10 bg-black/55 p-1.5 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] md:flex">
                    <NavLink href="#reels" active={active === "reels"}>
                        Demo reels
                    </NavLink>
                    <NavLink href="#playground" active={active === "playground"}>
                        What I actually do
                    </NavLink>
                    <NavLink href="#projects" active={active === "projects"}>
                        Projects
                    </NavLink>
                    <NavLink href="#about" active={active === "about"}>
                        About me
                    </NavLink>
                </div>
            </div>
        </div>
    );
}

function PrimaryButton({ href, children, newTab = false }) {
    const isInternal = !newTab && typeof href === "string" && href.startsWith("#");

    const className = cn(
        "group inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-white",
        "border-white/20 bg-white/12",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset]",
        "transition will-change-transform",
        "hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/16",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset,0_0_28px_rgba(168,85,247,0.22)]"
    );

    if (isInternal) {
        return (
            <button type="button" data-magnetic="btn" onClick={(e) => handleInternalAnchorClick(e, href)} className={className}>
                {children}
                <ArrowRight className="h-4 w-4 opacity-80 transition group-hover:translate-x-0.5" />
            </button>
        );
    }

    return (
        <a href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noreferrer" : undefined} className={className} data-magnetic="btn">
            {children}
            <ArrowRight className="h-4 w-4 opacity-80 transition group-hover:translate-x-0.5" />
        </a>
    );
}

function SecondaryButton({ href, children, newTab = false }) {
    const isInternal = !newTab && typeof href === "string" && href.startsWith("#");

    const className = cn(
        "group inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium",
        "border-white/12 bg-black/55 text-white/88",
        "backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]",
        "transition will-change-transform",
        "hover:-translate-y-0.5 hover:border-white/22 hover:bg-black/70 hover:text-white",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset,0_0_26px_rgba(59,130,246,0.18)]"
    );

    if (isInternal) {
        return (
            <button type="button" data-magnetic="btn" onClick={(e) => handleInternalAnchorClick(e, href)} className={className}>
                {children}
            </button>
        );
    }

    return (
        <a href={href} data-magnetic="btn" target={newTab ? "_blank" : undefined} rel={newTab ? "noreferrer" : undefined} className={className}>
            {children}
        </a>
    );
}


function GlowCard({ className = "", children, href, newTab = false }) {
    const inner = (
        <div
            data-magnetic="card"
            className={cn(
                "mo-reveal relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] transition",
                "hover:border-white/20 hover:bg-white/7",
                className
            )}
        >
            {children}
        </div>
    );

    if (href) {
        return (
            <a href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noreferrer" : undefined}>
                {inner}
            </a>
        );
    }

    return inner;
}

function toYouTubeEmbed(url) {
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) {
            const id = u.pathname.split("/").filter(Boolean)[0];
            return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
        }
        if (u.hostname.includes("youtube.com")) {
            const id = u.searchParams.get("v");
            return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
        }
        return null;
    } catch (err) {
        return null;
    }
}

function toVimeoEmbed(url) {
    try {
        const u = new URL(url);
        if (!u.hostname.includes("vimeo.com")) return null;
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id ? `https://player.vimeo.com/video/${id}` : null;
    } catch (err) {
        return null;
    }
}

function getEmbedSrc(url) {
    return toYouTubeEmbed(url) || toVimeoEmbed(url);
}

function ReelCard({ r }) {
    const embed = getEmbedSrc(r.url);

    return (
        <GlowCard className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="text-base font-semibold text-white">{r.title}</div>
                        <span className="rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[11px] text-white/70">{r.year}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/70">{r.desc}</p>
                </div>

                <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-semibold text-white/85 transition hover:bg-black/65"
                >
                    Open
                    <ExternalLink className="h-4 w-4 text-white/70" />
                </a>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                {embed ? (
                    <div className="aspect-video">
                        <iframe
                            className="h-full w-full"
                            src={embed}
                            title={r.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="flex aspect-video items-center justify-center px-5 text-center text-sm text-white/65">
                        <div>
                            <div className="font-semibold text-white/80">Embed not detected</div>
                            <div className="mt-1">Use a YouTube or Vimeo link to auto-embed.</div>
                        </div>
                    </div>
                )}
            </div>
        </GlowCard>
    );
}

function ScrollArrow({ dir, disabled, onClick }) {
    return (
        <button
            data-magnetic="btn"
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
            className={cn(
                "z-10 inline-flex items-center justify-center rounded-3xl border px-5 py-5 backdrop-blur",
                "border-white/14 bg-black/65",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]",
                "transition-transform transition-shadow",
                "hover:scale-[1.04] hover:border-white/26 hover:bg-black/75 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_0_28px_rgba(168,85,247,0.18)]",
                "active:scale-[1.00]",
                "disabled:opacity-35 disabled:hover:scale-100 disabled:hover:shadow-none"
            )}
        >
            <ArrowRight className={cn("h-7 w-7 text-white/90", dir === "left" ? "rotate-180" : "")} />
        </button>
    );
}

// ✅ Add this helper somewhere above ProjectCard (near other utils)
function prefersReducedMotion() {
    return (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
}

// ✅ Replace your entire ProjectCard with this
function ProjectCard({ p }) {
    const list = Array.isArray(p.images)
        ? p.images
        : p.image
            ? [{ src: p.image, alt: p.imageAlt || `${p.title} preview` }]
            : [];

    const [idx, setIdx] = useState(0);
    const [okMap, setOkMap] = useState(() => new Array(list.length).fill(true));

    // Fade transition state
    const FADE_MS = 220;
    const [displayIdx, setDisplayIdx] = useState(0); // what is currently shown
    const [phase, setPhase] = useState("in"); // "out" | "in"

    const thumbsRef = useRef(null);
    const thumbBtnRefs = useRef([]); // array of button elements

    useEffect(() => {
        // reset when project changes
        setIdx(0);
        setOkMap(new Array(list.length).fill(true));
        setDisplayIdx(0);
        setPhase("in");

        thumbBtnRefs.current = [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p.title]);

    const safeLen = Math.max(0, list.length);
    const clampedIdx = safeLen ? clamp(idx, 0, safeLen - 1) : 0;

    // Smooth fade when target index changes
    useEffect(() => {
        if (!safeLen) return;
        if (clampedIdx === displayIdx) return;

        setPhase("out");
        const t = setTimeout(() => {
            setDisplayIdx(clampedIdx);
            requestAnimationFrame(() => setPhase("in"));
        }, FADE_MS);

        return () => clearTimeout(t);
    }, [clampedIdx, displayIdx, safeLen]);

    const go = (d) => {
        if (!safeLen) return;
        setIdx((v) => {
            const n = v + d;
            if (n < 0) return safeLen - 1;
            if (n >= safeLen) return 0;
            return n;
        });
    };

    const setOkAt = (i, val) => {
        setOkMap((m) => {
            const next = m.slice();
            next[i] = val;
            return next;
        });
    };

    const active = safeLen ? list[displayIdx] : null;
    const activeOk = safeLen ? okMap[displayIdx] !== false : false;

    const onKey = (e) => {
        if (!safeLen) return;
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
        }
        if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
        }
    };

    useEffect(() => {
        if (!safeLen) return;

        const wrap = thumbsRef.current;
        const btn = thumbBtnRefs.current[clampedIdx];
        if (!wrap || !btn) return;

        const wr = wrap.getBoundingClientRect();
        const br = btn.getBoundingClientRect();

        // button left inside wrapper's scroll space
        const btnLeftInWrap = br.left - wr.left + wrap.scrollLeft;
        // center the active thumbnail
        const targetLeft = btnLeftInWrap - (wr.width / 2 - br.width / 2);

        wrap.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
    }, [clampedIdx, safeLen]);

    return (
        <GlowCard className="p-6">
            <div className="grid gap-6 lg:grid-cols-[520px_1fr] lg:items-start">
                {/* Media (carousel) */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                    <div
                        className="relative outline-none"
                        style={{ aspectRatio: "16 / 9" }}
                        tabIndex={0}
                        role="group"
                        aria-label={`${p.title} screenshots`}
                        onKeyDown={onKey}
                    >
                        {/* image wrapper with fade */}
                        <div
                            className={cn(
                                "absolute inset-0 transition-opacity duration-300 ease-out",
                                phase === "out" ? "opacity-0" : "opacity-100"
                            )}
                        >
                            {active && activeOk ? (
                                <img
                                    src={active.src}
                                    alt={active.alt || `${p.title} screenshot ${displayIdx + 1}`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    onError={() => setOkAt(displayIdx, false)}
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/5 to-black/50" />
                            )}
                        </div>

                        {/* overlay */}
                        <div className="pointer-events-none absolute inset-0 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]" />

                        {/* arrows (main image only) */}
                        {safeLen > 1 ? (
                            <>
                                <button
                                    type="button"
                                    aria-label="Previous screenshot"
                                    onClick={() => go(-1)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl border border-white/14 bg-black/65 px-4 py-3 text-xs text-white/90 backdrop-blur transition hover:bg-black/80 hover:border-white/24"
                                >
                                    <ArrowRight className="h-5 w-5 rotate-180" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Next screenshot"
                                    onClick={() => go(1)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl border border-white/14 bg-black/65 px-4 py-3 text-xs text-white/90 backdrop-blur transition hover:bg-black/80 hover:border-white/24"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </button>

                                <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">
                                    {displayIdx + 1}/{safeLen}
                                </div>
                            </>
                        ) : null}
                    </div>

                    {/* thumbnails (scroll only, synced with main image) */}
                    {safeLen > 1 ? (
                        <div
                            ref={thumbsRef}
                            className="flex gap-2 overflow-x-auto border-t border-white/10 bg-black/40 p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {list.map((it, i) => {
                                const ok = okMap[i] !== false;
                                const isActive = i === clampedIdx; // highlight the target (what user selected)
                                return (
                                    <button
                                        ref={(el) => {
                                            if (el) thumbBtnRefs.current[i] = el;
                                        }}
                                        key={`${it.src}-${i}`}
                                        type="button"
                                        onClick={() => setIdx(i)}
                                        className={cn(
                                            "relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl border transition",
                                            isActive ? "border-white/30" : "border-white/10 hover:border-white/22"
                                        )}
                                        aria-label={`Go to screenshot ${i + 1}`}
                                    >
                                        {ok ? (
                                            <img
                                                src={it.src}
                                                alt=""
                                                className="h-full w-full object-cover opacity-90"
                                                loading="lazy"
                                                onError={() => setOkAt(i, false)}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-black/50" />
                                        )}
                                        {isActive ? (
                                            <div className="absolute inset-0 shadow-[0_0_0_2px_rgba(168,85,247,0.45)_inset]" />
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                {/* Content */}
                <div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="text-lg font-semibold text-white">{p.title}</div>
                            <div className="mt-1 text-sm text-white/70">{p.role}</div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {p.tags.map((t) => (
                                    <Pill key={t}>{t}</Pill>
                                ))}
                            </div>
                        </div>
                        {(() => {
                            const links = Array.isArray(p.links) ? p.links : [];
                            if (!links.length) return null;
                            return (
                                <div className="flex flex-wrap gap-2">
                                    {links.map((l) => (
                                        <a
                                            key={l.label}
                                            href={l.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-semibold text-white/85 transition hover:bg-black/65"
                                        >
                                            {l.label}
                                            <ExternalLink className="h-4 w-4 text-white/70" />
                                        </a>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    <ul className="mt-5 space-y-2 text-sm text-white/80">
                        {p.bullets.map((b) => (
                            <li key={b} className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/55" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </GlowCard>
    );
}


function useKeyState() {
    const keys = useRef({});

    useEffect(() => {
        const down = (e) => {
            keys.current[e.code] = true;
        };
        const up = (e) => {
            keys.current[e.code] = false;
        };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    return keys;
}

function Tooltip({ text }) {
    return (
        <span className="group relative inline-flex">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition group-hover:bg-white/10">
                <Info className="h-3.5 w-3.5" />
            </span>
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/80 px-3 py-2 text-xs text-white/80 opacity-0 shadow-xl backdrop-blur transition group-hover:opacity-100">
                {text}
            </span>
        </span>
    );
}

function Toggle({ label, checked, onChange, help }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "flex items-center justify-between gap-4 rounded-3xl border px-6 py-4 text-sm",
                "transition will-change-transform hover:-translate-y-0.5",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]",
                checked
                    ? "border-white/30 bg-white/14 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset,0_0_44px_rgba(168,85,247,0.24)]"
                    : "border-white/18 bg-black/45 text-white/90 hover:bg-black/65 hover:border-white/28 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset,0_0_28px_rgba(59,130,246,0.14)]"
            )}
        >
            <span className="flex items-center gap-2 font-medium">
                {label}
                {help ? <Tooltip text={help} /> : null}
            </span>
            <span
                className={cn(
                    "relative h-8 w-16 rounded-full border transition",
                    checked ? "border-white/28 bg-gradient-to-r from-violet-500/35 to-sky-500/25" : "border-white/12 bg-white/5"
                )}
            >
                <span
                    className={cn(
                        "absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white transition",
                        checked ? "left-9 shadow-[0_0_22px_rgba(168,85,247,0.38)]" : "left-1"
                    )}
                />
            </span>
        </button>
    );
}

function AboutCard({ title, desc, using = [] }) {
    return (
        <GlowCard className="p-6">
            <div className="text-lg font-semibold text-white">{title}</div>
            <p className="mt-2 text-sm text-white/70">{desc}</p>

            {using && using.length ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/55">Using</div>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                        {using.map((u) => (
                            <li key={u} className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                                <span>{u}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </GlowCard>
    );
}

function ContactPill({ icon, label, href, title }) {
    const isHttp = href.startsWith("http");
    return (
        <a
            href={href}
            title={title || (typeof label === "string" ? label : undefined)}
            target={isHttp ? "_blank" : undefined}
            rel={isHttp ? "noreferrer" : undefined}
            data-magnetic="btn"
            className={cn(
                "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold backdrop-blur transition",
                "border-white/18 bg-white/10 text-white/90",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset]",
                "hover:bg-white/14 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset,0_0_24px_rgba(168,85,247,0.18)]"
            )}
        >
            <span className="text-white/80">{icon}</span>
            {label ? <span className="hidden md:inline">{label}</span> : null}
        </a>
    );
}


function GlobalStyles() {
    return (
        <style>{`
      /* ===== motion + polish ===== */
      html {
        scroll-snap-type: y mandatory;
        scroll-snap-stop: always;
        scroll-padding-top: 96px;
      }

      @media (prefers-reduced-motion: reduce) {
        html { scroll-snap-type: none; }
        .mo-reveal { opacity: 1 !important; transform: none !important; filter: none !important; transition: none !important; }
      }

      .mo-spotlight {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 1;
        background:
          radial-gradient(540px 420px at var(--spot-x, 50%) var(--spot-y, 30%), rgba(168, 85, 247, 0.10), transparent 64%),
          radial-gradient(680px 520px at calc(var(--spot-x, 50%) + 120px) calc(var(--spot-y, 30%) + 60px), rgba(56, 189, 248, 0.07), transparent 64%);
        mix-blend-mode: screen;
        opacity: 0.75;
      }

      .mo-progress {
        height: 2px;
        background: linear-gradient(90deg, rgba(168,85,247,0.95), rgba(56,189,248,0.85), rgba(236,72,153,0.8));
        box-shadow: 0 0 18px rgba(168,85,247,0.25);
        transform-origin: 0 0;
      }

      .mo-reveal {
        opacity: 0;
        transform: translate3d(0, 10px, 0);
        filter: blur(8px);
        transition: opacity 520ms ease, transform 520ms ease, filter 520ms ease;
        will-change: opacity, transform, filter;
      }
      .mo-reveal.mo-in {
        opacity: 1;
        transform: translate3d(0, 0, 0);
        filter: blur(0);
      }

      .mo-nav-active {
        border-color: rgba(255,255,255,0.22) !important;
        color: rgba(255,255,255,0.96) !important;
        background: rgba(255,255,255,0.10) !important;
        box-shadow: 0 0 22px rgba(168,85,247,0.18);
      }

      @keyframes moAurora {
        0% { background-position: 0% 30%; filter: hue-rotate(0deg) saturate(1.1); }
        50% { background-position: 100% 70%; filter: hue-rotate(14deg) saturate(1.25); }
        100% { background-position: 0% 30%; filter: hue-rotate(0deg) saturate(1.1); }
      }
      @keyframes moGrain {
        0% { transform: translate3d(0,0,0); }
        20% { transform: translate3d(-2%, 1%, 0); }
        40% { transform: translate3d(1%, -2%, 0); }
        60% { transform: translate3d(-1%, -1%, 0); }
        80% { transform: translate3d(2%, 1%, 0); }
        100% { transform: translate3d(0,0,0); }
      }
      @keyframes moPulse {
        0%, 100% { opacity: .35; }
        50% { opacity: .55; }
      }
      .mo-aurora {
        background:
          radial-gradient(1200px 700px at 12% 18%, rgba(168,85,247,0.32), transparent 60%),
          radial-gradient(900px 620px at 86% 22%, rgba(56,189,248,0.22), transparent 55%),
          radial-gradient(880px 660px at 42% 96%, rgba(236,72,153,0.18), transparent 58%),
          linear-gradient(120deg, rgba(168,85,247,0.16), rgba(56,189,248,0.10), rgba(236,72,153,0.10), rgba(168,85,247,0.16));
        background-size: 180% 180%;
        animation: moAurora 16s ease-in-out infinite;
        mix-blend-mode: normal;
      }
      .mo-grain {
        background-image:
          radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
          radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
        background-position: 0 0, 9px 11px;
        background-size: 22px 22px;
        opacity: 0.06;
        animation: moGrain 10s steps(10) infinite;
        mix-blend-mode: overlay;
      }
      .mo-scanlines {
        background: repeating-linear-gradient(
          to bottom,
          rgba(255,255,255,0.04),
          rgba(255,255,255,0.04) 1px,
          transparent 1px,
          transparent 6px
        );
        opacity: 0.06;
        mix-blend-mode: overlay;
      }
      .mo-neon-edge {
        background:
          radial-gradient(600px 220px at 50% 0%, rgba(168,85,247,0.22), transparent 70%),
          radial-gradient(700px 260px at 50% 100%, rgba(56,189,248,0.16), transparent 70%);
        animation: moPulse 6.5s ease-in-out infinite;
        mix-blend-mode: screen;
      }
    `}</style>
    );
}

function BackgroundFX({ p }) {
    const a = clamp(p, 0, 1);
    const driftX = (a - 0.5) * 70;
    const driftY = (0.5 - a) * 55;

    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden isolate" style={{ "--p": a }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/75 to-black" />

            {/* Neon aurora layer (animated) */}
            <div
                className="absolute -inset-24 opacity-45 blur-3xl mo-aurora"
                style={{
                    transform: `translate3d(${driftX * 0.55}px, ${driftY * 0.55}px, 0) rotate(${(a - 0.5) * 8}deg)`,
                }}
            />

            {/* Edge glow that gently breathes */}
            <div className="absolute inset-0 mo-neon-edge" />

            <div className="absolute -inset-24 opacity-25 blur-2xl" style={{ transform: `translate3d(${driftX}px, ${driftY}px, 0)` }}>
                <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-violet-500/35" />
                <div className="absolute right-[-8%] top-[12%] h-[560px] w-[560px] rounded-full bg-sky-500/25" />
                <div className="absolute left-[18%] bottom-[-18%] h-[620px] w-[620px] rounded-full bg-fuchsia-500/20" />
            </div>

            <div
                className="absolute -inset-32 opacity-[0.12] mix-blend-screen"
                style={{
                    transform: `translate3d(${driftX * -0.55}px, ${driftY * -0.35}px, 0) rotate(${(a - 0.5) * 6}deg)`,
                }}
            >
                <div className="absolute inset-0 [background:conic-gradient(from_180deg_at_50%_50%,rgba(168,85,247,0.35),rgba(59,130,246,0.25),rgba(236,72,153,0.22),rgba(168,85,247,0.35))]" />
            </div>

            <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:18px_18px]" />

            {/* Texture layers (very subtle) */}
            <div className="absolute inset-0 mo-scanlines" />
            <div className="absolute -inset-10 mo-grain" />
        </div>
    );
}

/** Minimal self-tests (runs in dev). */
function runDevTests() {
    try {
        console.assert(clamp(5, 0, 10) === 5, "clamp in range");
        console.assert(clamp(-1, 0, 10) === 0, "clamp low");
        console.assert(clamp(99, 0, 10) === 10, "clamp high");

        console.assert(smootherstep(0) === 0 && smootherstep(1) === 1, "smootherstep endpoints");
        console.assert(smootherstep(-1) === 0 && smootherstep(2) === 1, "smootherstep clamps");

        console.assert(
            toYouTubeEmbed("https://youtu.be/dQw4w9WgXcQ") === "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
            "youtu.be embed"
        );
        console.assert(
            toYouTubeEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ") === "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
            "youtube.com watch embed"
        );

        console.assert(toVimeoEmbed("https://vimeo.com/123456") === "https://player.vimeo.com/video/123456", "vimeo embed");

        console.assert(
            getEmbedSrc("https://youtu.be/dQw4w9WgXcQ") === "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
            "getEmbedSrc youtube"
        );
        console.assert(getEmbedSrc("https://example.com/video") === null, "getEmbedSrc unknown -> null");

        console.assert(Math.abs(easeSpring(1, 12, 0.82) - 1) < 1e-6, "easeSpring ends at 1");

        console.assert(Array.isArray(PROJECTS) && PROJECTS.length > 0, "projects exist");
        console.assert(PROJECTS.every((p) => typeof p.title === "string"), "projects have titles");
        console.assert(PROJECTS.every((p) => Array.isArray(p.images) && p.images.length >= 1), "projects have image arrays");
        console.assert(PROJECTS.some((p) => p.images.length > 5), "at least one project has >5 images (thumb scroll case)");

        handleInternalAnchorClick(null, "not-a-hash");
    } catch (err) {
        // never crash the app because of tests
    }
}

function ThreeCPlayground() {
    const canvasRef = useRef(null);
    const keys = useKeyState();

    const [assist, setAssist] = useState(false);

    useEffect(() => {
        try {
            if (import.meta && import.meta.env && import.meta.env.DEV) runDevTests();
        } catch (err) {
            // ignore
        }
    }, []);

    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const rect = c.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            c.width = Math.floor(rect.width * dpr);
            c.height = Math.floor(rect.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(c);

        const getView = () => {
            const r = c.getBoundingClientRect();
            return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
        };

        const world = {
            g: 1900,
            floorY: 300,
            minX: 0,
            maxX: 3300,
            platforms: [
                { x: 120, y: 260, w: 220, h: 16 },
                { x: 500, y: 232, w: 160, h: 16 },
                { x: 820, y: 206, w: 180, h: 16 },
                { x: 1160, y: 240, w: 220, h: 16 },
                { x: 1540, y: 260, w: 160, h: 16 },
                { x: 1860, y: 220, w: 200, h: 16 },
                { x: 2240, y: 200, w: 170, h: 16 },
                { x: 2580, y: 240, w: 220, h: 16 },
                { x: 2920, y: 260, w: 200, h: 16 },
            ],
            checkpoints: [
                { x: 200, label: "Start" },
                { x: 2980, label: "End" },
            ],
        };

        const s = {
            x: 160,
            y: 0,
            vx: 0,
            vy: 0,
            w: 24,
            h: 34,
            grounded: false,
            coyoteLeft: 0,
            bufferLeft: 0,
        };

        const cam = { x: 0, y: 0, vx: 0, vy: 0 };

        const collideWalls = () => {
            const PAD = 20;
            if (s.x < world.minX + PAD) {
                s.x = world.minX + PAD;
                s.vx = 0;
            }
            if (s.x + s.w > world.maxX - PAD) {
                s.x = world.maxX - PAD - s.w;
                s.vx = 0;
            }
        };

        const collideVertical = (dt) => {
            const EPS = 2;
            s.grounded = false;

            if (s.y + s.h >= world.floorY - EPS) {
                s.y = world.floorY - s.h;
                s.vy = 0;
                s.grounded = true;
                return;
            }

            for (let i = 0; i < world.platforms.length; i++) {
                const p = world.platforms[i];
                const withinX = s.x + s.w > p.x && s.x < p.x + p.w;
                if (!withinX) continue;

                const feetY = s.y + s.h;
                const prevFeet = feetY - s.vy * dt;

                if (s.vy >= -50) {
                    const crossed = prevFeet <= p.y + EPS && feetY >= p.y - EPS;
                    const close = Math.abs(feetY - p.y) <= EPS;
                    const above = s.y < p.y;
                    if (above && (crossed || close)) {
                        s.y = p.y - s.h;
                        s.vy = 0;
                        s.grounded = true;
                        return;
                    }
                }
            }
        };

        let last = performance.now();
        let rafId = 0;
        let prevJump = false;

        const step = () => {
            const now = performance.now();
            const dt = clamp((now - last) / 1000, 0, 0.033);
            last = now;

            const view = getView();
            const viewW = view.w;
            const viewH = view.h;

            const zoom = 0.85;
            const vw = viewW / zoom;
            const vh = viewH / zoom;

            const accel = assist ? 2600 : 2200;
            const decel = assist ? 3200 : 2500;
            const maxSpeed = assist ? 470 : 430;
            const jumpVel = assist ? 690 : 670;
            const coyoteMs = assist ? 120 : 0;
            const bufferMs = assist ? 120 : 0;

            const left = !!(keys.current["ArrowLeft"] || keys.current["KeyA"]);
            const right = !!(keys.current["ArrowRight"] || keys.current["KeyD"]);
            const jumpHeld = !!(keys.current["Space"] || keys.current["ArrowUp"] || keys.current["KeyW"]);
            const jumpPressed = jumpHeld && !prevJump;
            prevJump = jumpHeld;

            if (jumpPressed) s.bufferLeft = bufferMs;

            const dir = (right ? 1 : 0) - (left ? 1 : 0);
            if (dir !== 0) {
                s.vx += dir * accel * dt;
            } else {
                const sign = Math.sign(s.vx);
                const mag = Math.abs(s.vx);
                s.vx = Math.max(0, mag - decel * dt) * sign;
            }
            s.vx = clamp(s.vx, -maxSpeed, maxSpeed);

            s.vy += world.g * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;

            collideWalls();

            const wasGrounded = s.grounded;
            collideVertical(dt);

            if (s.grounded) s.coyoteLeft = coyoteMs;
            else s.coyoteLeft = Math.max(0, s.coyoteLeft - dt * 1000);

            if (s.bufferLeft > 0) s.bufferLeft = Math.max(0, s.bufferLeft - dt * 1000);

            if (wasGrounded && !s.grounded) s.coyoteLeft = coyoteMs;

            const jumpAllowed = () => s.grounded || s.coyoteLeft > 0;
            const wantJump = bufferMs > 0 ? s.bufferLeft > 0 : jumpPressed;
            if (wantJump && jumpAllowed()) {
                s.vy = -jumpVel;
                s.grounded = false;
                s.coyoteLeft = 0;
                s.bufferLeft = 0;
            }

            const playerCx = s.x + s.w / 2;
            const playerCy = s.y + s.h / 2;

            if (!assist) {
                cam.x = playerCx - vw / 2;
                cam.y = playerCy - vh / 2;
                cam.vx = 0;
                cam.vy = 0;
            } else {
                const leftZoneX = cam.x + vw * 0.38;
                const rightZoneX = cam.x + vw * 0.62;
                const topZoneY = cam.y + vh * 0.4;
                const botZoneY = cam.y + vh * 0.6;

                const lookAhead = clamp(s.vx * 0.28, -200, 200);
                let desiredX = cam.x + lookAhead;
                if (playerCx < leftZoneX) desiredX -= leftZoneX - playerCx;
                if (playerCx > rightZoneX) desiredX += playerCx - rightZoneX;

                let desiredY = cam.y;
                if (playerCy < topZoneY) desiredY -= topZoneY - playerCy;
                if (playerCy > botZoneY) desiredY += playerCy - botZoneY;

                const k = 65;
                const d = 16;

                const ax = (desiredX - cam.x) * k - cam.vx * d;
                cam.vx += ax * dt;
                cam.x += cam.vx * dt;

                const ay = (desiredY - cam.y) * k - cam.vy * d;
                cam.vy += ay * dt;
                cam.y += cam.vy * dt;
            }

            ctx.clearRect(0, 0, viewW, viewH);
            ctx.save();
            ctx.scale(zoom, zoom);

            ctx.fillStyle = "rgba(255,255,255,0.02)";
            ctx.fillRect(0, 0, vw, vh);

            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.lineWidth = 1;
            for (let gx = 0; gx <= vw; gx += 40) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, vh);
                ctx.stroke();
            }
            for (let gy = 0; gy <= vh; gy += 40) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(vw, gy);
                ctx.stroke();
            }

            ctx.fillStyle = "rgba(255,255,255,0.05)";
            ctx.fillRect(0, world.floorY - cam.y, vw, vh - (world.floorY - cam.y));
            ctx.strokeStyle = "rgba(255,255,255,0.12)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, world.floorY - cam.y);
            ctx.lineTo(vw, world.floorY - cam.y);
            ctx.stroke();

            for (let i = 0; i < world.platforms.length; i++) {
                const p = world.platforms[i];
                ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)";
                ctx.fillRect(p.x - cam.x, p.y - cam.y, p.w, p.h);
                ctx.strokeStyle = "rgba(255,255,255,0.16)";
                ctx.strokeRect(p.x - cam.x, p.y - cam.y, p.w, p.h);
            }

            ctx.fillStyle = "rgba(255,255,255,0.60)";
            ctx.font = "12px ui-sans-serif, system-ui";
            for (let i = 0; i < world.checkpoints.length; i++) {
                const cp = world.checkpoints[i];
                const x = cp.x - cam.x;
                if (x < -80 || x > vw + 80) continue;
                ctx.fillText(cp.label, x, 22);
            }

            ctx.fillStyle = s.grounded ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.78)";
            ctx.fillRect(s.x - cam.x, s.y - cam.y, s.w, s.h);
            ctx.strokeStyle = "rgba(0,0,0,0.35)";
            ctx.strokeRect(s.x - cam.x, s.y - cam.y, s.w, s.h);

            ctx.restore();

            rafId = requestAnimationFrame(step);
        };

        rafId = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(rafId);
            ro.disconnect();
        };
    }, [assist, keys]);

    return (
        <GlowCard className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="text-sm font-semibold text-white">Feel tuning: raw vs game feel tuned</div>
                    <div className="mt-1 text-xs text-white/65">
                        Controls: <span className="text-white/80">A / D</span> • <span className="text-white/80">W</span> jump
                    </div>
                </div>

                <div className="w-full md:w-auto">
                    <Toggle label="Feel tuning" checked={assist} onChange={setAssist} help="Single switch: camera smoothing/rubber-banding + coyote time + input buffer." />
                </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-3">
                <canvas ref={canvasRef} className="h-[360px] w-full rounded-xl" />
            </div>
        </GlowCard>
    );
}

export default function App() {
    const year = useMemo(() => new Date().getFullYear(), []);
    const reelsSorted = useMemo(() => DEMOREELS.slice().sort((a, b) => b.year - a.year), []);

    const [scrollP, setScrollP] = useState(0);
    useEffect(() => {
        const scroller = getRootScroller();
        if (!scroller) return;

        let raf = 0;
        const update = () => {
            raf = 0;
            const max = Math.max(1, scroller.scrollHeight - window.innerHeight);
            const p = clamp((scroller.scrollTop || 0) / max, 0, 1);
            setScrollP(p);
        };

        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            if (raf) cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    const [activeSection, setActiveSection] = useState("top");

    // Cursor spotlight
    useEffect(() => {
        const root = document.documentElement;
        const onMove = (e) => {
            const x = `${Math.round(e.clientX)}px`;
            const y = `${Math.round(e.clientY)}px`;
            root.style.setProperty("--spot-x", x);
            root.style.setProperty("--spot-y", y);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, []);

    // Active section highlight
    useEffect(() => {
        const ids = ["top", "reels", "playground", "projects", "about"];
        const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
        if (!els.length) return;

        const obs = new IntersectionObserver(
            (entries) => {
                let best = null;
                for (const e of entries) {
                    if (!e.isIntersecting) continue;
                    if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
                }
                if (best && best.target && best.target.id) setActiveSection(best.target.id);
            },
            { threshold: [0.55, 0.65, 0.75] }
        );

        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    // Scroll reveal
    useEffect(() => {
        const els = Array.from(document.querySelectorAll(".mo-reveal"));
        if (!els.length) return;

        const obs = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        e.target.classList.add("mo-in");
                        obs.unobserve(e.target);
                    }
                }
            },
            { threshold: 0.18 }
        );

        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    // Magnetic + subtle tilt
    useEffect(() => {
        const els = Array.from(document.querySelectorAll("[data-magnetic]"));
        if (!els.length) return;

        const cleanups = [];

        for (const el of els) {
            const kind = el.getAttribute("data-magnetic") || "btn";
            const strength = kind === "card" ? 10 : 8;
            const maxRot = kind === "card" ? 3.5 : 2.25;

            const onMove = (ev) => {
                const r = el.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const dx = (ev.clientX - cx) / (r.width / 2);
                const dy = (ev.clientY - cy) / (r.height / 2);
                const tx = clamp(dx, -1, 1) * strength;
                const ty = clamp(dy, -1, 1) * strength;
                const rx = clamp(-dy, -1, 1) * maxRot;
                const ry = clamp(dx, -1, 1) * maxRot;

                el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
            };

            const onLeave = () => {
                el.style.transform = "";
            };

            el.style.transformStyle = "preserve-3d";
            el.style.willChange = "transform";

            el.addEventListener("pointermove", onMove);
            el.addEventListener("pointerleave", onLeave);

            cleanups.push(() => {
                el.removeEventListener("pointermove", onMove);
                el.removeEventListener("pointerleave", onLeave);
                el.style.transform = "";
            });
        }

        return () => cleanups.forEach((fn) => fn());
    }, []);

    const reelsRef = useRef(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    useEffect(() => {
        const el = reelsRef.current;
        if (!el) return;

        const update = () => {
            const max = el.scrollWidth - el.clientWidth;
            const left = el.scrollLeft;
            setCanLeft(left > 2);
            setCanRight(left < max - 2);
        };

        update();
        el.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            el.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    const reelsAnimRef = useRef({ raf: 0, scrolling: false, restore: null });

    const cancelReelsAnim = () => {
        const st = reelsAnimRef.current;
        if (st.raf) cancelAnimationFrame(st.raf);
        st.raf = 0;
        st.scrolling = false;
        if (typeof st.restore === "function") {
            st.restore();
            st.restore = null;
        }
    };

    const smoothScrollReelsTo = (targetLeft, durationMs) => {
        const el = reelsRef.current;
        if (!el) return;

        cancelReelsAnim();

        const prevSnapType = el.style.scrollSnapType;
        const prevScrollBehavior = el.style.scrollBehavior;
        el.style.scrollSnapType = "none";
        el.style.scrollBehavior = "auto";

        reelsAnimRef.current.restore = () => {
            el.style.scrollSnapType = prevSnapType;
            el.style.scrollBehavior = prevScrollBehavior;
        };

        const max = Math.max(0, el.scrollWidth - el.clientWidth);
        const startLeft = el.scrollLeft || 0;
        const target = clamp(targetLeft, 0, max);
        const delta = target - startLeft;
        const dist = Math.abs(delta);
        if (dist < 1) {
            cancelReelsAnim();
            return;
        }

        const useSpring = target > 8 && target < max - 8;
        const freq = clamp(7.6 + dist / 1200, 7.6, 10.6);
        const damping = 0.82;

        const dur = Math.max(1, durationMs);
        const start = performance.now();
        const st = reelsAnimRef.current;
        st.scrolling = true;

        const tick = (now) => {
            const t = clamp((now - start) / dur, 0, 1);
            const u = smootherstep(t);
            const eased = useSpring ? easeSpring(u, freq, damping) : easeOutCubic(u);

            el.scrollLeft = startLeft + delta * eased;

            if (t < 1 && st.scrolling) st.raf = requestAnimationFrame(tick);
            else {
                const restore = st.restore;
                st.restore = null;
                st.scrolling = false;
                st.raf = 0;
                requestAnimationFrame(() => {
                    if (typeof restore === "function") restore();
                    el.scrollLeft = target;
                });
            }
        };

        st.raf = requestAnimationFrame(tick);
    };

    useEffect(() => {
        const el = reelsRef.current;
        if (!el) return;

        const cancelOnUser = () => {
            if (reelsAnimRef.current.scrolling) cancelReelsAnim();
        };

        el.addEventListener("wheel", cancelOnUser, { passive: true });
        el.addEventListener("touchstart", cancelOnUser, { passive: true });
        el.addEventListener("pointerdown", cancelOnUser, { passive: true });

        return () => {
            el.removeEventListener("wheel", cancelOnUser);
            el.removeEventListener("touchstart", cancelOnUser);
            el.removeEventListener("pointerdown", cancelOnUser);
        };
    }, []);

    const scrollReelsByPage = (dir) => {
        const el = reelsRef.current;
        if (!el) return;

        const page = Math.max(320, Math.round(el.clientWidth * 0.92));
        const dx = dir === "left" ? -page : page;

        const target = (el.scrollLeft || 0) + dx;
        const dist = Math.abs(dx);
        const dur = clamp(1100 + dist * 1.15, 1100, 4200);

        smoothScrollReelsTo(target, dur);
    };

    return (
        <div className="min-h-screen bg-[#07060b] text-white">
            <GlobalStyles />
            <BackgroundFX p={scrollP} />
            <div className="mo-spotlight" />

            <div className="relative z-10">
                <TopNav active={activeSection} progress={scrollP} />

                <section id="top" className="relative flex h-[100svh] flex-col justify-center overflow-hidden snap-start [scroll-snap-stop:always] pt-28">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div
                            className="absolute -inset-10 opacity-[0.22] blur-2xl"
                            style={{ transform: `translate3d(${(scrollP - 0.5) * 40}px, ${(0.5 - scrollP) * 24}px, 0)` }}
                        >
                            <div className="absolute left-[8%] top-[18%] h-[420px] w-[420px] rounded-full bg-violet-500/25" />
                            <div className="absolute right-[6%] top-[10%] h-[520px] w-[520px] rounded-full bg-sky-500/18" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/55" />
                    </div>

                    <div className="mx-auto max-w-6xl px-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur">
                            <Gamepad2 className="h-4 w-4" />
                            <span>3Cs • Game Feel • Technical Game Design</span>
                        </div>

                        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
                            <span className="text-white">Marandi Omid</span>
                            <span className="block text-white/85">Technical 3Cs Game Designer</span>
                        </h1>

                        <div className="mt-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-wrap gap-3">
                                <PrimaryButton href="#playground">
                                    <Zap className="h-4 w-4" />
                                    What I actually do
                                </PrimaryButton>
                                <SecondaryButton href="#reels">
                                    <Sparkles className="h-4 w-4" />
                                    Demo reels
                                </SecondaryButton>
                                <SecondaryButton href="#projects">
                                    <Target className="h-4 w-4" />
                                    Projects
                                </SecondaryButton>
                                {/* CV button must lead to About (download buttons live there) */}
                                <SecondaryButton href="#about">
                                    <Download className="h-4 w-4" />
                                    CV
                                </SecondaryButton>
                            </div>

                            <div className="flex items-center gap-2 md:justify-end">
                                <ContactPill icon={<Mail className="h-4 w-4" />} label="Email" title={CONTACTS.email} href={`mailto:${CONTACTS.email}`} />
                                <ContactPill icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" title="LinkedIn" href={CONTACTS.linkedin} />
                                <ContactPill icon={<Github className="h-4 w-4" />} label="GitHub" title="GitHub" href={CONTACTS.github} />
                                <ContactPill icon={<ExternalLink className="h-4 w-4" />} label="Itch.io" title="Itch.io" href={CONTACTS.itch} />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="reels" className="relative h-[100svh] overflow-hidden snap-start [scroll-snap-stop:always] pb-10 pt-28">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div
                            className="absolute -inset-14 opacity-[0.18] blur-2xl"
                            style={{ transform: `translate3d(${(scrollP - 0.5) * -52}px, ${(scrollP - 0.5) * 18}px, 0)` }}
                        >
                            <div className="absolute left-[10%] bottom-[6%] h-[560px] w-[560px] rounded-full bg-fuchsia-500/18" />
                            <div className="absolute right-[8%] bottom-[14%] h-[520px] w-[520px] rounded-full bg-sky-500/16" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/15 to-black/45" />
                    </div>

                    <div className="mx-auto flex h-full max-w-6xl flex-col px-4">
                        <div className="mb-7">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
                                <Sparkles className="h-4 w-4" />
                                <span>Demo reels</span>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm text-white/70">Check out my latest Demo Reels!</p>
                        </div>

                        <div className="flex flex-1 items-center">
                            <div className="relative w-full">
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/60 to-transparent" />
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/60 to-transparent" />

                                <div className="hidden md:block">
                                    <div className="absolute left-0 top-1/2 -translate-x-[120%] -translate-y-1/2">
                                        <ScrollArrow dir="left" disabled={!canLeft} onClick={() => scrollReelsByPage("left")} />
                                    </div>
                                    <div className="absolute right-0 top-1/2 translate-x-[120%] -translate-y-1/2">
                                        <ScrollArrow dir="right" disabled={!canRight} onClick={() => scrollReelsByPage("right")} />
                                    </div>
                                </div>

                                <div
                                    ref={reelsRef}
                                    className={cn(
                                        "flex gap-4 overflow-x-auto pb-2",
                                        "snap-x snap-mandatory",
                                        "scroll-smooth",
                                        "[-ms-overflow-style:none] [scrollbar-width:none]",
                                        "[&::-webkit-scrollbar]:hidden"
                                    )}
                                >
                                    {reelsSorted.map((r) => (
                                        <div key={`${r.year}-${r.title}`} className="min-w-[320px] snap-start md:min-w-[520px]">
                                            <ReelCard r={r} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Section id="playground" title="What I actually do" icon={<SlidersHorizontal className="h-4 w-4" />} subtitle="Compare the exact same level with feel tuning ON vs OFF to feel the difference.">
                    <ThreeCPlayground />
                </Section>

                <Section id="projects" title="Projects" icon={<Target className="h-4 w-4" />} subtitle="Games that I've been part of">
                    <div className="grid gap-4">
                        {PROJECTS.map((p) => (
                            <ProjectCard key={p.title} p={p} />
                        ))}
                    </div>
                </Section>

                <Section id="about" title="About me" icon={<Sparkles className="h-4 w-4" />} subtitle="Quick snapshot: what I do, the skills I have, and what I like outside of work.">
                    <div className="grid gap-4 lg:grid-cols-12">
                        <GlowCard className="p-5 lg:col-span-4">
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                                <div className="relative aspect-square">
                                    <img
                                        src="/about/me.jpg"
                                        alt="Portrait"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/10 via-white/5 to-black/40" />
                                </div>
                            </div>

                            <div className="mt-4 grid gap-2">
                                <SecondaryButton href="/cv_en.pdf" newTab>
                                    <Download className="h-4 w-4" />
                                    CV (EN)
                                </SecondaryButton>
                                <SecondaryButton href="/cv_fr.pdf" newTab>
                                    <Download className="h-4 w-4" />
                                    CV (FR)
                                </SecondaryButton>
                            </div>

                            <p className="mt-4 text-sm text-white/70">Technical 3C / Game Feel designer. I prototype quickly, tune game feel iteratively, and easy to work with.</p>
                        </GlowCard>

                        <div className="grid gap-4 lg:col-span-8">
                            <div className="grid gap-4 md:grid-cols-2">
                                <AboutCard title="Game design" desc="I design 3Cs, write documentation, and iterate on game feel with measurable changes." using={["Microsoft Office", "Documentation tools (Notion)", "Miro / diagrams"]} />
                                <AboutCard title="Development" desc="I can prototype ideas quickly, implement feel tweaks, and iterate with the team." using={["Unreal Engine (Blueprints)", "Unity (C#)", "Version control (Git)", "C++", "Python"]} />
                            </div>

                            <AboutCard title="Level design" desc="I'm able to create levels on paper, block out, define metrics, and iterate on levels to support pacing and readability." />

                            <GlowCard className="p-6">
                                <div className="text-sm font-semibold text-white">Some of the things I like</div>

                                <p className="mt-3 text-sm text-white/70">Games</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {["Vampire The Masqurade: Bloodlines", "The Legend of Zelda", "Persona", "Yakuza", "Valheim"].map((t) => (
                                        <Tag key={t}>{t}</Tag>
                                    ))}
                                </div>

                                <p className="mt-4 text-sm text-white/70">TV shows</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {["Game of Thrones", "Vikings", "Avatar: The Last Airbender"].map((t) => (
                                        <Tag key={t}>{t}</Tag>
                                    ))}
                                </div>

                                <p className="mt-4 text-sm text-white/70">Hobbies</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {["Gym", "Tabletop RPGs", "Wood Carving"].map((t) => (
                                        <Tag key={t}>{t}</Tag>
                                    ))}
                                </div>
                            </GlowCard>
                        </div>
                    </div>
                </Section>
            </div>

            <footer className="bg-black/20">
                <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="text-white font-semibold drop-shadow-[0_0_12px_rgba(0,0,0,0.65)]">
                            © {year} Marandi Omid — Technical 3Cs Game Designer
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <ContactPill icon={<Mail className="h-4 w-4" />} label="Email" title={CONTACTS.email} href={`mailto:${CONTACTS.email}`} />
                            <ContactPill icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" title="LinkedIn" href={CONTACTS.linkedin} />
                            <ContactPill icon={<Github className="h-4 w-4" />} label="GitHub" title="GitHub" href={CONTACTS.github} />
                            <ContactPill icon={<ExternalLink className="h-4 w-4" />} label="Itch.io" title="Itch.io" href={CONTACTS.itch} />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
