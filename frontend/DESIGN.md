# MemoNest Design System

## Brand
- Name: MemoNest
- Logo icon: NotebookPen (Lucide)

## Breakpoints
- Mobile: < 768px (1 column grid)
- Tablet: 768px - 1024px (2 column grid)
- Desktop: > 1024px (3 column grid)

## Colors

### Surfaces
- Page background: #F0F5FF (light blue-white)
- Navbar surface: #FFFFFF
- Card surface: #FFFFFF
- Modal surface: #FFFFFF
- Modal overlay: rgba(0, 0, 0, 0.5)

### Brand
- Brand indigo: #4F46E5 (indigo-600)
- Brand hover: #4338CA (indigo-700)

### Text
- Main text: #111827 (gray-900)
- Secondary text: #6B7280 (gray-500)
- Muted text: #9CA3AF (gray-400)

### Borders & Inputs
- Border color: #E5E7EB (gray-200)
- Input background: #F9FAFB (gray-50)
- Skeleton color: #E5E7EB (gray-200)

### Status Colors
- Active status: #10B981 (emerald-500)
- Archived status: #F59E0B (amber-500)

### Semantic
- Error red: #EF4444 (red-500)
- Error background: #FEF2F2 (red-50)

## Typography
- Font family: Inter (system sans-serif fallback)
- Headings: font-semibold
- Body: font-normal
- Small/Muted: text-sm (14px), text-gray-500

## Spacing
- Navbar height: 64px
- Card padding: 24px
- Grid gap: 24px
- Section padding: 32px 24px
- Modal padding: 24px
- Input padding: 10px 14px

## Border Radii
- Cards: 8px
- Modal: 16px
- Buttons: 8px
- Badges: 9999px (pill)
- Input fields: 8px

## Shadows
- Card: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)
- Card hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)
- Navbar: 0 1px 3px rgba(0, 0, 0, 0.05)
- Modal: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

## Component Specifications

### Navbar
- Position: sticky top-0
- Height: 64px
- Background: white
- Bottom border: 1px solid #E5E7EB
- Logo: NotebookPen icon (22px) + "MemoNest" brand title
- Desktop: All Notes link, Archived link, search, Add Note button, avatar
- Mobile: Collapse secondary nav, keep logo and avatar, show floating FAB

### Note Card
- Width: 100% of grid column
- Padding: 24px
- Background: white
- Border radius: 8px
- Shadow: subtle (card)
- Hover: translateY(-2px), stronger shadow
- Status badge: top left, 6px rounded pill
- Date: top right, text-sm, muted
- Title: font-semibold, text-gray-900
- Content preview: 3 line clamp, text-gray-600
- Action buttons: Pencil, Archive, Trash2 (44x44px tap targets)

### Notes Grid
- Desktop: 3 columns
- Tablet (768-1024px): 2 columns
- Mobile (<768px): 1 column
- Gap: 24px
- Max width: 1200px, centered

### Note Modal (Create/Edit)
- Width: 600px (desktop), 90vw (mobile)
- Max height: 85vh, scrollable
- Border radius: 16px
- Overlay: blurred dark (rgba(0,0,0,0.5), backdrop-blur-sm)
- Header: title + X close button
- Title input: full width, border, focus ring indigo
- Content textarea: full width, min-h-[200px], border, focus ring indigo
- Status select: full width, border, focus ring indigo
- Validation errors: text-red-500, text-sm, below fields, linked with aria-describedby
- Footer: right-aligned, "Discard Changes" (ghost) + "Create Note"/"Save Changes" (indigo primary)
- Focus trapping
- Escape to close
- aria-labelledby on modal

### Delete Note Dialog
- Width: 400px
- Border radius: 16px
- Red accent bar at top (4px, bg-red-500)
- AlertTriangle icon (red)
- Heading: "Delete this note?"
- Warning text: clear destructive message
- Cancel button (ghost) + "Delete Note" (red with Trash2 icon)
- Confirmation required before deletion
- Keyboard accessible

### UI States
- Loading: animated skeleton cards (pulse animation, bg-gray-200)
- Empty: "No notes yet" with illustration/icon, "Create your first note to get started."
- Error: "Sync Interrupted" with AlertCircle icon, error description, "Try Again" button
- No results: "No notes found" for search with no matches
- Disabled: opacity-50, cursor-not-allowed on buttons

## Accessibility
- aria-labels on all icon-only buttons
- 44x44px minimum tap targets
- Visible focus states (ring-2 ring-indigo-500)
- Form labels for all inputs
- Validation text linked with aria-describedby
- Focus trapping in modals
- Escape key to close modals
- Keyboard navigation for all interactive elements
- WCAG AA contrast ratios
- Delete confirmation required before destructive action
