/**
 * Client-Side Virtual Makeup Renderer for Canvas 2D
 * Ports OpenCV overlays and alpha blending logic to equivalent HTML5 canvas operations.
 * This is client-side only to bypass the server-side latency and WebSocket failures.
 */

export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface MakeupSettings {
  lipstick: { enabled: boolean; color: string; intensity: number };
  eyeshadow: { enabled: boolean; color: string; intensity: number };
  blush: { enabled: boolean; color: string; intensity: number };
  foundation: { enabled: boolean; color: string; intensity: number };
  eyeliner: { enabled: boolean; color: string; intensity: number; thickness: number };
  eyebrow: { enabled: boolean; color: string; intensity: number };
}

// MediaPipe Face Mesh Indices for makeup regions
const LANDMARKS = {
  lips_outer: [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318, 78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415],
  lips_inner: [13, 82, 81, 80, 78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312],
  left_eye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  right_eye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
  left_eyebrow: [46, 53, 52, 51, 48, 115, 131, 134, 102, 49, 220, 305],
  right_eyebrow: [276, 283, 282, 281, 278, 344, 360, 363, 331, 279, 440, 75],
  left_cheek: [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147, 187],
  right_cheek: [345, 346, 347, 348, 349, 350, 355, 371, 266, 425, 426, 427, 436, 416, 376, 411],
  face_oval: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
  
  // Upper eyelid coordinates specifically for eyeliner tracing
  left_upper_eyelid: [33, 246, 161, 160, 159, 158, 157, 173, 133],
  right_upper_eyelid: [263, 466, 388, 387, 386, 385, 384, 398, 362]
};

// Convert hex color string to RGB object
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map(char => char + char).join("");
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Renders the chosen makeup features onto the target canvas
 */
export function renderMakeup(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  settings: MakeupSettings,
  width: number,
  height: number
) {
  if (!landmarks || landmarks.length === 0) return;

  // Face structural values for dynamic scaling (blush radius, eyeshadow height etc.)
  const faceHeight = Math.hypot(landmarks[152].x - landmarks[10].x, landmarks[152].y - landmarks[10].y) * height;
  const faceWidth = Math.hypot(landmarks[454].x - landmarks[234].x, landmarks[454].y - landmarks[234].y) * width;

  // Apply order matching Python's 'makeup_order = ['foundation', 'blush', 'eyeshadow', 'eyeliner', 'eyebrow', 'lipstick']'
  
  // 1. FOUNDATION (Base)
  if (settings.foundation?.enabled) {
    applyFoundation(ctx, landmarks, settings.foundation.color, settings.foundation.intensity, width, height);
  }

  // 2. BLUSH (Cheeks)
  if (settings.blush?.enabled) {
    applyBlush(ctx, landmarks, settings.blush.color, settings.blush.intensity, faceWidth, width, height);
  }

  // 3. EYESHADOW
  if (settings.eyeshadow?.enabled) {
    applyEyeshadow(ctx, landmarks, settings.eyeshadow.color, settings.eyeshadow.intensity, faceHeight, width, height);
  }

  // 4. EYELINER
  if (settings.eyeliner?.enabled) {
    applyEyeliner(ctx, landmarks, settings.eyeliner.color, settings.eyeliner.intensity, settings.eyeliner.thickness, width, height);
  }

  // 5. EYEBROWS
  if (settings.eyebrow?.enabled) {
    applyEyebrows(ctx, landmarks, settings.eyebrow.color, settings.eyebrow.intensity, width, height);
  }

  // 6. LIPSTICK
  if (settings.lipstick?.enabled) {
    applyLipstick(ctx, landmarks, settings.lipstick.color, settings.lipstick.intensity, width, height);
  }
}

