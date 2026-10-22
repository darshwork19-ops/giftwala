import type { ReactNode } from "react";
import type { IllustrationTheme } from "@/data/illustrations";

const C = {
  back: "#f6eee4",
  shadow: "#d8cab9",
  burgundy: "#800020",
  berry: "#6d293a",
  terracotta: "#d9a477",
  sage: "#496653",
  sageDark: "#3a5243",
  leaf: "#6f8b6a",
  charcoal: "#292522",
  cream: "#fffaf3",
  blush: "#f1e3e5",
  kraft: "#c79a6b",
  kraftDark: "#a87c50",
  wood: "#c89a6a",
  woodDark: "#8a6340",
  copper: "#b8733d",
  copperDark: "#8f5428",
  brass: "#c9a24a",
  brassLight: "#ddb95f",
  willow: "#e8cfa5",
  hill: "#ddd0bf",
};

const LABEL: Record<IllustrationTheme, string> = {
  coffee: "coffee",
  tea: "tea",
  yoga: "yoga gear",
  notebook: "notebooks",
  photobook: "a photo book",
  dog: "dog accessories",
  cat: "cat accessories",
  plant: "a potted plant",
  boardgame: "a board game",
  cricket: "cricket gear",
  cycling: "cycling gear",
  climbing: "climbing gear",
  camping: "camping gear",
  outdoorwear: "trekking wear",
  backpack: "a backpack",
  clay: "clay figurines",
  copper: "copperware",
  candle: "a candle",
  gift: "a gift",
};

const leaf = "M120 134 C102 112 98 84 112 62 C128 84 130 112 120 134 Z";

