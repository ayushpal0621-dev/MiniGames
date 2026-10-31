import React, { useState, useEffect, useRef } from 'react';

export interface ChallengeContext {
  onSuccess: () => void;
  onFailure: () => void;
}

export interface ChallengeDef {
  id: number;
  title: string;
  instruction: string;
  hint?: string;
  timeLimitSeconds: number;
  Component: React.FC<ChallengeContext>;
}

// ─── Challenge 1: Moving Green Button ─────────────────────────────────────────
const MovingGreenButton: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleHover = () => {
    // Moves around within container
    setPos({
      x: (Math.random() - 0.5) * 140,
      y: (Math.random() - 0.5) * 80,
    });
  };

  return (
    <div className="flex items-center justify-center gap-6 h-48 relative">
      <button
        onClick={onSuccess}
        onMouseEnter={handleHover}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition-transform duration-150"
      >
        GREEN BUTTON
      </button>
      <button
        onClick={onFailure}
        className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg"
      >
        RED BUTTON
      </button>
    </div>
  );
};

// ─── Challenge 2: Swapping Buttons ────────────────────────────────────────────
const SwappingButtons: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  const [swapped, setSwapped] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSwapped((s) => !s), 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4 h-48">
      <div className={`flex gap-4 ${swapped ? 'flex-row-reverse' : 'flex-row'} transition-all`}>
        <button
          onClick={onSuccess}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl shadow-lg"
        >
          BLUE BUTTON
        </button>
        <button
          onClick={onFailure}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-lg"
        >
          YELLOW BUTTON
        </button>
      </div>
    </div>
  );
};

// ─── Challenge 3: Don't Touch Anything ────────────────────────────────────────
const DontTouchAnything: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onSuccess();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onSuccess]);

  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4">
      <span className="text-3xl font-mono font-bold text-amber-400">{secondsLeft}s</span>
      <button
        onClick={onFailure}
        className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl animate-pulse shadow-lg"
      >
        CLICK ME FAST!
      </button>
      <p className="text-xs text-surface-400">Whatever you do, resist the urge.</p>
    </div>
  );
};

// ─── Challenge 4: Left vs Right Inverted ──────────────────────────────────────
const InvertedLeftRight: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex items-center justify-center gap-6 h-48">
      {/* Visual left button is labeled RIGHT; visual right button is labeled LEFT */}
      <button
        onClick={onSuccess}
        className="px-6 py-3 bg-surface-800 hover:bg-surface-700 border border-surface-700 text-white font-bold rounded-2xl"
      >
        RIGHT
      </button>
      <button
        onClick={onFailure}
        className="px-6 py-3 bg-surface-800 hover:bg-surface-700 border border-surface-700 text-white font-bold rounded-2xl"
      >
        LEFT
      </button>
    </div>
  );
};

// ─── Challenge 5: Don't Click Me ──────────────────────────────────────────────
const ReversePsychology: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex items-center justify-center gap-6 h-48">
      <button
        onClick={onSuccess}
        className="px-6 py-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold rounded-2xl"
      >
        DON&apos;T CLICK ME
      </button>
      <button
        onClick={onFailure}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl"
      >
        CLICK ME
      </button>
    </div>
  );
};

// ─── Challenge 6: Bigger vs Smaller ───────────────────────────────────────────
const PhysicalSizeTrick: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex items-center justify-center gap-6 h-48">
      {/* Physically small, labeled BIG */}
      <button
        onClick={onFailure}
        className="px-3 py-1.5 text-xs bg-surface-800 text-white font-bold rounded-xl border border-surface-700"
      >
        BIG
      </button>
      {/* Physically big, labeled SMALL */}
      <button
        onClick={onSuccess}
        className="px-10 py-5 text-xl bg-surface-800 text-white font-black rounded-3xl border border-brand-500/50"
      >
        SMALL
      </button>
    </div>
  );
};

// ─── Challenge 7: Stroop Color Word ───────────────────────────────────────────
const StroopColorText: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4">
      {/* Word says BLUE, but color is RED */}
      <div className="text-4xl font-black text-rose-500 tracking-wider">BLUE</div>
      <div className="flex gap-3">
        <button
          onClick={onSuccess}
          className="px-5 py-2.5 bg-surface-800 hover:bg-surface-700 rounded-xl text-white font-bold border border-surface-700"
        >
          RED
        </button>
        <button
          onClick={onFailure}
          className="px-5 py-2.5 bg-surface-800 hover:bg-surface-700 rounded-xl text-white font-bold border border-surface-700"
        >
          BLUE
        </button>
      </div>
    </div>
  );
};