// Foundation implementation with eye & lip exclusion holes using 'evenodd' fill rule
function applyFoundation(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  color: string,
  intensity: number,
  width: number,
  height: number
) {
  ctx.save();
  
  const rgb = hexToRgb(color);
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity / 100})`;
  ctx.filter = "blur(8px)"; // Softens the foundation edges to merge with hair/jawline
  
  ctx.beginPath();
  
  // 1. Draw outer face boundary (clockwise)
  const facePoints = LANDMARKS.face_oval.map(idx => ({
    x: landmarks[idx].x * width,
    y: landmarks[idx].y * height
  }));
  if (facePoints.length > 0) {
    ctx.moveTo(facePoints[0].x, facePoints[0].y);
    for (let i = 1; i < facePoints.length; i++) {
      ctx.lineTo(facePoints[i].x, facePoints[i].y);
    }
    ctx.closePath();
  }
  
  // 2. Punch hole for left eye (counter-clockwise)
  const leftEyePoints = LANDMARKS.left_eye.map(idx => ({
    x: landmarks[idx].x * width,
    y: landmarks[idx].y * height
  }));
  if (leftEyePoints.length > 0) {
    ctx.moveTo(leftEyePoints[0].x, leftEyePoints[0].y);
    for (let i = leftEyePoints.length - 1; i >= 0; i--) {
      ctx.lineTo(leftEyePoints[i].x, leftEyePoints[i].y);
    }
    ctx.closePath();
  }

  // 3. Punch hole for right eye (counter-clockwise)
  const rightEyePoints = LANDMARKS.right_eye.map(idx => ({
    x: landmarks[idx].x * width,
    y: landmarks[idx].y * height
  }));
  if (rightEyePoints.length > 0) {
    ctx.moveTo(rightEyePoints[0].x, rightEyePoints[0].y);
    for (let i = rightEyePoints.length - 1; i >= 0; i--) {
      ctx.lineTo(rightEyePoints[i].x, rightEyePoints[i].y);
    }
    ctx.closePath();
  }

  // 4. Punch hole for lips (counter-clockwise)
  const lipPoints = LANDMARKS.lips_outer.map(idx => ({
    x: landmarks[idx].x * width,
    y: landmarks[idx].y * height
  }));
  if (lipPoints.length > 0) {
    ctx.moveTo(lipPoints[0].x, lipPoints[0].y);
    for (let i = lipPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(lipPoints[i].x, lipPoints[i].y);
    }
    ctx.closePath();
  }

  // Use evenodd fill rule so that inside face path is filled but inside eye/lip paths is hollowed out
  ctx.fill("evenodd");
  ctx.restore();
}

// Blush using radial gradients on cheek centroids scaled to face size
function applyBlush(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  color: string,
  intensity: number,
  faceWidth: number,
  width: number,
  height: number
) {
  ctx.save();
  const rgb = hexToRgb(color);
  
  // Calculate dynamic blush radius (e.g., 14% of the face width)
  const blushRadius = faceWidth * 0.14;
  
  const cheekRegions = [LANDMARKS.left_cheek, LANDMARKS.right_cheek];
  
  cheekRegions.forEach(indices => {
    // Find average cheek landmark centroid
    let sumX = 0, sumY = 0;
    indices.forEach(idx => {
      sumX += landmarks[idx].x * width;
      sumY += landmarks[idx].y * height;
    });
    const cx = sumX / indices.length;
    const cy = sumY / indices.length;
    
    // Smooth radial gradient blending outward to transparent
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, blushRadius);
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity / 100})`);
    gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(intensity / 100) * 0.5})`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, blushRadius, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  ctx.restore();
}

// Eyeshadow using crescent polygons above the upper eyelids, drawn with a soft blur filter
function applyEyeshadow(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  color: string,
  intensity: number,
  faceHeight: number,
  width: number,
  height: number
) {
  ctx.save();
  
  const rgb = hexToRgb(color);
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity / 100})`;
  ctx.filter = "blur(4px)"; // Blends eyeshadow edges naturally
  
  const eyes = [
    { upperLid: LANDMARKS.left_upper_eyelid },
    { upperLid: LANDMARKS.right_upper_eyelid }
  ];
  
  eyes.forEach(eye => {
    const points = eye.upperLid.map(idx => ({
      x: landmarks[idx].x * width,
      y: landmarks[idx].y * height
    }));
    
    if (points.length < 3) return;
    
    ctx.beginPath();
    
    // Draw bottom boundary along the lid line (from inner corner to outer corner)
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    // Draw top boundary back to inner corner, offsetting y upward to form a crescent contour
    const maxOffset = faceHeight * 0.045; // peak shadow height is ~4.5% of face height
    for (let i = points.length - 1; i >= 0; i--) {
      // Scale offset using a sine curve so it is 0 at corners and peaks in the middle lid
      const ratio = i / (points.length - 1);
      const factor = Math.sin(ratio * Math.PI);
      const offset = maxOffset * factor;
      
      ctx.lineTo(points[i].x, points[i].y - offset);
    }
    
    ctx.closePath();
    ctx.fill();
  });
  
  ctx.restore();
}

