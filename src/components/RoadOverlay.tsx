type RoadOverlayProps = {
  rows: number
  cols: number
  label?: string
  onCellClick?: (row: number, col: number) => void
  className?: string
}

export function RoadOverlay({
  rows,
  cols,
  label,
  onCellClick,
  className,
}: RoadOverlayProps) {
  const cells = Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    return (
      <button
        key={`${row}-${col}`}
        type="button"
        className="b-cell"
        aria-label={label ? `${label} ${row + 1},${col + 1}` : `Cell ${row + 1},${col + 1}`}
        onClick={onCellClick ? () => onCellClick(row, col) : undefined}
      />
    )
  })

  return (
    <div
      className={['b-grid-overlay', className].filter(Boolean).join(' ')}
      style={{
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {cells}
    </div>
  )
}

