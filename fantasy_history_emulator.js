// === Archetypes and Behaviors ===
const ARCHETYPES = [
  'Inventor', 'Warrior', 'Prophet', 'Explorer', 'Reformer', 'Builder', 'Healer',
  'Philosopher', 'Trader', 'Diplomat', 'Tyrant', 'Peacemaker', 'Artist', 'Heretic',
  'Nomad', 'General', 'Sage', 'Visionary', 'Witch', 'Strategist', 'Agronomist',
  'Engineer', 'Matriarch', 'Outcast', 'MerchantPrince', 'Lawmaker', 'Seer',
  'Renegade', 'Storyteller', 'Beastmaster', 'ShadowPriest', 'Envoy'
];

const ArchetypeBehaviors = {
  Inventor: {
    techBoost: 0.15,
    influenceChance: 0.5,
    description: "Tries to introduce a new tool or invention"
  },
  Warrior: {
    aggressionBoost: 0.2,
    warLikelihood: 0.25,
    influenceChance: 0.4,
    description: "Attempts to lead the population into battle"
  },
  Prophet: {
    religionFounding: true,
    stabilityBoost: 0.1,
    influenceChance: 0.6,
    description: "Claims to receive visions and tries to start a religion"
  },
  Explorer: {
    migrationChance: 0.4,
    influenceChance: 0.5,
    description: "Encourages exploration of new lands"
  },
  Healer: {
    healthBoost: 0.2,
    influenceChance: 0.6,
    description: "Improves well-being and medicine"
  },
  // ... Add others as needed
};

// === Global Event Logging ===
const globalEventLog = [];

function logGlobalEvent(description) {
  const event = {
    year: worldClock.getCurrentYear(),
    type,
    description
  };
  globalEventLog.push(event);
  renderGlobalTimeline();
  console.log(`[GLOBAL][Year ${event.year}] ${event.description}`);
}

function renderGlobalTimeline() {
  const list = document.getElementById("globalTimeline");
  if (!list) return;

  // Read filters
  const typeFilter = document.getElementById("filterType")?.value;
  const startYear = parseInt(document.getElementById("startYear")?.value || "-Infinity");
  const endYear = parseInt(document.getElementById("endYear")?.value || "Infinity");

  list.innerHTML = "";

  // Group events by time range (e.g., every 100 years)
  const grouped = {};
  for (const event of globalEventLog) {
    if ((typeFilter && event.type !== typeFilter && typeFilter !== "all") ||
        event.year < startYear || event.year > endYear) continue;

    const groupKey = Math.floor(event.year / 100) * 100;
    if (!grouped[groupKey]) grouped[groupKey] = [];
    grouped[groupKey].push(event);
  }

  for (const range in grouped) {
    const details = document.createElement("details");
    details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = `Years ${range}–${Number(range) + 99}`;
    details.appendChild(summary);

    for (const event of grouped[range]) {
      const li = document.createElement("li");
      li.textContent = `[Year ${event.year}] ${event.description}`;
      details.appendChild(li);
    }

    list.appendChild(details);
  }
}

// === World Cell and World ===
class WorldCell {
  constructor(x, y, {
    isLand = true,
    foodAvailability = 1.0,
    predators = 0,
    biomeType = 'plains'
  } = {}) {
    this.x = x;
    this.y = y;
    this.isLand = isLand;
    this.foodAvailability = foodAvailability;
    this.predators = predators;
    this.biomeType = biomeType;
  }
}

class World {
  constructor(width = 50, height = 50) {
    this.width = width;
    this.height = height;
    this.grid = this._generateWorld();
  }

  _generateWorld() {
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(new WorldCell(x, y, {
          isLand: Math.random() > 0.3,
          foodAvailability: Math.random(),
          predators: Math.floor(Math.random() * 3),
          biomeType: this._randomBiome()
        }));
      }
      grid.push(row);
    }
    return grid;
  }

  _randomBiome() {
    const biomes = ['plains', 'forest', 'desert', 'mountains', 'swamp', 'jungle'];
    return biomes[Math.floor(Math.random() * biomes.length)];
  }

  getCell(x, y) {
    return this.grid[y]?.[x] || null;
  }

  draw(canvasId, populations) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const cellSize = 10;
    canvas.width = this.width * cellSize;
    canvas.height = this.height * cellSize;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y);
        ctx.fillStyle = cell.isLand ? this._biomeColor(cell.biomeType) : '#4a90e2';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Draw population units
    for (const pop of populations) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(
        pop.position.x * cellSize + cellSize / 2,
        pop.position.y * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }

  _biomeColor(biome) {
    const colors = {
      plains: '#a3d977',
      forest: '#228B22',
      desert: '#edc9af',
      mountains: '#888888',
      swamp: '#556b2f',
      jungle: '#2e8b57'
    };
    return colors[biome] || '#cccccc';
  }
}

