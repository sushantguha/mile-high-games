import { useEffect, type ReactNode } from 'react';
import { getGameTheme } from '../data/gameThemes';

interface Props {
  gameId: string | null;
  children: ReactNode;
}

/** Applies per-game Jackbox-inspired accent colors to the page. */
export function GameThemeShell({ gameId, children }: Props) {
  const theme = getGameTheme(gameId);

  useEffect(() => {
    const root = document.documentElement;
    if (theme) {
      root.style.setProperty('--primary', theme.accent);
      root.style.setProperty('--game-bg', theme.background);
      root.style.setProperty('--game-accent', theme.accent);
    } else {
      root.style.removeProperty('--game-bg');
      root.style.removeProperty('--game-accent');
      root.style.setProperty('--primary', '#6366f1');
    }
    return () => {
      root.style.removeProperty('--game-bg');
      root.style.removeProperty('--game-accent');
    };
  }, [theme]);

  if (!theme) {
    return <div className="app-shell">{children}</div>;
  }

  return (
    <div
      className={`game-themed game-pattern-${theme.pattern} app-shell`}
      data-game-theme={theme.id}
      style={{
        minHeight: '100%',
        background: `radial-gradient(ellipse at top, ${theme.background} 0%, var(--bg) 70%)`,
        ['--game-accent' as string]: theme.accent,
      }}
    >
      <div className="game-theme-header" aria-hidden>
        <span className="game-theme-emoji">{theme.emoji}</span>
        <div className="game-theme-meta">
          <span className="game-theme-host">{theme.hostName}</span>
          <span className="game-theme-pack">{theme.pack}</span>
        </div>
      </div>
      {children}
    </div>
  );
}