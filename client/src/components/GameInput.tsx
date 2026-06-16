import { useEffect, useState } from 'react';
import type { GameMeta, RoomState } from '../types';
import { DrawingCanvas } from './DrawingCanvas';

interface Props {
  room: RoomState;
  game: GameMeta;
  onSubmit: (value: unknown) => Promise<{ ok: boolean; error?: string } | undefined>;
}

export function GameInput({ room, game, onSubmit }: Props) {
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitted = room.submissions[room.playerId || ''] !== undefined;

  useEffect(() => {
    setText('');
    setSelected(null);
    setSubmitting(false);
  }, [room.round, room.subRound, room.phase, room.prompt]);

  const archetype = game.archetype;
  const presentation = (room.revealData as { presentation?: { playerHint?: string } })?.presentation;

  const submitAnswer = async (value: unknown) => {
    if (submitting) return;
    setSubmitting(true);
    await onSubmit(value);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="card submitted-card card-glow" data-testid="submitted-waiting">
        <div className="submitted-check">✓</div>
        <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: 16 }}>Submitted!</p>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, fontWeight: 600 }}>Waiting for others...</p>
      </div>
    );
  }

  if (archetype === 'draw-guess' || archetype === 'draw-bracket') {
    return <DrawingCanvas onSubmit={submitAnswer} />;
  }

  if (archetype === 'trivia-bool') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {presentation?.playerHint && (
          <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>{presentation.playerHint}</p>
        )}
        <button
          type="button"
          className="btn btn-truth-lie truth"
          data-testid="answer-TRUE"
          onClick={() => void submitAnswer('TRUE')}
        >
          TRUTH
        </button>
        <button
          type="button"
          className="btn btn-truth-lie lie"
          data-testid="answer-LIE"
          onClick={() => void submitAnswer('LIE')}
        >
          LIE
        </button>
      </div>
    );
  }

  if (archetype === 'trivia' || archetype === 'survival-trivia' || archetype === 'audio-pick' || archetype === 'teamwork' || archetype === 'debate' || archetype === 'role-label') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {room.options?.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`btn btn-secondary option-btn ${selected === opt ? 'selected' : ''}`}
            data-testid={`answer-option-${opt.replace(/\s+/g, '-')}`}
            onClick={() => {
              setSelected(opt);
              void submitAnswer(opt);
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (archetype === 'fibbage') {
    const lieForMe = () => {
      const lies = ['Something ridiculous', 'A made-up fact', 'Obviously wrong'];
      void submitAnswer(`[LIE_FOR_ME]${lies[Math.floor(Math.random() * lies.length)]}`);
    };
    return (
      <div>
        {presentation?.playerHint && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{presentation.playerHint}</p>
        )}
        <textarea
          rows={3}
          placeholder="Write a convincing lie..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={120}
          data-testid="fibbage-input"
        />
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: 8 }}
          data-testid="lie-for-me-btn"
          onClick={lieForMe}
        >
          Lie For Me!
        </button>
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 8 }}
          disabled={!text.trim() || submitting}
          data-testid="submit-answer-btn"
          onClick={() => void submitAnswer(text.trim())}
        >
          Submit Lie
        </button>
      </div>
    );
  }

  if (archetype === 'hidden-task') {
    const task = (room.revealData as { tasks?: Record<string, string> })?.tasks?.[room.playerId || ''];
    return (
      <div>
        {task && (
          <div className="card secret-task-card">
            <p className="secret-task-label">🤫 Secret task</p>
            <p className="secret-task-text">{task}</p>
          </div>
        )}
        <textarea
          rows={3}
          placeholder="Your answer..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          data-testid="hidden-task-input"
        />
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 12 }}
          disabled={!text.trim() || submitting}
          data-testid="submit-answer-btn"
          onClick={() => void submitAnswer(text.trim())}
        >
          Submit
        </button>
      </div>
    );
  }

  if (archetype === 'rank' || archetype === 'sort') {
    return (
      <div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
          Type items in order, comma-separated
        </p>
        <input
          placeholder="e.g. Pepperoni, Mushroom, Pineapple"
          value={text}
          onChange={(e) => setText(e.target.value)}
          data-testid="rank-sort-input"
        />
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 12 }}
          disabled={!text.trim() || submitting}
          data-testid="submit-answer-btn"
          onClick={() => void submitAnswer(text.trim())}
        >
          Submit Order
        </button>
      </div>
    );
  }

  return (
    <div>
      <textarea
        rows={3}
        placeholder="Type your answer..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={200}
        data-testid="text-answer-input"
      />
      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 12 }}
        disabled={!text.trim() || submitting}
        data-testid="submit-answer-btn"
        onClick={() => void submitAnswer(text.trim())}
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </div>
  );
}