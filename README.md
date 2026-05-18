# MDADP

Web tool for adding watermarks to images. Upload one or multiple images, customize position, opacity, text or logo, and download as ZIP.

## Features

- Image upload, single or multiple (drag & drop)
- Real-time preview
- Text or image watermark
- Customizable positioning (9 positions)
- Adjustable opacity
- Download single or ZIP
- Responsive

## How it Works

1. **Upload** — Drag & drop or select one or multiple images
2. **Configure** — Choose watermark type (text or image), position, and opacity
3. **Preview** — See changes in real-time on all images
4. **Download** — Get individual images or all at once as ZIP

## Preview

**Live:** [mdadp.vercel.app](https://mdadp.vercel.app)

## Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Radix UI primitives
- JSZip (batch download)

## Getting Started

```sh
git clone https://github.com/jonvieira/mdadp
cd mdadp
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run linter |
| `npm run test` | Run tests |

## Deploy

Automatic deployment via Vercel on pushes to `main`.
