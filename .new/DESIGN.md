---
name: Aura Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#ffafd3'
  on-secondary: '#620040'
  secondary-container: '#85145a'
  on-secondary-container: '#ff93c8'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#ffd8e7'
  secondary-fixed-dim: '#ffafd3'
  on-secondary-fixed: '#3d0026'
  on-secondary-fixed-variant: '#85145a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system is engineered for high-growth SaaS and premium technology platforms. It targets a sophisticated audience that values both aesthetic rigor and functional clarity. The brand personality is "Precision-Driven Luxury"—combining the technical excellence of a high-end watch with the effortless usability of a modern digital tool.

The visual style is a fusion of **Minimalism** and **Glassmorphism**, leaning heavily into a refined dark mode. It utilizes expansive whitespace (or "darkspace"), razor-sharp typographic alignment, and subtle luminosity to guide the user's eye toward high-conversion actions. The result is a UI that feels custom-engineered, expensive, and authoritative, intentionally distancing itself from generic, templated aesthetics.

## Colors

The palette is optimized for deep immersion and high contrast. The background uses a sophisticated deep navy-slate (`#0F172A`) rather than pure black to maintain a sense of depth and premium finish. 

The primary indigo acts as the "functional" color, used for primary actions and focus states. The secondary pink is used sparingly as an accent for "delight" moments or high-priority notifications. The tertiary green is reserved for success states and growth metrics. Gradients should be used as subtle background glows (mesh gradients) behind glassmorphic cards to create a sense of light source and dimensionality.

## Typography

This design system uses a high-contrast type scale to establish a dominant visual hierarchy. **Plus Jakarta Sans** provides a modern, geometric foundation for headlines; its tight letter-spacing and heavy weights evoke a custom-branded feel. 

**Outfit** is utilized for body and UI elements, chosen for its exceptional legibility and clean, open counters that complement the geometric nature of the headings. For display text, use "ExtraBold" with negative tracking to create a high-impact, editorial look. Body text should remain "Regular" weight to ensure long-form readability against dark backgrounds. Labels and small UI triggers use "SemiBold" with increased letter spacing and uppercase styling to provide a technical, "engineered" aesthetic.

## Layout & Spacing

The system employs a **Fluid Grid** based on an 8px square rhythm. All margins, paddings, and structural gaps must be multiples of 8. 

On desktop, a 12-column grid with generous 64px side margins creates an "executive" feel with plenty of breathing room. Elements should be grouped into logical "zones" using significant vertical spacing (e.g., 120px between major sections) to reinforce the premium, minimalist narrative. On mobile, the grid shifts to 4 columns with 20px margins, and vertical spacing is condensed to 64px between sections to maintain momentum while scrolling.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Tonal Layers**. In the dark mode environment, background surfaces use the base neutral color. Elevated components (like cards or modals) use a semi-transparent fill with a high-strength backdrop blur (20px+) and a subtle 1px border at 10% white opacity to simulate a glass edge.

Shadows are not used for depth; instead, "Luminous Glows" are preferred. High-priority cards may have a very soft, low-opacity indigo outer glow to signify importance. This creates a technical, futuristic depth that feels light and airy despite the dark color palette.

## Shapes

The design system adopts a **Rounded** shape language (0.5rem / 8px base radius). This specific level of roundness strikes the balance between the "sharpness" of technical tools and the "friendliness" of consumer apps. 

- Large containers and sections use `rounded-xl` (1.5rem) to soften the layout.
- Buttons and input fields use the base `rounded` (0.5rem).
- Small tags and status indicators use a full pill-shape to distinguish them from interactive buttons.

## Components

### Buttons
Primary buttons use the primary indigo fill with white text (Plus Jakarta Sans, Bold). Secondary buttons use a "ghost" style: 1px border with a subtle hover background fill. Both feature a 300ms transition on hover with a slight scale-up (1.02x) for a tactile feel.

### Cards
Cards are the primary content vehicle. They must feature a backdrop blur of 24px, a background of `rgba(255, 255, 255, 0.03)`, and a 1px `white/10` border. Headers within cards should use `headline-md`.

### Input Fields
Inputs utilize a dark, recessed background (`#000000` at 20% opacity) with a `white/10` border. On focus, the border transitions to the primary color with a 2px outer glow. Labels are always positioned above the field using the `label-md` style.

### Chips & Tags
Used for categorization, chips are pill-shaped with a low-opacity version of the accent colors (e.g., `primary/10` background with `primary` text).

### Lists
Lists use generous vertical padding (16px) and are separated by thin `white/5` dividers. Iconography within lists should be "Thin" or "Light" stroke weight to match the premium typography.