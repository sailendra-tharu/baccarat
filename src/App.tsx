import { useEffect, useState, useRef, memo } from "react"
import { invoke } from "@tauri-apps/api/core";
import CasinoSettingsModal from "./components/modal";
import { useAppImages } from "./hooks/useAppImages";

const KEYWORD = "88Enter";

type PendriveLicenseStatus = {
  unlocked: boolean;
  message: string;
  license_path?: string | null;
}

type Bead = "banker" | "player" | "tie" | "bankerPair" | "playerPair" | "super6"

interface RoadBeadsProps {
  beads: Bead[];
  bankerLogo: string;
  playerLogo: string;
  tieLogo: string;
  bankerpairlogo: string;
  playerpairlogo: string;
  super6logo: string;
  variant?: 'logo' | 'dot' | 'bigDot' | 'stick' | 'pin';
}

// For Big Road: plain colored circles, but Super6 uses its logo
const beadDot = (bead: Bead, super6logo: string, size = '88%') => {
  // Banker Pair = hollow red ring, Player Pair = hollow blue ring
  if (bead === 'bankerPair') {
    return (
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: 'white',
          border: '3px solid #b90b0b',
          boxSizing: 'border-box',
        }}
      />
    );
  }
  if (bead === 'playerPair') {
    return (
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: 'white',
          border: '3px solid #1a49c8',
          boxSizing: 'border-box',
        }}
      />
    );
  }
  // Super6 uses logo image
  if (bead === 'super6') {
    return (
      <div
        className="grid place-items-center rounded-full bg-[#f7e7b4] shadow-[inset_0_0_0_2px_rgba(0,0,0,0.2)] overflow-hidden"
        style={{ width: '100%', height: '100%' }}
      >
        <img src={super6logo} alt="S6" className="w-full h-full object-cover" />
      </div>
    );
  }

  const configs: Record<Bead, { bg: string }> = {
    banker: { bg: '#b90b0b' },
    player: { bg: '#1a49c8' },
    tie: { bg: '#1f7a44' },
    bankerPair: { bg: '#b90b0b' },
    playerPair: { bg: '#1a49c8' },
    super6: { bg: '#d4a017' },
  };
  const { bg } = configs[bead];
  return (
    <div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
      }}
    />
  );
};

// For Cockroach Road: diagonal sticks/lines
const beadStick = (bead: Bead) => {
  const colorMap: Record<Bead, string> = {
    banker: 'red',
    player: '#1a49c8',
    tie: '#1f7a44',
    bankerPair: 'red',
    playerPair: '#1a49c8',
    super6: 'brown',
  };
  const color = colorMap[bead];
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '2px',
          height: '85%',
          backgroundColor: color,
          transform: 'rotate(-45deg)',
          borderRadius: '1px',
        }}
      />
    </div>
  );
};

const beadNode = (
  bead: Bead,
  bankerLogo: string,
  playerLogo: string,
  tieLogo: string,
  bankerpairlogo: string,
  playerpairlogo: string,
  super6logo: string
) => {
  switch (bead) {
    case "banker":
      return (
        <div className="grid place-items-center rounded-full bg-[#b90b0b] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.8)] overflow-hidden" style={{ width: '100%', height: '100%' }}>
          <img src={bankerLogo} alt="B" className="w-full h-full object-cover" />
        </div>
      )
    case "player":
      return (
        <div className="grid place-items-center rounded-full bg-[#1a49c8] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.8)] overflow-hidden" style={{ width: '100%', height: '100%' }}>
          <img src={playerLogo} alt="P" className="w-full h-full object-cover" />
        </div>
      )
    case "tie":
      return (
        <div className="grid place-items-center rounded-full bg-[#1f7a44] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.8)] overflow-hidden" style={{ width: '100%', height: '100%' }}>
          <img src={tieLogo} alt="T" className="w-full h-full object-cover" />
        </div>
      )
    case "bankerPair":
      return (
        <div className="grid place-items-center" style={{ width: '100%', height: '100%' }}>
          <img src={bankerpairlogo} alt="BP" className="w-full h-full object-contain" />
        </div>
      )
    case "playerPair":
      return (
        <div className="grid place-items-center" style={{ width: '100%', height: '100%' }}>
          <img src={playerpairlogo} alt="PP" className="w-full h-full object-contain" />
        </div>
      )
    case "super6":
      return (
        <div className="grid place-items-center rounded-full bg-[#f7e7b4] shadow-[inset_0_0_0_2px_rgba(0,0,0,0.2)] overflow-hidden" style={{ width: '100%', height: '100%' }}>
          <img src={super6logo} alt="S6" className="w-full h-full object-cover" />
        </div>
      )
  }
}

