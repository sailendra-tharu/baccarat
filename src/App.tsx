import { useEffect, useState, useRef } from "react"
import CasinoSettingsModal from "./components/modal";
import tieLogo from "./assets/tie.png";
import playerLogo from "./assets/player.png";
import bankerLogo from "./assets/banker.png";
import playerpairlogo from "./assets/playerpair.png"
import bankerpairlogo from "./assets/bankerpair.png"
import super6logo from "./assets/super6.png"
import baccaratlogo from "./assets/baccarat.png"
import emailjs from '@emailjs/browser';
import localforage from 'localforage';

const KEYWORD = "88Enter";

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

  // Security Lock State (null = checking database)
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    localforage.getItem("baccarat_is_unlocked").then((value) => {
      setIsUnlocked(value === true);
    }).catch(() => {
      setIsUnlocked(false);
    });
  }, []);

  // Keep key in memory ONLY! Never save it to localStorage so the user can't find it.
  // If they close the app, a new key will generate next time.
  const [securityKey] = useState(() => {
    // Remove the old insecure key if it exists from previous tests
    localStorage.removeItem("baccarat_security_key");
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
  });
  const [inputKey, setInputKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const sendSecurityEmail = async () => {
    setIsSending(true);
    setErrorMsg("");
    try {
      const SERVICE_ID = "service_utksddh";
      const TEMPLATE_ID = "template_33in5s9";
      const PUBLIC_KEY = "85bCTdpgmnbs4VGHh";

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          title: "New Security Key",
          name: "Baccarat System",
          email: "system@baccarat.local",
          message: `A new Baccarat installation was detected. The security key is: ${securityKey}`
        },
        PUBLIC_KEY
      );
      setEmailSent(true);
      setErrorMsg("");
    } catch (error: any) {
      console.error("Failed to send email:", error);
      if (error && error.text) {
        setErrorMsg("EmailJS: " + error.text);
      } else {
        setErrorMsg("Failed to send email. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const verifyKey = async () => {
    if (inputKey === securityKey) {
      await localforage.setItem("baccarat_is_unlocked", true);
      setIsUnlocked(true);
    } else {
      setErrorMsg("Invalid key. Please try again.");
    }
  };

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


  const gridBg = (cell: number, line: string) =>
    ({
      backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
      backgroundSize: `${cell}px ${cell}px`,
      backgroundPosition: `0 0`,
    }) as const

  const HeaderBetChip = ({
    chips,
    text,
  }: {
    chips: { label?: React.ReactNode; bg: string; isCircle?: boolean }[]
    text: string
  }) => (
    <div className="flex items-center gap-2 whitespace-nowrap text-[13px] font-black tracking-wider text-[#ffe7a8]">
      <div className="flex gap-1">
        {chips.map((c, i) => (
          <div
            key={i}
            className={`grid h-5 w-5 place-items-center text-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)] overflow-hidden ${c.isCircle ? 'rounded-full' : 'rounded-[4px] text-[12px]'}`}
            style={{ backgroundColor: c.bg }}
          >
            {c.label}
          </div>
        ))}
      </div>
      <div className="opacity-95">{text}</div>
    </div>
  )

  // Add these two useEffects (after the existing ones):
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
            className="grid place-items-center rounded-full bg-[#b90b0b] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)] overflow-hidden"
            style={{ width: size, height: size }}
          >
            <img src={bankerLogo} alt="B" className="w-full h-full object-cover" />
          </div>
        )
      case "player":
        return (
          <div
            className="grid place-items-center rounded-full bg-[#1a49c8] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)] overflow-hidden"
            style={{ width: size, height: size }}
          >
            <img src={playerLogo} alt="P" className="w-full h-full object-cover" />
          </div>
        )
      case "tie":
        return (
          <div
            className="grid place-items-center rounded-full bg-[#1f7a44] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)] overflow-hidden"
            style={{ width: size, height: size }}
          >
            <img src={tieLogo} alt="T" className="w-full h-full object-cover" />
          </div>
        )
      case "bankerPair":
        return (
          <div
            className="grid place-items-center rounded-full bg-[#1f7a44] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)] overflow-hidden"
            style={{ width: size, height: size }}
          >
            <img src={bankerpairlogo} alt="T" className="w-full h-full object-cover" />
          </div>
        )
      case "playerPair":
        return (
          <div
            className="grid place-items-center rounded-full bg-[#1f7a44] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)] overflow-hidden"
            style={{ width: size, height: size }}
          >
            <img src={playerpairlogo} alt="T" className="w-full h-full object-cover" />
          </div>
        )
      case "super6":
        return (
          <div
            className="grid place-items-center rounded-full bg-[#f7e7b4] shadow-[inset_0_0_0_2px_rgba(0,0,0,0.2)] overflow-hidden"
            style={{ width: size, height: size }}
          >
            <img src={super6logo} alt="S6" className="w-full h-full object-cover" />
          </div>
        )
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

  const RoadBeads = ({ cell }: { cell: number }) => {
    const pad = Math.max(6, Math.floor(cell * 0.18))
    const beadBox = Math.max(12, Math.min(30, cell - pad * 2))
    return (
      <div className="absolute inset-0">
        <div
          className="grid h-full w-full content-start justify-start gap-0"
          style={{
            gridTemplateRows: `repeat(auto-fill, ${cell}px)`,
            gridAutoColumns: `${cell}px`,
            gridAutoFlow: "column",
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
    return <div className="h-screen w-full bg-black"></div>; // Blank screen while checking DB
  }

  if (isUnlocked === false) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white relative">
        <div className="absolute inset-0 bg-blue-900/20" style={gridBg(40, "rgba(255,255,255,0.05)")} />
        
        <div className="z-10 bg-[#0b1b78] p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-blue-500/30 flex flex-col items-center w-full max-w-md">
          <img src={baccaratlogo} alt="Logo" className="w-48 mb-8 drop-shadow-2xl" />
          
          <h1 className="text-2xl font-black tracking-widest text-[#ffd25c] mb-2 text-center">
            SYSTEM LOCKED
          </h1>
          <p className="text-gray-300 text-center mb-8 text-sm">
            This is a new installation. Please enter the security key to unlock the application.
          </p>

          <input
            type="text"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Enter 6-digit key"
            className="w-full bg-black/50 border border-blue-400/50 rounded-lg px-6 py-4 text-center text-2xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-[#ffd25c] transition-colors"
            maxLength={6}
          />

          {errorMsg && (
            <div className="mt-4 text-red-400 text-sm font-semibold">{errorMsg}</div>
          )}

          <button
            onClick={verifyKey}
            className="w-full mt-6 bg-gradient-to-r from-[#d6b54b] to-[#8f6f1d] text-black font-black text-lg py-3 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            UNLOCK
          </button>

          <div className="w-full h-px bg-white/10 my-6" />

          <button
            onClick={sendSecurityEmail}
            disabled={isSending}
            className="text-sm text-blue-300 hover:text-white transition-colors underline disabled:opacity-50"
          >
            {isSending ? "Sending..." : emailSent ? "Resend Key to Admin" : "Send Key to Admin Email"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden text-white">

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
                    WELCOME TO BACCARAT
                  </div>
                </div>

                <div className="flex items-center gap-5">
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

                            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#b90b0b] text-white">
                              <img src={bankerLogo} alt="banker" className="w-full h-full object-cover" />
                            </div>
                            <div className="self-center">BANKER</div>
                            <div className="self-center text-right">{bankerCount}</div>

                            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1a49c8] text-white">
                              <img src={playerLogo} alt="player" className="w-full h-full object-cover" />
                            </div>
                            <div className="self-center">PLAYER</div>
                            <div className="self-center text-right">{playerCount}</div>

                            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1f7a44] text-white">
                              <img src={tieLogo} alt="tie" className="w-full h-full object-cover" />
                            </div>
                            <div className="self-center">TIE</div>
                            <div className="self-center text-right">{tieCount}</div>
                          </div>

                          <div className="grid grid-cols-[1fr_auto] items-end gap-3">

                            <div className="text-[18px] font-black tracking-wider">

                              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-[#f7e7b4] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]" >
                                  <img src={bankerpairlogo} alt="banker pair" className="w-full h-full object-cover" />
                                </div>
                                <div>BANKER PAIR</div>
                                <div className="text-right">{bankerPairCount}</div>
                              </div>

                              <div className="mt-1 grid grid-cols-[auto_1fr_auto] items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-[#f7e7b4] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]" >
                                  <img src={playerpairlogo} alt="banker pair" className="w-full h-full object-cover" />
                                </div>
                                <div>PLAYER PAIR</div>
                                <div className="text-right">{playerPairCount}</div>
                              </div>

                              <div className="mt-1 grid grid-cols-[auto_1fr_auto] items-center gap-2">
                                <img src={super6logo} alt="banker pair" className="object-cover w-[30px] h-[30px]" />
                                <div>SUPER6</div>
                                <div className="text-right">{super6Count}</div>
                              </div>
                              <div className="border border-x border-yellow-400 mt-3"></div>
                              <div className="flex justify-between mt-1">
                                <div className="text-[18px] font-black tracking-wider">Shoe:{shoeNumber}</div>
                                <div className="text-[18px] font-black tracking-wider">Game:{totalCount}</div>
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
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#b90b0b] text-white overflow-hidden">
                            <img src={bankerLogo} alt="banker" className="w-full h-full object-cover" />
                          </div>

                          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1a49c8] text-white overflow-hidden">
                            <img src={playerLogo} alt="player" className="w-full h-full object-cover" />
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
                            {/* <div className="text-[44px] font-black tracking-widest text-[#ffd25c] drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">
                              AMYLQ
                            </div>

                            <div className="mt-3 text-[34px] font-black tracking-widest text-[#ffe7a8]">
                              公平公正
                            </div>

                            <div className="mt-1 text-[18px] font-bold tracking-[0.18em] text-[#ffe7a8]/90">
                              GONG PING GONG ZHENG
                            </div> */}
                            <img src={baccaratlogo} width={300} height={300} />
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

        </div>
      </div>
    </div>
  )
}
