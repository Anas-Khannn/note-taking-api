---
name: MemoNest
version: 1.0.0
platform: Web (Responsive)
breakpoints:
  mobile: 390px
  tablet: 768px
  desktop: 1280px
colors:
  primary: '#4f46e5'
  primary-hover: '#4338ca'
  on-primary: '#ffffff'
  surface: '#f8f9ff'
  surface-bright: '#ffffff'
  surface-container: '#eff4ff'
  on-surface: '#1a1c1e'
  on-surface-variant: '#43474e'
  outline: '#73777f'
  error: '#ba1a1a'
  error-container: '#ffdad6'
  on-error-container: '#410002'
typography:
  font-family: 'Inter, system-ui, sans-serif'
  weights:
    regular: 400
    medium: 500
    semibold: 600
    bold: 700
spacing:
  base: 4px
  container-px: 24px
  section-gap: 32px
roundness:
  small: 4px
  medium: 8px
  large: 16px
  full: 9999px
shadows:
  subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  standard: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
---

# MemoNest Design Specification

This document provides exact technical specifications for the MemoNest note-taking application design, intended for implementation using Next.js and Tailwind CSS.

## 1. Color System

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `page-bg` | `#f8f9ff` | Main application background |
| `navbar-bg` | `#ffffff` | Top navigation bar background |
| `card-surface` | `#ffffff` | Note card background |
| `modal-surface` | `#ffffff` | Modal dialog background |
| `border-subtle` | `#e2e8f0` | General borders and dividers |
| `text-primary` | `#1a1c1e` | Headings and main body text |
| `text-secondary` | `#43474e` | Subheadings and supporting text |
| `text-muted` | `#73777f` | Captions and metadata |
| `brand-indigo` | `#4f46e5` | Primary buttons, brand logo, active states |
| `brand-hover` | `#4338ca` | Hover state for primary actions |
| `status-active-bg` | `#dcfce7` | Background for "Active" status badge |
| `status-active-text` | `#166534` | Text for "Active" status badge |
| `status-archived-bg` | `#f1f5f9` | Background for "Archived" status badge |
| `status-archived-text` | `#475569` | Text for "Archived" status badge |
| `error-red` | `#ba1a1a` | Destructive buttons (Delete), error states |
| `overlay` | `rgba(0, 0, 0, 0.4)` | Modal backdrop |
| `input-bg` | `#eff4ff` | Textarea and input background |
| `skeleton` | `#e2e8f0` | Loading state placeholder color |

## 2. Typography System

| Style | Font Size | Line Height | Weight | Color |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title** | 36px | 1.2 | 700 | `text-primary` |
| **Section Title** | 24px | 1.3 | 600 | `text-primary` |
| **Card Title** | 18px | 1.4 | 600 | `text-primary` |
| **Body Text** | 16px | 1.5 | 400 | `text-secondary` |
| **Metadata** | 14px | 1.4 | 400 | `text-muted` |
| **Button Text** | 14px | 1 | 600 | `on-primary` |
| **Badge Text** | 12px | 1 | 600 | (Variable) |

## 3. Spacing & Sizing

- **Navbar Height:** 64px (Desktop/Mobile)
- **Max Content Width:** 1280px
- **Page Padding:** 24px (Mobile/Tablet), 48px (Desktop)
- **Card Padding:** 24px
- **Grid Gaps:** 24px
- **Button Height:** 40px (Standard), 48px (Large)
- **Icon Size:** 20px (Standard), 18px (In-button)
- **Modal Width:** 600px (Desktop), 90% (Mobile)

## 4. Responsive Layout Rules

| Breakpoint | Note Columns | Navbar Behavior |
| :--- | :--- | :--- |
| **Desktop (>1024px)** | 3 Columns | Full links + Add Note + Avatar |
| **Tablet (768px - 1024px)** | 2 Columns | Search expands, links visible |
| **Mobile (<768px)** | 1 Column | Hamburger menu or icon-only nav |

- **Search:** Persistent rounded input.
- **Add Note:** Fixed bottom-right FAB on mobile; Primary button in navbar on desktop.

## 5. Page Structure

1. **Navbar:** Sticky, white background, shadow-sm.
   - Left: Logo + "MemoNest" title.
   - Center: Nav links (All Notes, Archived).
   - Right: "Add Note" button + Profile Avatar.
2. **Main Header:**
   - Overline: "WORKSPACE" (Indigo, 12px Semibold).
   - Heading: "Your Notes".
   - Supporting: "Capture, organize, and revisit your ideas..."
3. **Controls Row:**
   - Search: Leading icon, rounded-full.
   - Filter: Dropdown labeled "All Notes".
   - Stats: Simple count (e.g., "24 TOTAL").
4. **Notes Grid:** Responsive grid of cards.

## 6. Component Specifications

### Note Card
- **Surface:** White, `roundness.medium`, `shadows.subtle`.
- **Interactions:** Lift by 2px and increase shadow to `shadows.standard` on hover.
- **Structure:**
  - Top: Badge (Left), Date (Right).
  - Middle: Title (Semibold), Body (Clamp to 3 lines).
  - Bottom: Action row (Edit, Archive, Delete) with icon buttons.

### Create/Edit Modal
- **Overlay:** Blurred backdrop, `rgba(0, 0, 0, 0.4)`.
- **Layout:** Header (Title + Close), Body (Fields), Footer (Actions).
- **Inputs:** `roundness.medium`, background `#eff4ff`, border-none, focus-ring brand-indigo.
- **Actions:** "Save Changes" (Primary), "Discard Changes" (Ghost/Secondary).

### Delete Confirmation
- **Width:** 400px.
- **Heading:** "Delete this note?" (Red accent bar on top of modal).
- **Primary Action:** "Delete Note" (Red background, trash icon).

## 7. UI States

- **Loading:** skeleton cards using `animate-pulse`.
- **Empty State:** Large centered illustration, "No notes yet" heading, CTA button.
- **Error State:** Centered "Sync Interrupted" message, Retry button, Error code display.
- **Disabled:** 50% opacity, `cursor-not-allowed`.

## 8. Icons (Lucide Set)
- `NotebookPen`: Logo icon.
- `Plus`: Add action.
- `Search`: Search field.
- `Pencil`: Edit action.
- `Archive`: Archive action.
- `Trash2`: Delete action.
- `X`: Close modal.
- `AlertTriangle`: Delete/Error confirmation.

## 9. Tailwind Mapping

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          bright: '#ffffff',
          container: '#eff4ff',
        }
      },
      borderRadius: {
        'memo-md': '8px',
        'memo-lg': '16px',
      },
      boxShadow: {
        'memo-subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }
    }
  }
}
```

## 10. Accessibility & Implementation Checklist

- [ ] Use `aria-label` for all icon-only buttons (Edit, Delete).
- [ ] Ensure focus trapping is active when modals are open.
- [ ] Minimum tap targets for mobile icons are 44x44px.
- [ ] Color contrast for indigo text on white meets WCAG AA (4.5:1).
- [ ] "Delete" actions must require confirmation modal.
- [ ] Mobile navigation must be accessible via keyboard/swipe.
- [ ] All forms must show validation error text below the input in red.
