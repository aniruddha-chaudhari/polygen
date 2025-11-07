// Web Worker for Flow Field particle tracing
self.onmessage = function(e) {
  const { width, height, params } = e.data;

  // Generate flow field using Perlin noise
  const flowField = generateFlowField(width, height, params.noiseScale);

  // Trace particle paths
  const paths = traceParticles(width, height, flowField, params);

  // Send back the path data
  self.postMessage({ paths });
};

function generateFlowField(width, height, noiseScale) {
  const field = new Array(height);
  for (let y = 0; y < height; y++) {
    field[y] = new Array(width);
    for (let x = 0; x < width; x++) {
      // Sample Perlin noise at different octaves for more interesting flow
      const angle1 = perlinNoise(x * noiseScale, y * noiseScale) * Math.PI * 4;
      const angle2 = perlinNoise(x * noiseScale * 2, y * noiseScale * 2) * Math.PI * 2;
      const angle3 = perlinNoise(x * noiseScale * 4, y * noiseScale * 4) * Math.PI;

      // Combine angles for more complex flow
      const angle = (angle1 + angle2 * 0.5 + angle3 * 0.25) / 1.75;

      field[y][x] = angle;
    }
  }
  return field;
}

function traceParticles(width, height, flowField, params) {
  const paths = [];

  for (let i = 0; i < params.particleCount; i++) {
    const path = [];
    let x, y;

    // Start particles at random positions
    x = Math.random() * width;
    y = Math.random() * height;

    // Also add some particles starting from edges for better coverage
    if (i < params.particleCount * 0.1) {
      // Left edge
      x = 0;
      y = Math.random() * height;
    } else if (i < params.particleCount * 0.2) {
      // Right edge
      x = width - 1;
      y = Math.random() * height;
    } else if (i < params.particleCount * 0.3) {
      // Top edge
      x = Math.random() * width;
      y = 0;
    } else if (i < params.particleCount * 0.4) {
      // Bottom edge
      x = Math.random() * width;
      y = height - 1;
    }

    // Trace path
    const maxSteps = params.stepLength;
    for (let step = 0; step < maxSteps; step++) {
      // Get flow direction at current position
      const gridX = Math.floor(x);
      const gridY = Math.floor(y);

      if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) {
        break; // Out of bounds
      }

      const angle = flowField[gridY][gridX];

      // Move in direction of flow
      const stepSize = 1;
      x += Math.cos(angle) * stepSize;
      y += Math.sin(angle) * stepSize;

      path.push({ x, y });

      // Stop if we go out of bounds
      if (x < 0 || x >= width || y < 0 || y >= height) {
        break;
      }
    }

    if (path.length > 1) {
      paths.push(path);
    }
  }

  return paths;
}

// Simple Perlin noise implementation for the worker
function perlinNoise(x, y) {
  // Simple hash function
  function hash(x, y) {
    const h = ((x * 73856093) ^ (y * 19349663)) % 2147483647;
    return (h / 2147483647 + 1) / 2;
  }

  // Smooth interpolation
  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return a + t * (b - a);
  }

  // Get grid coordinates
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  // Get fractional part
  const xf = x - x0;
  const yf = y - y0;

  // Get gradients
  const g00 = hash(x0, y0) * 2 * Math.PI;
  const g10 = hash(x1, y0) * 2 * Math.PI;
  const g01 = hash(x0, y1) * 2 * Math.PI;
  const g11 = hash(x1, y1) * 2 * Math.PI;

  // Dot products
  const d00 = Math.cos(g00) * xf + Math.sin(g00) * yf;
  const d10 = Math.cos(g10) * (xf - 1) + Math.sin(g10) * yf;
  const d01 = Math.cos(g01) * xf + Math.sin(g01) * (yf - 1);
  const d11 = Math.cos(g11) * (xf - 1) + Math.sin(g11) * (yf - 1);

  // Interpolate
  const u = fade(xf);
  const v = fade(yf);

  const x1Interp = lerp(d00, d10, u);
  const x2Interp = lerp(d01, d11, u);

  return lerp(x1Interp, x2Interp, v);
}
