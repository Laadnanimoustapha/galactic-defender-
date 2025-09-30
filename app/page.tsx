"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./game.module.css"

// Enemy class
class Enemy {
  type: string
  isBoss: boolean
  width: number
  height: number
  x: number
  y: number
  speed: number
  health: number
  maxHealth: number
  shootTimer: number
  shootInterval: number
  bullets: Array<{ x: number; y: number; speed: number; width: number; height: number }>

  constructor(canvasWidth: number, type = "basic", isBoss = false) {
    this.type = type
    this.isBoss = isBoss
    this.width = isBoss ? 80 : 30
    this.height = isBoss ? 80 : 30
    this.x = Math.random() * (canvasWidth - this.width)
    this.y = -this.height
    this.speed = isBoss ? 1 : Math.random() * 2 + 1
    this.health = isBoss ? 20 : type === "fast" ? 1 : type === "tank" ? 3 : 2
    this.maxHealth = this.health
    this.shootTimer = 0
    this.shootInterval = isBoss ? 60 : 120
    this.bullets = []
  }

  update() {
    this.y += this.speed

    this.shootTimer++
    if (this.shootTimer >= this.shootInterval) {
      this.shoot()
      this.shootTimer = 0
    }

    this.bullets = this.bullets.filter((bullet) => {
      bullet.y += bullet.speed
      return bullet.y < 10000
    })
  }

