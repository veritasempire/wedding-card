import { useEffect, useRef, useState, type FormEvent, type TouchEvent } from "react";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Menu,
  Music2,
  Pause,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CinematicIntro } from "@/components/CinematicIntro";
import heroImage from "@/assets/wedding-hero.jpg";
import venueImage from "@/assets/venue-sunset.jpg";
import invitationImage from "@/assets/gallery-invitation.jpg";
import bouquetImage from "@/assets/gallery-bouquet.jpg";

type Countdown = { days: number; hours: number; minutes: number; seconds: number; arrived: boolean };
type Wish = { id: number; name: string; message: string };
type Rsvp = {
  name: string;
  email: string;
  phone: string;
  guests: string;
  attendance: string;
  meal: string;
  message: string;
};

const weddingDate = new Date("2026-10-05T18:00:00+05:00");
const emptyRsvp: Rsvp = { name: "", email: "", phone: "", guests: "1", attendance: "accept", meal: "", message: "" };
const initialWishes: Wish[] = [
  { id: 1, name: "Sarah & Omar", message: "May every chapter ahead be more beautiful than the last." },
  { id: 2, name: "The Rahman Family", message: "Wishing you a lifetime of quiet joy, deep friendship, and endless love." },
];

const story = [
  ["The First Meeting", "A glance that lingered, a conversation that felt instantly familiar."],
  ["The Beginning", "Two lives gently finding their rhythm in a thousand ordinary moments."],
  ["A Special Moment", "A promise understood beneath a sky washed in evening gold."],
  ["The Proposal", "One question, one joyful answer, and the beginning of always."],
  ["Forever Begins", "On the fifth of October, surrounded by those we love most."],
];

const events = [
  { title: "Nikah", time: "Time to be announced", text: "An intimate ceremony of faith, promise, and devotion." },
  { title: "Wedding Ceremony", time: "Time to be announced", text: "Join us as our families celebrate the beginning of forever." },
  { title: "Reception", time: "Time to be announced", text: "An evening of dinner, music, and joyful celebration." },
];

const gallery = [
  { src: heroImage, alt: "A bride and groom walking through a sunlit colonnade", wide: true },
  { src: invitationImage, alt: "Ivory wedding stationery tied with navy ribbon", wide: false },
  { src: bouquetImage, alt: "Bride holding an ivory floral bouquet", wide: false },
  { src: venueImage, alt: "Elegant candlelit wedding tables at sunset", wide: true },
];

function calculateCountdown(): Countdown {
  const difference = weddingDate.getTime() - Date.now();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, arrived: true };
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
    arrived: false,
  };
}

function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 340" fill="none" aria-hidden="true">
      <path d="M34 329C71 235 105 164 179 22" stroke="currentColor" strokeWidth="1.2" />
      <path d="M79 221C42 218 24 192 26 165C58 170 78 188 79 221Z" stroke="currentColor" />
      <path d="M110 157C83 134 84 102 101 82C123 105 128 129 110 157Z" stroke="currentColor" />
      <path d="M139 102C124 69 140 43 166 32C173 63 163 86 139 102Z" stroke="currentColor" />
      <path d="M72 240C104 236 126 250 134 277C104 284 80 270 72 240Z" stroke="currentColor" />
      <path d="M107 170C138 166 159 180 167 205C137 213 115 197 107 170Z" stroke="currentColor" />
      <circle cx="181" cy="21" r="5" stroke="currentColor" />
    </svg>
  );
}

