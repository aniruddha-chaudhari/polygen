// Web Worker for Reaction-Diffusion simulation using Gray-Scott model
const SCALE = 4;
const MAX_COMPUTATION_TIME = 12000; // 12 seconds max computation time

self.onmessage = function(e) {
  const startTime = Date.now();
  const { width, height, params } = e.data;

  try {
    // Initialize or continue simulation
    if (!self.gridU || !self.gridV || self.lastParams !== JSON.stringify(params)) {
      const cols = Math.floor(width / SCALE);
      const rows = Math.floor(height / SCALE);

      self.gridU = new Array(rows).fill(null).map(() => new Array(cols).fill(1));
      self.gridV = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

      seedInitialPattern(params.preset, cols, rows);

      self.lastParams = JSON.stringify(params);
      self.frameCount = 0;
    }

    // Run simulation steps - reduced iterations for better performance
    const baseIterations = 60; // Reduced from 120
    const iterations = Math.min(baseIterations + Math.floor(params.speed * 100), 150); // Cap at 150
    
    for (let iter = 0; iter < iterations; iter++) {
      // Check if we're taking too long
      if (Date.now() - startTime > MAX_COMPUTATION_TIME) {
        console.warn('Reaction-diffusion computation timeout, stopping early');
        break;
      }
      
      stepGrayScott(params);
      self.frameCount++;
    }

    // Convert to image data
    const imageData = gridsToImageData(width, height, SCALE);

    self.postMessage({ imageData, frameCount: self.frameCount }, [imageData.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message || 'Worker error' });
  }
};

function seedInitialPattern(preset, cols, rows) {
  // Add gentle random noise to start the simulation
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      self.gridU[y][x] = 1 - Math.random() * 0.05;
      self.gridV[y][x] = Math.random() * 0.05;
    }
  }

  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);

  const applyCircle = (cx, cy, radius, strength = 1) => {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const px = cx + x;
        const py = cy + y;
        if (px >= 0 && px < cols && py >= 0 && py < rows) {
          if (x * x + y * y <= radius * radius) {
            self.gridV[py][px] = strength;
            self.gridU[py][px] = Math.max(0, 1 - strength);
          }
        }
      }
    }
  };

  switch (preset) {
    case "stripes":
      for (let x = 0; x < cols; x++) {
        if (x % 12 < 6) {
          for (let y = 0; y < rows; y++) {
            self.gridV[y][x] = 0.9;
            self.gridU[y][x] = 0.1;
          }
        }
      }
      break;
    case "labyrinth":
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if ((x ^ y) % 7 === 0) {
            self.gridV[y][x] = 0.8;
            self.gridU[y][x] = 0.2;
          }
        }
      }
      break;
    case "worms":
      for (let i = 0; i < 20; i++) {
        applyCircle(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 4, 0.9);
      }
      break;
    case "spots-stripes":
      for (let x = 0; x < cols; x++) {
        if (x % 20 < 10) {
          for (let y = 0; y < rows; y++) {
            if (y % 8 < 4) {
              self.gridV[y][x] = 0.85;
              self.gridU[y][x] = 0.15;
            }
          }
        }
      }
      for (let i = 0; i < 30; i++) {
        applyCircle(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 3, 0.95);
      }
      break;
    case "moving-spots":
      for (let i = 0; i < 40; i++) {
        applyCircle(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 3, 1);
      }
      break;
    case "spots":
    default:
      for (let i = 0; i < 60; i++) {
        applyCircle(centerX + Math.floor((Math.random() - 0.5) * cols * 0.7), centerY + Math.floor((Math.random() - 0.5) * rows * 0.7), 3 + Math.floor(Math.random() * 4), 1);
      }
      break;
  }
}

function stepGrayScott(params) {
  const rows = self.gridU.length;
  const cols = self.gridU[0].length;

  const nextU = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
  const nextV = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

  // Gray-Scott reaction-diffusion parameters
  const Du = 0.16; // Diffusion rate of U
  const Dv = 0.08; // Diffusion rate of V
  const F = params.feedRate; // Feed rate
  const k = params.killRate; // Kill rate

  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const u = self.gridU[y][x];
      const v = self.gridV[y][x];

      // Laplacian (discrete diffusion) using 8-neighbour kernel
      const laplacianU =
        -u +
        (self.gridU[y-1][x] + self.gridU[y+1][x] + self.gridU[y][x-1] + self.gridU[y][x+1]) * 0.2 +
        (self.gridU[y-1][x-1] + self.gridU[y-1][x+1] + self.gridU[y+1][x-1] + self.gridU[y+1][x+1]) * 0.05;

      const laplacianV =
        -v +
        (self.gridV[y-1][x] + self.gridV[y+1][x] + self.gridV[y][x-1] + self.gridV[y][x+1]) * 0.2 +
        (self.gridV[y-1][x-1] + self.gridV[y-1][x+1] + self.gridV[y+1][x-1] + self.gridV[y+1][x+1]) * 0.05;

      // Gray-Scott equations
      const uvv = u * v * v;
      const du = Du * laplacianU - uvv + F * (1 - u);
      const dv = Dv * laplacianV + uvv - (F + k) * v;

      // Update
      nextU[y][x] = u + du * 1.0; // dt = 1.0
      nextV[y][x] = v + dv * 1.0;
    }
  }

  // Copy back
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      self.gridU[y][x] = Math.max(0, Math.min(1, nextU[y][x]));
      self.gridV[y][x] = Math.max(0, Math.min(1, nextV[y][x]));
    }
  }
}

function gridsToImageData(width, height, scale) {
  const cols = self.gridU[0].length;
  const rows = self.gridU.length;
  const imageData = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gridY = Math.floor(y / scale);
      const gridX = Math.floor(x / scale);

      if (gridY < rows && gridX < cols) {
        const u = self.gridU[gridY][gridX];
        const v = self.gridV[gridY][gridX];

        // Color mapping provides vibrant gradients
        const r = Math.floor((1 - v) * 255);
        const g = Math.floor((u - v + 1) * 128);
        const b = Math.floor(v * 255);

        const idx = (y * width + x) * 4;
        imageData[idx] = Math.max(0, Math.min(255, r));
        imageData[idx + 1] = Math.max(0, Math.min(255, g));
        imageData[idx + 2] = Math.max(0, Math.min(255, b));
        imageData[idx + 3] = 255;
      }
    }
  }

  return imageData;
}