// === World Clock ===
class WorldClock {
  constructor(startYear = 0) {
    this.currentYear = startYear;
  }

  tick(years = 1) {
    this.currentYear += years;
  }

  getCurrentYear() {
    return this.currentYear;
  }
}

const worldClock = new WorldClock();

// === Population Unit ===
class PopulationUnit {
  constructor(name, x, y, size = 100) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.position = { x, y };
    this.size = size;
    this.ageDistribution = new Array(101).fill(0);
    this.ageDistribution[Math.floor(Math.random() * 101)] = size; // Or distribute more evenly
    this.ageGroups = {
      children: Math.floor(size * 0.2),
      adults: Math.floor(size * 0.6),
      elders: Math.floor(size * 0.2)
    };
    this.health = 1.0;
    this.technology = 0.1;
    this.aggressiveness = Math.random();
    this.influentialIndividuals = [];
    this.history = [];
  }

  addHistory(event) {
    this.history.push({
      year: worldClock.getCurrentYear(),
      description: event
    });
  }

  spawnInfluentialIndividual() {
    const type = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const individual = new InfluentialIndividual(type, this);
    this.influentialIndividuals.push(individual);
    this.addHistory(`${individual.name} the ${type} emerged.`);
    return individual;
  }
}

// === Influential Individual ===
class InfluentialIndividual {
  constructor(type, populationUnit) {
    this.id = crypto.randomUUID();
    this.name = this._generateName();
    this.type = type;
    this.origin = populationUnit.name;
    this.actions = [];
  }

  _generateName() {
    const names = ['Arin', 'Mira', 'Kotan', 'Zila', 'Tharn', 'Elya', 'Droven', 'Saren', 'Lio', 'Yura', 'Chall'];
    return names[Math.floor(Math.random() * names.length)];
  }

  performAction(description, populationUnit) {
    this.actions.push({
      year: worldClock.getCurrentYear(),
      description
    });
    populationUnit.addHistory(`${this.name} the ${this.type} took action: ${description}`);
  }
}

function attemptInfluence(individual, population) {
  const behavior = ArchetypeBehaviors[individual.type];
  if (!behavior) return;

  const chance = behavior.influenceChance || 0.4;
  const success = Math.random() < chance;

  if (success) {
    let appliedEffects = [];

    if (behavior.techBoost) {
      population.technology += behavior.techBoost;
      appliedEffects.push(`tech increased by ${behavior.techBoost}`);
    }
    if (behavior.healthBoost) {
      population.health = Math.min(1, population.health + behavior.healthBoost);
      appliedEffects.push(`health improved`);
    }
    if (behavior.aggressionBoost) {
      population.aggressiveness += behavior.aggressionBoost;
      appliedEffects.push(`aggressiveness changed`);
    }
    if (behavior.migrationChance && Math.random() < behavior.migrationChance) {
      const newX = Math.max(0, Math.min(world.width - 1, population.position.x + (Math.random() > 0.5 ? 1 : -1)));
      const newY = Math.max(0, Math.min(world.height - 1, population.position.y + (Math.random() > 0.5 ? 1 : -1)));
      population.position = { x: newX, y: newY };
      appliedEffects.push(`migration occurred`);
    }
    if (behavior.religionFounding) {
      appliedEffects.push(`founded a new belief system`);
    }
    if (behavior.warLikelihood && Math.random() < behavior.warLikelihood) {
      appliedEffects.push(`sparked conflict`);
    }

    population.addHistory(`${individual.name} the ${individual.type} succeeded in their influence: ${appliedEffects.join(', ')}.`);
  } else {
    population.addHistory(`${individual.name} the ${individual.type} attempted to enact change but failed.`);
  }
}

// === Simulation Engine ===
class Simulation {
  constructor(world, populations) {
    this.world = world;
    this.populations = populations;
    this.ageOfToolsTriggered = false;
  }

  tick() {
    worldClock.tick(1);

    for (const pop of this.populations) {
      const cell = this.world.getCell(pop.position.x, pop.position.y);
      const growthFactor = cell?.foodAvailability || 0.5;
      const growth = Math.floor(pop.size * growthFactor * 0.01);
      pop.size += growth;
      pop.addHistory(`Grew by ${growth} individuals.`);
      updateAgeDistribution(pop);

      if (Math.random() < 0.01) {
        const individual = pop.spawnInfluentialIndividual();
        const desc = ArchetypeBehaviors[individual.type]?.description || 'Took action';
        individual.performAction(desc, pop);
        attemptInfluence(individual, pop);
      }
    }

    this.checkGlobalEvents();    
  }

