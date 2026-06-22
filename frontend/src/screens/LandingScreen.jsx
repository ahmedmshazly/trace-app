// Public landing page.
// A short, calm narrative that previews the tool; its CTAs lead into the
// auth gateway (Start your trace -> register, Log in -> login). Visuals are
// unchanged; only the buttons are now wired via onStart / onLogin props.
const { Logo, Button, Icon, TimelineEntry, DayHeader } = window.TRACE_UI;

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderBody(body) {
  return String(body)
    .split(/(#[A-Za-z0-9_-]+)/g)
    .map((p, i) =>
      /^#[A-Za-z0-9_-]+$/.test(p) ? (
        <span key={i} style={{ color: 'var(--color-accent-secondary)', fontWeight: 'var(--weight-medium)' }}>{p}</span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    );
}

// A quiet text link that triggers an action instead of navigating.
function QuietLink({ children, onClick, style }) {
  return (
    <a
      href="#"
      className="quiet-link"
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
    >
      {children}
    </a>
  );
}

const HERO_SCRIPT = [
  { text: 'missed the bus, ran the last block', time: '8:14 AM' },
  { text: 'finally fixed the flaky test #work', time: '11:02 AM' },
  { text: 'watched the rain for a while #home', time: '1:30 PM' },
];

function useHeroLoop() {
  const [draft, setDraft] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [enterFlash, setEnterFlash] = React.useState(false);
  const [dissolving, setDissolving] = React.useState(false);
  const alive = React.useRef(true);

  React.useEffect(() => {
    alive.current = true;

    if (REDUCED) {
      setDraft('');
      setRows(HERO_SCRIPT.map((s, i) => ({ id: i, text: s.text, time: s.time, fresh: false })).reverse());
      return () => { alive.current = false; };
    }

    const timers = [];
    const wait = (ms) => new Promise((res) => timers.push(setTimeout(res, ms)));

    async function run() {
      while (alive.current) {
        setRows([]); setDraft(''); setDissolving(false);
        await wait(800);
        for (let i = 0; i < HERO_SCRIPT.length && alive.current; i++) {
          const { text, time } = HERO_SCRIPT[i];
          for (let c = 1; c <= text.length && alive.current; c++) {
            setDraft(text.slice(0, c));
            await wait(text[c - 1] === ' ' ? 70 : 36);
          }
          if (!alive.current) return;
          await wait(440);
          setEnterFlash(true); await wait(150); setEnterFlash(false);
          setDraft('');
          const id = 'r' + i + '_' + Date.now();
          setRows((prev) => [{ id, text, time, fresh: true }, ...prev]);
          timers.push(setTimeout(() => {
            if (alive.current) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, fresh: false } : r)));
          }, 1050));
          await wait(1150);
        }
        await wait(2800);
        if (!alive.current) return;
        setDissolving(true);
        await wait(640);
      }
    }
    run();
    return () => { alive.current = false; timers.forEach(clearTimeout); };
  }, []);

  return { draft, rows, enterFlash, dissolving };
}

function HeroCaptureField({ draft, enterFlash }) {
  const empty = draft.length === 0;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: 'var(--border-width) solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px 11px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        minHeight: 28, fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)',
        lineHeight: 'var(--leading-normal)', color: empty ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {empty ? 'What just happened?' : renderBody(draft)}
        <span aria-hidden="true" className="hero-caret" style={{
          display: 'inline-block', width: 2, height: '1.05em', marginLeft: 1, verticalAlign: 'text-bottom',
          background: 'var(--color-accent-primary)', transform: 'translateY(2px)',
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-primary)' }} />
          {empty ? 'ready' : 'drafting'}
        </span>
        <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-wide)',
            padding: '1px 5px', borderRadius: 'var(--radius-xs)',
            color: enterFlash ? 'var(--color-text-on-accent)' : 'var(--color-text-muted)',
            background: enterFlash ? 'var(--color-accent-primary)' : 'transparent',
            transition: 'background var(--duration-instant) var(--ease-standard), color var(--duration-instant) var(--ease-standard)',
          }}>⏎ commit</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-text-muted)' }}>⇧⏎ newline</span>
        </span>
      </div>
    </div>
  );
}

function HeroRow({ text, time, fresh }) {
  return (
    <div className={'hero-row' + (fresh ? ' is-fresh' : '')} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '11px 4px' }}>
      <div style={{
        flex: '0 0 auto', width: 64, paddingTop: 2, textAlign: 'right', whiteSpace: 'nowrap',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-meta)', lineHeight: 'var(--leading-meta)',
        color: fresh ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
        transition: 'color var(--duration-base) var(--ease-standard)',
      }}>{time}</div>
      <div style={{ flex: '0 0 1px', alignSelf: 'stretch', background: 'var(--color-border)', opacity: 0.7 }} />
      <div style={{
        flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)',
        lineHeight: 'var(--leading-normal)', color: 'var(--color-text-primary)', wordBreak: 'break-word',
      }}>{renderBody(text)}</div>
    </div>
  );
}

