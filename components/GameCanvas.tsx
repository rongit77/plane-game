import React, { useEffect, useState } from 'react';
import { LEVELS, THEMES, UPGRADES, COIN_SIZE, PICKUP_RADII, PLANE_WIDTH, PLANE_HEIGHT } from '../game/config';
import { ParticleSystem } from '../game/particles';

const DEBUG_PICKUP_HITBOX = false;

type GameCanvasProps = {
  gameWidth: number;
  gameHeight: number;
  currentLevel: number;
  bossActive: boolean;
  boss: any;
  money: number;
  points: number;
  health: number;
  maxHealth: number;
  shieldActive: boolean;
  shieldTimer: number;
  bombs: number;
  coins: any[];
  powerups: any[];
  hearts: any[];
  bombPickups: any[];
  shieldPickups: any[];
  bullets: any[];
  enemies: any[];
  bossBullets: any[];
  enemyBullets: any[];
  planeX: number;
  planeY: number;
  selectedColor: any;
  userData: any;
  lang: string;
  t: any;
  levelTimer: number;
  bombFlash: boolean;
  particleSystemRef?: React.RefObject<ParticleSystem | null>;
  levelOverlay?: string | null;
  bossWarningOverlay?: boolean;
};

const formatTime = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
};

export function GameCanvas(props: GameCanvasProps) {
  const {
    gameWidth,
    gameHeight,
    currentLevel,
    bossActive,
    boss,
    money,
    points,
    health,
    maxHealth,
    shieldActive,
    shieldTimer,
    bombs,
    coins,
    powerups,
    hearts,
    bombPickups,
    shieldPickups,
    bullets,
    enemies,
    bossBullets,
    enemyBullets,
    planeX,
    planeY,
    selectedColor,
    userData,
    lang,
    t,
    levelTimer,
    bombFlash,
    particleSystemRef,
    levelOverlay,
    bossWarningOverlay
  } = props;

  const currentTheme = THEMES[LEVELS[currentLevel]?.theme || 'sky'];
  const [displayScale, setDisplayScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (typeof window === 'undefined') return;
      const horizontalPadding = 16;
      const reservedVerticalSpace = 170;
      const availableWidth = Math.max(320, window.innerWidth - horizontalPadding);
      const availableHeight = Math.max(220, window.innerHeight - reservedVerticalSpace);
      const nextScale = Math.min(availableWidth / gameWidth, availableHeight / gameHeight, 1);
      setDisplayScale(nextScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [gameWidth, gameHeight]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 p-2 overflow-hidden">
      {/* HUD bar: semi-transparent dark, rounded bottom */}
      <div
        className="w-full max-w-[800px] flex flex-wrap items-center justify-between gap-2 px-3 py-2 mb-1 rounded-b-xl text-sm font-bold"
        style={{ background: 'rgba(0,0,0,0.7)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-purple-400 px-1 text-xs">
            {currentLevel + 1}/8 {t.levels[currentLevel]}
          </span>
          {!bossActive && (
            <span className="text-white/90 text-xs">⏱️ {formatTime(levelTimer)}</span>
          )}
          {bossActive && (
            <span className="text-red-500 animate-pulse text-xs">👹 {t.bosses[currentLevel]}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Health: segmented bar (each segment = 1 HP) */}
          <div className="flex items-center gap-0.5" title={`${health}/${maxHealth}`}>
            <span className="text-red-400 text-xs mr-1">❤️</span>
            <div className="flex gap-px">
              {Array.from({ length: maxHealth }, (_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-3 rounded-sm"
                  style={{
                    background: i < health ? (health <= maxHealth * 0.25 ? '#ef4444' : '#dc2626') : 'rgba(80,80,80,0.6)'
                  }}
                />
              ))}
            </div>
          </div>
          {shieldActive && (
            <div className="flex items-center gap-1">
              <span className="text-cyan-400 text-xs">🛡️</span>
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-150"
                  style={{ width: `${(shieldTimer / 20000) * 100}%` }}
                />
              </div>
            </div>
          )}
          <span className="text-yellow-400 text-xs">💰{money}</span>
          <span className="text-blue-400 text-xs">⭐{points}</span>
          <span className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={i < bombs ? 'opacity-100' : 'opacity-30'} style={{ fontSize: '0.9rem' }}>💣</span>
            ))}
          </span>
        </div>
      </div>
      {bossActive && boss && (
        <div className="w-48 mb-1 -mt-0.5">
          <div className="w-full h-3 bg-gray-800 rounded-full border border-red-600 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-150"
              style={{ width: `${(boss.health / boss.maxHealth) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div
        className="relative rounded-lg border-2 border-gray-700 shadow-2xl shadow-black/60 overflow-hidden"
        style={{ width: gameWidth * displayScale, height: gameHeight * displayScale }}
      >
        <div style={{ width: gameWidth, height: gameHeight, transform: `scale(${displayScale})`, transformOrigin: 'top left' }}>
        {/* Level start overlay: fade in/out */}
        {levelOverlay && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none rounded-lg bg-black/30 transition-opacity duration-300"
            style={{ width: gameWidth, height: gameHeight }}
          >
            <span className="text-white text-2xl font-bold drop-shadow-lg animate-pulse">
              {levelOverlay}
            </span>
          </div>
        )}
        {/* Boss warning overlay */}
        {bossWarningOverlay && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none rounded-lg bg-red-900/40 transition-opacity duration-300"
            style={{ width: gameWidth, height: gameHeight }}
          >
            <span className="text-red-500 text-3xl font-black drop-shadow-lg animate-pulse">
              ⚠️ BOSS ⚠️
            </span>
          </div>
        )}
      <svg width={gameWidth} height={gameHeight} className="block">
        <defs>
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={bossActive ? '#2a1a1a' : currentTheme.sky1} />
            <stop offset="100%" stopColor={bossActive ? '#1a0a0a' : currentTheme.sky2} />
          </linearGradient>
          {/* Plane color filters for PNG variants */}
          <filter id="plane-color-gray">
            <feColorMatrix type="saturate" values="0.3" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.8" intercept="0.15" />
              <feFuncG type="linear" slope="0.8" intercept="0.15" />
              <feFuncB type="linear" slope="0.8" intercept="0.15" />
            </feComponentTransfer>
          </filter>
          <filter id="plane-color-green">
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.6" />
              <feFuncG type="linear" slope="1.3" />
              <feFuncB type="linear" slope="0.5" />
            </feComponentTransfer>
          </filter>
          <filter id="plane-color-blue">
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.5" />
              <feFuncG type="linear" slope="0.8" />
              <feFuncB type="linear" slope="1.4" />
            </feComponentTransfer>
          </filter>
          <filter id="plane-color-red">
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.4" />
              <feFuncG type="linear" slope="0.5" />
              <feFuncB type="linear" slope="0.5" />
            </feComponentTransfer>
          </filter>
        </defs>
        <rect width={gameWidth} height={gameHeight} fill="url(#sky)" />
        <circle
          cx={gameWidth - 60}
          cy={50}
          r={30}
          fill={bossActive ? '#8B0000' : currentTheme.sun}
          opacity={bossActive ? 0.6 : 1}
        />
        <rect
          x={0}
          y={gameHeight - 30}
          width={gameWidth}
          height={30}
          fill={bossActive ? '#2a1515' : currentTheme.ground}
        />

        {bombFlash && <rect width={gameWidth} height={gameHeight} fill="white" opacity={0.8} />}
        {particleSystemRef?.current?.render()}

        {coins.map((c) => (
          <g key={c.id}>
            <circle
              cx={c.x + 12}
              cy={c.y + 12}
              r={12}
              fill="#FFD700"
              stroke="#DAA520"
              strokeWidth={2}
            />
            <text
              x={c.x + 12}
              y={c.y + 16}
              textAnchor="middle"
              fontSize="12"
              fill="#8B4513"
            >
              $
            </text>
          </g>
        ))}
        {powerups.map((p) => (
          <polygon
            key={p.id}
            points={`${p.x + 15},${p.y} ${p.x + 30},${p.y + 15} ${p.x + 15},${p.y + 30} ${p.x},${
              p.y + 15
            }`}
            fill={p.type === 'double' ? '#00BFFF' : '#00FF00'}
            stroke="white"
            strokeWidth={2}
          />
        ))}
        {hearts.map((h) => (
          <circle
            key={h.id}
            cx={h.x + 12}
            cy={h.y + 12}
            r={12}
            fill={h.type === 'green' ? '#22c55e' : h.type === 'orange' ? '#f97316' : '#ec4899'}
          />
        ))}
        {bombPickups.map((b) => (
          <g key={b.id}>
            <circle cx={b.x + 15} cy={b.y + 15} r={14} fill="#1a1a1a" />
            <text x={b.x + 15} y={b.y + 20} textAnchor="middle" fontSize="16">
              💣
            </text>
          </g>
        ))}
        {shieldPickups.map((s) => (
          <g key={s.id}>
            <circle
              cx={s.x + 15}
              cy={s.y + 15}
              r={14}
              fill="#1a3a5a"
              stroke="#00ffff"
              strokeWidth={2}
            />
            <text x={s.x + 15} y={s.y + 20} textAnchor="middle" fontSize="14">
              ⚡
            </text>
          </g>
        ))}

        {enemies.map((e) => (
          <g key={e.id}>
            <rect x={e.x} y={e.y} width={e.width} height={e.height} rx={5} fill={e.color} />
            <text
              x={e.x + e.width / 2}
              y={e.y + e.height / 2 + 5}
              textAnchor="middle"
              fontSize={e.width > 40 ? 20 : 14}
            >
              {e.emoji}
            </text>
          </g>
        ))}

        {boss && (
          <g transform={`translate(${boss.x},${boss.y})`}>
            {/* Boss glow effect */}
            <ellipse
              cx={50}
              cy={50}
              rx={60}
              ry={55}
              fill={`rgba(255,0,0,${0.2 + Math.sin(Date.now() * 0.005) * 0.1})`}
            />
            {/* Boss image - haminai.png for all levels */}
            <image
              href="/assets/haminai.png"
              x={0}
              y={0}
              width={100}
              height={100}
              preserveAspectRatio="xMidYMid meet"
              style={{ imageRendering: 'auto' }}
            />
            {/* Health bar above boss */}
            <rect x={0} y={-15} width={100} height={8} fill="#333" rx={4} />
            <rect
              x={1}
              y={-14}
              width={98 * (boss.health / boss.maxHealth)}
              height={6}
              fill="#ff0000"
              rx={3}
            />
          </g>
        )}

        {bossBullets.map((b) => (
          <ellipse key={b.id} cx={b.x} cy={b.y} rx={10} ry={5} fill="#ff0000" />
        ))}
        {enemyBullets.map((b) => (
          <ellipse key={b.id} cx={b.x} cy={b.y} rx={6} ry={3} fill="#ff00ff" />
        ))}

        {/* Debug: pickup hitbox circles (set DEBUG_PICKUP_HITBOX true to verify, then remove) */}
        {DEBUG_PICKUP_HITBOX && (
          <>
            <circle cx={planeX} cy={planeY} r={PICKUP_RADII.coin} fill="none" stroke="lime" strokeWidth={1} opacity={0.5} />
            {coins.map((coin, i) => (
              <circle key={`debug-${coin.id}-${i}`} cx={coin.x + COIN_SIZE / 2} cy={coin.y + COIN_SIZE / 2} r={PICKUP_RADII.coin} fill="none" stroke="yellow" strokeWidth={1} opacity={0.5} />
            ))}
          </>
        )}
        {/* Player Plane (PNG + color filter) */}
        <g transform={`translate(${planeX},${planeY})`}>
          {shieldActive && (
            <circle cx={0} cy={0} r={50} fill="#22c55e" opacity={0.3} stroke="#22c55e" strokeWidth={2} />
          )}
          {(userData?.upgrades?.magnet || 0) > 0 && (
            <circle
              cx={0}
              cy={0}
              r={30 + (userData?.upgrades?.magnet || 0) * UPGRADES.magnet.effect}
              fill="none"
              stroke="#ffd700"
              strokeWidth={1}
              opacity={0.4}
              strokeDasharray="5,5"
            />
          )}
          {/* Engine flame (behind the plane image) */}
          <ellipse cx={-50} cy={0} rx={8} ry={5} fill="#ff2200" />
          <ellipse cx={-52} cy={0} rx={5} ry={4} fill="#ff6600" />
          <image
            href="/assets/plane.png"
            x={-60}
            y={-25}
            width={120}
            height={50}
            filter={selectedColor?.id ? `url(#plane-color-${selectedColor.id})` : undefined}
            style={{ imageRendering: 'auto' }}
          />
        </g>

        {bullets.map((b) => (
          <ellipse key={b.id} cx={b.x} cy={b.y} rx={8} ry={3} fill={b.color} />
        ))}
      </svg>
        </div>
      </div>
      <p className="text-gray-400 mt-1 text-xs">
        W/A/S/D - {lang === 'he' ? 'טיסה' : 'Fly'} | Click - {lang === 'he' ? 'ירי' : 'Shoot'} | Space - 💣
      </p>
    </div>
  );
}

