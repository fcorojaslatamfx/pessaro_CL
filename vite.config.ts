// vite.config.ts
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs/promises';
import nodePath from 'node:path';
import { componentTagger } from 'lovable-tagger';
import path from "path";

import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';


// CJS/ESM interop for Babel libs
const traverse: typeof _traverse.default = ( (_traverse as any).default ?? _traverse ) as any;
const generate: typeof _generate.default = ( (_generate as any).default ?? _generate ) as any;

function cdnPrefixImages(): Plugin {
  const DEBUG = process.env.CDN_IMG_DEBUG === '1';
  let publicDir = '';              // absolute path to Vite public dir
  const imageSet = new Set<string>(); // stores normalized '/images/...' paths

  const isAbsolute = (p: string) =>
    /^(?:[a-z]+:)?\/\//i.test(p) || p.startsWith('data:') || p.startsWith('blob:');

  // normalize a ref like './images/x.png', '../images/x.png', '/images/x.png' -> '/images/x.png'
  const normalizeRef = (p: string) => {
    let s = p.trim();
    // quick bail-outs
    if (isAbsolute(s)) return s;
    // strip leading ./ and any ../ segments (we treat public/ as root at runtime)
    s = s.replace(/^(\.\/)+/, '');
    while (s.startsWith('../')) s = s.slice(3);
    if (s.startsWith('/')) s = s.slice(1);
    // ensure it starts with images/
    if (!s.startsWith('images/')) return p; // not under images → leave as is
    return '/' + s; // canonical: '/images/...'
  };

  const toCDN = (p: string, cdn: string) => {
    const n = normalizeRef(p);
    if (isAbsolute(n)) return n;
    if (!n.startsWith('/images/')) return p;           // not our folder
    if (!imageSet.has(n)) return p;                    // not an existing file
    const base = cdn.endsWith('/') ? cdn : cdn + '/';
    return base + n.slice(1);                          // 'https://cdn/.../images/..'
  };

  return {
    name: 'cdn-prefix-images',
    configResolved(config) {
      publicDir = config.publicDir;
    },
    async buildStart() {
      // scan public/images/ for files
      try {
        const imagesDir = nodePath.join(publicDir, 'images');
        const files = await fs.readdir(imagesDir, { recursive: true });
        for (const file of files) {
          if (typeof file === 'string') {
            const stat = await fs.stat(nodePath.join(imagesDir, file));
            if (stat.isFile()) {
              imageSet.add('/images/' + file);
              if (DEBUG) console.log('[CDN] Found image:', '/images/' + file);
            }
          }
        }
      } catch (err) {
        // no images dir or other error → just continue
        if (DEBUG) console.log('[CDN] No images directory or error scanning:', err);
      }
    },
    transform(code, id) {
      const cdn = process.env.VITE_CDN_URL;
      if (!cdn || !id.endsWith('.tsx') || !code.includes('IMAGES.')) return;

      try {
        const ast = parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });

        let modified = false;

        traverse(ast, {
          MemberExpression(path) {
            const { node } = path;
            if (
              t.isIdentifier(node.object, { name: 'IMAGES' }) &&
              t.isIdentifier(node.property) &&
              path.isReferencedIdentifier()
            ) {
              // This is IMAGES.SOMETHING - we need to find the actual image path
              // For now, we'll skip this transformation as it requires more complex analysis
              // of the IMAGES object definition
            }
          },
          StringLiteral(path) {
            const { node } = path;
            if (typeof node.value === 'string' && node.value.includes('/images/')) {
              const newValue = toCDN(node.value, cdn);
              if (newValue !== node.value) {
                node.value = newValue;
                modified = true;
                if (DEBUG) console.log('[CDN] Replaced:', node.value, '→', newValue);
              }
            }
          },
        });

        if (modified) {
          const result = generate(ast, {}, code);
          return {
            code: result.code,
            map: result.map,
          };
        }
      } catch (err) {
        console.warn('[CDN] Failed to parse/transform:', id, err);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    tailwindcss(),
    cdnPrefixImages(),
    componentTagger(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          motion: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react',
    ],
  },
}));