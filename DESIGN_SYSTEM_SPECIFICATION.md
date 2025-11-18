# CrowdUp Design System Specification

Based on the Figma design assets analysis, this document defines the complete design system for CrowdUp.

## Color Palette

### Primary Colors
- **Brand Orange Gradient**: `linear-gradient(90deg, #FF992B 0%, #FF8400 100%)`
  - Start: `#FF992B`
  - End: `#FF8400`
  - Usage: Logo, primary CTAs, active states, branding elements

### Neutral Colors
- **Black/Text Primary**: `#020202` - Main text, headers
- **Gray Navigation Pill**: `#909090` - Navigation container background
- **Icon Inactive**: `#717182` - Inactive navigation icons
- **Background Semi-transparent**: `#E1E1E1` at 30% opacity - Glassmorphic navbar
- **White**: `#FFFFFF` - Text on colored backgrounds, card backgrounds

### Semantic Colors
- **Error/Notification**: `#FF0000` (red-500) - Notification badges
- **Active State Background**: `#D1D1D1` (gray-300) - Active navigation buttons
- **Hover State Background**: `#E5E5E5` (gray-200) - Hover effects

## Typography

### Font Families
- **Sans Serif**: System font stack (likely Geist Sans based on globals.css)
- **Display**: Bold weight for "CrowdUp" branding

### Text Styles

#### Logo/Brand
- **"Crowd"**: 
  - Size: `text-2xl` (24px)
  - Weight: `font-bold` (700)
  - Color: `#020202`
  
- **"Up"**: 
  - Size: `text-2xl` (24px)
  - Weight: `font-bold` (700)
  - Color: Brand Orange Gradient

#### Navigation & UI
- **User Display Name**: 
  - Size: `text-sm` (14px)
  - Weight: `font-semibold` (600)
  - Color: `#020202` (gray-900)

- **Username/Secondary**: 
  - Size: `text-xs` (12px)
  - Weight: `normal` (400)
  - Color: `#717182` (gray-500)

## Spacing System

### Component Spacing
- **Navbar Padding Horizontal**: `px-8` (32px)
- **Navbar Padding Vertical**: `py-3.5` (14px)
- **Navigation Pill Padding Horizontal**: `px-6` (24px)
- **Navigation Pill Padding Vertical**: `py-2.5` (10px)
- **Icon Gap in Nav**: `gap-4` (16px)
- **Logo Elements Gap**: `gap-2` (8px)

### Layout
- **Fixed Top Offset**: `top-4` (16px)
- **Max Width**: `max-w-7xl` (1280px)
- **Container Width**: `w-[95%]`

## Glassmorphism Effects

### Navbar Glassmorphism
```css
backdrop-filter: blur(5.51px);
background: rgba(225, 225, 225, 0.3);
border-radius: 20px;
```

**Tailwind Implementation:**
```tsx
className="backdrop-blur-[5.51px] bg-[#E1E1E1]/30 rounded-2xl"
```

### Scroll State Variation
**Scrolled State:**
```tsx
className="bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5"
```

**Default State:**
```tsx
className="bg-[#E1E1E1]/30 backdrop-blur-[5.51px] shadow-md"
```

## Shadow Specifications

### Navbar Shadow
- **Default**: `shadow-md` (medium shadow)
- **Scrolled**: `shadow-lg shadow-black/5` (large shadow with 5% black)

### Navigation Pill Shadow
```css
filter: drop-shadow(0 0 28px rgba(144, 144, 144, 1));
/* Intense shadow for the navigation container */
```

**Tailwind Implementation:**
```tsx
className="shadow-[0_0_28px_rgba(144,144,144,1)]"
```

### Logo Icon Shadow
```css
box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
/* Orange glow effect */
```

**Tailwind Implementation:**
```tsx
className="shadow-[0_0_30px_rgba(255,133,0,0.3)]"
```

### Primary Button Shadow
```tsx
className="shadow-lg shadow-orange-500/30"
```

## Border Radius Standards

### Components
- **Navbar**: `rounded-2xl` (20px)
- **Navigation Pill**: `rounded-2xl` (20px)
- **Navigation Icons**: `rounded-xl` (12px)
- **Logo Icon**: `rounded-xl` (12px)
- **Filter Buttons**: `rounded-[15px]` (15px)
- **Cards/General**: `rounded-xl` (12px)

## Component Styling Guidelines

### Header/Navbar Component

#### Container
```tsx
<header className={`
  fixed top-4 left-1/2 -translate-x-1/2 z-50 
  w-[95%] max-w-7xl rounded-2xl
  transition-all duration-300
  ${scrolled 
    ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5"
    : "bg-[#E1E1E1]/30 backdrop-blur-[5.51px] shadow-md"
  }
`}>
```

#### Navigation Pill
```tsx
<nav className="
  flex items-center gap-4 
  rounded-2xl bg-[#909090] 
  px-6 py-2.5 
  shadow-[0_0_28px_rgba(144,144,144,0.6)]
">
```

#### Navigation Icon Button States

**Default/Inactive:**
```tsx
<Button className="
  rounded-xl h-10 w-10
  hover:bg-[#808080] hover:scale-105
  transition-all
">
  <Icon className="h-5 w-5 text-[#717182]" />
</Button>
```

