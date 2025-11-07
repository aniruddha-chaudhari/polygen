export interface AttractorPoint {
  x: number
  y: number
  z: number
}

export class AttractorEquations {
  // Lorenz attractor
  static lorenzStep(point: AttractorPoint, a: number, b: number, c: number, dt = 0.01): AttractorPoint {
    const dx = a * (point.y - point.x)
    const dy = point.x * (b - point.z) - point.y
    const dz = point.x * point.y - c * point.z

    return {
      x: point.x + dx * dt,
      y: point.y + dy * dt,
      z: point.z + dz * dt,
    }
  }

  // Aizawa attractor
  static aizawaStep(point: AttractorPoint, a: number, b: number, c: number, dt = 0.01): AttractorPoint {
    const dx = (point.z - b) * point.x - a * point.y
    const dy = a * point.x + (point.z - b) * point.y
    const dz = c + a * point.z - (point.z * point.z * point.z) / 3

    return {
      x: point.x + dx * dt,
      y: point.y + dy * dt,
      z: point.z + dz * dt,
    }
  }

  // De Jong attractor
  static deJongStep(point: AttractorPoint, a: number, b: number, c: number, d: number): AttractorPoint {
    return {
      x: Math.sin(a * point.y) - Math.cos(b * point.x),
      y: Math.sin(c * point.x) - Math.cos(d * point.y),
      z: 0,
    }
  }
}
