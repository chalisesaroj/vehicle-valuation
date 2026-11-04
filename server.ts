import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Load default vehicle JSON data
app.get('/api/default-data', (req: Request, res: Response) => {
  try {
    const jsonPath = path.resolve(process.cwd(), 'public/assets/aistudio/BA-14-CHA-4271_4a555442.json');
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      return res.send(data);
    }
    return res.status(404).json({ error: 'Default JSON data not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// LaTeX compilation endpoint
app.post('/api/compile-latex', async (req: Request, res: Response) => {
  const { latex, images } = req.body;

  if (!latex || typeof latex !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid latex string in request body' });
  }

  const runId = crypto.randomBytes(8).toString('hex');
  const tempDir = path.join('/tmp', `latex_compile_${runId}`);

  try {
    fs.mkdirSync(tempDir, { recursive: true });

    // Write any asset images (e.g. { "car_front.jpg": "data:image/jpeg;base64,..." })
    if (images && typeof images === 'object') {
      for (const [filename, base64Url] of Object.entries(images)) {
        if (typeof base64Url === 'string') {
          const safeName = path.basename(filename);
          const targetPath = path.join(tempDir, safeName);

          try {
            if (base64Url.startsWith('data:image/svg+xml') || base64Url.includes('<svg')) {
              // Decode SVG and convert to PNG/JPG
              const svgContent = base64Url.startsWith('data:')
                ? decodeURIComponent(base64Url.replace(/^data:image\/svg\+xml;[^,]*,/, ''))
                : base64Url;
              const tempSvgPath = path.join(tempDir, `temp_${safeName}.svg`);
              fs.writeFileSync(tempSvgPath, svgContent, 'utf-8');
              execSync(`rsvg-convert -f png -o "${targetPath}" "${tempSvgPath}" 2>/dev/null || convert "${tempSvgPath}" "${targetPath}" 2>/dev/null || true`);
            } else {
              // Standard base64 JPEG/PNG
              const matches = base64Url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              const rawBase64 = matches ? matches[2] : base64Url;
              const buf = Buffer.from(rawBase64, 'base64');
              fs.writeFileSync(targetPath, buf);
            }

            // Verify the generated image file has valid magic bytes for JPEG or PNG
            if (fs.existsSync(targetPath)) {
              const fileBuf = fs.readFileSync(targetPath);
              const isJpeg = fileBuf.length > 3 && fileBuf[0] === 0xFF && fileBuf[1] === 0xD8;
              const isPng = fileBuf.length > 4 && fileBuf[0] === 0x89 && fileBuf[1] === 0x50;
              if (!isJpeg && !isPng) {
                // Not a valid image binary, create clean JPEG with convert
                execSync(`convert -size 640x420 xc:"#1e3a8a" "${targetPath}"`);
              }
            } else {
              execSync(`convert -size 640x420 xc:"#1e3a8a" "${targetPath}"`);
            }
          } catch (imgErr) {
            // Guarantee valid image file exists
            try {
              execSync(`convert -size 640x420 xc:"#1e3a8a" "${targetPath}"`);
            } catch (ignore) {}
          }
        }
      }
    }

    // Scan LaTeX text for any referenced image files and ensure they exist
    const imgMatches = latex.match(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g) || [];
    for (const match of imgMatches) {
      const fileMatch = match.match(/\{([^}]+)\}/);
      if (fileMatch && fileMatch[1]) {
        const refName = path.basename(fileMatch[1]);
        const refPath = path.join(tempDir, refName);
        if (!fs.existsSync(refPath)) {
          try {
            execSync(`convert -size 640x420 xc:"#1e3a8a" "${refPath}"`);
          } catch (e) {}
        }
      }
    }

    const texPath = path.join(tempDir, 'document.tex');
    fs.writeFileSync(texPath, latex, 'utf-8');

    // Run LaTeX compiler: Prefer persistent local Tectonic engine, fallback to pdflatex
    const localTectonic = path.resolve(process.cwd(), 'bin/tectonic');
    const useTectonic = fs.existsSync(localTectonic);
    const cmd = useTectonic
      ? `"${localTectonic}" -o "${tempDir}" "${texPath}"`
      : `pdflatex -interaction=nonstopmode -halt-on-error -output-directory="${tempDir}" "${texPath}"`;
    
    let compileError: string | null = null;
    let stdoutLog = '';

    try {
      stdoutLog = execSync(cmd, { cwd: tempDir, timeout: 60000 }).toString();
      if (!useTectonic) {
        // Second run for cross references and fancyhdr page totals if pdflatex
        try {
          execSync(cmd, { cwd: tempDir, timeout: 30000 });
        } catch (e2) {}
      }
    } catch (err: any) {
      compileError = err.message || 'LaTeX compilation command failed';
      if (err.stdout) stdoutLog = err.stdout.toString();
      if (err.stderr) stdoutLog += '\n' + err.stderr.toString();
    }

    const pdfPath = path.join(tempDir, 'document.pdf');
    const logPath = path.join(tempDir, 'document.log');
    let detailedLog = stdoutLog;
    if (fs.existsSync(logPath)) {
      detailedLog = fs.readFileSync(logPath, 'utf-8');
    }

    if (fs.existsSync(pdfPath)) {
      const pdfBuffer = fs.readFileSync(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="Vehicle_Valuation_Report.pdf"');
      res.setHeader('X-Compilation-Status', 'success');
      return res.send(pdfBuffer);
    } else {
      // Compilation failed
      return res.status(422).json({
        success: false,
        error: compileError || 'PDF file was not created by pdflatex',
        log: detailedLog.slice(-5000), // Return last 5000 chars of latex log
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error during compilation' });
  } finally {
    // Clean up temporary compilation directory asynchronously
    setTimeout(() => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }, 15000);
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Report Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
