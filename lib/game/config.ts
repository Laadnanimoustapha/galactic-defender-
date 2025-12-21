export const GameConfig = {
  CANVAS: {
    WIDTH: 1920,
    HEIGHT: 1080, // Logical resolution, will scale
  },
  PLAYER: {
    WIDTH: 40,
    HEIGHT: 40,
    SPEED: 5,
    INITIAL_RATES: {
      SHOOT: 150,
      ROCKET: 1000,
      SMART_ROCKET: 2000,
      LASER: 3000,
      NUKE: 10000,
      HEAL: 5000,
      BOOST: 8000,
      MAGIC: 15000,
      SHIELD: 12000,
    },
    DURATIONS: {
      SHIELD: 5000,
      BOOST: 10000,
      MAGIC: 8000,
    },
    ENERGY_COSTS: {
      ROCKET: 20,
      SMART_ROCKET: 30,
      LASER: 40,
      NUKE: 60,
      SHIELD: 25,
      HEAL: 30,
      BOOST: 35,
      MAGIC: 40,
    },
  },
  ENEMY: {
    BASIC: { WIDTH: 30, HEIGHT: 30, SPEED_MIN: 1, SPEED_MAX: 3, HEALTH: 2, POINTS: 100 },
    FAST: { WIDTH: 30, HEIGHT: 30, SPEED_MIN: 3, SPEED_MAX: 5, HEALTH: 1, POINTS: 150 },
    TANK: { WIDTH: 40, HEIGHT: 40, SPEED_MIN: 0.5, SPEED_MAX: 1.5, HEALTH: 5, POINTS: 200 },
    BOSS: { WIDTH: 80, HEIGHT: 80, SPEED: 1, HEALTH: 50, POINTS: 1000 },
  },
} as const;
