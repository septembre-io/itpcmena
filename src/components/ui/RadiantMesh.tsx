"use client";

interface RadiantMeshProps {
  className?: string;
  opacity?: number;
}

/**
 * Animated radiant gradient mesh — ported from v7-Radiant design.
 * Use as absolute/fixed background layer with pointer-events-none.
 *
 * @example
 * <div className="relative overflow-hidden">
 *   <RadiantMesh className="absolute inset-0 -z-10" />
 *   ...
 * </div>
 */
export function RadiantMesh({ className = "", opacity = 1 }: RadiantMeshProps) {
  return (
    <div
      aria-hidden="true"
      className={`radiant-mesh pointer-events-none ${className}`}
      style={opacity !== 1 ? { opacity } : undefined}
    />
  );
}
