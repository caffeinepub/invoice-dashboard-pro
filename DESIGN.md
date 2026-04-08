# Design Brief: Kashaya Saffron/Orange Theme

## Aesthetic
Premium, warm, distinctly Indian-inspired. Kashaya saffron evokes trust, prosperity, and craftsmanship. Applied intentionally to interactive moments (header, buttons, highlights) while keeping content backgrounds clean and neutral.

## Palette

| Token | OKLCH | Hex | Usage |
|-------|-------|-----|-------|
| Primary (Kashaya) | 0.55 0.24 41 | #FF6F00 | Header band, primary buttons, active states, focus rings |
| Secondary (Warm) | 0.68 0.16 41 | #FFA726 | Hover states, secondary buttons, accents |
| Light (Pale Saffron) | 0.88 0.09 41 | #FFE0B2 | Table headers, light backgrounds, muted sections |
| Foreground | 0.17 0.016 248 | #1a1a2e | Dark text on all light backgrounds for AA+ contrast |
| Border | 0.88 0.09 41 | #FFE0B2 | Borders, dividers, subtle separators |
| Background | 0.975 0.003 248 | #fdfcfd | Card and page backgrounds |

## Typography
- **Display**: PlusJakartaSans (modern, energetic)
- **Body**: GeneralSans (clean, readable)
- **Mono**: System fallback (code/technical)

## Structural Zones

| Zone | Background | Border | Foreground | Detail |
|------|-----------|--------|-----------|--------|
| Header | Kashaya Primary (0.55 0.24 41) | None | White (0.99 0 0) | Orange band, white text, logo upload zone |
| Buttons | Kashaya Primary → Secondary on hover | Light Kashaya | White text | Orange with white, crisp interaction |
| Table Headers | Light Kashaya (0.88 0.09 41) | Light Kashaya border | Dark text | Pale orange rows, high readability |
| Totals Section | Card (white) | Kashaya Primary border | Dark text | Right-aligned, orange accent border, bold total row |
| Input Fields | Card (white) | Light Kashaya | Dark text | Editable cells with orange focus ring |
| Toolbar | Background (neutral) | Kashaya Primary | Dark text | Action buttons in Kashaya orange |

## Component Patterns
- **Editable Cells**: Orange focus ring (0.55 0.24 41), light orange background on focus
- **Color Picker**: Presets include Kashaya orange as primary option alongside existing 5 presets
- **Logo Zone**: Dashed upload area in header with resize/position controls (hidden on print)
- **SGST/CGST Display**: Read-only, auto-calculated rows in totals section with Kashaya accent
- **Print Output**: Exact color rendering with -webkit-print-color-adjust: exact; full Kashaya theme preserved

## Spacing & Rhythm
- Card padding: 1.5rem (24px)
- Table padding: 0.75rem (12px)
- Header height: 4rem (64px)
- Gap between elements: 1rem (16px)
- Responsive: stacked on mobile, horizontal grid on desktop

## Elevation & Depth
- **Header**: No shadow (flat band)
- **Cards**: Subtle shadow `0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)`
- **Invoice Container**: Enhanced shadow `0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06)`
- **Button Primary**: Kashaya-tinted shadow `0 2px 8px oklch(0.55 0.24 41 / 0.3)`
- **Focus States**: 4px box-shadow halo in Kashaya with 10% opacity

## Motion & Interaction
- Focus transitions smooth via CSS (no explicit animation class needed)
- Button hover: color shift from primary to secondary orange
- Cell edit: 150ms fade-in to orange focus ring
- Tooltip/popover: fade-in with no motion blur

## Signature Detail
**Kashaya Saffron as Strategic Accent**: Rather than applying orange uniformly, it appears on interactive surfaces (header, buttons, focus rings, table headers) while neutral backgrounds maintain sophistication. The result is a warm, premium aesthetic that feels distinctly Indian without pastiche — the orange earns its place through function, not decoration.

## Accessibility
- **Contrast**: Dark text (0.17 L) on light Kashaya (0.88 L) = 0.71 lightness difference (exceeds AA+)
- **Focus Indicators**: 2px orange outline + 4px halo, 4px offset for visibility
- **Color Independence**: Active states use outline + background change, not color alone
- **Print**: Forced color rendering preserves orange theme in PDF/print output

## Constraints
- No due date field visible (removed from all views)
- SGST/CGST auto-calculated and read-only
- Kashaya theme applied consistently to header, buttons, table highlights, totals, and borders
- Dark text required on all light Kashaya backgrounds
- Print and PDF export must reflect all theme changes