function SectionHeading({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <header className={`section-heading reveal ${light ? "section-heading-light" : ""}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <i aria-hidden="true" />
    </header>
  );
}

export function WeddingInvitation() {
  const siteRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const [entered, setEntered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0, arrived: false });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [musicOn, setMusicOn] = useState(false);
  const [rsvp, setRsvp] = useState<Rsvp>(emptyRsvp);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [wishName, setWishName] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [wishError, setWishError] = useState("");

  useEffect(() => {
    setCountdown(calculateCountdown());
    const timer = window.setInterval(() => setCountdown(calculateCountdown()), 1000);
    try {
      const storedRsvp = window.localStorage.getItem("ayaan-inaayat-rsvp");
      const storedWishes = window.localStorage.getItem("ayaan-inaayat-wishes");
      if (storedRsvp) setRsvp(JSON.parse(storedRsvp) as Rsvp);
      if (storedWishes) setWishes(JSON.parse(storedWishes) as Wish[]);
    } catch {
      // The experience remains fully usable when private browsing blocks storage.
    }
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!entered || !siteRef.current) return;
    let ctx: { revert: () => void } | undefined;
    let active = true;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (!active || !siteRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(siteRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: "power1.inOut" });
        gsap.from(".hero-copy > *", { autoAlpha: 0, y: 26, filter: "blur(6px)", duration: 1.4, stagger: 0.16, ease: "power3.out", delay: 0.5 });
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
          gsap.fromTo(element, { autoAlpha: 0, y: 38 }, { autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 86%", once: true } });
        });
        gsap.fromTo(".timeline-stroke", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".story-timeline", start: "top 75%", end: "bottom 70%", scrub: 1 } });
        gsap.utils.toArray<HTMLElement>(".parallax-image").forEach((element) => {
          gsap.fromTo(element, { scale: 1.08, yPercent: -3 }, { scale: 1.02, yPercent: 3, ease: "none", scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 1 } });
        });
      }, siteRef);
    });
    return () => { active = false; ctx?.revert(); };
  }, [entered]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const toggleMenu = async () => {
    const next = !menuOpen;
    setMenuOpen(next);
    const { gsap } = await import("gsap");
    if (menuRef.current) gsap.fromTo(menuRef.current, { autoAlpha: next ? 0 : 1, y: next ? -16 : 0 }, { autoAlpha: next ? 1 : 0, y: next ? 0 : -12, duration: 0.38, ease: "power3.out" });
  };

  const toggleMusic = () => {
    if (musicOn) {
      oscillatorsRef.current.forEach((oscillator) => oscillator.stop());
      oscillatorsRef.current = [];
      void audioRef.current?.close();
      audioRef.current = null;
      setMusicOn(false);
      return;
    }
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 2);
    master.connect(context.destination);
    const notes = [220, 277.18, 329.63];
    oscillatorsRef.current = notes.map((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.18 / (index + 1);
      oscillator.connect(gain).connect(master);
      oscillator.start();
      return oscillator;
    });
    audioRef.current = context;
    setMusicOn(true);
  };

  const submitRsvp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rsvp.name.trim() || !/^\S+@\S+\.\S+$/.test(rsvp.email)) {
      setRsvpError("Please enter your name and a valid email address.");
      return;
    }
    try { window.localStorage.setItem("ayaan-inaayat-rsvp", JSON.stringify(rsvp)); } catch { /* no-op */ }
    setRsvpError("");
    setRsvpSent(true);
  };

  const submitWish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!wishName.trim() || !wishMessage.trim()) {
      setWishError("Please add both your name and a short message.");
      return;
    }
    const next = [...wishes, { id: Date.now(), name: wishName.trim(), message: wishMessage.trim() }];
    setWishes(next);
    setWishName("");
    setWishMessage("");
    setWishError("");
    try { window.localStorage.setItem("ayaan-inaayat-wishes", JSON.stringify(next)); } catch { /* no-op */ }
    requestAnimationFrame(async () => {
      const { gsap } = await import("gsap");
      gsap.fromTo(".wish-card:last-child", { autoAlpha: 0, y: 24, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.25)" });
    });
  };

  const downloadCalendar = (title = "Wedding of Ayaan Sikander & Inaayat Mariam") => {
    const content = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Ayaan and Inaayat Wedding//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nBEGIN:VEVENT\r\nUID:ayaan-inaayat-wedding-20261005@wedding\r\nDTSTAMP:20260928T102300Z\r\nDTSTART;VALUE=DATE:20261005\r\nDTEND;VALUE=DATE:20261006\r\nSUMMARY:${title}\r\nLOCATION:Sunset Club Banquet Hall\r\nDESCRIPTION:Join Ayaan Sikander and Inaayat Mariam as they celebrate their wedding.\r\nSTATUS:CONFIRMED\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/calendar" }));
    link.download = "ayaan-and-inaayat-wedding.ics";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const moveLightbox = (direction: number) => setLightbox((current) => current === null ? null : (current + direction + gallery.length) % gallery.length);
  const onTouchEnd = (event: TouchEvent) => {
    if (touchStart === null) return;
    const delta = event.changedTouches[0]?.clientX ?? touchStart;
    if (Math.abs(delta - touchStart) > 45) moveLightbox(delta < touchStart ? 1 : -1);
    setTouchStart(null);
  };

  return (
    <>
      {!entered && <CinematicIntro onReveal={() => setEntered(true)} onDone={() => window.scrollTo(0, 0)} />}

      <div className={`wedding-site ${entered ? "site-entered" : ""}`} ref={siteRef} aria-hidden={!entered}>
        <nav className="main-nav" ref={navRef} aria-label="Wedding navigation">
          <button className="nav-monogram" onClick={() => scrollTo("home")} aria-label="Go to home">A<span>×</span>I</button>
          <div className="desktop-links">
            {["home", "our-story", "events", "gallery", "rsvp"].map((id) => <button key={id} onClick={() => scrollTo(id)}>{id.replace("-", " ")}</button>)}
          </div>
          <Button variant="navIcon" size="icon" onClick={toggleMenu} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</Button>
          <div ref={menuRef} className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}>
            {["home", "our-story", "events", "gallery", "rsvp"].map((id, index) => <button key={id} onClick={() => scrollTo(id)}><span>0{index + 1}</span>{id.replace("-", " ")}</button>)}
          </div>
        </nav>

        <main>
          <section id="home" className="hero-section">
            <img src={heroImage} alt="A bride and groom walking together through a sunlit colonnade" width={1536} height={1024} className="hero-image" />
            <div className="hero-shade" />
            <Botanical className="hero-botanical" />
            <div className="hero-copy">
              <p className="hero-kicker">Together with their families</p>
              <h1><span>Ayaan Sikander</span><b>×</b><span>Inaayat Mariam</span></h1>
              <div className="hero-date"><i />5 October 2026<i /></div>
              <div className="hero-actions">
                <Button variant="hero" size="lg" onClick={() => scrollTo("our-story")}>Explore Our Story</Button>
                <Button variant="heroOutline" size="lg" onClick={() => scrollTo("rsvp")}>RSVP</Button>
                <Button variant="heroOutline" size="lg" onClick={() => downloadCalendar()}><CalendarPlus /> Add to Calendar</Button>
              </div>
            </div>
            <div className="scroll-cue"><span>Scroll to discover</span><i /></div>
          </section>

          <section className="countdown-section">
            <div className="countdown-intro reveal">
              <span>05 · 10 · 26</span>
              <h2>Counting Every Moment<br />Until We Say I Do</h2>
            </div>
            {countdown.arrived ? <p className="arrived-message">The day has arrived.</p> : (
              <div className="countdown-grid reveal">
                {(["days", "hours", "minutes", "seconds"] as const).map((unit) => <div key={unit}><strong key={countdown[unit]}>{String(countdown[unit]).padStart(2, "0")}</strong><span>{unit}</span></div>)}
              </div>
            )}
          </section>

          <section id="our-story" className="story-section">
            <SectionHeading eyebrow="Written in the stars" title="Our Story" />
            <div className="story-timeline">
              <i className="timeline-stroke" />
              {story.map(([title, text], index) => (
                <article className="story-moment reveal" key={title}>
                  <div className="story-number">0{index + 1}</div>
                  <div><span>{index === 4 ? "October 2026" : "A cherished chapter"}</span><h3>{title}</h3><p>{text}</p></div>
                </article>
              ))}
            </div>
            <Botanical className="story-botanical" />
          </section>

          <section id="events" className="events-section">
            <SectionHeading eyebrow="The celebration" title="Wedding Events" light />
            <div className="events-grid">
              {events.map((event, index) => (
                <article className="event-card reveal" key={event.title}>
                  <span className="event-index">0{index + 1}</span>
                  <Heart aria-hidden="true" />
                  <h3>{event.title}</h3>
                  <p className="event-time"><Clock3 /> 5 October 2026 · {event.time}</p>
                  <p>{event.text}</p>
                  <div className="event-place"><MapPin /> Sunset Club Banquet Hall</div>
                  <Button variant="goldLink" onClick={() => downloadCalendar(event.title)}><CalendarPlus /> Add to calendar</Button>
                </article>
              ))}
            </div>
          </section>

          <section id="venue" className="venue-section">
            <div className="venue-image-wrap reveal"><img className="parallax-image" src={venueImage} alt="Sunset Club Banquet Hall prepared for an evening reception" width={1536} height={1024} loading="lazy" /></div>
            <div className="venue-copy reveal">
              <span className="eyebrow">Where we gather</span>
              <h2>Sunset Club<br />Banquet Hall</h2>
              <div className="ornament-line"><i /><Sparkles /><i /></div>
              <p>A golden evening of ceremony, dinner, and dancing awaits. Full address and event timing will be shared with your formal invitation.</p>
              <div className="venue-facts"><span><Clock3 /> Timing to be announced</span><span><MapPin /> Address to be announced</span></div>
              <Button variant="navy" size="lg" onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=Sunset+Club+Banquet+Hall", "_blank", "noopener,noreferrer")}>Get Directions <ChevronRight /></Button>
            </div>
          </section>

          <section id="gallery" className="gallery-section">
            <SectionHeading eyebrow="Moments, held forever" title="A Glimpse of Us" />
            <div className="gallery-grid">
              {gallery.map((image, index) => (
                <button className={`gallery-item reveal ${image.wide ? "gallery-wide" : ""}`} onClick={() => setLightbox(index)} key={image.alt} aria-label={`Open photo ${index + 1}`}>
                  <img src={image.src} alt={image.alt} width={image.wide ? 1536 : 1024} height={image.wide ? 1024 : 1536} loading="lazy" />
                  <span><i>0{index + 1}</i> View moment</span>
                </button>
              ))}
            </div>
          </section>

          <section className="quote-section">
            <div className="quote-stars">✦　·　✦</div>
            <blockquote className="reveal">“Whatever our souls are made of,<br />his and mine are the same.”</blockquote>
            <cite>— Emily Brontë</cite>
          </section>

          <section id="wishes" className="wishes-section">
            <SectionHeading eyebrow="Words to keep" title="Leave a Little Love" />
            <div className="wishes-layout">
              <form className="wishes-form reveal" onSubmit={submitWish}>
                <label>Name<input value={wishName} onChange={(event) => setWishName(event.target.value)} maxLength={60} placeholder="Your name" /></label>
                <label>Message<textarea value={wishMessage} onChange={(event) => setWishMessage(event.target.value)} maxLength={220} placeholder="A wish for the couple" rows={4} /></label>
                {wishError && <p className="form-error" role="alert">{wishError}</p>}
                <Button variant="navy" type="submit">Send your wish <Send /></Button>
              </form>
              <div className="wish-list">
                {wishes.map((wish) => <article className="wish-card" key={wish.id}><Sparkles /><p>“{wish.message}”</p><span>— {wish.name}</span></article>)}
              </div>
            </div>
          </section>

          <section id="rsvp" className="rsvp-section">
            <Botanical className="rsvp-botanical rsvp-botanical-left" />
            <Botanical className="rsvp-botanical rsvp-botanical-right" />
            <div className="rsvp-inner reveal">
              <span className="eyebrow">The pleasure of your company</span>
              <h2>Will You Join Us?</h2>
              <p>Kindly respond at your earliest convenience.</p>
              {rsvpSent ? (
                <div className="rsvp-confirmation"><Heart /><h3>Thank you for celebrating this beautiful beginning with us.</h3><Button variant="goldLink" onClick={() => setRsvpSent(false)}>Update response</Button></div>
              ) : (
                <form className="rsvp-form" onSubmit={submitRsvp} noValidate>
                  <label>Full Name<input value={rsvp.name} onChange={(event) => setRsvp({ ...rsvp, name: event.target.value })} autoComplete="name" /></label>
                  <label>Email<input type="email" value={rsvp.email} onChange={(event) => setRsvp({ ...rsvp, email: event.target.value })} autoComplete="email" /></label>
                  <label>Phone<input type="tel" value={rsvp.phone} onChange={(event) => setRsvp({ ...rsvp, phone: event.target.value })} autoComplete="tel" /></label>
                  <label>Number of Guests<select value={rsvp.guests} onChange={(event) => setRsvp({ ...rsvp, guests: event.target.value })}>{[1,2,3,4,5,6].map((n) => <option key={n}>{n}</option>)}</select></label>
                  <fieldset><legend>Attendance</legend><label className="radio-label"><input type="radio" name="attendance" checked={rsvp.attendance === "accept"} onChange={() => setRsvp({ ...rsvp, attendance: "accept" })} />Joyfully Accept</label><label className="radio-label"><input type="radio" name="attendance" checked={rsvp.attendance === "decline"} onChange={() => setRsvp({ ...rsvp, attendance: "decline" })} />Regretfully Decline</label></fieldset>
                  <label>Meal Preference<select value={rsvp.meal} onChange={(event) => setRsvp({ ...rsvp, meal: event.target.value })}><option value="">Please select</option><option>Vegetarian</option><option>Chicken</option><option>Fish</option><option>Other</option></select></label>
                  <label className="form-full">Message for the Couple<textarea rows={4} value={rsvp.message} onChange={(event) => setRsvp({ ...rsvp, message: event.target.value })} /></label>
                  {rsvpError && <p className="form-error form-full" role="alert">{rsvpError}</p>}
                  <Button variant="gold" size="lg" className="form-full" type="submit">Submit RSVP <Heart /></Button>
                </form>
              )}
            </div>
          </section>

          <footer className="closing-section">
            <div className="closing-monogram">A <span>×</span> I</div>
            <p>With love, we cannot wait to celebrate with you.</p>
            <h2>5 October 2026</h2>
            <span>Sunset Club Banquet Hall</span>
          </footer>
        </main>

        <Button className={`music-control ${musicOn ? "music-playing" : ""}`} variant="music" size="icon" onClick={toggleMusic} aria-label={musicOn ? "Turn music off" : "Turn music on"}>
          {musicOn ? <Pause /> : <Music2 />}
          <span>{musicOn ? "Music on" : "Music off"}</span>
        </Button>
      </div>

      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Wedding gallery" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={onTouchEnd}>
          <Button variant="lightbox" size="icon" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close gallery"><X /></Button>
          <Button variant="lightbox" size="icon" className="lightbox-prev" onClick={() => moveLightbox(-1)} aria-label="Previous photo"><ChevronLeft /></Button>
          <img src={gallery[lightbox]?.src} alt={gallery[lightbox]?.alt ?? "Wedding gallery photograph"} />
          <Button variant="lightbox" size="icon" className="lightbox-next" onClick={() => moveLightbox(1)} aria-label="Next photo"><ChevronRight /></Button>
          <span className="lightbox-count">{lightbox + 1} / {gallery.length}</span>
        </div>
      )}
    </>
  );
}
