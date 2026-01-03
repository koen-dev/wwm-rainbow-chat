import { useState, useEffect, useMemo } from 'react'

// Preset gradients
const PRESETS = {
  rainbow: [
    { position: 0, color: '#ff0000' },
    { position: 0.17, color: '#ff7f00' },
    { position: 0.33, color: '#ffff00' },
    { position: 0.5, color: '#00ff00' },
    { position: 0.67, color: '#0000ff' },
    { position: 0.83, color: '#4b0082' },
    { position: 1, color: '#9400d3' },
  ],
  fire: [
    { position: 0, color: '#ff0000' },
    { position: 0.5, color: '#ff7f00' },
    { position: 1, color: '#ffff00' },
  ],
  ocean: [
    { position: 0, color: '#00ffff' },
    { position: 0.5, color: '#0080ff' },
    { position: 1, color: '#0000ff' },
  ],
  sunset: [
    { position: 0, color: '#ff6b6b' },
    { position: 0.5, color: '#ffd93d' },
    { position: 1, color: '#6bcfff' },
  ],
  forest: [
    { position: 0, color: '#00ff00' },
    { position: 0.5, color: '#228b22' },
    { position: 1, color: '#006400' },
  ],
  pink: [
    { position: 0, color: '#ffb3d9' },
    { position: 0.33, color: '#ff80bf' },
    { position: 0.67, color: '#ff4da6' },
    { position: 1, color: '#e91e8c' },
  ],
}

type ColorStop = { position: number; color: string }

function interpolateColor(color1: string, color2: string, factor: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16)
  const g1 = parseInt(color1.slice(3, 5), 16)
  const b1 = parseInt(color1.slice(5, 7), 16)

  const r2 = parseInt(color2.slice(1, 3), 16)
  const g2 = parseInt(color2.slice(3, 5), 16)
  const b2 = parseInt(color2.slice(5, 7), 16)

  const r = Math.round(r1 + (r2 - r1) * factor)
  const g = Math.round(g1 + (g2 - g1) * factor)
  const b = Math.round(b1 + (b2 - b1) * factor)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function getColorAtPosition(stops: ColorStop[], position: number): string {
  if (stops.length === 0) return '#ffffff'
  if (stops.length === 1) return stops[0].color

  const sortedStops = [...stops].sort((a, b) => a.position - b.position)

  if (position <= sortedStops[0].position) return sortedStops[0].color
  if (position >= sortedStops[sortedStops.length - 1].position) {
    return sortedStops[sortedStops.length - 1].color
  }

  for (let i = 0; i < sortedStops.length - 1; i++) {
    const stop1 = sortedStops[i]
    const stop2 = sortedStops[i + 1]

    if (position >= stop1.position && position <= stop2.position) {
      const factor = (position - stop1.position) / (stop2.position - stop1.position)
      return interpolateColor(stop1.color, stop2.color, factor)
    }
  }

  return sortedStops[0].color
}

function generateRainbowText(text: string, stops: ColorStop[], ignoreSpaces: boolean): string {
  const chars = text.split('')
  const relevantChars = ignoreSpaces ? chars.filter((c) => c !== ' ') : chars
  
  if (relevantChars.length === 0) return ''

  let result = ''
  let colorIndex = 0

  for (const char of chars) {
    if (ignoreSpaces && char === ' ') {
      result += char
    } else {
      const position = colorIndex / Math.max(1, relevantChars.length - 1)
      const color = getColorAtPosition(stops, position)
      result += color + char
      colorIndex++
    }
  }

  return result
}

function splitIntoMessages(rainbowText: string, maxLength: number): string[] {
  if (rainbowText.length <= maxLength) {
    return [rainbowText]
  }

  const messages: string[] = []
  let currentPos = 0

  while (currentPos < rainbowText.length) {
    let chunkEnd = currentPos + maxLength
    
    // If we're not at the end and the next character is not a #, 
    // we're in the middle of a colored character, so backtrack
    if (chunkEnd < rainbowText.length && rainbowText[chunkEnd] !== '#') {
      // Find the last # before chunkEnd that starts a valid color code
      while (chunkEnd > currentPos && rainbowText[chunkEnd] !== '#') {
        chunkEnd--
      }
      
      // Verify it's actually a color code (should be followed by 6 hex chars)
      // If not, continue backtracking
      while (chunkEnd > currentPos) {
        if (rainbowText[chunkEnd] === '#' && chunkEnd + 7 <= rainbowText.length) {
          const hexPart = rainbowText.slice(chunkEnd + 1, chunkEnd + 7)
          if (/^[0-9a-f]{6}$/i.test(hexPart)) {
            break
          }
        }
        chunkEnd--
        while (chunkEnd > currentPos && rainbowText[chunkEnd] !== '#') {
          chunkEnd--
        }
      }
    }
    
    // If we couldn't find a safe split point, force split at maxLength
    if (chunkEnd === currentPos) {
      chunkEnd = currentPos + maxLength
    }
    
    messages.push(rainbowText.slice(currentPos, chunkEnd))
    currentPos = chunkEnd
  }

  return messages
}