// ─── Challenge 8: Fake Browser Dialog ─────────────────────────────────────────
const FakeBrowserAlert: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5 shadow-2xl w-72 relative">
        <button
          onClick={onSuccess}
          className="absolute top-3 right-3 text-surface-400 hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-lg hover:bg-surface-700"
        >
          ✕
        </button>
        <div className="text-sm font-bold text-white mb-2">Notice</div>
        <p className="text-xs text-surface-300 mb-4">Click OK to acknowledge and proceed.</p>
        <button
          onClick={onFailure}
          className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold"
        >
          OK
        </button>
      </div>
    </div>
  );
};

// ─── Challenge 9: Clickable Progress Bar ──────────────────────────────────────
const DisguisedProgressBar: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4 w-full max-w-xs mx-auto">
      <span className="text-xs text-surface-400">System buffer updating...</span>
      <button
        onClick={onSuccess}
        className="w-full h-8 bg-surface-800 rounded-full overflow-hidden relative cursor-pointer border border-surface-700 group hover:border-brand-500"
      >
        <div className="bg-gradient-to-r from-brand-600 to-accent-purple h-full w-3/4 animate-pulse" />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/80 group-hover:text-white">
          75% Complete (Click to Cancel)
        </span>
      </button>
      <button
        onClick={onFailure}
        className="text-xs text-surface-400 hover:text-surface-300 underline"
      >
        Wait for completion
      </button>
    </div>
  );
};

// ─── Challenge 10: Fake Crash Screen ──────────────────────────────────────────
const FakeCrash: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center p-4">
      <span className="text-3xl mb-2">⚠️</span>
      <div className="text-sm font-bold text-rose-400 mb-1">Renderer Subprocess Exception</div>
      <button
        onClick={onFailure}
        className="px-5 py-2 bg-rose-600/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold my-2"
      >
        Reload Entire Page
      </button>
      <button
        onClick={onSuccess}
        className="text-[11px] text-surface-400 hover:text-brand-400 transition-colors"
      >
        Inspect Exception Stack
      </button>
    </div>
  );
};

// ─── Challenge 11: Background Color vs Text ───────────────────────────────────
const BackgroundColorMatch: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex items-center justify-center gap-4 h-48">
      {/* Red background, text says GREEN */}
      <button
        onClick={onSuccess}
        className="px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl shadow-lg"
      >
        GREEN
      </button>
      {/* Green background, text says RED */}
      <button
        onClick={onFailure}
        className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg"
      >
        RED
      </button>
    </div>
  );
};

// ─── Challenge 12: Wait For The Signal ─────────────────────────────────────────
const WaitForSignal: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  const [signalReady, setSignalReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSignalReady(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4">
      {signalReady ? (
        <button
          onClick={onSuccess}
          className="px-8 py-4 bg-emerald-500 text-white text-lg font-black rounded-2xl shadow-xl animate-scale-in"
        >
          CLICK NOW!
        </button>
      ) : (
        <button
          onClick={onFailure}
          className="px-6 py-3 bg-surface-800 text-surface-400 font-semibold rounded-2xl border border-surface-700"
        >
          Waiting for green signal...
        </button>
      )}
    </div>
  );
};

// ─── Challenge 13: Three Taps ─────────────────────────────────────────────────
const ThreeTaps: React.FC<ChallengeContext> = ({ onSuccess }) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    if (count + 1 >= 3) {
      onSuccess();
    } else {
      setCount((c) => c + 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <button
        onClick={handleClick}
        className="px-8 py-4 bg-surface-800 hover:bg-surface-700 border border-brand-500/40 text-white font-bold rounded-2xl active:scale-95 transition-transform"
      >
        {count === 0 ? 'Click Anywhere' : `${3 - count} more click${3 - count === 1 ? '' : 's'}...`}
      </button>
      <span className="text-xs text-surface-400">Persistence is the key.</span>
    </div>
  );
};

