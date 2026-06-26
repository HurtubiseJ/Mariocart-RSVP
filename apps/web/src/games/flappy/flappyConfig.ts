/** Flappy minigame tuning. Speeds in px/second; the speed stays constant. */
export const FLAPPY = {
  gravity: 2000, // px/s^2
  flapVelocity: -560, // px/s applied on each tap
  maxFall: 780, // px/s terminal velocity
  scrollSpeed: 168, // px/s — constant the whole run
  gapFraction: 0.34, // gap height as a fraction of play area
  pipeWidth: 70,
  pipeSpacing: 235, // horizontal px between consecutive pipes
  firstPipeDelay: 280, // px of runway before the first pipe
  birdRadius: 16,
  birdXFraction: 0.3,
  groundFraction: 0.12, // ground band height
  edgeMargin: 28, // keep gaps away from the very top/bottom
} as const;
