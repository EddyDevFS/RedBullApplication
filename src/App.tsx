import { Fragment, type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  BadgeCheck,
  Brain,
  Check,
  Cog,
  Eye,
  ExternalLink,
  FileText,
  Gauge,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  MessageSquareMore,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  assets,
  contact,
  finalActions,
  objections,
  wingForces,
  type WingForce,
} from "./data/site";
import caseStudyData from "./data/case-studies.json";
import {
  createShareLink,
  getTrackedDocumentHref,
  identifySharedVisitor,
  isSharedInvitationVisit,
  submitAdminMessage,
  trackEvent,
} from "./tracking";

gsap.registerPlugin(ScrollTrigger);

type ModalState =
  | { type: "force"; item: WingForce }
  | { type: "case"; item: CaseStudy }
  | { type: "criterion"; item: (typeof candidateScanCriteria)[number] }
  | { type: "action"; item: (typeof finalActions)[number] }
  | { type: "documents" }
  | null;

type CaseStudy = {
  id: string;
  n: string;
  cat: string;
  catLabel: string;
  featured?: boolean;
  title: string;
  subtitle: string;
  img: string;
  caption: string;
  takeaway: string;
  tags: string[];
  proof: string[];
  body: string;
};

const caseStudies = caseStudyData.cases as CaseStudy[];
const EASTERN_TIME_ZONE = "America/New_York";

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return asUtc - date.getTime();
}

