# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1.6 application using React 19, TypeScript, and Tailwind CSS v4. The project is set up with the App Router architecture.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js dev server at http://localhost:3000
- **Build**: `npm run build` - Creates production build
- **Production server**: `npm start` - Runs production build
- **Linting**: `npm run lint` - Runs ESLint

## Architecture

### App Router Structure
- Main entry point: `src/app/page.tsx`
- Root layout: `src/app/layout.tsx` - Defines HTML structure, metadata, and Geist font configuration
- Global styles: `src/app/globals.css`

### TypeScript Configuration
- Import alias: `@/*` maps to `./src/*` (defined in tsconfig.json)
- Strict mode enabled
- React JSX mode: `react-jsx`

### Styling
- **Tailwind CSS v4**: Uses PostCSS plugin via `@tailwindcss/postcss`
- Configuration: `postcss.config.mjs`
- Theme variables defined inline in `globals.css` using `@theme inline` directive
- Custom CSS variables: `--background`, `--foreground`, `--font-sans`, `--font-mono`
- Dark mode: Automatic based on `prefers-color-scheme`
- Fonts: Geist Sans and Geist Mono loaded via `next/font/google`

## Project Structure

```
src/
  app/
    layout.tsx     - Root layout with fonts and metadata
    page.tsx       - Home page component
    globals.css    - Global styles and Tailwind imports
```
