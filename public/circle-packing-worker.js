// Web Worker for Circle Packing computation
self.onmessage = function(e) {
  const { width, height, params } = e.data;

  // Generate circles based on packing mode
  const circles = generateCircles(width, height, params);

  // Send back the result
  self.postMessage({ circles });
};

function generateCircles(width, height, params) {
  const { packingMode, maxCircles, padding } = params;
  const circles = [];

  if (packingMode === "random") {
    // Random circle placement with collision detection
    circles.push(...packCirclesRandom(width, height, maxCircles, padding));
  } else if (packingMode === "grow-from-center") {
    // Grow circles from center outward
    circles.push(...packCirclesFromCenter(width, height, maxCircles, padding));
  }

  return circles;
}

function packCirclesRandom(width, height, maxCircles, padding) {
  const circles = [];
  const attempts = maxCircles * 10; // Allow multiple attempts per circle

  for (let i = 0; i < attempts && circles.length < maxCircles; i++) {
    // Generate random position and radius
    const x = Math.random() * width;
    const y = Math.random() * height;
    const minRadius = 5;
    const maxRadius = Math.min(width, height) / 20;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);

    // Check if circle fits within bounds
    if (x - radius < 0 || x + radius > width || y - radius < 0 || y + radius > height) {
      continue; // Skip circles that don't fit
    }

    // Check for collisions with existing circles
    let collision = false;
    for (const existingCircle of circles) {
      const dx = x - existingCircle.x;
      const dy = y - existingCircle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = radius + existingCircle.radius + padding;

      if (distance < minDistance) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      circles.push({ x, y, radius, id: circles.length });
    }
  }

  return circles;
}

function packCirclesFromCenter(width, height, maxCircles, padding) {
  const circles = [];
  const centerX = width / 2;
  const centerY = height / 2;

  // Start with a small circle in the center
  circles.push({
    x: centerX,
    y: centerY,
    radius: 10,
    id: 0
  });

  // Try to add more circles
  const attempts = maxCircles * 5;

  for (let i = 0; i < attempts && circles.length < maxCircles; i++) {
    // Generate candidate positions around existing circles
    const candidates = generateCandidatePositions(circles, width, height, padding);

    if (candidates.length === 0) {
      break; // No more space to place circles
    }

    // Choose the best candidate (largest possible radius)
    let bestCandidate = null;
    let bestRadius = 0;

    for (const candidate of candidates) {
      const radius = calculateMaxRadius(candidate.x, candidate.y, circles, width, height, padding);
      if (radius > bestRadius && radius >= 3) {
        bestRadius = radius;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      circles.push({
        x: bestCandidate.x,
        y: bestCandidate.y,
        radius: bestRadius,
        id: circles.length
      });
    }
  }

  return circles;
}

function generateCandidatePositions(existingCircles, width, height, padding) {
  const candidates = [];

  // Generate candidates by trying positions near existing circles
  for (const circle of existingCircles) {
    // Try several angles around each circle
    const numAngles = 8;
    for (let i = 0; i < numAngles; i++) {
      const angle = (i / numAngles) * 2 * Math.PI;
      const distance = circle.radius + 10 + Math.random() * 20; // Vary distance

      const x = circle.x + Math.cos(angle) * distance;
      const y = circle.y + Math.sin(angle) * distance;

      // Check bounds
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        candidates.push({ x, y });
      }
    }
  }

  return candidates;
}

function calculateMaxRadius(x, y, existingCircles, width, height, padding) {
  // Find distance to boundaries
  const distToLeft = x;
  const distToRight = width - x;
  const distToTop = y;
  const distToBottom = height - y;
  const distToBoundary = Math.min(distToLeft, distToRight, distToTop, distToBottom);

  let maxRadius = distToBoundary;

  // Find distance to other circles
  for (const circle of existingCircles) {
    const dx = x - circle.x;
    const dy = y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const availableRadius = distance - circle.radius - padding;

    if (availableRadius < maxRadius) {
      maxRadius = availableRadius;
    }
  }

  return Math.max(0, maxRadius);
}