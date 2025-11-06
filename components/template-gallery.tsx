"use client"

const templates = [
  { id: 0, name: "Ocean", colors: ["#0a1f2e", "#16c784"] },
  { id: 1, name: "Sunset", colors: ["#ff6b6b", "#ffd93d"] },
  { id: 2, name: "Forest", colors: ["#1a5f3e", "#90ee90"] },
  { id: 3, name: "Night", colors: ["#1a1a2e", "#16213e"] },
  { id: 4, name: "Fire", colors: ["#8b0000", "#ff4500"] },
  { id: 5, name: "Sky", colors: ["#87ceeb", "#e0f6ff"] },
]

interface TemplateGalleryProps {
  selected: number
  onSelect: (id: number) => void
}

export function TemplateGallery({ selected, onSelect }: TemplateGalleryProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Templates</p>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`p-2 rounded-lg border-2 transition-all group ${
              selected === template.id
                ? "border-primary bg-primary/10"
                : "border-border bg-muted hover:border-primary/50"
            }`}
          >
            <div
              className="w-full h-16 rounded-md mb-2 shadow-md group-hover:shadow-lg transition-shadow"
              style={{
                background: `linear-gradient(135deg, ${template.colors[0]} 0%, ${template.colors[1]} 100%)`,
              }}
            />
            <p
              className={`text-xs text-center font-medium ${selected === template.id ? "text-primary" : "text-muted-foreground"}`}
            >
              {template.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
