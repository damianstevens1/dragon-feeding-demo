import * as THREE from "three";
import "./styles.css";

const QUESTIONS = [
  question("q07", "What do we use to stay dry in the rain?", item("umbrella"), [item("cookie"), item("chair")], "We use an umbrella to stay dry in the rain."),
  question("q08", "What do we use to brush our teeth?", item("toothbrush"), [item("toy-truck", "toy truck"), item("banana")], "We use a toothbrush to brush our teeth."),
  question("q12", "What do we use to eat soup?", item("spoon"), [item("ball"), item("hat")], "We use a spoon to eat soup."),
  question("q13", "What do we use to write?", item("pencil"), [item("toothbrush"), item("shoe")], "We use a pencil to write."),
  question("q14", "What do we use to call someone?", item("phone"), [item("blanket"), item("apple")], "We use a phone to call someone."),
  question("q15", "What do we use to wash our hands?", item("soap"), [item("toy-car", "toy car"), item("cracker")], "We use soap to wash our hands."),
  question("q19", "What do we use to protect our head?", item("helmet"), [item("donut"), item("toy-boat", "toy boat")], "We use a helmet to protect our head."),
  question("q23", "What do we use to water plants?", item("watering-can", "watering can"), [item("yo-yo", "yo-yo"), item("sandwich-bag", "sandwich bag")], "We use a watering can to water plants."),
  question("q05", "What do we use to cut paper?", item("scissors"), [item("shoe"), item("cup")], "We use scissors to cut paper."),
  question("q02", "What do we use to sweep the floor?", item("broom"), [item("cupcake"), item("toy-car", "toy car")], "We use a broom to sweep the floor.")
];

const FOODS = [
  { id: "apple", label: "apple", src: "/assets/images/snacks/apple.png" },
  { id: "banana", label: "banana", src: "/assets/images/snacks/banana.png" },
  { id: "cookie", label: "cookie", src: "/assets/images/snacks/cookie.png" },
  { id: "cupcake", label: "cupcake", src: "/assets/images/snacks/cupcake-remade.png" },
  { id: "donut", label: "donut", src: "/assets/images/snacks/donut-remade.png" },
  { id: "orange", label: "orange", src: "/assets/images/snacks/orange.png" },
  { id: "pretzel", label: "pretzel", src: "/assets/images/snacks/pretzel.png" },
  { id: "strawberry", label: "strawberry", src: "/assets/images/snacks/strawberry.png" },
  { id: "watermelon", label: "watermelon", src: "/assets/images/snacks/watermelon.png" },
  { id: "pizza", label: "pizza", src: "/assets/images/snacks/pizza.png" }
];

const startScreen = document.querySelector("#start-screen");
const gameScreen = document.querySelector("#game-screen");
const questionPanel = document.querySelector("#question-panel");
const rewardVideoPanel = document.querySelector("#reward-video-panel");
const munchVideoPanel = document.querySelector("#munch-video-panel");
const celebrationPanel = document.querySelector("#celebration-panel");
const playButton = document.querySelector("#play-button");
const playAgainButton = document.querySelector("#play-again-button");
const repeatButton = document.querySelector("#repeat-button");
const videoCloseButton = document.querySelector("#video-close-button");
const videoPlayButton = document.querySelector("#video-play-button");
const videoContinueButton = document.querySelector("#video-continue-button");
const videoPrevButton = document.querySelector("#video-prev-button");
const videoNextButton = document.querySelector("#video-next-button");
const questionPrevButton = document.querySelector("#question-prev-button");
const questionNextButton = document.querySelector("#question-next-button");
const progressPill = document.querySelector("#progress-pill");
const starsPill = document.querySelector("#stars-pill");
const questionText = document.querySelector("#question-text");
const answersGrid = document.querySelector("#answers-grid");
const foodTray = document.querySelector("#food-tray");
const starRow = document.querySelector("#star-row");
const rewardVideo = document.querySelector("#reward-video");
const rewardVideoPoster = document.querySelector("#reward-video-poster");
const rewardVideoCard = rewardVideoPanel?.querySelector(".video-card");
const munchVideo = document.querySelector("#munch-video");
const munchVideoPoster = document.querySelector("#munch-video-poster");
const munchTrayOverlay = document.querySelector("#munch-tray-overlay");
const dragonPuppet = document.querySelector("#dragon-puppet");
const dragonMouthTarget = document.querySelector("#dragon-mouth-target");
const dragonFireBreath = document.querySelector("#dragon-fire-breath");

const state = {
  screen: "start",
  questionIndex: 0,
  stars: 0,
  locked: false,
  promptSpeaking: false,
  promptRun: 0,
  promptRepeatTimer: 0,
  selectedFood: null,
  selectedFlyer: null,
  selectedSourceRect: null,
  draggingFood: null,
  selectedAnswerId: null,
  wrongAnswerId: null,
  rewardVideoActive: false,
  rewardCompleting: false,
  rewardVideoDirectOpen: false,
  rewardVideoSkippable: false,
  rewardVideoKind: "card",
  rewardVideoIndex: 0,
  munchReactionActive: false,
  completedQuestionIds: new Set()
};

const FINAL_REWARD_VIDEO = {
  src: "/assets/videos/final-dragon-reward.mp4",
  posterSrc: "/assets/videos/final-dragon-reward-poster.png"
};

const MUNCH_REACTION_VIDEO = {
  src: "/assets/videos/dragon-munch-reaction.mp4",
  posterSrc: "/assets/videos/dragon-munch-reaction-poster.png"
};

const FEED_TIMING = {
  questionDelayMs: 320,
  correctHoldMs: 1000,
  chewToggleMs: 210,
  chewLoops: 2,
  wiggleStartMs: 760,
  wiggleDurationMs: 680,
  growDurationMs: 1150,
  fireBreathMs: 720,
  resetAfterCorrectMs: 2550,
  taskCompleteDelayMs: 3500,
  celebrationMs: 24800,
  resetScaleMs: 2000
};

const DRAGON_FRAME_CLASSES = [
  "frame-idle-a",
  "frame-idle-b",
  "frame-blink",
  "frame-ready",
  "frame-chew",
  "frame-happy",
  "frame-celebrate-a",
  "frame-celebrate-b",
  "frame-dance-01",
  "frame-dance-02",
  "frame-dance-03",
  "frame-dance-04",
  "frame-dance-05",
  "frame-dance-06",
  "frame-dance-07",
  "frame-dance-08",
  "frame-dance-09",
  "frame-dance-10",
  "frame-dance-11",
  "frame-dance-12"
];

// Replace these placeholder sprite files with final art in public/sprites/dragon/.
const DRAGON_SPRITE_MANIFEST = {
  idle: { src: "/sprites/dragon/idle.png", frames: 4, frameWidth: 444, frameHeight: 444, fallbackFrame: "idle-a" },
  blink: { src: "/sprites/dragon/blink.png", frames: 4, frameWidth: 444, frameHeight: 444, fallbackFrame: "blink" },
  "happy-bounce": { src: "/sprites/dragon/happy-bounce.png", frames: 4, frameWidth: 444, frameHeight: 444, fallbackFrame: "happy" },
  "eat-crunch": { src: "/sprites/dragon/eat-crunch.png", frames: 4, frameWidth: 444, frameHeight: 444, fallbackFrame: "chew" },
  "funky-dance": { src: "/sprites/dragon/funky-dance.png", frames: 12, frameWidth: 444, frameHeight: 444, fallbackFrame: "dance-01" },
  "fire-breath": { src: "/sprites/dragon/fire-breath.png", frames: 4, frameWidth: 444, frameHeight: 444, fallbackFrame: "celebrate-b" }
};

const BLINK_TIMING = {
  minDelayMs: 3000,
  maxDelayMs: 8000,
  blinkMs: 120,
  doubleGapMs: 105,
  doubleChance: 0.2
};

const FINAL_DANCE = {
  pulseSpeed: 2.2,
  pulseAmount: 0.008,
  hopSpeed: 1.65,
  hopAmount: 0.007,
  turnSpeed: 0.92,
  turnAmount: 0.024,
  headNodSpeed: 1.8,
  headNodAmount: 0.022,
  headTiltSpeed: 1.45,
  headTiltAmount: 0.016,
  wingSpeed: 1.55,
  wingAmount: 0.055,
  wingYawSpeed: 1.2,
  wingYawAmount: 0.026,
  tailSpeed: 1.35,
  tailAmount: 0.055,
  puppetXSpeed: 1.1,
  puppetXAmount: 3.4,
  puppetYSpeed: 1.45,
  puppetYAmount: 1.8,
  puppetRollSpeed: 1.05,
  puppetRollAmountDeg: 0.55,
  bodyRollSpeedA: 1.1,
  bodyRollAmountDegA: 0.72,
  bodyRollSpeedB: 0.62,
  bodyRollAmountDegB: 0.28,
  eyeSpeed: 1.4,
  eyeXAmount: 0.012,
  eyeYSpeed: 1.8,
  eyeYAmount: 0.004,
  armSpeed: 1.45,
  armAmount: 0.13,
  footSpeed: 1.5,
  footAmount: 0.03,
  footLift: 0.008,
  frameMs: 660,
  squashSpeed: 1.45,
  squashX: 0.006,
  squashY: 0.005,
  fireParticleMs: 520,
  fireSoundMs: 6200
};

const DRAGON_SOUND_PATHS = {
  ambience: "/assets/audio/dragon/eerie_wind.ogg",
  wake: "/assets/audio/dragon/confirmation_003.wav",
  wing: ["/assets/audio/dragon/open_003.wav", "/assets/audio/dragon/open_004.wav"],
  chomp: ["/assets/audio/dragon/scratch_003.wav", "/assets/audio/dragon/scratch_004.wav", "/assets/audio/dragon/drop_003.wav"],
  correct: "/assets/audio/dragon/confirmation_004.wav",
  wrong: "/assets/audio/dragon/error_004.wav",
  celebrate: ["/assets/audio/dragon/confirmation_003.wav", "/assets/audio/dragon/confirmation_004.wav"]
};

// Replace these generated placeholder audio files with final royalty-free assets when available.
const DRAGON_AUDIO_PATHS = {
  backgroundMusic: "/audio/lord-of-the-rangs.mp3",
  fireBreath: "/audio/fire-breath.mp3",
  crunch: "/audio/dragon-crunch.mp3"
};

const BACKGROUND_MUSIC_VOLUME = 0.45;
const BACKGROUND_MUSIC_DUCKED_VOLUME = 0.16;

const SFX_PATHS = {
  eat: "/assets/sfx/eat-crunch.wav",
  dragonCrunch: DRAGON_AUDIO_PATHS.crunch,
  fireBreath: DRAGON_AUDIO_PATHS.fireBreath
};

let activeAudio = null;
let activeBufferSource = null;
let audioContext = null;
let dragonAmbience = null;
let backgroundMusic = null;
let backgroundBufferMusic = null;
let backgroundMusicDucked = false;
let fireBreathTimer = 0;
const dragonSampleCache = new Map();
const sfxCache = new Map();
const sfxBufferCache = new Map();
const spokenAudioBufferCache = new Map();
let lastFrame = 0;
let rewardVideoWatchdog = 0;
let rewardVideoSkipTimer = 0;
let finalRewardReturnTimer = 0;
let munchReactionTimer = 0;
let munchReactionWatchdog = 0;
let pendingMunchComplete = null;

const gameScene = makeScene(document.querySelector("#dragon-scene"));
const startScene = makeScene(document.querySelector("#start-canvas"), { decorative: true });

playButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);
repeatButton.addEventListener("click", () => {
  if (!state.locked || state.promptSpeaking) return;
  void playQuestionPrompt(0);
});
videoCloseButton.addEventListener("click", () => {
  if (state.rewardVideoSkippable) completeRewardVideo();
});
videoContinueButton.addEventListener("click", () => {
  if (state.rewardVideoSkippable) completeRewardVideo();
});
videoPrevButton.addEventListener("click", () => changeRewardVideo(-1));
videoNextButton.addEventListener("click", advanceRewardVideo);
questionPrevButton.addEventListener("click", () => navigateQuestion(-1));
questionNextButton.addEventListener("click", () => navigateQuestion(1));
videoPlayButton.addEventListener("click", () => {
  if (state.rewardVideoDirectOpen) {
    window.open(rewardVideo.currentSrc || rewardVideo.src, "_blank", "noopener");
    return;
  }
  void attemptRewardVideoPlay();
});
rewardVideo.addEventListener("ended", handleRewardVideoEnded);
rewardVideo.addEventListener("error", showRewardVideoFallback);
rewardVideo.addEventListener("playing", () => {
  clearRewardVideoWatchdog();
});
rewardVideo.addEventListener("timeupdate", () => {
  if (state.rewardVideoActive && rewardVideo.currentTime > 0.05) {
    setRewardPosterVisible(false);
    videoPlayButton.hidden = true;
  }
  if (state.rewardVideoActive && rewardVideo.currentTime >= 2) {
    setRewardVideoSkippable(true);
  }
});
rewardVideo.addEventListener("loadeddata", () => {
  if (state.rewardVideoActive && rewardVideo.paused) {
    videoPlayButton.hidden = false;
  }
});
munchVideo?.addEventListener("ended", finishMunchReaction);
munchVideo?.addEventListener("error", finishMunchReaction);
munchVideo?.addEventListener("timeupdate", () => {
  if (state.munchReactionActive && munchVideo.currentTime > 0.05) {
    setMunchPosterVisible(false);
  }
});
window.addEventListener("resize", resizeAll);

