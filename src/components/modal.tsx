import React from "react";

type CasinoSettings = {
  language: string
  shoeNo: string
  bpMin: number
  bpMax: number
  tieMin: number
  tieMax: number
  pairMin: number
  pairMax: number
  super6Min: number
  super6Max: number
  timer: number
  music: string
  audio: string
  chipType: string
  logo: string
  tableNo: string
  annou: string
  threeStar: string
}



type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (data: CasinoSettings) => void
  settings: CasinoSettings
  setSettings: React.Dispatch<React.SetStateAction<CasinoSettings>>
  initialSettings: CasinoSettings
}

/* ---------------- FIELD ---------------- */
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 py-1 border-b border-yellow-900/20">
      <label className="text-black text-[16px] font-semibold tracking-wide whitespace-nowrap w-24 text-right shrink-0">
        {label}
      </label>
      {children}
    </div>
  )
}

/* ---------------- INPUT ---------------- */
function Input({
  value,
  onChange,
  type = "text",
  highlight = false,
  className = "",
}: {
  value: string | number
  onChange: (value: string | number) => void
  type?: string
  highlight?: boolean
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) =>
        onChange(type === "number" ? Number(e.target.value) : e.target.value)
      }
      className={`
        flex-1 min-w-0 px-1.5 py-0.5 rounded-sm text-[13px] border outline-none
        font-serif transition-all
        ${highlight
          ? "bg-blue-700 text-white border-blue-700"
          : "bg-white/90 text-amber-950 border-yellow-800"
        }
        ${className}
      `}
    />
  )
}

/* ---------------- SELECT ---------------- */
function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 min-w-0 px-1.5 py-0.5 rounded-sm text-[13px] border border-yellow-800 bg-white/90 text-amber-950 outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

/* ---------------- MAIN MODAL ---------------- */
export default function CasinoSettingsModal({
  open,
  onClose,
  onConfirm,
  settings,
  setSettings,
  initialSettings,
}: Props) {
  if (!open) return null

  const update = <K extends keyof CasinoSettings>(
    key: K,
    value: CasinoSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
      <div className="relative w-full max-w-2xl rounded-sm overflow-hidden border-10 border-blue-900 bg-blue-900">

        {/* HEADER */}
        <div className="flex items-center justify-center px-5 py-2.5 bg-white">
          <h1 className="font-serif text-4xl font-bold tracking-[3px] text-black">
            Setting
          </h1>
        </div>

        <div className="border  border-4 border-x border-blue-900"></div>

        {/* BODY */}
        <div className="px-5 py-4 grid grid-cols-2 gap-x-6 bg-white">

          {/* LEFT */}
          <div className="flex flex-col gap-0.5">
            <Field label="Language:">
              <Select
                value={settings.language}
                onChange={(v) => update("language", v)}
                options={["English"]}
              />
            </Field>

            <Field label="B/P Min:">
              <Input
                type="number"
                value={settings.bpMin}
                onChange={(v) => update("bpMin", v as number)}
              />
            </Field>

            <Field label="Tie Min:">
              <Input
                type="number"
                value={settings.tieMin}
                onChange={(v) => update("tieMin", v as number)}
              />
            </Field>

            <Field label="Pair Min:">
              <Input
                type="number"
                value={settings.pairMin}
                onChange={(v) => update("pairMin", v as number)}
              />
            </Field>

            <Field label="Super 6 Min:">
              <Input
                type="number"
                value={settings.super6Min}
                onChange={(v) => update("super6Min", v as number)}
              />
            </Field>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-0.5">
            {/* <Field label="Timer:">
              <Input
                type="number"
                value={settings.timer}
                onChange={(v) => update("timer", v as number)}
              />
            </Field> */}
            <Field label="Shoe No:">
              <Input
                value={settings.shoeNo}
                onChange={(v) => update("shoeNo", v as string)}
              />
            </Field>

            <Field label="B/P Max:">
              <Input
                type="number"
                value={settings.bpMax}
                onChange={(v) => update("bpMax", v as number)}
              />
            </Field>

            <Field label="Tie Max:">
              <Input
                type="number"
                value={settings.tieMax}
                onChange={(v) => update("tieMax", v as number)}
              />
            </Field>

            <Field label="Pair Max:">
              <Input
                type="number"
                value={settings.pairMax}
                onChange={(v) => update("pairMax", v as number)}
              />
            </Field>

            <Field label="Super 6 Max:">
              <Input
                type="number"
                value={settings.super6Max}
                onChange={(v) => update("super6Max", v as number)}
              />
            </Field>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-center gap-6 px-5 py-3 border-t bg-white">
          <button
            onClick={() => {
              setSettings(initialSettings)
              onConfirm(initialSettings)
              onClose()
            }}
            className="px-8 py-2 bg-blue-900 text-white rounded"
          >
            Recovery
          </button>

          <button
            onClick={() => {
              onConfirm(settings)
              onClose()
            }}
            className="px-8 py-2 bg-blue-900 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}