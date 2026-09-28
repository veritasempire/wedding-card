import { useEffect, useRef } from "react";
import "./cinematic-intro.css";

type Props = { onReveal: () => void; onDone: () => void };

/** Loader + physical-invitation opening. Owns its own GSAP context; cleans up on unmount. */
export function CinematicIntro({ onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    let alive = true;
    let ctx: { revert: () => void } | undefined;
    let tick: (() => void) | undefined;
    let gsapRef: typeof import("gsap").gsap | undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("intro-locked");

    void import("gsap").then(({ gsap }) => {
      if (!alive) return;
      gsapRef = gsap;
      const q = gsap.utils.selector(el);
      const c2 = cv.getContext("2d")!;
      let W = 0, H = 0, boost = 0;
      const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
      size();
      addEventListener("resize", size);
      const count = reduced ? 0 : innerWidth < 700 ? 24 : 46;
      const P = Array.from({ length: count }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + 0.4, s: Math.random() * 0.25 + 0.05, d: Math.random() * 6, a: Math.random() * 0.45 + 0.15 }));
      tick = () => {
        const t = gsap.ticker.time;
        c2.clearRect(0, 0, W, H);
        c2.fillStyle = "#D4AF6A";
        for (const p of P) {
          p.y -= p.s + boost; p.x += Math.sin(t + p.d) * 0.25;
          if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
          c2.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(t * 2 + p.d));
          c2.beginPath(); c2.arc(p.x, p.y, p.r, 0, 6.3); c2.fill();
        }
      };
      gsap.ticker.add(tick);

      ctx = gsap.context(() => {
        const finish = () => { document.body.classList.remove("intro-locked"); onDone(); };
        const open = () => {
          gsap.killTweensOf(q(".ci-hint")); gsap.to(q(".ci-hint"), { opacity: 0, duration: 0.4 });
          const tl = gsap.timeline({ onComplete: exit });
          if (reduced) {
            tl.set(q(".ci-cover"), { autoAlpha: 0 }).to(q(".ci-rev"), { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.25 }).to({}, { duration: 1.2 });
            return;
          }
          tl.to(q(".ci-bow"), { rotation: -4, scale: 1.04, duration: 0.35, ease: "sine.inOut", transformOrigin: "50% 50%" })
            .to(q(".ci-bow"), { rotation: 3, duration: 0.3, ease: "sine.inOut" })
            .to(q(".ci-loops path"), { scaleX: 0.82, duration: 0.7, ease: "power2.inOut", transformOrigin: "100px 58px" }, "<")
            .to(q(".ci-tails"), { y: 14, scaleY: 1.12, duration: 0.8, ease: "power2.out", transformOrigin: "100px 60px" }, "-=.3")
            .to(q(".ci-tails path:first-child"), { rotation: -14, x: -12, duration: 0.9, ease: "sine.inOut", transformOrigin: "96px 62px" }, "<")
            .to(q(".ci-tails path:last-child"), { rotation: 14, x: 12, duration: 0.9, ease: "sine.inOut", transformOrigin: "104px 62px" }, "<")
            .to(q(".ci-bow"), { scale: 0.5, opacity: 0, y: 60, rotation: 12, duration: 1, ease: "power2.in" }, "-=.2")
            .add(() => { boost = 1.4; gsap.to({}, { duration: 1.4, onComplete: () => { boost = 0; } }); }, "<")
            .to(q(".ci-rv"), { yPercent: 115, duration: 1.5, ease: "power3.inOut" }, "-=.8")
            .to(q(".ci-rh"), { xPercent: 140, duration: 1.4, ease: "power3.inOut" }, "<")
            .to(q(".ci-stage"), { scale: 1.06, duration: 1.2, ease: "power2.inOut" }, "-=1")
            .to(q(".ci-cover"), { rotationY: -172, duration: 2.4, ease: "power3.inOut" }, "-=.2")
            .to(q(".ci-shadow"), { scaleX: 1.35, opacity: 0.4, duration: 2.4, ease: "power2.inOut" }, "<")
            .to(q(".ci-stage"), { rotateX: 0, duration: 2, ease: "power2.inOut" }, "<")
            .to(q(".ci-cover"), { opacity: 0, duration: 0.8, ease: "power1.in" }, "-=.7")
            .fromTo(q(".ci-base .ci-sweep"), { x: "-120%" }, { x: "240%", duration: 2, ease: "power1.inOut" }, "-=.3")
            .to({}, { duration: 0.8 })
            .fromTo(q(".ci-rev"), { opacity: 0, y: 16, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, stagger: 0.55, ease: "power3.out" })
            .to({}, { duration: 1.6 });
        };
        const exit = () => {
          const t = gsap.timeline({ onComplete: finish });
          t.to(q(".ci-stage"), { scale: reduced ? 1 : 0.55, opacity: 0, duration: reduced ? 0.6 : 2, ease: "power2.inOut" })
            .add(onReveal, "-=1.4")
            .to(el, { opacity: 0, duration: 1.6, ease: "power1.inOut" }, "-=1.4")
            .set(el, { display: "none" });
        };
        gsap.timeline({ onComplete: () => {
          gsap.set(el, { pointerEvents: "auto" });
          gsap.to(q(".ci-stage"), { opacity: 1, duration: 1.6, ease: "power2.out" });
          gsap.fromTo(q(".ci-stage"), { y: 30, scale: 0.94 }, { y: 0, scale: 1, duration: 1.6, ease: "power3.out" });
          gsap.to(q(".ci-hint"), { opacity: 1, duration: 1, delay: 1.2 });
          gsap.to(q(".ci-hint"), { opacity: 0.35, duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.2 });
          gsap.set(q(".ci-cover"), { transformPerspective: 1600 });
          q(".ci-open")[0]?.addEventListener("click", open, { once: true });
        } })
          .to(q(".ci-bar i"), { scaleX: 1, duration: 1.5, ease: "power1.inOut" })
          .to(q(".ci-nm"), { opacity: 1, duration: 0.8 }, 0.5)
          .to(q(".ci-loader"), { opacity: 0, duration: 0.7, delay: 0.2 })
          .set(q(".ci-loader"), { display: "none" });
      }, el);
    });

    return () => {
      alive = false;
      if (tick) gsapRef?.ticker.remove(tick);
      ctx?.revert();
      document.body.classList.remove("intro-locked");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flora = (
    <>
      <path d="M4 96C22 70 30 40 58 12" />
      <path d="M22 72c-12-2-16-10-16-16 10 0 16 6 16 16zM32 54c-10-4-12-12-10-18 10 2 14 8 10 18zM44 36c-8-6-8-14-4-18 8 4 10 10 4 18z" />
      <circle cx="60" cy="10" r="4" stroke="#B89452" />
    </>
  );

  return (
    <div className="ci-root" ref={root} aria-label="Wedding invitation">
      <div className="ci-loader" aria-hidden="true">
        <div className="ci-mono">A × I</div>
        <div className="ci-nm">Ayaan Sikander &amp; Inaayat Mariam</div>
        <div className="ci-bar"><i /></div>
      </div>
      <div className="ci-grain" aria-hidden="true" />
      <canvas ref={canvas} className="ci-fx" aria-hidden="true" />
      <div className="ci-stage">
        <div className="ci-shadow" />
        <div className="ci-base">
          <div className="ci-inner" /><div className="ci-sweep" />
          <div className="ci-rev ci-eyebrow">Together with their families</div>
          <div className="ci-rev ci-name">Ayaan Sikander</div>
          <div className="ci-rev ci-x">×</div>
          <div className="ci-rev ci-name">Inaayat Mariam</div>
          <div className="ci-rev ci-date">5 October 2026</div>
          <div className="ci-rev ci-venue">Sunset Club Banquet Hall</div>
        </div>
        <button type="button" className="ci-cover ci-open" aria-label="Open the wedding invitation">
          <div className="ci-face">
            <div className="ci-frame" />
            <svg className="ci-flora" style={{ left: "4%", top: "3%", width: "34%" }} viewBox="0 0 100 100" fill="none" stroke="#66705D" strokeWidth="1.2" aria-hidden="true">{flora}</svg>
            <svg className="ci-flora" style={{ right: "4%", bottom: "3%", width: "34%", transform: "rotate(180deg)" }} viewBox="0 0 100 100" fill="none" stroke="#66705D" strokeWidth="1.2" aria-hidden="true">{flora}</svg>
            <div className="ci-monogram">A × I</div>
            <div className="ci-bot">5 · 10 · 2026</div>
            <div className="ci-ribbon ci-rv" /><div className="ci-ribbon-h ci-rh" />
            <svg className="ci-bow" viewBox="0 0 200 120" aria-hidden="true">
              <defs><linearGradient id="ci-g" x1="0" x2="1"><stop offset="0" stopColor="#06132a" /><stop offset=".5" stopColor="#22487f" /><stop offset="1" stopColor="#08182e" /></linearGradient></defs>
              <g className="ci-tails"><path d="M96 62 L62 116 L84 108 L92 118 L106 70Z" fill="url(#ci-g)" /><path d="M104 62 L138 116 L116 108 L108 118 L94 70Z" fill="url(#ci-g)" /></g>
              <g className="ci-loops"><path d="M100 58C70 6 12 2 10 34c-2 28 60 30 90 24z" fill="url(#ci-g)" /><path d="M100 58C130 6 188 2 190 34c2 28-60 30-90 24z" fill="url(#ci-g)" /></g>
              <rect x="86" y="44" width="28" height="28" rx="9" fill="#12305a" stroke="#5a86c4" strokeOpacity=".4" />
            </svg>
          </div>
        </button>
      </div>
      <div className="ci-hint">Tap to open</div>
    </div>
  );
}