renderFoodTray();
renderMunchTrayOverlay();
resizeAll();
animate(0);

if (new URLSearchParams(window.location.search).has("play")) {
  window.setTimeout(() => {
    void startGame();
  }, 120);
}

if (new URLSearchParams(window.location.search).has("debug") && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
  window.__dragonDebug = {
    start: () => startGame(),
    forceCorrectEat: () => {
      state.screen = "playing";
      startScreen.hidden = true;
      gameScreen.hidden = false;
      gameScene.dragonMood = "eat";
      gameScene.displayScale = 0.5;
      gameScene.feedScale = 1;
      gameScene.fireBreathing = false;
      startTriggerMotion();
    },
    forceFinalDance: () => {
      state.screen = "playing";
      startScreen.hidden = true;
      gameScreen.hidden = false;
      gameScene.displayScale = 1;
      gameScene.fireBreathing = false;
      startTaskCompleteDance();
    },
    forceFinalRewardVideo: () => {
      state.screen = "playing";
      startScreen.hidden = true;
      gameScreen.hidden = false;
      state.locked = true;
      showFinalRewardVideo();
    },
    snapshot: () => ({
      mood: gameScene.dragonMood,
      motionType: gameScene.motion?.type ?? null,
      fireBreathing: gameScene.fireBreathing,
      spriteState: dragonPuppet?.dataset.spriteState ?? null,
      className: dragonPuppet?.className ?? "",
      fireParticles: gameScene.fireParticles.length
    })
  };

  if (new URLSearchParams(window.location.search).has("dance")) {
    window.setTimeout(() => {
      window.__dragonDebug.forceFinalDance();
    }, 160);
  }

  if (new URLSearchParams(window.location.search).has("finalVideo")) {
    window.setTimeout(() => {
      window.__dragonDebug.forceFinalRewardVideo();
    }, 160);
  }
}

function question(id, text, correct, wrong, answerSentence) {
  const number = id.replace("q", "");
  return {
    id,
    question: text,
    correct,
    wrong,
    answerSentence,
    questionAudioSrc: `/assets/audio/${id}.mp3`,
    answerAudioSrc: `/assets/audio/a${number}.mp3`,
    videoSrc: `/assets/videos/${correct.id}.mp4`,
    videoPosterSrc: correct.imageSrc
  };
}

function item(id, label = id.replace(/-/g, " ")) {
  return {
    id,
    label,
    imageSrc: `/assets/images/${id}.jpg`
  };
}

async function startGame() {
  void unlockAudio();
  void startBackgroundMusic();
  preloadDragonSamples();
  stopSpokenAudio();
  stopDragonAmbience();
  clearTimers();
  state.screen = "playing";
  state.questionIndex = 0;
  state.stars = 0;
  state.completedQuestionIds = new Set();
  state.locked = false;
  state.promptSpeaking = false;
  state.selectedFood = null;
  state.selectedFlyer = null;
  state.selectedSourceRect = null;
  state.draggingFood = null;
  state.selectedAnswerId = null;
  state.wrongAnswerId = null;
  state.rewardVideoActive = false;
  state.rewardCompleting = false;
  state.rewardVideoSkippable = false;
  state.rewardVideoKind = "card";
  state.rewardVideoIndex = 0;
  state.munchReactionActive = false;
  state.completedQuestionIds = new Set();
  removeFlyingFood();
  resetRewardVideo();
  resetMunchReaction();
  gameScene.dragonMood = "idle";
  gameScene.feedScale = 0;
  gameScene.displayScale = 0.5;
  gameScene.motion = null;
  gameScene.completedAt = 0;
  gameScene.fireBreathing = false;
  clearFireParticles(gameScene);
  dragonPuppet?.classList.remove("is-fire-breathing", "is-funky-dancing");
  resetBlinkState(gameScene);
  startScreen.hidden = true;
  gameScreen.hidden = false;
  questionPanel.hidden = true;
  rewardVideoPanel.hidden = true;
  celebrationPanel.hidden = true;
  renderFoodTray();
  updateHud();
  updateQuestionNav();
  resizeAll();
}

function renderFoodTray() {
  foodTray.replaceChildren();
  FOODS.forEach((food, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "food-item";
    button.dataset.index = index.toString();
    button.dataset.dx = "0";
    button.dataset.dy = "0";
    button.dataset.src = food.src;
    button.setAttribute("aria-label", food.label);
    button.innerHTML = `
      <span class="food-spot">
        <img class="food-thumb" src="${food.src}" alt="" draggable="false">
      </span>
    `;
    addFoodPointerHandlers(button);
    foodTray.append(button);
  });
}

function renderMunchTrayOverlay() {
  if (!munchTrayOverlay) return;
  munchTrayOverlay.replaceChildren();
  const fedFoodIds = getFedFoodIds();
  FOODS.forEach((food) => {
    const itemEl = document.createElement("span");
    itemEl.className = "munch-tray-food";
    if (fedFoodIds.has(food.id)) itemEl.classList.add("is-hidden");
    itemEl.innerHTML = `<img src="${food.src}" alt="" draggable="false">`;
    munchTrayOverlay.append(itemEl);
  });
}

function getFedFoodIds() {
  const fedFoodIds = new Set();
  [...foodTray.children].forEach((foodEl) => {
    const index = Number(foodEl.dataset.index);
    if (foodEl.classList.contains("is-fed") && FOODS[index]) {
      fedFoodIds.add(FOODS[index].id);
    }
  });
  return fedFoodIds;
}

function addFoodPointerHandlers(foodEl) {
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  let moved = false;

  foodEl.addEventListener("pointerdown", (event) => {
    if (state.locked || foodEl.classList.contains("is-fed")) return;
    event.preventDefault();
    foodEl.setPointerCapture(event.pointerId);
    startX = event.clientX;
    startY = event.clientY;
    baseX = 0;
    baseY = 0;
    moved = false;
    foodEl.classList.add("is-pressed");
  });

  foodEl.addEventListener("pointermove", (event) => {
    if (!foodEl.classList.contains("is-pressed")) return;
    const dx = baseX + event.clientX - startX;
    const dy = baseY + event.clientY - startY;
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > 8) {
      moved = true;
      if (!state.draggingFood) {
        state.draggingFood = {
          foodEl,
          flyer: createFoodFlyer(foodEl),
          sourceRect: getFoodImageRect(foodEl),
          pointerOffsetX: event.clientX - getFoodImageRect(foodEl).left,
          pointerOffsetY: event.clientY - getFoodImageRect(foodEl).top
        };
        foodEl.classList.add("is-selected");
      }
    }
    if (state.draggingFood?.foodEl === foodEl) {
      moveFlyerToPointer(state.draggingFood.flyer, event.clientX, event.clientY, state.draggingFood);
    }
  });

  foodEl.addEventListener("pointerup", (event) => {
    if (!foodEl.classList.contains("is-pressed")) return;
    foodEl.releasePointerCapture(event.pointerId);
    foodEl.classList.remove("is-pressed");
    if (state.draggingFood?.foodEl === foodEl) {
      feedFood(foodEl, state.draggingFood.flyer, state.draggingFood.sourceRect);
      state.draggingFood = null;
    } else if (!moved && !state.locked && !foodEl.classList.contains("is-fed")) {
      event.preventDefault();
      moved = true;
      feedFood(foodEl);
    }
  });

  foodEl.addEventListener("pointercancel", (event) => {
    if (foodEl.hasPointerCapture(event.pointerId)) {
      foodEl.releasePointerCapture(event.pointerId);
    }
    foodEl.classList.remove("is-pressed");
    if (state.draggingFood?.foodEl === foodEl) {
      state.draggingFood.flyer.remove();
      state.draggingFood = null;
      foodEl.classList.remove("is-selected");
    }
  });

  foodEl.addEventListener("click", (event) => {
    if (moved || state.locked || foodEl.classList.contains("is-fed")) {
      event.preventDefault();
      return;
    }
    feedFood(foodEl);
  });
}

function setFoodTransform(foodEl, dx, dy) {
  foodEl.dataset.dx = dx.toString();
  foodEl.dataset.dy = dy.toString();
  foodEl.style.transform = `translate(${dx}px, ${dy}px)`;
}

function resetFood(foodEl) {
  foodEl.classList.remove("is-locked", "is-selected");
  setFoodTransform(foodEl, 0, 0);
}

function getFoodImageRect(foodEl) {
  const image = foodEl.querySelector(".food-thumb");
  return (image || foodEl).getBoundingClientRect();
}

function createFoodFlyer(foodEl, sourceRect = getFoodImageRect(foodEl)) {
  const flyer = document.createElement("img");
  flyer.className = "flying-food";
  flyer.src = foodEl.dataset.src || foodEl.querySelector("img")?.src || "";
  flyer.alt = "";
  flyer.draggable = false;
  flyer.style.left = `${sourceRect.left}px`;
  flyer.style.top = `${sourceRect.top}px`;
  flyer.style.width = `${sourceRect.width}px`;
  flyer.style.height = `${sourceRect.height}px`;
  flyer.style.transform = "translate(0px, 0px) scale(1)";
  document.querySelector("#app").append(flyer);
  return flyer;
}

function moveFlyerToPointer(flyer, x, y, dragState) {
  const source = dragState.sourceRect;
  const targetLeft = x - dragState.pointerOffsetX;
  const targetTop = y - dragState.pointerOffsetY;
  flyer.style.transition = "none";
  flyer.style.transform = `translate(${targetLeft - source.left}px, ${targetTop - source.top}px) scale(1.06) rotate(-4deg)`;
}

function flyFoodToMouth(flyer) {
  const source = state.selectedSourceRect || flyer.getBoundingClientRect();
  const mouth = getMouthPoint();
  const targetLeft = mouth.x - source.width * 0.52;
  const targetTop = mouth.y - source.height * 0.5;
  flyer.style.transition = "transform 300ms cubic-bezier(0.2, 0.72, 0.2, 1), opacity 180ms ease";
  flyer.style.transform = `translate(${targetLeft - source.left}px, ${targetTop - source.top}px) scale(0.9) rotate(6deg)`;
}

function returnFoodFlyer() {
  const flyer = state.selectedFlyer;
  const foodEl = state.selectedFood;
  if (!flyer || !foodEl) return;
  const source = state.selectedSourceRect || getFoodImageRect(foodEl);
  const current = flyer.getBoundingClientRect();
  flyer.style.left = `${current.left}px`;
  flyer.style.top = `${current.top}px`;
  flyer.style.width = `${current.width}px`;
  flyer.style.height = `${current.height}px`;
  flyer.style.transition = "none";
  flyer.style.transform = "translate(0px, 0px) scale(1)";
  requestAnimationFrame(() => {
    flyer.style.transition = "transform 520ms cubic-bezier(0.26, 0.82, 0.22, 1), opacity 240ms ease";
    flyer.style.transform = `translate(${source.left - current.left}px, ${source.top - current.top}px) scale(1)`;
  });
  window.setTimeout(() => {
    flyer.remove();
    foodEl.classList.remove("is-selected");
    state.selectedFlyer = null;
  }, 540);
}

function eatFoodFlyer() {
  const flyer = state.selectedFlyer;
  if (!flyer) return;
  const current = flyer.getBoundingClientRect();
  flyer.style.left = `${current.left}px`;
  flyer.style.top = `${current.top}px`;
  flyer.style.width = `${current.width}px`;
  flyer.style.height = `${current.height}px`;
  flyer.style.transition = "none";
  flyer.style.transform = "translate(0px, 0px) scale(1)";
  requestAnimationFrame(() => {
    flyer.style.transition = "transform 300ms cubic-bezier(0.28, 0.72, 0.42, 1), opacity 240ms ease";
    flyer.classList.add("is-eaten");
  });
  window.setTimeout(() => {
    flyer.remove();
    state.selectedFlyer = null;
  }, 320);
}