const beadPin = (bead: Bead) => {
  const colors: Record<Bead, { fill: string; stroke: string }> = {
    banker: { fill: 'red', stroke: 'red' },
    player: { fill: '#1d75b8', stroke: '#1d75b8' },
    tie: { fill: '#29a764', stroke: '#29a764' },
    bankerPair: { fill: 'red', stroke: 'red' },
    playerPair: { fill: '#1d75b8', stroke: '#1d75b8' },
    super6: { fill: 'brown', stroke: 'brown' },
  };
  const { fill, stroke } = colors[bead];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[82%] w-[82%] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]"
      aria-hidden="true"
    >
      <path d="M12 17v5" />
      <path
        d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"
        fill={fill}
      />
    </svg>
  );
}

const RoadBeads = memo(({ beads, bankerLogo, playerLogo, tieLogo, bankerpairlogo, playerpairlogo, super6logo, variant = 'logo' }: RoadBeadsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(28);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newSize = Math.max(10, (entry.contentRect.height - 7) / 6);
        setSize(newSize);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const rows = 6;
  const cols = 100;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden overscroll-none"
      onWheel={(event) => event.preventDefault()}
      onTouchMove={(event) => event.preventDefault()}
    >
      <div
        className="grid content-start justify-start"
        style={{
          gridTemplateRows: `repeat(${rows}, ${size}px)`,
          gridAutoColumns: `${size}px`,
          gridAutoFlow: "column",
          gap: '1px',
          backgroundColor: 'rgba(0,0,0,0.22)',
          padding: '1px',
          minWidth: '100%',
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const b = beads[i];
          return (
            <div key={i} className="relative bg-white flex items-center justify-center overflow-hidden">
              {b && (
                <div className={`${variant === 'logo' ? 'w-[96%] h-[96%]' : 'w-[92%] h-[92%]'} grid place-items-center`}>
                  {variant === 'dot' || variant === 'bigDot'
                    ? beadDot(b, super6logo, variant === 'bigDot' ? '94%' : '88%')
                    : variant === 'stick'
                      ? beadStick(b)
                      : variant === 'pin'
                        ? beadPin(b)
                        : beadNode(b, bankerLogo, playerLogo, tieLogo, bankerpairlogo, playerpairlogo, super6logo)
                  }
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

const initialSettings = {
  language: "English",
  shoeNo: "1",
  bpMin: 2000,
  tieMin: 2000,
  pairMin: 2000,
  super6Min: 1000,
  music: "开",
  tableNo: "A18",
  threeStar: "开",
  annou: "Welcome To The Raadshah Casino",
  timer: 30,
  bpMax: 20000,
  tieMax: 20000,
  pairMax: 20000,
  super6Max: 10000,
  audio: "开",
  chipType: "RAM",
  logo: "开",
};

export default function App() {
  const imgs = useAppImages();
  const bankerLogo = imgs.banker;
  const playerLogo = imgs.player;
  const tieLogo = imgs.tie;
  const bankerpairlogo = imgs.bankerPair;
  const playerpairlogo = imgs.playerPair;
  const super6logo = imgs.super6;
  const baccaratlogo = imgs.baccarat;


  const [casinoSettings, setCasinoSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("casino_settings")
      return saved ? JSON.parse(saved) : initialSettings
    } catch {
      return initialSettings
    }
  })
  useEffect(() => {
    localStorage.setItem(
      "casino_settings",
      JSON.stringify(casinoSettings)
    )
  }, [casinoSettings])

  const [open, setOpen] = useState(false);

  // Security Lock State (null = checking pendrive license)
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [licenseMessage, setLicenseMessage] = useState("Checking pendrive license...");
  const missingPendriveDialogShownRef = useRef(false);
  const failedLicenseChecksRef = useRef(0);

  const checkPendriveLicense = async () => {
    try {
      const status = await invoke<PendriveLicenseStatus>("check_pendrive_license");
      setLicenseMessage(status.message);
      if (status.unlocked) {
        failedLicenseChecksRef.current = 0;
        setIsUnlocked(true);
        return;
      }

      failedLicenseChecksRef.current += 1;
      setIsUnlocked((current) => {
        if (current === true && failedLicenseChecksRef.current < 3) {
          return true;
        }
        return false;
      });
    } catch (error) {
      setLicenseMessage(error instanceof Error ? error.message : String(error));
      failedLicenseChecksRef.current += 1;
      setIsUnlocked((current) => {
        if (current === true && failedLicenseChecksRef.current < 3) {
          return true;
        }
        return false;
      });
    }
  };

  useEffect(() => {
    checkPendriveLicense();
    const interval = window.setInterval(checkPendriveLicense, 3000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isUnlocked === false && !missingPendriveDialogShownRef.current) {
      missingPendriveDialogShownRef.current = true;
      invoke("show_pendrive_required_dialog", { message: licenseMessage }).catch(() => { });
    }
  }, [isUnlocked, licenseMessage]);

  const bufferRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isUnlocked) return; // Completely ignore keyboard shortcuts if the system is locked

      // Ignore typing inside inputs
      const tag = document.activeElement?.tagName?.toLowerCase();

      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select"
      ) {
        return;
      }

      bufferRef.current += e.key;

      // Keep only latest chars
      if (bufferRef.current.length > KEYWORD.length) {
        bufferRef.current = bufferRef.current.slice(-KEYWORD.length);
      }

      // Open modal when "88" typed
      if (bufferRef.current === KEYWORD) {
        setOpen(true);
        bufferRef.current = "";
      }

      if (bufferRef.current === "77Enter") {
        try {
          const savedBeads = localStorage.getItem("baccarat_beads")
          if (savedBeads) setBeads(JSON.parse(savedBeads))
          const savedShoe = localStorage.getItem("baccarat_shoe")
          if (savedShoe) setShoeNumber(Number(savedShoe))
        } catch { }
        bufferRef.current = "";
      }

      // Reset after inactivity
      clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(() => {
        bufferRef.current = "";
      }, 1500);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, [isUnlocked]);


  const HeaderBetChip = ({
    chips,
    text,
  }: {
    chips: { label?: React.ReactNode; bg: string; isCircle?: boolean }[]
    text: string
  }) => (
    <div className="flex items-center gap-2 whitespace-nowrap text-[22px] font-black tracking-wider text-[#ffe7a8]">
      <div className="flex gap-1">
        {chips.map((c, i) => (
          <div
            key={i}
            className={`grid h-10 w-10 place-items-center text-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)] overflow-hidden ${c.isCircle ? 'rounded-full' : 'rounded-[4px] text-[12px]'}`}
            style={{ backgroundColor: c.bg }}
          >
            {c.label}
          </div>
        ))}
      </div>
      <div className="opacity-95">{text}</div>
    </div>
  )

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

  const [beads, _setBeads] = useState<Bead[]>([])

  const setBeads = (val: Bead[] | ((prev: Bead[]) => Bead[])) => {
    _setBeads(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem("baccarat_beads", JSON.stringify(next))
      } catch { }
      return next;
    })
  }

  // Pending bead awaiting confirmation
  const [pendingBead, setPendingBead] = useState<Bead | null>(null)

  const addBeadByKey = (key: number) => {
    const bead = beadForKey(key)
    if (!bead) return
    setPendingBead(bead)
  }

  const confirmPendingBead = () => {
    if (!pendingBead) return
    setBeads((prev) => [...prev, pendingBead])
    setPendingBead(null)
  }

  const cancelPendingBead = () => {
    setPendingBead(null)
  }

  const bankerCount = beads.filter(b => b === "banker").length
  const playerCount = beads.filter(b => b === "player").length
  const tieCount = beads.filter(b => b === "tie").length
  const bankerPairCount = beads.filter(b => b === "bankerPair").length
  const playerPairCount = beads.filter(b => b === "playerPair").length
  const super6Count = beads.filter(b => b === "super6").length

  const totalCount = beads.length


  const [shoeNumber, _setShoeNumber] = useState(1)

  const setShoeNumber = (val: number | ((prev: number) => number)) => {
    _setShoeNumber(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem("baccarat_shoe", String(next))
      } catch { }
      return next;
    })
  }



  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isUnlocked) return; // Completely ignore keyboard shortcuts if the system is locked

      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTypingSurface =
        tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable
      if (isTypingSurface || open) return

      // If a pending bead modal is open, handle Enter/Escape
      if (pendingBead !== null) {
        if (e.key === "Enter") {
          confirmPendingBead()
        } else if (e.key === "Escape") {
          cancelPendingBead()
        }
        return
      }

      if (e.key >= "1" && e.key <= "6") {
        addBeadByKey(Number(e.key))
      } else if (e.key === "Backspace") {
        setBeads((prev) => prev.slice(0, -1))
      } else if (e.key === "Escape" || e.key === "0") {
        setBeads([])
        setShoeNumber(prev => prev + 1)
      }

    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, pendingBead, isUnlocked])

  // RoadBeads is now a top-level memoized component — no re-render flicker!

  const beadLabel = (bead: Bead) => {
    switch (bead) {
      case "banker": return { label: "BANKER", logo: bankerLogo, bg: "#b90b0b", key: "1" }
      case "player": return { label: "PLAYER", logo: playerLogo, bg: "#1a49c8", key: "2" }
      case "tie": return { label: "TIE", logo: tieLogo, bg: "#1f7a44", key: "3" }
      case "bankerPair": return { label: "BANKER PAIR", logo: bankerpairlogo, key: "4" }
      case "playerPair": return { label: "PLAYER PAIR", logo: playerpairlogo, key: "5" }
      case "super6": return { label: "SUPER 6", logo: super6logo, bg: "#b90b0b", key: "6" }
    }
  }

  if (isUnlocked === null) {
    return <div className="h-screen w-full bg-black"></div>;
  }

  if (isUnlocked === false) {
    return <div className="h-screen w-full bg-black"></div>;
  }

  return (
    <div className="h-screen overflow-hidden text-white flex flex-col bg-[#7a0000]">

      {/* Pending Bead Confirmation Modal */}
      {pendingBead && (() => {
        const info = beadLabel(pendingBead)
        return (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.72)" }}
          >
            <div
              className="relative flex flex-col items-center gap-6 rounded-[20px] px-12 py-10"

            >
              <div
                className="absolute -top-px -left-px -right-px -bottom-px rounded-[20px] pointer-events-none"
              />
              <div
                className="grid place-items-center  overflow-hidden"
                style={{
                  width: 210,
                  height: 210,
                }}
              >
                {info.logo && <img src={info.logo} alt={info.label} className="w-full h-full object-cover" />}
              </div>

              <div className="text-[28px] font-black tracking-[0.18em] text-white">
                {info.label}
              </div>

            </div>
          </div>
        )
      })()}
      <div className="flex-1 flex flex-col w-full bg-[#7a0000] md:min-h-0">

        {/* Board wrapper */}
        <div className="flex flex-col flex-1 md:min-h-0 md:overflow-hidden">
          <div className="flex flex-col flex-1 md:min-h-0">
            <div className="flex flex-col flex-1 md:grid md:flex-none md:h-full md:grid-rows-[auto_1fr]">

              {/* Header */}
              <div className="relative flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-blue-800 px-3 py-2 md:px-4 md:min-h-[56px]">
                <div className="flex items-center gap-3">
                  <div className="text-[14px] md:text-[40px]  font-black tracking-wide text-[#ffd25c] drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] whitespace-nowrap">
                    WELCOME TO BACCARAT
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <HeaderBetChip
                    chips={[
                      { label: <img src={bankerLogo} alt="B" className="w-full h-full object-cover" />, bg: "#b90b0b", isCircle: true },
                      { label: <img src={playerLogo} alt="P" className="w-full h-full object-cover" />, bg: "#1a49c8", isCircle: true }
                    ]}
                    text={`MIN/MAX: ${casinoSettings.bpMin} / ${casinoSettings.bpMax}`}
                  />

                  <HeaderBetChip
                    chips={[{ label: <img src={tieLogo} alt="T" className="w-full h-full object-cover" />, bg: "#1f7a44", isCircle: true }]}
                    text={`MIN/MAX: ${casinoSettings.tieMin} / ${casinoSettings.tieMax}`}
                  />

                  <HeaderBetChip
                    chips={[{ bg: "#d6b54b", isCircle: true }]}
                    text={`PAIR: ${casinoSettings.pairMin} / ${casinoSettings.pairMax}`}
                  />

                  <HeaderBetChip
                    chips={[{ label: <img src={super6logo} alt="6" className="w-full h-full object-cover" />, bg: "#7a0000", isCircle: true }]}
                    text={`SUPER6: ${casinoSettings.super6Min} / ${casinoSettings.super6Max}`}
                  />
                </div>
              </div>

              {/* Board */}
              <div className="relative bg-blue-900 p-2 md:p-3 flex-1 md:min-h-0 md:h-full md:overflow-hidden">
                <div className="flex flex-col gap-2 md:grid md:h-full md:gap-3 md:grid-rows-[1.6fr_1.25fr_1.45fr]">

                  {/* Score Row — Bead Plate + Score Panel (FIRST, below header) */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">

                    {/* Bead Plate */}
                    <div className="min-h-[270px] md:min-h-0 rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                      <div className="relative h-full w-full rounded-[7px] bg-white overflow-hidden">
                        <RoadBeads beads={beads} bankerLogo={bankerLogo} playerLogo={playerLogo} tieLogo={tieLogo} bankerpairlogo={bankerpairlogo} playerpairlogo={playerpairlogo} super6logo={super6logo} />
                        <span className="pointer-events-none absolute bottom-1 right-2 select-none text-[11px] md:text-[25px] font-medium tracking-wide text-gray-300">Bead Plate</span>
                      </div>
                    </div>

                    {/* Score Panel */}
                    <div className="flex gap-1 md:gap-3 min-h-[300px] md:min-h-0">
                      <div className="flex-1 rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[4px] md:p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden">
                        <div className="grid h-full w-full grid-rows-[1fr_auto] gap-2 md:gap-3 rounded-[8px] bg-gradient-to-b from-[#e7c86f] to-[#c3922d] p-2 md:p-4 text-black overflow-hidden">
                          <div className="grid grid-cols-[32px_1fr_auto] items-center gap-x-1 md:grid-cols-[40px_1fr_auto] md:gap-x-3 gap-y-2 md:gap-y-4 text-[10px] sm:text-[13px] md:text-[18px] lg:text-[22px] font-black tracking-tight md:tracking-widest">
                            <div className="grid h-6 w-6 place-items-center justify-self-center rounded-full bg-[#b90b0b] text-white md:h-8 md:w-8"><img src={bankerLogo} alt="banker" className="w-full h-full object-cover" /></div>
                            <div className="self-center">BANKER</div>
                            <div className="self-center text-right">{bankerCount}</div>
                            <div className="grid h-6 w-6 place-items-center justify-self-center rounded-full bg-[#1a49c8] text-white md:h-8 md:w-8"><img src={playerLogo} alt="player" className="w-full h-full object-cover" /></div>
                            <div className="self-center">PLAYER</div>
                            <div className="self-center text-right">{playerCount}</div>
                            <div className="grid h-6 w-6 place-items-center justify-self-center rounded-full bg-[#1f7a44] text-white md:h-8 md:w-8"><img src={tieLogo} alt="tie" className="w-full h-full object-cover" /></div>
                            <div className="self-center">TIE</div>
                            <div className="self-center text-right">{tieCount}</div>
                          </div>
                          <div className="text-[10px] sm:text-[13px] md:text-[16px] lg:text-[18px] font-black tracking-wider">
                            <div className="grid grid-cols-[32px_1fr_auto] items-center gap-1 md:grid-cols-[40px_1fr_auto] md:gap-2">
                              <div className="grid h-5 w-5 place-items-center justify-self-center md:h-7 md:w-7"><img src={bankerpairlogo} alt="banker pair" className="w-full h-full object-contain" /></div>
                              <div>BANKER PAIR</div><div className="text-right">{bankerPairCount}</div>
                            </div>
                            <div className="mt-2 grid grid-cols-[32px_1fr_auto] items-center gap-1 md:mt-3 md:grid-cols-[40px_1fr_auto] md:gap-2">
                              <div className="grid h-5 w-5 place-items-center justify-self-center md:h-7 md:w-7"><img src={playerpairlogo} alt="player pair" className="w-full h-full object-contain" /></div>
                              <div>PLAYER PAIR</div><div className="text-right">{playerPairCount}</div>
                            </div>
                            <div className="mt-2 grid grid-cols-[32px_1fr_auto] items-center gap-1 md:mt-3 md:grid-cols-[40px_1fr_auto] md:gap-2">
                              <img src={super6logo} alt="super6" className="h-5 w-5 justify-self-center object-cover md:h-[26px] md:w-[26px]" />
                              <div>SUPER6</div><div className="text-right">{super6Count}</div>
                            </div>
                            <div className="border border-yellow-400 mt-3"></div>
                            <div className="flex justify-between mt-1">
                              <div>Shoe:{shoeNumber}</div><div>Game:{totalCount}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* NEXT PRED */}
                      <div className="rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[4px] md:p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                        <div className="h-full flex flex-col mt-4 gap-1 p-1 md:p-2">
                          <div className="text-black text-center text-[13px] sm:text-[16px] md:text-[20px] font-black">NEXT</div>
                          <div className="text-black text-center text-[13px] sm:text-[16px] md:text-[20px] font-black">PRED</div>
                          <div className="mt-1 flex items-center justify-center gap-1 md:gap-2">
                            <div className="grid h-5 w-5 md:h-8 md:w-8 place-items-center rounded-full bg-[#b90b0b] text-white overflow-hidden"><img src={bankerLogo} alt="banker" className="w-full h-full object-cover" /></div>
                            <div className="grid h-5 w-5 md:h-8 md:w-8 place-items-center rounded-full bg-[#1a49c8] text-white overflow-hidden"><img src={playerLogo} alt="player" className="w-full h-full object-cover" /></div>
                          </div>
                          <div className="mt-1 md:mt-3 grid grid-cols-2 gap-1 md:gap-2 place-items-center">
                            <div className="h-4 w-4 md:h-6 md:w-6 rounded-full border-[3px] border-red-800" />
                            <div className="h-4 w-4 md:h-6 md:w-6 rounded-full border-[3px] border-blue-800" />
                            <div className="h-4 w-4 md:h-6 md:w-6 rounded-full bg-red-800" />
                            <div className="h-4 w-4 md:h-6 md:w-6 rounded-full bg-blue-800" />
                            <div className="grid h-4 w-4 place-items-center md:h-6 md:w-6">{beadStick("banker")}</div>
                            <div className="grid h-4 w-4 place-items-center md:h-6 md:w-6">{beadStick("player")}</div>
                            <div className="grid h-4 w-4 place-items-center md:h-6 md:w-6">{beadPin("banker")}</div>
                            <div className="grid h-4 w-4 place-items-center md:h-6 md:w-6">{beadPin("player")}</div>
                          </div>
                        </div>
                      </div>

                      {/* Logo */}
                      <div className="hidden sm:flex flex-1 items-center justify-center p-2">
                        <img src={baccaratlogo} className="w-full max-w-[120px] md:max-w-[200px] lg:max-w-[280px] h-auto object-contain" alt="logo" />
                      </div>
                    </div>
                  </div>

                  {/* Big Road — SECOND */}
                  <div className="min-h-[120px] md:min-h-0 rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                    <div className="relative h-full w-full rounded-[7px] bg-white overflow-hidden">
                      <RoadBeads beads={beads} bankerLogo={bankerLogo} playerLogo={playerLogo} tieLogo={tieLogo} bankerpairlogo={bankerpairlogo} playerpairlogo={playerpairlogo} super6logo={super6logo} variant="bigDot" />
                      <span className="pointer-events-none absolute bottom-2 right-3 select-none text-[16px] md:text-[25px] font-medium tracking-wide text-gray-300">Big Road</span>
                    </div>
                  </div>

                  {/* Small Roads — THIRD */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="min-h-[180px] md:min-h-0 rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                      <div className="h-full w-full rounded-[7px] bg-[#0b1b78] p-[6px]">
                        <div className="relative h-full w-full rounded-[7px] bg-white overflow-hidden">
                          <RoadBeads beads={beads} bankerLogo={bankerLogo} playerLogo={playerLogo} tieLogo={tieLogo} bankerpairlogo={bankerpairlogo} playerpairlogo={playerpairlogo} super6logo={super6logo} variant="dot" />
                          <span className="pointer-events-none absolute bottom-1 right-2 select-none text-[11px] md:text-[16px] font-semibold tracking-wide text-gray-300">Big Eye Boy</span>
                        </div>
                      </div>
                    </div>
                    <div className="min-h-[180px] md:min-h-0 rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                      <div className="h-full w-full rounded-[7px] bg-[#0b1b78] p-[6px]">
                        <div className="relative h-full w-full rounded-[7px] bg-white overflow-hidden">
                          <RoadBeads beads={beads} bankerLogo={bankerLogo} playerLogo={playerLogo} tieLogo={tieLogo} bankerpairlogo={bankerpairlogo} playerpairlogo={playerpairlogo} super6logo={super6logo} variant="stick" />
                          <span className="pointer-events-none absolute bottom-1 right-2 select-none text-[11px] md:text-[16px] font-semibold tracking-wide text-gray-300">Cockroach Road</span>
                        </div>
                      </div>
                    </div>
                    <div className="min-h-[180px] md:min-h-0 rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                      <div className="h-full w-full rounded-[7px] bg-[#0b1b78] p-[6px]">
                        <div className="relative h-full w-full rounded-[7px] bg-white overflow-hidden">
                          <RoadBeads beads={beads} bankerLogo={bankerLogo} playerLogo={playerLogo} tieLogo={tieLogo} bankerpairlogo={bankerpairlogo} playerpairlogo={playerpairlogo} super6logo={super6logo} variant="pin" />
                          <span className="pointer-events-none absolute bottom-1 right-2 select-none text-[11px] md:text-[16px] font-semibold tracking-wide text-gray-300">Small Road</span>
                        </div>
                      </div>
                    </div>
                    <div className="min-h-[180px] md:min-h-0 rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                      <div className="h-full w-full rounded-[7px] bg-[#0b1b78] p-[6px]">
                        <div className="relative h-full w-full rounded-[7px] bg-white overflow-hidden">
                          <RoadBeads beads={beads} bankerLogo={bankerLogo} playerLogo={playerLogo} tieLogo={tieLogo} bankerpairlogo={bankerpairlogo} playerpairlogo={playerpairlogo} super6logo={super6logo} variant="dot" />
                          <span className="pointer-events-none absolute bottom-1 right-2 select-none text-[11px] md:text-[16px] font-semibold tracking-wide text-gray-300">Three Star Road</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div>
                <CasinoSettingsModal
                  open={open}
                  settings={casinoSettings}
                  setSettings={setCasinoSettings}
                  onClose={() => setOpen(false)}
                  onConfirm={(data) => console.log("confirmed:", data)}
                  initialSettings={initialSettings}
                />
              </div>



            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
