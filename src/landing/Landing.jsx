import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Scene3D, { getScrollIndex } from './Scene3D.jsx';
import { executeNaturalLanguageSearch } from '../engines/askEngine.js';
import { calculateMatchScore } from '../engines/matchingEngine.js';
import {
  FACTORS,
  INTENTS,
  NETWORK,
  OUTCOME_LADDER,
  PROMPTS,
  SECTIONS,
  VISITOR,
  initials,
  roleColor,
} from './data.js';
import { getStoredTheme, setAppTheme, THEME_CHANGE_EVENT } from '../core/theme.js';
import './landing.css';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const goToApp = () => {
  window.location.hash = '#/app';
  window.scrollTo(0, 0);
};

const scrollToId = (id) => (e) => {
  e?.preventDefault?.();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const pad = (n) => String(n).padStart(2, '0');
const DOTS = ['#C9B8FF', '#FFB89A', '#9FE3C1', '#A9CBFF', '#FFDC85', '#FFB3CF'];

/** Button that leans toward the cursor. */
function Magnetic({ as: Tag = 'button', strength = 0.3, className = '', children, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    ref.current.style.transform = '';
  };
  return (
    <Tag ref={ref} className={`lp-mag ${className}`} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>
      <span className="lp-mag-inner">{children}</span>
    </Tag>
  );
}

/** Animated number that eases to its target. */
function CountUp({ value, duration = 900 }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(a + (value - a) * e));
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{shown}</>;
}

/** Custom cursor: a dot plus a lagging ring that grows over interactive things. */
function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches;
  });

  useEffect(() => {
    const check = () => {
      const touch = window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches;
      setIsTouch(touch);
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    document.body.classList.add('lp-has-cursor');
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const lag = { ...pos };
    let raf;
    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const interactive = e.target.closest?.('a, button, input, select, [data-cursor]');
      ring.current?.classList.toggle('is-active', !!interactive || document.body.classList.contains('lp-hover-3d'));
    };
    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.16;
      lag.y += (pos.y - lag.y) * 0.16;
      if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${lag.x}px, ${lag.y}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      document.body.classList.remove('lp-has-cursor');
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <>
      <div ref={ring} className="lp-cursor-ring" aria-hidden="true" />
      <div ref={dot} className="lp-cursor-dot" aria-hidden="true" />
    </>
  );
}