// ─── Challenge 14: Disappearing Target ─────────────────────────────────────────
const DisappearingTarget: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setOpacity((o) => Math.max(0, o - 0.08));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-48">
      {opacity > 0.05 ? (
        <button
          onClick={onSuccess}
          style={{ opacity }}
          className="px-6 py-3 bg-brand-600 text-white font-bold rounded-2xl shadow-lg transition-opacity"
        >
          CLICK BEFORE I VANISH
        </button>
      ) : (
        <button
          onClick={onFailure}
          className="text-xs text-surface-400"
        >
          Too late, it vanished!
        </button>
      )}
    </div>
  );
};

// ─── Challenge 15: Reverse Statement ──────────────────────────────────────────
const ReverseStatement: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4">
      <div className="text-sm font-semibold text-surface-200">
        &ldquo;You already lost this round.&rdquo;
      </div>
      <div className="flex gap-4">
        <button
          onClick={onSuccess}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl"
        >
          No I Didn&apos;t!
        </button>
        <button
          onClick={onFailure}
          className="px-6 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-300 font-semibold rounded-xl border border-surface-700"
        >
          Give Up
        </button>
      </div>
    </div>
  );
};

// ─── Challenge 16: Click the Shapes ───────────────────────────────────────────
const ClickTheCircle: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex items-center justify-center gap-6 h-48">
      {/* Square */}
      <button
        onClick={onFailure}
        className="w-14 h-14 bg-surface-800 border-2 border-brand-500/50 rounded-none hover:bg-surface-700"
        aria-label="Square"
      />
      {/* Circle */}
      <button
        onClick={onSuccess}
        className="w-14 h-14 bg-brand-600 border-2 border-brand-400 rounded-full hover:scale-105 transition-transform"
        aria-label="Circle"
      />
      {/* Rounded rect */}
      <button
        onClick={onFailure}
        className="w-14 h-14 bg-surface-800 border-2 border-surface-700 rounded-xl hover:bg-surface-700"
        aria-label="Rounded rect"
      />
    </div>
  );
};

// ─── Challenge 17: Second Button ──────────────────────────────────────────────
const SecondButtonPosition: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex items-center justify-center gap-4 h-48">
      <button
        onClick={onFailure}
        className="px-5 py-2.5 bg-surface-800 border border-surface-700 text-white font-bold rounded-xl"
      >
        Second
      </button>
      {/* The 2nd button in order */}
      <button
        onClick={onSuccess}
        className="px-5 py-2.5 bg-surface-800 border border-surface-700 text-white font-bold rounded-xl"
      >
        First
      </button>
      <button
        onClick={onFailure}
        className="px-5 py-2.5 bg-surface-800 border border-surface-700 text-white font-bold rounded-xl"
      >
        Third
      </button>
    </div>
  );
};

// ─── Challenge 18: Math Trick ─────────────────────────────────────────────────
const MathTrick: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4">
      <div className="text-xl font-black text-white">2 + 2 = ?</div>
      <div className="flex gap-3">
        <button
          onClick={onSuccess}
          className="w-12 h-12 bg-surface-800 border border-surface-700 rounded-xl font-bold text-white hover:bg-surface-700"
        >
          4
        </button>
        <button
          onClick={onFailure}
          className="w-12 h-12 bg-surface-800 border border-surface-700 rounded-xl font-bold text-white animate-bounce"
        >
          22
        </button>
        <button
          onClick={onFailure}
          className="w-12 h-12 bg-surface-800 border border-surface-700 rounded-xl font-bold text-white"
        >
          🐟
        </button>
      </div>
    </div>
  );
};

// ─── Challenge 19: Tiny Dot ───────────────────────────────────────────────────
const TinySecretDot: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 relative w-full">
      <button
        onClick={onFailure}
        className="px-8 py-3 bg-surface-800 text-surface-400 font-bold rounded-2xl border border-surface-700"
      >
        THERE IS NO WAY TO WIN
      </button>
      <button
        onClick={onSuccess}
        className="absolute bottom-2 right-4 w-3.5 h-3.5 bg-brand-400 rounded-full hover:scale-150 transition-transform opacity-70 hover:opacity-100"
        title="secret"
      />
    </div>
  );
};

// ─── Challenge 20: Fake Claim Prize ───────────────────────────────────────────
const FakePrizeClaim: React.FC<ChallengeContext> = ({ onSuccess, onFailure }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <span className="text-xl font-black text-amber-400">🎉 YOU WON 1,000,000 COINS!</span>
      <button
        onClick={onFailure}
        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 animate-pulse"
      >
        CLAIM PRIZE NOW
      </button>
      <button
        onClick={onSuccess}
        className="text-[11px] text-surface-400 hover:text-surface-200 mt-1"
      >
        Skip and continue playing
      </button>
    </div>
  );
};

