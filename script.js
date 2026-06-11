const herbs = [
  { id: "moonmint", name: "Moonmint", index: 0, note: "cool and calming", color: "#9fbec7" },
  { id: "starflower", name: "Starflower", index: 1, note: "soft floral glow", color: "#c7b7da" },
  { id: "dreamleaf", name: "Dreamleaf", index: 2, note: "sleepy sweetness", color: "#a997c6" },
  { id: "sunberry", name: "Sunberry", index: 3, note: "bright citrus spark", color: "#e6c88f" },
  { id: "mistbasil", name: "Mist Basil", index: 4, note: "fresh forest lift", color: "#789184" },
  { id: "rosehip", name: "Rosehip", index: 5, note: "warm rosy comfort", color: "#d8a5b3" }
];

const recipes = [
  {
    name: "Silver Sleep Tisane",
    request: "Please make a drink for forgotten dreams.",
    hint: "calm • floral • dreams",
    customer: "Noor Willow",
    mood: "dreamy",
    portrait: 0,
    glass: "Crescent cup",
    glassClass: "crescent",
    combo: ["moonmint", "starflower", "dreamleaf"],
    reward: 14,
    rep: 2
  },
  {
    name: "Dawn Glow Brew",
    request: "I need courage for tomorrow.",
    hint: "bright • cool • brave",
    customer: "Iris Sol",
    mood: "bright",
    portrait: 1,
    glass: "Sunrise flute",
    glassClass: "flute",
    combo: ["sunberry", "moonmint", "starflower"],
    reward: 12,
    rep: 2
  },
  {
    name: "Garden Heart Tea",
    request: "I want something that smells like coming home.",
    hint: "warm • green • tender",
    customer: "Mira Vale",
    mood: "rosy",
    portrait: 2,
    glass: "Rose goblet",
    glassClass: "goblet",
    combo: ["rosehip", "mistbasil", "dreamleaf"],
    reward: 16,
    rep: 3
  },
  {
    name: "Clear Mist Cooler",
    request: "My thoughts keep fogging the windows.",
    hint: "fresh • clear • golden",
    customer: "Sage Quill",
    mood: "misty",
    portrait: 3,
    glass: "Study tumbler",
    glassClass: "tumbler",
    combo: ["mistbasil", "moonmint", "sunberry"],
    reward: 15,
    rep: 3
  },
  {
    name: "Blush Moon Cordial",
    request: "I miss someone, but I do not want to.",
    hint: "rose • light • ache",
    customer: "Elio Bloom",
    mood: "blush",
    portrait: 4,
    glass: "Blush coupe",
    glassClass: "coupe",
    combo: ["rosehip", "starflower", "sunberry"],
    reward: 18,
    rep: 4
  }
];

const upgrades = [
  {
    id: "lanterns",
    name: "Lantern of Quiet",
    text: "warmer light, kinder tips",
    cost: 35,
    apply: state => state.bonusCoins += 3
  },
  {
    id: "book",
    name: "Grandmother's Journal",
    text: "the notebook remembers more",
    cost: 50,
    apply: state => state.bonusRep += 1
  },
  {
    id: "greenhouse",
    name: "Conservatory Glass",
    text: "plants soften failed blends",
    cost: 70,
    apply: state => state.kindMistakes = true
  }
];

const state = {
  coins: 20,
  reputation: 1,
  streak: 0,
  selected: [],
  currentRecipe: 0,
  brewing: false,
  ambienceStarted: false,
  audioContext: null,
  ambienceGain: null,
  bonusCoins: 0,
  bonusRep: 0,
  kindMistakes: false,
  bought: new Set()
};

const elements = {
  coins: document.querySelector("#coins"),
  reputation: document.querySelector("#reputation"),
  streak: document.querySelector("#streak"),
  customerName: document.querySelector("#customerName"),
  requestText: document.querySelector("#requestText"),
  recipeHint: document.querySelector("#recipeHint"),
  glassRequest: document.querySelector("#glassRequest"),
  bookHint: document.querySelector("#bookHint"),
  ingredients: document.querySelector("#ingredients"),
  selectedList: document.querySelector("#selectedList"),
  recipes: document.querySelector("#recipes"),
  recipeCount: document.querySelector("#recipeCount"),
  upgrades: document.querySelector("#upgrades"),
  messageLog: document.querySelector("#messageLog"),
  brewButton: document.querySelector("#brewButton"),
  brewStation: document.querySelector("#brewStation"),
  flyingHerbs: document.querySelector("#flyingHerbs"),
  potionReveal: document.querySelector("#potionReveal"),
  coinBurst: document.querySelector("#coinBurst"),
  clearButton: document.querySelector("#clearButton"),
  cup: document.querySelector("#cup"),
  liquid: document.querySelector("#liquid"),
  customerCard: document.querySelector("#customerCard"),
  customerFigure: document.querySelector("#customerFigure"),
  customerStage: document.querySelector("#customerStage")
};