const SCENES: Record<IllustrationTheme, ReactNode> = {
  coffee: (
    <>
      <path d="M58 84 H112 L118 190 H52 Z" fill={C.kraft} />
      <rect x="56" y="72" width="58" height="16" rx="2" fill={C.kraftDark} />
      <rect x="68" y="122" width="34" height="36" rx="3" fill={C.cream} />
      <ellipse cx="85" cy="140" rx="8" ry="11" fill={C.copperDark} />
      <path d="M85 130 C81 137 89 143 85 150" stroke={C.cream} strokeWidth="2" fill="none" />
      <ellipse cx="160" cy="189" rx="38" ry="5" fill={C.cream} />
      <path d="M134 142 H186 V164 C186 180 174 188 160 188 C146 188 134 180 134 164 Z" fill={C.cream} />
      <path d="M186 150 C200 150 200 172 186 172" stroke={C.cream} strokeWidth="7" fill="none" />
      <ellipse cx="160" cy="142" rx="26" ry="5" fill="#4a2c1d" />
      <path d="M152 128 C146 120 158 114 152 104 M166 128 C160 120 172 114 166 104" stroke={C.shadow} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="38" cy="184" rx="6" ry="8" fill={C.copperDark} transform="rotate(-30 38 184)" />
      <ellipse cx="128" cy="186" rx="5" ry="7" fill={C.copperDark} transform="rotate(40 128 186)" />
    </>
  ),
  tea: (
    <>
      <circle cx="104" cy="148" r="42" fill={C.sage} />
      <ellipse cx="104" cy="108" rx="22" ry="7" fill={C.sageDark} />
      <circle cx="104" cy="99" r="6" fill={C.terracotta} />
      <path d="M68 142 C52 134 46 120 42 112 L50 108 C56 118 62 128 72 132 Z" fill={C.sage} />
      <path d="M144 126 C170 126 170 168 142 168" stroke={C.sage} strokeWidth="9" fill="none" />
      <ellipse cx="180" cy="189" rx="26" ry="4" fill={C.cream} />
      <path d="M160 160 H200 V172 C200 182 192 188 180 188 C168 188 160 182 160 172 Z" fill={C.cream} />
      <ellipse cx="180" cy="160" rx="20" ry="4" fill={C.terracotta} />
      <path d="M60 186 C60 170 76 166 84 170 C82 182 70 188 60 186 Z" fill={C.leaf} />
    </>
  ),
  yoga: (
    <>
      <rect x="58" y="136" width="110" height="48" fill={C.burgundy} />
      <ellipse cx="58" cy="160" rx="14" ry="24" fill={C.burgundy} />
      <ellipse cx="168" cy="160" rx="14" ry="24" fill={C.berry} />
      <circle cx="168" cy="160" r="14" fill="none" stroke={C.burgundy} strokeWidth="3" />
      <circle cx="168" cy="160" r="6" fill="none" stroke={C.burgundy} strokeWidth="3" />
      <rect x="96" y="136" width="9" height="48" fill={C.terracotta} />
      <rect x="128" y="136" width="9" height="48" fill={C.terracotta} />
      <path d="M176 150 L196 140 L214 148 L194 158 Z" fill={C.willow} />
      <path d="M176 150 L194 158 V190 L176 182 Z" fill={C.terracotta} />
      <path d="M194 158 L214 148 V180 L194 190 Z" fill={C.kraft} />
    </>
  ),
  notebook: (
    <>
      <g transform="rotate(8 120 140)">
        <rect x="70" y="72" width="104" height="118" rx="6" fill={C.sage} />
      </g>
      <g transform="rotate(-6 120 140)">
        <rect x="62" y="70" width="108" height="120" rx="6" fill={C.burgundy} />
        <rect x="62" y="70" width="14" height="120" rx="4" fill={C.berry} />
        <rect x="148" y="70" width="8" height="120" fill={C.terracotta} />
        <rect x="90" y="96" width="40" height="6" rx="3" fill={C.blush} opacity="0.6" />
      </g>
      <g transform="rotate(28 186 140)">
        <rect x="181" y="82" width="10" height="92" rx="3" fill={C.charcoal} />
        <path d="M181 174 H191 L186 188 Z" fill={C.terracotta} />
      </g>
    </>
  ),
  photobook: (
    <>
      <path d="M32 94 L120 104 L208 94 V184 L120 192 L32 184 Z" fill={C.burgundy} />
      <path d="M40 92 L118 100 V184 L40 176 Z" fill={C.cream} />
      <path d="M122 100 L200 92 V176 L122 184 Z" fill={C.cream} />
      <path d="M52 108 L106 113 V151 L52 146 Z" fill={C.terracotta} opacity="0.7" />
      <path d="M52 156 L78 158 V172 L52 170 Z" fill={C.sage} opacity="0.6" />
      <path d="M134 113 L188 108 V162 L134 167 Z" fill={C.sage} opacity="0.75" />
      <circle cx="174" cy="122" r="6" fill={C.cream} opacity="0.8" />
      <path d="M134 167 L152 140 L166 154 L176 144 L188 162 Z" fill={C.sageDark} opacity="0.8" />
    </>
  ),
  dog: (
    <>
      <path d="M36 184 C34 130 70 100 104 110" stroke={C.burgundy} strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="108" cy="112" r="7" fill="none" stroke={C.charcoal} strokeWidth="4" />
      <rect x="86" y="128" width="72" height="22" rx="8" fill={C.cream} />
      <circle cx="86" cy="127" r="13" fill={C.cream} />
      <circle cx="86" cy="151" r="13" fill={C.cream} />
      <circle cx="158" cy="127" r="13" fill={C.cream} />
      <circle cx="158" cy="151" r="13" fill={C.cream} />
      <ellipse cx="160" cy="180" rx="36" ry="10" fill="none" stroke={C.sage} strokeWidth="9" />
      <circle cx="160" cy="192" r="7" fill={C.terracotta} />
    </>
  ),
  cat: (
    <>
      <path d="M40 188 C60 140 100 132 124 156 C146 178 182 176 202 140 V188 Z" fill={C.kraft} />
      <path d="M58 188 L70 160 M80 188 L92 148 M102 188 L110 146 M124 188 L126 158 M146 188 L146 172 M168 188 L170 174 M190 188 L194 156" stroke={C.kraftDark} strokeWidth="3" />
      <circle cx="84" cy="112" r="22" fill={C.burgundy} />
      <path d="M66 100 C80 108 96 108 104 100 M64 116 C80 124 98 122 106 114 M74 92 C78 108 78 120 72 132" stroke={C.berry} strokeWidth="3" fill="none" />
      <path d="M104 120 C124 132 116 148 140 150" stroke={C.burgundy} strokeWidth="3" fill="none" />
    </>
  ),
  plant: (
    <>
      <path d={leaf} fill={C.sage} />
      <path d={leaf} fill={C.leaf} transform="rotate(-38 120 134)" />
      <path d={leaf} fill={C.leaf} transform="rotate(38 120 134)" />
      <path d={leaf} fill={C.sage} transform="rotate(-70 120 134) scale(1)" />
      <path d={leaf} fill={C.sage} transform="rotate(70 120 134)" />
      <rect x="80" y="132" width="80" height="13" rx="3" fill="#c98d5e" />
      <path d="M86 145 H154 L146 188 H94 Z" fill={C.terracotta} />
    </>
  ),
  boardgame: (
    <>
      <path d="M36 160 L120 128 L204 160 L120 192 Z" fill={C.wood} />
      <path d="M57 152 L141 184 M78 144 L162 176 M99 136 L183 168 M57 168 L141 136 M78 176 L162 144 M99 184 L183 152" stroke={C.woodDark} strokeWidth="2" />
      <circle cx="120" cy="160" r="6" fill={C.burgundy} />
      <circle cx="99" cy="152" r="6" fill={C.burgundy} />
      <circle cx="141" cy="168" r="6" fill={C.sage} />
      <circle cx="141" cy="152" r="6" fill={C.sage} />
      <rect x="66" y="78" width="4" height="14" fill={C.woodDark} />
      <ellipse cx="68" cy="92" rx="18" ry="6" fill={C.terracotta} />
      <path d="M50 92 H86 L68 124 Z" fill={C.burgundy} />
      <path d="M56 102 H80" stroke={C.terracotta} strokeWidth="3" />
    </>
  ),
  cricket: (
    <>
      <g transform="rotate(-32 112 130)">
        <rect x="97" y="84" width="32" height="104" rx="9" fill={C.willow} />
        <rect x="97" y="84" width="6" height="104" rx="3" fill={C.kraft} />
        <rect x="106" y="36" width="14" height="52" rx="4" fill={C.charcoal} />
        <path d="M106 48 H120 M106 58 H120 M106 68 H120" stroke={C.burgundy} strokeWidth="3" />
      </g>
      <circle cx="176" cy="172" r="17" fill={C.burgundy} />
      <path d="M166 160 C173 168 173 176 166 184 M186 160 C179 168 179 176 186 184" stroke={C.cream} strokeWidth="2" strokeDasharray="3 3" fill="none" />
    </>
  ),
  cycling: (
    <>
      <circle cx="70" cy="158" r="30" fill="none" stroke={C.charcoal} strokeWidth="6" />
      <circle cx="172" cy="158" r="30" fill="none" stroke={C.charcoal} strokeWidth="6" />
      <path d="M70 158 L116 158 L100 112 Z M100 112 L156 112 L116 158 M156 112 L172 158" stroke={C.burgundy} strokeWidth="6" fill="none" strokeLinejoin="round" />
      <path d="M156 112 L152 96 M144 94 H164" stroke={C.charcoal} strokeWidth="5" strokeLinecap="round" />
      <path d="M100 112 L97 102" stroke={C.charcoal} strokeWidth="5" />
      <rect x="84" y="96" width="28" height="7" rx="3.5" fill={C.charcoal} />
      <rect x="88" y="118" width="7" height="12" rx="2" fill="#d23b3b" />
      <circle cx="116" cy="158" r="6" fill={C.terracotta} />
    </>
  ),
  climbing: (
    <>
      <ellipse cx="96" cy="164" rx="50" ry="22" fill="none" stroke={C.terracotta} strokeWidth="6" />
      <ellipse cx="96" cy="160" rx="42" ry="17" fill="none" stroke={C.burgundy} strokeWidth="6" />
      <ellipse cx="96" cy="156" rx="34" ry="12" fill="none" stroke={C.terracotta} strokeWidth="6" />
      <path d="M150 92 C150 70 186 70 186 92 L181 150 C181 172 150 172 150 150 Z" fill="none" stroke={C.sage} strokeWidth="8" />
      <path d="M150 104 L150 138" stroke={C.charcoal} strokeWidth="5" />
      <rect x="146" y="138" width="9" height="12" rx="2" fill={C.charcoal} />
    </>
  ),
  camping: (
    <>
      <circle cx="176" cy="66" r="12" fill={C.terracotta} />
      <circle cx="146" cy="56" r="2.5" fill={C.terracotta} />
      <circle cx="196" cy="94" r="2" fill={C.terracotta} />
      <path d="M44 188 L120 78 L196 188 Z" fill={C.sage} />
      <path d="M120 78 L98 188 H142 Z" fill={C.sageDark} />
      <path d="M120 112 L106 188 H120 Z" fill={C.back} opacity="0.7" />
      <path d="M120 78 L116 66" stroke={C.charcoal} strokeWidth="3" />
    </>
  ),
  outdoorwear: (
    <>
      <path d="M28 172 L88 92 L124 138 L156 102 L212 172 Z" fill={C.hill} />
      <path d="M88 92 L76 108 L88 104 L98 112 Z M156 102 L146 114 L156 110 L166 118 Z" fill={C.cream} />
      <path d="M100 116 H136 V156 C160 158 182 164 188 178 V186 H100 Z" fill={C.berry} />
      <rect x="96" y="184" width="96" height="8" rx="3" fill={C.charcoal} />
      <path d="M104 128 H132 M104 140 H132 M104 152 H134" stroke={C.terracotta} strokeWidth="3" />
      <rect x="98" y="110" width="40" height="8" rx="3" fill={C.burgundy} />
    </>
  ),
  backpack: (
    <>
      <path d="M108 82 C108 64 132 64 132 82" stroke={C.charcoal} strokeWidth="5" fill="none" />
      <rect x="74" y="80" width="92" height="110" rx="26" fill={C.burgundy} />
      <path d="M74 112 C74 84 166 84 166 112 V124 H74 Z" fill={C.berry} />
      <rect x="114" y="118" width="12" height="14" rx="2" fill={C.terracotta} />
      <rect x="92" y="142" width="56" height="38" rx="10" fill={C.berry} />
      <path d="M100 152 H140" stroke={C.terracotta} strokeWidth="3" />
    </>
  ),
  clay: (
    <>
      <path d="M68 188 C60 152 70 126 94 124 C118 126 126 152 118 188 Z" fill={C.terracotta} />
      <circle cx="94" cy="104" r="21" fill={C.terracotta} />
      <circle cx="87" cy="102" r="2.5" fill={C.charcoal} />
      <circle cx="101" cy="102" r="2.5" fill={C.charcoal} />
      <path d="M89 112 C92 115 96 115 99 112" stroke={C.charcoal} strokeWidth="2" fill="none" />
      <path d="M134 188 C130 162 138 146 156 146 C174 146 182 162 178 188 Z" fill="#c9876a" />
      <circle cx="156" cy="130" r="16" fill="#c9876a" />
      <circle cx="151" cy="128" r="2" fill={C.charcoal} />
      <circle cx="161" cy="128" r="2" fill={C.charcoal} />
      <path d="M196 188 C188 170 190 150 204 140 C210 156 212 172 206 188 Z" fill={C.sage} />
    </>
  ),
  copper: (
    <>
      <path d="M120 136 C144 136 144 174 120 174" stroke={C.copper} strokeWidth="10" fill="none" />
      <rect x="58" y="120" width="64" height="70" rx="6" fill={C.copper} />
      <ellipse cx="90" cy="120" rx="32" ry="5" fill={C.copperDark} />
      <circle cx="74" cy="142" r="4" fill={C.copperDark} opacity="0.35" />
      <circle cx="96" cy="156" r="4" fill={C.copperDark} opacity="0.35" />
      <circle cx="80" cy="172" r="4" fill={C.copperDark} opacity="0.35" />
      <circle cx="106" cy="136" r="4" fill={C.copperDark} opacity="0.35" />
      <path d="M136 160 H206 C206 182 192 190 171 190 C150 190 136 182 136 160 Z" fill={C.brass} />
      <ellipse cx="171" cy="160" rx="35" ry="6" fill={C.brassLight} />
    </>
  ),
  candle: (
    <>
      <rect x="78" y="108" width="84" height="82" rx="12" fill={C.cream} stroke={C.shadow} strokeWidth="2" />
      <rect x="85" y="130" width="70" height="54" rx="7" fill={C.blush} />
      <rect x="85" y="150" width="70" height="20" fill={C.terracotta} opacity="0.35" />
      <path d="M120 130 V120" stroke={C.charcoal} strokeWidth="2" />
      <path d="M120 90 C131 105 129 118 120 121 C111 118 109 105 120 90 Z" fill={C.terracotta} />
      <path d="M120 104 C125 111 124 117 120 118 C116 117 115 111 120 104 Z" fill="#f5d39a" />
      <rect x="168" y="146" width="40" height="44" rx="8" fill={C.cream} stroke={C.shadow} strokeWidth="2" />
      <rect x="172" y="158" width="32" height="28" rx="5" fill={C.sage} opacity="0.5" />
      <path d="M46 188 C46 168 40 156 36 148 M46 172 C52 164 58 162 62 160" stroke={C.leaf} strokeWidth="3" fill="none" />
    </>
  ),
  gift: (
    <>
      <rect x="70" y="122" width="100" height="68" fill={C.burgundy} />
      <rect x="64" y="108" width="112" height="18" fill={C.berry} />
      <rect x="114" y="108" width="12" height="82" fill={C.terracotta} />
      <path d="M120 108 C100 84 84 98 98 108 Z M120 108 C140 84 156 98 142 108 Z" fill={C.terracotta} />
    </>
  ),
};

/**
 * A drawn stand-in for a product photo we don't have permission to show.
 * It depicts the kind of thing, not the product, and is always badged.
 */
export function AiIllustration({ theme }: { theme: IllustrationTheme }) {
  return (
    <div className="absolute inset-0 bg-linen/50">
      <svg
        viewBox="0 0 240 240"
        role="img"
        aria-label={`AI illustration of ${LABEL[theme]}, not the actual product`}
        className="h-full w-full"
      >
        <circle cx="120" cy="116" r="88" fill={C.back} />
        <ellipse cx="120" cy="191" rx="86" ry="8" fill={C.shadow} opacity="0.6" />
        {SCENES[theme]}
      </svg>
      <span
        title="An AI-made illustration of this kind of gift, not a photo of the actual product"
        className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[0.68rem] font-medium tracking-wide whitespace-nowrap text-charcoal"
      >
        AI representation
      </span>
    </div>
  );
}
