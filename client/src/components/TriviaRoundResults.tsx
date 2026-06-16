import type { RevealData } from '../types';
import { AnimatedEntrance } from './AnimatedEntrance';

interface Props {
  revealData?: RevealData;
  compact?: boolean;
}

export function TriviaRoundResults({ revealData, compact }: Props) {
  const results = revealData?.playerResults;
  const correctAnswer = revealData?.correctAnswer;

  if (!correctAnswer && !results?.length) return null;

  return (
    <AnimatedEntrance anim="bounce-in">
      <div data-testid="trivia-round-results">
        {correctAnswer && (
          <div
            className="card card-glow"
            style={{ textAlign: 'center', marginBottom: 12, padding: compact ? 14 : 18 }}
          >
            <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Correct answer
            </p>
            <p style={{ fontSize: compact ? 16 : 20, fontWeight: 800, color: 'var(--success)' }} data-testid="correct-answer">
              {correctAnswer}
            </p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="card" style={{ padding: compact ? 10 : 14 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Who got it right
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map((r, i) => (
                <AnimatedEntrance key={r.id} anim="slide-up" delay={i * 50}>
                  <div
                    className="leaderboard-row"
                    style={{
                      alignItems: 'flex-start',
                      padding: '8px 0',
                      borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.06)' : undefined,
                    }}
                    data-testid={`trivia-result-${r.id}`}
                    data-correct={r.correct ? 'true' : 'false'}
                  >
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ fontWeight: 700 }}>
                        {r.correct ? '✓' : '✗'} {r.name}
                        {r.eliminated && (
                          <span style={{ color: 'var(--danger)', fontSize: 12, marginLeft: 6 }}>eliminated</span>
                        )}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--muted)', wordBreak: 'break-word' }}>
                        {r.answer}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: r.correct ? 'var(--success)' : 'var(--danger)',
                        flexShrink: 0,
                      }}
                    >
                      {r.correct ? 'Correct' : 'Wrong'}
                    </span>
                  </div>
                </AnimatedEntrance>
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedEntrance>
  );
}