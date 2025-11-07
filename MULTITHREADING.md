# Multi-Threading Implementation for Fractal Rendering

## Overview
The infinite zoom feature now uses Web Workers for multi-threaded rendering to significantly improve performance and reduce lag during zooming operations.

## What Was Changed

### 1. Web Workers Created
- **`public/mandelbrot-worker.js`**: Handles Mandelbrot and Julia set calculations
- **`public/newton-worker.js`**: Handles Newton fractal calculations

### 2. Canvas Component Updated
- **`components/canvas.tsx`**: Modified to use Web Workers for parallel processing

## How It Works

### Thread Distribution
- Automatically detects available CPU cores using `navigator.hardwareConcurrency`
- Creates multiple worker threads (default: number of CPU cores, minimum 2)
- Divides the canvas into horizontal strips, assigning each strip to a worker
- Each worker calculates its assigned portion independently and in parallel

### Performance Benefits
- **Faster rendering**: Multiple CPU cores work simultaneously
- **Reduced lag**: Main thread remains responsive during calculations
- **Better zoom experience**: Smooth zooming even at high magnification levels
- **Scalable**: Automatically uses available hardware resources

### Fallback Strategy
- If Web Workers fail to load or encounter errors, the system automatically falls back to single-threaded rendering
- Ensures the application continues to work even if Web Workers aren't supported

## Technical Details

### Worker Communication
\`\`\`javascript
// Main thread sends work to worker
worker.postMessage({ width, height, params, startRow, endRow })

// Worker sends back calculated image data
worker.postMessage({ imageData, startRow, endRow }, [imageData.buffer])
\`\`\`

### Memory Optimization
- Uses transferable objects (`ArrayBuffer`) to avoid copying large image data
- Workers are terminated after completing their task to free memory
- ImageData is assembled on the main thread from worker results

## Supported Fractals
Currently multi-threaded:
- ✅ Mandelbrot Set (including infinite zoom)
- ✅ Julia Set (including infinite zoom)
- ✅ Newton Fractal

Other modes still use single-threaded rendering:
- Chaos Game
- Flame Fractals
- L-Systems
- Templates
- Gradients

## Browser Compatibility
- **Modern browsers**: Full support (Chrome, Firefox, Edge, Safari)
- **IE11**: Not supported (but IE11 is deprecated)
- **Mobile browsers**: Full support on modern mobile browsers

## Performance Tips
1. **Higher zoom levels**: Multi-threading provides the most benefit at high zoom levels
2. **Larger canvases**: Performance improvement scales with canvas size
3. **CPU cores**: More CPU cores = better performance (4+ cores recommended)

## Future Improvements
Potential enhancements:
- Add multi-threading to Flame Fractals and other computationally intensive modes
- Implement progressive rendering (low-res preview → high-res detail)
- Add WebGL/GPU acceleration for even faster rendering
- Implement render caching for frequently visited zoom levels
