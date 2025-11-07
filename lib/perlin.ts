// Perlin Noise implementation for generative art
// Based on Ken Perlin's original algorithm with some optimizations

export class PerlinNoise {
  private p: number[] = new Array(512)
  private permutation: number[] = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
    140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
    247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
    57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
    74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
    60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
    65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
    200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186,
    3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82,
    85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183,
    170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167,
    43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178,
    185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
    191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214,
    31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4,
    150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128,
    195, 78, 66, 215, 61, 156, 180
  ]

  constructor() {
    // Extend permutation array to avoid overflow
    for (let i = 0; i < 256; i++) {
      this.p[i] = this.permutation[i]
      this.p[i + 256] = this.permutation[i]
    }
  }

  // Fade function as defined by Ken Perlin
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  // Linear interpolation
  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  // Dot product of gradient vector and distance vector
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 7
    const u = h < 4 ? x : y
    const v = h < 4 ? y : x
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v)
  }

  // 2D Perlin noise function
  public noise(x: number, y: number): number {
    // Determine grid cell coordinates
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255

    // Relative x, y position in grid cell
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)

    // Compute fade curves for x, y
    const u = this.fade(xf)
    const v = this.fade(yf)

    // Hash coordinates of the 4 square corners
    const n00 = this.grad(this.p[this.p[X] + Y], xf, yf)
    const n01 = this.grad(this.p[this.p[X] + Y + 1], xf, yf - 1)
    const n10 = this.grad(this.p[this.p[X + 1] + Y], xf - 1, yf)
    const n11 = this.grad(this.p[this.p[X + 1] + Y + 1], xf - 1, yf - 1)

    // Interpolate
    const x1 = this.lerp(n00, n10, u)
    const x2 = this.lerp(n01, n11, u)
    return this.lerp(x1, x2, v)
  }

  // Generate octave noise (fractional Brownian motion)
  public octaveNoise(x: number, y: number, octaves: number): number {
    let value = 0
    let amplitude = 1
    let frequency = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency) * amplitude
      maxValue += amplitude
      amplitude *= 0.5
      frequency *= 2
    }

    return value / maxValue
  }
}

// Singleton instance for reuse
export const perlinNoise = new PerlinNoise()