function removeFlyingFood() {
  document.querySelectorAll(".flying-food").forEach((item) => item.remove());
}

function feedFood(foodEl, existingFlyer = null, sourceRect = null) {
  if (state.locked || state.screen !== "playing" || foodEl.classList.contains("is-fed")) return;
  void unlockAudio();
  state.locked = true;
  state.selectedFood = foodEl;
  state.selectedSourceRect = sourceRect || getFoodImageRect(foodEl);
  state.selectedAnswerId = null;
  state.wrongAnswerId = null;
  lockFoodTray(true);
  updateQuestionNav();
  gameScene.dragonMood = "ready";
  const now = performance.now();
  syncDragonPuppet(gameScene, now, now * 0.001);
  foodEl.classList.add("is-locked", "is-selected");
  const flyer = existingFlyer || createFoodFlyer(foodEl, state.selectedSourceRect);
  state.selectedFlyer = flyer;
  flyFoodToMouth(flyer);

  const askQuestion = () => {
    if (state.selectedFood !== foodEl || state.screen !== "playing") return;
    openQuestion();
  };
  if (FEED_TIMING.questionDelayMs > 0) {
    window.setTimeout(askQuestion, FEED_TIMING.questionDelayMs);
  } else {
    askQuestion();
  }
}

function getMouthPoint() {
  if (dragonMouthTarget && !gameScreen.hidden) {
    const rect = dragonMouthTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
  }
  const mouth = gameScene?.dragon?.mouthAnchor;
  if (mouth) {
    gameScene.scene.updateMatrixWorld(true);
    gameScene.camera.updateMatrixWorld(true);
    const point = mouth.getWorldPosition(new THREE.Vector3()).project(gameScene.camera);
    const rect = gameScene.canvas.getBoundingClientRect();
    return {
      x: rect.left + (point.x * 0.5 + 0.5) * rect.width,
      y: rect.top + (-point.y * 0.5 + 0.5) * rect.height
    };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    x: width * (width < 640 ? 0.24 : 0.38),
    y: height * (width < 640 ? 0.54 : 0.55)
  };
}

function openQuestion() {
  const current = QUESTIONS[state.questionIndex];
  const answers = shuffle([current.correct, ...current.wrong], current.id);
  questionText.textContent = current.question;
  answersGrid.replaceChildren();

  answers.forEach((answer) => {
    const button = document.createElement("button");
    const answerState =
      state.selectedAnswerId === answer.id ? "correct" : state.wrongAnswerId === answer.id ? "wrong" : "idle";
    button.type = "button";
    button.className = `answer-card answer-${answerState}`;
    button.disabled = state.promptSpeaking;
    button.setAttribute("aria-label", answer.label);
    button.innerHTML = `
      <span class="answer-image-frame">
        <img src="${answer.imageSrc}" alt="" draggable="false">
      </span>
      <span class="answer-label"></span>
      <span class="answer-check" aria-hidden="true"></span>
    `;
    button.querySelector(".answer-label").textContent = answer.label;
    button.addEventListener("click", () => selectAnswer(answer));
    answersGrid.append(button);
  });

  questionPanel.hidden = false;
  updateQuestionNav();
  void playQuestionPrompt(0);
}

function rerenderAnswersOnly() {
  if (questionPanel.hidden) return;
  const current = QUESTIONS[state.questionIndex];
  [...answersGrid.children].forEach((button) => {
    const label = button.getAttribute("aria-label");
    const allAnswers = [current.correct, ...current.wrong];
    const answer = allAnswers.find((candidate) => candidate.label === label);
    button.disabled = state.promptSpeaking || !state.locked;
    button.classList.toggle("answer-correct", answer?.id === state.selectedAnswerId);
    button.classList.toggle("answer-wrong", answer?.id === state.wrongAnswerId);
  });
}

async function playQuestionPrompt(delayMs = 0) {
  const current = QUESTIONS[state.questionIndex];
  const run = ++state.promptRun;
  clearRepeatTimer();
  state.promptSpeaking = true;
  repeatButton.disabled = true;
  rerenderAnswersOnly();
  await Promise.race([
    playAudioOrSpeak(current.questionAudioSrc, current.question, delayMs),
    wait(delayMs + 4200).then(() => "timeout")
  ]);
  if (run !== state.promptRun || state.screen !== "playing" || questionPanel.hidden) return;
  state.promptSpeaking = false;
  repeatButton.disabled = false;
  rerenderAnswersOnly();
  updateQuestionNav();
}

function selectAnswer(answer) {
  if (!state.locked || state.promptSpeaking) return;
  void unlockAudio();
  const current = QUESTIONS[state.questionIndex];
  if (answer.id === current.correct.id) {
    void handleCorrect(answer);
  } else {
    handleWrong(answer);
  }
}

async function handleCorrect(answer) {
  const current = QUESTIONS[state.questionIndex];
  const shouldShowFinalReward = isFinalQuestion();
  state.selectedAnswerId = answer.id;
  state.wrongAnswerId = null;
  state.rewardCompleting = false;
  state.promptRun += 1;
  state.promptSpeaking = true;
  repeatButton.disabled = true;
  stopSpokenAudio();
  rerenderAnswersOnly();
  updateQuestionNav();
  playSuccessTone();
  await playAudioOrSpeak(current.answerAudioSrc, current.answerSentence, 0);
  if (state.screen !== "playing" || state.selectedFood == null) return;
  state.promptSpeaking = false;
  repeatButton.disabled = false;
  questionPanel.hidden = true;
  gameScene.dragonMood = "ready";

  window.setTimeout(() => {
    if (state.screen !== "playing" || state.selectedFood == null) return;
    const foodEl = state.selectedFood;
    foodEl.classList.add("is-fed");
    eatFoodFlyer();
    gameScene.dragonMood = "eat";
    launchTreat(gameScene);
    startTriggerMotion();
    window.setTimeout(playDragonChomp, 35);
  }, 260);

  if (state.screen === "playing" && state.selectedFood != null) {
    window.setTimeout(
      () => {
        if (shouldShowFinalReward) {
          markCurrentQuestionComplete();
          showFinalRewardVideo();
          return;
        }
        showRewardVideo(current.videoSrc, current.videoPosterSrc, { kind: "card", index: state.questionIndex });
      },
      FEED_TIMING.resetAfterCorrectMs
    );
  }
}

function completeFood() {
  markCurrentQuestionComplete();
  state.promptSpeaking = false;
  repeatButton.disabled = false;
  clearRepeatTimer();
  gameScene.feedScale = state.stars;
  updateHud();

  if (state.completedQuestionIds.size >= QUESTIONS.length || isFinalQuestion()) {
    state.locked = true;
    lockFoodTray(true);
    updateQuestionNav();
    window.setTimeout(showFinalRewardVideo, 120);
    return;
  }

  state.questionIndex = getNextQuestionIndex(state.questionIndex, 1);
  updateHud();
  window.setTimeout(() => {
    state.locked = false;
    state.selectedFood = null;
    state.selectedSourceRect = null;
    state.selectedAnswerId = null;
    lockFoodTray(false);
    gameScene.dragonMood = "idle";
    updateQuestionNav();
  }, 260);
}

function markCurrentQuestionComplete() {
  state.completedQuestionIds.add(QUESTIONS[state.questionIndex].id);
  state.stars = Math.max(state.stars, state.completedQuestionIds.size);
}

function isFinalQuestion() {
  return state.questionIndex >= QUESTIONS.length - 1;
}

function startTriggerMotion() {
  const now = performance.now();
  const from = gameScene.displayScale ?? 0.5;
  const to = 0.5 + (state.stars + 1) * 0.05;
  gameScene.motion = {
    type: "trigger",
    startedAt: now,
    chewUntil: now + FEED_TIMING.chewToggleMs * FEED_TIMING.chewLoops * 2,
    wiggleAt: now + FEED_TIMING.wiggleStartMs,
    wiggleUntil: now + FEED_TIMING.wiggleStartMs + FEED_TIMING.wiggleDurationMs,
    growAt: now + FEED_TIMING.wiggleStartMs,
    growUntil: now + FEED_TIMING.wiggleStartMs + FEED_TIMING.growDurationMs,
    fromScale: from,
    toScale: to,
    chewOpen: true,
    wiggleRoll: 0
  };
}

function startTaskCompleteDance() {
  if (state.screen !== "playing") return;
  const now = performance.now();
  gameScene.dragonMood = "celebrate";
  playDragonCelebrateSound();
  gameScene.completedAt = now;
  gameScene.motion = {
    type: "taskComplete",
    startedAt: now,
    danceUntil: now + FEED_TIMING.celebrationMs,
    fireBreathStartedAt: now,
    nextFireParticleAt: now,
    nextFireSoundAt: now,
    fireSoundPlayed: false,
    resetUntil: now + FEED_TIMING.celebrationMs + FEED_TIMING.resetScaleMs,
    fromScale: gameScene.displayScale ?? 1,
    toScale: 0.5,
    wiggleRoll: 0
  };
}

function handleWrong(answer) {
  state.wrongAnswerId = answer.id;
  state.selectedAnswerId = null;
  state.promptSpeaking = true;
  repeatButton.disabled = true;
  rerenderAnswersOnly();
  updateQuestionNav();
  playTryAgainTone();
  playDragonPuff();
  window.setTimeout(() => {
    questionPanel.hidden = true;
    state.wrongAnswerId = null;
    const returningFood = state.selectedFood;
    if (state.selectedFood) {
      returnFoodFlyer();
      state.selectedFood.classList.remove("is-locked");
      setFoodTransform(state.selectedFood, 0, 0);
    }
    state.selectedFood = null;
    state.selectedSourceRect = null;
    state.promptSpeaking = false;
    repeatButton.disabled = false;
    state.promptRun += 1;
    stopSpokenAudio();
    rerenderAnswersOnly();
    gameScene.dragonMood = "idle";
    updateQuestionNav();
    window.setTimeout(() => {
      state.locked = false;
      lockFoodTray(false);
      updateQuestionNav();
    }, returningFood ? 540 : 0);
  }, 720);
}

function updateHud() {
  progressPill.textContent = `Card ${state.questionIndex + 1} of ${QUESTIONS.length}`;
  starsPill.textContent = `${state.stars} ${state.stars === 1 ? "star" : "stars"}`;
  updateQuestionNav();
}

function canNavigateQuestions() {
  return state.screen === "playing"
    && !state.locked
    && !state.promptSpeaking
    && !state.rewardVideoActive
    && !state.munchReactionActive
    && questionPanel.hidden
    && rewardVideoPanel.hidden
    && (!munchVideoPanel || munchVideoPanel.hidden);
}

function navigateQuestion(direction) {
  if (!canNavigateQuestions()) return;
  if (direction > 0 && state.questionIndex >= QUESTIONS.length - 1) {
    showFinalRewardVideo();
    return;
  }

  const nextIndex = Math.min(QUESTIONS.length - 1, Math.max(0, state.questionIndex + direction));
  if (nextIndex === state.questionIndex) return;
  stopSpokenAudio();
  removeFlyingFood();
  state.questionIndex = nextIndex;
  state.selectedFood = null;
  state.selectedFlyer = null;
  state.selectedSourceRect = null;
  state.draggingFood = null;
  state.selectedAnswerId = null;
  state.wrongAnswerId = null;
  state.promptRun += 1;
  gameScene.dragonMood = "idle";
  gameScene.motion = null;
  gameScene.fireBreathing = false;
  clearFireParticles(gameScene);
  dragonPuppet?.classList.remove("is-fire-breathing", "is-funky-dancing");
  lockFoodTray(false);
  updateHud();
}

function getNextQuestionIndex(fromIndex, direction) {
  const fallback = Math.min(QUESTIONS.length - 1, Math.max(0, fromIndex + direction));
  for (let step = 1; step <= QUESTIONS.length; step += 1) {
    const index = (fromIndex + direction * step + QUESTIONS.length) % QUESTIONS.length;
    if (!state.completedQuestionIds.has(QUESTIONS[index].id)) return index;
  }
  return fallback;
}

function updateQuestionNav() {
  if (!questionPrevButton || !questionNextButton) return;
  const canUse = canNavigateQuestions();
  questionPrevButton.disabled = !canUse || state.questionIndex <= 0;
  questionNextButton.disabled = !canUse;
  questionNextButton.textContent = state.questionIndex >= QUESTIONS.length - 1 ? "Reward" : "Next";
}

function lockFoodTray(locked) {
  [...foodTray.children].forEach((foodEl) => {
    if (!foodEl.classList.contains("is-fed")) {
      foodEl.classList.toggle("is-locked", locked);
    }
  });
}

