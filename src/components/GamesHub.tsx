import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, SectionTitle } from './Ambience';
import {
  quizAnswers,
  movieQuizAnswers,
  guessAnswers,
  guessEmojis,
  wheelEmojis,
  wheelColors,
  memoryMilestones,
  films,
  waLink,
  loadLeaderboard,
  saveScore,
  siteUrl,
} from '../data';
import { sound, burst, confettiRain } from '../audio';
import { useI18n } from '../i18n';
import { useBadges } from './Ambience';

const GAMES = [
  { id: 'quiz', icon: '🧠' },
  { id: 'stars', icon: '⭐' },
  { id: 'memory', icon: '🧩' },
  { id: 'puzzle', icon: '🖼️' },
  { id: 'wheel', icon: '🎡' },
  { id: 'typing', icon: '⌨️' },
  { id: 'treasure', icon: '🗺️' },
  { id: 'movie', icon: '🎬' },
  { id: 'guess', icon: '🕵️' },
] as const;

type GameId = (typeof GAMES)[number]['id'];

export default function GamesHub() {
  const { t } = useI18n();
  const [game, setGame] = useState<GameId>('quiz');
  const titles: Record<GameId, string> = {
    quiz: t('games.quiz.title'),
    stars: t('games.stars.title'),
    memory: t('games.memory.title'),
    puzzle: t('games.puzzle.title'),
    wheel: t('games.wheel.title'),
    typing: t('games.typing.title'),
    treasure: t('games.treasure.title'),
    movie: t('games.movieQuiz.title'),
    guess: t('games.guess.title'),
  };

  return (
    <Section id="games" className="bg-gradient-to-b from-transparent via-[#070b14] to-transparent">
      <SectionTitle kicker={t('games.kicker')} title={t('games.title')} sub={t('games.sub')} />

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              sound.click();
              setGame(g.id);
            }}
            className={`chip !text-sm ${game === g.id ? 'active' : ''}`}
          >
            {g.icon} {titles[g.id]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={game}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          {game === 'quiz' && <QuizGame />}
          {game === 'stars' && <StarsGame />}
          {game === 'memory' && <MemoryGame />}
          {game === 'puzzle' && <PuzzleGame />}
          {game === 'wheel' && <WheelGame />}
          {game === 'typing' && <TypingGame />}
          {game === 'treasure' && <TreasureGame />}
          {game === 'movie' && <MovieQuiz />}
          {game === 'guess' && <GuessGame />}
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}

// ─── shared quiz shell ───
interface Q {
  q: string;
  o: string[];
}

function useQuiz(questions: Q[], answers: number[], badge: 'quiz' | 'movie') {
  const { earn } = useBadges();
  const [stage, setStage] = useState<'idle' | 'play' | 'done'>('idle');
  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === answers[q]) {
      sound.pop();
      burst(0.5, 0.65);
      setScore((s) => s + 1);
    } else {
      sound.error();
    }
    window.setTimeout(() => {
      setPicked(null);
      if (q + 1 < questions.length) setQ((x) => x + 1);
      else {
        setStage('done');
        earn(badge);
      }
    }, 900);
  };

  const retry = () => {
    sound.click();
    setStage('idle');
    setQ(0);
    setScore(0);
    setPicked(null);
  };

  return { stage, q, score, picked, pick, retry, setStage };
}