// Eyeliner along the upper eyelid boundary
function applyEyeliner(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  color: string,
  intensity: number,
  thickness: number,
  width: number,
  height: number
) {
  ctx.save();
  
  const rgb = hexToRgb(color);
  ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity / 100})`;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  const upperLids = [LANDMARKS.left_upper_eyelid, LANDMARKS.right_upper_eyelid];
  
  upperLids.forEach(indices => {
    const points = indices.map(idx => ({
      x: landmarks[idx].x * width,
      y: landmarks[idx].y * height
    }));
    
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  });
  
  ctx.restore();
}

// Eyebrows drawn using landmark polygons and blurred slightly for hair texture softness
function applyEyebrows(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  color: string,
  intensity: number,
  width: number,
  height: number
) {
  ctx.save();
  
  const rgb = hexToRgb(color);
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity / 100})`;
  ctx.filter = "blur(2px)"; // Makes filled brow lines look like soft powder fillers
  
  const eyebrows = [LANDMARKS.left_eyebrow, LANDMARKS.right_eyebrow];
  
  eyebrows.forEach(indices => {
    const points = indices.map(idx => ({
      x: landmarks[idx].x * width,
      y: landmarks[idx].y * height
    }));
    
    if (points.length < 3) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
  });
  
  ctx.restore();
}

// Lipstick applying outer lip polygon with inner lip hole exclusion (evenodd fill rule)
function applyLipstick(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  color: string,
  intensity: number,
  width: number,
  height: number
) {
  ctx.save();
  
  const rgb = hexToRgb(color);
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity / 100})`;
  ctx.filter = "blur(1.2px)"; // Smooths boundaries to match lip edge texture
  
  ctx.beginPath();
  
  // 1. Draw outer lips (clockwise)
  const outerPoints = LANDMARKS.lips_outer.map(idx => ({
    x: landmarks[idx].x * width,
    y: landmarks[idx].y * height
  }));
  if (outerPoints.length > 0) {
    ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
    for (let i = 1; i < outerPoints.length; i++) {
      ctx.lineTo(outerPoints[i].x, outerPoints[i].y);
    }
    ctx.closePath();
  }
  
  // 2. Draw inner lips (counter-clockwise) to exclude the mouth opening
  const innerPoints = LANDMARKS.lips_inner.map(idx => ({
    x: landmarks[idx].x * width,
    y: landmarks[idx].y * height
  }));
  if (innerPoints.length > 0) {
    ctx.moveTo(innerPoints[0].x, innerPoints[0].y);
    for (let i = innerPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(innerPoints[i].x, innerPoints[i].y);
    }
    ctx.closePath();
  }
  
  // Apply evenodd fill rule so the inner lips (mouth interior) are punched out
  ctx.fill("evenodd");
  ctx.restore();
}