function showCelebration() {
  if (state.screen !== "playing") return;
  celebrationPanel.hidden = false;
  starRow.replaceChildren();
  for (let i = 0; i < QUESTIONS.length; i += 1) {
    const star = document.createElement("span");
    star.className = "star filled";
    starRow.append(star);
  }
}

function showFinalRewardVideo() {
  stopSpokenAudio();
  removeFlyingFood();
  clearFireParticles(gameScene);
  gameScene.dragonMood = "idle";
  gameScene.motion = null;
  gameScene.completedAt = 0;
  gameScene.fireBreathing = false;
  dragonPuppet?.classList.remove("is-fire-breathing", "is-funky-dancing");
  showRewardVideo(FINAL_REWARD_VIDEO.src, FINAL_REWARD_VIDEO.posterSrc, { kind: "final" });
}

function showRewardVideo(src, posterSrc, options = {}) {
  if (state.screen !== "playing" || state.rewardCompleting) return;
  if (!src || !rewardVideo || !rewardVideoPanel) {
    if (options.kind === "final") {
      resetAfterTaskCompleted();
    } else {
      completeFood();
    }
    return;
  }

  state.rewardVideoActive = true;
  state.locked = true;
  state.rewardVideoDirectOpen = false;
  state.rewardVideoKind = options.kind ?? "card";
  state.rewardVideoIndex = clampRewardVideoIndex(options.index ?? state.questionIndex);
  clearFinalRewardReturnTimer();
  setRewardVideoSkippable(false);
  lockFoodTray(true);
  videoPlayButton.hidden = true;
  videoPlayButton.textContent = "Play video";
  rewardVideoPanel.hidden = false;
  rewardVideoPanel.classList.toggle("is-final-reward", state.rewardVideoKind === "final");
  rewardVideoCard?.classList.remove("is-playing");
  rewardVideoCard?.classList.toggle("is-final-reward", state.rewardVideoKind === "final");
  updateRewardVideoNav();
  clearRewardVideoSkipTimer();
  rewardVideoSkipTimer = window.setTimeout(() => {
    if (state.rewardVideoActive) setRewardVideoSkippable(true);
  }, 2000);
  loadRewardVideoSource(src, posterSrc);
}

function showMunchReaction(onComplete) {
  if (state.screen !== "playing" || !munchVideo || !munchVideoPanel) {
    onComplete?.();
    return;
  }

  state.munchReactionActive = true;
  state.locked = true;
  pendingMunchComplete = onComplete;
  lockFoodTray(true);
  updateQuestionNav();
  clearMunchReactionTimers();
  renderMunchTrayOverlay();

  munchVideoPanel.hidden = false;
  munchVideoPanel.classList.remove("is-playing");
  munchVideoPoster.src = MUNCH_REACTION_VIDEO.posterSrc;
  munchVideoPoster.hidden = false;

  munchVideo.pause();
  munchVideo.muted = true;
  munchVideo.playsInline = true;
  munchVideo.controls = false;
  munchVideo.disablePictureInPicture = true;
  munchVideo.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback");
  munchVideo.setAttribute("playsinline", "");
  munchVideo.setAttribute("webkit-playsinline", "");
  munchVideo.removeAttribute("controls");
  munchVideo.poster = MUNCH_REACTION_VIDEO.posterSrc;
  munchVideo.src = MUNCH_REACTION_VIDEO.src;
  munchVideo.currentTime = 0;
  munchVideo.load();

  munchReactionWatchdog = window.setTimeout(finishMunchReaction, 5200);
  const played = munchVideo.play();
  if (played && typeof played.catch === "function") {
    played.catch(() => {
      munchReactionTimer = window.setTimeout(finishMunchReaction, 1100);
    });
  }
}

function finishMunchReaction() {
  if (!state.munchReactionActive) return;
  const onComplete = pendingMunchComplete;
  resetMunchReaction();
  onComplete?.();
}

function resetMunchReaction() {
  state.munchReactionActive = false;
  pendingMunchComplete = null;
  clearMunchReactionTimers();
  if (munchVideo) {
    munchVideo.pause();
    munchVideo.removeAttribute("src");
    munchVideo.removeAttribute("poster");
    munchVideo.removeAttribute("controls");
    munchVideo.load();
  }
  if (munchVideoPoster) {
    munchVideoPoster.removeAttribute("src");
    munchVideoPoster.hidden = true;
  }
  if (munchVideoPanel) {
    munchVideoPanel.hidden = true;
    munchVideoPanel.classList.remove("is-playing");
  }
}

function setMunchPosterVisible(visible) {
  munchVideoPanel?.classList.toggle("is-playing", !visible);
  if (munchVideoPoster) {
    munchVideoPoster.hidden = !visible && !munchVideoPoster.src;
  }
}

function loadRewardVideoSource(src, posterSrc) {
  if (!rewardVideo) return;
  rewardVideo.pause();
  rewardVideo.muted = true;
  rewardVideo.playsInline = true;
  rewardVideo.controls = false;
  rewardVideo.disablePictureInPicture = true;
  rewardVideo.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback");
  rewardVideo.setAttribute("playsinline", "");
  rewardVideo.setAttribute("webkit-playsinline", "");
  rewardVideo.removeAttribute("controls");
  rewardVideo.preload = "auto";
  if (posterSrc) {
    rewardVideo.poster = posterSrc;
    rewardVideoPoster.src = posterSrc;
    rewardVideoPoster.hidden = false;
  } else {
    rewardVideo.removeAttribute("poster");
    rewardVideoPoster.removeAttribute("src");
    rewardVideoPoster.hidden = true;
  }
  setRewardPosterVisible(true);
  rewardVideo.src = src;
  rewardVideo.currentTime = 0;
  rewardVideo.load();
  clearRewardVideoWatchdog();
  rewardVideoWatchdog = window.setTimeout(() => {
    if (state.rewardVideoActive && rewardVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      videoPlayButton.hidden = false;
    }
  }, 1200);
  void attemptRewardVideoPlay();
}

function handleRewardVideoEnded() {
  if (!state.rewardVideoActive) return;
  if (state.rewardVideoKind === "final") {
    clearRewardVideoWatchdog();
    clearRewardVideoSkipTimer();
    state.rewardVideoSkippable = false;
    if (videoCloseButton) videoCloseButton.hidden = true;
    if (videoPrevButton) videoPrevButton.hidden = true;
    if (videoNextButton) videoNextButton.hidden = true;
    rewardVideoCard?.classList.remove("is-skip-locked");
    finalRewardReturnTimer = window.setTimeout(() => {
      if (state.rewardVideoActive && state.rewardVideoKind === "final") {
        completeRewardVideo();
      }
    }, 2000);
    return;
  }
  completeRewardVideo();
}

function getRewardVideoForIndex(index) {
  const question = QUESTIONS[clampRewardVideoIndex(index)];
  return {
    src: question.videoSrc,
    posterSrc: question.videoPosterSrc
  };
}

function getMaxRewardVideoIndex() {
  if (state.rewardVideoKind !== "card") return 0;
  return Math.min(QUESTIONS.length - 1, Math.max(0, state.stars));
}

function clampRewardVideoIndex(index) {
  return Math.min(QUESTIONS.length - 1, Math.max(0, index));
}

function changeRewardVideo(direction) {
  if (!state.rewardVideoActive || !state.rewardVideoSkippable || state.rewardVideoKind !== "card") return;
  const maxIndex = getMaxRewardVideoIndex();
  const nextIndex = Math.min(maxIndex, Math.max(0, state.rewardVideoIndex + direction));
  if (nextIndex === state.rewardVideoIndex) return;
  const nextVideo = getRewardVideoForIndex(nextIndex);
  state.rewardVideoIndex = nextIndex;
  setRewardVideoSkippable(false);
  updateRewardVideoNav();
  loadRewardVideoSource(nextVideo.src, nextVideo.posterSrc);
}

function advanceRewardVideo() {
  if (!state.rewardVideoActive || !state.rewardVideoSkippable) return;
  const maxIndex = getMaxRewardVideoIndex();
  if (state.rewardVideoKind === "card" && state.rewardVideoIndex < maxIndex) {
    changeRewardVideo(1);
    return;
  }
  completeRewardVideo();
}

function updateRewardVideoNav() {
  if (!videoPrevButton || !videoNextButton) return;
  const isCardVideo = state.rewardVideoKind === "card";
  const canUseControls = state.rewardVideoActive && state.rewardVideoSkippable;
  const maxIndex = getMaxRewardVideoIndex();
  videoPrevButton.hidden = !state.rewardVideoActive || !isCardVideo;
  videoNextButton.hidden = !state.rewardVideoActive || !isCardVideo;
  videoPrevButton.disabled = !canUseControls || !isCardVideo || state.rewardVideoIndex <= 0;
  videoNextButton.disabled = !canUseControls;
  videoNextButton.textContent = isCardVideo && state.rewardVideoIndex < maxIndex ? "Next Video" : "Next";
}

async function attemptRewardVideoPlay() {
  if (!state.rewardVideoActive || !rewardVideo) return;
  const played = rewardVideo.play();
  if (played && typeof played.catch === "function") {
    played.catch(() => {
      videoPlayButton.hidden = false;
      showRewardVideoFallback();
    });
  }
}

function showRewardVideoFallback() {
  if (!state.rewardVideoActive) return;
  state.rewardVideoDirectOpen = false;
  videoPlayButton.textContent = "Play video";
  videoPlayButton.hidden = false;
  setRewardPosterVisible(true);
}

function clearRewardVideoWatchdog() {
  if (rewardVideoWatchdog) {
    window.clearTimeout(rewardVideoWatchdog);
    rewardVideoWatchdog = 0;
  }
}

function clearRewardVideoSkipTimer() {
  if (rewardVideoSkipTimer) {
    window.clearTimeout(rewardVideoSkipTimer);
    rewardVideoSkipTimer = 0;
  }
}

function setRewardPosterVisible(visible) {
  rewardVideoCard?.classList.toggle("is-playing", !visible);
  if (rewardVideoPoster) {
    rewardVideoPoster.hidden = !visible && !rewardVideoPoster.src;
  }
}

function setRewardVideoSkippable(skippable) {
  state.rewardVideoSkippable = skippable;
  if (videoCloseButton) videoCloseButton.hidden = state.rewardVideoKind === "final" || !skippable;
  if (videoContinueButton) videoContinueButton.hidden = true;
  rewardVideoCard?.classList.toggle("is-skip-locked", !skippable);
  updateRewardVideoNav();
}

function completeRewardVideo() {
  if (state.rewardCompleting) return;
  state.rewardCompleting = true;
  const rewardVideoKind = state.rewardVideoKind;
  clearFinalRewardReturnTimer();
  resetRewardVideo();
  if (state.screen === "playing") {
    if (rewardVideoKind === "final") {
      resetAfterTaskCompleted();
    } else {
      showMunchReaction(() => {
        completeFood();
      });
    }
  }
  state.rewardCompleting = false;
}

function resetRewardVideo() {
  state.rewardVideoActive = false;
  state.rewardVideoDirectOpen = false;
  state.rewardVideoKind = "card";
  state.rewardVideoIndex = 0;
  setRewardVideoSkippable(false);
  clearRewardVideoWatchdog();
  clearRewardVideoSkipTimer();
  clearFinalRewardReturnTimer();
  if (rewardVideo) {
    rewardVideo.pause();
    rewardVideo.removeAttribute("src");
    rewardVideo.removeAttribute("poster");
    rewardVideo.controls = false;
    rewardVideo.removeAttribute("controls");
    rewardVideo.load();
  }
  if (rewardVideoPanel) {
    rewardVideoPanel.hidden = true;
    rewardVideoPanel.classList.remove("is-final-reward");
  }
  rewardVideoCard?.classList.remove("is-playing", "is-final-reward");
  if (videoPrevButton) videoPrevButton.hidden = true;
  if (videoNextButton) videoNextButton.hidden = true;
  if (videoPlayButton) {
    videoPlayButton.hidden = true;
    videoPlayButton.textContent = "Play video";
  }
  if (rewardVideoPoster) {
    rewardVideoPoster.removeAttribute("src");
    rewardVideoPoster.hidden = true;
  }
}

function clearTimers() {
  clearRepeatTimer();
  clearRewardVideoSkipTimer();
  clearFinalRewardReturnTimer();
  clearMunchReactionTimers();
  if (fireBreathTimer) {
    window.clearTimeout(fireBreathTimer);
    fireBreathTimer = 0;
  }
}

function clearMunchReactionTimers() {
  if (munchReactionTimer) {
    window.clearTimeout(munchReactionTimer);
    munchReactionTimer = 0;
  }
  if (munchReactionWatchdog) {
    window.clearTimeout(munchReactionWatchdog);
    munchReactionWatchdog = 0;
  }
}

