import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlignLeft,
  AlignRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FilePlus,
  FileText,
  ImagePlus,
  LayoutDashboard,
  Menu,
  Palette,
  Plus,
  Printer,
  Receipt,
  Save,
  Settings,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface CustomColumn {
  id: string;
  label: string;
  insertAfter: "description" | "qty" | "rate";
  values: Record<string, string>;
}

interface InvoiceData {
  id: string;
  title: string;
  invoiceNumber: string;
  date: string;
  fromCompany: string;
  fromAddress: string;
  fromEmail: string;
  toName: string;
  toCompany: string;
  toAddress: string;
  notes: string;
  lineItems: LineItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  grandTotal: number;
  headerColor: string;
  textColor: string;
  accentColor: string;
  documentType: "invoice" | "quotation";
  logoDataUrl: string;
  logoWidth: number;
  logoPosition: "left" | "right";
  columnLabels: {
    description: string;
    qty: string;
    rate: string;
    amount: string;
  };
  customColumns: CustomColumn[];
}

type View = "dashboard" | "invoice" | "saved" | "settings";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function createEmptyInvoice(): InvoiceData {
  const lineItems = [
    {
      id: generateId(),
      description: "Web Design & Development",
      quantity: 1,
      rate: 50000,
      amount: 50000,
    },
    {
      id: generateId(),
      description: "SEO Optimization Package",
      quantity: 3,
      rate: 8500,
      amount: 25500,
    },
    {
      id: generateId(),
      description: "Monthly Maintenance Support",
      quantity: 2,
      rate: 12000,
      amount: 24000,
    },
  ];
  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const sgst = Math.round(subtotal * 0.09 * 100) / 100;
  const cgst = Math.round(subtotal * 0.09 * 100) / 100;
  return {
    id: generateId(),
    title: "Invoice",
    invoiceNumber: `INV-${String(Math.floor(Math.random() * 900) + 100)}`,
    date: todayStr(),
    fromCompany: "Your Company Name",
    fromAddress: "123 Business Street, Mumbai, Maharashtra 400001",
    fromEmail: "billing@yourcompany.com",
    toName: "Client Name",
    toCompany: "Client Company Ltd.",
    toAddress: "456 Client Avenue, Delhi, Delhi 110001",
    notes: "Payment due within 30 days. Bank transfer preferred.",
    lineItems,
    subtotal,
    sgst,
    cgst,
    grandTotal: subtotal + sgst + cgst,
    headerColor: "#FF6F00",
    textColor: "#ffffff",
    accentColor: "#FFA726",
    documentType: "invoice" as const,
    logoDataUrl: "",
    logoWidth: 80,
    logoPosition: "left",
    columnLabels: {
      description: "Description",
      qty: "Qty",
      rate: "Rate (₹)",
      amount: "Amount (₹)",
    },
    customColumns: [],
  };
}

function recalcTotals(invoice: InvoiceData): InvoiceData {
  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const sgst = Math.round(subtotal * 0.09 * 100) / 100;
  const cgst = Math.round(subtotal * 0.09 * 100) / 100;
  const grandTotal = subtotal + sgst + cgst;
  return { ...invoice, subtotal, sgst, cgst, grandTotal };
}

// ─── EditableText ───────────────────────────────────────────────────────────────

interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
  "data-ocid"?: string;
}

function EditableText({
  value,
  onChange,
  className = "",
  style,
  placeholder = "Click to edit",
  tag: Tag = "span",
  "data-ocid": ocid,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (ref.current && !focused) {
      ref.current.textContent = value;
    }
  }, [value, focused]);

  const handleInput = useCallback(() => {
    if (ref.current) {
      onChange(ref.current.textContent ?? "");
    }
  }, [onChange]);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && Tag !== "p") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`cell-editable editable-focus ${className}`}
      style={style}
      data-placeholder={placeholder}
      data-ocid={ocid}
    />
  );
}

// ─── EditableCell ───────────────────────────────────────────────────────────────

interface EditableCellProps {
  value: string;
  onCommit: (val: string) => void;
  className?: string;
  placeholder?: string;
  "data-ocid"?: string;
}

function EditableCell({
  value,
  onCommit,
  className = "",
  placeholder = "",
  "data-ocid": ocid,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onCommit(draft);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`w-full bg-orange-50 rounded px-1.5 py-0.5 outline-none ring-2 ring-orange-400 ring-offset-1 border-0 text-sm ${className}`}
        data-ocid={ocid}
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`cursor-text block w-full text-left text-sm hover:bg-orange-50/60 rounded px-0.5 transition-colors ${className}`}
      data-ocid={ocid}
    >
      {value || (
        <span className="text-muted-foreground italic">{placeholder}</span>
      )}
    </button>
  );
}

// ─── EditableTh ─────────────────────────────────────────────────────────────────

interface EditableThProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  onDelete?: () => void;
  textColor?: string;
}

function EditableTh({
  value,
  onChange,
  className = "",
  onDelete,
  textColor = "#ffffff",
}: EditableThProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onChange(draft);
  };

  return (
    <th className={`relative group ${className}`}>
      <div className="flex items-center gap-1 justify-inherit">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(value);
                setEditing(false);
              }
            }}
            className="bg-white/20 outline-none ring-2 ring-white/60 rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide w-full"
            style={{ color: textColor }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="cursor-text text-xs font-semibold uppercase tracking-wide hover:opacity-80 transition-opacity"
            style={{ color: textColor }}
          >
            {value}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="no-print opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 rounded hover:bg-white/20"
            style={{ color: `${textColor}99` }}
            title="Remove column"
          >
            <X size={10} />
          </button>
        )}
      </div>
    </th>
  );
}

// ─── ColorPickerPanel ───────────────────────────────────────────────────────────

const PRESET_BG_COLORS = [
  { label: "Kashaya", hex: "#FF6F00" },
  { label: "Amber", hex: "#FFA726" },
  { label: "Deep Orange", hex: "#E65100" },
  { label: "Burnt", hex: "#BF360C" },
  { label: "Warm Amber", hex: "#FF8F00" },
  { label: "Gold", hex: "#FFD54F" },
];

