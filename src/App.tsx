import { useEffect, useState } from "react"

export default function App() {
  const gridBg = (cell: number, line: string) =>
    ({
      backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
      backgroundSize: `${cell}px ${cell}px`,
      backgroundPosition: `0 0`,
    }) as const

  const HeaderBetChip = ({
    label,
    bg,
    text = "MIN/MAX: 2,000 / 20,000",
  }: {
    label: string
    bg: string
    text?: string
  }) => (
    <div className="flex items-center gap-2 whitespace-nowrap text-[13px] font-black tracking-wider text-[#ffe7a8]">
      <div
        className="grid h-5 w-5 place-items-center rounded-[4px] text-[12px] text-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)]"
        style={{ backgroundColor: bg }}
      >
        {label}
      </div>
      <div className="opacity-95">{text}</div>
    </div>
  )

  const [isHeaderEditing, setIsHeaderEditing] = useState(false)
  const [headerTitle, setHeaderTitle] = useState("Welcome to Baccarat")
  const [headerLines, setHeaderLines] = useState({
    banker: "MIN/MAX: 2,000 / 20,000",
    player: "MIN/MAX: 2,000 / 20,000",
    tie: "MIN/MAX: 2,000 / 20,000",
    pair: "PAIR: 2,000 / 20,000",
    super6: "SUPER6: 2,000 / 20,000",
  })

  type Bead = "banker" | "player" | "tie" | "bankerPair" | "playerPair" | "super6"

  const beadForKey = (key: number): Bead | null => {
    switch (key) {
      case 1:
        return "banker"
      case 2:
        return "player"
      case 3:
        return "tie"
      case 4:
        return "bankerPair"
      case 5:
        return "playerPair"
      case 6:
        return "super6"
      default:
        return null
    }
  }

  const beadNode = (bead: Bead) => {
    const size = 28
    switch (bead) {
      case "banker":
        return (
          <div
            className="grid place-items-center rounded-full bg-[#b90b0b] font-black shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)]"
            style={{ width: size, height: size, fontSize: 20 }}
          >
            莊
          </div>
        )
      case "player":
        return (
          <div
            className="grid place-items-center rounded-full bg-[#1a49c8] font-black shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)]"
            style={{ width: size, height: size, fontSize: 20 }}
          >
            閒
          </div>
        )
      case "tie":
        return (
          <div
            className="grid place-items-center rounded-full bg-[#1f7a44] font-black shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)]"
            style={{ width: size, height: size, fontSize: 20 }}
          >
            和
          </div>
        )
      case "bankerPair":
        return (
          <div
            className="grid place-items-center rounded-full border-[3px] border-[#b90b0b] bg-white font-black text-[#b90b0b] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)]"
            style={{ width: size, height: size, fontSize: 14 }}
          >
            B
          </div>
        )
      case "playerPair":
        return (
          <div
            className="grid place-items-center rounded-full border-[3px] border-[#1a49c8] bg-white font-black text-[#1a49c8] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)]"
            style={{ width: size, height: size, fontSize: 14 }}
          >
            P
          </div>
        )
      case "super6":
        return (
          <div
            className="grid place-items-center rounded-full bg-[#f7e7b4] font-black text-black shadow-[inset_0_0_0_2px_rgba(0,0,0,0.2)]"
            style={{ width: size, height: size, fontSize: 14 }}
          >
            6
          </div>
        )
    }
  }

  const [beads, setBeads] = useState<Bead[]>([])

  const addBeadByKey = (key: number) => {
    const bead = beadForKey(key)
    if (!bead) return
    setBeads((prev) => [...prev, bead])
  }

  useEffect(() => {
    let last8At = 0
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTypingSurface =
        tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable
      if (isTypingSurface) return

      if (e.key === "8") {
        const now = Date.now()
        if (now - last8At <= 700) {
          setIsHeaderEditing((v) => !v)
          last8At = 0
          return
        }
        last8At = now
      }

      if (isHeaderEditing) return

      if (e.key >= "1" && e.key <= "6") {
        addBeadByKey(Number(e.key))
      } else if (e.key === "Backspace") {
        setBeads((prev) => prev.slice(0, -1))
      } else if (e.key === "Escape") {
        setBeads([])
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isHeaderEditing])

  const RoadBeads = ({ cell }: { cell: number }) => {
    const pad = Math.max(6, Math.floor(cell * 0.18))
    const beadBox = Math.max(12, Math.min(30, cell - pad * 2))
    return (
      <div className="absolute inset-0 p-[6px]">
        <div
          className="grid h-full w-full content-start justify-start gap-0"
          style={{
            gridTemplateColumns: `repeat(auto-fit, ${cell}px)`,
            gridAutoRows: `${cell}px`,
          }}
        >
          {beads.map((b, i) => (
            <div
              key={i}
              className="grid place-items-center"
              style={{ width: cell, height: cell, padding: pad, boxSizing: "border-box" }}
            >
              <div style={{ transform: `scale(${beadBox / 30})`, transformOrigin: "center" }}>
                {beadNode(b)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden text-white">
      <div className="mx-auto w-full max-w-[1920px] rounded-[12px] bg-[#7a0000] shadow-[0_20px_70px_rgba(0,0,0,0.45)]">

        {/* Scroll container */}
        <div className="overflow-x-auto">

          {/* Fixed casino board width */}
          <div className="h-[calc(100vh-24px)]">
            <div className="grid h-full w-full grid-rows-[56px_1fr]">

              {/* Header */}
              <div className="relative flex items-center justify-between gap-4 bg-blue-800 px-4">
                <div className="flex items-center gap-3">
                  <div className="text-[26px] font-black tracking-wide text-[#ffd25c] drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">
                    {headerTitle}
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <HeaderBetChip label="B" bg="#b90b0b" text={headerLines.banker} />
                  <HeaderBetChip label="P" bg="#1a49c8" text={headerLines.player} />
                  <HeaderBetChip label="T" bg="#1f7a44" text={headerLines.tie} />
                  <HeaderBetChip label="●" bg="#d6b54b" text={headerLines.pair} />
                  <HeaderBetChip label="6" bg="#7a0000" text={headerLines.super6} />
                </div>

                {isHeaderEditing ? (
                  <div className="absolute left-0 top-full z-20 w-full bg-blue-950/95 px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[13px] font-black tracking-widest text-[#ffe7a8]">
                        Header Edit (press 88 to close)
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsHeaderEditing(false)}
                        className="rounded-[10px] bg-white/10 px-3 py-1 text-[12px] font-black text-white hover:bg-white/15"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      <input
                        value={headerTitle}
                        onChange={(e) => setHeaderTitle(e.target.value)}
                        className="col-span-2 h-10 rounded-[10px] bg-white px-3 text-[14px] font-black text-black outline-none"
                        placeholder="Title"
                      />

                      <input
                        value={headerLines.banker}
                        onChange={(e) => setHeaderLines((p) => ({ ...p, banker: e.target.value }))}
                        className="h-10 rounded-[10px] bg-white px-3 text-[12px] font-black text-black outline-none"
                        placeholder="B text"
                      />
                      <input
                        value={headerLines.player}
                        onChange={(e) => setHeaderLines((p) => ({ ...p, player: e.target.value }))}
                        className="h-10 rounded-[10px] bg-white px-3 text-[12px] font-black text-black outline-none"
                        placeholder="P text"
                      />
                      <input
                        value={headerLines.tie}
                        onChange={(e) => setHeaderLines((p) => ({ ...p, tie: e.target.value }))}
                        className="h-10 rounded-[10px] bg-white px-3 text-[12px] font-black text-black outline-none"
                        placeholder="T text"
                      />
                      <input
                        value={headerLines.pair}
                        onChange={(e) => setHeaderLines((p) => ({ ...p, pair: e.target.value }))}
                        className="h-10 rounded-[10px] bg-white px-3 text-[12px] font-black text-black outline-none"
                        placeholder="PAIR text"
                      />
                      <input
                        value={headerLines.super6}
                        onChange={(e) => setHeaderLines((p) => ({ ...p, super6: e.target.value }))}
                        className="h-10 rounded-[10px] bg-white px-3 text-[12px] font-black text-black outline-none"
                        placeholder="SUPER6 text"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Board */}
              <div className="relative bg-blue-900 p-3">
                <div className="grid h-full w-full grid-rows-[1.05fr_0.62fr_1fr] gap-3">

                  {/* Big Road */}
                  <div className="rounded-[10px] rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)] p-[6px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    <div
                      className="relative h-full w-full rounded-[7px] bg-white"
                      style={gridBg(38, "rgba(0,0,0,0.22)")}
                    >
                      <RoadBeads cell={38} />
                    </div>
                  </div>

                  {/* Small Roads */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Big Eye Boy */}
                    <div className="rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                      <div className="h-full w-full rounded-[7px] bg-[#0b1b78] p-[6px]">
                        <div
                          className="relative h-full w-full rounded-[7px] bg-white"
                          style={gridBg(34, "rgba(0,0,0,0.22)")}
                        >
                          <RoadBeads cell={34} />
                        </div>
                      </div>
                    </div>

                    {/* Cockroach Road */}
                    <div className="rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                      <div className="h-full w-full rounded-[7px] bg-[#0b1b78] p-[6px]">
                        <div
                          className="relative h-full w-full rounded-[7px] bg-white"
                          style={gridBg(34, "rgba(0,0,0,0.22)")}
                        >
                          <RoadBeads cell={34} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Area */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Bead Plate */}
                    <div className="rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                      <div
                        className="relative h-full w-full rounded-[7px] bg-white"
                        style={gridBg(38, "rgba(0,0,0,0.22)")}
                      >
                        {/* Beads (row-major: first row fills left -> right) */}
                        <RoadBeads cell={38} />

                        {/* BACKGROUND LABEL */}
                      </div>
                    </div>

                    {/* Score Panel */}
                    <div className="flex gap-4">

                      <div className="rounded-[12px] rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)] p-[6px] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                        <div className="grid h-full w-full grid-rows-[1fr_auto] gap-2 rounded-[10px] bg-gradient-to-b from-[#e7c86f] to-[#c3922d] p-3 text-black">

                          <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2 text-[24px] font-black tracking-widest">

                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#b90b0b] text-white">
                             B
                            </div>
                            <div className="self-center">BANKER</div>
                            <div className="self-center text-right">3</div>

                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1a49c8] text-white">
                              P
                            </div>
                            <div className="self-center">PLAYER</div>
                            <div className="self-center text-right">1</div>

                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1f7a44] text-white">
                              T
                            </div>
                            <div className="self-center">TIE</div>
                            <div className="self-center text-right">0</div>
                          </div>

                          <div className="grid grid-cols-[1fr_auto] items-end gap-3">

                            <div className="text-[18px] font-black tracking-wider">

                              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-[#f7e7b4] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]" />
                                <div>BANKER PAIR</div>
                                <div className="text-right">0</div>
                              </div>

                              <div className="mt-1 grid grid-cols-[auto_1fr_auto] items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-[#f7e7b4] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]" />
                                <div>PLAYER PAIR</div>
                                <div className="text-right">0</div>
                              </div>

                              <div className="mt-1 grid grid-cols-[auto_1fr_auto] items-center gap-2">
                                <div className="grid h-6 w-6 place-items-center rounded-full bg-[#f7e7b4] text-[12px] font-black shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]">
                                  6
                                </div>
                                <div>SUPER6</div>
                                <div className="text-right">1</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[10px] rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)] p-2 shadow-[inset_0_0_0_2px_rgba(140,90,10,0.35)]">
                        <div className="text-black text-center text-[22px] font-black">
                          NEXT
                        </div>

                        <div className="text-black text-center text-[22px] font-black">
                          PRED
                        </div>

                        <div className="mt-2 flex items-center justify-center gap-2">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#b90b0b] text-[18px] font-black text-white">
                            B
                          </div>

                          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1a49c8] text-[18px] font-black text-white">
                            P
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 place-items-center">
                          <div className="h-6 w-6 rounded-full border-[3.5px] border-red-800" />
                          <div className="h-6 w-6 rounded-full border-[3.5px] border-blue-800" />
                          <div className="h-6 w-6 rounded-full bg-red-800" />
                          <div className="h-6 w-6 rounded-full bg-blue-800" />
                        </div>
                      </div>

                      <div className="p-4 ">
                        <div className="grid h-full place-items-center">

                          <div className="text-center">
                            <div className="text-[44px] font-black tracking-widest text-[#ffd25c] drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">
                              AMYLQ
                            </div>

                            <div className="mt-3 text-[34px] font-black tracking-widest text-[#ffe7a8]">
                              公平公正
                            </div>

                            <div className="mt-1 text-[18px] font-bold tracking-[0.18em] text-[#ffe7a8]/90">
                              GONG PING GONG ZHENG
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
