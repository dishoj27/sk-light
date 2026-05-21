"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import {
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  CloudMoon,
  Download,
  Heart,
  ImagePlus,
  LockKeyhole,
  LogOut,
  Moon,
  Music2,
  Pause,
  Play,
  Search,
  Sparkles,
  Star,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
  X
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { auth, db, firebaseReady, isAllowedEmail, signupEnabled, storage } from "@/lib/firebase";

type Memory = {
  id: string;
  name: string;
  url: string;
  path: string;
  type: "image" | "video" | "audio";
  favorite: boolean;
  createdAt?: unknown;
};

const letters = [
  "Keerthi, Disoo means Dreaming of your smile, Infinite in care, Soft with your heart, Only choosing you, and Ours in every quiet moonlit moment.",
  "My moonlight, Disoo is not just a name here. It means I am Dreaming about your happiness, Infinite with patience, Soft when you are tired, Only yours, and Ours in this tiny universe.",
  "Keerthi, when you read Disoo, remember its meaning: Dreaming, Infinite, Soft, Only, Ours. That is how gently this whole world is made for you.",
  "If your heart feels heavy today, let Disoo mean this for you: Dreaming beside you, Infinite love for you, Soft comfort around you, Only choosing you, Ours forever in small peaceful ways.",
  "You make calm look beautiful. To me, Disoo means Dreaming of us, Infinite care, Soft promises, Only Keerthi, and Ours under the same moon."
];

const supportMessages = {
  "You are loved": [
    "You are deeply loved, Keerthi. Even on quiet days, even when you forget your own glow.",
    "You are loved in the loud moments, the quiet moments, and every tiny space between.",
    "Nothing about you needs to be perfect to be precious.",
    "Your heart deserves care even when it feels tired."
  ],
  "Smile please": [
    "A tiny smile is enough. No pressure. Just let the moonlight touch the corners of your heart.",
    "Your smile is a small sunrise inside this universe.",
    "Smile only if your heart wants to. This place will wait softly.",
    "Even a little smile can make the night softer."
  ],
  "You matter": [
    "You matter in ways you may never fully see. Your softness changes the room.",
    "Your presence is not small. It leaves light wherever it rests.",
    "Keerthi, even your quietest days have meaning.",
    "The world is gentler because you are in it."
  ],
  "Moonlight hugs": [
    "Close your eyes for one breath. Imagine the safest silver light wrapping around you.",
    "A soft moonlight hug is here: warm, quiet, and only for you.",
    "Close your eyes for one breath. You are held by the gentlest light.",
    "Let the moonlight hug the parts of you that feel unseen."
  ]
};

const moodReplies = {
  Calm: "Stay here, Keerthi. The night is soft and nothing is asking you to hurry.",
  Tired: "Rest is beautiful too. Let the moon hold the heavy parts for a while.",
  Happy: "Your happiness looks like silver light dancing on water.",
  Low: "You are not alone in this feeling. Breathe slowly. You are deeply loved.",
  Dreamy: "Keep that dream close. Soft hearts can still build bright futures."
};

const promises = [
  "I will be your calm place on hard days.",
  "Your smile will always be celebrated here.",
  "Every memory we save becomes part of Keerthi's universe.",
  "Whenever you feel low, this place will answer gently."
];

const hiddenStars = [
  "Keerthi, you are the moonlight I would choose in every sky.",
  "Your heart is softer than the quietest night.",
  "Disoo made this universe to remind you that you matter.",
  "Every star here knows your name gently."
];

const nav = ["Home", "Birthday", "Memories", "Letters", "Boost", "Moon"];

function todayLetter() {
  const cycle = Math.floor(Date.now() / (16 * 60 * 60 * 1000));
  return letters[cycle % letters.length];
}

const keerthiBirthday = new Date(2008, 1, 16, 0, 0, 0);