/** Intro counter that wipes away. */
function Preloader({ onDone }) {
  const [n, setN] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const start = performance.now();
    const total = 1400;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / total);
      setN(Math.round((1 - Math.pow(1 - t, 2)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        setLeaving(true);
        setTimeout(onDone, 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return (
    <div className={`lp-preloader ${leaving ? 'is-leaving' : ''}`} aria-hidden="true">
      <span className="lp-mono">Calibrating intent</span>
      <span className="lp-preloader-n">{String(n).padStart(3, '0')}</span>
      <span className="lp-mono">Proviqra ©2026</span>
    </div>
  );
}

/** Words that fill in as the section scrolls through the viewport. */
function ScrubText({ text, className = '' }) {
  const ref = useRef(null);
  const words = useMemo(() => text.split(' '), [text]);
  useEffect(() => {
    const el = ref.current;
    const spans = el.querySelectorAll('span');
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = p * spans.length;
      spans.forEach((s, i) => {
        s.style.opacity = String(0.14 + 0.86 * Math.min(1, Math.max(0, lit - i)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const em = w.startsWith('*');
        const clean = w.replace(/\*/g, '');
        return (
          <span key={i} className={em ? 'is-em' : ''}>
            {clean}{' '}
          </span>
        );
      })}
    </p>
  );
}

/** Adds `.is-in` to `.lp-reveal` elements as they enter the viewport. */
function useReveal(ready) {
  useEffect(() => {
    if (!ready) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.lp-reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Landing() {
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  const progressRef = useRef(null);

  // Live Ask demo state
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const touched = useRef(false);

  // Anatomy state
  const [pairA, setPairA] = useState('user_1');
  const [pairB, setPairB] = useState('user_2');
  const [hoverFactor, setHoverFactor] = useState(null);

  // CTA
  const [intent, setIntent] = useState(INTENTS[0]);

  useReveal(ready);
  const onLoaded = useCallback(() => setReady(true), []);

  const [theme, setTheme] = useState(getStoredTheme);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setAppTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.title = 'Proviqra — Say what you need. Meet who fits.';
    const current = getStoredTheme();
    setTheme(current);
    document.documentElement.setAttribute('data-theme', current);

    const onThemeChange = (e) => {
      if (e.detail && (e.detail === 'dark' || e.detail === 'light')) {
        setTheme(e.detail);
      }
    };
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  // Scroll progress + section indicator
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      setStage(Math.round(getScrollIndex()));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const runAsk = useCallback((q) => {
    if (!q.trim()) return;
    const res = executeNaturalLanguageSearch(q, VISITOR, NETWORK);
    setSearch(res);
    setFocusId(res.results[0]?.candidate.id ?? null);
  }, []);

  // Auto-demo: type the first prompt into the Ask bar once, unless the visitor gets there first.
  useEffect(() => {
    if (!ready) return;
    const text = PROMPTS[0];
    let i = 0;
    let timer = setTimeout(function type() {
      if (touched.current) return;
      i += 1;
      setQuery(text.slice(0, i));
      if (i < text.length) timer = setTimeout(type, 22);
      else timer = setTimeout(() => !touched.current && runAsk(text), 350);
    }, 900);
    return () => clearTimeout(timer);
  }, [ready, runAsk]);

  const onPrompt = (p) => {
    touched.current = true;
    setQuery(p);
    runAsk(p);
  };

  const userA = NETWORK.find((u) => u.id === pairA);
  const userB = NETWORK.find((u) => u.id === pairB);
  const match = useMemo(() => calculateMatchScore(userA, userB), [userA, userB]);

  const focusResult = search?.results.find((r) => r.candidate.id === focusId);
  const criteria = search?.parsed.criteria;
  const chips = criteria
    ? [
        criteria.role && ['Role', criteria.role],
        ...criteria.skills.map((s) => ['Skill', s]),
        criteria.location && ['Location', criteria.location],
        criteria.commitment && ['Commitment', criteria.commitment],
        criteria.industry && ['Industry', criteria.industry],
      ].filter(Boolean)
    : [];

  return (
    <div className="lp" data-stage={stage}>
      {!ready && <Preloader onDone={onLoaded} />}
      <Cursor />
      <div className="lp-grain" aria-hidden="true" />
      <div className="lp-gridlines" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="lp-progress" ref={progressRef} aria-hidden="true" />

      <Scene3D
        results={search?.results}
        focusId={focusId}
        onFocus={(id) => {
          touched.current = true;
          setFocusId(id);
        }}
        breakdown={match?.breakdown}
        score={match?.score}
        hoverFactor={hoverFactor}
        onHoverFactor={setHoverFactor}
      />

      {/* Nav */}
      <header className={`lp-nav ${ready ? 'is-in' : ''}`}>
        <a href="#" className="lp-wordmark" onClick={scrollToId('ask')} id="nav-logo">
          Proviqra<sup>®</sup>
        </a>
        <nav className="lp-nav-links" aria-label="Primary">
          <a href="#ask" onClick={scrollToId('ask')} id="nav-demo"><i>01</i>Live demo</a>
          <a href="#anatomy" onClick={scrollToId('anatomy')} id="nav-anatomy"><i>03</i>Anatomy</a>
          <a href="#outcomes" onClick={scrollToId('outcomes')} id="nav-outcomes"><i>04</i>Outcomes</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="theme-toggle-switch"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            id="lp-theme-toggle"
            aria-label="Toggle theme mode"
          >
            <span className={`theme-toggle-indicator ${theme === 'dark' ? 'is-dark' : 'is-light'}`} />
            <span className={`theme-toggle-icon ${theme !== 'dark' ? 'active' : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </span>
            <span className={`theme-toggle-icon ${theme === 'dark' ? 'active' : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
          </button>
          <Magnetic className="lp-btn lp-btn-ink lp-btn-sm" onClick={goToApp} id="nav-launch">
            Open app <span className="lp-arrow">↗</span>
          </Magnetic>
        </div>
      </header>

      {/* Section indicator */}
      <div className="lp-indicator lp-mono" aria-hidden="true">
        <b>{pad(stage + 1)}</b> / {pad(SECTIONS.length)} — {SECTIONS[stage]}
      </div>

      <main>
        {/* 01 — Ask */}
        <section className="lp-sec lp-ask" id="ask" data-scene>
          <div className="lp-ask-copy">
            <p className="lp-label lp-reveal"><span className="lp-live" />(01) Ask the network — live demo</p>
            <h1 className="lp-display lp-reveal" style={{ '--d': '60ms' }}>
              Say what you <em>need.</em>
              <br />
              Meet who <em>fits.</em>
            </h1>
            <p className="lp-lead lp-reveal" style={{ '--d': '140ms' }}>
              Proviqra is a professional network built on <b>intent</b>, not follower counts. Type a request
              below. The engine parses it, scores everyone, and pulls the best fits toward you.
            </p>

            <form
              className="lp-askbar lp-reveal"
              style={{ '--d': '220ms' }}
              onSubmit={(e) => {
                e.preventDefault();
                touched.current = true;
                runAsk(query);
              }}
            >
              <span className="lp-askbar-icon" aria-hidden="true">⌘</span>
              <input
                id="ask-input"
                value={query}
                onChange={(e) => {
                  touched.current = true;
                  setQuery(e.target.value);
                }}
                onFocus={() => (touched.current = true)}
                placeholder="Describe who you’re looking for…"
                aria-label="Describe who you are looking for"
                autoComplete="off"
              />
              <button type="submit" className="lp-btn lp-btn-accent" id="ask-submit">
                Match <span className="lp-arrow">→</span>
              </button>
            </form>

            <div className="lp-prompts lp-reveal" style={{ '--d': '300ms' }}>
              {PROMPTS.slice(1).map((p, i) => (
                <button key={p} type="button" onClick={() => onPrompt(p)} id={`prompt-${i}`}>
                  {p}
                </button>
              ))}
            </div>

            {search && (
              <div className="lp-results" key={search.parsed.originalQuery}>
                <div className="lp-results-head">
                  <span className="lp-mono">Parsed intent</span>
                  <div className="lp-chips">
                    {chips.length ? (
                      chips.map(([k, v], i) => (
                        <span key={i} className="lp-chip"><i>{k}</i>{v}</span>
                      ))
                    ) : (
                      <span className="lp-chip"><i>Mode</i>Open match</span>
                    )}
                  </div>
                </div>
                <ol className="lp-rank">
                  {search.results.slice(0, 4).map((r, i) => (
                    <li key={r.candidate.id} style={{ '--i': i }}>
                      <button
                        type="button"
                        className={r.candidate.id === focusId ? 'is-focus' : ''}
                        onClick={() => {
                          touched.current = true;
                          setFocusId(r.candidate.id);
                        }}
                        id={`rank-${r.candidate.id}`}
                      >
                        <span className="lp-rank-n">{pad(i + 1)}</span>
                        <span className="lp-avatar" style={{ background: roleColor(r.candidate.role) }}>
                          {initials(r.candidate.name)}
                        </span>
                        <span className="lp-rank-who">
                          <b>{r.candidate.name}</b>
                          <small>{r.candidate.role} · {r.candidate.location}</small>
                        </span>
                        <span className="lp-rank-bar"><i style={{ width: `${r.score}%` }} /></span>
                        <span className="lp-rank-score">{r.score}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                {focusResult && <p className="lp-explain">{focusResult.explanation}</p>}
                <p className="lp-foot lp-mono">Computed live by Proviqra’s Ask engine · demo network of {NETWORK.length} profiles</p>
              </div>
            )}
          </div>
        </section>

        {/* 02 — Manifesto */}
        <section className="lp-sec lp-manifesto" id="manifesto" data-scene>
          <p className="lp-label lp-reveal">(02) Intent ≠ identity</p>
          <ScrubText
            className="lp-scrub"
            text="Profiles describe who you *were.* Intent says what you’ll do *next.* Proviqra matches people on the second — and shows its working."
          />
        </section>
        <div className="lp-marquee" aria-hidden="true">
          <div className="lp-marquee-track">
            {[0, 1].map((k) => (
              <div key={k} className="lp-marquee-row">
                {INTENTS.map((t, i) => (
                  <React.Fragment key={t}>
                    <span>{t}</span>
                    <i style={{ background: DOTS[i % DOTS.length] }} />
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 03 — Anatomy */}
        <section className="lp-sec lp-split lp-anatomy" id="anatomy" data-scene>
          <div className="lp-split-space" aria-hidden="true" />
          <div className="lp-split-copy">
            <p className="lp-label lp-reveal">(03) Anatomy of a match</p>
            <h2 className="lp-h2 lp-reveal">A score you can <em>read.</em></h2>
            <p className="lp-lead lp-reveal">
              Every match is 100 points across seven weighted signals. No black box. Pick any two people from the
              demo network and watch the dial rebuild.
            </p>

            <div className="lp-pair lp-reveal">
              <label>
                <span className="lp-mono">You are</span>
                <select value={pairA} onChange={(e) => { setPairA(e.target.value); if (e.target.value === pairB) setPairB(NETWORK.find((u) => u.id !== e.target.value).id); }} id="pair-a">
                  {NETWORK.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
                </select>
              </label>
              <span className="lp-pair-x" aria-hidden="true">×</span>
              <label>
                <span className="lp-mono">Matched with</span>
                <select value={pairB} onChange={(e) => setPairB(e.target.value)} id="pair-b">
                  {NETWORK.filter((u) => u.id !== pairA).map((u) => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
                </select>
              </label>
            </div>

            <div className="lp-total lp-reveal">
              <span className="lp-total-n"><CountUp value={match?.score ?? 0} /></span>
              <span className="lp-mono">/ 100 match</span>
            </div>

            <ul className="lp-factors lp-reveal">
              {FACTORS.map((f) => {
                const v = match?.breakdown[f.key] ?? 0;
                return (
                  <li
                    key={f.key}
                    className={hoverFactor === f.key ? 'is-active' : hoverFactor ? 'is-dim' : ''}
                    onMouseEnter={() => setHoverFactor(f.key)}
                    onMouseLeave={() => setHoverFactor(null)}
                    data-cursor
                  >
                    <span className="lp-factor-sw" style={{ background: f.color }} />
                    <span className="lp-factor-name">{f.label}</span>
                    <span className="lp-factor-bar"><i style={{ width: `${(v / f.max) * 100}%`, background: f.color }} /></span>
                    <span className="lp-factor-v lp-mono">{v}<small>/{f.max}</small></span>
                  </li>
                );
              })}
            </ul>

            {match && (
              <div className="lp-why lp-reveal">
                {match.reasons.slice(0, 4).map((r) => <span key={r} className="lp-why-pos">+ {r}</span>)}
                {match.gaps.slice(0, 2).map((g) => <span key={g} className="lp-why-neg">− {g}</span>)}
              </div>
            )}
          </div>
        </section>

        {/* 04 — Outcomes */}
        <section className="lp-sec lp-split lp-outcomes" id="outcomes" data-scene>
          <div className="lp-split-copy">
            <p className="lp-label lp-reveal">(04) Outcomes over connections</p>
            <h2 className="lp-h2 lp-reveal">We count what <em>happened.</em></h2>
            <p className="lp-lead lp-reveal">
              Connection counts are vanity. After every conversation, both sides log the real outcome. The matches
              that lead somewhere teach the network what works.
            </p>
            <ol className="lp-ladder">
              {[...OUTCOME_LADDER].reverse().map((o, i) => (
                <li key={o.id} className="lp-reveal" style={{ '--d': `${i * 70}ms` }}>
                  <span className="lp-ladder-pts lp-mono">+{o.points}</span>
                  <span className="lp-ladder-label">{o.label}</span>
                  <span className="lp-ladder-line" style={{ '--w': `${o.points}%` }} />
                </li>
              ))}
            </ol>
          </div>
          <div className="lp-split-space" aria-hidden="true" />
        </section>

        {/* 05 — Declare */}
        <section className="lp-sec lp-declare" id="declare" data-scene>
          <p className="lp-label lp-reveal">(05) Your move</p>
          <h2 className="lp-display lp-reveal">
            Declare your <em>intent.</em>
          </h2>
          <div className="lp-intents lp-reveal" role="radiogroup" aria-label="Choose your intent">
            {INTENTS.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={intent === t}
                className={intent === t ? 'is-on' : ''}
                onClick={() => setIntent(t)}
                id={`intent-${t.replace(/\W+/g, '-').toLowerCase()}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="lp-reveal">
            <Magnetic className="lp-btn lp-btn-accent lp-btn-xl" onClick={goToApp} strength={0.2} id="declare-launch">
              Enter Proviqra · {intent} <span className="lp-arrow">→</span>
            </Magnetic>
          </div>
          <ol className="lp-moves lp-mono lp-reveal">
            <li><b>01</b> Declare</li>
            <li><b>02</b> Get matched, with reasons</li>
            <li><b>03</b> Connect & log outcomes</li>
          </ol>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-row lp-mono">
          <span>Proviqra — professional matchmaking & intent network</span>
          <span>Explainable rule-based engine · v1</span>
          <a href="#ask" onClick={scrollToId('ask')} id="footer-top">Back to top ↑</a>
        </div>
        <div className="lp-footer-mark" aria-hidden="true">Proviqra</div>
      </footer>
    </div>
  );
}