function clearFinalRewardReturnTimer() {
  if (finalRewardReturnTimer) {
    window.clearTimeout(finalRewardReturnTimer);
    finalRewardReturnTimer = 0;
  }
}

function clearRepeatTimer() {
  if (state.promptRepeatTimer) {
    window.clearTimeout(state.promptRepeatTimer);
    state.promptRepeatTimer = 0;
  }
}

async function unlockAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
  } catch {
    audioContext = null;
  }
}

async function playAudioOrSpeak(src, text, delayMs = 0) {
  if (delayMs) await wait(delayMs);
  stopSpokenAudio();
  duckBackgroundMusic(true);
  try {
    try {
      return await withTimeout(playBufferedAudio(src), 5200);
    } catch {
      // Fall through to HTMLAudio if Web Audio decoding fails.
    }
    const audio = new Audio(src);
    activeAudio = audio;
    try {
      await withTimeout(new Promise((resolve, reject) => {
        audio.addEventListener("ended", resolve, { once: true });
        audio.addEventListener("error", reject, { once: true });
        const played = audio.play();
        if (played && typeof played.catch === "function") {
          played.catch(reject);
        }
      }), 5200);
      return "played";
    } catch {
      audio.pause();
      if (activeAudio === audio) activeAudio = null;
      return "silent";
    }
  } finally {
    duckBackgroundMusic(false);
  }
}

async function playBufferedAudio(src, volume = 1, rate = 1) {
  await unlockAudio();
  if (!audioContext) throw new Error("AudioContext unavailable");
  const buffer = await withTimeout(getSpokenAudioBuffer(src), 2400);
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(rate, audioContext.currentTime);
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  source.connect(gain);
  gain.connect(audioContext.destination);
  activeBufferSource = source;
  return new Promise((resolve, reject) => {
    let finished = false;
    let watchdog = 0;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (watchdog) window.clearTimeout(watchdog);
      if (activeBufferSource === source) activeBufferSource = null;
      try {
        source.disconnect();
        gain.disconnect();
      } catch {
        // The source may already be disconnected.
      }
      resolve("played");
    };
    source.onended = finish;
    try {
      watchdog = window.setTimeout(() => {
        try {
          source.stop();
        } catch {
          // The source may already have stopped or may not be running.
        }
        finish();
      }, Math.max(400, (buffer.duration / rate) * 1000 + 450));
      source.start();
    } catch (error) {
      if (watchdog) window.clearTimeout(watchdog);
      if (activeBufferSource === source) activeBufferSource = null;
      reject(error);
    }
  });
}

async function getSpokenAudioBuffer(src) {
  if (!spokenAudioBufferCache.has(src)) {
    spokenAudioBufferCache.set(src, fetch(src, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${src}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => decodeAudioBuffer(arrayBuffer)));
  }
  return spokenAudioBufferCache.get(src);
}

function decodeAudioBuffer(arrayBuffer) {
  return new Promise((resolve, reject) => {
    if (!audioContext) {
      reject(new Error("AudioContext unavailable"));
      return;
    }
    const decoded = audioContext.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
    if (decoded && typeof decoded.then === "function") {
      decoded.then(resolve, reject);
    }
  });
}

function stopSpokenAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (activeBufferSource) {
    try {
      activeBufferSource.stop();
    } catch {
      // The source may already have ended.
    }
    activeBufferSource = null;
  }
}

function playSuccessTone() {
  playTone([880, 1174.66], 0.095, "sine", 0.045);
}

function playTryAgainTone() {
  playBuzzerTone();
}

function playTone(notes, length, type, gainValue) {
  if (!audioContext) return;
  notes.forEach((frequency, index) => {
    const start = audioContext.currentTime + index * length;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(gainValue, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + length);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + length + 0.02);
  });
}

function playBuzzerTone() {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(168, now);
  oscillator.frequency.exponentialRampToValueAtTime(112, now + 0.24);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(720, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.038, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.27);
}

function startDragonAmbience() {
  if (dragonAmbience) return;
  const ambience = getDragonAudio(DRAGON_SOUND_PATHS.ambience);
  if (!ambience) return;
  ambience.loop = true;
  ambience.volume = 0.16;
  ambience.currentTime = 0;
  dragonAmbience = ambience;
  void ambience.play().catch(() => {
    dragonAmbience = null;
  });
}

function stopDragonAmbience() {
  if (dragonAmbience) {
    dragonAmbience.pause();
    dragonAmbience.currentTime = 0;
  }
  dragonAmbience = null;
}

async function startBackgroundMusic() {
  await unlockAudio();
  if (backgroundMusic || backgroundBufferMusic) return;
  try {
    await startBufferedBackgroundMusic();
    return;
  } catch {
    // Fall back to HTMLAudio if Web Audio cannot decode the licensed music file.
  }
  const music = new Audio(DRAGON_AUDIO_PATHS.backgroundMusic);
  music.loop = true;
  music.volume = backgroundMusicDucked ? BACKGROUND_MUSIC_DUCKED_VOLUME : BACKGROUND_MUSIC_VOLUME;
  music.preload = "auto";
  backgroundMusic = music;
  const played = music.play();
  if (played && typeof played.catch === "function") {
    played.catch(() => {
      backgroundMusic = null;
    });
  }
}

async function startBufferedBackgroundMusic() {
  if (!audioContext) throw new Error("AudioContext unavailable");
  const buffer = await getSfxBuffer(DRAGON_AUDIO_PATHS.backgroundMusic);
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  source.loop = true;
  gain.gain.setValueAtTime(
    backgroundMusicDucked ? BACKGROUND_MUSIC_DUCKED_VOLUME : BACKGROUND_MUSIC_VOLUME,
    audioContext.currentTime
  );
  source.connect(gain);
  gain.connect(audioContext.destination);
  source.start();
  backgroundBufferMusic = { source, gain };
}

function duckBackgroundMusic(ducked) {
  backgroundMusicDucked = ducked;
  const volume = ducked ? BACKGROUND_MUSIC_DUCKED_VOLUME : BACKGROUND_MUSIC_VOLUME;
  if (backgroundMusic) {
    backgroundMusic.volume = volume;
  }
  if (backgroundBufferMusic?.gain && audioContext) {
    backgroundBufferMusic.gain.gain.cancelScheduledValues(audioContext.currentTime);
    backgroundBufferMusic.gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.16);
  }
}

function playDragonWakeSound() {
}

function playDragonWingFlutter() {
}

function playDragonChomp() {
  playSfx("dragonCrunch", { volume: 0.58, rate: 1.02 }, () => {
    playSfx("eat", { volume: 0.56, rate: 1.02 });
  });
  window.setTimeout(() => playSoftMunchPulse(0.08), 60);
  window.setTimeout(() => playSoftMunchPulse(0.06), 180);
}

function playDragonPuff() {
}

function playCorrectSparkleSound() {
}

function playDragonCelebrateSound() {
  playDragonSample(DRAGON_SOUND_PATHS.correct, 0.32);
}

function preloadDragonSamples() {
  getSfxAudio("eat");
  getSfxAudio("dragonCrunch");
  getSfxAudio("fireBreath");
}

function playSfx(name, options = {}, fallback = null) {
  const src = SFX_PATHS[name];
  if (!src) {
    fallback?.();
    return false;
  }
  void playBufferedSfx(src, options).catch(() => playHtmlSfx(name, options, fallback));
  return true;
}

async function playBufferedSfx(src, options = {}) {
  await unlockAudio();
  if (!audioContext) throw new Error("AudioContext unavailable");
  const buffer = await getSfxBuffer(src);
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(options.rate ?? 1, audioContext.currentTime);
  gain.gain.setValueAtTime(options.volume ?? 0.6, audioContext.currentTime);
  source.connect(gain);
  gain.connect(audioContext.destination);
  source.start();
}

function playHtmlSfx(name, options = {}, fallback = null) {
  const base = getSfxAudio(name);
  if (!base) {
    fallback?.();
    return;
  }
  const audio = base.cloneNode();
  audio.volume = options.volume ?? 0.6;
  audio.playbackRate = options.rate ?? 1;
  audio.preservesPitch = false;
  audio.currentTime = 0;
  const played = audio.play();
  if (played && typeof played.catch === "function") {
    played.catch(() => fallback?.());
  }
}

function getSfxAudio(name) {
  const src = SFX_PATHS[name];
  if (!src) return null;
  if (!sfxCache.has(name)) {
    const audio = new Audio(src);
    audio.preload = "auto";
    sfxCache.set(name, audio);
  }
  return sfxCache.get(name);
}

async function getSfxBuffer(src) {
  if (!sfxBufferCache.has(src)) {
    sfxBufferCache.set(src, fetch(src, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${src}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => decodeAudioBuffer(arrayBuffer)));
  }
  return sfxBufferCache.get(src);
}

function pickDragonSound(sounds) {
  return sounds[Math.floor(Math.random() * sounds.length)];
}

function getDragonAudio(src) {
  if (!src) return null;
  if (!dragonSampleCache.has(src)) {
    const audio = new Audio(src);
    audio.preload = "auto";
    dragonSampleCache.set(src, audio);
  }
  return dragonSampleCache.get(src);
}

function playDragonSample(src, volume = 0.6) {
  const base = getDragonAudio(src);
  if (!base) return;
  const audio = base.cloneNode();
  audio.volume = volume;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

function playFireBreathSound(volume = 0.36) {
  playSfx("fireBreath", { volume, rate: 1 }, playFireBreathFallback);
}

function playFireBreathFallback() {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const duration = 0.44;
  const sampleRate = audioContext.sampleRate;
  const frameCount = Math.floor(sampleRate * duration);
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i += 1) {
    const p = i / frameCount;
    const envelope = Math.sin(Math.PI * Math.min(1, p * 1.35)) * (1 - p * 0.72);
    data[i] = (Math.random() * 2 - 1) * envelope * 0.56;
  }
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(420, now);
  filter.frequency.exponentialRampToValueAtTime(880, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.075, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  source.start(now);
  source.stop(now + duration + 0.04);
}

function playSoftMunchPulse(intensity = 1) {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const duration = 0.055;
  const sampleRate = audioContext.sampleRate;
  const frameCount = Math.floor(sampleRate * duration);
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i += 1) {
    const envelope = 1 - i / frameCount;
    data[i] = (Math.random() * 2 - 1) * envelope * 0.46;
  }
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(760, now);
  filter.frequency.exponentialRampToValueAtTime(360, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.055 * intensity, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  source.start(now);
  source.stop(now + duration + 0.02);
}

function withTimeout(promise, timeoutMs) {
  let timeoutId = 0;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error("Timed out")), timeoutMs);
  });
  return Promise.race([
    promise.finally(() => {
      if (timeoutId) window.clearTimeout(timeoutId);
    }),
    timeout
  ]);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function resetBlinkState(target, now = performance.now()) {
  target.blink = {
    nextAt: now + randomBetween(BLINK_TIMING.minDelayMs, BLINK_TIMING.maxDelayMs),
    activeUntil: 0,
    secondStart: 0,
    secondUntil: 0
  };
}

function updateBlinkState(target, time) {
  if (!target.blink) {
    resetBlinkState(target, time);
  }
  const blink = target.blink;
  if (time >= blink.nextAt) {
    const doubleBlink = Math.random() < BLINK_TIMING.doubleChance;
    blink.activeUntil = time + BLINK_TIMING.blinkMs;
    blink.secondStart = doubleBlink ? blink.activeUntil + BLINK_TIMING.doubleGapMs : 0;
    blink.secondUntil = doubleBlink ? blink.secondStart + BLINK_TIMING.blinkMs : 0;
    const afterBlink = doubleBlink ? blink.secondUntil : blink.activeUntil;
    blink.nextAt = afterBlink + randomBetween(BLINK_TIMING.minDelayMs, BLINK_TIMING.maxDelayMs);
  }
  return time < blink.activeUntil || (blink.secondStart > 0 && time >= blink.secondStart && time < blink.secondUntil);
}

