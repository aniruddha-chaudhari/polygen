// Strange Attractor equations for generative art
// Implements Lorenz, Aizawa, and De Jong attractors

export interface Point3D {
  x: number
  y: number
  z: number
}

export interface AttractorPoint {
  x: number
  y: number
  z: number
  iteration: number
}

export class StrangeAttractors {
  // Lorenz Attractor
  // dx/dt = σ(y - x)
  // dy/dt = x(ρ - z) - y
  // dz/dt = xy - βz
  static lorenz(x: number, y: number, z: number, sigma: number, rho: number, beta: number): Point3D {
    const dx = sigma * (y - x)
    const dy = x * (rho - z) - y
    const dz = x * y - beta * z

    return { x: dx, y: dy, z: dz }
  }

  // Aizawa Attractor
  // dx/dt = (z - b) * x - d * y
  // dy/dt = d * x + (z - b) * y
  // dz/dt = c + a * z - (z³/3) - (x² + y²) * (1 + e * z) + f * z * x³
  static aizawa(x: number, y: number, z: number, a: number, b: number, c: number, d: number, e: number, f: number): Point3D {
    const dx = (z - b) * x - d * y
    const dy = d * x + (z - b) * y
    const dz = c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x

    return { x: dx, y: dy, z: dz }
  }

  // De Jong Attractor (2D)
  // x' = sin(a * y) - cos(b * x)
  // y' = sin(c * x) - cos(d * y)
  static dejong(x: number, y: number, a: number, b: number, c: number, d: number): { x: number, y: number } {
    const xNew = Math.sin(a * y) - Math.cos(b * x)
    const yNew = Math.sin(c * x) - Math.cos(d * y)

    return { x: xNew, y: yNew }
  }

  // Generate points for an attractor
  static generatePoints(
    type: "lorenz" | "aizawa" | "dejong",
    params: { a: number, b: number, c: number, d: number },
    iterations: number,
    dt: number = 0.01
  ): AttractorPoint[] {
    const points: AttractorPoint[] = []

    // Starting points
    let x = 0.1
    let y = 0
    let z = 0

    // Different starting points for different attractors
    switch (type) {
      case "lorenz":
        x = 1
        y = 1
        z = 1
        break
      case "aizawa":
        x = 0.1
        y = 0
        z = 0
        break
      case "dejong":
        x = 0
        y = 0
        z = 0
        break
    }

    for (let i = 0; i < iterations; i++) {
      switch (type) {
        case "lorenz":
          const lorenzPoint = this.lorenz(x, y, z, params.a, params.b, params.c)
          x += lorenzPoint.x * dt
          y += lorenzPoint.y * dt
          z += lorenzPoint.z * dt
          break
        case "aizawa":
          const aizawaPoint = this.aizawa(x, y, z, params.a, params.b, params.c, params.d, 0.25, 0.1)
          x += aizawaPoint.x * dt
          y += aizawaPoint.y * dt
          z += aizawaPoint.z * dt
          break
        case "dejong":
          const dejongPoint = this.dejong(x, y, params.a, params.b, params.c, params.d)
          x = dejongPoint.x
          y = dejongPoint.y
          z = 0
          break
      }

      // Skip first few iterations to let the attractor settle
      if (i > 100) {
        points.push({
          x,
          y,
          z,
          iteration: i
        })
      }

      // Prevent runaway values
      if (Math.abs(x) > 1000 || Math.abs(y) > 1000 || Math.abs(z) > 1000) {
        break
      }
    }

    return points
  }

  // Get default parameters for each attractor
  static getDefaultParams(type: "lorenz" | "aizawa" | "dejong") {
    switch (type) {
      case "lorenz":
        return { a: 10, b: 28, c: 8/3, d: 0 }
      case "aizawa":
        return { a: 0.95, b: 0.7, c: 0.6, d: 3.5 }
      case "dejong":
        return { a: 1.4, b: -2.3, c: 2.4, d: -2.1 }
      default:
        return { a: 1, b: 1, c: 1, d: 1 }
    }
  }
}
