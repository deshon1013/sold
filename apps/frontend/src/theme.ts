import { createTheme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

// Same red as the logo/favicon (public/favicon.png).
const BRAND_RED = '#d81f1f'

// Charcoal is also used (as an rgb triplet) below to tint elevation shadows
// instead of MUI's default pure black, which reads harsher. Dark mode uses
// this same charcoal as its page background, per the brand -- and switches
// the shadow tint to white, since a charcoal shadow is invisible against a
// charcoal page.
export const CHARCOAL = '#1f2328'
const SHADOW_TINT_LIGHT = '31, 35, 40'
export const SHADOW_TINT_DARK = '255, 255, 255'

// MUI computes its 25-level `shadows` array from plain black rgba values.
// Re-tint every level so anything elevation-based (Card, Paper, contained
// Buttons, ...) picks up the softer/mode-appropriate shadow automatically.
// `opacityScale` dims the result -- a white shadow reads much brighter than
// a black one at the same alpha, so dark mode scales it down.
function buildShadows(tint: string, opacityScale = 1) {
  return createTheme().shadows.map((shadow) => {
    if (shadow === 'none') return shadow
    return shadow.replace(/rgba\(0,\s*0,\s*0,\s*([0-9.]+)\)/g, (_match, alpha: string) => {
      const scaledAlpha = (parseFloat(alpha) * opacityScale).toFixed(3)
      return `rgba(${tint}, ${scaledAlpha})`
    })
  }) as ReturnType<typeof createTheme>['shadows']
}

export function getTheme(mode: PaletteMode) {
  // MUI's createTheme checks for the *presence* of `components`, not
  // whether it's truthy -- passing `components: undefined` crashes inside
  // its merge logic. Build the overrides separately and only spread the key
  // in when there's actually something to override.
  const darkComponents =
    mode === 'dark'
      ? {
          components: {
            // The default focused outline/label color comes from
            // primary.main (our brand red) -- swap it for white in dark mode instead.
            MuiOutlinedInput: {
              styleOverrides: {
                root: {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffffff',
                  },
                },
              },
            },
            MuiInputLabel: {
              styleOverrides: {
                root: {
                  '&.Mui-focused': {
                    color: '#ffffff',
                  },
                },
              },
            },
          },
        }
      : {}

  return createTheme({
    palette: {
      mode,
      primary: {
        main: BRAND_RED,
      },
      background:
        mode === 'dark'
          ? {
              default: CHARCOAL,
              // A touch lighter than the page itself so cards/surfaces still stand out.
              paper: '#2a2e35',
            }
          : {
              // Slightly warm off-white for the page -- easier on the eyes
              // than stark white, and lets white cards/surfaces stand out.
              default: '#f7f5f2',
              paper: '#ffffff',
            },
    },
    shape: {
      borderRadius: 10,
    },
    shadows:
      mode === 'dark' ? buildShadows(SHADOW_TINT_DARK, 0.35) : buildShadows(SHADOW_TINT_LIGHT),
    ...darkComponents,
  })
}
