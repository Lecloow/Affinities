type Option = { label: string; value: number }

interface Props {
  options: Option[]
  value: number
  onChange: (value: number) => void
  activeColor?: string
}

export default function SegmentedControl({
                                   options,
                                   value,
                                   onChange,
                                   activeColor = "#FF8EC4",
                                 }: Props) {
  return (
      <div className="flex rounded-xl p-1 gap-0.5" style={{ background: "#F0F0F0" }}>
        {options.map((opt) => {
          const isActive = opt.value === value
          return (
              <button
                  key={opt.value}
                  onClick={() => onChange(opt.value)}
                  className="flex justify-center items-center p-2.5 border-0 rounded-lg text-[16px] cursor-pointer min-w-40"
                  style={{
                    background: isActive ? activeColor : "transparent",
                    color: isActive ? "#fff" : "#aaa",
                    fontWeight: isActive ? 600 : 500,
                    transition: "all 0.2s",
                  }}
              >
                {opt.label}
              </button>
          )
        })}
      </div>
  )
}