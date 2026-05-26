export default function App() {
  return (
    <div className="min-h-screen bg-[#7a0000] p-3">
      <div className="mx-auto w-full max-w-[1920px] overflow-hidden rounded-[12px] bg-[#7a0000]">
        <div className="relative w-full aspect-[16/9]">
          <img
            src="/bar.jpeg"
            alt="Baccarat board UI"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </div>
    </div>
  )
}
