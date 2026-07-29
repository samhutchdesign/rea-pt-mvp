interface Pin {
  x: number;
  y: number;
  label: string;
}

const BRAND_600 = '#6750A4';

/** Flattens a body-map SVG plus its pin markers into a single PNG data URL, for embedding in clipboard/export output where separately-positioned DOM pins can't be represented. */
export function renderBodyMapSnapshot(imgSrc: string, pins: Pin[]): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = 320;
      const height = Math.round(width * (img.naturalHeight / img.naturalWidth || 4 / 3));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      pins.forEach((p) => {
        const px = (p.x / 100) * width;
        const py = (p.y / 100) * height;
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fillStyle = BRAND_600;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 19px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.label, px, py + 1);
      });

      try {
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imgSrc;
  });
}