function QuizShell({
  questions,
  answers,
  badge,
  titleKey,
  startLabel,
}: {
  questions: Q[];
  answers: number[];
  badge: 'quiz' | 'movie';
  titleKey: string;
  startLabel: string;
}) {
  const { t } = useI18n();
  const { stage, q, score, picked, pick, retry, setStage } = useQuiz(questions, answers, badge);
  const question = questions[q];

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto relative overflow-hidden min-h-[360px]">
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
      {stage === 'idle' && (
        <div className="text-center py-10">
          <span className="text-6xl">🎬</span>
          <h3 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-gold-grad">{t(titleKey)}</h3>
          <p className="mt-3 text-white/55 text-sm max-w-md mx-auto">{t(`${titleKey.replace('.title', '.desc')}`)}</p>
          <button onClick={() => { sound.click(); setStage('play'); }} className="btn-gold mt-8">
            {startLabel}
          </button>
        </div>
      )}

      {stage === 'play' && question && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs tracking-[0.25em] uppercase text-white/45">
              {t('games.quiz.question')} {q + 1} / {questions.length}
            </p>
            <p className="text-sm text-gold font-bold">⭐ {score}</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-8">
            <div
              className="h-full bg-gold-grad transition-all duration-500"
              style={{ width: `${((q + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white text-center">{question.q}</h3>
          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            {question.o.map((opt, i) => {
              let cls = 'border-white/15 bg-white/5 hover:border-gold/60';
              if (picked !== null) {
                if (i === answers[q]) cls = 'border-emerald-400/70 bg-emerald-400/10 text-emerald-200';
                else if (i === picked) cls = 'border-red-400/70 bg-red-400/10 text-red-200';
                else cls = 'border-white/10 bg-white/5 opacity-50';
              }
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={picked !== null}
                  className={`rounded-2xl border-2 px-5 py-4 text-left font-medium transition-all duration-300 ${cls}`}
                >
                  <span className="text-gold mr-2 font-display">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div className="text-center py-10">
          <span className="text-6xl">{score >= Math.ceil(questions.length * 0.7) ? '🏆' : score >= Math.ceil(questions.length * 0.5) ? '🎉' : '😅'}</span>
          <p className="mt-4 font-display text-5xl font-black text-gold-grad">
            {score}/{questions.length}
          </p>
          <p className="mt-2 text-white/60 text-sm max-w-md mx-auto">
            {score >= Math.ceil(questions.length * 0.7)
              ? t('games.quiz.v1')
              : score >= Math.ceil(questions.length * 0.5)
                ? t('games.quiz.v2')
                : t('games.quiz.v3')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => window.open(waLink(`🏆 I scored ${score}/${questions.length} on "${t(titleKey)}"! Can you beat me? ${siteUrl()}`), '_blank')}
              className="btn-gold text-sm"
            >
              📤 {t('games.quiz.share')}
            </button>
            <button onClick={retry} className="btn-ghost text-sm">↻ {t('games.quiz.retry')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizGame() {
  const { t } = useI18n();
  return (
    <QuizShell
      questions={t('games.quiz.questions') as unknown as Q[]}
      answers={quizAnswers}
      badge="quiz"
      titleKey="games.quiz.title"
      startLabel={t('games.quiz.start')}
    />
  );
}

function MovieQuiz() {
  const { t } = useI18n();
  return (
    <QuizShell
      questions={t('games.movieQuiz.questions') as unknown as Q[]}
      answers={movieQuizAnswers}
      badge="movie"
      titleKey="games.movieQuiz.title"
      startLabel={t('games.movieQuiz.start')}
    />
  );
}

// ─── Catch the Gold Stars ───
interface FallingItem {
  id: number;
  x: number;
  y: number;
  type: 'star' | 'bomb';
  life: number;
}

function StarsGame() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const [phase, setPhase] = useState<'idle' | 'play' | 'done'>('idle');
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(30);
  const [shake, setShake] = useState(false);
  const [board, setBoard] = useState('idle');
  const [leaderboard, setLeaderboard] = useState<number[]>(() => loadLeaderboard());
  const idRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (phase !== 'play') return;
    scoreRef.current = 0;
    const spawn = window.setInterval(() => {
      setItems((prev) => {
        const next = prev
          .map((it) => ({ ...it, y: it.y + 2.2, life: it.life - 1 }))
          .filter((it) => it.life > 0 && it.y < 92);
        const type: 'star' | 'bomb' = Math.random() < 0.22 ? 'bomb' : 'star';
        next.push({ id: idRef.current++, x: 4 + Math.random() * 88, y: 0, type, life: 55 });
        return next;
      });
    }, 420);

    const tick = window.setInterval(() => {
      setTime((tm) => {
        if (tm <= 1) {
          window.clearInterval(tick);
          window.clearInterval(spawn);
          setPhase('done');
          const lb = saveScore(scoreRef.current);
          setLeaderboard(lb);
          setBoard(`score-${Date.now()}`);
          earn('stars');
          sound.chime();
          return 0;
        }
        return tm - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(spawn);
      window.clearInterval(tick);
    };
  }, [phase, earn]);

  const catchItem = (it: FallingItem) => {
    setItems((prev) => prev.filter((p) => p.id !== it.id));
    if (it.type === 'star') {
      sound.pop();
      scoreRef.current += 10;
      setScore(scoreRef.current);
      burst(0.5, 0.5);
    } else {
      sound.error();
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          window.setTimeout(() => {
            setPhase('done');
            const lb = saveScore(scoreRef.current);
            setLeaderboard(lb);
            setBoard(`bomb-${Date.now()}`);
            earn('stars');
          }, 300);
        }
        return next;
      });
      setShake(true);
      window.setTimeout(() => setShake(false), 400);
    }
  };

  const restart = () => {
    sound.click();
    setItems([]);
    setScore(0);
    setLives(3);
    setTime(30);
    setPhase('play');
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto relative overflow-hidden">
      {phase === 'idle' && (
        <div className="text-center py-10">
          <span className="text-6xl">⭐</span>
          <h3 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-gold-grad">{t('games.stars.title')}</h3>
          <p className="mt-3 text-white/55 text-sm max-w-md mx-auto">{t('games.stars.desc')}</p>
          <button onClick={restart} className="btn-gold mt-8">{t('games.stars.start')}</button>
        </div>
      )}

      {phase === 'play' && (
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <p className="font-display text-xl font-bold text-gold">⭐ {score}</p>
            <p className="text-sm text-white/60">
              ⏱ {time}s · {'❤️'.repeat(Math.max(0, lives))}
              {'🖤'.repeat(Math.max(0, 3 - lives))}
            </p>
          </div>
          <div
            className={`relative h-[340px] sm:h-[420px] rounded-2xl border border-gold/25 bg-gradient-to-b from-[#0a1220] to-black overflow-hidden ${
              shake ? 'animate-[shake_0.4s_ease]' : ''
            }`}
          >
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => catchItem(it)}
                className={`absolute text-3xl sm:text-4xl transition-transform hover:scale-125 active:scale-90 ${
                  it.type === 'star' ? 'drop-shadow-[0_0_12px_rgba(246,226,122,0.9)]' : 'grayscale'
                }`}
                style={{ left: `${it.x}%`, top: `${it.y}%` }}
              >
                {it.type === 'star' ? '⭐' : '💣'}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="text-center py-8">
          <span className="text-6xl">{board.startsWith('score') ? '🏅' : '💥'}</span>
          <p className="mt-4 font-display text-4xl font-black text-gold-grad">{score} ⭐</p>
          <p className="mt-2 text-white/55 text-sm">
            {board.startsWith('score') ? t('games.stars.perfect') : t('games.stars.boom')}
          </p>
          <div className="mt-6 max-w-xs mx-auto glass rounded-2xl p-4">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold/70 mb-2">{t('games.stars.top')}</p>
            {leaderboard.length === 0 && <p className="text-white/40 text-sm">{t('games.stars.noScores')}</p>}
            {leaderboard.map((s, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                <span className="text-white/60">{i === 0 ? '👑' : `${i + 1}.`}</span>
                <span className="font-bold text-gold">{s} ⭐</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={restart} className="btn-gold text-sm">{t('games.stars.playAgain')}</button>
            <button
              onClick={() => window.open(waLink(`⭐ I caught ${score} gold stars in Jackson's birthday arcade! Can you beat me? ${siteUrl()}`), '_blank')}
              className="btn-ghost text-sm"
            >
              📤 {t('games.stars.share')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Memory Challenge ───
function MemoryGame() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const order = useRef<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const [next, setNext] = useState(0);
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef<number | null>(null);
  const labels = t('games.memory.order') as unknown as string[];

  const shuffle = useCallback(() => {
    const arr = memoryMilestones.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    order.current = arr;
    setRevealed([]);
    setNext(0);
    setAttempts(0);
    setSeconds(0);
    setDone(false);
    setStarted(false);
  }, []);

  useEffect(() => {
    shuffle();
  }, [shuffle]);

  useEffect(() => {
    if (done && timerRef.current) {
      window.clearInterval(timerRef.current);
    }
  }, [done]);

  const pick = (i: number) => {
    if (done || revealed.includes(i)) return;
    if (!started) {
      setStarted(true);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    const expected = order.current[next];
    if (i === expected) {
      sound.pop();
      const r = [...revealed, i];
      setRevealed(r);
      setNext(next + 1);
      if (r.length === memoryMilestones.length) {
        sound.fanfare();
        confettiRain(1500);
        setDone(true);
        earn('memory');
      }
    } else {
      sound.error();
      setWrong(true);
      setAttempts((a) => a + 1);
      window.setTimeout(() => setWrong(false), 500);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto relative overflow-hidden">
      <div className="text-center mb-6">
        <span className="text-5xl">🎞️</span>
        <h3 className="mt-3 font-display text-2xl font-bold text-gold-grad">{t('games.memory.title')}</h3>
        <p className="mt-2 text-white/55 text-sm max-w-md mx-auto">{t('games.memory.desc')}</p>
        <div className="mt-3 flex justify-center gap-4 text-sm">
          <span className="text-gold">⏱ {fmt(seconds)}</span>
          <span className="text-white/50">{t('games.memory.attempts')}: {attempts}</span>
          {done && <span className="text-emerald-300">{t('games.memory.done', { time: fmt(seconds) })}</span>}
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-3 ${wrong ? 'animate-[shake_0.4s_ease]' : ''}`}>
        {memoryMilestones.map((m, i) => {
          const isRevealed = revealed.includes(i);
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={isRevealed}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-gold/25 transition-all duration-300 hover:border-gold/70 disabled:hover:border-gold/25"
            >
              {isRevealed ? (
                <img src={m.src} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1206] to-black flex items-center justify-center text-3xl">
                  🎬
                </div>
              )}
              <span
                className={`absolute bottom-0 inset-x-0 text-center text-[9px] sm:text-[11px] py-1 font-semibold ${
                  isRevealed ? 'bg-black/70 text-gold' : 'bg-black/60 text-white/40'
                }`}
              >
                {isRevealed ? `${revealed.indexOf(i) + 1}. ${labels[revealed.indexOf(i)]}` : '???'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={shuffle} className="btn-ghost text-sm">{t('games.memory.shuffle')}</button>
        {done && (
          <button
            onClick={() =>
              window.open(waLink(`🧠 I completed Jackson's Memory Challenge in ${fmt(seconds)} with ${attempts} mistakes! Try it: ${siteUrl()}`), '_blank')
            }
            className="btn-gold text-sm"
          >
            📤 {t('games.memory.share')}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Birthday Puzzle ───
function PuzzleGame() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  const isSolved = (arr: number[]) => arr.every((v, i) => v === i + 1);

  const shuffleBoard = useCallback(() => {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    for (let i = 0; i < 200; i++) {
      const empty = arr.indexOf(0);
      const r = Math.floor(empty / 3);
      const c = empty % 3;
      const movesArr: number[] = [];
      if (r > 0) movesArr.push(empty - 3);
      if (r < 2) movesArr.push(empty + 3);
      if (c > 0) movesArr.push(empty - 1);
      if (c < 2) movesArr.push(empty + 1);
      const pick = movesArr[Math.floor(Math.random() * movesArr.length)];
      [arr[empty], arr[pick]] = [arr[pick], arr[empty]];
    }
    if (isSolved(arr)) arr = [1, 2, 3, 4, 5, 6, 7, 0, 8];
    setTiles(arr);
    setMoves(0);
    setDone(false);
    started.current = false;
  }, []);

  useEffect(() => {
    shuffleBoard();
  }, [shuffleBoard]);

  const move = (i: number) => {
    if (done || tiles[i] === 0) return;
    const empty = tiles.indexOf(0);
    const r1 = Math.floor(i / 3);
    const c1 = i % 3;
    const r2 = Math.floor(empty / 3);
    const c2 = empty % 3;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    started.current = true;
    const next = [...tiles];
    [next[i], next[empty]] = [next[empty], next[i]];
    setTiles(next);
    setMoves((m) => m + 1);
    sound.click();
    if (isSolved(next)) {
      sound.fanfare();
      confettiRain(1800);
      setDone(true);
      earn('puzzle');
    }
  };

  const pos = (v: number) => {
    const r = Math.floor((v - 1) / 3);
    const c = (v - 1) % 3;
    return `${c * 50}% ${r * 50}%`;
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto relative overflow-hidden">
      <div className="text-center mb-6">
        <span className="text-5xl">🖼️</span>
        <h3 className="mt-3 font-display text-2xl font-bold text-gold-grad">{t('games.puzzle.title')}</h3>
        <p className="mt-2 text-white/55 text-sm max-w-md mx-auto">{t('games.puzzle.desc')}</p>
        <div className="mt-3 flex justify-center gap-4 text-sm">
          <span className="text-gold">{t('games.puzzle.moves')}: {moves}</span>
          {done && <span className="text-emerald-300">{t('games.puzzle.done')}</span>}
        </div>
      </div>

      <div className="max-w-[380px] mx-auto">
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden border border-gold/30 p-1.5 bg-black/50">
          {tiles.map((v, i) =>
            v === 0 ? (
              <div key={i} className="aspect-square rounded-lg bg-white/5" />
            ) : (
              <button
                key={i}
                onClick={() => move(i)}
                className="aspect-square rounded-lg overflow-hidden border border-gold/20 transition-all hover:brightness-125"
                style={{
                  backgroundImage: 'url(images/puzzle.jpg)',
                  backgroundSize: '300% 300%',
                  backgroundPosition: pos(v),
                }}
              />
            )
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={shuffleBoard} className="btn-ghost text-sm">{t('games.puzzle.shuffle')}</button>
        {done && (
          <button
            onClick={() => window.open(waLink(`🧩 I solved Jackson's Birthday Puzzle in ${moves} moves! Can you? ${siteUrl()}`), '_blank')}
            className="btn-gold text-sm"
          >
            📤 {t('games.puzzle.share')}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Fortune Wheel ───
function WheelGame() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const segments = t('games.wheel.segments') as unknown as string[];
  const seg = 360 / segments.length;

  const spin = () => {
    if (spinning) return;
    sound.whoosh();
    setSpinning(true);
    setResult(null);
    const target = Math.floor(Math.random() * segments.length);
    const extra = 360 * 5 + (360 - target * seg - seg / 2) - (rotation % 360);
    setRotation((r) => r + extra + (Math.random() * seg * 0.6 - seg * 0.3));
    window.setTimeout(() => {
      setSpinning(false);
      setResult(target);
      sound.fanfare();
      earn('wheel');
      if (wheelEmojis[target] === '🎉') confettiRain(1500);
    }, 4400);
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto relative overflow-hidden">
      <div className="text-center mb-8">
        <span className="text-5xl">🎡</span>
        <h3 className="mt-3 font-display text-2xl font-bold text-gold-grad">{t('games.wheel.title')}</h3>
        <p className="mt-2 text-white/55 text-sm max-w-md mx-auto">{t('games.wheel.desc')}</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
        <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]">
          <div className="absolute -inset-3 rounded-full border border-gold/30 pulse-ring" style={{ animationDuration: '3s' }} />
          <div
            className="w-full h-full rounded-full relative transition-transform duration-[4400ms]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionTimingFunction: 'cubic-bezier(0.15, 0.85, 0.25, 1)',
              background: `conic-gradient(${segments
                .map((_, i) => `${wheelColors[i % wheelColors.length]} ${i * seg}deg ${(i + 1) * seg}deg`)
                .join(',')})`,
            }}
          >
            <div className="absolute inset-[14%] rounded-full bg-[#05060a] flex items-center justify-center">
              <p className="font-display text-center text-gold font-bold text-sm sm:text-base leading-snug">
                {t('games.wheel.center')}
              </p>
            </div>
          </div>
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="grid grid-cols-2 gap-2 mb-6">
            {segments.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/55">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: wheelColors[i % wheelColors.length] }} />
                <span className="truncate">{s.slice(0, 26)}…</span>
              </div>
            ))}
          </div>
          <button onClick={spin} disabled={spinning} className="btn-gold w-full text-lg" style={{ opacity: spinning ? 0.6 : 1 }}>
            {spinning ? t('games.wheel.spinning') : t('games.wheel.spin')}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 glass-dark rounded-3xl p-6 sm:p-8 text-center max-w-lg mx-auto border-gold/40"
          >
            <span className="text-5xl">{wheelEmojis[result]}</span>
            <p className="mt-3 font-display text-lg sm:text-xl font-bold text-gold-grad">{segments[result]}</p>
            <button
              onClick={() =>
                window.open(waLink(`🎡 I spun Jackson's Fortune Wheel and got: "${segments[result]}" — spin yours: ${siteUrl()}`), '_blank')
              }
              className="btn-ghost text-sm mt-5"
            >
              📤 {t('games.wheel.share')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Typing Challenge ───
function TypingGame() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const [phase, setPhase] = useState<'idle' | 'play' | 'done'>('idle');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const text = t('games.typing.text');
  const timerRef = useRef<number | null>(null);

  const start = () => {
    sound.click();
    setInput('');
    setSeconds(0);
    setStartTime(Date.now());
    setPhase('play');
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  useEffect(() => {
    if (phase !== 'play') return;
    if (input === text) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      const secs = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      setSeconds(secs);
      setPhase('done');
      earn('typing');
      sound.fanfare();
      confettiRain(1200);
    }
  }, [input, text, phase, startTime, earn]);

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  const correct = [...input].filter((c, i) => c === text[i]).length;
  const wpm = Math.round(correct / 5 / (seconds / 60));
  const accuracy = input.length ? Math.round((correct / input.length) * 100) : 0;

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto relative overflow-hidden">
      {phase === 'idle' && (
        <div className="text-center py-10">
          <span className="text-6xl">⌨️</span>
          <h3 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-gold-grad">{t('games.typing.title')}</h3>
          <p className="mt-3 text-white/55 text-sm max-w-md mx-auto">{t('games.typing.desc')}</p>
          <button onClick={start} className="btn-gold mt-8">{t('games.typing.start')}</button>
        </div>
      )}

      {phase === 'play' && (
        <div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gold">⏱ {seconds}s</span>
            <span className="text-white/50">{t('games.typing.time')}</span>
          </div>
          <p className="glass rounded-2xl p-5 font-display text-lg sm:text-xl text-center text-gold-grad leading-relaxed">
            {text.split('').map((ch, i) => {
              let cls = 'text-white/30';
              if (i < input.length) cls = input[i] === ch ? 'text-emerald-300' : 'text-red-400';
              if (i === input.length) cls = 'text-gold underline';
              return (
                <span key={i} className={cls}>{ch === ' ' ? '\u00A0' : ch}</span>
              );
            })}
          </p>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-lux mt-5 text-center text-lg"
            placeholder={t('games.typing.type')}
          />
        </div>
      )}

      {phase === 'done' && (
        <div className="text-center py-10">
          <span className="text-6xl">🚀</span>
          <p className="mt-4 font-display text-4xl font-black text-gold-grad">{wpm} WPM</p>
          <p className="mt-2 text-white/55 text-sm">
            {t('games.typing.accuracy')}: {accuracy}% · ⏱ {seconds}s
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={start} className="btn-ghost text-sm">{t('games.typing.again')}</button>
            <button
              onClick={() => window.open(waLink(`⌨️ I typed "${text}" at ${wpm} WPM (${accuracy}% accuracy) on Jackson's birthday arcade! ${siteUrl()}`), '_blank')}
              className="btn-gold text-sm"
            >
              📤 {t('games.typing.share')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Treasure Hunt ───
function TreasureGame() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const [phase, setPhase] = useState<'idle' | 'play' | 'done'>('idle');
  const [treasures, setTreasures] = useState<number[]>([]);
  const [opened, setOpened] = useState<number[]>([]);
  const [found, setFound] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const newBoard = () => {
    const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    setTreasures(cells.slice(0, 3));
    setOpened([]);
    setFound(0);
    setClicks(0);
    setSeconds(0);
  };

  const start = () => {
    sound.click();
    newBoard();
    setPhase('play');
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const open = (i: number) => {
    if (opened.includes(i)) return;
    sound.pop();
    setOpened((o) => [...o, i]);
    setClicks((c) => c + 1);
    if (treasures.includes(i)) {
      const f = found + 1;
      setFound(f);
      if (f === 3) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        setPhase('done');
        earn('treasure');
        sound.fanfare();
        confettiRain(1600);
      }
    } else {
      sound.error();
    }
  };

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto relative overflow-hidden">
      {phase === 'idle' && (
        <div className="text-center py-10">
          <span className="text-6xl">🗺️</span>
          <h3 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-gold-grad">{t('games.treasure.title')}</h3>
          <p className="mt-3 text-white/55 text-sm max-w-md mx-auto">{t('games.treasure.desc')}</p>
          <button onClick={start} className="btn-gold mt-8">{t('games.treasure.start')}</button>
        </div>
      )}

      {(phase === 'play' || phase === 'done') && (
        <div>
          <div className="flex justify-center gap-4 text-sm mb-5">
            <span className="text-gold">{t('games.treasure.found')}: {found}/3</span>
            <span className="text-white/50">{t('games.treasure.clicks')}: {clicks}</span>
            <span className="text-white/50">⏱ {seconds}s</span>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const isOpen = opened.includes(i);
              const isTreasure = treasures.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => open(i)}
                  disabled={isOpen || phase === 'done'}
                  className={`aspect-square rounded-2xl border-2 text-4xl flex items-center justify-center transition-all duration-300 ${
                    isOpen
                      ? isTreasure
                        ? 'border-gold bg-gold/15 shadow-[0_0_24px_rgba(212,175,55,0.4)]'
                        : 'border-white/10 bg-white/5 opacity-40'
                      : 'border-gold/25 bg-gradient-to-br from-[#1a1206] to-black hover:border-gold/70 hover:scale-105'
                  }`}
                >
                  {isOpen ? (isTreasure ? '⭐' : '💣') : '❓'}
                </button>
              );
            })}
          </div>
          {phase === 'done' && (
            <div className="text-center mt-8">
              <p className="font-display text-2xl font-bold text-gold-grad">{t('games.treasure.win')}</p>
              <p className="mt-2 text-white/55 text-sm">
                {t('games.treasure.clicks')}: {clicks} · ⏱ {seconds}s
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button onClick={start} className="btn-ghost text-sm">{t('games.treasure.again')}</button>
                <button
                  onClick={() => window.open(waLink(`🗺️ I found all treasures in Jackson's Treasure Hunt in ${clicks} clicks (${seconds}s)! ${siteUrl()}`), '_blank')}
                  className="btn-gold text-sm"
                >
                  📤 {t('games.treasure.share')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Guess the Achievement ───
function GuessGame() {
  const { t } = useI18n();
  const { earn } = useBadges();
  const [stage, setStage] = useState<'idle' | 'play' | 'done'>('idle');
  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const clues = t('games.guess.clues') as unknown as string[];
  const items = t('achievements.items') as unknown as { title: string }[];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === guessAnswers[q]) {
      sound.pop();
      setScore((s) => s + 1);
    } else {
      sound.error();
    }
    window.setTimeout(() => {
      setPicked(null);
      if (q + 1 < clues.length) setQ((x) => x + 1);
      else {
        setStage('done');
        earn('guess');
      }
    }, 900);
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto relative overflow-hidden min-h-[360px]">
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
      {stage === 'idle' && (
        <div className="text-center py-10">
          <span className="text-6xl">🕵️</span>
          <h3 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-gold-grad">{t('games.guess.title')}</h3>
          <p className="mt-3 text-white/55 text-sm max-w-md mx-auto">{t('games.guess.desc')}</p>
          <button onClick={() => { sound.click(); setStage('play'); }} className="btn-gold mt-8">{t('games.guess.start')}</button>
        </div>
      )}

      {stage === 'play' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs tracking-[0.25em] uppercase text-white/45">
              {t('games.guess.round')} {q + 1} / {clues.length}
            </p>
            <p className="text-sm text-gold font-bold">⭐ {score}</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center mb-6">
            <span className="text-5xl">{guessEmojis[q]}</span>
            <p className="mt-3 text-white/80 font-medium text-lg">{clues[q]}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((a, i) => {
              let cls = 'border-white/15 bg-white/5 hover:border-gold/60';
              if (picked !== null) {
                if (i === guessAnswers[q]) cls = 'border-emerald-400/70 bg-emerald-400/10 text-emerald-200';
                else if (i === picked) cls = 'border-red-400/70 bg-red-400/10 text-red-200';
                else cls = 'border-white/10 bg-white/5 opacity-50';
              }
              return (
                <button
                  key={a.title}
                  onClick={() => pick(i)}
                  disabled={picked !== null}
                  className={`rounded-2xl border-2 px-5 py-3.5 text-left font-medium transition-all duration-300 ${cls}`}
                >
                  {a.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div className="text-center py-10">
          <span className="text-6xl">🏅</span>
          <p className="mt-4 font-display text-5xl font-black text-gold-grad">{score}/{clues.length}</p>
          <p className="mt-2 text-white/60 text-sm">
            {score >= 5 ? t('games.quiz.v1') : score >= 3 ? t('games.quiz.v2') : t('games.quiz.v3')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => window.open(waLink(`🕵️ I guessed ${score}/${clues.length} achievements in Jackson's "Guess the Achievement"! ${siteUrl()}`), '_blank')}
              className="btn-gold text-sm"
            >
              📤 {t('games.guess.share')}
            </button>
            <button
              onClick={() => { sound.click(); setStage('idle'); setQ(0); setScore(0); setPicked(null); }}
              className="btn-ghost text-sm"
            >
              ↻ {t('games.guess.retry')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// keep films referenced (movie quiz context)
void films;