function shuffle(values, seed) {
  const result = [...values];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  for (let i = result.length - 1; i > 0; i -= 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const j = hash % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeScene(canvas, options = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const threeScene = new THREE.Scene();
  threeScene.fog = new THREE.Fog(0x79b7c6, 13, 28);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, options.decorative ? 2.25 : 2.45, options.decorative ? 7.4 : 8.5);
  camera.lookAt(0, 1.1, 0);

  const hemi = new THREE.HemisphereLight(0xfff6db, 0x315d71, 3.5);
  threeScene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffd79a, 5.4);
  sun.position.set(5.2, 7.4, 4.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 28;
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  threeScene.add(sun);

  const fill = new THREE.PointLight(0x8ff6ff, 1.7, 14);
  fill.position.set(-4.2, 2.8, 2.5);
  threeScene.add(fill);

  const rim = new THREE.PointLight(0xff8bb8, 1.5, 13);
  rim.position.set(3.2, 2.6, -2.2);
  threeScene.add(rim);

  const materials = createMaterials();
  const dragon = makeDragon(materials);
  dragon.root.position.set(options.decorative ? 0 : -1.6, options.decorative ? -0.22 : 0.06, options.decorative ? 0.35 : 0);
  if (options.decorative) {
    dragon.root.scale.setScalar(1.22);
  }
  threeScene.add(dragon.root);
  const world = makeWorld(materials, options.decorative);
  threeScene.add(world);

  return {
    canvas,
    renderer,
    scene: threeScene,
    camera,
    dragon,
    world,
    materials,
    dragonMood: options.decorative ? "happy" : "idle",
    feedScale: 0,
    displayScale: options.decorative ? 1.22 : 0.5,
    motion: null,
    blink: null,
    completedAt: 0,
    treats: [],
    sparkles: [],
    fireParticles: [],
    fireBreathing: false,
    decorative: Boolean(options.decorative)
  };
}

function createMaterials() {
  return {
    dragon: new THREE.MeshPhysicalMaterial({ color: 0x26d6b4, roughness: 0.38, metalness: 0.02, clearcoat: 0.38, clearcoatRoughness: 0.32 }),
    dragonDark: new THREE.MeshPhysicalMaterial({ color: 0x12947e, roughness: 0.5, clearcoat: 0.18 }),
    belly: new THREE.MeshPhysicalMaterial({ color: 0xffdf82, roughness: 0.36, clearcoat: 0.24 }),
    cheek: new THREE.MeshStandardMaterial({ color: 0xff9bb1, roughness: 0.55 }),
    mouth: new THREE.MeshStandardMaterial({ color: 0x421528, roughness: 0.4 }),
    wing: new THREE.MeshStandardMaterial({ color: 0x6557e7, roughness: 0.55, side: THREE.DoubleSide }),
    horn: new THREE.MeshStandardMaterial({ color: 0xfff1c3, roughness: 0.36 }),
    eye: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.1 }),
    highlight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ground: new THREE.MeshStandardMaterial({ color: 0x4bd88a, roughness: 0.74 }),
    moss: new THREE.MeshStandardMaterial({ color: 0x2ca36e, roughness: 0.82 }),
    hill: new THREE.MeshStandardMaterial({ color: 0x2f9ca2, roughness: 0.88 }),
    cave: new THREE.MeshStandardMaterial({ color: 0x6d5a99, roughness: 0.78 }),
    caveDark: new THREE.MeshStandardMaterial({ color: 0x3b316b, roughness: 0.86 }),
    crystalBlue: new THREE.MeshPhysicalMaterial({ color: 0x6af4ff, roughness: 0.22, transmission: 0.12, clearcoat: 0.7, emissive: 0x155d73, emissiveIntensity: 0.16 }),
    crystalPink: new THREE.MeshPhysicalMaterial({ color: 0xff8fb9, roughness: 0.24, clearcoat: 0.65, emissive: 0x6c173b, emissiveIntensity: 0.12 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x78df73, roughness: 0.7 }),
    flowerCoral: new THREE.MeshStandardMaterial({ color: 0xf36464, roughness: 0.5 }),
    flowerGold: new THREE.MeshStandardMaterial({ color: 0xf4b84a, roughness: 0.5 }),
    flowerViolet: new THREE.MeshStandardMaterial({ color: 0x7161ef, roughness: 0.5 }),
    cloud: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.76 }),
    treatGood: new THREE.MeshStandardMaterial({ color: 0xf4b84a, roughness: 0.3, emissive: 0x7a4b04, emissiveIntensity: 0.08 }),
    sparkle: new THREE.MeshBasicMaterial({ color: 0xffef9d, transparent: true, opacity: 0.95 }),
    fire: new THREE.MeshBasicMaterial({ color: 0xffa43a, transparent: true, opacity: 0.92 }),
    fireGlow: new THREE.MeshBasicMaterial({ color: 0xfff09a, transparent: true, opacity: 0.78 })
  };
}

function makeDragon(mat) {
  const root = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(1, 48, 32), mat.dragon, [0, 0.82, 0], [1.25, 0.82, 0.92]);
  const belly = mesh(new THREE.SphereGeometry(0.62, 32, 20), mat.belly, [0, 0.72, 0.68], [1.1, 0.58, 0.34]);
  root.add(body, belly);

  const neck = mesh(new THREE.CapsuleGeometry(0.28, 0.82, 14, 24), mat.dragon, [0, 1.38, 0.24], [0.88, 1, 0.88]);
  neck.rotation.x = -0.45;
  root.add(neck);

  const head = new THREE.Group();
  head.position.set(0, 1.78, 0.62);
  root.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.58, 44, 28), mat.dragon, [0, 0, 0], [1.05, 0.86, 0.95]);
  const snout = mesh(new THREE.SphereGeometry(0.34, 28, 18), mat.belly, [0, -0.08, 0.47], [1.24, 0.7, 0.72]);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 8, 22, Math.PI), mat.dragonDark);
  smile.position.set(0, -0.18, 0.73);
  smile.rotation.set(Math.PI, 0, 0);
  const mouthOpen = mesh(new THREE.SphereGeometry(0.17, 24, 14), mat.mouth, [0, -0.18, 0.755], [1.25, 0.48, 0.18]);
  mouthOpen.visible = false;
  const mouthAnchor = new THREE.Object3D();
  mouthAnchor.position.set(0, -0.16, 0.86);
  const leftEye = makeEye(mat, -0.22);
  const rightEye = makeEye(mat, 0.22);
  const leftCheek = mesh(new THREE.SphereGeometry(0.08, 18, 12), mat.cheek, [-0.31, -0.12, 0.66], [1, 0.78, 0.36]);
  const rightCheek = mesh(new THREE.SphereGeometry(0.08, 18, 12), mat.cheek, [0.31, -0.12, 0.66], [1, 0.78, 0.36]);
  head.add(
    skull,
    snout,
    smile,
    mouthOpen,
    mouthAnchor,
    leftEye,
    rightEye,
    leftCheek,
    rightCheek,
    makeTeeth(mat),
    makeHorn(mat, -0.24),
    makeHorn(mat, 0.24),
    makeEar(mat, -0.48),
    makeEar(mat, 0.48)
  );

  const leftWing = makeWing(mat, -1);
  const rightWing = makeWing(mat, 1);
  root.add(leftWing, rightWing);
  const leftArm = makeArm(mat, -1);
  const rightArm = makeArm(mat, 1);
  root.add(leftArm, rightArm);

  const tail = new THREE.Group();
  tail.position.set(0, 0.78, -0.72);
  root.add(tail);
  for (let i = 0; i < 5; i += 1) {
    tail.add(mesh(new THREE.SphereGeometry(0.28 - i * 0.035, 24, 16), mat.dragonDark, [0, 0.03 - i * 0.04, -0.24 - i * 0.28], [1.1 - i * 0.08, 0.82, 1.35]));
  }
  const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 5), mat.horn);
  tailTip.position.set(0, -0.14, -1.72);
  tailTip.rotation.x = Math.PI / 2;
  tail.add(tailTip);

  for (let i = 0; i < 6; i += 1) {
    const spine = mesh(new THREE.ConeGeometry(0.08 - i * 0.006, 0.2, 5), mat.dragonDark, [0, 1.5 - i * 0.18, -0.48 - i * 0.16]);
    spine.rotation.x = -0.25;
    root.add(spine);
  }

  const leftFoot = mesh(new THREE.SphereGeometry(0.25, 24, 16), mat.dragonDark, [-0.55, 0.22, 0.58], [1.25, 0.58, 1]);
  const rightFoot = mesh(new THREE.SphereGeometry(0.25, 24, 16), mat.dragonDark, [0.55, 0.22, 0.58], [1.25, 0.58, 1]);
  root.add(leftFoot, rightFoot);

  return { root, body, belly, head, smile, mouthOpen, mouthAnchor, eyes: [leftEye, rightEye], leftWing, rightWing, leftArm, rightArm, leftFoot, rightFoot, tail };
}

function mesh(geometry, material, position, scale = [1, 1, 1]) {
  const result = new THREE.Mesh(geometry, material);
  result.position.set(...position);
  result.scale.set(...scale);
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}

function makeEye(mat, x) {
  const group = new THREE.Group();
  group.position.set(x, 0.12, 0.48);
  const eye = mesh(new THREE.SphereGeometry(0.1, 20, 14), mat.eye, [0, 0, 0], [1, 1.12, 0.52]);
  const pupil = mesh(new THREE.SphereGeometry(0.036, 12, 10), mat.pupil, [0, -0.006, 0.062]);
  const catchlight = mesh(new THREE.SphereGeometry(0.012, 8, 6), mat.highlight, [-0.022, 0.026, 0.087]);
  const lid = mesh(new THREE.SphereGeometry(0.104, 20, 10), mat.dragon, [0, 0.004, 0.069], [1.08, 1.02, 0.54]);
  lid.visible = false;
  group.add(eye, pupil, catchlight, lid);
  group.userData = { eye, pupil, lid };
  return group;
}

function makeTeeth(mat) {
  const group = new THREE.Group();
  [-0.12, 0.12].forEach((x) => {
    const tooth = mesh(new THREE.ConeGeometry(0.035, 0.11, 10), mat.horn, [x, -0.17, 0.77]);
    tooth.rotation.x = Math.PI;
    group.add(tooth);
  });
  return group;
}

function makeArm(mat, side) {
  const arm = new THREE.Group();
  arm.position.set(side * 0.72, 0.82, 0.52);
  const upper = mesh(new THREE.CapsuleGeometry(0.07, 0.34, 8, 14), mat.dragonDark, [side * 0.02, -0.16, 0], [1, 1, 1]);
  upper.rotation.z = side * 0.22;
  const paw = mesh(new THREE.SphereGeometry(0.09, 18, 12), mat.dragonDark, [side * 0.08, -0.38, 0.02], [1.12, 0.82, 1]);
  arm.add(upper, paw);
  return arm;
}

function makeHorn(mat, x) {
  const horn = mesh(new THREE.ConeGeometry(0.095, 0.35, 18), mat.horn, [x, 0.48, -0.02]);
  horn.rotation.set(-0.36, 0, x < 0 ? -0.12 : 0.12);
  return horn;
}

function makeEar(mat, x) {
  const ear = mesh(new THREE.ConeGeometry(0.14, 0.34, 4), mat.dragonDark, [x, 0.24, 0.02]);
  ear.rotation.set(0.22, 0, x < 0 ? 0.74 : -0.74);
  return ear;
}

function makeWing(mat, side) {
  const wing = new THREE.Group();
  wing.position.set(side * 0.88, 1.03, -0.08);
  const bone = mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.02, 10), mat.dragonDark, [side * 0.28, 0.18, -0.08]);
  bone.rotation.set(0.52, 0, side * -0.78);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(side * 0.52, 0.64, side * 1.16, 0.42);
  shape.quadraticCurveTo(side * 0.74, -0.08, side * 0.46, -0.58);
  shape.quadraticCurveTo(side * 0.16, -0.18, 0, 0);
  const sail = mesh(new THREE.ShapeGeometry(shape), mat.wing, [0, 0, 0]);
  sail.rotation.x = -0.2;
  wing.add(sail, bone);
  return wing;
}

