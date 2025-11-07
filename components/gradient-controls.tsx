"use client"

import { useState } from "react"
import { GradientColorStops } from "./gradient-color-stops"
import { ColorPicker } from "./retroui/ColorPicker"
import { Switch } from "./ui/switch"
import type { GradientState } from "@/app/page"

interface GradientControlsProps {
  gradient: GradientState
  setGradient: (gradient: GradientState) => void
  showCenterHandle: boolean
  setShowCenterHandle: (show: boolean) => void
}

export function GradientControls({ gradient, setGradient, showCenterHandle, setShowCenterHandle }: GradientControlsProps) {
  const [selectedTab, setSelectedTab] = useState<"basic" | "advanced">("basic")

  const handleTypeChange = (type: GradientState["type"]) => {
    setGradient({ ...gradient, type })
  }

  return (
    <div className="space-y-4">
      {/* Gradient Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Gradient Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["linear", "radial", "conic", "mesh", "repeating-linear", "repeating-radial", "repeating-conic"].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type as GradientState["type"])}
              className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded border-2 transition-colors ${
                gradient.type === type
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-foreground/10 bg-muted text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs for Basic/Advanced */}
      <div className="flex gap-2 border-b-2 border-foreground/10">
        {["basic", "advanced"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as "basic" | "advanced")}
            className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              selectedTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Basic Controls */}
      {selectedTab === "basic" && (
        <div className="space-y-4">
          {gradient.type === "mesh" ? (
            /* Mesh Grid Controls */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Mesh Grid Colors (3x3)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {gradient.meshGrid.map((row, rowIndex) =>
                    row.map((color, colIndex) => (
                      <div key={`${rowIndex}-${colIndex}`} className="flex flex-col items-center gap-1">
                        <ColorPicker
                          value={color}
                          onChange={(newColor) => {
                            const newMeshGrid = gradient.meshGrid.map((r, ri) =>
                              r.map((c, ci) =>
                                ri === rowIndex && ci === colIndex ? newColor : c
                              )
                            )
                            setGradient({ ...gradient, meshGrid: newMeshGrid })
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {rowIndex},{colIndex}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Mesh Spread Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spread</label>
                  <span className="text-xs font-mono text-primary">{gradient.meshSpread}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={gradient.meshSpread}
                  onChange={(e) => setGradient({ ...gradient, meshSpread: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded accent-primary"
                />
              </div>
            </div>
          ) : (
            <GradientColorStops
              colorStops={gradient.colorStops}
              setColorStops={(stops) => setGradient({ ...gradient, colorStops: stops })}
            />
          )}

          {/* Angle for Linear */}
          {(gradient.type === "linear" || gradient.type === "repeating-linear") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Angle</label>
                <span className="text-xs font-mono text-primary">{gradient.angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={gradient.angle}
                onChange={(e) => setGradient({ ...gradient, angle: Number(e.target.value) })}
                className="w-full h-2 bg-muted rounded accent-primary"
              />
            </div>
          )}

          {/* Center Position for Radial/Conic */}
          {(gradient.type === "radial" ||
            gradient.type === "conic" ||
            gradient.type === "repeating-radial" ||
            gradient.type === "repeating-conic") && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Center X
                  </label>
                  <span className="text-xs font-mono text-primary">{gradient.centerX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gradient.centerX}
                  onChange={(e) => setGradient({ ...gradient, centerX: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Center Y
                  </label>
                  <span className="text-xs font-mono text-primary">{gradient.centerY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gradient.centerY}
                  onChange={(e) => setGradient({ ...gradient, centerY: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded accent-primary"
                />
              </div>

              {gradient.type === "conic" && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Start Angle
                      </label>
                      <span className="text-xs font-mono text-primary">{gradient.angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradient.angle}
                      onChange={(e) => setGradient({ ...gradient, angle: Number(e.target.value) })}
                      className="w-full h-2 bg-muted rounded accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Smooth Transition
                      </label>
                      <Switch
                        checked={gradient.conicSmoothTransition}
                        onCheckedChange={(checked) => setGradient({ ...gradient, conicSmoothTransition: checked })}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Shape for Radial */}
          {(gradient.type === "radial" || gradient.type === "repeating-radial") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shape</label>
                <span className="text-xs font-mono text-primary">{gradient.shape}</span>
              </div>
              <div className="flex gap-2">
                {["circle", "ellipse"].map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setGradient({ ...gradient, shape: shape as "circle" | "ellipse" })}
                    className={`flex-1 px-3 py-2 text-xs font-semibold uppercase rounded border-2 transition-colors ${
                      gradient.shape === shape
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-foreground/10 bg-muted text-muted-foreground"
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Repeat Size for Repeating Gradients */}
          {gradient.type.startsWith("repeating-") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Repeat Size</label>
                <span className="text-xs font-mono text-primary">{gradient.repeatSize}px</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                value={gradient.repeatSize}
                onChange={(e) => setGradient({ ...gradient, repeatSize: Number(e.target.value) })}
                className="w-full h-2 bg-muted rounded accent-primary"
              />
            </div>
          )}
        </div>
      )}

      {/* Advanced Controls */}
      {selectedTab === "advanced" && (
        <div className="space-y-4 p-3 bg-white rounded border border-foreground/10">
          {/* Noise Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Add Grain
              </label>
              <Switch
                checked={gradient.noiseEnabled}
                onCheckedChange={(checked) => setGradient({ ...gradient, noiseEnabled: checked })}
              />
            </div>
          </div>

          {gradient.noiseEnabled && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</label>
                  <span className="text-xs font-mono text-primary">{Math.round(gradient.noiseAmount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={gradient.noiseAmount}
                  onChange={(e) => setGradient({ ...gradient, noiseAmount: Number(e.target.value) })}
                  className="w-full h-2 bg-background rounded accent-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Type
                </label>
                <div className="flex gap-2">
                  {["smooth", "harsh"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setGradient({ ...gradient, noiseType: type as "smooth" | "harsh" })}
                      className={`flex-1 px-3 py-2 text-xs font-semibold uppercase rounded border-2 transition-colors ${
                        gradient.noiseType === type
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-foreground/10 bg-background text-muted-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Center Handle Visibility */}
          {(gradient.type === "radial" ||
            gradient.type === "conic" ||
            gradient.type === "repeating-radial" ||
            gradient.type === "repeating-conic") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Show Center Handle
                </label>
                <Switch
                  checked={showCenterHandle}
                  onCheckedChange={setShowCenterHandle}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
