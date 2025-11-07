// Web Worker for Mandelbrot/Julia set calculations
self.onmessage = function(e) {
  const { width, height, params, startRow, endRow } = e.data;
  
  const imageData = new Uint8ClampedArray(width * (endRow - startRow) * 4);
  
  // Dynamically scale iterations based on zoom level
  const baseIterations = params.iterations;
  const zoomFactor = Math.log10(params.zoom + 1);
  const dynamicIterations = Math.min(1000, Math.max(baseIterations, Math.floor(baseIterations * (1 + zoomFactor))));

  const xMin = -2.5 / params.zoom + params.panX;
  const xMax = 1 / params.zoom + params.panX;
  const yMin = -1.25 / params.zoom + params.panY;
  const yMax = 1.25 / params.zoom + params.panY;

  for (let py = startRow; py < endRow; py++) {
    for (let px = 0; px < width; px++) {
      const x0 = xMin + (px / width) * (xMax - xMin);
      const y0 = yMin + (py / height) * (yMax - yMin);

      let x = 0, y = 0, iter = 0;

      if (params.isJuliaSet) {
        x = x0;
        y = y0;
      }

      while (iter < dynamicIterations && x * x + y * y < 4) {
        if (params.isJuliaSet) {
          const xtmp = x * x - y * y + params.juliaSeedX;
          y = 2 * x * y + params.juliaSeedY;
          x = xtmp;
        } else {
          const xtmp = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xtmp;
        }
        iter++;
      }

      const ratio = iter / dynamicIterations;
      const localIdx = ((py - startRow) * width + px) * 4;
      const color = interpolateColor(params.colorPalette, ratio);
      
      imageData[localIdx] = color.r;
      imageData[localIdx + 1] = color.g;
      imageData[localIdx + 2] = color.b;
      imageData[localIdx + 3] = 255;
    }
  }

  self.postMessage({ imageData, startRow, endRow }, [imageData.buffer]);
};

function interpolateColor(palette, ratio) {
  const sorted = [...palette].sort((a, b) => a.position - b.position);
  const pos = ratio * 100;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (pos >= sorted[i].position && pos <= sorted[i + 1].position) {
      const range = sorted[i + 1].position - sorted[i].position;
      const localRatio = (pos - sorted[i].position) / range;
      const c1 = hexToRgb(sorted[i].color);
      const c2 = hexToRgb(sorted[i + 1].color);
      return {
        r: Math.round(c1.r + (c2.r - c1.r) * localRatio),
        g: Math.round(c1.g + (c2.g - c1.g) * localRatio),
        b: Math.round(c1.b + (c2.b - c1.b) * localRatio),
      };
    }
  }

  return hexToRgb(sorted[0].color);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