function Hero({ onStart, onLogin }) {
  const { draft, rows, enterFlash, dissolving } = useHeroLoop();
  return (
    <section style={{ padding: 'clamp(40px, 7vw, 84px) var(--layout-gutter) clamp(48px, 7vw, 96px)' }}>
      <div className="hero-grid" style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'clamp(32px, 5vw, 72px)', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0,
            fontSize: 'clamp(34px, 4.6vw, 56px)', lineHeight: 1.08, letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)', textWrap: 'balance',
          }}>
            In a text editor, the margin counts lines.
            <span style={{ display: 'block', color: 'var(--color-text-secondary)' }}>Here, it keeps time.</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-normal)',
            color: 'var(--color-text-secondary)', margin: '22px 0 0', maxWidth: 460, textWrap: 'pretty',
          }}>
            Type what just happened and press enter. It anchors to now — the timestamp standing where a line number would. Your record grows, one moment at a time.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 32, flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" onClick={onStart}>Start your trace</Button>
            <QuietLink onClick={onLogin}>Log in</QuietLink>
          </div>
        </div>

        <div>
          <div style={{ position: 'relative' }}>
            <HeroCaptureField draft={draft} enterFlash={enterFlash} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 4px 4px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-meta)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-header)', color: 'var(--color-day-header)' }}>Today</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)', opacity: 0.6 }} />
            </div>
            <div style={{
              minHeight: 168, opacity: dissolving ? 0 : 1,
              transition: 'opacity var(--duration-base) var(--ease-out)',
            }}>
              {rows.map((r) => (<HeroRow key={r.id} text={r.text} time={r.time} fresh={r.fresh} />))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const REFRAME_LINES = [
  { n: '01', t: '07:50', body: 'cold start, hot coffee. good morning to think.' },
  { n: '02', t: '09:14', body: 'missed the bus, ran the last block.' },
  { n: '03', t: '11:02', body: 'idea: group the timeline by week too #idea' },
  { n: '04', t: '13:30', body: 'long walk before the review #health' },
  { n: '05', t: '18:05', body: 'finished the book. quietly proud #read' },
  { n: '06', t: '22:10', body: 'slow night. pasta, a film, early sleep.' },
];

function Reframe() {
  const [morphed, setMorphed] = React.useState(REDUCED);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (REDUCED) return;
    let done = false;
    const reveal = () => { if (!done) { done = true; setMorphed(true); cleanup(); } };
    const check = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top < (window.innerHeight || 800) * 0.75) reveal();
    };
    let io = null;
    try {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) reveal(); });
      }, { threshold: 0.4 });
      if (ref.current) io.observe(ref.current);
    } catch (_) { /* no IO support */ }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    const t = setTimeout(check, 120);
    const poll = setInterval(check, 250);
    function cleanup() {
      if (io) io.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      clearTimeout(t);
      clearInterval(poll);
    }
    return cleanup;
  }, []);

  return (
    <section ref={ref} style={{ padding: 'clamp(40px, 6vw, 88px) var(--layout-gutter)', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-eyebrow)',
          textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 18px',
        }}>The reframe</p>

        <div style={{
          background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          border: '1px solid ' + (morphed ? 'var(--color-accent-soft)' : 'var(--color-border)'),
          transition: 'border-color var(--duration-slow) var(--ease-out)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
              {morphed ? (
                <span key="clk" className="rf-fade" style={{ color: 'var(--color-accent-primary)', display: 'inline-flex' }}><Icon name="clock" size={16} /></span>
              ) : (
                <span key="hash" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: '16px' }}>#</span>
              )}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)' }}>
              {morphed ? 'today — anchored by time' : 'untitled.txt — 6 lines'}
            </span>
          </div>

          <div style={{ padding: '10px 4px 14px' }}>
            {REFRAME_LINES.map((l, i) => (
              <div key={l.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '8px 16px' }}>
                <span style={{ flex: '0 0 auto', width: 52, height: '1.5em', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-meta)', lineHeight: '1.5em' }}>
                  {morphed ? (
                    <span key="t" className="rf-fade" style={{ color: 'var(--color-accent-primary)', animationDelay: (i * 55) + 'ms' }}>{l.t}</span>
                  ) : (
                    <span key="n" style={{ color: 'var(--color-text-muted)' }}>{l.n}</span>
                  )}
                </span>
                <span style={{ flex: '0 0 1px', alignSelf: 'stretch', background: 'var(--color-border)', opacity: 0.7 }} />
                <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', lineHeight: 'var(--leading-normal)', color: 'var(--color-text-primary)' }}>{renderBody(l.body)}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-normal)',
          color: 'var(--color-text-secondary)', margin: '22px 0 0', maxWidth: 600, textWrap: 'pretty',
        }}>
          The same six lines. The only thing that changed is the margin — from a line number to the moment it happened.
        </p>
      </div>
    </section>
  );
}