const PRESET_TEXT_COLORS = [
  { label: "White", hex: "#ffffff" },
  { label: "Light Gray", hex: "#e2e8f0" },
  { label: "Warm Cream", hex: "#fef3c7" },
  { label: "Light Blue", hex: "#bfdbfe" },
  { label: "Dark Gray", hex: "#374151" },
  { label: "Black", hex: "#111827" },
];

interface ColorPickerPanelProps {
  headerColor: string;
  textColor: string;
  accentColor: string;
  onHeaderColorChange: (hex: string) => void;
  onTextColorChange: (hex: string) => void;
  onAccentColorChange: (hex: string) => void;
  onClose: () => void;
}

function ColorSection({
  label,
  value,
  presets,
  onChange,
}: {
  label: string;
  value: string;
  presets: { label: string; hex: string }[];
  onChange: (hex: string) => void;
}) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-foreground mb-2">{label}</p>
      <div className="flex gap-1.5 mb-2 flex-wrap">
        {presets.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={() => onChange(c.hex)}
            title={c.label}
            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
              value === c.hex ? "border-primary scale-110" : "border-slate-200"
            }`}
            style={{ background: c.hex }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-7 rounded cursor-pointer border border-border p-0.5 flex-shrink-0"
        />
        <span className="text-xs font-mono text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

function ColorPickerPanel({
  headerColor,
  textColor,
  accentColor,
  onHeaderColorChange,
  onTextColorChange,
  onAccentColorChange,
  onClose,
}: ColorPickerPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full right-0 mt-2 z-50 bg-white border border-border rounded-xl shadow-invoice p-4 w-64"
      data-ocid="header.color_picker"
      style={{ maxHeight: "420px", overflowY: "auto" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Palette size={12} />
          Color Theme
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 rounded hover:bg-muted"
        >
          <X size={12} className="text-muted-foreground" />
        </button>
      </div>

      <ColorSection
        label="Header Background"
        value={headerColor}
        presets={PRESET_BG_COLORS}
        onChange={onHeaderColorChange}
      />

      <div className="border-t border-border/50 mb-4" />

      <ColorSection
        label="Text Color"
        value={textColor}
        presets={PRESET_TEXT_COLORS}
        onChange={onTextColorChange}
      />

      <div className="border-t border-border/50 mb-4" />

      <ColorSection
        label="Table Header"
        value={accentColor}
        presets={PRESET_BG_COLORS}
        onChange={onAccentColorChange}
      />
    </motion.div>
  );
}

// ─── LogoArea ───────────────────────────────────────────────────────────────────

interface LogoAreaProps {
  logoDataUrl: string;
  logoWidth: number;
  logoPosition: "left" | "right";
  onLogoUpload: (dataUrl: string) => void;
  onLogoRemove: () => void;
  onWidthChange: (w: number) => void;
  onPositionToggle: () => void;
}

function LogoArea({
  logoDataUrl,
  logoWidth,
  logoPosition,
  onLogoUpload,
  onLogoRemove,
  onWidthChange,
  onPositionToggle,
}: LogoAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") onLogoUpload(result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!logoDataUrl) {
    return (
      <div className="no-print">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-white/30 text-white/70 hover:border-white/60 hover:text-white transition-all text-xs"
          data-ocid="invoice.logo_upload_button"
          title="Upload logo"
        >
          <ImagePlus size={14} />
          <span>Upload Logo</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <img
        src={logoDataUrl}
        alt="Company logo"
        style={{
          width: `${logoWidth}px`,
          maxHeight: "80px",
          objectFit: "contain",
        }}
        className="rounded"
      />
      <div className="no-print flex items-center gap-2 flex-wrap">
        <Slider
          min={40}
          max={200}
          step={5}
          value={[logoWidth]}
          onValueChange={([v]) => onWidthChange(v)}
          className="w-24 h-1"
        />
        <span className="text-white/60 text-xs">{logoWidth}px</span>
        <button
          type="button"
          onClick={onPositionToggle}
          className="p-1 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          title={`Move to ${logoPosition === "left" ? "right" : "left"}`}
        >
          {logoPosition === "left" ? (
            <AlignRight size={12} />
          ) : (
            <AlignLeft size={12} />
          )}
        </button>
        <button
          type="button"
          onClick={onLogoRemove}
          className="p-1 rounded hover:bg-red-500/30 text-white/60 hover:text-white transition-colors"
          title="Remove logo"
          data-ocid="invoice.logo_remove_button"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── LineItemRow ────────────────────────────────────────────────────────────────

interface LineItemRowProps {
  item: LineItem;
  index: number;
  customColumns: CustomColumn[];
  onUpdate: (id: string, field: keyof LineItem, value: string | number) => void;
  onDelete: (id: string) => void;
  onCustomCellUpdate: (colId: string, rowId: string, value: string) => void;
}

function LineItemRow({
  item,
  index,
  customColumns,
  onUpdate,
  onDelete,
  onCustomCellUpdate,
}: LineItemRowProps) {
  const customAfter = (position: CustomColumn["insertAfter"]) =>
    customColumns.filter((c) => c.insertAfter === position);

  return (
    <tr
      className="group border-b border-border hover:bg-orange-50/40 transition-colors"
      data-ocid={`lineitems.item.${index + 1}`}
    >
      <td className="py-3 px-4 text-center text-muted-foreground text-sm font-mono">
        {index + 1}
      </td>
      <td className="py-3 px-4">
        <EditableCell
          value={item.description}
          onCommit={(v) => onUpdate(item.id, "description", v)}
          placeholder="Item description"
          data-ocid={`lineitems.input.${index + 1}`}
        />
      </td>
      {customAfter("description").map((col) => (
        <td key={col.id} className="py-3 px-4">
          <EditableCell
            value={col.values[item.id] ?? ""}
            onCommit={(v) => onCustomCellUpdate(col.id, item.id, v)}
            placeholder="—"
          />
        </td>
      ))}
      <td className="py-3 px-4 text-right">
        <EditableCell
          value={String(item.quantity)}
          onCommit={(v) => {
            const n = Number.parseFloat(v.replace(/[^0-9.]/g, "")) || 0;
            onUpdate(item.id, "quantity", n);
          }}
          placeholder="1"
          className="text-right font-mono"
          data-ocid={`lineitems.qty.${index + 1}`}
        />
      </td>
      {customAfter("qty").map((col) => (
        <td key={col.id} className="py-3 px-4">
          <EditableCell
            value={col.values[item.id] ?? ""}
            onCommit={(v) => onCustomCellUpdate(col.id, item.id, v)}
            placeholder="—"
          />
        </td>
      ))}
      <td className="py-3 px-4 text-right">
        <EditableCell
          value={String(item.rate)}
          onCommit={(v) => {
            const n = Number.parseFloat(v.replace(/[^0-9.]/g, "")) || 0;
            onUpdate(item.id, "rate", n);
          }}
          placeholder="0.00"
          className="text-right font-mono"
          data-ocid={`lineitems.rate.${index + 1}`}
        />
      </td>
      {customAfter("rate").map((col) => (
        <td key={col.id} className="py-3 px-4">
          <EditableCell
            value={col.values[item.id] ?? ""}
            onCommit={(v) => onCustomCellUpdate(col.id, item.id, v)}
            placeholder="—"
          />
        </td>
      ))}
      <td className="py-3 px-4 text-right">
        <span className="text-sm font-medium font-mono text-foreground">
          {formatCurrency(item.amount)}
        </span>
      </td>
      <td className="py-3 px-3 text-center no-print">
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-50 hover:text-red-500 text-muted-foreground"
          title="Delete row"
          data-ocid={`lineitems.delete_button.${index + 1}`}
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

// ─── AddColumnDialog ────────────────────────────────────────────────────────────

interface AddColumnDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (label: string, insertAfter: CustomColumn["insertAfter"]) => void;
}

function AddColumnDialog({ open, onClose, onAdd }: AddColumnDialogProps) {
  const [label, setLabel] = useState("");
  const [insertAfter, setInsertAfter] =
    useState<CustomColumn["insertAfter"]>("description");

  const handleSubmit = () => {
    if (!label.trim()) return;
    onAdd(label.trim(), insertAfter);
    setLabel("");
    setInsertAfter("description");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-sm"
        data-ocid="lineitems.add_column_dialog"
      >
        <DialogHeader>
          <DialogTitle>Add Custom Column</DialogTitle>
          <DialogDescription>
            Enter a column name and where to insert it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="col-label">Column Name</Label>
            <Input
              id="col-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Unit, SKU, Tax %"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              data-ocid="lineitems.column_name_input"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Insert After</Label>
            <div className="flex gap-2 flex-wrap">
              {(["description", "qty", "rate"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setInsertAfter(pos)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                    insertAfter === pos
                      ? "bg-primary text-white border-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  {pos === "description"
                    ? "Description"
                    : pos === "qty"
                      ? "Qty"
                      : "Rate"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="lineitems.add_column_cancel_button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!label.trim()}
            data-ocid="lineitems.add_column_confirm_button"
          >
            Add Column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── InvoiceEditor ──────────────────────────────────────────────────────────────

interface InvoiceEditorProps {
  invoice: InvoiceData;
  onUpdate: (updated: InvoiceData) => void;
  onSave: () => void;
  onExportPDF: () => void;
  onPrint: () => void;
  onNewInvoice: () => void;
  isSaving: boolean;
}

function InvoiceEditor({
  invoice,
  onUpdate,
  onSave,
  onExportPDF,
  onPrint,
  onNewInvoice,
  isSaving,
}: InvoiceEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close color picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColorPicker]);

  const updateField = <K extends keyof InvoiceData>(
    field: K,
    value: InvoiceData[K],
  ) => {
    onUpdate({ ...invoice, [field]: value });
  };

  const handleLineItemUpdate = (
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    const updated = invoice.lineItems.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: value };
      if (field === "quantity" || field === "rate") {
        next.amount = Math.round(next.quantity * next.rate * 100) / 100;
      }
      return next;
    });
    onUpdate(recalcTotals({ ...invoice, lineItems: updated }));
  };

  const handleAddRow = () => {
    const newItem: LineItem = {
      id: generateId(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    const newId = newItem.id;
    const updatedCustomColumns = invoice.customColumns.map((col) => ({
      ...col,
      values: { ...col.values, [newId]: "" },
    }));
    onUpdate(
      recalcTotals({
        ...invoice,
        lineItems: [...invoice.lineItems, newItem],
        customColumns: updatedCustomColumns,
      }),
    );
  };

  const handleDeleteRow = (id: string) => {
    const updatedCustomColumns = invoice.customColumns.map((col) => {
      const values = { ...col.values };
      delete values[id];
      return { ...col, values };
    });
    onUpdate(
      recalcTotals({
        ...invoice,
        lineItems: invoice.lineItems.filter((item) => item.id !== id),
        customColumns: updatedCustomColumns,
      }),
    );
  };

  const handleCustomCellUpdate = (
    colId: string,
    rowId: string,
    value: string,
  ) => {
    onUpdate({
      ...invoice,
      customColumns: invoice.customColumns.map((col) =>
        col.id === colId
          ? { ...col, values: { ...col.values, [rowId]: value } }
          : col,
      ),
    });
  };

  const handleAddColumn = (
    label: string,
    insertAfter: CustomColumn["insertAfter"],
  ) => {
    const newCol: CustomColumn = {
      id: generateId(),
      label,
      insertAfter,
      values: Object.fromEntries(
        invoice.lineItems.map((item) => [item.id, ""]),
      ),
    };
    onUpdate({ ...invoice, customColumns: [...invoice.customColumns, newCol] });
    toast.success(`Column "${label}" added`);
  };

  const handleDeleteColumn = (colId: string) => {
    onUpdate({
      ...invoice,
      customColumns: invoice.customColumns.filter((c) => c.id !== colId),
    });
    toast.success("Column removed");
  };

  const handleColumnLabelChange = (colId: string, newLabel: string) => {
    onUpdate({
      ...invoice,
      customColumns: invoice.customColumns.map((c) =>
        c.id === colId ? { ...c, label: newLabel } : c,
      ),
    });
  };

  const customAfter = (position: CustomColumn["insertAfter"]) =>
    invoice.customColumns.filter((c) => c.insertAfter === position);

  const totalColCount = 6 + invoice.customColumns.length; // # + desc + qty + rate + amount + del + custom cols

  return (
    <div className="flex flex-col gap-4">
      {/* Action Toolbar */}
      <div className="action-toolbar no-print flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 shadow-card flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <span className="font-medium text-sm text-foreground">
            {invoice.documentType === "quotation"
              ? "Quotation Editor"
              : "Invoice Editor"}
          </span>
          <Badge variant="secondary" className="text-xs">
            {invoice.invoiceNumber}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Document type segmented control */}
          <div
            className="flex rounded-lg border border-border overflow-hidden mr-1"
            data-ocid="invoice.doc_type_toggle"
          >
            <button
              type="button"
              onClick={() =>
                onUpdate({
                  ...invoice,
                  documentType: "invoice",
                  title:
                    invoice.documentType === "quotation" &&
                    invoice.title === "Quotation"
                      ? "Invoice"
                      : invoice.title,
                  invoiceNumber:
                    invoice.documentType === "quotation"
                      ? `INV-${invoice.invoiceNumber.replace(/^(QUO-|INV-)/, "")}`
                      : invoice.invoiceNumber,
                })
              }
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${invoice.documentType === "invoice" ? "bg-primary text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}
              data-ocid="invoice.type_invoice_tab"
            >
              Invoice
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdate({
                  ...invoice,
                  documentType: "quotation",
                  title:
                    invoice.documentType === "invoice" &&
                    invoice.title === "Invoice"
                      ? "Quotation"
                      : invoice.title,
                  invoiceNumber:
                    invoice.documentType === "invoice"
                      ? `QUO-${invoice.invoiceNumber.replace(/^(QUO-|INV-)/, "")}`
                      : invoice.invoiceNumber,
                })
              }
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${invoice.documentType === "quotation" ? "bg-primary text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}
              data-ocid="invoice.type_quotation_tab"
            >
              Quotation
            </button>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNewInvoice}
                  className="gap-2 text-xs"
                  data-ocid="invoice.new_button"
                >
                  <FilePlus size={14} />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Invoice</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrint}
                  className="gap-2 text-xs"
                  data-ocid="invoice.print_button"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">Print</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print Invoice</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportPDF}
                  className="gap-2 text-xs"
                  data-ocid="invoice.export_button"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Export PDF</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export as PDF (print dialog)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="gap-2 text-xs shadow-btn-primary"
                  data-ocid="invoice.save_button"
                >
                  <Save size={14} />
                  <span className="hidden sm:inline">
                    {isSaving ? "Saving..." : "Save"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Invoice</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Invoice Document */}
      <div
        id="invoice-print-area"
        className="invoice-card bg-card border border-border rounded-xl shadow-invoice overflow-hidden"
      >
        {/* Invoice Header Band */}
        <div
          className="px-8 py-6 text-white relative"
          style={{ background: invoice.headerColor }}
        >
          {/* Color Picker Trigger - no-print */}
          <div className="no-print absolute top-3 right-3" ref={colorPickerRef}>
            <button
              type="button"
              onClick={() => setShowColorPicker((p) => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white text-xs"
              data-ocid="invoice.header_color_button"
              title="Change header color"
            >
              <Palette size={13} />
              <span className="hidden sm:inline">Color</span>
            </button>
            <AnimatePresence>
              {showColorPicker && (
                <ColorPickerPanel
                  headerColor={invoice.headerColor}
                  textColor={invoice.textColor}
                  accentColor={invoice.accentColor}
                  onHeaderColorChange={(hex) => updateField("headerColor", hex)}
                  onTextColorChange={(hex) => updateField("textColor", hex)}
                  onAccentColorChange={(hex) => updateField("accentColor", hex)}
                  onClose={() => setShowColorPicker(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Header content: logo + title */}
          <div
            className={`flex flex-col sm:flex-row sm:items-start gap-4 ${
              invoice.logoPosition === "right" ? "sm:flex-row-reverse" : ""
            }`}
          >
            {/* Logo Area */}
            <div className="flex-shrink-0">
              <LogoArea
                logoDataUrl={invoice.logoDataUrl}
                logoWidth={invoice.logoWidth}
                logoPosition={invoice.logoPosition}
                onLogoUpload={(url) => updateField("logoDataUrl", url)}
                onLogoRemove={() => updateField("logoDataUrl", "")}
                onWidthChange={(w) => updateField("logoWidth", w)}
                onPositionToggle={() =>
                  updateField(
                    "logoPosition",
                    invoice.logoPosition === "left" ? "right" : "left",
                  )
                }
              />
            </div>

            {/* Title + Number + Dates */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <EditableText
                  tag="h1"
                  value={invoice.title}
                  onChange={(val) => updateField("title", val)}
                  className="text-2xl font-bold font-heading tracking-tight mb-1 block"
                  style={{ color: invoice.textColor }}
                  placeholder="Invoice Title"
                  data-ocid="invoice.title_input"
                />
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="text-sm font-medium opacity-80"
                    style={{ color: invoice.textColor }}
                  >
                    {invoice.documentType === "quotation"
                      ? "Quotation #"
                      : "Invoice #"}
                  </span>
                  <EditableText
                    value={invoice.invoiceNumber}
                    onChange={(val) => updateField("invoiceNumber", val)}
                    className="text-sm font-mono font-semibold bg-white/10 px-2 py-0.5 rounded"
                    style={{ color: invoice.textColor }}
                    placeholder="INV-001"
                    data-ocid="invoice.number_input"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 text-right">
                <div className="flex items-center gap-3 justify-end">
                  <span
                    className="text-xs font-medium opacity-70"
                    style={{ color: invoice.textColor }}
                  >
                    Date:
                  </span>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="text-sm font-mono bg-white/10 border-0 rounded px-2 py-1 outline-none focus:bg-white/20 transition-colors"
                    style={{ color: invoice.textColor, colorScheme: "dark" }}
                    data-ocid="invoice.date_input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* From / To Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-b border-border">
          <div className="px-8 py-6 border-b sm:border-b-0 sm:border-r border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              From
            </p>
            <EditableText
              tag="p"
              value={invoice.fromCompany}
              onChange={(val) => updateField("fromCompany", val)}
              className="font-semibold text-foreground mb-1 block"
              placeholder="Your Company Name"
              data-ocid="invoice.from_company_input"
            />
            <EditableText
              tag="p"
              value={invoice.fromAddress}
              onChange={(val) => updateField("fromAddress", val)}
              className="text-sm text-muted-foreground leading-relaxed block"
              placeholder="Address"
              data-ocid="invoice.from_address_input"
            />
            <EditableText
              tag="p"
              value={invoice.fromEmail}
              onChange={(val) => updateField("fromEmail", val)}
              className="text-sm text-primary mt-1 block"
              placeholder="email@company.com"
              data-ocid="invoice.from_email_input"
            />
          </div>
          <div className="px-8 py-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Bill To
            </p>
            <EditableText
              tag="p"
              value={invoice.toName}
              onChange={(val) => updateField("toName", val)}
              className="font-semibold text-foreground mb-0.5 block"
              placeholder="Client Name"
              data-ocid="invoice.to_name_input"
            />
            <EditableText
              tag="p"
              value={invoice.toCompany}
              onChange={(val) => updateField("toCompany", val)}
              className="text-sm text-muted-foreground mb-1 block"
              placeholder="Company Name"
              data-ocid="invoice.to_company_input"
            />
            <EditableText
              tag="p"
              value={invoice.toAddress}
              onChange={(val) => updateField("toAddress", val)}
              className="text-sm text-muted-foreground leading-relaxed block"
              placeholder="Address"
              data-ocid="invoice.to_address_input"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: invoice.accentColor }}>
                <th
                  className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wide w-10"
                  style={{ color: invoice.textColor }}
                >
                  #
                </th>
                <EditableTh
                  value={invoice.columnLabels.description}
                  onChange={(v) =>
                    updateField("columnLabels", {
                      ...invoice.columnLabels,
                      description: v,
                    })
                  }
                  className="py-3 px-4 text-left w-auto"
                  textColor={invoice.textColor}
                />
                {customAfter("description").map((col) => (
                  <EditableTh
                    key={col.id}
                    value={col.label}
                    onChange={(v) => handleColumnLabelChange(col.id, v)}
                    onDelete={() => handleDeleteColumn(col.id)}
                    className="py-3 px-4 text-left"
                    textColor={invoice.textColor}
                  />
                ))}
                <EditableTh
                  value={invoice.columnLabels.qty}
                  onChange={(v) =>
                    updateField("columnLabels", {
                      ...invoice.columnLabels,
                      qty: v,
                    })
                  }
                  className="py-3 px-4 text-right w-20"
                  textColor={invoice.textColor}
                />
                {customAfter("qty").map((col) => (
                  <EditableTh
                    key={col.id}
                    value={col.label}
                    onChange={(v) => handleColumnLabelChange(col.id, v)}
                    onDelete={() => handleDeleteColumn(col.id)}
                    className="py-3 px-4 text-left"
                    textColor={invoice.textColor}
                  />
                ))}
                <EditableTh
                  value={invoice.columnLabels.rate}
                  onChange={(v) =>
                    updateField("columnLabels", {
                      ...invoice.columnLabels,
                      rate: v,
                    })
                  }
                  className="py-3 px-4 text-right w-28"
                  textColor={invoice.textColor}
                />
                {customAfter("rate").map((col) => (
                  <EditableTh
                    key={col.id}
                    value={col.label}
                    onChange={(v) => handleColumnLabelChange(col.id, v)}
                    onDelete={() => handleDeleteColumn(col.id)}
                    className="py-3 px-4 text-left"
                    textColor={invoice.textColor}
                  />
                ))}
                <EditableTh
                  value={invoice.columnLabels.amount}
                  onChange={(v) =>
                    updateField("columnLabels", {
                      ...invoice.columnLabels,
                      amount: v,
                    })
                  }
                  className="py-3 px-4 text-right w-32"
                  textColor={invoice.textColor}
                />
                <th className="w-10 no-print" />
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalColCount}
                    className="py-12 text-center text-muted-foreground text-sm"
                    data-ocid="lineitems.empty_state"
                  >
                    No items yet. Click &ldquo;Add Row&rdquo; below to get
                    started.
                  </td>
                </tr>
              ) : (
                invoice.lineItems.map((item, i) => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    index={i}
                    customColumns={invoice.customColumns}
                    onUpdate={handleLineItemUpdate}
                    onDelete={handleDeleteRow}
                    onCustomCellUpdate={handleCustomCellUpdate}
                  />
                ))
              )}
            </tbody>
          </table>

          {/* Add Row + Add Column */}
          <div className="px-4 py-3 border-t border-border no-print flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddRow}
              className="gap-2 text-xs text-muted-foreground hover:text-foreground"
              data-ocid="lineitems.add_button"
            >
              <Plus size={14} />
              Add Row
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddColumn(true)}
              className="gap-2 text-xs text-muted-foreground hover:text-foreground"
              data-ocid="lineitems.add_column_button"
            >
              <Plus size={14} />
              Add Column
            </Button>
          </div>
        </div>

        {/* Totals */}
        <div className="flex flex-col items-end border-t border-border px-8 py-6">
          <div className="w-full sm:w-80 space-y-0 rounded-xl overflow-hidden border border-border">
            <div className="flex justify-between text-sm px-4 py-3 bg-card">
              <span className="text-muted-foreground font-medium">
                Subtotal
              </span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            <div
              className="flex justify-between text-sm px-4 py-3"
              style={{ background: "#FFE0B2" }}
            >
              <span className="font-medium" style={{ color: "#7A3800" }}>
                SGST (9%)
              </span>
              <span
                className="font-mono font-semibold"
                style={{ color: "#7A3800" }}
              >
                {formatCurrency(invoice.sgst)}
              </span>
            </div>
            <div
              className="flex justify-between text-sm px-4 py-3"
              style={{ background: "#FFD090" }}
            >
              <span className="font-medium" style={{ color: "#7A3800" }}>
                CGST (9%)
              </span>
              <span
                className="font-mono font-semibold"
                style={{ color: "#7A3800" }}
              >
                {formatCurrency(invoice.cgst)}
              </span>
            </div>
            <div
              className="flex justify-between px-4 py-4"
              style={{
                background: "#FF6F00",
                color: "#ffffff",
              }}
            >
              <span className="font-bold text-base">Grand Total</span>
              <span className="font-mono font-bold text-lg">
                {formatCurrency(invoice.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t border-border px-8 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Notes
          </p>
          <EditableText
            tag="p"
            value={invoice.notes}
            onChange={(val) => updateField("notes", val)}
            className="text-sm text-muted-foreground leading-relaxed"
            placeholder="Payment terms, bank details, or any notes..."
            data-ocid="invoice.notes_input"
          />
        </div>

        {/* Footer */}
        <div
          className="px-8 py-4 text-center text-xs"
          style={{ background: "#FFF3E0" }}
        >
          <span className="text-muted-foreground">
            Generated on {formatDate(todayStr())} · Thank you for your business!
          </span>
        </div>
      </div>

      {/* Add Column Dialog */}
      <AddColumnDialog
        open={showAddColumn}
        onClose={() => setShowAddColumn(false)}
        onAdd={handleAddColumn}
      />
    </div>
  );
}

// ─── Dashboard Overview ─────────────────────────────────────────────────────────

interface DashboardProps {
  savedInvoices: InvoiceData[];
  onLoadInvoice: (invoice: InvoiceData) => void;
  onDeleteSaved: (id: string) => void;
  onNavigate: (view: View) => void;
}

function Dashboard({
  savedInvoices,
  onLoadInvoice,
  onDeleteSaved,
  onNavigate,
}: DashboardProps) {
  const totalRevenue = savedInvoices.reduce((s, inv) => s + inv.grandTotal, 0);
  const totalInvoices = savedInvoices.filter(
    (inv) => (inv.documentType ?? "invoice") === "invoice",
  ).length;
  const totalQuotations = savedInvoices.filter(
    (inv) => inv.documentType === "quotation",
  ).length;
  const pendingAmount = savedInvoices
    .slice(0, Math.floor(savedInvoices.length / 2) + 1)
    .reduce((s, inv) => s + inv.grandTotal, 0);

  const stats = [
    {
      label: "Total Documents",
      value: String(savedInvoices.length),
      subline: `${totalInvoices} invoice${totalInvoices !== 1 ? "s" : ""}, ${totalQuotations} quotation${totalQuotations !== 1 ? "s" : ""}`,
      icon: ClipboardList,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      subline: null as string | null,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-secondary/20",
    },
    {
      label: "Pending Amount",
      value: formatCurrency(pendingAmount),
      subline: null as string | null,
      icon: BarChart3,
      color: "text-primary",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-xl p-5 shadow-card"
            data-ocid={`dashboard.card.${i + 1}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold font-mono mt-1 text-foreground">
                  {stat.value}
                </p>
                {stat.subline && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.subline}
                  </p>
                )}
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-card">
        <h3 className="font-semibold text-sm text-foreground mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => onNavigate("invoice")}
            className="gap-2 shadow-btn-primary"
            data-ocid="dashboard.new_invoice_button"
          >
            <FilePlus size={16} />
            New Invoice
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate("saved")}
            className="gap-2"
            data-ocid="dashboard.view_saved_button"
          >
            <ClipboardList size={16} />
            View Saved
          </Button>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">
            Recent Invoices
          </h3>
          {savedInvoices.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate("saved")}
              className="text-xs text-primary hover:underline"
              data-ocid="dashboard.view_all_link"
            >
              View all
            </button>
          )}
        </div>
        {savedInvoices.length === 0 ? (
          <div
            className="py-12 text-center text-muted-foreground text-sm"
            data-ocid="dashboard.empty_state"
          >
            <Receipt size={32} className="mx-auto mb-2 opacity-30" />
            <p>No invoices saved yet.</p>
            <button
              type="button"
              onClick={() => onNavigate("invoice")}
              className="mt-2 text-primary text-sm hover:underline"
              data-ocid="dashboard.create_first_button"
            >
              Create your first invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {savedInvoices.slice(0, 5).map((inv, i) => (
              <button
                key={inv.id}
                type="button"
                onClick={() => {
                  onLoadInvoice(inv);
                  onNavigate("invoice");
                }}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group text-left"
                data-ocid={`dashboard.invoice.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {inv.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {inv.invoiceNumber} · {formatDate(inv.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-foreground">
                    {formatCurrency(inv.grandTotal)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSaved(inv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-all"
                    title="Delete"
                    data-ocid={`dashboard.delete_button.${i + 1}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Saved Invoices Panel ────────────────────────────────────────────────────────

interface SavedInvoicesPanelProps {
  savedInvoices: InvoiceData[];
  onLoad: (invoice: InvoiceData) => void;
  onDelete: (id: string) => void;
  onNavigate: (view: View) => void;
}

function SavedInvoicesPanel({
  savedInvoices,
  onLoad,
  onDelete,
  onNavigate,
}: SavedInvoicesPanelProps) {
  const [filterType, setFilterType] = useState<"all" | "invoice" | "quotation">(
    "all",
  );

  const filteredInvoices =
    filterType === "all"
      ? savedInvoices
      : savedInvoices.filter(
          (inv) => (inv.documentType ?? "invoice") === filterType,
        );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-foreground">
          Saved Documents
        </h2>
        <Button
          size="sm"
          onClick={() => onNavigate("invoice")}
          className="gap-2 shadow-btn-primary"
          data-ocid="saved.new_invoice_button"
        >
          <FilePlus size={14} />
          New
        </Button>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 bg-muted rounded-lg p-1 w-fit"
        data-ocid="saved.filter_tabs"
      >
        {(
          [
            ["all", "All"],
            ["invoice", "Invoices"],
            ["quotation", "Quotations"],
          ] as const
        ).map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === type
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`saved.${type}_tab`}
          >
            {label}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filterType === type
                  ? "bg-primary/10 text-primary"
                  : "bg-muted-foreground/10"
              }`}
            >
              {type === "all"
                ? savedInvoices.length
                : savedInvoices.filter(
                    (inv) => (inv.documentType ?? "invoice") === type,
                  ).length}
            </span>
          </button>
        ))}
      </div>

      {filteredInvoices.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl py-16 text-center"
          data-ocid="saved.empty_state"
        >
          <ClipboardList
            size={36}
            className="mx-auto mb-3 text-muted-foreground opacity-40"
          />
          <p className="text-sm text-muted-foreground">
            {savedInvoices.length === 0
              ? "No saved documents yet."
              : `No ${filterType}s found.`}
          </p>
          {savedInvoices.length === 0 && (
            <button
              type="button"
              onClick={() => onNavigate("invoice")}
              className="mt-2 text-primary text-sm hover:underline"
              data-ocid="saved.create_first_button"
            >
              Create your first document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="divide-y divide-border">
            {filteredInvoices.map((inv, i) => {
              const isQuotation = inv.documentType === "quotation";
              return (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => {
                    onLoad(inv);
                    onNavigate("invoice");
                  }}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group text-left"
                  data-ocid={`saved.item.${i + 1}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{
                        background: inv.headerColor ?? "#1e3a5f",
                        color: inv.textColor ?? "#ffffff",
                      }}
                    >
                      {inv.invoiceNumber.replace(/^(INV-|QUO-)/, "")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground">
                          {inv.title}
                        </p>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            isQuotation
                              ? "bg-secondary/20 text-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isQuotation ? "QUO" : "INV"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {inv.invoiceNumber} · {inv.toCompany}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Date: {formatDate(inv.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-mono font-bold text-foreground">
                      {formatCurrency(inv.grandTotal)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoad(inv);
                          onNavigate("invoice");
                        }}
                        className="text-xs text-primary hover:underline px-2 py-1 rounded hover:bg-blue-50"
                        data-ocid={`saved.edit_button.${i + 1}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(inv.id);
                        }}
                        className="text-xs text-red-500 hover:underline px-2 py-1 rounded hover:bg-red-50"
                        data-ocid={`saved.delete_button.${i + 1}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings Panel ─────────────────────────────────────────────────────────────

function SettingsPanel() {
  const handleClearData = () => {
    if (window.confirm("Clear all saved invoices? This cannot be undone.")) {
      localStorage.removeItem("invoiceDraft");
      localStorage.removeItem("savedInvoices");
      toast.success("All data cleared. Reload the page to start fresh.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading font-bold text-xl text-foreground">
        Settings
      </h2>

      <div className="bg-card border border-border rounded-xl shadow-card divide-y divide-border">
        {/* Tax Info */}
        <div className="px-6 py-5">
          <h3 className="font-semibold text-sm text-foreground mb-1">
            GST Structure
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            All invoices use dual GST: SGST (9%) + CGST (9%), auto-calculated
            from subtotal. Total effective GST is 18%.
          </p>
          <div className="flex gap-3">
            <div
              className="px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "#FFE0B2", color: "#7A3800" }}
            >
              SGST: 9% (fixed)
            </div>
            <div
              className="px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "#FFD090", color: "#7A3800" }}
            >
              CGST: 9% (fixed)
            </div>
          </div>
        </div>

        {/* Data Storage */}
        <div className="px-6 py-5">
          <h3 className="font-semibold text-sm text-foreground mb-1">
            Data Storage
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            All invoice data is stored locally in your browser&apos;s
            localStorage. No data leaves your device.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearData}
            className="gap-2"
            data-ocid="settings.clear_data_button"
          >
            <Trash2 size={14} />
            Clear All Data
          </Button>
        </div>

        {/* About */}
        <div className="px-6 py-5">
          <h3 className="font-semibold text-sm text-foreground mb-1">About</h3>
          <p className="text-xs text-muted-foreground">
            Invoice Dashboard Pro · Built with caffeine.ai
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── App Sidebar ─────────────────────────────────────────────────────────────────

interface AppSidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  savedCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  { id: "invoice" as View, label: "Editor", icon: FileText },
  { id: "saved" as View, label: "Saved Invoices", icon: ClipboardList },
  { id: "settings" as View, label: "Settings", icon: Settings },
];

function AppSidebar({
  activeView,
  onNavigate,
  savedCount,
  collapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  return (
    <aside
      className={`flex flex-col h-full transition-all duration-300 ${
        collapsed ? "w-14" : "w-56"
      }`}
      style={{ background: "oklch(0.22 0.06 41)" }}
    >
      {/* Logo / Brand */}
      <div
        className={`flex items-center h-14 border-b border-white/10 px-3 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Receipt size={14} className="text-white" />
            </div>
            <span className="font-heading font-bold text-sm text-white">
              Invoice Pro
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          data-ocid="sidebar.toggle"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
              data-ocid={`sidebar.${item.id}_link`}
            >
              <item.icon size={17} />
              {!collapsed && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.id === "saved" && savedCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-5 text-center">
                  {savedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-white/40 leading-relaxed">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70 transition-colors"
            >
              Built with caffeine.ai
            </a>
          </p>
        </div>
      )}
    </aside>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────────

// ─── backfillInvoice ────────────────────────────────────────────────────────────

const DEFAULT_INVOICE_FIELDS = {
  headerColor: "#FF6F00",
  textColor: "#ffffff",
  accentColor: "#FFA726",
  documentType: "invoice" as const,
  logoDataUrl: "",
  logoWidth: 80,
  logoPosition: "left" as const,
  columnLabels: {
    description: "Description",
    qty: "Qty",
    rate: "Rate (₹)",
    amount: "Amount (₹)",
  },
  sgst: 0,
  cgst: 0,
  customColumns: [] as CustomColumn[],
};

function backfillInvoice(inv: Record<string, unknown>): InvoiceData {
  // Migrate old gst/gstRate to sgst/cgst if needed
  const partial = inv as Partial<InvoiceData> & {
    gst?: number;
    gstRate?: number;
    dueDate?: string;
  };
  const subtotal = (partial.subtotal as number) ?? 0;
  const sgst = partial.sgst ?? Math.round(subtotal * 0.09 * 100) / 100;
  const cgst = partial.cgst ?? Math.round(subtotal * 0.09 * 100) / 100;
  const grandTotal = subtotal + sgst + cgst;
  return {
    ...DEFAULT_INVOICE_FIELDS,
    ...partial,
    sgst,
    cgst,
    grandTotal,
  } as InvoiceData;
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [invoice, setInvoice] = useState<InvoiceData>(createEmptyInvoice);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem("invoiceDraft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as InvoiceData;
        // Backfill new fields for old data
        setInvoice(
          backfillInvoice(parsed as unknown as Record<string, unknown>),
        );
      } catch {
        /* ignore */
      }
    }
    const saved = localStorage.getItem("savedInvoices");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as InvoiceData[];
        setSavedInvoices(
          parsed.map((inv) =>
            backfillInvoice(inv as unknown as Record<string, unknown>),
          ),
        );
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Auto-save draft on invoice change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("invoiceDraft", JSON.stringify(invoice));
    }, 800);
    return () => clearTimeout(timer);
  }, [invoice]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    const updated = savedInvoices.some((s) => s.id === invoice.id)
      ? savedInvoices.map((s) => (s.id === invoice.id ? invoice : s))
      : [invoice, ...savedInvoices];
    setSavedInvoices(updated);
    localStorage.setItem("savedInvoices", JSON.stringify(updated));
    setTimeout(() => {
      setIsSaving(false);
      toast.success(
        `${invoice.documentType === "quotation" ? "Quotation" : "Invoice"} saved successfully!`,
      );
    }, 400);
  }, [invoice, savedInvoices]);

  const handleExportPDF = useCallback(() => {
    window.print();
    toast.info('Print dialog opened. Select "Save as PDF" to export.');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleNewInvoice = useCallback(() => {
    setShowNewDialog(true);
  }, []);

  const confirmNewInvoice = useCallback(() => {
    setShowNewDialog(false);
    setInvoice(createEmptyInvoice());
    setActiveView("invoice");
    toast.success("New document created");
  }, []);

  const handleLoadInvoice = useCallback((inv: InvoiceData) => {
    setInvoice(inv);
    setActiveView("invoice");
  }, []);

  const handleDeleteSaved = useCallback(
    (id: string) => {
      const updated = savedInvoices.filter((s) => s.id !== id);
      setSavedInvoices(updated);
      localStorage.setItem("savedInvoices", JSON.stringify(updated));
      toast.success("Document deleted");
    },
    [savedInvoices],
  );

  const viewLabel =
    activeView === "invoice"
      ? "Editor"
      : activeView === "saved"
        ? "Saved"
        : activeView === "settings"
          ? "Settings"
          : "Dashboard";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex no-print">
        <AppSidebar
          activeView={activeView}
          onNavigate={setActiveView}
          savedCount={savedInvoices.length}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden no-print"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden no-print w-60"
            >
              <AppSidebar
                activeView={activeView}
                onNavigate={(v) => {
                  setActiveView(v);
                  setMobileSidebarOpen(false);
                }}
                savedCount={savedInvoices.length}
                collapsed={false}
                onToggleCollapse={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header
          className="app-header no-print flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card"
          style={{ minHeight: "56px" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
              data-ocid="header.menu_button"
            >
              <Menu size={18} className="text-foreground" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-heading font-bold text-foreground">
                Invoice Pro
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground capitalize">
                {viewLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs hidden sm:flex">
              {savedInvoices.length} saved
            </Badge>
            <Button
              size="sm"
              onClick={() => setActiveView("invoice")}
              className="gap-2 text-xs shadow-btn-primary"
              data-ocid="header.new_invoice_button"
            >
              <FilePlus size={14} />
              <span className="hidden sm:inline">New Document</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {activeView === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <Dashboard
                    savedInvoices={savedInvoices}
                    onLoadInvoice={handleLoadInvoice}
                    onDeleteSaved={handleDeleteSaved}
                    onNavigate={setActiveView}
                  />
                </motion.div>
              )}
              {activeView === "invoice" && (
                <motion.div
                  key="invoice"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <InvoiceEditor
                    invoice={invoice}
                    onUpdate={setInvoice}
                    onSave={handleSave}
                    onExportPDF={handleExportPDF}
                    onPrint={handlePrint}
                    onNewInvoice={handleNewInvoice}
                    isSaving={isSaving}
                  />
                </motion.div>
              )}
              {activeView === "saved" && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <SavedInvoicesPanel
                    savedInvoices={savedInvoices}
                    onLoad={handleLoadInvoice}
                    onDelete={handleDeleteSaved}
                    onNavigate={setActiveView}
                  />
                </motion.div>
              )}
              {activeView === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <SettingsPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile footer branding */}
        <footer className="no-print md:hidden border-t border-border bg-card px-4 py-2 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      {/* New Invoice Confirmation Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent data-ocid="invoice.new_dialog">
          <DialogHeader>
            <DialogTitle>Create New Invoice?</DialogTitle>
            <DialogDescription>
              This will discard unsaved changes to the current invoice. Save
              first if you want to keep it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewDialog(false)}
              data-ocid="invoice.new_cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmNewInvoice}
              data-ocid="invoice.new_confirm_button"
            >
              Create New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster richColors position="top-right" />
    </div>
  );
}