  shoot() {
    if (this.isBoss) {
      for (let i = -1; i <= 1; i++) {
        this.bullets.push({
          x: this.x + this.width / 2 + i * 20,
          y: this.y + this.height,
          speed: 3,
          width: 4,
          height: 8,
        })
      }
    } else {
      this.bullets.push({
        x: this.x + this.width / 2,
        y: this.y + this.height,
        speed: 2,
        width: 3,
        height: 6,
      })
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const centerX = this.x + this.width / 2
    const centerY = this.y + this.height / 2

    if (this.isBoss) {
      ctx.fillStyle = "#ff0000"
      ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20)

      ctx.fillStyle = "#cc0000"
      ctx.fillRect(this.x, this.y + 20, 15, this.height - 40)
      ctx.fillRect(this.x + this.width - 15, this.y + 20, 15, this.height - 40)

      ctx.fillStyle = "#ffff00"
      ctx.fillRect(this.x + 25, this.y + 25, this.width - 50, this.height - 50)

      ctx.fillStyle = "#00ffff"
      ctx.fillRect(this.x + 15, this.y, this.width - 30, 8)

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(this.x + 5, this.y + 30, 8, 8)
      ctx.fillRect(this.x + this.width - 13, this.y + 30, 8, 8)
      ctx.fillRect(this.x + this.width / 2 - 4, this.y + this.height - 5, 8, 5)
    } else {
      if (this.type === "fast") {
        ctx.fillStyle = "#ffff00"
        ctx.beginPath()
        ctx.moveTo(centerX, this.y)
        ctx.lineTo(this.x, this.y + this.height)
        ctx.lineTo(this.x + this.width, this.y + this.height)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = "#ff8800"
        ctx.fillRect(this.x + 5, this.y, 4, 8)
        ctx.fillRect(this.x + this.width - 9, this.y, 4, 8)

        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(centerX, this.y + 15, 4, 0, Math.PI * 2)
        ctx.fill()
      } else if (this.type === "tank") {
        ctx.fillStyle = "#00ff00"
        ctx.fillRect(this.x + 3, this.y + 5, this.width - 6, this.height - 10)

        ctx.fillStyle = "#008800"
        ctx.fillRect(this.x, this.y + 8, this.width, 6)
        ctx.fillRect(this.x, this.y + 16, this.width, 6)

        ctx.fillStyle = "#004400"
        ctx.fillRect(this.x + this.width / 2 - 3, this.y + this.height - 8, 6, 8)

        ctx.fillStyle = "#00ffff"
        ctx.fillRect(this.x + 2, this.y, 4, 6)
        ctx.fillRect(this.x + this.width - 6, this.y, 4, 6)
      } else {
        ctx.fillStyle = "#ff8800"
        ctx.fillRect(this.x + 5, this.y + 3, this.width - 10, this.height - 6)

        ctx.fillStyle = "#cc6600"
        ctx.fillRect(this.x, this.y + 10, 8, this.height - 20)
        ctx.fillRect(this.x + this.width - 8, this.y + 10, 8, this.height - 20)

        ctx.fillStyle = "#ffaa00"
        ctx.beginPath()
        ctx.moveTo(centerX, this.y + this.height)
        ctx.lineTo(this.x + 8, this.y + this.height - 8)
        ctx.lineTo(this.x + this.width - 8, this.y + this.height - 8)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = "#0088ff"
        ctx.fillRect(this.x + 8, this.y, this.width - 16, 5)

        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(centerX, this.y + 12, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (this.isBoss) {
      const barWidth = this.width
      const barHeight = 6
      const healthPercent = this.health / this.maxHealth

      ctx.fillStyle = "#ff0000"
      ctx.fillRect(this.x, this.y - 15, barWidth, barHeight)
      ctx.fillStyle = "#00ff00"
      ctx.fillRect(this.x, this.y - 15, barWidth * healthPercent, barHeight)

      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1
      ctx.strokeRect(this.x, this.y - 15, barWidth, barHeight)
    }

    this.bullets.forEach((bullet) => {
      if (this.isBoss) {
        ctx.fillStyle = "#ff0000"
        ctx.fillRect(bullet.x - 1, bullet.y, bullet.width + 2, bullet.height)
        ctx.fillStyle = "#ffff00"
        ctx.fillRect(bullet.x, bullet.y + 1, bullet.width, bullet.height - 2)
      } else {
        ctx.fillStyle = "#ff4444"
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
        ctx.fillStyle = "#ffaaaa"
        ctx.fillRect(bullet.x + 1, bullet.y + 1, bullet.width - 2, bullet.height - 2)
      }
    })
  }
}

export default function GalacticDefender() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"start" | "playing" | "paused" | "gameover">("start")
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(3)
  const [energy, setEnergy] = useState(100)
  const [level, setLevel] = useState(1)
  const [wave, setWave] = useState(1)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [showPowerup, setShowPowerup] = useState(false)
  const [powerupText, setPowerupText] = useState("")
  const [showBossWarning, setShowBossWarning] = useState(false)

  const gameRef = useRef({
    player: { x: 0, y: 0, width: 40, height: 40, speed: 5 },
    bullets: [] as Array<{ x: number; y: number; width: number; height: number; speed: number; damage: number }>,
    rockets: [] as Array<{
      x: number
      y: number
      width: number
      height: number
      speed: number
      damage: number
      type: string
    }>,
    lasers: [] as Array<{
      x: number
      y: number
      width: number
      height: number
      duration: number
      damage: number
      startTime: number
    }>,
    enemies: [] as Enemy[],
    particles: [] as Array<{
      x: number
      y: number
      speedX: number
      speedY: number
      size: number
      color: string
      life: number
    }>,
    hearts: [] as Array<{ x: number; y: number; speedX: number; speedY: number; size: number; life: number }>,
    sparkles: [] as Array<{
      x: number
      y: number
      speedX: number
      speedY: number
      rotation: number
      rotationSpeed: number
      scale: number
      scaleSpeed: number
      alpha: number
      decay: number
    }>,
    stars: [] as Array<{ x: number; y: number; size: number; speed: number }>,
    keys: {} as Record<string, boolean>,
    isShieldActive: false,
    magicActive: false,
    tripleShot: false,
    criticalHitChance: 0.1,
    lastShootTime: 0,
    lastRocketTime: 0,
    lastSmartRocketTime: 0,
    lastLaserTime: 0,
    lastNukeTime: 0,
    lastHealTime: 0,
    lastBoostTime: 0,
    lastMagicTime: 0,
    lastShieldTime: 0,
    animationId: 0,
  })

  const COOLDOWNS = {
    SHOOT: 150,
    ROCKET: 1000,
    SMART_ROCKET: 2000,
    LASER: 3000,
    NUKE: 10000,
    HEAL: 5000,
    BOOST: 8000,
    MAGIC: 15000,
    SHIELD: 12000,
  }

  const DURATIONS = {
    SHIELD: 5000,
    BOOST: 10000,
    MAGIC: 8000,
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    gameRef.current.player.x = canvas.width / 2 - gameRef.current.player.width / 2
    gameRef.current.player.y = canvas.height - gameRef.current.player.height - 50

    // Initialize stars
    for (let i = 0; i < 100; i++) {
      gameRef.current.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
      })
    }

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        gameRef.current.player.x = Math.min(gameRef.current.player.x, canvas.width - gameRef.current.player.width)
        gameRef.current.player.y = Math.min(gameRef.current.player.y, canvas.height - gameRef.current.player.height)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = true

      if (e.key === "Enter" && gameState === "start") {
        startGame()
      }

      if (gameState !== "playing") return

      if (e.key === " ") e.preventDefault()
      if (e.key === "r" || e.key === "R") shootRocket()
      if (e.key === "t" || e.key === "T") shootSmartRocket()
      if (e.key === "q" || e.key === "Q") activateShield()
      if (e.key === "e" || e.key === "E") shootLaser()
      if (e.key === "x" || e.key === "X") shootNuke()
      if (e.key === "h" || e.key === "H") activateHeal()
      if (e.key === "b" || e.key === "B") activateBoost()
      if (e.key === "m" || e.key === "M") activateMagic()
      if (e.key === "p" || e.key === "P") togglePause()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gameState])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setHealth(3)
    setEnergy(100)
    setLevel(1)
    setWave(1)
    setCombo(0)
    setMaxCombo(0)

    gameRef.current.bullets = []
    gameRef.current.rockets = []
    gameRef.current.lasers = []
    gameRef.current.enemies = []
    gameRef.current.particles = []
    gameRef.current.hearts = []
    gameRef.current.sparkles = []
    gameRef.current.isShieldActive = false
    gameRef.current.magicActive = false
    gameRef.current.tripleShot = false

    spawnWave(1)
    gameLoop()
  }

  const spawnWave = (waveNum: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const enemyCount = Math.min(5 + Math.floor(waveNum / 2), 15)

    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => {
        let enemyType = "basic"
        const rand = Math.random()
        if (rand < 0.2) enemyType = "fast"
        else if (rand < 0.4) enemyType = "tank"

        gameRef.current.enemies.push(new Enemy(canvas.width, enemyType))
      }, i * 500)
    }
  }

  const shoot = () => {
    const now = Date.now()
    if (now - gameRef.current.lastShootTime > COOLDOWNS.SHOOT) {
      const bullet = {
        x: gameRef.current.player.x + gameRef.current.player.width / 2 - 2,
        y: gameRef.current.player.y,
        width: 4,
        height: 10,
        speed: 8,
        damage: gameRef.current.magicActive ? 2 : 1,
      }

      gameRef.current.bullets.push(bullet)

      if (gameRef.current.tripleShot) {
        gameRef.current.bullets.push({ ...bullet, x: bullet.x - 15, speed: 7 })
        gameRef.current.bullets.push({ ...bullet, x: bullet.x + 15, speed: 7 })
      }

      gameRef.current.lastShootTime = now
    }
  }

  const shootRocket = () => {
    const now = Date.now()
    if (now - gameRef.current.lastRocketTime > COOLDOWNS.ROCKET && energy >= 20) {
      gameRef.current.rockets.push({
        x: gameRef.current.player.x + gameRef.current.player.width / 2 - 3,
        y: gameRef.current.player.y,
        width: 6,
        height: 15,
        speed: 6,
        damage: 5,
        type: "normal",
      })

      setEnergy((e) => e - 20)
      gameRef.current.lastRocketTime = now
    }
  }

  const shootSmartRocket = () => {
    const now = Date.now()
    if (now - gameRef.current.lastSmartRocketTime > COOLDOWNS.SMART_ROCKET && energy >= 30) {
      gameRef.current.rockets.push({
        x: gameRef.current.player.x + gameRef.current.player.width / 2 - 3,
        y: gameRef.current.player.y,
        width: 6,
        height: 15,
        speed: 4,
        damage: 8,
        type: "smart",
      })

      setEnergy((e) => e - 30)
      gameRef.current.lastSmartRocketTime = now
    }
  }

  const shootLaser = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const now = Date.now()
    if (now - gameRef.current.lastLaserTime > COOLDOWNS.LASER && energy >= 40) {
      gameRef.current.lasers.push({
        x: gameRef.current.player.x + gameRef.current.player.width / 2 - 5,
        y: 0,
        width: 10,
        height: canvas.height,
        duration: 500,
        damage: 15,
        startTime: now,
      })

      setEnergy((e) => e - 40)
      gameRef.current.lastLaserTime = now
    }
  }

  const shootNuke = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const now = Date.now()
    if (now - gameRef.current.lastNukeTime > COOLDOWNS.NUKE && energy >= 60) {
      gameRef.current.enemies.forEach((enemy) => {
        enemy.health -= 10
        for (let i = 0; i < 10; i++) {
          gameRef.current.particles.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            speedX: (Math.random() - 0.5) * 10,
            speedY: (Math.random() - 0.5) * 10,
            size: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 60}, 100%, 50%)`,
            life: 30,
          })
        }
      })

      setEnergy((e) => e - 60)
      gameRef.current.lastNukeTime = now
    }
  }

  const activateShield = () => {
    const now = Date.now()
    if (now - gameRef.current.lastShieldTime > COOLDOWNS.SHIELD && energy >= 25) {
      gameRef.current.isShieldActive = true
      setEnergy((e) => e - 25)
      gameRef.current.lastShieldTime = now

      setTimeout(() => {
        gameRef.current.isShieldActive = false
      }, DURATIONS.SHIELD)
    }
  }

  const activateHeal = () => {
    const now = Date.now()
    if (now - gameRef.current.lastHealTime > COOLDOWNS.HEAL && energy >= 30 && health < 3) {
      setHealth((h) => Math.min(3, h + 1))
      setEnergy((e) => e - 30)
      gameRef.current.lastHealTime = now

      for (let i = 0; i < 5; i++) {
        gameRef.current.hearts.push({
          x: gameRef.current.player.x + gameRef.current.player.width / 2,
          y: gameRef.current.player.y + gameRef.current.player.height / 2,
          speedX: (Math.random() - 0.5) * 4,
          speedY: -Math.random() * 3 - 1,
          size: Math.random() * 10 + 5,
          life: 60,
        })
      }
    }
  }

  const activateBoost = () => {
    const now = Date.now()
    if (now - gameRef.current.lastBoostTime > COOLDOWNS.BOOST && energy >= 35) {
      gameRef.current.player.speed = 8
      setEnergy((e) => e - 35)
      gameRef.current.lastBoostTime = now

      setPowerupText("✨ SPEED BOOST! ✨")
      setShowPowerup(true)

      setTimeout(() => {
        gameRef.current.player.speed = 5
        setShowPowerup(false)
      }, DURATIONS.BOOST)
    }
  }

  const activateMagic = () => {
    const now = Date.now()
    if (now - gameRef.current.lastMagicTime > COOLDOWNS.MAGIC && energy >= 40) {
      gameRef.current.magicActive = true
      gameRef.current.tripleShot = true
      gameRef.current.criticalHitChance = 0.5
      setEnergy((e) => e - 40)
      gameRef.current.lastMagicTime = now

      for (let i = 0; i < 20; i++) {
        gameRef.current.sparkles.push({
          x: gameRef.current.player.x + gameRef.current.player.width / 2,
          y: gameRef.current.player.y + gameRef.current.player.height / 2,
          speedX: Math.cos((i * Math.PI * 2) / 20) * 8,
          speedY: Math.sin((i * Math.PI * 2) / 20) * 8,
          rotation: (i * Math.PI * 2) / 20,
          rotationSpeed: 0.2,
          scale: 1,
          scaleSpeed: 0.05,
          alpha: 1,
          decay: 0.01,
        })
      }

      setPowerupText("🌟 MAGIC MODE! 🌟")
      setShowPowerup(true)

      setTimeout(() => {
        gameRef.current.magicActive = false
        gameRef.current.tripleShot = false
        gameRef.current.criticalHitChance = 0.1
        setShowPowerup(false)
      }, DURATIONS.MAGIC)
    }
  }

  const togglePause = () => {
    setGameState((prev) => (prev === "playing" ? "paused" : "playing"))
  }

  const gameLoop = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    if (gameState !== "playing") {
      gameRef.current.animationId = requestAnimationFrame(gameLoop)
      return
    }

    // Update player
    const player = gameRef.current.player
    const keys = gameRef.current.keys
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
      player.x = Math.max(0, player.x - player.speed)
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
      player.x = Math.min(canvas.width - player.width, player.x + player.speed)
    }
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
      player.y = Math.max(0, player.y - player.speed)
    }
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
      player.y = Math.min(canvas.height - player.height, player.y + player.speed)
    }
    if (keys[" "]) {
      shoot()
    }

    setEnergy((e) => Math.min(100, e + 0.1))

    // Update bullets
    gameRef.current.bullets = gameRef.current.bullets.filter((bullet) => {
      bullet.y -= bullet.speed
      return bullet.y > -bullet.height
    })

    // Update rockets
    gameRef.current.rockets = gameRef.current.rockets.filter((rocket) => {
      if (rocket.type === "smart" && gameRef.current.enemies.length > 0) {
        let closest = gameRef.current.enemies[0]
        let minDist = Math.hypot(rocket.x - closest.x, rocket.y - closest.y)

        gameRef.current.enemies.forEach((enemy) => {
          const dist = Math.hypot(rocket.x - enemy.x, rocket.y - enemy.y)
          if (dist < minDist) {
            closest = enemy
            minDist = dist
          }
        })

        const angle = Math.atan2(closest.y - rocket.y, closest.x - rocket.x)
        rocket.x += Math.cos(angle) * rocket.speed
        rocket.y += Math.sin(angle) * rocket.speed
      } else {
        rocket.y -= rocket.speed
      }

      return rocket.y > -rocket.height && rocket.y < canvas.height
    })

    // Update lasers
    const now = Date.now()
    gameRef.current.lasers = gameRef.current.lasers.filter((laser) => {
      return now - laser.startTime < laser.duration
    })

    // Update hearts
    gameRef.current.hearts = gameRef.current.hearts.filter((heart) => {
      heart.x += heart.speedX
      heart.y += heart.speedY
      heart.life--
      return heart.life > 0
    })

    // Update sparkles
    gameRef.current.sparkles = gameRef.current.sparkles.filter((sparkle) => {
      sparkle.x += sparkle.speedX
      sparkle.y += sparkle.speedY
      sparkle.rotation += sparkle.rotationSpeed
      sparkle.scale += sparkle.scaleSpeed
      sparkle.alpha -= sparkle.decay
      return sparkle.alpha > 0
    })

    // Update enemies
    gameRef.current.enemies = gameRef.current.enemies.filter((enemy) => {
      enemy.update()

      if (enemy.y > canvas.height || enemy.health <= 0) {
        if (enemy.health <= 0) {
          setScore((s) => s + (enemy.isBoss ? 500 : 100))
          setCombo((c) => {
            const newCombo = c + 1
            setMaxCombo((mc) => Math.max(mc, newCombo))
            return newCombo
          })

          for (let i = 0; i < (enemy.isBoss ? 20 : 10); i++) {
            gameRef.current.particles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              speedX: (Math.random() - 0.5) * 8,
              speedY: (Math.random() - 0.5) * 8,
              size: Math.random() * 4 + 1,
              color: enemy.isBoss ? "#ff0000" : "#ffaa00",
              life: 30,
            })
          }
        } else {
          setCombo(0)
        }
        return false
      }

      return true
    })

    // Update particles
    gameRef.current.particles = gameRef.current.particles.filter((particle) => {
      particle.x += particle.speedX
      particle.y += particle.speedY
      particle.speedX *= 0.98
      particle.speedY *= 0.98
      particle.life--
      return particle.life > 0
    })

    // Check collisions
    gameRef.current.bullets.forEach((bullet, bulletIndex) => {
      gameRef.current.enemies.forEach((enemy) => {
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          const isCritical = Math.random() < gameRef.current.criticalHitChance
          const damage = bullet.damage * (isCritical ? 2 : 1)

          enemy.health -= damage
          gameRef.current.bullets.splice(bulletIndex, 1)
        }
      })
    })

    gameRef.current.rockets.forEach((rocket, rocketIndex) => {
      gameRef.current.enemies.forEach((enemy) => {
        if (
          rocket.x < enemy.x + enemy.width &&
          rocket.x + rocket.width > enemy.x &&
          rocket.y < enemy.y + enemy.height &&
          rocket.y + rocket.height > enemy.y
        ) {
          enemy.health -= rocket.damage
          gameRef.current.rockets.splice(rocketIndex, 1)

          for (let i = 0; i < 15; i++) {
            gameRef.current.particles.push({
              x: rocket.x + rocket.width / 2,
              y: rocket.y + rocket.height / 2,
              speedX: (Math.random() - 0.5) * 12,
              speedY: (Math.random() - 0.5) * 12,
              size: Math.random() * 6 + 2,
              color: "#ff4400",
              life: 40,
            })
          }
        }
      })
    })

    gameRef.current.lasers.forEach((laser) => {
      gameRef.current.enemies.forEach((enemy) => {
        if (laser.x < enemy.x + enemy.width && laser.x + laser.width > enemy.x) {
          enemy.health -= laser.damage
        }
      })
    })

    gameRef.current.enemies.forEach((enemy) => {
      enemy.bullets.forEach((bullet, bulletIndex) => {
        if (
          bullet.x < gameRef.current.player.x + gameRef.current.player.width &&
          bullet.x + bullet.width > gameRef.current.player.x &&
          bullet.y < gameRef.current.player.y + gameRef.current.player.height &&
          bullet.y + bullet.height > gameRef.current.player.y
        ) {
          if (!gameRef.current.isShieldActive) {
            setHealth((h) => {
              const newHealth = h - 1
              if (newHealth <= 0) {
                setGameState("gameover")
              }
              return newHealth
            })
            setCombo(0)
          }

          enemy.bullets.splice(bulletIndex, 1)
        }
      })

      if (
        enemy.x < gameRef.current.player.x + gameRef.current.player.width &&
        enemy.x + enemy.width > gameRef.current.player.x &&
        enemy.y < gameRef.current.player.y + gameRef.current.player.height &&
        enemy.y + enemy.height > gameRef.current.player.y
      ) {
        if (!gameRef.current.isShieldActive) {
          setHealth((h) => {
            const newHealth = h - 1
            if (newHealth <= 0) {
              setGameState("gameover")
            }
            return newHealth
          })
          setCombo(0)
        }
      }
    })

    // Spawn new wave
    if (gameRef.current.enemies.length === 0) {
      setWave((w) => {
        const newWave = w + 1
        if (newWave % 5 === 0) {
          setLevel((l) => l + 1)
          gameRef.current.enemies.push(new Enemy(canvas.width, "boss", true))
          setShowBossWarning(true)
          setTimeout(() => setShowBossWarning(false), 3000)
        } else {
          spawnWave(newWave)
        }
        return newWave
      })
    }

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw stars
    ctx.fillStyle = "#ffffff"
    gameRef.current.stars.forEach((star) => {
      star.y += star.speed
      if (star.y > canvas.height) {
        star.y = 0
        star.x = Math.random() * canvas.width
      }

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw player
    const centerX = player.x + player.width / 2
    const centerY = player.y + player.height / 2

    if (gameRef.current.isShieldActive) {
      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, centerY, player.width * 0.8, 0, Math.PI * 2)
      ctx.stroke()

      for (let i = 0; i < 8; i++) {
        const angle = (Date.now() / 1000 + (i * Math.PI) / 4) % (Math.PI * 2)
        const shieldX = centerX + Math.cos(angle) * player.width * 0.8
        const shieldY = centerY + Math.sin(angle) * player.width * 0.8

        ctx.fillStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(Date.now() / 200 + i) * 0.2})`
        ctx.beginPath()
        ctx.arc(shieldX, shieldY, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.fillStyle = "#00ff00"
    ctx.fillRect(player.x + 8, player.y + 5, player.width - 16, player.height - 10)

    ctx.fillStyle = "#00cc00"
    ctx.fillRect(player.x, player.y + 15, 12, player.height - 25)
    ctx.fillRect(player.x + player.width - 12, player.y + 15, 12, player.height - 25)

    ctx.fillStyle = "#008800"
    ctx.fillRect(player.x + 2, player.y + 18, 8, 6)
    ctx.fillRect(player.x + player.width - 10, player.y + 18, 8, 6)

    ctx.fillStyle = "#00ffaa"
    ctx.beginPath()
    ctx.moveTo(centerX, player.y)
    ctx.lineTo(player.x + 12, player.y + 12)
    ctx.lineTo(player.x + player.width - 12, player.y + 12)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(centerX, player.y + 15, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#aaffff"
    ctx.beginPath()
    ctx.arc(centerX, player.y + 15, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#0088ff"
    ctx.fillRect(player.x + 6, player.y + player.height - 8, 6, 8)
    ctx.fillRect(player.x + player.width - 12, player.y + player.height - 8, 6, 8)

    const engineGlow = Math.sin(Date.now() / 100) * 0.3 + 0.7
    ctx.fillStyle = `rgba(0, 200, 255, ${engineGlow})`
    ctx.fillRect(player.x + 7, player.y + player.height - 6, 4, 6)
    ctx.fillRect(player.x + player.width - 11, player.y + player.height - 6, 4, 6)

    ctx.fillStyle = "#ffff00"
    ctx.fillRect(player.x + 4, player.y + 8, 3, 8)
    ctx.fillRect(player.x + player.width - 7, player.y + 8, 3, 8)

    ctx.fillStyle = "#ff8800"
    ctx.fillRect(centerX - 2, player.y + 3, 4, 10)

    // Draw bullets
    gameRef.current.bullets.forEach((bullet) => {
      ctx.fillStyle = "#ffff00"
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(bullet.x + 1, bullet.y + 1, bullet.width - 2, bullet.height - 2)
      ctx.fillStyle = "rgba(255, 255, 0, 0.6)"
      ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 4)

      if (gameRef.current.magicActive) {
        ctx.fillStyle = "rgba(255, 0, 255, 0.8)"
        ctx.fillRect(bullet.x - 1, bullet.y - 1, bullet.width + 2, bullet.height + 2)
      }
    })

    // Draw rockets
    gameRef.current.rockets.forEach((rocket) => {
      if (rocket.type === "smart") {
        ctx.fillStyle = "#ff00ff"
        ctx.fillRect(rocket.x, rocket.y, rocket.width, rocket.height)
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(rocket.x + 1, rocket.y, rocket.width - 2, 3)
        ctx.fillStyle = "#cc00cc"
        ctx.fillRect(rocket.x - 1, rocket.y + 4, 2, 6)
        ctx.fillRect(rocket.x + rocket.width - 1, rocket.y + 4, 2, 6)
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fillRect(rocket.x + 2, rocket.y + 2, rocket.width - 4, 2)
      } else {
        ctx.fillStyle = "#ff0000"
        ctx.fillRect(rocket.x, rocket.y, rocket.width, rocket.height)
        ctx.fillStyle = "#ffaa00"
        ctx.fillRect(rocket.x + 1, rocket.y, rocket.width - 2, 4)
        ctx.fillStyle = "#cc0000"
        ctx.fillRect(rocket.x - 1, rocket.y + 6, 2, 4)
        ctx.fillRect(rocket.x + rocket.width - 1, rocket.y + 6, 2, 4)
      }

      const trailLength = 8
      for (let i = 0; i < trailLength; i++) {
        const alpha = ((trailLength - i) / trailLength) * 0.6
        ctx.fillStyle = rocket.type === "smart" ? `rgba(255, 0, 255, ${alpha})` : `rgba(255, 100, 0, ${alpha})`
        ctx.fillRect(rocket.x + 1, rocket.y + rocket.height + i, rocket.width - 2, 1)
      }
    })

    // Draw lasers
    gameRef.current.lasers.forEach((laser) => {
      const time = Date.now() / 100
      const intensity = Math.sin(time) * 0.3 + 0.7

      ctx.fillStyle = `rgba(0, 255, 255, ${intensity * 0.3})`
      ctx.fillRect(laser.x - 3, laser.y, laser.width + 6, laser.height)

      ctx.fillStyle = `rgba(0, 255, 255, ${intensity * 0.6})`
      ctx.fillRect(laser.x - 1, laser.y, laser.width + 2, laser.height)

      ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`
      ctx.fillRect(laser.x + 2, laser.y, laser.width - 4, laser.height)

      for (let i = 0; i < 5; i++) {
        const crackleX = laser.x + Math.sin(time + i) * 3
        const crackleY = laser.y + (i * laser.height) / 5
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`
        ctx.fillRect(crackleX, crackleY, 2, 10)
      }
    })

    // Draw hearts
    gameRef.current.hearts.forEach((heart) => {
      ctx.fillStyle = `rgba(255, 105, 180, ${heart.life / 60})`
      ctx.font = `${heart.size}px Arial`
      ctx.fillText("💖", heart.x, heart.y)
    })

    // Draw sparkles
    gameRef.current.sparkles.forEach((sparkle) => {
      ctx.save()
      ctx.translate(sparkle.x, sparkle.y)
      ctx.rotate(sparkle.rotation)
      ctx.scale(sparkle.scale, sparkle.scale)
      ctx.fillStyle = `rgba(255, 215, 0, ${sparkle.alpha})`
      ctx.font = "20px Arial"
      ctx.fillText("✨", -10, 10)
      ctx.restore()
    })

    // Draw enemies
    gameRef.current.enemies.forEach((enemy) => enemy.draw(ctx))

    // Draw particles
    gameRef.current.particles.forEach((particle) => {
      const alpha = particle.life / 30

      ctx.fillStyle = particle.color.replace(")", `, ${alpha * 0.3})`).replace("hsl", "hsla")
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size + 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = particle.color.replace(")", `, ${alpha})`).replace("hsl", "hsla")
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2)
      ctx.fill()
    })

    gameRef.current.animationId = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    if (gameState === "playing") {
      gameLoop()
    }
    return () => {
      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId)
      }
    }
  }, [gameState])

  return (
    <div className={styles.gameContainer}>
      {gameState === "start" && (
        <div className={styles.startScreen}>
          <h1>🚀 GALACTIC DEFENDER 🚀</h1>
          <p>
            Defend the galaxy from waves of enemy ships! Destroy enemies, collect powerups, and survive as long as you
            can.
          </p>

          <div className={styles.controlsInfo}>
            <h2>Controls</h2>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Move:</span>
                <span className={styles.key}>W</span>
                <span className={styles.key}>A</span>
                <span className={styles.key}>S</span>
                <span className={styles.key}>D</span>
                <span>or</span>
                <span className={styles.key}>▲</span>
                <span className={styles.key}>◀</span>
                <span className={styles.key}>▼</span>
                <span className={styles.key}>▶</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Shoot:</span>
                <span className={styles.key}>SPACE</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Rocket:</span>
                <span className={styles.key}>R</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Smart Rocket:</span>
                <span className={styles.key}>T</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Shield:</span>
                <span className={styles.key}>Q</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Laser Beam:</span>
                <span className={styles.key}>E</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Nuclear Strike:</span>
                <span className={styles.key}>X</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Heal:</span>
                <span className={styles.key}>H</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Boost:</span>
                <span className={styles.key}>B</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Magic:</span>
                <span className={styles.key}>M</span>
              </div>
            </div>
            <div className={styles.controlRow}>
              <div className={styles.controlItem}>
                <span>Pause:</span>
                <span className={styles.key}>P</span>
              </div>
            </div>
          </div>

          <button className={styles.pressEnter} onClick={startGame}>
            🚀 START GAME 🚀
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className={styles.canvas} />

      {gameState !== "start" && (
        <>
          <div className={styles.hud}>
            <div>
              Score: <span>{score}</span>
            </div>
            <div>
              Health: <span>{"❤️".repeat(Math.max(0, health))}</span>
            </div>
            <div>
              Energy: <span>{Math.floor(energy)}</span>%
            </div>
            <div>
              Wave: <span>{wave}</span>
            </div>
            <div>
              Combo: <span>{combo}</span>
            </div>
          </div>

          <div className={styles.levelDisplay}>
            Level <span>{level}</span>
          </div>

          {showPowerup && <div className={styles.powerupIndicator}>{powerupText}</div>}

          {showBossWarning && <div className={styles.bossWarning}>⚠️ BOSS INCOMING! ⚠️</div>}

          <button className={styles.pauseBtn} onClick={togglePause}>
            {gameState === "paused" ? "▶" : "⏸"}
          </button>
        </>
      )}

      {gameState === "gameover" && (
        <div className={styles.gameOver}>
          <h1>🎮 GAME OVER 🎮</h1>
          <p>
            Final Score: <span>{score}</span>
          </p>
          <p>
            Level Reached: <span>{level}</span>
          </p>
          <p>
            Max Combo: <span>{maxCombo}</span>
          </p>
          <button onClick={() => setGameState("start")}>🔄 PLAY AGAIN 🔄</button>
        </div>
      )}
    </div>
  )
}
