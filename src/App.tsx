import { useState, useCallback, useRef, useEffect } from 'react';
import { runSimulation } from './simulation/engine';
import { ReplayPlayer } from './replay/player';
import { RACE_DISTANCE } from './simulation/phases';
import { distanceToSvg, getTrackGeometry } from './core/coordinate-system';
import type { GmaxRaceRecord, GmaxDataPoint } from './types/gmax';
import TrackView from './components/TrackView';
import CommentaryPanel from './components/CommentaryPanel';
import StandingsPanel from './components/StandingsPanel';
import './styles/index.css';

type AppPhase = 'idle' | 'simulating' | 'playing' | 'paused' | 'finished';

function App() {
  const [seed, setSeed] = useState('METAHORSE');
  const [phase, setPhase] = useState<AppPhase>('idle');
  const [record, setRecord] = useState<GmaxRaceRecord | null>(null);
  const [dataPoints, setDataPoints] = useState<GmaxDataPoint[]>([]);
  const [commentary, setCommentary] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [speed, setSpeed] = useState(1);

  const playerRef = useRef<ReplayPlayer | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const stopAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const animate = useCallback((timestamp: number) => {
    const player = playerRef.current;
    if (!player) return;

    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = timestamp;

    player.tick(dt);

    const points = player.getInterpolatedPositions();
    setDataPoints(points);
    setElapsedTime(player.getElapsedTime());
    setCheckpointIndex(player.state.checkpointIndex);

    // Collect commentary up to current checkpoint
    const cp = player.getCurrentCheckpoint();
    if (cp) {
      const allCommentary: string[] = [];
      for (let i = 0; i <= player.state.checkpointIndex; i++) {
        const c = player.record.checkpoints[i];
        allCommentary.push(...c.commentary);
      }
      setCommentary(allCommentary);
    }

    if (player.isFinished) {
      setPhase('finished');
      return;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const startRace = useCallback(() => {
    stopAnimation();
    setPhase('simulating');

    // Run simulation (synchronous, fast)
    const raceRecord = runSimulation(seed);
    setRecord(raceRecord);

    // Log first Gmax data point for verification
    console.log('=== Gmax Race Record ===');
    console.log('Race ID:', raceRecord.raceId);
    console.log('Horses:', raceRecord.horses.length);
    console.log('Checkpoints:', raceRecord.checkpoints.length);
    console.log('Sample Gmax data point:', JSON.stringify(raceRecord.checkpoints[0].horses[0], null, 2));
    console.log('Winner:', raceRecord.horses.find(h => h.id === raceRecord.winner)?.name);

    // Set up replay
    const player = new ReplayPlayer(raceRecord);
    playerRef.current = player;
    player.setSpeed(speed);
    player.play();

    setDataPoints(player.getInterpolatedPositions());
    setCommentary(raceRecord.checkpoints[0].commentary);
    setPhase('playing');
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
  }, [seed, speed, animate, stopAnimation]);

  const togglePlayPause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (player.state.isPlaying) {
      player.pause();
      stopAnimation();
      setPhase('paused');
    } else {
      if (player.isFinished) {
        player.restart();
      } else {
        player.play();
      }
      setPhase('playing');
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [animate, stopAnimation]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    if (playerRef.current) {
      playerRef.current.setSpeed(newSpeed);
    }
  }, []);

  const handleSeek = useCallback((checkpoint: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.seek(checkpoint);
    setDataPoints(player.getInterpolatedPositions());
    setCheckpointIndex(checkpoint);
    setElapsedTime(player.getElapsedTime());
  }, []);

  useEffect(() => {
    return () => stopAnimation();
  }, [stopAnimation]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>META.HORSE</h1>
        <div className="race-status">{phase.toUpperCase()}</div>
      </header>

      <div className="controls-bar">
        <div className="seed-controls">
          <input
            type="text"
            value={seed}
            onChange={e => setSeed(e.target.value.toUpperCase())}
            placeholder="Enter seed..."
            className="seed-input"
          />
          <button onClick={startRace} className="btn btn-primary">
            {record ? 'RESTART' : 'START RACE'}
          </button>
        </div>

        {record && (
          <div className="playback-controls">
            <button onClick={togglePlayPause} className="btn">
              {phase === 'playing' ? 'PAUSE' : 'PLAY'}
            </button>
            {[0.5, 1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`btn btn-speed ${speed === s ? 'active' : ''}`}
              >
                {s}x
              </button>
            ))}
            <input
              type="range"
              min={0}
              max={record.checkpoints.length - 1}
              value={checkpointIndex}
              onChange={e => handleSeek(parseInt(e.target.value))}
              className="timeline-slider"
            />
            <span className="time-display">{elapsedTime.toFixed(1)}s</span>
          </div>
        )}
      </div>

      <div className="main-content">
        <div className="track-container">
          {record && (
            <TrackView
              record={record}
              dataPoints={dataPoints}
              elapsedTime={elapsedTime}
            />
          )}
          {!record && (
            <div className="placeholder">Enter a seed and click START RACE</div>
          )}
        </div>
        <div className="sidebar">
          {record && (
            <>
              <StandingsPanel record={record} dataPoints={dataPoints} />
              <CommentaryPanel lines={commentary} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
