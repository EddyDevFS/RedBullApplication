import {
  BadgeCheck,
  Brain,
  BriefcaseBusiness,
  Flag,
  Gauge,
  Lightbulb,
  Link as LinkIcon,
  Mail,
  MapPinned,
  Rocket,
  ScanLine,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const contact = {
  name: "Eddy Sallault",
  email: "sallault.eddy@gmail.com",
  linkedin: "https://www.linkedin.com/in/eddy-sallault/",
  role: "General Sales Manager",
  targetLocation: "Ottawa, Canada",
};

export const assets = {
  logo: "/assets/images/redbull-mark.png",
  wingsAvailable: "/assets/images/wings-available.png",
  cansVideo: "/assets/videos/cans-wingfinder.mp4",
  cansPoster: "/assets/images/poster-cans.jpg",
  cansImage: "/assets/images/cans-pack.jpg",
  f1Video: "/assets/videos/f1-parking.mp4",
  f1Poster: "/assets/images/poster-f1.jpg",
  f1Fallback: "/assets/images/f1-delivery.png",
  presentationVideo: "/assets/videos/presentation.mp4",
  scan: "/assets/images/profile-scan.png",
  scanBlank: "/assets/images/Scan-validated.png",
  leadership: "/assets/images/leadership-delivery.png",
  wingsBoxVideo: "/assets/videos/wings-box-takeoff.mp4",
  wingsBoxPoster: "/assets/images/poster-wings-box.jpg",
  wingsForwardVideo: "/assets/videos/wings-forward.mp4",
  wingsForwardPoster: "/assets/images/poster-wings-forward.jpg",
  wingfinderReport: "/assets/docs/eddy-sallault-wingfinder-report.pdf",
  wingfinderPassport: "/assets/docs/eddy-sallault-wingfinder-passport.pdf",
  resume: "/assets/docs/eddy-sallault-resume.pdf",
};

export type WingForce = {
  id: string;
  title: string;
  edition: string;
  label: string;
  icon: LucideIcon;
  canImage: string;
  proofImage: string;
  meaning: string;
  proof: string;
  application: string;
  cta: string;
  caseId: string;
};

export const wingForces: WingForce[] = [
  {
    id: "drive",
    title: "Drive",
    edition: "The Driven Edition",
    label: "Create traction before the system is fully built.",
    icon: Gauge,
    canImage: "/assets/images/can-driven.png",
    proofImage: "/assets/images/proof-samsic-cannes.png",
    meaning:
      "My energy is not about staying busy. It is about launching motion, installing rhythm, and moving imperfect environments forward.",
    proof:
      "At SAMSIC, I helped build regional development from weak starting points: opening agencies, shaping teams, structuring commercial growth, and creating a real operational footprint.",
    application:
      "For Red Bull, this means installing field rhythm, pushing execution, and turning ambition into visible market presence.",
    cta: "Read the story: build a territory",
    caseId: "region-13-agencies",
  },
  {
    id: "creativity",
    title: "Creativity",
    edition: "The Innovative Edition",
    label: "Turn friction into a usable system.",
    icon: Lightbulb,
    canImage: "/assets/images/can-innovative.png",
    proofImage: "/assets/images/proof-control-tower.png",
    meaning:
      "My creativity is not decorative. It is a way to make work clearer, faster, easier to teach, and easier to execute.",
    proof:
      "I created tools, pages, training systems, mobile supports, and operating processes to solve concrete field problems.",
    application:
      "Inside a sales team, that creativity can improve training, priorities, team engagement, and the bridge between strategy and field execution.",
    cta: "Read the story: design a useful system",
    caseId: "staffing-platform",
  },
  {
    id: "connections",
    title: "Connections",
    edition: "The Confident Edition",
    label: "Build buy-in before demanding performance.",
    icon: Users,
    canImage: "/assets/images/can-confident.png",
    proofImage: "/assets/images/proof-training.jpg",
    meaning:
      "I do not believe in purely top-down management. Teams perform when the goal, the frame, the expectations, and the reason behind the action are clear.",
    proof:
      "I recruited, trained, and developed people who were not always from the industry, creating fast learning environments and trust-based standards.",
    application:
      "For a field organization, this supports alignment, ownership, coaching, and consistent execution without constant micromanagement.",
    cta: "Read the story: train a team that moves",
    caseId: "agency-launch-system",
  },
  {
    id: "thinking",
    title: "Thinking",
    edition: "The Adaptive Edition",
    label: "See the system behind the action.",
    icon: Brain,
    canImage: "/assets/images/can-adaptive.png",
    proofImage: "/assets/images/proof-mobile-app.png",
    meaning:
      "I do not only look at what is blocked. I look for why it is blocked, where the leverage is, and how to create a repeatable method.",
    proof:
      "Across my work, I built routines, indicators, diagnostics, training material, and processes that turned intuition into visible progress.",
    application:
      "In retail and field leadership, this helps read a territory, spot execution gaps, prioritize action, and develop people with precision.",
    cta: "Read the story: structure performance",
    caseId: "accountability-without-micro",
  },
];

export const scannerRows = [
  ["Field leadership", "proven"],
  ["Territory building", "proven"],
  ["Team training", "proven"],
  ["Business development", "proven"],
  ["Creative execution", "proven"],
  ["Retail background", "transferable field leadership"],
  ["Ottawa relocation", "relocation-ready"],
  ["Work authorization", "simple Francophone Mobility route to confirm"],
];

export const validationModules = [
  {
    id: "territory-building",
    title: "Territory Building",
    status: "Validated field expansion",
    icon: MapPinned,
    signal: "Built presence where there was no installed base.",
    proof: "Regional development across Southern France: agency openings, local hiring, commercial routines, and a network scaled to 13 agencies.",
    caseId: "region-13-agencies",
  },
  {
    id: "field-leadership",
    title: "Field Leadership",
    status: "Validated management pattern",
    icon: Users,
    signal: "Lead close enough to understand the work, structured enough to scale it.",
    proof: "Managed, recruited, trained, coached, and developed teams in field-driven environments where commercial pressure and operational reality met every day.",
    caseId: "assistant-branch-manager",
  },
  {
    id: "team-training",
    title: "Team Training",
    status: "Validated learning system",
    icon: BadgeCheck,
    signal: "Performance is trained before it is expected.",
    proof: "Built onboarding and pre-training routines with daily topics, practical exercises, assessments, and clearer standards for faster autonomy.",
    caseId: "agency-launch-system",
  },
  {
    id: "business-development",
    title: "Business Development",
    status: "Validated sales traction",
    icon: BriefcaseBusiness,
    signal: "Create the opportunity instead of waiting for perfect demand.",
    proof: "Won hard accounts by reframing the real obstacle: candidate-led selling, transport constraints, profile redesign, and practical client problem solving.",
    caseId: "center-parcs",
  },
  {
    id: "creative-execution",
    title: "Creative Execution",
    status: "Validated system design",
    icon: Lightbulb,
    signal: "Creativity used to remove friction, not decorate the process.",
    proof: "Designed operational tools, app concepts, scan-based workflows, and training supports to make field execution clearer and repeatable.",
    caseId: "staffing-platform",
  },
  {
    id: "retail-transfer",
    title: "Retail Transfer",
    status: "Transferable leadership signal",
    icon: ScanLine,
    signal: "Not a classic retail profile. A field execution profile.",
    proof: "The core muscles match: territory reading, people development, client rhythm, execution standards, operational discipline, and fast learning.",
    caseId: "us-service-business",
  },
  {
    id: "ottawa-readiness",
    title: "Ottawa Readiness",
    status: "Relocation-ready mindset",
    icon: Rocket,
    signal: "Starting from a new field is part of the pattern.",
    proof: "Repeatedly entered new markets, new industries, and new operating contexts, then built practical learning loops from the ground up.",
    caseId: "first-agency",
  },
  {
    id: "mobility-pathway",
    title: "Mobility Pathway",
    status: "Simple Francophone Mobility route to confirm",
    icon: ShieldCheck,
    signal: "This should be checked early, but it is not a heavy sponsorship issue.",
    proof: "For a role outside Quebec, the official Francophone Mobility pathway is designed to let Canadian employers hire eligible French-speaking workers without an LMIA, through a defined Employer Portal process.",
    caseId: "us-service-business",
  },
];

export const stories = [
  {
    title: "From zero to regional footprint",
    tag: "Drive / Territory Building",
    image: "/assets/images/proof-samsic-hq.avif",
    body:
      "Build commercial presence where the base was weak: open, recruit, train, develop clients, install routines, and make progress visible.",
    redbull:
      "Developing a territory requires the same logic: read the field, prioritize, create rhythm, and improve execution week after week.",
  },
  {
    title: "Build the team before chasing the numbers",
    tag: "Connections / People Development",
    image: "/assets/images/proof-training.jpg",
    body:
      "Recruit and train profiles who did not always come from the industry, avoid bad habits, and build autonomy through clear routines.",
    redbull:
      "A field team does not perform only because of past experience. It performs because the frame, coaching, and learning loop are strong.",
  },
  {
    title: "Turn friction into system",
    tag: "Creativity / Process Design",
    image: "/assets/images/proof-control-tower.png",
    body:
      "Create tools, supports, processes, and interfaces that reduce confusion and make action easier to understand and repeat.",
    redbull:
      "The best sales systems reduce the gap between strategy, field reality, and execution.",
  },
  {
    title: "Performance is trained before it is expected",
    tag: "Thinking / Coaching",
    image: "/assets/images/proof-les-mills.webp",
    body:
      "Coaching taught me a simple rule: performance is not declared. It is trained, observed, corrected, repeated, and measured.",
    redbull:
      "Leading a field team is also coaching: observe, correct, repeat, measure, encourage, and adjust.",
  },
];

export const objections = [
  {
    title: "No direct retail / DSD background?",
    label: "Retail execution gap",
    icon: Flag,
    answer:
      "Correct. I do not come from a traditional DSD or retail distribution background. The gap is real, but manageable through focused field immersion, route learning, store execution standards, KPI mapping, and direct coaching from Red Bull leaders.",
  },
  {
    title: "Can I earn credibility with a Red Bull field team?",
    label: "Field credibility gap",
    icon: Users,
    answer:
      "Credibility would not be automatic. It would need to be earned by learning the team's reality first, understanding the work before setting expectations, and bringing useful structure only after the field conditions are clear.",
  },
  {
    title: "Not based in Ottawa yet?",
    label: "Relocation execution gap",
    icon: MapPinned,
    answer:
      "I am not in Ottawa today. That is not something to minimize. It becomes a practical execution plan: timing, first on-site requirements, onboarding rhythm, territory immersion, and relocation sequence.",
  },
  {
    title: "Work authorization?",
    label: "Simple Francophone Mobility route",
    icon: ShieldCheck,
    answer:
      "This should be checked early, but it should not be treated as a major obstacle. For a role outside Quebec, the official Francophone Mobility pathway is an LMIA-exempt route designed for eligible French-speaking candidates. The employer submits the offer online through the Employer Portal, uses code C16, pays the compliance fee, and gives the offer number to the candidate. The core conditions are already aligned; we just need to validate and execute the steps together.",
  },
];

export const finalActions = [
  {
    title: "Schedule a conversation",
    icon: Gauge,
    body:
      "If the profile is worth a live discussion, the next step is simple: schedule a conversation or send me a direct message from here.",
    actions: ["Schedule a conversation", "Send message from here", "Email Eddy"],
  },
  {
    title: "Transfer the application",
    icon: LinkIcon,
    body:
      "If this candidate file should be reviewed by another Red Bull stakeholder, generate a tracked invitation link. I will know it was forwarded from this review path, and the invited visitor can identify themselves or continue anonymously.",
    actions: ["Generate tracked invite link", "Email the invite", "Copy current link"],
  },
  {
    title: "No opening for now",
    icon: Mail,
    body:
      "If there is nothing to propose right now, you can still leave a signal: send a short note, email me directly, or simply mark that there is no fit today.",
    actions: ["Leave a short note", "Email Eddy", "Mark no fit today"],
  },
];