function moonPhase() {
  const lp = 2551443;
  const now = new Date();
  const newMoon = new Date("2000-01-06T18:14:00Z").getTime() / 1000;
  const phase = ((now.getTime() / 1000 - newMoon) % lp) / lp;
  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

function useCountdown() {
  const [time, setTime] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let years = now.getFullYear() - keerthiBirthday.getFullYear();
      const anchor = new Date(keerthiBirthday);
      anchor.setFullYear(keerthiBirthday.getFullYear() + years);
      if (anchor > now) {
        years -= 1;
        anchor.setFullYear(anchor.getFullYear() - 1);
      }
      const diff = Math.max(0, now.getTime() - anchor.getTime());
      setTime({
        years,
        days: Math.floor(diff / 86400000),
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds()
      });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return time;
}

function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#030713]"
      exit={{ opacity: 0, transition: { duration: 1.1 } }}
    >
      <div className="relative grid place-items-center">
        <motion.div
          className="moon-surface half-mask h-40 w-40 rounded-full shadow-moon"
          initial={{ scale: .65, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.p
          className="moon-text luxury-serif mt-8 animate-shimmer text-2xl"
          animate={{ opacity: [.55, 1, .55] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          Loading Moonlight...
        </motion.p>
      </div>
    </motion.div>
  );
}

function AmbientField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 12 + 10
      })),
    []
  );
  const petals = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: Math.random() * 11 + 11
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,244,255,.16),transparent_32rem)]" />
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-moon/80 shadow-[0_0_18px_rgba(234,244,255,.65)]"
          style={{ left: `${p.left}%`, width: p.size, height: p.size }}
          initial={{ y: "105vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, .9, 0], x: [0, 18, -12, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute h-3 w-2 rounded-full bg-blush/50 blur-[.2px]"
          style={{ left: `${p.left}%` }}
          initial={{ y: "-8vh", rotate: 0, opacity: 0 }}
          animate={{ y: "108vh", rotate: 360, opacity: [0, .75, .2, 0], x: [0, 28, -18, 14] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function MouseSparkles() {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  useEffect(() => {
    let id = 0;
    const move = (event: MouseEvent) => {
      id += 1;
      const next = { id, x: event.clientX, y: event.clientY };
      setSparkles((items) => [...items.slice(-18), next]);
      window.setTimeout(() => {
        setSparkles((items) => items.filter((item) => item.id !== next.id));
      }, 850);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            className="absolute h-2 w-2 rounded-full bg-pearl shadow-[0_0_18px_rgba(255,249,240,.8)]"
            style={{ left: s.x, top: s.y }}
            initial={{ opacity: 1, scale: .4 }}
            animate={{ opacity: 0, scale: 1.8, y: -18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .85 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function RippleLayer() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  useEffect(() => {
    let id = 0;
    const click = (event: MouseEvent) => {
      id += 1;
      const ripple = { id, x: event.clientX, y: event.clientY };
      setRipples((items) => [...items, ripple]);
      window.setTimeout(() => setRipples((items) => items.filter((item) => item.id !== ripple.id)), 900);
    };
    window.addEventListener("click", click);
    return () => window.removeEventListener("click", click);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute h-5 w-5 rounded-full border border-blush/70"
            style={{ left: r.x - 10, top: r.y - 10 }}
            initial={{ opacity: .8, scale: .2 }}
            animate={{ opacity: 0, scale: 5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .9, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Butterfly({ delay = 0, top = "20%" }: { delay?: number; top?: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute z-10 flex items-center justify-center"
      style={{ top }}
      initial={{ x: "-12vw", y: 0, opacity: 0 }}
      animate={{ x: "112vw", y: [0, -45, 16, -28, 0], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 18, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative h-6 w-8">
        <motion.span
          className="absolute left-0 top-0 h-6 w-4 rounded-full bg-lavender/65 blur-[.2px]"
          animate={{ rotate: [22, -18, 22] }}
          transition={{ duration: .42, repeat: Infinity }}
        />
        <motion.span
          className="absolute right-0 top-0 h-6 w-4 rounded-full bg-blush/60 blur-[.2px]"
          animate={{ rotate: [-22, 18, -22] }}
          transition={{ duration: .42, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

function MusicSystem() {
  const audio = useRef<{ ctx: AudioContext; gain: GainNode; timers: number[] } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(.24);
  const [track, setTrack] = useState(0);
  const playlist = ["Moon Piano", "Silver Ambience", "Soft Night"];

  const stop = () => {
    const current = audio.current;
    audio.current?.timers.forEach(window.clearTimeout);
    audio.current?.gain.gain.linearRampToValueAtTime(0, audio.current.ctx.currentTime + .8);
    window.setTimeout(() => current?.ctx.close(), 900);
    audio.current = null;
    setPlaying(false);
  };

  const play = async (selected = track) => {
    stop();
    const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Audio();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    const notes = selected === 0 ? [329.63, 392, 493.88, 659.25] : selected === 1 ? [220, 277.18, 329.63] : [261.63, 329.63, 392];
    const timers: number[] = [];
    const schedule = () => {
      notes.forEach((freq, i) => {
        const timer = window.setTimeout(() => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          noteGain.gain.value = .001;
          osc.connect(noteGain);
          noteGain.connect(gain);
          const t = ctx.currentTime;
          noteGain.gain.exponentialRampToValueAtTime(.055, t + 1.1);
          noteGain.gain.exponentialRampToValueAtTime(.001, t + 5.8);
          osc.start(t);
          osc.stop(t + 6.2);
        }, i * 1250);
        timers.push(timer);
      });
      timers.push(window.setTimeout(schedule, notes.length * 1600 + 2400));
    };
    audio.current = { ctx, gain, timers };
    gain.gain.linearRampToValueAtTime(Math.min(volume, .18), ctx.currentTime + 1.5);
    schedule();
    setPlaying(true);
  };

  useEffect(() => {
    if (audio.current) audio.current.gain.gain.linearRampToValueAtTime(Math.min(volume, .18), audio.current.ctx.currentTime + .45);
  }, [volume]);

  const moveTrack = (step: number) => {
    const next = (track + step + playlist.length) % playlist.length;
    setTrack(next);
    if (playing) void play(next);
  };

  return (
    <div className="glass fixed bottom-4 left-1/2 z-40 flex w-[min(92vw,460px)] -translate-x-1/2 items-center gap-3 rounded-full px-4 py-3">
      <button className="halo-button grid h-10 w-10 place-items-center rounded-full" onClick={() => (playing ? stop() : void play())} aria-label="Play music">
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button className="halo-button grid h-9 w-9 place-items-center rounded-full" onClick={() => moveTrack(-1)} aria-label="Previous track">
        <ChevronLeft size={17} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">{playlist[track]}</p>
        <input
          className="w-full accent-[#ffd6e7]"
          type="range"
          min="0"
          max="0.7"
          step="0.01"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="Volume"
        />
      </div>
      <button className="halo-button grid h-9 w-9 place-items-center rounded-full" onClick={() => moveTrack(1)} aria-label="Next track">
        <ChevronRight size={17} />
      </button>
      {volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "create">("login");
  const [message, setMessage] = useState("");
  const submit = async () => {
    setMessage("");
    if (!firebaseReady || !auth) {
      setMessage("Add Firebase values to .env.local, then restart the app.");
      return;
    }
    if (!isAllowedEmail(email)) {
      setMessage("Keerthi's universe opens only for Keerthi and Disoo.");
      return;
    }
    try {
      if (mode === "login") {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          await signOut(auth);
          setMessage("Please verify this email before entering the private universe.");
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        await signOut(auth);
        setMessage("Verification email sent. Verify it, then log in.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to open the private universe.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8">
      <AmbientField />
      <Butterfly delay={1} top="18%" />
      <Butterfly delay={7} top="64%" />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl place-items-center lg:grid-cols-[1.05fr_.95fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div className="moon-surface half-mask h-64 w-64 rounded-full shadow-[0_0_120px_rgba(234,244,255,.42)] md:h-96 md:w-96" />
          <h1 className="luxury-serif moon-text mt-8 animate-shimmer text-5xl leading-tight md:text-7xl">Keerthi</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-silver md:text-2xl">
            A private universe made only for Keerthi and Disoo.
          </p>
        </motion.div>
        <motion.div className="glass w-full max-w-md rounded-[28px] p-6 md:p-8" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .25, duration: .9 }}>
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-blush">
              <LockKeyhole />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[.28em] text-lavender">Private access</p>
              <h2 className="luxury-serif text-3xl text-white">Enter Moonlight</h2>
            </div>
          </div>
          <label className="mb-4 block">
            <span className="mb-2 block text-sm text-silver">Email</span>
            <input className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-blush/60" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="keerthi@example.com" />
          </label>
          <label className="mb-5 block">
            <span className="mb-2 block text-sm text-silver">Password</span>
            <input className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-blush/60" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Moonlight password" />
          </label>
          <button className="halo-button w-full rounded-2xl px-5 py-4 text-base font-semibold" onClick={submit}>
            {mode === "login" ? "Unlock Private Universe" : "Create Private Access"}
          </button>
          {signupEnabled && (
            <button className="mt-4 w-full text-sm text-silver transition hover:text-white" onClick={() => setMode(mode === "login" ? "create" : "login")}>
              {mode === "login" ? "First time setup for an allowed user" : "Already have access"}
            </button>
          )}
          {message && <p className="mt-5 rounded-2xl bg-blush/10 p-4 text-sm text-blush">{message}</p>}
        </motion.div>
      </section>
    </main>
  );
}

function Hero() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 60, damping: 20 });
  const moonX = useTransform(smoothX, [-50, 50], [-18, 18]);
  const moonY = useTransform(smoothY, [-50, 50], [-10, 10]);

  return (
    <section
      id="Home"
      className="relative min-h-screen overflow-hidden px-5"
      onPointerMove={(event) => {
        x.set((event.clientX / window.innerWidth - .5) * 100);
        y.set((event.clientY / window.innerHeight - .5) * 100);
      }}
    >
      <Butterfly delay={0} top="24%" />
      <Butterfly delay={6} top="46%" />
      <Butterfly delay={12} top="70%" />
      <div className="absolute inset-x-0 top-12 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,.08),transparent)] blur-3xl" />
      <motion.div className="moon-surface half-mask absolute right-[-5rem] top-16 h-[23rem] w-[23rem] rounded-full shadow-[0_0_150px_rgba(234,244,255,.44)] md:right-[8vw] md:h-[34rem] md:w-[34rem]" style={{ x: moonX, y: moonY }} animate={{ scale: [1, 1.025, 1] }} transition={{ duration: 7, repeat: Infinity }} />
      <motion.div className="absolute left-[-12vw] top-[22vh] h-32 w-[70vw] rounded-full bg-white/10 blur-3xl" animate={{ x: ["-10%", "38%", "-10%"], opacity: [.18, .34, .18] }} transition={{ duration: 23, repeat: Infinity }} />
      <div className="relative z-10 ml-[max(5vw,4rem)] grid min-h-screen max-w-[620px] items-center gap-4 pb-28 pt-32 max-lg:mx-auto">
        <motion.div className="p-0" initial={{ opacity: 0, y: 28, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.05, ease: "easeOut" }}>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs uppercase tracking-[.34em] text-lavender">
            <Sparkles size={16} /> Keerthi&apos;s Universe
          </p>
          <motion.h1 className="moon-text animate-shimmer max-w-4xl font-serif text-5xl leading-[.96] tracking-[.085em] drop-shadow-[0_0_34px_rgba(234,244,255,.22)] md:text-[5.45rem]" initial={{ opacity: 0, y: 34, filter: "blur(16px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: .15, duration: 1.25, ease: "easeOut" }}>
            KEERTHI
          </motion.h1>
          <motion.p className="mt-6 max-w-xl text-lg leading-8 text-pearl/90 drop-shadow-[0_2px_24px_rgba(0,0,0,.42)] md:text-xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .55, duration: 1 }}>
            A moonlit place where Keerthi feels treasured, gently protected, and celebrated in every little mood.
          </motion.p>
          <motion.div className="mt-9 flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .9 }}>
            <a className="halo-button rounded-full px-6 py-4" href="#Memories">Open Memories</a>
            <a className="halo-button rounded-full px-6 py-4" href="#Letters">Today&apos;s Letter</a>
            <a className="halo-button rounded-full px-6 py-4" href="#HappyCorner">Happy Corner</a>
          </motion.div>
          <p className="mt-6 text-xs uppercase tracking-[.2em] text-pearl/60 drop-shadow-[0_2px_18px_rgba(0,0,0,.4)]">Made softly by Disoo</p>
        </motion.div>
        <motion.div className="grid max-w-xl gap-3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .7, duration: 1 }}>
          {[
            ["Moon promise", "You are loved in every mood, every pause, every little version of today."],
            ["Secret code", "Dreaming. Infinite. Soft. Only. Ours."],
            ["Next stop", "Open a smile, save a happy thing, or read one letter."]
          ].map(([label, value]) => (
            <motion.article key={label} className="rounded-[20px] border border-white/15 bg-white/[.055] p-4 shadow-[0_16px_48px_rgba(0,0,0,.16)] backdrop-blur-[12px]" whileHover={{ y: -5 }}>
              <p className="text-[.62rem] uppercase tracking-[.16em] text-lavender">{label}</p>
              <p className="luxury-serif mt-2 text-lg leading-tight text-pearl">{value}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="glass fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full p-2 lg:block">
      <nav className="flex flex-col gap-2">
        {nav.map((item) => (
          <a key={item} href={`#${item}`} className="grid h-11 w-11 place-items-center rounded-full text-silver transition hover:bg-white/12 hover:text-white" title={item}>
            {item === "Home" ? <Moon size={18} /> : item === "Birthday" ? <CalendarHeart size={18} /> : item === "Memories" ? <ImagePlus size={18} /> : item === "Letters" ? <Heart size={18} /> : item === "Boost" ? <Wand2 size={18} /> : <CloudMoon size={18} />}
          </a>
        ))}
        <button className="grid h-11 w-11 place-items-center rounded-full text-silver transition hover:bg-white/12 hover:text-white" onClick={onLogout} title="Log out">
          <LogOut size={18} />
        </button>
      </nav>
    </aside>
  );
}

function BirthdayCounter() {
  const time = useCountdown();
  return (
    <section id="Birthday" className="relative z-10 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Born 16 February 2008</p>
        <h2 className="luxury-serif text-4xl text-white md:text-5xl">Keerthi&apos;s Age Counter</h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-silver">Counting every soft moment inside Keerthi&apos;s universe.</p>
        <motion.div className="glass mt-10 flex flex-wrap items-baseline justify-center gap-x-6 gap-y-3 rounded-[28px] px-6 py-6 text-center" whileHover={{ y: -4 }}>
          {Object.entries(time).map(([label, value]) => (
            <span key={label} className="luxury-serif whitespace-nowrap text-3xl text-pearl md:text-4xl">
              {String(value).padStart(label === "years" ? 1 : 2, "0")}
              <span className="ml-1 font-sans text-sm uppercase tracking-[.18em] text-silver">{label}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function MemoriesVault() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [queryText, setQueryText] = useState("");
  const [uploading, setUploading] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [active, setActive] = useState<Memory | null>(null);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setMemories(snap.docs.map((item) => ({ id: item.id, ...item.data() }) as Memory));
    });
  }, []);

  const uploadFiles = async (files: FileList | File[]) => {
    setUploadMessage("");
    if (!storage || !db) {
      setUploadMessage("Firebase Storage is not configured yet.");
      return;
    }
    const activeStorage = storage;
    const activeDb = db;
    for (const file of Array.from(files)) {
      if (!file.type.match(/^(image|video|audio)\//)) {
        setUploadMessage(`${file.name} is not a supported memory file.`);
        continue;
      }
      if (file.size > 200 * 1024 * 1024) {
        setUploadMessage(`${file.name} is larger than the 200 MB private vault limit.`);
        continue;
      }
      const kind = file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "image";
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `memories/${Date.now()}-${cleanName}`;
      const task = uploadBytesResumable(ref(activeStorage, path), file);
      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snapshot) => setUploading(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
          (error) => {
            setUploading(0);
            setUploadMessage(error.message);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            await addDoc(collection(activeDb, "memories"), {
              name: file.name,
              url,
              path,
              type: kind,
              favorite: false,
              createdAt: serverTimestamp()
            });
            setUploading(0);
            setUploadMessage(`${file.name} uploaded into the private vault.`);
            resolve();
          }
        );
      }).catch(() => undefined);
    }
  };

  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void uploadFiles(event.dataTransfer.files);
  };

  const filtered = memories.filter((memory) => memory.name.toLowerCase().includes(queryText.toLowerCase()));
  const deleteActiveMemory = () => {
    if (!active || !storage || !db) return;
    const activeStorage = storage;
    const activeDb = db;
    deleteObject(ref(activeStorage, active.path))
      .then(() => deleteDoc(doc(activeDb, "memories", active.id)))
      .then(() => setActive(null))
      .catch((error) => setUploadMessage(error instanceof Error ? error.message : "Delete failed."));
  };

  return (
    <section id="Memories" className="relative z-10 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Private vault</p>
            <h2 className="luxury-serif text-4xl text-white md:text-6xl">Memories</h2>
          </div>
          <label className="halo-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3">
            <Upload size={18} /> Upload
            <input
              className="hidden"
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) void uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <div className="glass rounded-[28px] p-5">
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <Search size={18} className="text-silver" />
              <input className="w-full bg-transparent text-white outline-none" placeholder="Search memories" value={queryText} onChange={(e) => setQueryText(e.target.value)} />
            </div>
            <div className="grid min-h-60 place-items-center rounded-[24px] border border-dashed border-white/20 bg-white/[.04] p-8 text-center" onDragOver={(e) => e.preventDefault()} onDrop={drop}>
              <ImagePlus className="mb-4 text-blush" size={42} />
              <p className="text-lg text-white">Drag photos, videos, or voice notes here</p>
              <p className="mt-2 text-sm text-silver">{uploading ? `Uploading ${uploading}%` : "Firebase Storage keeps the vault private."}</p>
              {uploadMessage && <p className="mt-3 max-w-sm text-sm text-blush">{uploadMessage}</p>}
            </div>
          </div>
          <div className="grid max-h-[35rem] gap-4 overflow-auto pr-2 soft-scrollbar sm:grid-cols-2">
            {filtered.map((memory, index) => (
              <motion.article key={memory.id} className="glass group overflow-hidden rounded-[24px]" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} viewport={{ once: true }} whileHover={{ y: -6 }}>
                <button className="block aspect-[4/3] w-full overflow-hidden bg-white/5" onClick={() => setActive(memory)}>
                  {memory.type === "video" ? <video className="h-full w-full object-cover" src={memory.url} /> : memory.type === "audio" ? <div className="grid h-full place-items-center"><Music2 size={42} /></div> : <img className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={memory.url} alt={memory.name} />}
                </button>
                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="truncate text-sm text-white">{memory.name}</p>
                  <div className="flex gap-2">
                    <button className="text-blush" onClick={() => db && updateDoc(doc(db, "memories", memory.id), { favorite: !memory.favorite }).catch((error) => setUploadMessage(error.message))} aria-label="Favorite">
                      <Heart size={18} fill={memory.favorite ? "currentColor" : "none"} />
                    </button>
                    <a className="text-silver hover:text-white" href={memory.url} download aria-label="Download">
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {active && (
          <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/78 p-5 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white" onClick={() => setActive(null)} aria-label="Close"><X /></button>
            <div className="max-h-[86vh] max-w-5xl overflow-hidden rounded-[28px]">
              {active.type === "video" ? <video className="max-h-[86vh] w-full" src={active.url} controls autoPlay /> : active.type === "audio" ? <audio src={active.url} controls autoPlay /> : <img className="max-h-[86vh] w-full object-contain" src={active.url} alt={active.name} />}
            </div>
            <button className="absolute bottom-5 rounded-full bg-white/10 px-4 py-2 text-xs text-silver" onClick={deleteActiveMemory}>Delete memory</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Letters() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(todayLetter());
  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setText(todayLetter()), 16 * 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [open]);
  return (
    <section id="Letters" className="relative z-10 px-5 py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Daily letters</p>
          <h2 className="luxury-serif text-4xl text-white md:text-5xl">Love Letter System</h2>
          <p className="mt-4 text-base leading-8 text-silver">A sweet letter changes gently once every 16 hours inside Keerthi&apos;s universe.</p>
          <button className="halo-button mt-8 rounded-full px-6 py-4" onClick={() => { setText(todayLetter()); setOpen(true); }}>Open Current Letter</button>
        </div>
        <motion.div className={`paper min-h-96 rounded-[28px] p-8 shadow-glass ${open ? "" : "letter-blink"}`} animate={{ rotateX: open ? 0 : 8, scale: open ? 1 : .96 }} transition={{ duration: .9 }}>
          <p className="mb-6 text-sm uppercase tracking-[.25em] text-[#6e7180]">For Keerthi</p>
          <AnimatePresence mode="wait">
            {open ? (
              <motion.p key={text} className="luxury-serif text-2xl leading-[1.62] md:text-3xl" initial={{ opacity: 0, y: 10, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.2 }}>
                {text}
              </motion.p>
            ) : (
              <motion.div key="closed" className="grid min-h-64 place-items-center text-center" exit={{ opacity: 0 }}>
                <Heart className="mb-4 text-[#9a5571]" size={46} />
                <p className="luxury-serif text-3xl">A soft paper moon waits for you.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function BoostMode() {
  const [active, setActive] = useState<keyof typeof supportMessages>("You are loved");
  const [message, setMessage] = useState(supportMessages["You are loved"][0]);
  const wrap = useRef<HTMLDivElement>(null);
  const pickDifferent = (pool: string[]) => {
    const options = pool.filter((item) => item !== message);
    return options[Math.floor(Math.random() * options.length)] || pool[0];
  };
  useEffect(() => {
    if (!wrap.current) return;
    gsap.fromTo(wrap.current.querySelectorAll(".boost-glow"), { scale: .84, opacity: .2 }, { scale: 1, opacity: 1, stagger: .08, duration: .9, ease: "power3.out" });
  }, [message]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const allMessages = Object.values(supportMessages).flat();
      setMessage((current) => {
        const options = allMessages.filter((item) => item !== current);
        return options[Math.floor(Math.random() * options.length)] || current;
      });
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section id="Boost" className="relative z-10 px-5 py-24">
      <div ref={wrap} className="mx-auto max-w-6xl">
        <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Boost Keerthi</p>
        <h2 className="luxury-serif text-4xl text-white md:text-6xl">When You Feels Low</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {(Object.keys(supportMessages) as Array<keyof typeof supportMessages>).map((label) => (
            <button key={label} className="halo-button boost-glow rounded-[24px] bg-[linear-gradient(135deg,rgba(255,255,255,.16),rgba(203,182,255,.08))] px-4 py-6 text-left font-serif text-2xl leading-tight tracking-[.02em]" onClick={() => {
              setActive(label);
              setMessage(pickDifferent(supportMessages[label]));
            }}>
              <Sparkles className="mb-5 text-blush" />
              <span className="text-lg text-white">{label}</span>
            </button>
          ))}
        </div>
        <motion.div className="glass boost-glow relative mt-8 overflow-hidden rounded-[32px] p-8 md:p-12" key={message} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="pointer-events-none absolute inset-[-40%] bg-[conic-gradient(from_90deg,transparent,rgba(255,255,255,.14),transparent_30%)]" animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} />
          <p className="luxury-serif relative text-3xl leading-[1.45] text-white md:text-5xl">
            {message.split("").map((char, index) => (
              <motion.span key={`${char}-${index}`} className="inline-block" initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: Math.min(index * .018, .9), duration: .75 }}>
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </p>
          <div className="mt-8 flex gap-3">
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="text-blush" fill="currentColor" size={18} />)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HappyCorner() {
  type HappyThing = { text: string; tag: string };
  const joyMessages = [
    "Keerthi, your smile makes this whole moon world feel awake.",
    "One tiny laugh from you is enough to turn today softer.",
    "You are cute in the quietest, most impossible-to-ignore way.",
    "Disoo would choose your happiness in every universe.",
    "Your heart is precious even on the days it feels tired.",
    "You deserve a day that treats you as gently as moonlight."
  ];
  const hugMessages = [
    "A warm little hug reached Keerthi.",
    "This hug says: rest, smile, and feel safe.",
    "Moonlight hug delivered by Disoo.",
    "A soft hug is holding the heavy part for a minute."
  ];
  const complimentMessages = [
    "Your kindness is not small. It changes the whole room.",
    "Your quiet heart is one of the prettiest things about you.",
    "You are rare in a way that cannot be copied.",
    "Even your shy smile feels like a soft celebration.",
    "You make love feel calm, safe, and beautiful."
  ];
  const missionMessages = [
    "Drink water and smile at yourself once.",
    "Send one cute voice note or tiny text.",
    "Save one thing that makes you happy.",
    "Take one slow breath and remember you are loved.",
    "Think of one thing Keerthi did that made today better."
  ];
  const [joy, setJoy] = useState("Tap once for a reason to smile.");
  const [hug, setHug] = useState("A little moon hug is waiting.");
  const [mission, setMission] = useState("Choose one button and let the page answer softly.");
  const [task, setTask] = useState("Send her one kind sentence today.");
  const [smiles, setSmiles] = useState(0);
  const [score, setScore] = useState(38);
  const [note, setNote] = useState("");
  const [noteTag, setNoteTag] = useState("Smile");
  const [notes, setNotes] = useState<HappyThing[]>([]);
  const [notesReady, setNotesReady] = useState(false);
  const pick = (items: string[], current: string) => {
    const options = items.filter((item) => item !== current);
    return options[Math.floor(Math.random() * options.length)] || items[0];
  };
  const liftScore = (amount: number) => {
    setScore((value) => Math.min(100, value + amount));
    setSmiles((value) => value + 1);
  };
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("keerthiHappyNotes");
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
    setNotesReady(true);
  }, []);
  useEffect(() => {
    if (!notesReady) return;
    try {
      window.localStorage.setItem("keerthiHappyNotes", JSON.stringify(notes.slice(0, 8)));
    } catch {}
  }, [notes, notesReady]);

  return (
    <section id="HappyCorner" className="relative z-10 overflow-hidden px-5 py-24">
      <div className="pointer-events-none absolute inset-x-[-8%] top-20 h-64 bg-[radial-gradient(circle_at_18%_22%,rgba(255,214,231,.2),transparent_18rem),radial-gradient(circle_at_80%_40%,rgba(143,216,255,.13),transparent_20rem)] blur" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Happy corner</p>
            <h2 className="luxury-serif text-4xl text-white md:text-6xl">Tiny Things to make you happy</h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-silver lg:ml-auto">A little joy console for instant smiles, soft hugs, happy notes, and tiny missions made only for her mood.</p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[.78fr_1.3fr_.88fr]">
          <aside className="glass rounded-[34px] p-6">
            <p className="text-xs uppercase tracking-[.25em] text-lavender">Joy controls</p>
            <div className="my-5 h-2 overflow-hidden rounded-full border border-white/10 bg-white/10">
              <motion.span className="block h-full rounded-full bg-[linear-gradient(90deg,#ffd6e7,#cbb6ff,#8fd8ff)]" animate={{ width: `${score}%` }} />
            </div>
            {[
              ["Open a smile", () => { setJoy(pick(joyMessages, joy)); setMission("Smile jar opened. Keep this one close."); liftScore(12); }],
              ["Send pocket hug", () => { setHug(pick(hugMessages, hug)); setMission("Pocket hug delivered. Stay soft for one minute."); liftScore(18); }],
              ["New compliment", () => { setJoy(pick(complimentMessages, joy)); setMission("New compliment unlocked for Keerthi."); liftScore(12); }],
              ["Tiny mission", () => { setTask(pick(missionMessages, task)); setMission("Tiny mission ready. Do it whenever the heart feels calm."); setScore((value) => Math.min(100, value + 8)); }]
            ].map(([label, action]) => (
              <button key={String(label)} className="halo-button mb-3 w-full rounded-[18px] px-4 py-3 text-left" onClick={action as () => void}>{String(label)}</button>
            ))}
            <p className="mt-2 rounded-[22px] border border-white/10 bg-white/10 p-4 text-sm leading-6 text-pearl">{mission}</p>
          </aside>
          <motion.article className="glass relative grid min-h-[420px] place-items-center overflow-hidden rounded-[34px] p-8 text-center" whileHover={{ y: -6 }}>
            <motion.div className="pointer-events-none absolute inset-12 rounded-full border border-white/10" animate={{ rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }} />
            <motion.div className="pointer-events-none absolute inset-24 rounded-full border border-blush/15" animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
            <div className="relative z-10 max-w-xl">
              <motion.div className="mx-auto mb-6 grid h-32 w-32 place-items-center rounded-full bg-[radial-gradient(circle,#fff9f0,rgba(255,214,231,.58)_42%,rgba(203,182,255,.18)_68%,transparent_70%)] text-[#6d4d69] shadow-[0_0_70px_rgba(255,214,231,.3)]" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4.8, repeat: Infinity }}>
                <Heart fill="currentColor" />
              </motion.div>
              <p className="text-xs uppercase tracking-[.25em] text-lavender">Today&apos;s smile</p>
              <p className="luxury-serif mt-3 text-4xl leading-none text-pearl md:text-6xl">{joy}</p>
              <p className="luxury-serif mt-5 text-2xl leading-snug text-pearl/85">{hug}</p>
            </div>
          </motion.article>
          <aside className="glass rounded-[34px] p-6">
            <p className="text-xs uppercase tracking-[.25em] text-lavender">Things that make you happy</p>
            <textarea className="mt-4 w-full resize-none rounded-2xl border border-white/15 bg-white/10 p-4 text-white outline-none" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Write something that makes you happy..." />
            <select className="mt-3 w-full rounded-full border border-white/15 bg-white/10 px-4 py-3 text-pearl outline-none" value={noteTag} onChange={(event) => setNoteTag(event.target.value)}>
              {["Smile", "Comfort", "Memory", "Dream", "Cute"].map((tag) => <option key={tag} className="bg-[#11182a] text-white">{tag}</option>)}
            </select>
            <button className="halo-button my-4 rounded-full px-5 py-3" onClick={() => { if (!note.trim()) return; setNotes([{ text: note.trim(), tag: noteTag }, ...notes].slice(0, 8)); setMission("Saved one thing that makes you happy."); setNote(""); }}>Save thing</button>
            <div className="grid max-h-40 gap-2 overflow-auto">
              {notes.length ? notes.map((item, index) => (
                <article key={`${item.text}-${index}`} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-pearl">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-blush/15 px-3 py-1 text-[.65rem] uppercase tracking-[.14em] text-blush">{item.tag}</span>
                    <button className="rounded-full bg-white/10 px-3 py-1 text-xs text-pearl" onClick={() => { setNotes(notes.filter((_, itemIndex) => itemIndex !== index)); setMission("One saved thing was deleted."); }}>Delete</button>
                  </div>
                  <p>{item.text}</p>
                </article>
              )) : <p className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-pearl">No things saved yet. Add something that makes you happy.</p>}
            </div>
          </aside>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 text-pearl"><strong>Smile bank</strong><p className="mt-2 text-sm leading-6 text-silver">{smiles} smiles opened today.</p></div>
          <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 text-pearl"><strong>Disoo code</strong><p className="mt-2 text-sm leading-6 text-silver">Dreaming. Infinite. Soft. Only. Ours.</p></div>
          <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 text-pearl"><strong>Next tiny task</strong><p className="mt-2 text-sm leading-6 text-silver">{task}</p></div>
        </div>
      </div>
    </section>
  );
}

function ExcitementLab() {
  const messages = [
    "Keerthi gets a soft sparkle: her smile is the prettiest part of this universe.",
    "Keerthi gets a moon wish: may today feel lighter, sweeter, and kinder to her heart.",
    "Keerthi gets a tiny celebration: every star here is clapping for her happiness.",
    "Keerthi gets a secret crown: she is rare, precious, and impossible to replace.",
    "Keerthi gets a comfort glow: she can rest here without explaining anything.",
    "Keerthi gets a dream note: the best little future is saving space for her smile."
  ];
  const tickets = [
    ["Smile ticket", "Keerthi gets one tiny reason to smile: her softness makes this universe feel warmer."],
    ["Comfort ticket", "Keerthi gets a quiet reminder: she is safe here, loved gently, and never too much."],
    ["Dream ticket", "Keerthi gets one little dream kept safe under the moon until it becomes real."]
  ];
  const [message, setMessage] = useState("Spin the moon wheel to reveal a sweet surprise made for Keerthi.");
  const [turns, setTurns] = useState(0);
  const [openTicket, setOpenTicket] = useState<number | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const particles = useMemo(() => {
    void burstKey;
    return Array.from({ length: 36 }, (_, index) => ({
      id: index,
      x: Math.random() * 520 - 260,
      y: Math.random() * 360 - 180,
      delay: Math.random() * .18
    }));
  }, [burstKey]);
  const celebrate = () => setBurstKey((value) => value + 1);
  const spin = () => {
    const options = messages.filter((item) => item !== message);
    setMessage(options[Math.floor(Math.random() * options.length)] || messages[0]);
    setTurns((value) => value + 1);
    celebrate();
  };

  return (
    <section id="excitementLab" className="relative z-10 overflow-hidden px-5 py-24">
      <div className="pointer-events-none absolute inset-x-[-12%] top-16 h-80 bg-[radial-gradient(circle_at_18%_30%,rgba(255,214,231,.24),transparent_19rem),radial-gradient(circle_at_72%_16%,rgba(143,216,255,.16),transparent_20rem)] blur-lg" />
      <div className="relative mx-auto max-w-6xl">
        <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Surprise lab</p>
        <h2 className="luxury-serif text-4xl text-white md:text-6xl">Little excitement for Keerthi</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-silver">Every spin, star shower, and secret ticket here is saved for Keerthi, so she can open tiny happy surprises one by one.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <article className="glass relative overflow-hidden rounded-[34px] p-7">
            <div className="relative grid min-h-[390px] place-items-center overflow-hidden rounded-[30px] bg-white/[.06] text-center">
              <AnimatePresence>
                {particles.map((particle) => (
                  <motion.span
                    key={`${burstKey}-${particle.id}`}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-pearl shadow-[0_0_18px_rgba(255,249,240,.8)]"
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{ opacity: 0, x: particle.x, y: particle.y, scale: 2 }}
                    transition={{ duration: 1.1, delay: particle.delay }}
                  />
                ))}
              </AnimatePresence>
              <div className="relative z-10 max-w-2xl px-4">
                <motion.div
                  className="relative mx-auto mb-6 grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(from_40deg,#ffd6e7,#cbb6ff,#8fd8ff,#fff9f0,#ffd6e7)] shadow-[0_0_70px_rgba(255,214,231,.28)] before:absolute before:-top-3 before:border-x-[13px] before:border-b-[22px] before:border-x-transparent before:border-b-pearl before:drop-shadow-[0_0_12px_rgba(255,249,240,.75)]"
                  animate={{ rotate: turns * 720, scale: turns ? [1, 1.08, 1] : 1 }}
                  transition={{ duration: .9, ease: [.2, .8, .2, 1] }}
                >
                  <span className="grid h-28 w-28 place-items-center rounded-full bg-[#0e1424]/75 px-4 text-center text-lg leading-tight text-pearl">For Keerthi</span>
                </motion.div>
                <p className="text-xs uppercase tracking-[.25em] text-lavender">Keerthi&apos;s next surprise</p>
                <p className="luxury-serif mt-4 min-h-24 text-4xl leading-none text-pearl md:text-5xl">{message}</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <button className="halo-button rounded-full px-5 py-3" onClick={spin}>Spin for Keerthi</button>
                  <button className="halo-button rounded-full px-5 py-3" onClick={celebrate}>Shower stars</button>
                </div>
              </div>
            </div>
          </article>
          <aside className="glass grid gap-4 rounded-[34px] p-7">
            <p className="text-xs uppercase tracking-[.25em] text-lavender">Secret tickets for her</p>
            {tickets.map(([title, body], index) => {
              const isOpen = openTicket === index;
              return (
                <motion.button
                  key={title}
                  className="rounded-[24px] border border-white/15 bg-white/10 p-5 text-left text-pearl"
                  whileHover={{ y: -5 }}
                  onClick={() => { setOpenTicket(isOpen ? null : index); celebrate(); }}
                >
                  <small className="mb-2 block text-xs uppercase tracking-[.22em] text-lavender">Ticket {index + 1}</small>
                  <strong className="luxury-serif text-2xl font-normal">{title}</strong>
                  <AnimatePresence>
                    {isOpen && <motion.p className="mt-3 text-sm leading-7 text-silver" initial={{ opacity: 0, y: 12, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: 8 }}>{body}</motion.p>}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </aside>
        </div>
      </div>
    </section>
  );
}

function UniverseFeatures() {
  const [mood, setMood] = useState<keyof typeof moodReplies>("Calm");
  const [wish, setWish] = useState("");
  const [wishes, setWishes] = useState(["Smile a little more tonight", "Remember how loved you are"]);
  const [wishesReady, setWishesReady] = useState(false);
  const [starMessage, setStarMessage] = useState("Tap the stars to reveal a hidden message.");
  const [openPromise, setOpenPromise] = useState<number | null>(null);
  const stars = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ id: i, left: 4 + Math.random() * 92, top: 8 + Math.random() * 82 })), []);
  const revealStar = () => {
    const options = hiddenStars.filter((message) => message !== starMessage);
    setStarMessage(options[Math.floor(Math.random() * options.length)] || hiddenStars[0]);
  };
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("keerthiWishes");
      if (saved) setWishes(JSON.parse(saved));
    } catch {}
    setWishesReady(true);
  }, []);
  useEffect(() => {
    if (!wishesReady) return;
    try {
      window.localStorage.setItem("keerthiWishes", JSON.stringify(wishes.slice(0, 30)));
    } catch {}
  }, [wishes, wishesReady]);

  return (
    <>
      <section id="Rituals" className="relative z-10 px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Private rituals</p>
          <h2 className="font-serif text-4xl tracking-[.05em] text-white md:text-5xl">Universe Rituals For Keerthi</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <article className="glass rounded-[28px] p-7">
              <h3 className="luxury-serif text-3xl text-white">Moon Mood Ritual</h3>
              <p className="mt-3 text-sm leading-7 text-silver">Choose how Keerthi feels and the universe answers softly.</p>
              <div className="my-5 flex flex-wrap gap-2">
                {Object.keys(moodReplies).map((label) => (
                  <button key={label} className="halo-button rounded-full px-4 py-2 text-sm" onClick={() => setMood(label as keyof typeof moodReplies)}>{label}</button>
                ))}
              </div>
              <p className="luxury-serif text-2xl leading-snug text-pearl">{moodReplies[mood]}</p>
            </article>
            <article className="glass rounded-[28px] p-7">
              <h3 className="luxury-serif text-3xl text-white">Wish Jar</h3>
              <p className="mt-3 text-sm leading-7 text-silver">Save little wishes and promises for later.</p>
              <textarea className="mt-5 w-full resize-none rounded-2xl border border-white/15 bg-white/10 p-4 text-white outline-none" rows={3} value={wish} onChange={(e) => setWish(e.target.value)} placeholder="Write a wish..." />
              <button className="halo-button my-4 rounded-full px-5 py-3" onClick={() => { if (wish.trim()) { setWishes([wish.trim(), ...wishes]); setWish(""); } }}>Add wish</button>
              <div className="flex min-h-24 flex-wrap gap-2">
                {wishes.map((item, index) => (
                  <span key={`${item}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm text-pearl">
                    {item}
                    <button className="rounded-full bg-blush/15 px-3 py-1 text-xs" onClick={() => setWishes(wishes.filter((_, itemIndex) => itemIndex !== index))} aria-label="Delete wish">Delete</button>
                  </span>
                ))}
              </div>
            </article>
            <article className="glass rounded-[28px] p-7 text-center">
              <h3 className="luxury-serif text-3xl text-white">Calm Breathing</h3>
              <p className="mt-3 text-sm leading-7 text-silver">A gentle moon breath animation for low moments.</p>
              <motion.div className="mx-auto my-8 h-44 w-44 rounded-full bg-[radial-gradient(circle,#fff,rgba(203,182,255,.6)_38%,rgba(255,214,231,.18)_66%,transparent_68%)] shadow-[0_0_70px_rgba(234,244,255,.34)]" animate={{ scale: [.78, 1.08, .78] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
              <p className="luxury-serif text-2xl text-pearl">Breathe in moonlight</p>
            </article>
          </div>
        </div>
      </section>
      <section id="Timeline" className="relative z-10 px-5 py-[70px]">
        <div className="mx-auto grid max-w-[1220px] items-center gap-7 lg:grid-cols-[.52fr_1.48fr]">
          <div className="max-w-[430px]">
            <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Soft archive</p>
            <h2 className="luxury-serif max-w-[420px] text-5xl leading-[1.04] tracking-[.015em] text-white md:text-[3.85rem]">
              <span className="block whitespace-nowrap">Four promises</span>
              <span className="block whitespace-nowrap text-[.82em] text-moon/85">by DJ</span>
            </h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-silver">Small promises, protected like silver memories.</p>
          </div>
          <div className="glass relative ml-auto grid min-h-[390px] w-full max-w-[860px] overflow-hidden rounded-[28px] p-6">
            <motion.div className="pointer-events-none absolute inset-[-40%] bg-[conic-gradient(from_120deg,transparent,rgba(255,249,240,.12),rgba(255,214,231,.08),transparent_34%)]" animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} />
            {promises.map((promise, index) => (
              <motion.button key={promise} className="relative mb-3.5 overflow-hidden rounded-[24px] border border-white/10 bg-white/8 p-0 text-left last:mb-0 hover:border-blush/30" onClick={() => setOpenPromise(openPromise === index ? null : index)} animate={{ scale: openPromise === index ? 1.018 : 1, boxShadow: openPromise === index ? "0 0 58px rgba(255,214,231,.22), 0 28px 90px rgba(0,0,0,.22)" : "none" }}>
                <motion.span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_12%,rgba(255,249,240,.18),transparent_34%)]" animate={{ x: ["-120%", "120%"] }} transition={{ duration: openPromise === index ? 2.4 : 4.8, repeat: Infinity, ease: "easeInOut" }} />
                <span className="relative flex items-center justify-between gap-3 p-5">
                  <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[.18em] text-lavender">
                    <motion.span className="grid h-9 w-9 place-items-center rounded-full bg-[radial-gradient(circle,#fff9f0,rgba(255,214,231,.48)_50%,rgba(203,182,255,.18)_72%)] text-sm tracking-normal text-[#72516e] shadow-[0_0_24px_rgba(255,214,231,.32)]" animate={openPromise === index ? { scale: [0.75, 1.08, 1] } : { scale: 1 }} transition={{ duration: .7 }}>{index + 1}</motion.span>
                    Promise {index + 1}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-pearl/70">{openPromise === index ? "Close -" : "Open promise +"}</span>
                </span>
                <AnimatePresence>
                  {openPromise === index && (
                    <motion.span className="luxury-serif relative block px-20 pb-6 text-2xl leading-snug text-white md:text-[1.75rem]" initial={{ opacity: 0, y: 18, scale: .96, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(6px)" }} transition={{ duration: .8, ease: "easeOut" }}>
                      {promise}
                      <motion.span className="mt-4 block h-px bg-[linear-gradient(90deg,transparent,rgba(255,249,240,.7),rgba(255,214,231,.42),transparent)]" animate={{ x: [0, 18, 0], opacity: [1, .35, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
      <section id="Stars" className="relative z-10 px-5 py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <button className="glass relative h-64 overflow-hidden rounded-[28px] text-left" onClick={revealStar} aria-label="Reveal constellation message">
            {stars.map((star) => (
              <span key={star.id} className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,white_0_18%,rgba(255,255,255,.18)_20%,transparent_62%)] shadow-[0_0_18px_white]" style={{ left: `${star.left}%`, top: `${star.top}%` }} />
            ))}
          </button>
          <div>
            <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Secret sky</p>
            <h2 className="luxury-serif text-4xl text-white md:text-5xl">Constellation Message</h2>
            <p className="luxury-serif mt-5 text-3xl leading-snug text-pearl">{starMessage}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function Widgets() {
  const [weather, setWeather] = useState("Peaceful night");
  const [showSurprise, setShowSurprise] = useState(false);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m,weather_code`;
        const data = await fetch(url).then((r) => r.json());
        setWeather(`${Math.round(data.current.temperature_2m)}°C moon air`);
      } catch {
        setWeather("Weather resting softly");
      }
    });
  }, []);
  return (
    <>
      <section id="Moon" className="relative z-10 px-5 pb-36 pt-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Moon dashboard</p>
          <h2 className="luxury-serif text-4xl text-white md:text-6xl">Today&apos;s Moon Mood</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Weather", weather, <CloudMoon key="w" />],
              ["Moon phase", moonPhase(), <Moon key="m" />],
              ["Couple timeline", "A living archive of moments", <CalendarHeart key="c" />]
            ].map(([title, value, icon]) => (
              <motion.div key={String(title)} className="glass rounded-[28px] p-7" whileHover={{ y: -6 }}>
                <div className="mb-8 text-blush">{icon}</div>
                <p className="text-sm uppercase tracking-[.28em] text-lavender">{title}</p>
                <p className="luxury-serif mt-3 text-3xl text-white">{value}</p>
              </motion.div>
            ))}
          </div>
          <button className="halo-button mt-8 rounded-full px-6 py-4" onClick={() => setShowSurprise(true)}>
            Secret Surprise
          </button>
        </div>
      </section>
      <AnimatePresence>
        {showSurprise && (
          <motion.div className="fixed inset-0 z-[95] grid place-items-center bg-[#020817]/90 p-6 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSurprise(false)}>
            <motion.div className="relative max-w-3xl overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,rgba(255,249,240,.97),rgba(231,240,255,.94))] p-10 text-[#182033] shadow-[0_0_120px_rgba(255,214,231,.34)]" initial={{ y: 40, scale: .84, rotateX: 18, filter: "blur(12px)" }} animate={{ y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }} exit={{ y: 24, scale: .92, opacity: 0 }} onClick={(event) => event.stopPropagation()}>
              {Array.from({ length: 42 }, (_, index) => (
                <motion.i key={index} className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-blush shadow-[0_0_24px_rgba(255,214,231,.9)]" animate={{ x: Math.random() * 760 - 380, y: Math.random() * 520 - 260, scale: [1, 3], opacity: [1, 0] }} transition={{ duration: 1.15, delay: Math.random() * .18 }} />
              ))}
              <p className="relative mt-0 text-sm uppercase tracking-[.28em] text-[#8d6b89]">A secret for Keerthi</p>
              <h2 className="luxury-serif relative mb-5 text-5xl leading-none">You are the universe.</h2>
              <p className="luxury-serif relative text-2xl leading-relaxed">Keerthi, this little world opens because you exist in it. Every star here is a tiny reminder that you are loved, chosen, and beautifully impossible to replace.</p>
              <button className="halo-button relative mt-6 rounded-full px-5 py-3 text-[#182033]" onClick={() => setShowSurprise(false)}>Close softly</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ExitSection() {
  const [open, setOpen] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const stars = useMemo(() => {
    void burstKey;
    return Array.from({ length: 72 }, (_, index) => ({
      id: index,
      x: Math.random() * 900 - 450,
      y: Math.random() * 620 - 310,
      delay: Math.random() * .24
    }));
  }, [burstKey]);
  const openExit = () => {
    setBurstKey((value) => value + 1);
    setOpen(true);
  };
  const returnHome = () => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <section id="Exit" className="relative z-10 overflow-hidden px-5 pb-40 pt-24">
        <div className="pointer-events-none absolute inset-x-[-12%] top-16 h-80 bg-[radial-gradient(circle_at_25%_35%,rgba(255,214,231,.2),transparent_18rem),radial-gradient(circle_at_76%_45%,rgba(143,216,255,.16),transparent_19rem)] blur-lg" />
        <motion.div className="glass relative mx-auto max-w-5xl overflow-hidden rounded-[38px] p-10 text-center" whileHover={{ y: -6 }}>
          <motion.div className="mx-auto mb-6 grid h-32 w-32 place-items-center rounded-full bg-[radial-gradient(circle,#fff9f0,rgba(255,214,231,.58)_44%,rgba(203,182,255,.22)_68%,transparent_70%)] font-serif text-2xl text-[#704f6d] shadow-[0_0_86px_rgba(255,214,231,.34)]" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4.8, repeat: Infinity }}>
            bye
          </motion.div>
          <p className="mb-3 text-sm uppercase tracking-[.34em] text-lavender">Last little moon door</p>
          <h2 className="luxury-serif text-4xl text-white md:text-6xl">Exit with a smile, Keerthi</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-silver">When Keerthi is ready to leave, the universe closes softly with stars, love, and one final happy reminder from Disoo.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button className="halo-button rounded-full px-6 py-4" onClick={openExit}>Open exciting exit</button>
            <a className="halo-button rounded-full px-6 py-4" href="#Home">Stay in universe</a>
          </div>
        </motion.div>
      </section>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[120] grid place-items-center bg-[#020817]/90 p-6 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            {stars.map((star) => (
              <motion.i key={`${burstKey}-${star.id}`} className="pointer-events-none fixed left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-pearl shadow-[0_0_24px_rgba(255,249,240,.9)]" initial={{ opacity: 1, x: 0, y: 0, scale: 1 }} animate={{ opacity: 0, x: star.x, y: star.y, scale: 2.8, rotate: 240 }} transition={{ duration: 1.35, delay: star.delay }} />
            ))}
            <motion.div className="relative max-w-3xl overflow-hidden rounded-[38px] bg-[linear-gradient(135deg,rgba(255,249,240,.97),rgba(232,241,255,.94))] p-10 text-center text-[#182033] shadow-[0_0_140px_rgba(255,214,231,.34)]" initial={{ y: 40, scale: .84, rotateX: 18, filter: "blur(12px)" }} animate={{ y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }} exit={{ y: 24, scale: .92, opacity: 0 }} onClick={(event) => event.stopPropagation()}>
              <h2 className="luxury-serif mb-5 text-5xl leading-none md:text-7xl">Goodnight, Keerthi</h2>
              <p className="mx-auto max-w-2xl text-lg leading-8">The moon is closing this little universe gently, but every soft note here stays saved for your smile. Come back whenever your heart wants a little light.</p>
              <button className="halo-button mt-7 rounded-full px-6 py-4 text-[#182033]" onClick={returnHome}>Return to beginning</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function VoiceMessage() {
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const start = async () => {
    setMessage("");
    if (!storage || !db) {
      setMessage("Firebase is not configured yet.");
      return;
    }
    const activeStorage = storage;
    const activeDb = db;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(stream);
      chunks.current = [];
      recorder.current.ondataavailable = (event) => chunks.current.push(event.data);
      recorder.current.onstop = async () => {
        try {
          const blob = new Blob(chunks.current, { type: "audio/webm" });
          const path = `memories/voice-${Date.now()}.webm`;
          const task = uploadBytesResumable(ref(activeStorage, path), blob);
          await new Promise<void>((resolve, reject) => {
            task.on("state_changed", undefined, reject, () => resolve());
          });
          const url = await getDownloadURL(task.snapshot.ref);
          await addDoc(collection(activeDb, "memories"), { name: "Voice message", url, path, type: "audio", favorite: true, createdAt: serverTimestamp() });
          setMessage("Voice note saved.");
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Voice note upload failed.");
        }
      };
      recorder.current.start();
      setRecording(true);
    } catch {
      setMessage("Microphone permission was not granted.");
    }
  };
  const stop = () => {
    recorder.current?.stop();
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };
  return (
    <div className="fixed right-4 top-4 z-40">
      <button className="halo-button flex items-center gap-2 rounded-full px-4 py-3" onClick={() => (recording ? stop() : void start())}>
        <Music2 size={17} /> {recording ? "Save voice" : "Voice note"}
      </button>
      {message && <p className="mt-2 max-w-56 rounded-2xl bg-black/35 px-3 py-2 text-xs text-blush backdrop-blur">{message}</p>}
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown | null>(null);
  const [blockedMessage, setBlockedMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (next: any) => {
      if (next && !isAllowedEmail(next.email)) {
        setBlockedMessage("Unauthorized user blocked.");
        await signOut(auth);
        setUser(null);
      } else if (next && !next.emailVerified) {
        setBlockedMessage("Email verification required before entry.");
        await signOut(auth);
        setUser(null);
      } else {
        setBlockedMessage("");
        setUser(next);
      }
    });
  }, []);

  if (!user) {
    return (
      <>
        <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>
        <LoginScreen />
        {blockedMessage && <p className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-blush/20 px-5 py-3 text-sm text-blush">{blockedMessage}</p>}
      </>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>
      <AmbientField />
      <MouseSparkles />
      <RippleLayer />
      <Sidebar onLogout={() => auth && void signOut(auth)} />
      <VoiceMessage />
      <Hero />
      <BirthdayCounter />
      <MemoriesVault />
      <Letters />
      <BoostMode />
      <HappyCorner />
      <ExcitementLab />
      <UniverseFeatures />
      <Widgets />
      <ExitSection />
      <MusicSystem />
    </main>
  );
}
