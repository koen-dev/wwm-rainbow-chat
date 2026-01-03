# WWM Rainbow Chat Generator

A static web application that generates colored chat text for Where Winds Meet with per-character hex color prefixes.

## Features

- **Multiple Color Modes**:
  - **Preset Gradients**: Choose from 5 built-in gradients (Rainbow, Fire, Ocean, Sunset, Forest)
  - **Custom Gradients**: Create your own gradient with multiple color stops
  - **Single Color**: Apply a single color to all text

- **Text Input**: Enter any text to colorize
- **Ignore Spaces Option**: Choose whether to apply colors to spaces or skip them
- **Live Preview**: See how your text will look with colors applied
- **Copy to Clipboard**: One-click copy of the formatted output
- **localStorage Persistence**: Your settings and text are saved automatically

## How to Use

1. **Select a Color Mode**:
   - Choose "Preset Gradient" for quick rainbow effects
   - Choose "Custom Gradient" to create your own color combinations
   - Choose "Single Color" for monochrome text

2. **Enter Your Text**: Type or paste your message in the input area

3. **Preview**: See the live colored preview of your text

4. **Copy**: Click "Copy to Clipboard" to copy the formatted text with hex color codes

5. **Paste in Game**: Paste the output into Where Winds Meet chat to display your rainbow text!

## Output Format

The app generates text where each character is prefixed with a lowercase hex color code in the format `#rrggbb`. For example:

```
#ff0000H#ff7f00e#ffff00l#00ff00l#0000ffo
```

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling

## Deployment

This app is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

### Manual Deployment

1. Ensure GitHub Pages is enabled in repository settings
2. Set the source to "GitHub Actions"
3. Push to the `main` branch or manually trigger the workflow

The app will be available at: `https://<username>.github.io/<repository-name>/`

## Browser Support

Works in all modern browsers that support:
- ES2022+
- CSS Grid and Flexbox
- localStorage
- Clipboard API

## License

MIT

