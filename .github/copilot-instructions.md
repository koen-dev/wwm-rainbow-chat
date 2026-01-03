# Copilot Instructions for WWM Rainbow Chat

## Project Overview

This is a static React web application that generates colored chat text for "Where Winds Meet" game. It creates text where each character is prefixed with a lowercase hex color code in the format `#rrggbb`.

## Technology Stack

- **React 18** - UI framework using functional components and hooks
- **TypeScript** - Strict type checking enabled
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Node.js 20+** - Runtime environment

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Code Style and Conventions

### TypeScript

- Use **strict mode** - all strict TypeScript checks are enabled
- Target ES2022 with modern JavaScript features
- Use explicit type annotations for function parameters and return types
- Prefer `type` over `interface` for simple type definitions
- Use `const` for immutable values, avoid `let` when possible

### React

- Use **functional components** with hooks - no class components
- Use React 18 patterns (e.g., `react-jsx` transform)
- Prefer `useMemo` and `useCallback` for performance optimization
- Use single quotes for strings (except JSX attributes which use double quotes)
- Event handlers should be named with `handle` prefix (e.g., `handleCopy`, `handleTextChange`)

### State Management

- Use `useState` for local component state
- Use `useEffect` for side effects (e.g., localStorage persistence)
- Use `useMemo` for expensive computations (e.g., generating colored text)
- State is persisted to localStorage under the key `wwm-rainbow-chat`

### Styling

- Use Tailwind CSS utility classes for all styling
- Follow mobile-first responsive design principles
- Use semantic color names from Tailwind (e.g., `bg-gray-800`, `text-white`)
- Use spacing scale consistently (e.g., `space-y-4`, `p-6`, `gap-4`)
- Use `className` prop for styling (not `style` prop)

### File Organization

- All source code is in `/src` directory
- Main application component: `src/App.tsx`
- Global styles: `src/index.css` (Tailwind imports only)
- Entry point: `src/main.tsx`
- Single-file components are preferred for this small application

### Color and Gradient Handling

- Colors are always in lowercase hex format: `#rrggbb`
- Use `ColorStop` type for gradient stops: `{ position: number; color: string }`
- Color interpolation is done in RGB color space
- Position values range from 0 to 1 (representing 0% to 100%)

### Constants

- Use `UPPER_SNAKE_CASE` for constants (e.g., `PRESETS`, `MAX_OUTPUT_LENGTH`)
- Define presets and configuration at the top of the file

### Error Handling

- Use try-catch blocks for operations that might fail (e.g., localStorage, clipboard API)
- Log errors to console with `console.error()`
- Provide user feedback for failed operations when appropriate

### Build and Deployment

- Production builds are created in the `/dist` directory
- The app is deployed to GitHub Pages via GitHub Actions
- Base path is configurable via `BASE_PATH` environment variable
- All builds use Vite's production optimizations

## Best Practices

1. **Minimize re-renders** - Use `useMemo` for computed values that depend on state
2. **Type safety** - Always provide types for function parameters and state
3. **Accessibility** - Use semantic HTML and provide appropriate ARIA labels
4. **Performance** - Limit output length to prevent performance issues (MAX_OUTPUT_LENGTH = 300)
5. **User experience** - Provide immediate visual feedback for user actions (e.g., copy success state)
6. **Data persistence** - Automatically save user preferences to localStorage

## Testing

Currently, this project does not have automated tests. When adding tests in the future:
- Use a testing framework compatible with Vite (e.g., Vitest)
- Test color interpolation functions independently
- Test state management and localStorage integration
- Test edge cases (empty input, single character, spaces)

## Common Patterns

### Adding a new preset gradient

```typescript
const PRESETS = {
  // existing presets...
  newGradient: [
    { position: 0, color: '#rrggbb' },
    { position: 0.5, color: '#rrggbb' },
    { position: 1, color: '#rrggbb' },
  ],
}
```

### Creating new color modes

Follow the pattern of the existing modes (preset, custom, single) and update the union type:

```typescript
type Mode = 'preset' | 'custom' | 'single' | 'newMode'
```

## Dependencies

- Keep dependencies minimal and up-to-date
- Use caret ranges (^) for semver-compatible versions
- All dependencies are in devDependencies except React and React-DOM
- Avoid adding unnecessary libraries - prefer vanilla solutions when simple