function makeWorld(mat, decorative) {
  const group = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.CircleGeometry(decorative ? 10 : 13, 96), mat.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  group.add(ground);

  const caveBack = new THREE.Mesh(new THREE.SphereGeometry(4.6, 48, 24), mat.caveDark);
  caveBack.position.set(0.35, 1.55, -7.15);
  caveBack.scale.set(1.55, 0.74, 0.24);
  caveBack.receiveShadow = true;
  group.add(caveBack);

  for (let i = 0; i < 10; i += 1) {
    const rock = new THREE.Mesh(new THREE.SphereGeometry(0.82 + ((i * 13) % 5) * 0.16, 30, 18), i % 2 ? mat.cave : mat.caveDark);
    const side = i < 5 ? -1 : 1;
    const row = i % 5;
    rock.position.set(side * (2.7 + row * 0.52), 0.52 + row * 0.34, -6.2 + row * 0.04);
    rock.scale.set(1.18, 0.82, 0.55);
    rock.receiveShadow = true;
    rock.castShadow = true;
    group.add(rock);
  }

  for (let i = 0; i < 8; i += 1) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1.65 + ((i * 17) % 9) * 0.13, 28, 14), i % 2 ? mat.hill : mat.moss);
    hill.position.set(-7.7 + i * 2.3, -0.36, -4.85 - ((i * 5) % 6) * 0.22);
    hill.scale.set(1.45, 0.42 + ((i * 7) % 5) * 0.035, 0.88);
    hill.receiveShadow = true;
    group.add(hill);
  }

  for (let i = 0; i < 12; i += 1) {
    const crystal = makeCrystal(i % 3 === 0 ? mat.crystalPink : mat.crystalBlue);
    const side = i % 2 ? -1 : 1;
    crystal.position.set(side * (2.1 + (i % 4) * 1.05), 0.12, -1.55 - Math.floor(i / 4) * 1.1);
    crystal.scale.setScalar(0.58 + ((i * 7) % 5) * 0.08);
    crystal.rotation.y = i * 0.9;
    group.add(crystal);
  }

  if (!decorative) {
    for (let i = 0; i < 30; i += 1) {
      const flowerMat = i % 3 === 0 ? mat.flowerCoral : i % 3 === 1 ? mat.flowerGold : mat.flowerViolet;
      const flower = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.22, 6), mat.dragonDark);
      stem.position.y = 0.11;
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), flowerMat);
      bloom.position.y = 0.25;
      const leaf = mesh(new THREE.SphereGeometry(0.035, 8, 6), mat.leaf, [0.04, 0.15, 0], [1.8, 0.5, 0.7]);
      flower.add(stem, bloom, leaf);
      flower.position.set(-5.7 + (i % 10) * 1.18, 0, -1.1 - Math.floor(i / 10) * 1.18);
      group.add(flower);
    }
  }

  for (let i = 0; i < 4; i += 1) {
    const cloud = makeCloud(mat);
    cloud.position.set(-5.8 + i * 3.9, 4.7 + Math.sin(i) * 0.45, -6.2 - i * 0.25);
    cloud.scale.setScalar(0.82 + ((i * 11) % 5) * 0.07);
    group.add(cloud);
  }
  return group;
}

function makeCrystal(material) {
  const group = new THREE.Group();
  const spike = mesh(new THREE.ConeGeometry(0.22, 0.95, 5), material, [0, 0.5, 0], [0.7, 1, 0.7]);
  const base = mesh(new THREE.ConeGeometry(0.18, 0.55, 5), material, [0.18, 0.3, 0.06], [0.55, 0.8, 0.55]);
  base.rotation.z = -0.22;
  group.add(spike, base);
  return group;
}

function makeCloud(mat) {
  const group = new THREE.Group();
  [
    [-0.5, 0, 0, 0.42],
    [-0.18, 0.12, 0, 0.52],
    [0.2, 0.04, 0, 0.46],
    [0.56, -0.02, 0, 0.34]
  ].forEach(([x, y, z, r]) => {
    group.add(mesh(new THREE.SphereGeometry(r, 20, 12), mat.cloud, [x, y, z]));
  });
  return group;
}

function launchTreat(target) {
  const treat = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), target.materials.treatGood);
  treat.position.set(-0.45, 1.62, 0.96);
  treat.castShadow = true;
  target.scene.add(treat);
  target.treats.push({
    mesh: treat,
    start: treat.position.clone(),
    control: new THREE.Vector3(-0.2, 1.8, 1.2),
    end: new THREE.Vector3(0, 1.56, 0.85),
    birth: performance.now(),
    duration: 620,
    eaten: false
  });
}

function spawnSparkles(target, origin, count = 18) {
  for (let i = 0; i < count; i += 1) {
    const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.035 + ((i * 7) % 5) * 0.006, 8, 6), target.materials.sparkle.clone());
    sparkle.position.copy(origin);
    sparkle.velocity = new THREE.Vector3(Math.sin(i * 1.7) * 0.9, 0.45 + ((i * 11) % 8) * 0.12, Math.cos(i * 1.1) * 0.7);
    sparkle.birth = performance.now();
    sparkle.life = 700 + ((i * 13) % 6) * 90;
    target.scene.add(sparkle);
    target.sparkles.push(sparkle);
  }
}

function spawnFireParticles(target, count = 16) {
  if (!target?.dragon?.mouthAnchor) return;
  target.scene.updateMatrixWorld(true);
  const origin = new THREE.Vector3();
  target.dragon.mouthAnchor.getWorldPosition(origin);
  for (let i = 0; i < count; i += 1) {
    const material = (i % 3 === 0 ? target.materials.fireGlow : target.materials.fire).clone();
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.055 + (i % 4) * 0.012, 10, 8), material);
    particle.position.copy(origin);
    particle.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.42,
      (Math.random() - 0.42) * 0.22,
      1.2 + Math.random() * 0.75
    );
    particle.birth = performance.now();
    particle.life = 360 + Math.random() * 180;
    particle.castShadow = false;
    target.scene.add(particle);
    target.fireParticles.push(particle);
  }
}

function animate(time = 0) {
  const dt = Math.min(0.033, (time - lastFrame) / 1000 || 0.016);
  lastFrame = time;
  if (!gameScreen.hidden) {
    updateScene(gameScene, time, dt);
  }
  if (!startScreen.hidden) {
    updateScene(startScene, time, dt);
  }
  requestAnimationFrame(animate);
}

function updateScene(target, time, dt) {
  const t = time * 0.001;
  const mood = target.dragonMood;
  const finalDanceActive = target.motion?.type === "taskComplete" && time < target.motion.danceUntil;
  const celebrating = mood === "celebrate" || mood === "happy";
  const eating = mood === "eat" || mood === "ready";
  updateMotion(target, time);
  const baseScale = target.decorative ? 1.22 : target.displayScale ?? 0.5;
  const pulse = mood === "celebrate" ? Math.sin(t * (finalDanceActive ? FINAL_DANCE.pulseSpeed : 12)) * (finalDanceActive ? FINAL_DANCE.pulseAmount : 0.025) : 0;
  target.dragon.root.scale.setScalar(baseScale + pulse);
  target.dragon.root.position.y = (target.decorative ? -0.22 : 0.06) + Math.sin(t * 2.2) * 0.035 + (mood === "celebrate" ? Math.sin(t * (finalDanceActive ? FINAL_DANCE.hopSpeed : 24)) * (finalDanceActive ? FINAL_DANCE.hopAmount : 0.025) : 0);
  target.dragon.root.rotation.y = Math.sin(t * (finalDanceActive ? FINAL_DANCE.turnSpeed : 0.65)) * (finalDanceActive ? FINAL_DANCE.turnAmount : 0.08);
  target.dragon.root.rotation.z = target.motion?.wiggleRoll ?? 0;
  target.dragon.head.rotation.x = Math.sin(t * (finalDanceActive ? FINAL_DANCE.headNodSpeed : 2.8)) * (finalDanceActive ? FINAL_DANCE.headNodAmount : 0.04) + (celebrating ? -0.12 : eating ? -0.18 : 0);
  target.dragon.head.rotation.z = Math.sin(t * (finalDanceActive ? FINAL_DANCE.headTiltSpeed : 1.9)) * (finalDanceActive ? FINAL_DANCE.headTiltAmount : 0.035);
  target.dragon.leftWing.rotation.z = -0.16 - Math.sin(t * (finalDanceActive ? FINAL_DANCE.wingSpeed : celebrating ? 9 : 3.4)) * (finalDanceActive ? FINAL_DANCE.wingAmount : 0.18);
  target.dragon.rightWing.rotation.z = 0.16 + Math.sin(t * (finalDanceActive ? FINAL_DANCE.wingSpeed : celebrating ? 9 : 3.4)) * (finalDanceActive ? FINAL_DANCE.wingAmount : 0.18);
  target.dragon.leftWing.rotation.y = -0.14 + Math.sin(t * (finalDanceActive ? FINAL_DANCE.wingYawSpeed : 2.2)) * (finalDanceActive ? FINAL_DANCE.wingYawAmount : 0.08);
  target.dragon.rightWing.rotation.y = 0.14 - Math.sin(t * (finalDanceActive ? FINAL_DANCE.wingYawSpeed : 2.2)) * (finalDanceActive ? FINAL_DANCE.wingYawAmount : 0.08);
  target.dragon.tail.rotation.y = Math.sin(t * 2.1) * 0.18 + (mood === "celebrate" ? Math.sin(t * (finalDanceActive ? FINAL_DANCE.tailSpeed : 13)) * (finalDanceActive ? FINAL_DANCE.tailAmount : 0.14) : 0);
  updateRigPose(target, time, t);
  syncDragonPuppet(target, time, t);

  if (target.completedAt && time - target.completedAt > 1800 && Math.floor((time - target.completedAt) / 250) % 2 === 0) {
    spawnSparkles(target, new THREE.Vector3(0, 2.2, 0.8), 2);
  }

  updateTreats(target, time);
  updateSparkles(target, time, dt);
  updateFireParticles(target, time, dt);
  target.renderer.render(target.scene, target.camera);
}

function syncDragonPuppet(target, time, t) {
  if (target !== gameScene || !dragonPuppet) return;
  const mood = target.dragonMood;
  const motion = target.motion;
  const displayScale = target.displayScale ?? 0.5;
  const puppetScale = 0.9 + Math.max(0, displayScale - 0.5) * 0.5;
  const floatSpeed = (Math.PI * 2) / 2.95;
  const swaySpeed = (Math.PI * 2) / 3.7;
  const idleY = Math.sin(t * 2.2) * 5;
  const readyY = mood === "ready" ? Math.sin(t * 7.5) * 2 : 0;
  const eatY = mood === "eat" ? Math.sin(t * 15) * 2.5 : 0;
  const floatY = Math.sin(t * floatSpeed) * 3;
  const swayX = Math.sin(t * swaySpeed + 0.7) * 2.2;
  const finalDanceActive = motion?.type === "taskComplete" && time < motion.danceUntil;
  const celebrateY = mood === "celebrate"
    ? Math.sin(t * (finalDanceActive ? FINAL_DANCE.hopSpeed : 24)) * (finalDanceActive ? 1.2 : 5)
    : 0;
  const danceX = finalDanceActive ? Math.sin(t * FINAL_DANCE.puppetXSpeed) * FINAL_DANCE.puppetXAmount : 0;
  const danceY = finalDanceActive ? -Math.abs(Math.sin(t * FINAL_DANCE.puppetYSpeed)) * FINAL_DANCE.puppetYAmount : 0;
  const idleRoll = THREE.MathUtils.degToRad(Math.sin(t * 1.12 + 1.1) * 1.2);
  const danceRoll = finalDanceActive ? THREE.MathUtils.degToRad(Math.sin(t * FINAL_DANCE.puppetRollSpeed) * FINAL_DANCE.puppetRollAmountDeg) : 0;
  const roll = (motion?.wiggleRoll ?? 0) + idleRoll + danceRoll;
  const blink = false;
  let frame = "idle-a";
  let scaleX = puppetScale;
  let scaleY = puppetScale;
  if (mood === "ready") {
    frame = "ready";
  } else if (mood === "eat" || mood === "celebrate") {
    frame = mood === "celebrate"
      ? finalDanceActive ? getFinalDanceFrame(time, motion.startedAt) : Math.floor(time / FINAL_DANCE.frameMs) % 2 === 0 ? "celebrate-a" : "celebrate-b"
      : target.motion?.chewOpen ? "ready" : "chew";
  } else if (blink) {
    frame = "blink";
  } else if (mood === "happy") {
    frame = "happy";
  }

  if (motion?.type === "trigger") {
    const elapsed = Math.max(0, time - motion.startedAt);
    if (elapsed < 320) {
      const squash = Math.sin((elapsed / 320) * Math.PI);
      scaleX = puppetScale * (1 + squash * 0.08);
      scaleY = puppetScale * (1 - squash * 0.08);
    }
  } else if (finalDanceActive) {
    const bounce = Math.sin(t * FINAL_DANCE.squashSpeed);
    scaleX = puppetScale * (1 + Math.abs(bounce) * FINAL_DANCE.squashX);
    scaleY = puppetScale * (1 - Math.abs(bounce) * FINAL_DANCE.squashY);
  }

  const spriteState = resolveDragonSpriteState(target, frame, time);
  const sprite = DRAGON_SPRITE_MANIFEST[spriteState] || DRAGON_SPRITE_MANIFEST.idle;
  dragonPuppet.style.setProperty("--puppet-scale", puppetScale.toFixed(3));
  dragonPuppet.style.setProperty("--puppet-scale-x", scaleX.toFixed(3));
  dragonPuppet.style.setProperty("--puppet-scale-y", scaleY.toFixed(3));
  dragonPuppet.style.setProperty("--puppet-x", `${(swayX + danceX).toFixed(1)}px`);
  dragonPuppet.style.setProperty("--puppet-roll", `${THREE.MathUtils.radToDeg(roll).toFixed(2)}deg`);
  dragonPuppet.style.setProperty("--puppet-y", `${(idleY + floatY + readyY + eatY + celebrateY + danceY).toFixed(1)}px`);
  dragonPuppet.classList.remove(...DRAGON_FRAME_CLASSES);
  dragonPuppet.classList.add(`frame-${frame}`);
  dragonPuppet.classList.toggle("is-ready", mood === "ready");
  dragonPuppet.classList.toggle("is-eating", mood === "eat");
  dragonPuppet.classList.toggle("is-celebrating", mood === "celebrate");
  dragonPuppet.classList.toggle("is-blinking", blink);
  dragonPuppet.classList.toggle("is-funky-dancing", finalDanceActive);
  dragonPuppet.classList.toggle("is-fire-breathing", target.fireBreathing);
  dragonPuppet.dataset.spriteState = spriteState;
  dragonPuppet.dataset.spriteSrc = sprite.src;
  dragonPuppet.dataset.spriteFallbackFrame = sprite.fallbackFrame;
}

