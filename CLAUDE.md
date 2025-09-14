# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 web application for a spray tower calculator. The app helps design gas scrubbing towers used in pollution control systems.

## Development Commands

- **Development server**: `pnpm dev` (uses Turbopack for faster builds)
- **Build**: `pnpm build` (uses Turbopack for production builds)
- **Start production**: `pnpm start`

Note: Project uses pnpm as the package manager. All npm scripts are configured to use Turbopack.

## Architecture

### Framework Stack
- **Next.js 15** with App Router (app directory structure)
- **React 19** with server components
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** components (configured with "new-york" style)

### Project Structure
```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout with Geist fonts
├── page.tsx           # Home page
└── globals.css        # Global Tailwind styles

components/            # shadcn/ui components
├── ui/               # Base UI components (button, card, input, etc.)

lib/                  # Utility functions
└── utils.ts          # cn() utility for className merging

docs/                 # Engineering documentation
├── project.md        # Spray tower calculator specification
└── constants.json    # Engineering constants and formulas
```

### Key Configuration
- **Path aliases**: `@/*` maps to root directory for clean imports
- **shadcn/ui config**: Uses Lucide React icons, neutral base color, CSS variables enabled
- **Font system**: Geist and Geist Mono fonts loaded via next/font/google

## Engineering Context

This application implements spray tower calculations for pollution control systems. Key calculation areas include:
- Gas stream properties and flow rates
- Mass transfer coefficients and tower sizing
- Pollutant removal efficiency calculations
- Equipment specifications (nozzles, pumps)

The calculations follow engineering formulas for Reynolds numbers, Schmidt numbers, Sherwood numbers, and mass transfer correlations. Input validation is critical as the app handles industrial engineering parameters.

## Component Development

When creating new components:
- Follow shadcn/ui patterns in `components/ui/`
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Implement proper TypeScript interfaces
- Follow the "new-york" style variant conventions
- Use Lucide React for icons

## Styling Guidelines

- Tailwind CSS 4 with CSS variables for theming
- Dark mode support built into color system
- Uses `clsx` and `tailwind-merge` for dynamic classes
- Font classes: `font-sans` (Geist), `font-mono` (Geist Mono)