// ─── Challenges Registry (30 micro-challenges) ───────────────────────────────
export const CHALLENGES: ChallengeDef[] = [
  {
    id: 1,
    title: 'DODGING BUTTON',
    instruction: 'Click the GREEN button',
    timeLimitSeconds: 6,
    Component: MovingGreenButton,
  },
  {
    id: 2,
    title: 'THE SHUFFLE',
    instruction: 'Click the BLUE button',
    timeLimitSeconds: 6,
    Component: SwappingButtons,
  },
  {
    id: 3,
    title: 'PATIENCE TEST',
    instruction: "DON'T click anything for 3 seconds",
    timeLimitSeconds: 5,
    Component: DontTouchAnything,
  },
  {
    id: 4,
    title: 'MIRROR WORLD',
    instruction: 'Click the LEFT button (position-wise)',
    timeLimitSeconds: 5,
    Component: InvertedLeftRight,
  },
  {
    id: 5,
    title: 'REVERSE PSYCHOLOGY',
    instruction: "Click the button that says 'DON'T CLICK ME'",
    timeLimitSeconds: 5,
    Component: ReversePsychology,
  },
  {
    id: 6,
    title: 'SIZE MATTERS',
    instruction: 'Press the physically BIGGER button',
    timeLimitSeconds: 5,
    Component: PhysicalSizeTrick,
  },
  {
    id: 7,
    title: 'STROOP TEST',
    instruction: 'What COLOR is this text displayed in?',
    timeLimitSeconds: 5,
    Component: StroopColorText,
  },
  {
    id: 8,
    title: 'ALERT TRAP',
    instruction: 'Dismiss the alert notice',
    timeLimitSeconds: 6,
    Component: FakeBrowserAlert,
  },
  {
    id: 9,
    title: 'DISGUISED UI',
    instruction: 'Cancel the running background process',
    timeLimitSeconds: 6,
    Component: DisguisedProgressBar,
  },
  {
    id: 10,
    title: 'CRASH HANDLER',
    instruction: 'Handle the crash safely without restarting',
    timeLimitSeconds: 6,
    Component: FakeCrash,
  },
  {
    id: 11,
    title: 'BACKGROUND COLOR',
    instruction: 'Click the button with RED BACKGROUND',
    timeLimitSeconds: 5,
    Component: BackgroundColorMatch,
  },
  {
    id: 12,
    title: 'GREEN LIGHT',
    instruction: 'Wait for the signal, then click fast!',
    timeLimitSeconds: 6,
    Component: WaitForSignal,
  },
  {
    id: 13,
    title: 'PERSISTENCE',
    instruction: 'Click 3 times to break through',
    timeLimitSeconds: 6,
    Component: ThreeTaps,
  },
  {
    id: 14,
    title: 'FADING FAST',
    instruction: 'Click the target before it vanishes',
    timeLimitSeconds: 5,
    Component: DisappearingTarget,
  },
  {
    id: 15,
    title: 'REBUTTAL',
    instruction: 'Disprove the fake claim',
    timeLimitSeconds: 5,
    Component: ReverseStatement,
  },
  {
    id: 16,
    title: 'SHAPE SHIFT',
    instruction: 'Click the perfect CIRCLE',
    timeLimitSeconds: 5,
    Component: ClickTheCircle,
  },
  {
    id: 17,
    title: 'ORDER COUNTS',
    instruction: 'Click the SECOND button in the row',
    timeLimitSeconds: 5,
    Component: SecondButtonPosition,
  },
  {
    id: 18,
    title: 'QUICK MATH',
    instruction: 'Click the REAL answer to 2 + 2',
    timeLimitSeconds: 5,
    Component: MathTrick,
  },
  {
    id: 19,
    title: 'HIDDEN PIXEL',
    instruction: 'Find the hidden secret escape dot',
    timeLimitSeconds: 6,
    Component: TinySecretDot,
  },
  {
    id: 20,
    title: 'TOO GOOD TO BE TRUE',
    instruction: 'Avoid the scam prize trap',
    timeLimitSeconds: 6,
    Component: FakePrizeClaim,
  },
];

