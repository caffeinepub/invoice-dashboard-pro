# Invoice Dashboard Pro

## Current State

The application is a fully functional invoice management dashboard with:
- `InvoiceData` model stored in localStorage with fields: id, title, invoiceNumber, date, dueDate, fromCompany/Address/Email, toName/Company/Address, notes, lineItems, subtotal, gst, grandTotal, headerColor, logoDataUrl, logoWidth, logoPosition, columnLabels, gstRate, customColumns
- Single color customization: `headerColor` (hex string, default `#1e3a5f`) applied to header band, table thead, and grand total row
- `ColorPickerPanel`: 6 preset swatches + native `<input type="color">` — controls only `headerColor`
- No document type field — title is freeform editable text only, invoice number prefix hardcoded to `INV-`
- Export and print both call `window.print()`
- All text fields use `EditableText` (contentEditable spans)

## Requested Changes (Diff)

### Add

1. **Extended color theme system**
   - Two additional color fields in `InvoiceData`: `textColor` (default `#ffffff`) and `accentColor` (default `#e2e8f0`)
   - `textColor`: applied to text inside the header band and table header cells
   - `accentColor`: applied to table header background (currently same as `headerColor` — now separate)
   - ColorPickerPanel upgraded to three tabs/sections: "Header BG", "Header Text", "Table Header"
   - Each section has 6 preset swatches + native color input
   - All color changes apply in real-time to the invoice layout
   - All three colors saved per-document in `InvoiceData` and persisted to localStorage
   - Contrast hint shown when text color is too close to background color

2. **Quotation format support**
   - New field `documentType: "invoice" | "quotation"` in `InvoiceData` (default `"invoice"`)
   - `quotationNumber` field (mirrors `invoiceNumber` — shared field, prefix changes dynamically)
   - Toggle button in the action toolbar: "Invoice" / "Quotation" pill/segmented control
   - When type is `"quotation"`:
     - Document title changes to "Quotation" (or whatever the user has typed)
     - "Invoice #" label becomes "Quotation #"
     - Invoice number value prefix shown as `QUO-` for new quotations, `INV-` for invoices (applied to `createEmptyInvoice` for new documents; existing documents preserve their value)
     - "Due Date" label becomes "Valid Until"
     - Dashboard stats differentiate between invoices and quotations
   - Both types support all existing features: editing, color customization, logo, custom columns, save, print, export

3. **Saved document list improvements**
   - Show a "QUO" / "INV" badge on saved document cards to distinguish type
   - Filter/tabs in SavedInvoicesPanel: All / Invoices / Quotations

### Modify

- `InvoiceData` interface: add `textColor`, `accentColor`, `documentType` fields
- `createEmptyInvoice()`: populate new fields with defaults
- `backfillInvoice()`: handle missing new fields gracefully for old saved data
- `ColorPickerPanel`: expand from single color to three-color picker with labeled sections
- Invoice header band: apply `textColor` to all text inside (currently hardcoded `text-white`)
- Table `<thead>`: use `accentColor` for background (was `headerColor`), use `textColor` for text
- Grand Total row: keep `headerColor` background, use `textColor` for text
- Action toolbar: add Invoice/Quotation type toggle (segmented control, no-print)
- "Invoice #" static label in header: conditionally render "Invoice #" vs "Quotation #"
- "Due Date" label: conditionally render "Due Date" vs "Valid Until"
- Dashboard stats: count and display invoices vs quotations separately
- `handleSave` toast message: say "Invoice saved" or "Quotation saved" based on type
- SavedInvoicesPanel: add type badge and filter tabs

### Remove

- Nothing removed; all existing features preserved

## Implementation Plan

1. Extend `InvoiceData` interface with `textColor`, `accentColor`, `documentType` fields
2. Update `createEmptyInvoice()` and `backfillInvoice()` with new field defaults
3. Upgrade `ColorPickerPanel` to support three separate color pickers in labeled accordion/tabs
4. Update invoice header band to use `textColor` for all text (replace hardcoded `text-white`)
5. Update table thead to use `accentColor` for background and `textColor` for text
6. Update grand total row to use `headerColor` background and `textColor` for text
7. Add Invoice/Quotation type toggle (segmented `<Button>` pair) to the action toolbar
8. Conditionally render "Invoice #" vs "Quotation #" in header based on `documentType`
9. Conditionally render "Due Date" vs "Valid Until" based on `documentType`
10. Update `createEmptyInvoice()` to prefix invoice number `INV-` vs `QUO-` based on type (new docs only)
11. Add type badge (INV/QUO) to SavedInvoicesPanel cards
12. Add filter tabs (All / Invoices / Quotations) to SavedInvoicesPanel
13. Update Dashboard stats to separate invoice count vs quotation count
14. Update toast messages to be type-aware
15. Validate, typecheck, and build
