"use client";

import type { CSSProperties, ReactNode } from "react";

type CardFrameVariant = "card-1" | "card-2";

interface CardLayer {
  src: string;
  aspectRatio: string;
}

const CARD_FRAMES: Record<
  CardFrameVariant,
  { top: CardLayer; middle: CardLayer; below: CardLayer }
> = {
  "card-1": {
    top: { src: "/card-1_top.png", aspectRatio: "1671 / 247" },
    middle: { src: "/card-1_middle.png", aspectRatio: "1671 / 202" },
    below: { src: "/card-1_below.png", aspectRatio: "1671 / 153" },
  },
  "card-2": {
    top: { src: "/card-2_top.png", aspectRatio: "2172 / 185" },
    middle: { src: "/card-2_middle.png", aspectRatio: "2172 / 264" },
    below: { src: "/card-2_below.png", aspectRatio: "2172 / 182" },
  },
};

interface CardFrameProps {
  variant?: CardFrameVariant;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function fixedLayerStyle(layer: CardLayer): CSSProperties {
  return {
    aspectRatio: layer.aspectRatio,
    backgroundImage: `url(${layer.src})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
  };
}

export function CardFrame({
  variant = "card-2",
  className,
  contentClassName,
  style,
  children,
}: CardFrameProps) {
  const frame = CARD_FRAMES[variant];

  return (
    <div
      className={joinClasses("relative overflow-hidden", className)}
      style={style}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex flex-col select-none"
      >
        <div className="w-full shrink-0" style={fixedLayerStyle(frame.top)} />
        <div
          className="min-h-0 w-full flex-1"
          style={{
            backgroundImage: `url(${frame.middle.src})`,
            backgroundPosition: "top center",
            backgroundRepeat: "repeat-y",
            backgroundSize: "100% auto",
          }}
        />
        <div
          className="w-full shrink-0"
          style={fixedLayerStyle(frame.below)}
        />
      </div>
      <div className={joinClasses("relative z-10", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