const RECORD = [
  { day: 'Today', count: 3, items: [
    { id: 1, time: '4:18 PM', body: 'wrapped the export endpoint. #work tests green.' },
    { id: 2, time: '2:41 PM', body: 'long walk to clear my head before the review.' },
    { id: 3, time: '11:02 AM', body: 'idea: timeline could group by week too. #idea #read' },
  ] },
  { day: 'Yesterday', count: 2, items: [
    { id: 4, time: '8:30 PM', body: 'slow sunday. pasta, a film, early night.' },
    { id: 5, time: '9:40 AM', body: 'train delayed, read instead of doomscrolling. #read' },
  ] },
];

function Accumulate() {
  return (
    <section style={{ padding: 'clamp(40px, 6vw, 88px) var(--layout-gutter)', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 14px' }}>What it becomes</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 3.2vw, 36px)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', margin: '0 0 28px', maxWidth: 560, textWrap: 'balance' }}>
          A real, honest record you can look back on.
        </h2>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '8px 18px 20px' }}>
          {RECORD.map((g) => (
            <div key={g.day}>
              <DayHeader label={g.day} count={g.count} />
              {g.items.map((e) => (<TimelineEntry key={e.id} time={e.time} body={e.body} />))}
            </div>
          ))}
        </div>

        <p style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: 'var(--font-body)', fontSize: 'var(--text-meta)', lineHeight: 'var(--leading-normal)', color: 'var(--color-text-muted)', margin: '20px 0 0', maxWidth: 600 }}>
          <span style={{ color: 'var(--color-text-secondary)', flex: '0 0 auto', marginTop: 1 }}><Icon name="export" size={16} /></span>
          <span>Yours to keep. Export the whole corpus to Markdown or JSON anytime — never trapped, never analysed by anyone but you.</span>
        </p>
      </div>
    </section>
  );
}

function FinalCta({ onStart, onLogin }) {
  return (
    <section style={{ padding: 'clamp(56px, 9vw, 120px) var(--layout-gutter)', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><Logo size={30} showWordmark={false} /></div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3.6vw, 42px)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', margin: '0 0 28px', textWrap: 'balance' }}>
          Start keeping time.
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" onClick={onStart}>Start your trace</Button>
          <QuietLink onClick={onLogin} style={{ fontSize: 'var(--text-sm)' }}>Log in</QuietLink>
        </div>
      </div>
    </section>
  );
}

export function LandingScreen({ onStart, onLogin }) {
  React.useEffect(() => { document.documentElement.setAttribute('data-theme', 'dark'); }, []);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-base)' }}>
      <header style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '16px var(--layout-gutter)' }}>
          <Logo size={24} />
          <QuietLink onClick={onLogin} style={{ marginLeft: 'auto' }}>Log in</QuietLink>
        </div>
      </header>

      <Hero onStart={onStart} onLogin={onLogin} />
      <Reframe />
      <Accumulate />
      <FinalCta onStart={onStart} onLogin={onLogin} />

      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '28px var(--layout-gutter)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={18} tone="mono" />
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}>a timestamped record of your moments</span>
        </div>
      </footer>

      <style>{`
        @keyframes hero-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .hero-caret { animation: hero-blink 1.05s steps(1) infinite; }
        @keyframes hero-anchor { from { opacity: 0; transform: translateY(-7px); } to { opacity: 1; transform: translateY(0); } }
        .hero-row.is-fresh { animation: hero-anchor var(--duration-base) var(--ease-out) both; }
        @keyframes rf-fade-in { from { transform: translateY(-4px); } to { transform: translateY(0); } }
        .rf-fade { animation: rf-fade-in var(--duration-base) var(--ease-out) both; }
        .quiet-link:hover { color: var(--color-text-primary); }
        a:focus-visible, button:focus-visible { outline: none; box-shadow: 0 0 0 var(--border-focus) var(--color-accent-soft); border-radius: var(--radius-xs); }
        @media (prefers-reduced-motion: reduce) { .hero-caret { animation: none; opacity: 1; } .hero-row.is-fresh { animation: none; } .rf-fade { animation: none; } }
        @media (max-width: 760px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