**Active:**
```tsx
<Button className="
  rounded-xl h-10 w-10
  bg-[#808080] text-white
  hover:bg-[#707070]
  transition-all
">
  <Icon className="h-5 w-5" />
</Button>
```

**Primary Action (Plus Icon):**
```tsx
<Button className="
  rounded-xl h-10 w-10
  bg-gradient-to-r from-[#FF992B] to-[#FF8400]
  text-white hover:scale-105
  shadow-lg shadow-orange-500/30
  transition-all
">
  <Plus className="h-5 w-5" />
</Button>
```

### Logo Component

```tsx
<div className="flex items-center gap-2">
  <div className="flex items-center gap-1">
    <span className="text-2xl font-bold text-[#020202]">Crowd</span>
    <span className="text-2xl font-bold bg-gradient-to-r from-[#FF992B] to-[#FF8400] bg-clip-text text-transparent">
      Up
    </span>
  </div>
  <div className="
    flex h-10 w-10 items-center justify-center 
    rounded-xl bg-gradient-to-br from-[#FF992B] to-[#FF8400] 
    shadow-[0_0_30px_rgba(255,133,0,0.3)]
    transition-transform hover:scale-110
  ">
    <UserGroupIcon className="h-6 w-6 text-white" />
  </div>
</div>
```

### Button Styles

#### Primary Button
```tsx
<Button className="
  rounded-xl
  bg-gradient-to-r from-[#FF992B] to-[#FF8400]
  text-white
  hover:from-[#FF8400] hover:to-[#FF7300]
  shadow-lg shadow-orange-500/30
  transition-all hover:scale-105
">
  Sign In
</Button>
```

#### Secondary/Ghost Button
```tsx
<Button className="
  rounded-xl
  hover:bg-gray-100
  transition-all
">
  Action
</Button>
```

### Avatar Component
```tsx
<Avatar className="
  h-9 w-9 
  bg-gradient-to-br from-[#FF992B] to-[#FF8400] 
  ring-2 ring-orange-200 
  transition-all hover:ring-4
">
  <AvatarFallback className="
    bg-gradient-to-br from-[#FF992B] to-[#FF8400] 
    text-white font-semibold
  ">
    {initial}
  </AvatarFallback>
</Avatar>
```

### Notification Badge
```tsx
<span className="
  absolute top-1 right-1 
  h-2 w-2 
  bg-red-500 rounded-full
" />
```

## Animation & Transitions

### Standard Transitions
- **Duration**: `transition-all duration-300`
- **Hover Scale**: `hover:scale-105` (5% increase)
- **Logo Icon Scale**: `hover:scale-110` (10% increase)

### Interaction States
- **Hover**: Scale up slightly + color shift
- **Active**: Darker background, maintained scale
- **Focus**: Ring outline (standard Tailwind focus-visible)

## Accessibility Guidelines

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- White text on orange gradient: ✓ Passes
- Black text on white: ✓ Passes
- Icons on gray pill: Ensure sufficient contrast

### Interactive Elements
- Minimum touch target: 40x40px (current: 10 = 40px ✓)
- Clear focus indicators on keyboard navigation
- Semantic HTML for screen readers

### Motion
- Respect `prefers-reduced-motion` media query
- All animations should be disableable

## Implementation Notes

### Custom Tailwind Extensions Needed

Add to `tailwind.config.js` or use inline:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'crowdup-orange-start': '#FF992B',
        'crowdup-orange-end': '#FF8400',
        'crowdup-nav-bg': '#909090',
        'crowdup-icon-inactive': '#717182',
        'crowdup-glass': '#E1E1E1',
      },
      backdropBlur: {
        '5.51': '5.51px',
      },
      boxShadow: {
        'nav-pill': '0 0 28px rgba(144, 144, 144, 0.6)',
        'logo-glow': '0 0 30px rgba(255, 133, 0, 0.3)',
      }
    }
  }
}
```

### CSS Custom Properties Alternative

```css
:root {
  --color-orange-start: #FF992B;
  --color-orange-end: #FF8400;
  --color-nav-bg: #909090;
  --color-icon-inactive: #717182;
  --blur-glass: 5.51px;
}
```

## Design Tokens Summary

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-2xl` | 20px | Navbar, Navigation Pill |
| `--radius-xl` | 12px | Buttons, Icons, Cards |
| `--blur-glass` | 5.51px | Glassmorphism effect |
| `--shadow-nav` | `0 0 28px rgba(144,144,144,0.6)` | Navigation pill |
| `--shadow-glow` | `0 0 30px rgba(255,133,0,0.3)` | Logo icon |
| `--gradient-primary` | `linear-gradient(90deg, #FF992B 0%, #FF8400 100%)` | Primary elements |
| `--spacing-nav-h` | 32px (2rem) | Navbar horizontal padding |
| `--spacing-nav-v` | 14px (0.875rem) | Navbar vertical padding |

## Browser Support

- **Backdrop Filter**: Chrome 76+, Safari 9+, Firefox 103+
- **Gradient Background**: All modern browsers
- **CSS Custom Properties**: All modern browsers
- **Flexbox/Grid**: All modern browsers

For older browsers, provide fallback:
```css
@supports not (backdrop-filter: blur(5.51px)) {
  .navbar {
    background: rgba(225, 225, 225, 0.9);
  }
}
```

## Version History

- **v1.0** (2025-11-18): Initial design system specification based on Figma designs
