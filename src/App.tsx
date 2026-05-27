export default function App() {
  const gridBg = (cell: number, line: string) =>
    ({
      backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
      backgroundSize: `${cell}px ${cell}px`,
      backgroundPosition: `0 0`,
    }) as const

  return (
    <div className="h-screen overflow-hidden text-white">
      <div className="mx-auto w-full max-w-[1920px] rounded-[12px] bg-[#7a0000] shadow-[0_20px_70px_rgba(0,0,0,0.45)]">

        {/* Scroll container */}
        <div className="overflow-x-auto">

          {/* Fixed casino board width */}
          <div className="h-[calc(100vh-24px)]">
            <div className="grid h-full w-full grid-rows-[56px_1fr]">

              {/* Header */}
              <div className="flex items-center justify-between gap-4 bg-blue-800 px-4">
                <div className="flex items-center gap-3">
                  <div className="text-[26px] font-black tracking-wide text-[#ffd25c] drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">
                    Welcome to Baccarat
                  </div>
                </div>

                <div className="flex items-center gap-6 text-[18px] font-bold text-[#ffe7a8]">
                  <div className="whitespace-nowrap">
                    莊 閒 最低高投注: 2,000/20,000
                  </div>

                  <div className="whitespace-nowrap">
                    和 最低高投注: 2,000/20,000
                  </div>

                  <div className="whitespace-nowrap">
                    ●● 最低高投注: 2,000/20,000
                  </div>

                  <div className="whitespace-nowrap">
                    SUPER6 最低高投注: 1,000/10,000
                  </div>
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
                      <div className="absolute right-6 bottom-4 text-[42px] font-semibold tracking-widest text-black/18 select-none">
                        大路
                      </div>

                      <div className="absolute left-3 top-3 flex gap-2">
                        <div className="h-6 w-6 rounded-full border-[4px] border-red-600 bg-white" />
                        <div className="h-6 w-6 rounded-full border-[4px] border-blue-600 bg-white" />
                        <div className="h-6 w-6 rounded-full border-[4px] border-red-600 bg-white" />
                      </div>
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
                          <div className="absolute right-6 bottom-4 text-[36px] font-semibold tracking-widest text-black/18 select-none">
                            大眼仔
                          </div>

                          <div className="absolute left-3 top-3 flex gap-2">
                            <div className="h-4 w-4 rounded-full border-[3px] border-red-600 bg-white" />
                            <div className="h-4 w-4 rounded-full border-[3px] border-blue-600 bg-white" />
                          </div>
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
                          <div className="absolute right-6 bottom-4 text-[36px] font-semibold tracking-widest text-black/18 select-none">
                            曱甴路
                          </div>
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
                        {/* CENTERED INSIDE BOX (visually aligned, not layout centered) */}
                        <div className="absolute inset-0 flex  justify-start">
                          <div className="flex flex-col  gap-3">
                            <div className="grid h-[35px] w-[35px] place-items-center rounded-full bg-[#b90b0b] text-[22px] font-black shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)]">
                              莊
                            </div>

                            <div className="grid h-[35px] w-[35px] place-items-center rounded-full bg-[#1a49c8] text-[22px] font-black shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)]">
                              閒
                            </div>

                            <div className="grid h-[35px] w-[35px] place-items-center rounded-full bg-[#b90b0b] text-[22px] font-black shadow-[inset_0_0_0_3px_rgba(255,255,255,0.8)]">
                              莊
                            </div>
                          </div>
                        </div>

                        {/* BACKGROUND LABEL */}
                        <div className="absolute right-6 bottom-4 text-[42px] font-semibold tracking-widest text-black/18 select-none">
                          珠子路
                        </div>
                      </div>
                    </div>

                    {/* Score Panel */}
                    <div className="flex gap-4">

                      <div className="rounded-[12px] rounded-[10px] bg-gradient-to-b from-[#d6b54b] to-[#8f6f1d] p-[5px] shadow-[0_8px_30px_rgba(0,0,0,0.35)] p-[6px] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                        <div className="grid h-full w-full grid-rows-[1fr_auto] gap-2 rounded-[10px] bg-gradient-to-b from-[#e7c86f] to-[#c3922d] p-3 text-black">

                          <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2 text-[24px] font-black tracking-widest">

                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#b90b0b] text-white">
                              莊
                            </div>
                            <div className="self-center">BANKER</div>
                            <div className="self-center text-right">3</div>

                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1a49c8] text-white">
                              閒
                            </div>
                            <div className="self-center">PLAYER</div>
                            <div className="self-center text-right">1</div>

                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1f7a44] text-white">
                              和
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
                          下局
                        </div>

                        <div className="text-black text-center text-[22px] font-black">
                          預告
                        </div>

                        <div className="mt-2 flex items-center justify-center gap-2">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#b90b0b] text-[18px] font-black text-white">
                            莊
                          </div>

                          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1a49c8] text-[18px] font-black text-white">
                            閒
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
                      <div>
                        {/* <input value={} onChange={}/> */}
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