const MAX_OUTPUT_LENGTH = 300

function App() {
  const [mode, setMode] = useState<'preset' | 'custom' | 'single'>('preset')
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESETS>('rainbow')
  const [customStops, setCustomStops] = useState<ColorStop[]>([
    { position: 0, color: '#ff0000' },
    { position: 1, color: '#0000ff' },
  ])
  const [singleColor, setSingleColor] = useState('#ff0000')
  const [inputText, setInputText] = useState('')
  const [ignoreSpaces, setIgnoreSpaces] = useState(true)
  const [enableSplitting, setEnableSplitting] = useState(false)
  const [copySuccess, setCopySuccess] = useState<number | boolean>(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wwm-rainbow-chat')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.mode) setMode(data.mode)
        if (data.selectedPreset) setSelectedPreset(data.selectedPreset)
        if (data.customStops) setCustomStops(data.customStops)
        if (data.singleColor) setSingleColor(data.singleColor)
        if (data.inputText) setInputText(data.inputText)
        if (data.ignoreSpaces !== undefined) setIgnoreSpaces(data.ignoreSpaces)
        if (data.enableSplitting !== undefined) setEnableSplitting(data.enableSplitting)
      } catch (e) {
        console.error('Failed to load saved data', e)
      }
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      'wwm-rainbow-chat',
      JSON.stringify({
        mode,
        selectedPreset,
        customStops,
        singleColor,
        inputText,
        ignoreSpaces,
        enableSplitting,
      })
    )
  }, [mode, selectedPreset, customStops, singleColor, inputText, ignoreSpaces, enableSplitting])

  const currentStops = useMemo(() => {
    if (mode === 'preset') {
      return PRESETS[selectedPreset]
    } else if (mode === 'custom') {
      return customStops
    } else {
      return [{ position: 0, color: singleColor }]
    }
  }, [mode, selectedPreset, customStops, singleColor])

  const output = useMemo(() => {
    return generateRainbowText(inputText, currentStops, ignoreSpaces)
  }, [inputText, currentStops, ignoreSpaces])

  const messages = useMemo(() => {
    if (enableSplitting) {
      return splitIntoMessages(output, MAX_OUTPUT_LENGTH)
    }
    return [output]
  }, [output, enableSplitting])

  const outputLength = output.length
  const isOverLimit = outputLength > MAX_OUTPUT_LENGTH && !enableSplitting
  const isNearLimit = outputLength > MAX_OUTPUT_LENGTH * 0.9 && !enableSplitting

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    const testOutput = generateRainbowText(newText, currentStops, ignoreSpaces)
    
    // Allow changes if splitting is enabled, or if within limit, or if length is decreasing
    if (enableSplitting || testOutput.length <= MAX_OUTPUT_LENGTH || testOutput.length < output.length) {
      setInputText(newText)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyMessage = async (message: string, index: number) => {
    try {
      await navigator.clipboard.writeText(message)
      setCopySuccess(index)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const addCustomStop = () => {
    const newStop = {
      position: customStops.length > 0 ? 0.5 : 0,
      color: '#ff0000',
    }
    setCustomStops([...customStops, newStop])
  }

  const updateCustomStop = (index: number, updates: Partial<ColorStop>) => {
    const newStops = [...customStops]
    newStops[index] = { ...newStops[index], ...updates }
    setCustomStops(newStops)
  }

  const removeCustomStop = (index: number) => {
    if (customStops.length > 1) {
      setCustomStops(customStops.filter((_, i) => i !== index))
    }
  }

  const previewChars = useMemo(() => {
    if (!inputText) return []
    const chars = inputText.split('')
    const relevantChars = ignoreSpaces ? chars.filter((c) => c !== ' ') : chars
    
    if (relevantChars.length === 0) return []

    let colorIndex = 0
    return chars.map((char, idx) => {
      if (ignoreSpaces && char === ' ') {
        return { char, color: 'transparent', key: `${idx}-${char}` }
      } else {
        const position = colorIndex / Math.max(1, relevantChars.length - 1)
        const color = getColorAtPosition(currentStops, position)
        colorIndex++
        return { char, color, key: `${idx}-${char}-${color}` }
      }
    })
  }, [inputText, currentStops, ignoreSpaces])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 bg-clip-text text-transparent">
            Where Winds Meet
          </h1>
          <h2 className="text-2xl font-semibold">Rainbow Chat Generator</h2>
          <p className="text-gray-400 mt-2">
            Generate colored chat text with per-character hex color prefixes
          </p>
        </header>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Color Mode</h3>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setMode('preset')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'preset'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Preset Gradient
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'custom'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Custom Gradient
            </button>
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'single'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Single Color
            </button>
          </div>

          {mode === 'preset' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Select Preset</label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value as keyof typeof PRESETS)}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(PRESETS).map((preset) => (
                  <option key={preset} value={preset}>
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'custom' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Gradient Stops</label>
                <button
                  onClick={addCustomStop}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium"
                >
                  + Add Stop
                </button>
              </div>
              <div className="space-y-3">
                {customStops.map((stop, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">
                        Position (0-1)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={stop.position}
                        onChange={(e) =>
                          updateCustomStop(index, {
                            position: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) =>
                            updateCustomStop(index, { color: e.target.value })
                          }
                          className="h-10 w-16 bg-gray-700 rounded-lg border border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={stop.color}
                          onChange={(e) =>
                            updateCustomStop(index, { color: e.target.value })
                          }
                          className="flex-1 px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="#ff0000"
                        />
                      </div>
                    </div>
                    {customStops.length > 1 && (
                      <button
                        onClick={() => removeCustomStop(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium mt-5"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'single' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Select Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={singleColor}
                  onChange={(e) => setSingleColor(e.target.value)}
                  className="h-12 w-20 bg-gray-700 rounded-lg border border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={singleColor}
                  onChange={(e) => setSingleColor(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#ff0000"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold">Input Text</h3>
          <textarea
            value={inputText}
            onChange={handleTextChange}
            placeholder="Enter your text here..."
            className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-vertical"
          />
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ignoreSpaces"
                  checked={ignoreSpaces}
                  onChange={(e) => setIgnoreSpaces(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="ignoreSpaces" className="cursor-pointer select-none">
                  Ignore spaces when applying colors
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableSplitting"
                  checked={enableSplitting}
                  onChange={(e) => setEnableSplitting(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="enableSplitting" className="cursor-pointer select-none">
                  Split into multiple messages (300 char limit each)
                </label>
              </div>
            </div>
            <div className={`text-sm font-medium ${
              isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-400'
            }`}>
              {outputLength} characters
              {enableSplitting && outputLength > MAX_OUTPUT_LENGTH && (
                <span className="ml-2 text-blue-400">({messages.length} messages)</span>
              )}
              {isOverLimit && <span className="ml-2 text-red-500">(Limit exceeded!)</span>}
            </div>
          </div>
        </div>

        {inputText && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">Live Preview</h3>
              <div className="bg-gray-900 rounded-lg p-4 min-h-[60px] break-words font-mono text-lg">
                {previewChars.map(({ char, color, key }) => (
                  <span key={key} style={{ color: color === 'transparent' ? 'white' : color }}>
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Output {enableSplitting && messages.length > 1 && `(${messages.length} messages)`}
                </h3>
                {!enableSplitting || messages.length === 1 ? (
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      copySuccess === true
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {copySuccess === true ? '✓ Copied!' : 'Copy to Clipboard'}
                  </button>
                ) : null}
              </div>
              {enableSplitting && messages.length > 1 ? (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-400">
                          Message {index + 1} ({message.length} characters)
                        </h4>
                        <button
                          onClick={() => handleCopyMessage(message, index)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            copySuccess === index
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {copySuccess === index ? '✓ Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4 min-h-[60px] break-all font-mono text-sm">
                        {message}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg p-4 min-h-[60px] break-all font-mono text-sm">
                  {output || <span className="text-gray-500">Output will appear here...</span>}
                </div>
              )}
            </div>
          </>
        )}

        <footer className="text-center text-gray-400 text-sm py-8">
          <p>
            Paste the output into Where Winds Meet chat to see your rainbow text!
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