    checkGlobalEvents() {
    const totalTech = this.populations.reduce((sum, p) => sum + p.technology, 0);
    const avgTech = totalTech / this.populations.length;

    if (!this.ageOfToolsTriggered && avgTech > 0.5) {
      this.ageOfToolsTriggered = true;
      logGlobalEvent("The Age of Tools has begun! Populations across the world adopt advanced crafting.");
      this.populations.forEach(p => p.addHistory("Adopted tools as part of a global shift."));
    }

    if (Math.random() < 0.01) {
      const attacker = this.populations[Math.floor(Math.random() * this.populations.length)];
      const defender = this.populations[Math.floor(Math.random() * this.populations.length)];
      if (attacker !== defender) {
        logGlobalEvent(`${attacker.name} declared war on ${defender.name}!`);
        attacker.addHistory(`Declared war on ${defender.name}.`);
        defender.addHistory(`Was attacked by ${attacker.name}.`);
      }
    }
  }
  
  render(canvasId) {
    this.world.draw(canvasId, this.populations);
  }
}

// === Example Usage ===
const world = new World(50, 50);
const pops = [
  new PopulationUnit('Stonewalkers', 5, 5, 150),
  new PopulationUnit('Skytribe', 10, 10, 200)
];
const sim = new Simulation(world, pops);


// === Age Tracking Helper ===
function updateAgeDistribution(popUnit) {
  const newAges = new Array(101).fill(0);
  for (let i = 1; i <= 100; i++) {
    newAges[i] = popUnit.ageDistribution[i - 1];
  }
  newAges[0] = Math.floor(popUnit.totalPopulation * 0.02); // Assume 2% new births
  popUnit.ageDistribution = newAges;
  popUnit.totalPopulation = newAges.reduce((a, b) => a + b, 0);
  popUnit.ageGroups = {
    children: newAges.slice(0, 15).reduce((a, b) => a + b, 0),
    adults: newAges.slice(15, 65).reduce((a, b) => a + b, 0),
    elders: newAges.slice(65).reduce((a, b) => a + b, 0)
  };
}


// ===================================================
// ===================================================
// ===========         UI Section          ===========
// ===================================================
// ===================================================

let interval = null;

function startSimulation() {
  if (!interval) {
    interval = setInterval(() => {
      sim.tick();
      sim.render('worldCanvas');
      if (selectedPop) {
        updatePopInfo(selectedPop);
        updateTimeline(selectedPop.history);
      }
    }, 500);
  }
}

function stopSimulation() {
  clearInterval(interval);
  interval = null;
}

function stepSimulation() {
  sim.tick();
  sim.render('worldCanvas');
  if (selectedPop) {
    updatePopInfo(selectedPop);
    updateTimeline(selectedPop.history);
  }
}

function clearTimeline() {
  const el = document.getElementById('timeline');
  el.innerHTML = '';
}

document.getElementById('startBtn').addEventListener('click', startSimulation);
document.getElementById('stopBtn').addEventListener('click', stopSimulation);
document.getElementById('stepBtn').addEventListener('click', stepSimulation);
document.getElementById('clearTimelineBtn').addEventListener('click', clearTimeline);

sim.render('worldCanvas');

// === Interactivity and Timeline ===
let selectedPop = null;

document.getElementById('worldCanvas').addEventListener('click', function (e) {
  const rect = this.getBoundingClientRect();
  const cellSize = 10;
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);

  selectedPop = pops.find(p => p.position.x === x && p.position.y === y);

  if (selectedPop) {
    updatePopInfo(selectedPop);
    updateTimeline(selectedPop.history);
  }
});

function updatePopInfo(pop) {
  const el = document.getElementById('popInfo');
  el.innerHTML = `
    <strong>Name:</strong> ${pop.name}<br>
    <strong>Size:</strong> ${pop.size}<br>
    <strong>Health:</strong> ${(pop.health * 100).toFixed(1)}%<br>
    <strong>Technology:</strong> ${pop.technology.toFixed(2)}<br>
    <strong>Aggressiveness:</strong> ${pop.aggressiveness.toFixed(2)}<br>
    <strong>Children:</strong> ${pop.ageGroups.children} |
    <strong>Adults:</strong> ${pop.ageGroups.adults} |
    <strong>Elders:</strong> ${pop.ageGroups.elders}
  `;
}

function updateTimeline(history) {
  const el = document.getElementById('timeline');
  el.innerHTML = history
    .slice(-50)
    .reverse()
    .map(h => `<div>[Year ${h.year}] ${h.description}</div>`)
    .join('');
}