function getFinalDanceFrame(time, startedAt = time) {
  const frameCount = DRAGON_SPRITE_MANIFEST["funky-dance"].frames;
  const index = Math.floor(Math.max(0, time - startedAt) / FINAL_DANCE.frameMs) % frameCount;
  return `dance-${String(index + 1).padStart(2, "0")}`;
}

function resolveDragonSpriteState(target, frame, time) {
  const motion = target.motion;
  if (motion?.type === "taskComplete" && time < motion.danceUntil) return "funky-dance";
  if (target.fireBreathing) return "fire-breath";
  if (target.dragonMood === "eat" || (motion?.type === "trigger" && time < motion.chewUntil)) return "eat-crunch";
  if (target.dragonMood === "happy") return "happy-bounce";
  if (frame === "blink") return "blink";
  return "idle";
}

function triggerDragonFireBreath(target, durationMs = FEED_TIMING.fireBreathMs) {
  if (!target || target.decorative) return;
  target.fireBreathing = true;
  playFireBreathSound();
  spawnFireParticles(target, 18);
  if (fireBreathTimer) window.clearTimeout(fireBreathTimer);
  fireBreathTimer = window.setTimeout(() => {
    target.fireBreathing = false;
    dragonPuppet?.classList.remove("is-fire-breathing");
    fireBreathTimer = 0;
  }, durationMs);
}

function updateMotion(target, time) {
  if (!target.motion) return;
  const motion = target.motion;
  if (motion.type === "trigger") {
    if (time < motion.chewUntil) {
      const frame = Math.floor((time - motion.startedAt) / FEED_TIMING.chewToggleMs);
      motion.chewOpen = frame % 2 === 0;
      target.dragonMood = "eat";
    } else {
      motion.chewOpen = false;
    }

    if (time >= motion.wiggleAt && time < motion.wiggleUntil) {
      const p = Math.min(1, (time - motion.wiggleAt) / FEED_TIMING.wiggleDurationMs);
      const damp = 1 - easeOutCubic(p);
      motion.wiggleRoll = THREE.MathUtils.degToRad(Math.sin(p * Math.PI * 4) * 3.2 * damp);
    } else if (time >= motion.wiggleUntil) {
      motion.wiggleRoll = 0;
    }

    if (time >= motion.growAt) {
      const p = Math.min(1, (time - motion.growAt) / FEED_TIMING.growDurationMs);
      const eased = easeInOutCubic(p);
      target.displayScale = motion.fromScale + (motion.toScale - motion.fromScale) * eased;
    }

    if (time >= motion.growUntil) {
      target.displayScale = motion.toScale;
      target.motion = null;
      target.fireBreathing = false;
      target.dragonMood = "happy";
    }
  } else if (motion.type === "taskComplete") {
    if (time < motion.danceUntil) {
      target.fireBreathing = true;
      motion.chewOpen = true;
      if (time >= motion.nextFireParticleAt) {
        spawnFireParticles(target, 5);
        motion.nextFireParticleAt = time + FINAL_DANCE.fireParticleMs;
      }
      if (time >= motion.nextFireSoundAt) {
        playFireBreathSound(motion.fireSoundPlayed ? 0.22 : 0.36);
        motion.fireSoundPlayed = true;
        motion.nextFireSoundAt = time + FINAL_DANCE.fireSoundMs;
      }
      const elapsed = (time - motion.startedAt) * 0.001;
      motion.wiggleRoll = THREE.MathUtils.degToRad(
        Math.sin(elapsed * FINAL_DANCE.bodyRollSpeedA) * FINAL_DANCE.bodyRollAmountDegA
        + Math.sin(elapsed * FINAL_DANCE.bodyRollSpeedB) * FINAL_DANCE.bodyRollAmountDegB
      );
    } else if (time < motion.resetUntil) {
      motion.wiggleRoll = 0;
      motion.chewOpen = false;
      target.fireBreathing = false;
      const p = Math.min(1, (time - motion.danceUntil) / FEED_TIMING.resetScaleMs);
      const eased = 1 - Math.pow(1 - p, 3);
      target.displayScale = motion.fromScale + (motion.toScale - motion.fromScale) * eased;
    } else {
      target.displayScale = motion.toScale;
      target.motion = null;
      target.completedAt = 0;
      target.fireBreathing = false;
      resetAfterTaskCompleted();
    }
  }
}

function updateRigPose(target, time, t) {
  const { dragon } = target;
  const mood = target.dragonMood;
  const ready = mood === "ready";
  const eating = mood === "eat";
  const celebrate = mood === "celebrate";
  const happy = mood === "happy";
  const finalDanceActive = target.motion?.type === "taskComplete" && time < target.motion.danceUntil;
  const idleBeat = Math.floor(t / 3) % 2;
  const blink = false;
  const lookX = ready || eating ? 0 : finalDanceActive ? Math.sin(t * FINAL_DANCE.eyeSpeed) * FINAL_DANCE.eyeXAmount : idleBeat ? 0.034 : -0.026;
  const lookY = celebrate ? 0.018 + (finalDanceActive ? Math.sin(t * FINAL_DANCE.eyeYSpeed) * FINAL_DANCE.eyeYAmount : 0) : ready ? -0.018 : Math.sin(t * 1.4) * 0.01;

  dragon.eyes.forEach((eye) => {
    const { pupil, lid } = eye.userData;
    pupil.position.x = lookX;
    pupil.position.y = lookY;
    pupil.visible = !blink && !ready;
    lid.visible = blink || ready;
  });

  const chewing = target.motion?.type === "trigger" || target.motion?.type === "taskComplete";
  const mouthOpen = target.fireBreathing || ready || (eating && (target.motion?.chewOpen ?? true)) || (celebrate && (target.motion?.chewOpen ?? false));
  dragon.mouthOpen.visible = mouthOpen;
  dragon.smile.visible = !mouthOpen;
  dragon.smile.scale.setScalar(celebrate || happy ? 1.16 : eating ? 1.34 : 1);

  const armWave = celebrate ? Math.sin(t * (finalDanceActive ? FINAL_DANCE.armSpeed : 12)) * (finalDanceActive ? FINAL_DANCE.armAmount : 0.42) : 0;
  const idleArm = idleBeat ? 0.16 : -0.08;
  dragon.leftArm.rotation.z = celebrate ? 1.1 + armWave : ready || chewing ? 0.95 : 0.35 + idleArm;
  dragon.rightArm.rotation.z = celebrate ? -1.1 - armWave : ready || chewing ? -0.95 : -0.35 - idleArm;
  dragon.leftArm.rotation.x = ready || chewing ? -0.34 : 0.05;
  dragon.rightArm.rotation.x = ready || chewing ? -0.34 : 0.05;
  if (dragon.leftFoot && dragon.rightFoot) {
    const shuffle = finalDanceActive ? Math.sin(t * FINAL_DANCE.footSpeed) : 0;
    dragon.leftFoot.rotation.z = shuffle * FINAL_DANCE.footAmount;
    dragon.rightFoot.rotation.z = -shuffle * FINAL_DANCE.footAmount;
    dragon.leftFoot.position.y = 0.22 + Math.max(0, shuffle) * FINAL_DANCE.footLift;
    dragon.rightFoot.position.y = 0.22 + Math.max(0, -shuffle) * FINAL_DANCE.footLift;
  }
}

function resetAfterTaskCompleted() {
  if (state.screen !== "playing") return;
  state.questionIndex = 0;
  state.stars = 0;
  state.locked = false;
  state.selectedFood = null;
  state.selectedFlyer = null;
  state.selectedSourceRect = null;
  state.selectedAnswerId = null;
  state.wrongAnswerId = null;
  removeFlyingFood();
  gameScene.feedScale = 0;
  gameScene.displayScale = 0.5;
  gameScene.dragonMood = "idle";
  gameScene.motion = null;
  gameScene.fireBreathing = false;
  clearFireParticles(gameScene);
  dragonPuppet?.classList.remove("is-fire-breathing", "is-funky-dancing");
  celebrationPanel.hidden = true;
  renderFoodTray();
  updateHud();
  lockFoodTray(false);
}

function clearFireParticles(target) {
  for (let i = target.fireParticles.length - 1; i >= 0; i -= 1) {
    const particle = target.fireParticles[i];
    target.scene.remove(particle);
    particle.geometry.dispose();
    particle.material.dispose();
    target.fireParticles.splice(i, 1);
  }
}

function updateTreats(target, time) {
  for (let i = target.treats.length - 1; i >= 0; i -= 1) {
    const item = target.treats[i];
    const p = Math.min(1, (time - item.birth) / item.duration);
    const eased = 1 - Math.pow(1 - p, 3);
    item.mesh.position.copy(quadratic(item.start, item.control, item.end, eased));
    item.mesh.rotation.x += 0.16;
    item.mesh.rotation.y += 0.11;
    item.mesh.scale.setScalar(1 - p * 0.84);
    if (p >= 0.5 && !item.eaten) {
      item.eaten = true;
      spawnSparkles(target, item.end, 22);
    }
    if (p >= 1) {
      target.scene.remove(item.mesh);
      item.mesh.geometry.dispose();
      target.treats.splice(i, 1);
      target.dragonMood = target.feedScale >= QUESTIONS.length ? "celebrate" : "happy";
    }
  }
}

function updateSparkles(target, time, dt) {
  for (let i = target.sparkles.length - 1; i >= 0; i -= 1) {
    const sparkle = target.sparkles[i];
    const age = time - sparkle.birth;
    sparkle.position.addScaledVector(sparkle.velocity, dt);
    sparkle.velocity.y -= 1.8 * dt;
    sparkle.material.opacity = Math.max(0, 1 - age / sparkle.life);
    sparkle.scale.setScalar(1 + age / sparkle.life);
    if (age > sparkle.life) {
      target.scene.remove(sparkle);
      sparkle.geometry.dispose();
      sparkle.material.dispose();
      target.sparkles.splice(i, 1);
    }
  }
}

function updateFireParticles(target, time, dt) {
  for (let i = target.fireParticles.length - 1; i >= 0; i -= 1) {
    const particle = target.fireParticles[i];
    const age = time - particle.birth;
    const p = Math.min(1, age / particle.life);
    particle.position.addScaledVector(particle.velocity, dt);
    particle.velocity.y += 0.12 * dt;
    particle.material.opacity = Math.max(0, 1 - p);
    particle.scale.setScalar(1 + p * 1.4);
    if (p >= 1) {
      target.scene.remove(particle);
      particle.geometry.dispose();
      particle.material.dispose();
      target.fireParticles.splice(i, 1);
    }
  }
}

function quadratic(a, b, c, t) {
  const one = 1 - t;
  return new THREE.Vector3(
    one * one * a.x + 2 * one * t * b.x + t * t * c.x,
    one * one * a.y + 2 * one * t * b.y + t * t * c.y,
    one * one * a.z + 2 * one * t * b.z + t * t * c.z
  );
}

function resizeAll() {
  [gameScene, startScene].forEach((target) => {
    const rect = target.canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width || window.innerWidth);
    const height = Math.max(1, rect.height || window.innerHeight);
    target.camera.aspect = width / height;
    target.camera.position.z = width < 640 ? (target.decorative ? 7.4 : 7.0) : target.decorative ? 7.4 : 8.5;
    target.camera.position.y = width < 640 ? (target.decorative ? 2.25 : 2.2) : target.decorative ? 2.25 : 2.45;
    target.dragon.root.position.x = target.decorative ? 0 : width < 640 ? -1.05 : -1.6;
    target.camera.updateProjectionMatrix();
    target.renderer.setSize(width, height, false);
  });
}