function render() {
  const recipe = recipes[state.currentRecipe];

  elements.coins.textContent = state.coins;
  elements.reputation.textContent = state.reputation;
  elements.streak.textContent = state.streak;
  elements.customerName.textContent = recipe.customer;
  elements.requestText.textContent = recipe.request;
  elements.recipeHint.textContent = recipe.hint;
  elements.glassRequest.textContent = recipe.glass;
  elements.bookHint.textContent = `${recipe.customer}: ${recipe.hint}. Serve in a ${recipe.glass.toLowerCase()}.`;
  elements.recipeCount.textContent = `${recipes.length} known`;
  elements.customerFigure.dataset.mood = recipe.mood;
  elements.customerFigure.style.setProperty("--portrait-index", recipe.portrait);
  elements.cup.dataset.glass = recipe.glassClass;
  document.body.classList.toggle("has-lanterns", state.bought.has("lanterns"));
  document.body.classList.toggle("has-notes", state.bought.has("book"));
  document.body.classList.toggle("has-greenhouse", state.bought.has("greenhouse"));

  renderIngredients();
  renderSelected();
  renderRecipes();
  renderUpgrades();
  tintCup();
}

function renderIngredients() {
  elements.ingredients.innerHTML = "";

  herbs.forEach(herb => {
    const button = document.createElement("button");
    button.className = `ingredient ${state.selected.includes(herb.id) ? "selected" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", herb.name);
    button.dataset.herb = herb.id;
    button.dataset.aura = herb.id;
    button.innerHTML = `
      <span class="herb-icon" style="--herb:${herb.color}; --icon-index:${herb.index}" aria-hidden="true"></span>
      <span class="herb-copy"><strong>${herb.name}</strong><span>${herb.note}</span></span>
    `;
    button.addEventListener("click", () => chooseHerb(herb.id));
    elements.ingredients.appendChild(button);
  });
}

function renderSelected() {
  elements.selectedList.innerHTML = "";

  if (!state.selected.length) {
    elements.selectedList.innerHTML = `<span class="blend-empty">No herbs selected</span>`;
    return;
  }

  state.selected.forEach(id => {
    const herb = herbs.find(item => item.id === id);
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.style.background = herb.color;
    pill.textContent = herb.name;
    elements.selectedList.appendChild(pill);
  });
}

function renderRecipes() {
  elements.recipes.innerHTML = "";

  recipes.forEach((recipe, index) => {
    const card = document.createElement("div");
    const active = index === state.currentRecipe ? " current" : "";
    card.className = `recipe${active}`;
    const names = recipe.combo.map(id => herbs.find(herb => herb.id === id).name).join(" + ");
    card.innerHTML = `<strong>${recipe.name}</strong><span>${names}</span><em>${recipe.glass}</em>`;
    elements.recipes.appendChild(card);
  });
}

function renderUpgrades() {
  elements.upgrades.innerHTML = "";

  upgrades.forEach(upgrade => {
    const button = document.createElement("button");
    const purchased = state.bought.has(upgrade.id);
    button.className = "upgrade";
    button.type = "button";
    button.disabled = purchased || state.coins < upgrade.cost;
    button.innerHTML = `
      <span><strong>${purchased ? "Purchased: " : ""}${upgrade.name}</strong><span>${upgrade.text}</span></span>
      <span class="cost">${purchased ? "Done" : `${upgrade.cost} mc`}</span>
    `;
    button.addEventListener("click", () => buyUpgrade(upgrade));
    elements.upgrades.appendChild(button);
  });
}

function chooseHerb(id) {
  if (state.brewing) return;
  startAmbience();

  if (state.selected.includes(id)) {
    state.selected = state.selected.filter(item => item !== id);
  } else if (state.selected.length < 3) {
    state.selected.push(id);
  } else {
    writeMessage("The vessel can only hold three memories.");
  }

  render();
}

function brew() {
  if (state.brewing) return;
  startAmbience();

  if (state.selected.length !== 3) {
    writeMessage("Three herbs are needed before the ritual can begin.");
    pulse(elements.customerCard, "mistake");
    return;
  }

  const recipe = recipes[state.currentRecipe];
  const correct = sameSet(state.selected, recipe.combo);
  state.brewing = true;
  elements.brewButton.disabled = true;
  elements.brewButton.textContent = "Brewing...";
  elements.potionReveal.textContent = "";
  startRitual();

  window.setTimeout(() => {
    if (correct) {
    const earned = recipe.reward + state.bonusCoins + state.streak;
    const rep = recipe.rep + state.bonusRep;
    state.coins += earned;
    state.reputation += rep;
    state.streak += 1;
    state.currentRecipe = (state.currentRecipe + 1) % recipes.length;
    state.selected = [];
    elements.potionReveal.textContent = recipe.name;
    writeMessage(`The ${recipe.glass} holds the feeling gently.`);
    playChime([523.25, 659.25, 783.99], 0.045);
    pulse(elements.brewStation, "success");
    pulse(elements.coinBurst, "burst");
    pulse(elements.customerStage, "arrival");
  } else {
    const loss = state.kindMistakes ? 1 : 3;
    state.coins = Math.max(0, state.coins - loss);
    state.streak = 0;
    writeMessage(`The warmth reached the hands, not the heart. ${loss} mooncoin${loss === 1 ? "" : "s"} fade away.`);
    playChime([392, 329.63], 0.028);
    pulse(elements.customerCard, "mistake");
  }

    state.brewing = false;
    elements.brewButton.disabled = false;
    elements.brewButton.textContent = "Brew";
    elements.brewStation.classList.remove("ritual");
    elements.flyingHerbs.innerHTML = "";
  render();
  }, 3100);
}

function startRitual() {
  elements.brewStation.classList.remove("ritual");
  elements.flyingHerbs.innerHTML = "";

  state.selected.forEach((id, index) => {
    const herb = herbs.find(item => item.id === id);
    const mote = document.createElement("span");
    mote.className = "flying-herb";
    mote.style.setProperty("--herb", herb.color);
    mote.style.setProperty("--icon-index", herb.index);
    mote.style.setProperty("--delay", `${index * 160}ms`);
    elements.flyingHerbs.appendChild(mote);
  });

  void elements.brewStation.offsetWidth;
  elements.brewStation.classList.add("ritual");
  writeMessage("The room grows quiet. The herbs begin to rise.");
  playChime([261.63, 392], 0.028);
}

function startAmbience() {
  if (state.ambienceStarted || !window.AudioContext && !window.webkitAudioContext) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const gain = context.createGain();
  gain.gain.value = 0.018;
  gain.connect(context.destination);

  const low = context.createOscillator();
  const lowGain = context.createGain();
  low.type = "sine";
  low.frequency.value = 110;
  lowGain.gain.value = 0.035;
  low.connect(lowGain);
  lowGain.connect(gain);
  low.start();

  const windBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const windData = windBuffer.getChannelData(0);
  for (let i = 0; i < windData.length; i += 1) {
    windData[i] = (Math.random() * 2 - 1) * 0.16;
  }
  const wind = context.createBufferSource();
  const windFilter = context.createBiquadFilter();
  const windGain = context.createGain();
  wind.buffer = windBuffer;
  wind.loop = true;
  windFilter.type = "lowpass";
  windFilter.frequency.value = 520;
  windGain.gain.value = 0.018;
  wind.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(gain);
  wind.start();

  window.setInterval(() => {
    if (document.hidden) return;
    playChime([880 + Math.random() * 120], 0.012);
  }, 9000);

  state.audioContext = context;
  state.ambienceGain = gain;
  state.ambienceStarted = true;
}

function playChime(notes, volume = 0.03) {
  if (!state.audioContext || !state.ambienceGain) return;

  const now = state.audioContext.currentTime;
  notes.forEach((frequency, index) => {
    const osc = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now + index * 0.08);
    gain.gain.linearRampToValueAtTime(volume, now + index * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2);
    osc.connect(gain);
    gain.connect(state.ambienceGain);
    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 1.25);
  });
}

function buyUpgrade(upgrade) {
  if (state.bought.has(upgrade.id) || state.coins < upgrade.cost) return;

  state.coins -= upgrade.cost;
  state.bought.add(upgrade.id);
  upgrade.apply(state);
  writeMessage(`${upgrade.name} finds its place in the room.`);
  playChime([493.88, 587.33, 739.99], 0.032);
  render();
}

function tintCup() {
  if (!state.selected.length) {
    elements.liquid.style.height = "24%";
    elements.liquid.style.background = "linear-gradient(180deg, rgba(143, 241, 196, 0.72), rgba(60, 174, 130, 0.86))";
    return;
  }

  const selectedHerbs = state.selected.map(id => herbs.find(herb => herb.id === id));
  elements.liquid.style.height = `${24 + selectedHerbs.length * 18}%`;
  elements.liquid.style.background = `linear-gradient(180deg, ${selectedHerbs.map(herb => herb.color).join(", ")})`;
}

function sameSet(a, b) {
  return a.length === b.length && a.every(item => b.includes(item));
}

function writeMessage(text) {
  elements.messageLog.textContent = text;
}

function pulse(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

elements.brewButton.addEventListener("click", brew);
elements.clearButton.addEventListener("click", () => {
  if (state.brewing) return;
  startAmbience();
  state.selected = [];
  writeMessage("The tablecloth is brushed clean.");
  render();
});

render();