function easternInputValues(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function nextEasternConversationSlot() {
  const next = new Date(Date.now() + 60 * 60 * 1000);
  const roundedMinutes = Math.ceil(next.getMinutes() / 15) * 15;
  next.setMinutes(roundedMinutes, 0, 0);
  return easternInputValues(next);
}

function easternWallTimeToUtc(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const naiveUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = getTimeZoneOffsetMs(naiveUtc, EASTERN_TIME_ZONE);
  return new Date(naiveUtc.getTime() - offset);
}

const caseImageMap: Record<string, string> = {
  "first-agency": "/assets/images/case-contres.jpg",
  "region-13-agencies": "/assets/images/case-samsic-nice.jpg",
  "agency-launch-system": "/assets/images/case-training.jpg",
  "stopped-recruiting-experience": "/assets/images/case-recruitment.gif",
  "assistant-branch-manager": "/assets/images/case-samsic-cannes.png",
  "accountability-without-micro": "/assets/images/case-samsic-hq.avif",
  "resistance-change": "/assets/images/case-interview.jpg",
  "center-parcs": "/assets/images/case-center-parcs.jpg",
  "beauval-waiter": "/assets/images/case-beauval-hotel.jpg",
  "assumptions-recruitment": "/assets/images/case-interview.jpg",
  "staffing-platform": "/assets/images/case-mobile-app.png",
  "ceo-digital-solution": "/assets/images/case-samsic-hq.avif",
  "fitness-club": "/assets/images/case-les-mills.webp",
  "training-organization": "/assets/images/case-training.jpg",
  "us-service-business": "/assets/images/case-field-services.jpg",
  "thales-traceability": "/assets/images/case-control-tower.png",
};

const assignmentHighlights = [
  {
    id: "market",
    title: "Market Intelligence",
    text: "Retail execution",
    icon: Eye,
    target: { x: 45.8, y: 25.2 },
    lineStart: { x: 35.2, y: 22.2 },
  },
  {
    id: "analytics",
    title: "Analytical Discipline",
    text: "KPI / process / systems discipline",
    icon: Brain,
    target: { x: 52.2, y: 18.8 },
    lineStart: { x: 67.0, y: 19.1 },
  },
  {
    id: "communication",
    title: "Communication Impact",
    text: "Cross-functional collaboration & communication",
    icon: MessageSquareMore,
    target: { x: 58.2, y: 39.8 },
    lineStart: { x: 68.0, y: 40.7 },
  },
  {
    id: "leadership",
    title: "Leadership & Culture",
    text: "Team leadership & coaching",
    icon: Users,
    target: { x: 47.3, y: 44.8 },
    lineStart: { x: 35.6, y: 53.5 },
  },
  {
    id: "execution",
    title: "Execution Excellence",
    text: "Sales & distribution planning",
    icon: Cog,
    target: { x: 37.2, y: 71.8 },
    lineStart: { x: 42.7, y: 78.6 },
  },
  {
    id: "field",
    title: "Field Command",
    text: "Branch operations",
    icon: MapPin,
    target: { x: 57.4, y: 68.8 },
    lineStart: { x: 64.8, y: 78.8 },
  },
  {
    id: "growth",
    title: "Growth Mindset",
    text: "Profitability / P&L / growth mindset",
    icon: TrendingUp,
    target: { x: 59.8, y: 57.3 },
    lineStart: { x: 70.2, y: 50.6 },
  },
] as const;

const candidateScanCriteria = [
  {
    id: "field-leadership",
    title: "Field Leadership",
    status: "Validated management pattern",
    icon: Users,
    signal: "Lead close enough to understand the work, structured enough to scale it.",
    requirement: "Lead, coach, and develop teams while keeping execution standards visible and operational objectives on track.",
    evidence: "Managed multi-site field teams, recruited and developed people, installed routines, and coached close to the operational reality.",
    transfer: "Supports a branch leadership style based on clarity, accountability, field proximity, and team development.",
  },
  {
    id: "territory-building",
    title: "Territory Building",
    status: "Validated expansion logic",
    icon: MapPin,
    signal: "Build presence where there is no installed base.",
    requirement: "Build territory coverage, identify local opportunities, and create traction where execution is not yet installed.",
    evidence: "Opened and developed territories from zero by mapping local dynamics, finding first accounts, and turning early wins into repeatable routines.",
    transfer: "Useful for store clusters or market areas that need disciplined coverage, local reading, and visible progress.",
  },
  {
    id: "team-training",
    title: "Team Training",
    status: "Validated development system",
    icon: BadgeCheck,
    signal: "Performance is trained before it is expected.",
    requirement: "Develop people quickly through onboarding, standards, routines, and practical coaching.",
    evidence: "Created onboarding, daily learning modules, practical exercises, and clearer standards so new profiles could become operational faster.",
    transfer: "Can help build a stronger talent bench and make performance expectations easier to repeat across the team.",
  },
  {
    id: "business-development",
    title: "Business Development",
    status: "Validated sales traction",
    icon: Trophy,
    signal: "Create opportunity instead of waiting for perfect demand.",
    requirement: "Drive business development through field activity, account opening, and practical commercial follow-through.",
    evidence: "Used candidate-led selling, account opening, field prospecting, and problem solving to create commercial movement in difficult markets.",
    transfer: "Supports growth targets by turning field information into action, opportunities, and measurable traction.",
  },
  {
    id: "market-intelligence",
    title: "Market Intelligence",
    status: "Validated market reading",
    icon: Eye,
    signal: "Read territory signals, resistance, competitors, and local constraints.",
    requirement: "Evaluate market conditions, competitive pressure, local blockers, and customer dynamics that affect execution.",
    evidence: "Entered unfamiliar markets, understood local resistance, adapted the commercial message, and converted blockers into traction.",
    transfer: "Helps read a territory quickly and adjust priorities before execution gaps become performance gaps.",
  },
  {
    id: "analytical-discipline",
    title: "Analytical Discipline",
    status: "Validated KPI rhythm",
    icon: Brain,
    signal: "Turn activity into visible priorities, metrics, and follow-up.",
    requirement: "Use KPIs, process discipline, and follow-up rhythms to make performance visible and actionable.",
    evidence: "Built indicators around visits, candidate pools, submissions, client development, and branch-level performance.",
    transfer: "Connects field execution to measurable priorities, productivity, profitability, and management decisions.",
  },
  {
    id: "communication-impact",
    title: "Communication Impact",
    status: "Validated alignment skill",
    icon: MessageSquareMore,
    signal: "Align teams, clients, candidates, peers, and leadership around action.",
    requirement: "Communicate across functions, align stakeholders, share priorities, and move decisions into action.",
    evidence: "Worked across operational teams, managers, clients, candidates, and executives to clarify priorities and move decisions forward.",
    transfer: "Supports cross-functional execution by reducing ambiguity and keeping teams aligned around the next action.",
  },
  {
    id: "execution-excellence",
    title: "Execution Excellence",
    status: "Validated operating pattern",
    icon: Cog,
    signal: "Convert strategy into field rhythm, standards, and practical delivery.",
    requirement: "Turn strategy into field rhythm, standards, planning, follow-up, and practical delivery.",
    evidence: "Built repeatable routines, launch systems, territory coverage habits, and operating tools that made execution easier to sustain.",
    transfer: "Brings a builder pattern: structure the rhythm, clarify the standard, and make execution repeatable.",
  },
] as const;

const archiveDomains = [
  {
    id: "build",
    n: "01",
    title: "Build Territories",
    count: "3 cases",
    icon: MapPin,
    caseIds: ["first-agency", "region-13-agencies", "agency-launch-system"],
    accent: "blue",
  },
  {
    id: "people",
    n: "02",
    title: "Develop People",
    count: "4 cases",
    icon: Users,
    caseIds: ["assistant-branch-manager", "accountability-without-micro", "stopped-recruiting-experience", "resistance-change"],
    accent: "red",
  },
  {
    id: "solve",
    n: "03",
    title: "Solve Field Problems",
    count: "3 cases",
    icon: Lightbulb,
    caseIds: ["center-parcs", "beauval-waiter", "assumptions-recruitment"],
    accent: "gold",
  },
  {
    id: "systems",
    n: "04",
    title: "Create Systems",
    count: "3 cases",
    icon: Cog,
    caseIds: ["staffing-platform", "ceo-digital-solution", "thales-traceability"],
    accent: "steel",
  },
  {
    id: "pressure",
    n: "05",
    title: "Execute Under Pressure",
    count: "3 cases",
    icon: Gauge,
    caseIds: ["fitness-club", "training-organization", "us-service-business"],
    accent: "dark",
  },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function documentHref(documentId: "resume" | "wingfinder-report" | "wingfinder-passport", directHref: string) {
  return getTrackedDocumentHref(documentId, directHref);
}

function trackingId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function App() {
  const [openedForces, setOpenedForces] = useState<string[]>([]);
  const [clearedFlags, setClearedFlags] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const allForcesOpen = openedForces.length === wingForces.length;
  const allFlagsClear = clearedFlags.length === objections.length;
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 44 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 84%" },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.to(el, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      gsap.utils.toArray<HTMLVideoElement>("[data-scrub-video]").forEach((video) => {
        const scene = video.closest<HTMLElement>("[data-scrub-scene]");
        if (!scene) return;

        const setupScrub = () => {
          if (!Number.isFinite(video.duration) || video.duration <= 0) return;
          const startAt = Number(video.dataset.scrubStart ?? 0);
          const endOffset = Number(video.dataset.scrubEndOffset ?? 0.05);
          const endAt = Math.max(startAt + 0.1, video.duration - endOffset);
          video.pause();
          video.currentTime = startAt;

          ScrollTrigger.create({
            trigger: scene,
            start: "top top",
            end: "+=220%",
            scrub: 0.35,
            onUpdate: (self) => {
              const targetTime = startAt + (endAt - startAt) * self.progress;
              if (Math.abs(video.currentTime - targetTime) > 0.03) {
                video.currentTime = targetTime;
              }
            },
          });
        };

        if (video.readyState >= 1) setupScrub();
        else video.addEventListener("loadedmetadata", setupScrub, { once: true });
      });

      gsap.utils.toArray<HTMLImageElement>("[data-frame-sequence]").forEach((image) => {
        const scene = image.closest<HTMLElement>("[data-frame-scene]");
        if (!scene) return;

        const count = Number(image.dataset.frameCount ?? 0);
        const base = image.dataset.frameBase ?? "";
        if (!count || !base) return;

        const frameSrc = (index: number) => `${base}/frame_${String(index + 1).padStart(4, "0")}.jpg`;
        image.src = frameSrc(0);

        for (let i = 1; i < Math.min(count, 18); i += 1) {
          const preloader = new Image();
          preloader.src = frameSrc(i);
        }

        ScrollTrigger.create({
          trigger: scene,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.25,
          onUpdate: (self) => {
            const index = Math.min(count - 1, Math.floor(self.progress * (count - 1)));
            const nextSrc = frameSrc(index);
            if (!image.src.endsWith(nextSrc)) image.src = nextSrc;
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const navItems = useMemo(
    () => [
      ["Experience", "#experience"],
      ["Proof", "#proof"],
      ["Gap Review", "#red-flags"],
      ["Decision", "#decision"],
    ],
    [],
  );

  useEffect(() => {
    const update = () => setHasScrolled(window.scrollY > 36);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const handleForceOpen = (force: WingForce) => {
    setOpenedForces((current) =>
      current.includes(force.id) ? current : [...current, force.id],
    );
    trackEvent("proof_validated", {
      proofId: `wingforce-${force.id}`,
      requirement: force.title,
      label: force.edition,
    });
    setModal({ type: "force", item: force });
  };

  const clearFlag = (title: string) => {
    setClearedFlags((current) => (current.includes(title) ? current : [...current, title]));
  };

  return (
    <div className="app" ref={rootRef}>
      <header className={hasScrolled ? "topbar scrolled" : "topbar"}>
        <a href="#top" className="brand" aria-label="Back to top">
          <img src={assets.logo} alt="" />
          <span>Eddy Sallault</span>
        </a>
        <button className="icon-button mobile-only" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X /> : <Menu />}
          <span className="sr-only">Toggle navigation</span>
        </button>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main id="top">
        <Hero />
        <CansIntro />
        <WingfinderPack
          openedForces={openedForces}
          allForcesOpen={allForcesOpen}
          onOpen={handleForceOpen}
        />
        <ProfileScanner />
        <CandidateBadgeScanner setModal={setModal} />
        <CareerProofs setModal={setModal} />
        <ObjectionWall
          clearedFlags={clearedFlags}
          allFlagsClear={allFlagsClear}
          onClear={clearFlag}
          setModal={setModal}
        />
        <FinalDecision setModal={setModal} allFlagsClear={allFlagsClear} />
      </main>
      <SharedInvitationPrompt />
      <Modal modal={modal} setModal={setModal} />
    </div>
  );
}

function Hero() {
  return (
    <section className="hero section" id="experience" data-track-section="hero">
      <div className="hero-bg" data-parallax>
        <img src={assets.wingsAvailable} alt="" />
      </div>
      <div className="hero-content" data-reveal>
        <p className="eyebrow">Interactive application | {contact.role}</p>
        <h1>Do you have a pair of wings available?</h1>
        <p className="hero-copy">
          I am Eddy Sallault. I built this application the way I work: with energy,
          structure, creativity, field proof, and a clear sense of execution.
        </p>
      </div>
      <button
        className="scroll-cue"
        aria-label="Scroll to Wingfinder intro"
        onClick={() => scrollToId("cans")}
      >
        <ArrowDown />
      </button>
    </section>
  );
}

function CansIntro() {
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const replayTimers: number[] = [];
    const videos = [backgroundVideoRef.current, mainVideoRef.current].filter(Boolean) as HTMLVideoElement[];
    const replayAfterDelay = (video: HTMLVideoElement) => {
      const timer = window.setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => undefined);
      }, 3000);
      replayTimers.push(timer);
    };
    const handlers = videos.map((video) => {
      const handler = () => replayAfterDelay(video);
      video.addEventListener("ended", handler);
      return { video, handler };
    });

    return () => {
      replayTimers.forEach((timer) => window.clearTimeout(timer));
      handlers.forEach(({ video, handler }) => video.removeEventListener("ended", handler));
    };
  }, []);

  return (
    <section className="video-hero-section cans-hero-video" id="cans" data-track-section="evidence-validation">
      <div className="video-hero-stage">
        <video
          ref={backgroundVideoRef}
          className="video-hero-bg"
          src={assets.cansVideo}
          poster={assets.cansPoster}
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
        />
        <video
          ref={mainVideoRef}
          className="video-hero-main"
          src={assets.cansVideo}
          poster={assets.cansPoster}
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-label="Red Bull cans moving into the Wingfinder pack"
        />
      </div>
    </section>
  );
}

function WingfinderPack({
  openedForces,
  allForcesOpen,
  onOpen,
}: {
  openedForces: string[];
  allForcesOpen: boolean;
  onOpen: (force: WingForce) => void;
}) {
  return (
    <section className="section pack-section" data-track-section="evidence-validation">
      <div className="section-heading" data-reveal>
        <p className="eyebrow">Open the energy. Read the proof.</p>
        <h2>The Wingfinder Pack</h2>
        <p className="wingfinder-context">
          Based on the Wingfinder profile, this is what Red Bull&apos;s own framework says
          about how I work: drive, creativity, connections, and thinking. Each can opens
          the proof behind the signal.
        </p>
      </div>
      <div className="force-grid">
        {wingForces.map((force) => {
          const Icon = force.icon;
          const isOpen = openedForces.includes(force.id);
          return (
            <button
              key={force.id}
              className={isOpen ? "force-card open" : "force-card"}
              onClick={() => onOpen(force)}
              data-reveal
            >
              <span className="can-glow" />
              <img className="can-image" src={force.canImage} alt={`${force.edition} Red Bull can`} />
              <strong>{force.title}</strong>
              <em>{force.edition}</em>
              <small>{force.label}</small>
              <span className="force-icon">
                <Icon size={22} />
              </span>
              <span className="unlock">{isOpen ? "Unlocked" : "Open can"}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {allForcesOpen && (
          <motion.div
            className="unlocked-banner"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Check />
            Energy unlocked. Now let&apos;s scan the profile.
            <a href="#scan">Scan the profile</a>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProfileScanner() {
  const [visibleRequirements, setVisibleRequirements] = useState(0);
  const [requirementsComplete, setRequirementsComplete] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStartedRef = useRef(false);
  const isMobile = useMediaQuery("(max-width: 760px)");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !sceneRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".assignment-video",
        { scale: 1.08, y: 64 },
        {
          scale: 1.04,
          y: 64,
          duration: 1.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top 75%",
            once: true,
          },
        },
      );
    }, sceneRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const stage = sceneRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle("assignment-in-view", entry.isIntersecting);
        if (entry.isIntersecting && !hasStartedRef.current && videoRef.current) {
          hasStartedRef.current = true;
          setVisibleRequirements(0);
          setRequirementsComplete(false);
          if (isMobile) {
            window.setTimeout(() => {
              setVisibleRequirements(assignmentHighlights.length);
              setRequirementsComplete(true);
            }, 180);
          }
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => undefined);
        }
      },
      { threshold: 0.55 },
    );

    observer.observe(stage);

    return () => {
      document.body.classList.remove("assignment-in-view");
      observer.disconnect();
    };
  }, [isMobile]);

  useEffect(() => {
    if (visibleRequirements === 0 || !sceneRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const activeRequirement = assignmentHighlights[visibleRequirements - 1];
    if (!activeRequirement) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.assignment-callout.callout-${activeRequirement.id}, .assignment-target.target-${activeRequirement.id}`,
        { autoAlpha: 0, y: 22, scale: 0.92 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.46, ease: "back.out(1.7)" },
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [visibleRequirements]);

  const updateRequirements = (video: HTMLVideoElement) => {
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 10.08;
    const progress = Math.min(video.currentTime / duration, 1);
    if (progress < 0.08) {
      if (isMobile) return;
      setVisibleRequirements(0);
      return;
    }
    if (isMobile) {
      setVisibleRequirements(assignmentHighlights.length);
      setRequirementsComplete(true);
      return;
    }
    const nextVisible = Math.min(
      assignmentHighlights.length,
      Math.max(1, Math.ceil(((progress - 0.08) / 0.9) * assignmentHighlights.length)),
    );
    setVisibleRequirements((current) => Math.max(current, nextVisible));
    if (progress > 0.985) {
      setRequirementsComplete(true);
    }
  };

  return (
    <section className="validation-section assignment-section" id="scan" data-track-section="role-blueprint">
      <div className={requirementsComplete ? "assignment-stage complete" : "assignment-stage"} ref={sceneRef}>
        <video
          ref={videoRef}
          className="assignment-video"
          src={assets.presentationVideo}
          muted
          playsInline
          preload="metadata"
          onTimeUpdate={(event) => updateRequirements(event.currentTarget)}
          onEnded={(event) => {
            updateRequirements(event.currentTarget);
            setRequirementsComplete(true);
          }}
        />
        <span className="assignment-shade" aria-hidden="true" />
        <span className="assignment-energy-line" aria-hidden="true" />

        <div className="assignment-reveal">
          <div className="assignment-brand" aria-label="Red Bull Sales Leadership">
            <img src={assets.logo} alt="" />
            <strong>Red Bull</strong>
            <span>Sales Leadership</span>
          </div>

          <div className="assignment-kicker">
            <Sparkles size={16} />
            {requirementsComplete ? "Requirements loaded" : "Requirements loading"}
          </div>

          <h2 className="assignment-title" aria-label="Wing assignment blueprint">
            <span>Wing Assignment Blueprint</span>
          </h2>

          <p className="assignment-copy">
            Before assigning wings, validate the operating pattern.
          </p>

          <div className="assignment-blueprint" aria-label="General Sales Manager role requirements">
            <svg className="assignment-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {(isMobile ? assignmentHighlights : assignmentHighlights.slice(0, visibleRequirements)).map((item) => (
                <line
                  key={`${item.id}-connector`}
                  className={`assignment-connector-line connector-${item.id}`}
                  x1={item.lineStart.x}
                  y1={item.lineStart.y}
                  x2={item.target.x}
                  y2={item.target.y}
                />
              ))}
            </svg>
            {(isMobile ? assignmentHighlights : assignmentHighlights.slice(0, visibleRequirements)).map((item) => {
              const Icon = item.icon;
              return (
                <Fragment key={item.title}>
                  <span
                    className={`assignment-target target-${item.id}`}
                    style={
                      {
                        "--target-x": `${item.target.x}%`,
                        "--target-y": `${item.target.y}%`,
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  />
                  <div className={`assignment-callout callout-${item.id}`}>
                    <span className="assignment-callout-icon">
                      <Icon size={22} />
                    </span>
                    <span className="assignment-callout-copy">
                      <strong>{item.title}</strong>
                      <small>{item.text}</small>
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </div>

          <AnimatePresence>
            {requirementsComplete && (
              <div className="assignment-footer">
                <span>
                  This is the role blueprint. Use it as the reference standard before validating any candidate.
                </span>
              <button
                className="assignment-next"
                onClick={() => scrollToId("profile-scan")}
                data-track-click="cta_click"
                data-track-id="scan-candidate-badge"
                data-track-label="Scan Candidate Badge"
              >
                  <BadgeCheck size={17} />
                  Scan Candidate Badge
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {!requirementsComplete && (
          <div className="assignment-loading" aria-live="polite">
            <Play size={16} />
            Loading role requirements
          </div>
        )}
      </div>
    </section>
  );
}

function CandidateBadgeScanner({ setModal }: { setModal: (modal: ModalState) => void }) {
  const [scanStarted, setScanStarted] = useState(false);
  const [validatedCount, setValidatedCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openedCriteria, setOpenedCriteria] = useState<string[]>([]);
  const stageRef = useRef<HTMLElement>(null);
  const scanStartedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const activeModule = activeIndex >= 0 ? candidateScanCriteria[activeIndex] : candidateScanCriteria[0];
  const complete = validatedCount === candidateScanCriteria.length;
  const progress = Math.round((validatedCount / candidateScanCriteria.length) * 100);
  const openCriterion = (module: (typeof candidateScanCriteria)[number]) => {
    setOpenedCriteria((current) => (current.includes(module.id) ? current : [...current, module.id]));
    trackEvent("proof_validated", {
      proofId: module.id,
      requirement: module.requirement,
    });
    setModal({ type: "criterion", item: module });
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const clearTimers = () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };

    const startScan = () => {
      if (scanStartedRef.current) return;
      scanStartedRef.current = true;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setScanStarted(true);

      if (reduceMotion) {
        setActiveIndex(candidateScanCriteria.length - 1);
        setValidatedCount(candidateScanCriteria.length);
        return;
      }

      candidateScanCriteria.forEach((_, index) => {
        const activateTimer = window.setTimeout(() => {
          setActiveIndex(index);
        }, 520 + index * 760);
        const validateTimer = window.setTimeout(() => {
          setValidatedCount(index + 1);
        }, 980 + index * 760);
        timersRef.current.push(activateTimer, validateTimer);
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startScan();
      },
      { threshold: 0.16, rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(stage);

    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, []);

  return (
    <section
      ref={stageRef}
      className={complete ? "candidate-scan-section complete" : scanStarted ? "candidate-scan-section scanning" : "candidate-scan-section"}
      id="profile-scan"
      data-track-section="candidate-scan"
    >
      <div className="candidate-scan-shell">
        <div className="candidate-scan-heading">
          <p className="eyebrow">Candidate badge scan</p>
          <h2>Eddy Sallault Validation Scan</h2>
          <p>
            The role blueprint is loaded. Now the candidate badge passes through the evidence scanner.
          </p>
        </div>

        <div className="candidate-scan-grid">
          <aside className="candidate-criteria left">
            {candidateScanCriteria.slice(0, 4).map((module, index) => (
              <CandidateCriterion
                key={module.id}
                module={module}
                index={index}
                activeIndex={activeIndex}
                validatedCount={validatedCount}
                openedCriteria={openedCriteria}
                openCriterion={openCriterion}
              />
            ))}
          </aside>

          <div className="candidate-badge-bay" aria-label="Candidate badge scanner">
            <span className="scanner-gate" aria-hidden="true" />
            <span className="candidate-scan-beam" aria-hidden="true" />
            <article className="candidate-badge">
              <div className="candidate-badge-head">
                <span>
                  <strong>Candidate Badge</strong>
                  <small>Sales Leadership</small>
                </span>
                <img src={assets.logo} alt="" />
              </div>
              <div className="candidate-badge-photo">
                <img src="/assets/images/portrait.png" alt="Eddy Sallault candidate portrait" />
              </div>
              <div className="candidate-badge-info">
                <h3>Eddy<br />Sallault</h3>
                <p>Field Builder / Team Leader / Growth Operator</p>
                <span className="candidate-barcode" aria-hidden="true" />
              </div>
            </article>
            <div className="candidate-scan-status">
              <strong>{complete ? "Profile match confirmed" : scanStarted ? `Scanning ${activeIndex + 1 || 1} / ${candidateScanCriteria.length}` : "Awaiting badge"}</strong>
              <span>{complete ? "Competency matrix complete" : activeModule.status}</span>
              <div className="candidate-progress" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <aside className="candidate-criteria right">
            {candidateScanCriteria.slice(4).map((module, offset) => {
              const index = offset + 4;
              return (
                <CandidateCriterion
                  key={module.id}
                  module={module}
                  index={index}
                  activeIndex={activeIndex}
                  validatedCount={validatedCount}
                  openedCriteria={openedCriteria}
                  openCriterion={openCriterion}
                />
              );
            })}
          </aside>
        </div>

        <AnimatePresence>
          {complete && (
            <motion.div
              className="candidate-scan-complete"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <BadgeCheck size={18} />
              Candidate competencies validated. Open the proof archive.
              <button
                className="assignment-next"
                onClick={() => scrollToId("proof")}
                data-track-click="cta_click"
                data-track-id="open-proof-archive"
                data-track-label="Open Proof Archive"
              >
                Open Proof Archive
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function CandidateCriterion({
  module,
  index,
  activeIndex,
  validatedCount,
  openedCriteria,
  openCriterion,
}: {
  module: (typeof candidateScanCriteria)[number];
  index: number;
  activeIndex: number;
  validatedCount: number;
  openedCriteria: string[];
  openCriterion: (module: (typeof candidateScanCriteria)[number]) => void;
}) {
  const Icon = module.icon;
  const validated = index < validatedCount;
  const active = index === activeIndex && !validated;
  const opened = openedCriteria.includes(module.id);

  return (
    <button
      className={[
        "candidate-criterion",
        active ? "active" : "",
        validated ? "validated" : "",
        opened ? "opened" : "",
      ].join(" ")}
      onClick={() => {
        if (validated) openCriterion(module);
      }}
      data-proof-id={module.id}
      data-track-label={module.title}
      disabled={!validated}
    >
      <span className="candidate-criterion-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="candidate-criterion-icon">
        <Icon size={18} />
      </span>
      <span className="candidate-criterion-copy">
        <strong>{module.title}</strong>
        <small>{module.signal}</small>
      </span>
      <em>{opened ? "Opened" : validated ? "Tap to open" : active ? "Scanning" : "Locked"}</em>
    </button>
  );
}

function VideoHero({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  return (
    <section className={`video-hero-section ${className}`}>
      <div className="video-hero-stage">
        <video
          className="video-hero-bg"
          src={src}
          poster={poster}
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
        />
        <video
          className="video-hero-main"
          src={src}
          poster={poster}
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-label={label}
        />
      </div>
    </section>
  );
}

function CareerProofs({ setModal }: { setModal: (modal: ModalState) => void }) {
  const archiveRef = useRef<HTMLElement | null>(null);
  const archiveCompletedRef = useRef(false);
  const isMobile = useMediaQuery("(max-width: 760px)");
  const [activeDomainId, setActiveDomainId] = useState<(typeof archiveDomains)[number]["id"]>("build");
  const [openedDomains, setOpenedDomains] = useState<string[]>([]);
  const activeDomain = archiveDomains.find((domain) => domain.id === activeDomainId) ?? archiveDomains[0];
  const domainCases = activeDomain.caseIds
    .map((id) => caseStudies.find((story) => story.id === id))
    .filter((story): story is CaseStudy => Boolean(story));
  const [activeCaseId, setActiveCaseId] = useState<string>(activeDomain.caseIds[0]);

  useEffect(() => {
    setActiveCaseId(activeDomain.caseIds[0]);
  }, [activeDomainId, activeDomain.caseIds]);

  const activeCase = domainCases.find((story) => story.id === activeCaseId) ?? domainCases[0] ?? caseStudies[0];
  const activeIndex = caseStudies.findIndex((story) => story.id === activeCase.id);
  const activeDomainIndex = archiveDomains.findIndex((domain) => domain.id === activeDomain.id);
  const archiveBaseNumber = archiveDomains
    .slice(0, Math.max(0, activeDomainIndex))
    .reduce((sum, domain) => sum + domain.caseIds.length, 0);
  const archiveNumberFor = (index: number) => String(archiveBaseNumber + index + 1).padStart(2, "0");
  const activeArchiveNumber = archiveNumberFor(Math.max(0, domainCases.findIndex((story) => story.id === activeCase.id)));
  const proofTriplet = activeCase.proof.slice(0, 3);
  const nextDomainToReview = archiveDomains.find((domain) => !openedDomains.includes(domain.id));
  const allDomainsReviewed = openedDomains.length === archiveDomains.length;
  const openDomain = (domainId: (typeof archiveDomains)[number]["id"]) => {
    setActiveDomainId(domainId);
    setOpenedDomains((current) => (current.includes(domainId) ? current : [...current, domainId]));
  };
  const openCaseModal = (story: CaseStudy) => {
    trackEvent("case_article_open", {
      caseId: story.id,
      articleTitle: story.title,
    });
    setModal({ type: "case", item: story });
  };

  useEffect(() => {
    const archive = archiveRef.current;
    if (!archive) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle("proof-archive-in-view", entry.isIntersecting);
      },
      { threshold: 0.42 },
    );

    observer.observe(archive);

    return () => {
      document.body.classList.remove("proof-archive-in-view");
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!allDomainsReviewed || archiveCompletedRef.current) return;
    archiveCompletedRef.current = true;
    const timer = window.setTimeout(() => scrollToId("red-flags"), 900);
    return () => window.clearTimeout(timer);
  }, [allDomainsReviewed]);

  return (
    <section className="proof-archive-section" id="proof" ref={archiveRef} data-track-section="proof-archive">
      <div className="archive-bg" aria-hidden="true" />
      <div className={`archive-shell archive-accent-${activeDomain.accent}`}>
        <div className="archive-topline">
          <span>Field Case Archive</span>
          <em>| Eddy Sallault</em>
        </div>

        <div className="archive-header" data-reveal>
          <div className="archive-logo-lockup">
            <img src={assets.logo} alt="" />
          </div>
          <div className="archive-title-block">
            <h2>Proof Archive Unlocked</h2>
            <strong>Sixteen complete cases. One operating pattern.</strong>
            <p>
              Click the blinking domain to review it. Once validated, the next domain lights up.
              When all five are reviewed, the file moves to the gap review.
            </p>
          </div>
          <div className="archive-status">
            <span>{allDomainsReviewed ? "Archive Validated" : "Review Sequence"}</span>
            <small>{openedDomains.length} / {archiveDomains.length} domains reviewed</small>
            {allDomainsReviewed ? <Check size={34} /> : <FileText size={34} />}
          </div>
        </div>

        <div className="archive-metrics" data-reveal>
          <span><FileText size={18} /><b>16</b> Evidence files unlocked</span>
          <span><b>5</b> Operating domains</span>
          <span><b>1</b> Consistent pattern</span>
          <span><img src={assets.logo} alt="" /> Built for field leadership</span>
        </div>

        <div className="mobile-archive-flow archive-accent-red" data-reveal>
          <div className="mobile-archive-guide">
            <strong>Follow the blinking domain</strong>
            <span>Tap each domain once. Reviewed domains stay validated.</span>
          </div>
          <div className="mobile-archive-tabs" aria-label="Proof domains">
            <div className="mobile-archive-marquee-track">
              {[...archiveDomains, ...archiveDomains].map((domain, loopIndex) => {
                const Icon = domain.icon;
                const active = domain.id === activeDomain.id;
                const visited = openedDomains.includes(domain.id);
                const guideNext = domain.id === nextDomainToReview?.id;
                return (
                  <button
                    key={`${domain.id}-${loopIndex}`}
                    className={[
                      "mobile-archive-tab",
                      `archive-accent-${domain.accent}`,
                      active ? "active" : "",
                      visited ? "visited" : "",
                      guideNext ? "guide-next" : "",
                    ].join(" ")}
                    onClick={() => openDomain(domain.id)}
                  >
                    <span>{domain.n}</span>
                    <Icon size={16} />
                    <strong>{domain.title}</strong>
                  </button>
                );
              })}
            </div>
          </div>
          <section className={`mobile-archive-picker archive-accent-${activeDomain.accent}`}>
            <div className="mobile-archive-picker-heading">
              <span>{activeDomain.n}</span>
              <strong>{activeDomain.title}</strong>
              <small>{activeDomain.count}</small>
            </div>
            <div className="mobile-archive-case-list">
              {domainCases.map((story, index) => {
                const storyActive = story.id === activeCase.id;
                return (
                  <button
                    key={story.id}
                    className={storyActive ? "active" : ""}
                    onClick={() => {
                      setActiveCaseId(story.id);
                      trackEvent("case_file_open", {
                        caseId: story.id,
                        caseTitle: story.title,
                      });
                      window.setTimeout(() => {
                        document.querySelector(".mobile-archive-detail")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 80);
                    }}
                  >
                    <span>Case {archiveNumberFor(index)}</span>
                    <strong>{story.title}</strong>
                    <small>{story.catLabel}</small>
                  </button>
                );
              })}
            </div>
          </section>
          <article className={`mobile-archive-detail archive-accent-${activeDomain.accent}`}>
            <img src={caseImageMap[activeCase.id] ?? activeCase.img} alt="" />
            <span>Case {activeArchiveNumber} / 16</span>
            <h3>{activeCase.title}</h3>
            <p>{activeCase.subtitle}</p>
            <div>
              {proofTriplet.map((proof, index) => (
                <section key={proof}>
                  <strong>{index === 0 ? "Situation" : index === 1 ? "Action" : "Result"}</strong>
                  <p>{proof}</p>
                </section>
              ))}
            </div>
            <button onClick={() => openCaseModal(activeCase)}>
              Read full case
              <ArrowDown size={18} />
            </button>
          </article>
        </div>

        <div className="archive-grid" data-reveal>
          <aside className="archive-categories">
            <div className="archive-panel-heading">
              <strong>Archive Categories</strong>
              <span>{allDomainsReviewed ? "All operating domains validated." : "Click the blinking domain to validate the archive."}</span>
            </div>
            {archiveDomains.map((domain) => {
              const Icon = domain.icon;
              const active = domain.id === activeDomain.id;
              const visited = openedDomains.includes(domain.id);
              const guideNext = domain.id === nextDomainToReview?.id;
              return (
                <button
                  key={domain.id}
                  className={[
                    "archive-domain",
                    domain.accent,
                    active ? "active" : "",
                    visited ? "visited" : "",
                    guideNext ? "guide-next" : "",
                  ].join(" ")}
                  onClick={() => {
                    openDomain(domain.id);
                    trackEvent("case_file_open", {
                      caseId: domain.id,
                      caseTitle: domain.title,
                    });
                  }}
                >
                  <span className="archive-domain-number">{domain.n}</span>
                  <Icon size={34} />
                  <span className="archive-domain-copy">
                    <strong>{domain.title}</strong>
                    <small>{domain.count}</small>
                  </span>
                  <em>{visited ? "Validated" : guideNext ? "Click" : "Open"}</em>
                  <ArrowDown className="archive-domain-arrow" size={22} />
                </button>
              );
            })}
            <div className="archive-mission">
              <strong>Mission: turn strategy into results.</strong>
              <span>People. Territory. Execution.</span>
            </div>
          </aside>

          <aside className="archive-case-list">
            <div className="archive-domain-title">
              <span>{activeDomain.n}</span>
              <strong>{activeDomain.title}</strong>
              <small>{activeDomain.count}</small>
            </div>
            {domainCases.map((story, index) => {
              const active = story.id === activeCase.id;
              return (
                <button
                  key={story.id}
                  className={active ? "archive-case-link active" : "archive-case-link"}
                  onClick={() => {
                    setActiveCaseId(story.id);
                    trackEvent("case_file_open", {
                      caseId: story.id,
                      caseTitle: story.title,
                    });
                  }}
                >
                  <span>Case {archiveNumberFor(index)}</span>
                  <strong>{story.title}</strong>
                  <FileText size={22} />
                </button>
              );
            })}
            <button className="archive-view-all" onClick={() => openCaseModal(activeCase)}>
              <FileText size={16} />
              View full selected case
            </button>
          </aside>

          <motion.article
            className="archive-detail"
            key={activeCase.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="archive-detail-hero">
              <img src={caseImageMap[activeCase.id] ?? activeCase.img} alt="" />
              <div>
                <span>Case {activeArchiveNumber}</span>
                <em>{activeCase.catLabel}</em>
                <h3>{activeCase.title}</h3>
                <p>{activeCase.subtitle}</p>
              </div>
            </div>

            <div className="archive-proof-row">
              {proofTriplet.map((proof, index) => (
                <div key={proof}>
                  <span>{index === 0 ? "Situation" : index === 1 ? "Action" : "Result"}</span>
                  <p>{proof}</p>
                </div>
              ))}
            </div>

            <div className="archive-requirement">
              <span><Check size={18} /> Red Bull requirement matched</span>
              <p>{activeCase.takeaway}</p>
            </div>

            <div className="archive-story-cta">
              <div className="archive-mini-cover">
                <img src={caseImageMap[activeCase.id] ?? activeCase.img} alt="" />
                <span>Field<br />Case<br />Study</span>
                <small>{Math.max(4, Math.min(8, activeIndex + 4))} min read</small>
              </div>
              <div>
                <strong>Full Field Story</strong>
                <p>The complete story with context, decisions, and lessons learned.</p>
                <button className="archive-read-case" onClick={() => openCaseModal(activeCase)}>
                  Read full case
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>
          </motion.article>
        </div>

        <div className={isMobile ? "archive-footer mobile-priority" : "archive-footer"}>
          <div>
            <BadgeCheck size={22} />
            <span>You don&apos;t need to read all sixteen. They are here if you want to go deeper.</span>
          </div>
          <button
            onClick={() => allDomainsReviewed && scrollToId("red-flags")}
            disabled={!allDomainsReviewed}
            data-track-click="cta_click"
            data-track-id="next-section-unlocked"
            data-track-label={allDomainsReviewed ? "Next Section Unlocked" : "Review all domains"}
          >
            {allDomainsReviewed ? "Next Section Unlocked" : "Review all domains to unlock"}
            <ArrowDown size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ObjectionWall({
  clearedFlags,
  allFlagsClear,
  onClear,
  setModal,
}: {
  clearedFlags: string[];
  allFlagsClear: boolean;
  onClear: (title: string) => void;
  setModal: (modal: ModalState) => void;
}) {
  const flagsRef = useRef<HTMLElement | null>(null);
  const [activeFlag, setActiveFlag] = useState<(typeof objections)[number] | null>(null);
  const isCleared = activeFlag ? clearedFlags.includes(activeFlag.title) : false;
  const activeIndex = activeFlag ? objections.findIndex((flag) => flag.title === activeFlag.title) : -1;
  const clearedCount = clearedFlags.length;
  const activeProofMap: Record<string, string> = {
    "No direct retail / DSD background?": "first-agency",
    "Can I earn credibility with a Red Bull field team?": "assistant-branch-manager",
    "Not based in Ottawa yet?": "region-13-agencies",
    "Work authorization?": "us-service-business",
  };
  const activeProof =
    caseStudies.find((story) => story.id === (activeFlag ? activeProofMap[activeFlag.title] : "first-agency")) ?? caseStudies[0];
  const activeProofImage = caseImageMap[activeProof.id] ?? activeProof.img;
  const flagDetails: Record<string, {
    recruiterQuestion: string;
    currentReality: string;
    whyLegitimate: string;
    closesGap: string[];
    needFromRedBull: string[];
    bringImmediately: string;
    sideNote: string;
  }> = {
    "No direct retail / DSD background?": {
      recruiterQuestion: "Can a candidate without six years of direct retail / DSD experience become effective fast enough in this role?",
      currentReality: "Correct. I do not come from a traditional DSD or retail distribution background. I will not pretend otherwise.",
      whyLegitimate:
        "That requirement exists for a reason. A retail / DSD profile already knows route logic, store execution standards, category vocabulary, field constraints, customer rhythm, and the team's daily reality.",
      closesGap: [
        "Focused field immersion with Strikers and field team members to understand daily work, pressure points, standards, and blockers.",
        "Time with sales leaders to understand territory priorities, account rhythm, volume expectations, and execution discipline.",
        "A practical field file covering route logic, store standards, team routines, KPIs, account priorities, vocabulary, blockers, and coaching points.",
      ],
      needFromRedBull: [
        "Access to field ride-alongs and store execution observation.",
        "Clear definition of what great execution looks like in the Ottawa market.",
        "Early calibration with my manager and a peer sales leader.",
      ],
      bringImmediately:
        "The leadership side is already built: field management, team coaching, territory building, business development, accountability routines, training systems, and execution under pressure.",
      sideNote:
        "If Red Bull needs a leader who can learn the retail mechanics fast and bring structure, energy, and execution discipline, this gap is manageable.",
    },
    "Can I earn credibility with a Red Bull field team?": {
      recruiterQuestion: "Will a team accept leadership from someone who does not come from their exact industry?",
      currentReality: "Credibility would not be automatic. It would need to be earned.",
      whyLegitimate:
        "Field teams quickly detect whether a leader understands their reality or is only managing from a distance. If I arrive pretending to know their job better than they do, I lose credibility.",
      closesGap: [
        "Respect the field first and understand each role before asking for performance.",
        "Learn what makes execution difficult, where standards break down, and what support the team actually needs.",
        "Avoid generic management language and avoid comparing staffing to retail as if they were the same business.",
      ],
      needFromRedBull: [
        "Direct exposure to team routines, route days, and store-level execution.",
        "Honest feedback from field team members and sales leaders during onboarding.",
        "Clear standards for average versus excellent execution.",
      ],
      bringImmediately:
        "My proven pattern is to create clarity, rhythm, standards, feedback loops, and team ownership. I have led teams before, including people who were not always from the industry.",
      sideNote:
        "Credibility is earned by learning the work first, then bringing useful structure.",
    },
    "Not based in Ottawa yet?": {
      recruiterQuestion: "Is relocation a real plan or just a statement?",
      currentReality: "Correct. I am not in Ottawa today.",
      whyLegitimate:
        "A field leadership role needs presence, local understanding, speed, and availability. Distance cannot stay theoretical.",
      closesGap: [
        "A clear relocation plan and fast on-site availability once mutual fit is confirmed.",
        "Early mapping of first 30 / 60 / 90 days, local market learning, and territory immersion priorities.",
      ],
      needFromRedBull: [
        "Expected start timing.",
        "First on-site requirements.",
        "Onboarding rhythm and territory immersion priorities.",
        "Relocation timeline expectations.",
      ],
      bringImmediately:
        "My career already shows repeated transitions into new territories, new markets, and unfamiliar operating environments. I do not wait for a market to feel familiar before building traction.",
      sideNote: "Location is not a capability blocker. It is an execution plan.",
    },
    "Work authorization?": {
      recruiterQuestion: "Does hiring this candidate create a complex immigration issue?",
      currentReality: "This is not a heavy sponsorship issue to hide or dramatize. It is a simple LMIA-exempt route to confirm together early.",
      whyLegitimate:
        "Any employer should understand the process before moving forward with a candidate who is not already locally authorized. That is normal diligence, not a blocker.",
      closesGap: [
        "For a role outside Quebec, the official Francophone Mobility pathway is designed to let Canadian employers hire eligible French-speaking workers without an LMIA.",
        "In practice, the employer submits the job offer online in the Employer Portal, selects Mobilite Francophone code C16, pays the 230 CAD compliance fee, and gives the offer number to the candidate.",
        "Then I use that offer number to complete the work permit application with the required documents.",
      ],
      needFromRedBull: [
        "A quick Talent / HR check that the role, location, and offer fit the pathway.",
        "Basic coordination on the Employer Portal step if mutual fit is confirmed.",
        "A shared checklist so we both provide the required information cleanly.",
      ],
      bringImmediately:
        "The core conditions are already aligned: I am French, fully francophone, targeting a role outside Quebec, and prepared to provide documents quickly.",
      sideNote:
        "This is not a major obstacle. It is a straightforward process to validate together and execute cleanly.",
    },
  };
  const activeDetails = activeFlag ? flagDetails[activeFlag.title] : null;

  useEffect(() => {
    const flagsRoom = flagsRef.current;
    if (!flagsRoom) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle("flags-room-in-view", entry.isIntersecting);
      },
      { threshold: 0.42 },
    );

    observer.observe(flagsRoom);

    return () => {
      document.body.classList.remove("flags-room-in-view");
      observer.disconnect();
    };
  }, []);

  return (
    <section className="flags-section" id="red-flags" ref={flagsRef} data-track-section="gap-review-risk-control">
      <div className="flags-bg" aria-hidden="true" />
      <div className="flags-shell">
        <div className="flags-topline" data-reveal>
          <span>Gap Review / Risk Control File</span>
          <em>// Operational gap treatment</em>
        </div>
        <div className="flags-hero" data-reveal>
          <img src={assets.logo} alt="" />
          <div>
            <h2>
              Treat the gaps before assigning wings.
            </h2>
            <p>I do not treat concerns as image problems. I treat them as operating gaps: what is true, why it matters, what closes the gap, and what I can bring now.</p>
          </div>
        </div>

        <div className="mobile-flags-flow" data-reveal>
          <div className="mobile-flags-guide">
            <strong>Tap one gap file</strong>
            <span>Each file shows the concern, the current reality, and the control plan.</span>
          </div>
          {objections.map((flag, index) => {
            const Icon = flag.icon;
            const cleared = clearedFlags.includes(flag.title);
            const active = activeFlag?.title === flag.title;
            const details = flagDetails[flag.title];
            const proof =
              caseStudies.find((story) => story.id === activeProofMap[flag.title]) ?? caseStudies[0];
            const proofImage = caseImageMap[proof.id] ?? proof.img;
            return (
              <article key={flag.title} className={active ? "mobile-flag-card active" : cleared ? "mobile-flag-card cleared" : "mobile-flag-card"}>
                <button
                  className="mobile-flag-trigger"
                  onClick={(event) => {
                    const card = event.currentTarget.closest(".mobile-flag-card");
                    setActiveFlag(active ? null : flag);
                    onClear(flag.title);
                    trackEvent("gap_file_open", {
                      flagId: trackingId(flag.title),
                      title: flag.title,
                    });
                    trackEvent("gap_control_marked", {
                      flagId: trackingId(flag.title),
                      status: "cleared",
                    });
                    if (!active) {
                      window.setTimeout(() => {
                        card?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 80);
                    }
                  }}
                >
                  <span className="mobile-flag-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mobile-flag-icon">{cleared ? <Check size={22} /> : <Icon size={22} />}</span>
                  <span>
                    <strong>{flag.title}</strong>
                    <small>{cleared ? "Controlled" : active ? "Under review" : "Tap to review"}</small>
                  </span>
                  <ArrowDown size={20} />
                </button>
                {active && details && (
                  <div className="mobile-flag-detail">
                    <section>
                      <strong>Recruiter question</strong>
                      <p>{details.recruiterQuestion}</p>
                    </section>
                    <section>
                      <strong>Current reality</strong>
                      <p>{details.currentReality}</p>
                    </section>
                    <section>
                      <strong>Why the concern is legitimate</strong>
                      <p>{details.whyLegitimate}</p>
                    </section>
                    <section>
                      <strong>What closes the gap</strong>
                      <ul>
                        {details.closesGap.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <strong>What I need from Red Bull</strong>
                      <ul>
                        {details.needFromRedBull.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <strong>What I bring immediately</strong>
                      <p>{details.bringImmediately}</p>
                    </section>
                    <button
                      className="mobile-flag-proof"
                      onClick={() => {
                        trackEvent("case_article_open", {
                          caseId: proof.id,
                          articleTitle: proof.title,
                        });
                        setModal({ type: "case", item: proof });
                      }}
                    >
                      <img src={proofImage} alt="" />
                      <span>
                        <strong>Proof case {proof.n}</strong>
                        <small>{proof.title}</small>
                      </span>
                      <em>View case</em>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="flags-layout" data-reveal>
          <aside className="flag-board">
            <div className="flag-board-heading">
              <strong>Risk Control Files</strong>
              <span>Open each gap file to review the control plan.</span>
            </div>
            {objections.map((flag, index) => {
              const Icon = flag.icon;
              const cleared = clearedFlags.includes(flag.title);
              const active = activeFlag?.title === flag.title;
              return (
                <button
                  key={flag.title}
                  className={[
                    "flag",
                    cleared ? "cleared" : "under-review",
                    active ? "active" : "",
                  ].join(" ")}
                  onClick={() => {
                    setActiveFlag(flag);
                    onClear(flag.title);
                    trackEvent("gap_file_open", {
                      flagId: trackingId(flag.title),
                      title: flag.title,
                    });
                    trackEvent("gap_control_marked", {
                      flagId: trackingId(flag.title),
                      status: "cleared",
                    });
                  }}
                >
                  <span className="flag-icon">{cleared ? <Check size={28} /> : <Icon size={28} />}</span>
                  <span className="flag-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="flag-copy">
                    <strong>{flag.title}</strong>
                    <small>Status: <em>{cleared ? "Controlled" : "Under review"}</em></small>
                  </span>
                  <ArrowDown className="flag-arrow" size={20} />
                </button>
              );
            })}
          </aside>

          <motion.article
            className={isCleared ? "flag-response cleared" : "flag-response"}
            key={activeFlag?.title ?? "standby"}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {!activeFlag || !activeDetails ? (
              <div className="flag-standby">
                <span>Gap file standby</span>
                <h3>Open a gap file to see the risk control logic.</h3>
                <p>
                  This is not a defense and not a justification. Each file treats an operational gap:
                  the current reality, why the criterion exists, and what closes the distance.
                </p>
                <div className="flag-standby-grid">
                  <div>
                    <strong>01</strong>
                    Name the gap
                  </div>
                  <div>
                    <strong>02</strong>
                    Control the risk
                  </div>
                  <div>
                    <strong>03</strong>
                    Define the support
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flag-response-status">
                  <span>Gap File {String(activeIndex + 1).padStart(2, "0")}</span>
                  <em>Status <strong>{isCleared ? "Controlled" : "Under review"}</strong></em>
                </div>
                <h3>{activeFlag.title}</h3>
                <div className="flag-answer-grid">
                  <div>
                    <span>Recruiter question</span>
                    <p>{activeDetails.recruiterQuestion}</p>
                  </div>
                  <div>
                    <span>Current reality</span>
                    <p>{activeDetails.currentReality}</p>
                  </div>
                  <div>
                    <span>Why the concern is legitimate</span>
                    <p>{activeDetails.whyLegitimate}</p>
                  </div>
                  <div>
                    <span>What closes the gap</span>
                    <ul>
                      {activeDetails.closesGap.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span>What I need from Red Bull</span>
                    <ul>
                      {activeDetails.needFromRedBull.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span>What I bring immediately</span>
                    <p>{activeDetails.bringImmediately}</p>
                  </div>
                </div>
                <div className="flag-response-actions">
                  <button className="flag-back" onClick={() => setActiveFlag(null)}>
                    <ArrowDown size={18} />
                    Back to list
                  </button>
                  <button
                    className={isCleared ? "flag-clear cleared" : "flag-clear"}
                    onClick={() => {
                      onClear(activeFlag.title);
                      trackEvent("gap_control_marked", {
                        flagId: trackingId(activeFlag.title),
                        status: "cleared",
                      });
                    }}
                  >
                    {isCleared ? "Gap controlled" : "Mark gap controlled"}
                    <Check size={20} />
                  </button>
                </div>
              </>
            )}
          </motion.article>

          <aside className={activeFlag ? "flag-proof-panel" : "flag-proof-panel standby"}>
            <strong>{activeFlag ? "Relevant Proof" : "Proof on standby"}</strong>
            <button
              onClick={() => {
                trackEvent("case_article_open", {
                  caseId: activeProof.id,
                  articleTitle: activeProof.title,
                });
                setModal({ type: "case", item: activeProof });
              }}
              className="flag-proof-card"
            >
              <img src={activeProofImage} alt="" />
              <span>Case {activeProof.n} | {activeProof.catLabel}</span>
              <p>{activeProof.title}</p>
              <em>View case</em>
            </button>
            {activeDetails && (
              <blockquote>
                {activeDetails.sideNote}
                <cite>Risk control note</cite>
              </blockquote>
            )}
          </aside>
        </div>

        <div className="flags-progress">
          <div>
            <span>Clearance Progress</span>
            <strong>{clearedCount} / {objections.length}</strong>
            <small>gaps controlled</small>
          </div>
          <div className="flags-progress-track" aria-hidden="true">
            {objections.map((flag, index) => (
              <i key={flag.title} className={clearedFlags.includes(flag.title) ? "cleared" : index === activeIndex ? "active" : ""} />
            ))}
          </div>
        </div>

        <div className="flags-clearance-footer">
          <div className={allFlagsClear ? "ready" : ""}>
            <Check size={28} />
            <strong>{allFlagsClear ? "All gaps controlled." : "All gaps can be controlled"}</strong>
            <span>Before field deployment.</span>
          </div>
          <div>
            <Users size={28} />
            <strong>Transparency first.</strong>
            <span>No denial. No vague promise. Clear gap treatment.</span>
          </div>
          <button
            className={allFlagsClear ? "ready" : ""}
            onClick={() => allFlagsClear && scrollToId("decision")}
            data-track-click="cta_click"
            data-track-id="final-match-summary"
            data-track-label="Final match summary"
          >
            {allFlagsClear ? <Check size={24} /> : <ShieldCheck size={24} />}
            <strong>{allFlagsClear ? "Final match summary unlocked" : "Final match summary"}</strong>
            <span>{allFlagsClear ? "Continue to final decision bay." : "Will unlock once all concerns are cleared."}</span>
          </button>
        </div>

        <AnimatePresence>
          {allFlagsClear && (
            <motion.div
              className="unlocked-banner flags-unlocked"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Check />
              Gaps reviewed. Risks controlled. Potential still active.
              <a href="#decision">Open final bay</a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function FinalDecision({
  setModal,
  allFlagsClear,
}: {
  setModal: (modal: ModalState) => void;
  allFlagsClear: boolean;
}) {
  const decisionRef = useRef<HTMLElement | null>(null);
  const [focusedAction, setFocusedAction] = useState(0);
  const [decisionActivated, setDecisionActivated] = useState(false);
  const choiceSummaries = [
    "A short conversation is the next step. We can test the fit, clarify the learning curve, and discuss how my field leadership could apply in the Ottawa market.",
    "If this profile should be reviewed by another leader in Sales, Distribution, or Talent Acquisition, the complete candidate file is ready to forward.",
    "If this role is not the right match today, leave a clear note or signal so I understand the status without guessing.",
  ];
  const mailHref = `mailto:${contact.email}?subject=Red%20Bull%20Application%20-%20${encodeURIComponent(
    contact.name,
  )}`;

  useEffect(() => {
    const decision = decisionRef.current;
    if (!decision) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle("decision-room-in-view", entry.isIntersecting);
        if (entry.isIntersecting) setDecisionActivated(true);
      },
      { threshold: 0.15 },
    );

    observer.observe(decision);

    return () => {
      document.body.classList.remove("decision-room-in-view");
      observer.disconnect();
    };
  }, []);

  return (
    <section
      className={decisionActivated ? "decision-room-section activated" : "decision-room-section"}
      id="decision"
      ref={decisionRef}
      data-track-section="wing-fitting-room"
    >
      <div className="decision-room-bg" aria-hidden="true" />
      <div className="fitting-room-activation" aria-hidden="true">
        <span className="fitting-scan-beam" />
        <span className="fitting-floor-glow" />
        <span className="fitting-lock-ring" />
      </div>
      <div className="decision-room-shell">
        <div className="decision-room-topline" data-reveal>
          <span>Wing Fitting Room</span>
          <em>// Final decision bay</em>
        </div>

        <div className="decision-room-header" data-reveal>
          <div className="decision-room-copy">
            <h2>Do you have a pair of wings available for me?</h2>
            <p>
              The scan is complete. The proof files are open. The gap review has been handled.
              If the fit makes sense, I&apos;m ready for the next conversation.
            </p>
          </div>

          <aside className={allFlagsClear ? "decision-clearance complete" : "decision-clearance pending"}>
            <div>
              <span>Candidate File</span>
              <strong>Eddy Sallault</strong>
              <em>Sales leadership candidate</em>
            </div>
            <ul>
              <li><Check size={16} /> Requirements matched</li>
              <li><Check size={16} /> Scan validated</li>
              <li><Check size={16} /> Evidence files opened</li>
              <li><Check size={16} /> {allFlagsClear ? "Gaps controlled" : "Gap review ready"}</li>
            </ul>
            <div className="clearance-orbit">
              <span><BadgeCheck size={42} /></span>
              <strong>{allFlagsClear ? "Clearance Complete" : "Clearance Ready"}</strong>
              <small>{allFlagsClear ? "Ready for next step" : "Final questions visible"}</small>
            </div>
          </aside>
        </div>

        <div className="wing-choice-grid" data-reveal>
          {finalActions.map((action, index) => {
            const Icon = action.icon;
            const active = focusedAction === index;
            return (
              <button
                key={action.title}
                className={[
                  "wing-choice-card",
                  index === 0 ? "primary" : index === 1 ? "blue" : "reserve",
                  active ? "active" : "",
                ].join(" ")}
                onMouseEnter={() => setFocusedAction(index)}
                onFocus={() => setFocusedAction(index)}
                onClick={() => {
                  trackEvent("cta_click", {
                    ctaId:
                      index === 0
                        ? "invite-fitting-room"
                        : index === 1
                          ? "send-to-wing-specialist"
                          : "keep-in-wing-room",
                    label: action.title,
                  });
                  setModal({ type: "action", item: action });
                }}
              >
                <span className="wing-choice-number">{String(index + 1).padStart(2, "0")}</span>
                <Icon className="wing-choice-icon" size={34} />
                  <strong>
                    {index === 0
                    ? "Start a live conversation."
                    : index === 1
                      ? "Forward to the right stakeholder."
                      : "No opening right now."}
                </strong>
                <p>{choiceSummaries[index]}</p>
                <span className="wing-choice-visual" aria-hidden="true" />
                <em>
                  {index === 0
                    ? "Request a conversation"
                    : index === 1
                      ? "Forward this profile"
                      : "Leave a clean signal"}
                  <ArrowDown size={18} />
                </em>
              </button>
            );
          })}
        </div>

        <div className="standard-flight-file" data-reveal data-track-section="standard-flight-file">
          <div>
            <FileText size={24} />
            <strong>Standard Flight File</strong>
            <span>For the traditional review process: resume, Wingfinder, LinkedIn, and direct contact.</span>
          </div>
          <a
            href={documentHref("resume", assets.resume)}
            target="_blank"
            rel="noreferrer"
            data-track-click="document_click"
            data-document-id="resume"
            data-track-label="Resume"
          >
            <FileText />
            <strong>Resume</strong>
            <span>Download PDF</span>
          </a>
          <a
            href={documentHref("wingfinder-report", assets.wingfinderReport)}
            target="_blank"
            rel="noreferrer"
            data-track-click="document_click"
            data-document-id="wingfinder-report"
            data-track-label="Wingfinder Report"
          >
            <FileText />
            <strong>Wingfinder Report</strong>
            <span>Download PDF</span>
          </a>
          <a
            href={documentHref("wingfinder-passport", assets.wingfinderPassport)}
            target="_blank"
            rel="noreferrer"
            data-track-click="document_click"
            data-document-id="wingfinder-passport"
            data-track-label="Wingfinder Passport"
          >
            <FileText />
            <strong>Wingfinder Passport</strong>
            <span>Download PDF</span>
          </a>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noreferrer"
            data-track-click="linkedin_click"
            data-track-id="linkedin-profile"
            data-track-label="LinkedIn Profile"
          >
            <ExternalLink />
            <strong>LinkedIn Profile</strong>
            <span>Open profile</span>
          </a>
          <a href={mailHref} data-track-click="email_click" data-track-id="email-direct" data-track-label="Email Direct">
            <Mail />
            <strong>Email Direct</strong>
            <span>Send email</span>
          </a>
        </div>

        <footer className="decision-room-footer">
          <img src={assets.logo} alt="" />
          <strong>Ready to earn the wings in the field.</strong>
          <span>No hidden risks. Clear gaps. Strong operating pattern.</span>
          <button onClick={() => scrollToId("top")}>
            Let&apos;s see where the wind takes us.
            <ArrowDown size={18} />
          </button>
        </footer>
      </div>
    </section>
  );
}

function SharedInvitationPrompt() {
  const [visible, setVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (!isSharedInvitationVisit()) return;
    const storageKey = `rb_invite_identity_${window.location.pathname}`;
    if (window.localStorage.getItem(storageKey)) return;
    setVisible(true);
  }, []);

  const close = (mode: "identified" | "anonymous") => {
    window.localStorage.setItem(`rb_invite_identity_${window.location.pathname}`, mode);
    setVisible(false);
  };

  const submitIdentity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    if (!cleanFirstName && !cleanLastName) return;
    identifySharedVisitor({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      role: role.trim(),
    });
    close("identified");
  };

  const continueAnonymously = () => {
    trackEvent("visitor_anonymous", { visitorType: "shared_invitee" });
    close("anonymous");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="invite-prompt-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            className="invite-prompt"
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, scale: 0.97 }}
            onSubmit={submitIdentity}
          >
            <p className="eyebrow">Shared candidate file</p>
            <h3>Who is reviewing this file?</h3>
            <p>
              This link was forwarded for review. You can identify yourself so the visit is
              attached to the shared session, or continue anonymously.
            </p>
            <div className="invite-fields">
              <label>
                First name
                <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              </label>
              <label>
                Last name
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
              </label>
              <label>
                Role / team
                <input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Optional" />
              </label>
            </div>
            <div className="invite-actions">
              <button type="submit">Continue identified</button>
              <button type="button" onClick={continueAnonymously}>
                Continue anonymously
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Modal({
  modal,
  setModal,
}: {
  modal: ModalState;
  setModal: (modal: ModalState) => void;
}) {
  const mailHref = `mailto:${contact.email}?subject=Red%20Bull%20Application%20-%20${encodeURIComponent(
    contact.name,
  )}`;
  const openLinkedCase = (force: WingForce) => {
    const linkedCase = caseStudies.find((story) => story.id === force.caseId);
    if (!linkedCase) return;

    trackEvent("case_article_open", {
      caseId: linkedCase.id,
      articleTitle: linkedCase.title,
      source: `wingfinder-${force.id}`,
    });
    setModal({ type: "case", item: linkedCase });
  };
  const closeModal = () => {
    if (modal?.type === "case") {
      trackEvent("case_article_close", {
        caseId: modal.item.id,
        articleTitle: modal.item.title,
      });
    }
    setModal(null);
  };

  useEffect(() => {
    if (!modal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal]);

  return (
    <AnimatePresence>
      {modal && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className={`modal modal-${modal.type}`}
            initial={{ scale: 0.96, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>
              {modal.type === "criterion" ? "Close" : <X />}
              <span className="sr-only">Close modal</span>
            </button>

            {modal.type === "force" && (
              <div className="can-modal-layout">
                <div className="can-modal-art">
                  <span />
                  <img src={modal.item.canImage} alt={`${modal.item.edition} can`} />
                </div>
                <div>
                  <p className="eyebrow">Wingfinder proof</p>
                  <h3>{modal.item.title}</h3>
                  <p className="edition-line">{modal.item.edition}</p>
                  <p>{modal.item.meaning}</p>
                  <div className="modal-proof">
                    <strong>Career proof</strong>
                    <span>{modal.item.proof}</span>
                  </div>
                  <div className="modal-proof">
                    <strong>Red Bull application</strong>
                    <span>{modal.item.application}</span>
                  </div>
                  <button className="button primary" onClick={() => openLinkedCase(modal.item)}>
                    {modal.item.cta}
                  </button>
                </div>
              </div>
            )}

            {modal.type === "case" && (
              <>
                <p className="eyebrow">Case {modal.item.n} | {modal.item.catLabel}</p>
                <h3>{modal.item.title}</h3>
                <p>{modal.item.subtitle}</p>
                <img className="modal-image" src={caseImageMap[modal.item.id] ?? modal.item.img} alt="" />
                <div className="modal-proof">
                  <strong>Takeaway</strong>
                  <span>{modal.item.takeaway}</span>
                </div>
                <div className="case-proof-list">
                  {modal.item.proof.map((proof) => (
                    <span key={proof}>{proof}</span>
                  ))}
                </div>
                <article
                  className="case-body"
                  dangerouslySetInnerHTML={{ __html: modal.item.body }}
                />
              </>
            )}

            {modal.type === "criterion" && (
              <div className="criterion-modal">
                <p className="eyebrow">Candidate validation</p>
                <h3>{modal.item.title}</h3>
                <div className="criterion-detail-grid">
                  <div>
                    <strong>Red Bull Requirement</strong>
                    <p>{modal.item.requirement}</p>
                  </div>
                  <div>
                    <strong>Eddy Evidence</strong>
                    <p>{modal.item.evidence}</p>
                  </div>
                  <div>
                    <strong>Transfer Value</strong>
                    <p>{modal.item.transfer}</p>
                  </div>
                </div>
              </div>
            )}

            {modal.type === "action" && (
              <>
                <p className="eyebrow">Decision path</p>
                <h3>{modal.item.title}</h3>
                <p>{modal.item.body}</p>
                <div className="modal-actions">
                  {modal.item.actions.map((action) => (
                    <ActionLink key={action} label={action} mailHref={mailHref} />
                  ))}
                </div>
              </>
            )}

            {modal.type === "documents" && (
              <>
                <p className="eyebrow" id="documents">Classic documents</p>
                <h3>Everything a recruiter may need, without breaking the experience.</h3>
                <div className="document-list">
                  <a
                    href={documentHref("wingfinder-report", assets.wingfinderReport)}
                    target="_blank"
                    rel="noreferrer"
                    data-track-click="document_click"
                    data-document-id="wingfinder-report"
                    data-track-label="Red Bull Wingfinder report"
                  >
                    <FileText />
                    Red Bull Wingfinder report
                    <ExternalLink />
                  </a>
                  <a
                    href={documentHref("wingfinder-passport", assets.wingfinderPassport)}
                    target="_blank"
                    rel="noreferrer"
                    data-track-click="document_click"
                    data-document-id="wingfinder-passport"
                    data-track-label="Wingfinder passport summary"
                  >
                    <FileText />
                    Wingfinder passport summary
                    <ExternalLink />
                  </a>
                  <a
                    href={documentHref("resume", assets.resume)}
                    target="_blank"
                    rel="noreferrer"
                    data-track-click="document_click"
                    data-document-id="resume"
                    data-track-label="Complete resume"
                  >
                    <FileText />
                    Complete resume
                    <ExternalLink />
                  </a>
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    data-track-click="linkedin_click"
                    data-track-id="linkedin-profile"
                    data-track-label="LinkedIn profile"
                  >
                    <ExternalLink />
                    LinkedIn profile
                  </a>
                  <a href={mailHref} data-track-click="email_click" data-track-id="email-direct" data-track-label="Email Direct">
                    <Mail />
                    {contact.email}
                  </a>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionLink({ label, mailHref }: { label: string; mailHref: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<"schedule" | "message" | "forward" | null>(null);
  const [completeMessage, setCompleteMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactMethod: "phone",
    recipientName: "",
    recipientEmail: "",
    shareUrl: "",
    title: "",
    message: "",
    date: "",
    time: "",
  });
  const copyText = async (value: string, nextStatus: string) => {
    await navigator.clipboard?.writeText(value);
    setStatus(nextStatus);
    window.setTimeout(() => setStatus(null), 2200);
  };
  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const openScheduleForm = () => {
    setForm((current) => {
      if (current.date && current.time) return current;
      const nextSlot = nextEasternConversationSlot();
      return { ...current, date: current.date || nextSlot.date, time: current.time || nextSlot.time };
    });
    setFormOpen("schedule");
  };
  const generateForwardLink = async () => {
    const recipient = form.recipientName.trim();
    const shareUrl = await createShareLink(recipient ? `Forwarded to ${recipient}` : "Forwarded from Red Bull recruiter");
    updateField("shareUrl", shareUrl);
    setStatus("Tracked link generated");
  };
  const emailForwardLink = () => {
    const recipientEmail = form.recipientEmail.trim();
    const subject = encodeURIComponent("Red Bull candidate file to review");
    const greeting = form.recipientName.trim() ? `Hi ${form.recipientName.trim()},` : "Hi,";
    const body = encodeURIComponent(
      `${greeting}\n\nI am forwarding Eddy Sallault's Red Bull candidate file for review:\n\n${form.shareUrl}\n\nBest,`,
    );
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };
  const appointmentDates = () => {
    const fallback = nextEasternConversationSlot();
    const dateValue = form.date || fallback.date;
    const timeValue = form.time || fallback.time;
    const start = easternWallTimeToUtc(dateValue, timeValue);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const format = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return { start, end, googleStart: format(start), googleEnd: format(end) };
  };
  const downloadIcs = () => {
    const { googleStart, googleEnd } = appointmentDates();
    const title = "Requested conversation with Eddy Sallault";
    const method = form.contactMethod === "video" ? "Video call" : `Phone call (${contact.phone})`;
    const description = [
      "Conversation request from the Red Bull candidate file.",
      "Status: pending confirmation from Eddy by email.",
      `Preferred format: ${method}`,
      `Requested time zone: Eastern time / Orlando (${EASTERN_TIME_ZONE})`,
      `Requester: ${form.firstName} ${form.lastName} ${form.email}`,
      form.message ? `Note: ${form.message}` : "",
    ].filter(Boolean).join("\\n");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Eddy Sallault//Red Bull Candidate File//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@eddy-redbull`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      `DTSTART:${googleStart}`,
      `DTEND:${googleEnd}`,
      `SUMMARY:${title}`,
      `LOCATION:${method}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "eddy-sallault-redbull-conversation.ics";
    link.click();
    URL.revokeObjectURL(url);
  };
  const submitForm = async (type: "appointment_request" | "message_sent") => {
    await submitAdminMessage({
      type,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      title: form.title || (type === "appointment_request" ? "Conversation request" : "Message from candidate file"),
      message: form.message,
      contactMethod: form.contactMethod,
      contactPhone: contact.phone,
      requestedDate: form.date,
      requestedTime: form.time,
      requestedTimeZone: EASTERN_TIME_ZONE,
    });
    trackEvent(type, { title: form.title, email: form.email, contactMethod: form.contactMethod });
    setFormOpen(null);
    setStatus(null);
    setCompleteMessage(
      type === "appointment_request"
        ? "Your conversation request has been received. Eddy will confirm the final time and format by email shortly."
        : "Your message has been sent to Eddy. It is now visible in the application admin.",
    );
  };

  if (completeMessage) {
    return (
      <div className="action-form action-complete" role="status">
        <strong>{label === "Request a conversation" ? "Request received" : "Message received"}</strong>
        <p>{completeMessage}</p>
        <button onClick={() => setCompleteMessage(null)}>Close message</button>
      </div>
    );
  }

  if (formOpen === "schedule") {
    return (
      <div className="action-form">
        <strong>Request a conversation</strong>
        <p className="action-form-note">
          This creates a request in Eddy&apos;s admin. The calendar file is only a provisional hold until Eddy confirms by email.
          Times are requested in Eastern time / Orlando. Contact: {contact.phone}.
        </p>
        <div className="action-form-grid">
          <input placeholder="First name" value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} />
          <input placeholder="Last name" value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} />
          <input placeholder="Email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          <input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} />
          <input type="time" value={form.time} onChange={(event) => updateField("time", event.target.value)} />
        </div>
        <div className="contact-methods" role="radiogroup" aria-label="Preferred conversation format">
          <label>
            <input
              type="radio"
              name="contact-method"
              checked={form.contactMethod === "phone"}
              onChange={() => updateField("contactMethod", "phone")}
            />
            Phone
          </label>
          <label>
            <input
              type="radio"
              name="contact-method"
              checked={form.contactMethod === "video"}
              onChange={() => updateField("contactMethod", "video")}
            />
            Video
          </label>
        </div>
        <textarea placeholder="Optional note" value={form.message} onChange={(event) => updateField("message", event.target.value)} />
        <div className="action-form-actions">
          <button onClick={() => submitForm("appointment_request")}>{status ?? "Send request to Eddy"}</button>
          <button onClick={downloadIcs}>Download provisional .ics</button>
          <button onClick={() => setFormOpen(null)}>Back</button>
        </div>
      </div>
    );
  }

  if (formOpen === "message") {
    return (
      <div className="action-form">
        <strong>Send a message</strong>
        <div className="action-form-grid">
          <input placeholder="First name" value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} />
          <input placeholder="Last name" value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} />
          <input placeholder="Email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
        </div>
        <input placeholder="Title" value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        <textarea placeholder="Message" value={form.message} onChange={(event) => updateField("message", event.target.value)} />
        <div className="action-form-actions">
          <button onClick={() => submitForm("message_sent")}>{status ?? "Send to Eddy"}</button>
          <button onClick={() => setFormOpen(null)}>Back</button>
        </div>
      </div>
    );
  }

  if (formOpen === "forward") {
    return (
      <div className="action-form">
        <strong>Forward this profile</strong>
        <p className="action-form-note">
          Generate a tracked invitation link for the person who should review this candidate file.
        </p>
        <div className="action-form-grid">
          <input
            placeholder="Recipient name"
            value={form.recipientName}
            onChange={(event) => updateField("recipientName", event.target.value)}
          />
          <input
            placeholder="Recipient email (optional)"
            type="email"
            value={form.recipientEmail}
            onChange={(event) => updateField("recipientEmail", event.target.value)}
          />
        </div>
        <div className="action-form-actions">
          <button onClick={generateForwardLink}>{status ?? "Generate tracked link"}</button>
          <button onClick={() => setFormOpen(null)}>Back</button>
        </div>
        {form.shareUrl && (
          <div className="generated-share-link">
            <label>
              Link generated
              <input readOnly value={form.shareUrl} onFocus={(event) => event.currentTarget.select()} />
            </label>
            <div className="action-form-actions">
              <button onClick={() => copyText(form.shareUrl, "Link copied")}>Copy link</button>
              <button onClick={emailForwardLink}>Send by email</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (label === "Request a conversation" || label === "Schedule a conversation") {
    return (
      <button data-track-click="cta_click" data-track-id="schedule-conversation" data-track-label={label} onClick={openScheduleForm}>
        {label}
      </button>
    );
  }

  if (label === "Send message from here") {
    return (
      <button data-track-click="cta_click" data-track-id="send-message-from-here" data-track-label={label} onClick={() => setFormOpen("message")}>
        {label}
      </button>
    );
  }

  if (label === "Email Eddy") {
    return <a href={mailHref} data-track-click="email_click" data-track-id="email-direct" data-track-label={label}>{label}</a>;
  }

  if (label === "Forward this profile") {
    return (
      <button
        data-track-click="cta_click"
        data-track-id="forward-this-profile"
        data-track-label={label}
        onClick={() => setFormOpen("forward")}
      >
        {label}
      </button>
    );
  }

  if (label === "Leave a short note" || label === "Leave a note for Eddy") {
    return (
      <button data-track-click="cta_click" data-track-id="leave-short-note" data-track-label={label} onClick={() => setFormOpen("message")}>
        {label}
      </button>
    );
  }

  if (label === "Mark no fit today") {
    return (
      <button
        data-track-click="cta_click"
        data-track-id="mark-no-fit-today"
        data-track-label={label}
        onClick={() => {
          trackEvent("no_fit_today", { label });
          setStatus("Signal saved");
        }}
      >
        {status ?? label}
      </button>
    );
  }

  return <button data-track-click="cta_click" data-track-id={trackingId(label)} data-track-label={label}>{label}</button>;
}

export default App;
