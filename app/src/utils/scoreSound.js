const WIN_SOUND_URL = '/win.mp3';
const VICTORY_SOUND_URL = '/win-vg.mp3';
const CUE_SOUND_URLS = {
  start: '/start.mp3',
  hourChange: '/hour-change.mp3',
};
const PITCH_STEP = 0.085;
const MAX_PLAYBACK_RATE = 1.85;
const SCORE_SOUND_VOLUME = 0.22;

function allowPitchShift(audio) {
  audio.preservesPitch = false;
  audio.mozPreservesPitch = false;
  audio.webkitPreservesPitch = false;
}

export function playScoreSound(step = 0, sound = 'win') {
  const audio = new Audio(sound === 'victory' ? VICTORY_SOUND_URL : WIN_SOUND_URL);
  const playbackRate = Math.min(1 + Math.max(0, step) * PITCH_STEP, MAX_PLAYBACK_RATE);

  audio.volume = SCORE_SOUND_VOLUME;
  audio.playbackRate = playbackRate;
  allowPitchShift(audio);

  audio.play().catch(() => {
    // Browsers can reject audio when the user has not interacted yet.
  });
}

export function playCueSound(cue) {
  const url = CUE_SOUND_URLS[cue];
  if (!url) return;

  const audio = new Audio(url);
  audio.volume = SCORE_SOUND_VOLUME;

  audio.play().catch(() => {
    // Browsers can reject audio when the user has not interacted yet.
  });
}
