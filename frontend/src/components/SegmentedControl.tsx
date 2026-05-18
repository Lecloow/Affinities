type Option = { label: string; value: number }

interface Props {
  options: Option[]
  value: number
  onChange: (value: number) => void
  activeColor?: string
}

export function SegmentedControl({
                                   options,
                                   value,
                                   onChange,
                                   activeColor = "#FF8EC4",
                                 }: Props) {
  return (
      <div className="flex rounded-[12px] p-[4px] gap-[2px]" style={{ background: "#F0F0F0" }}>
        {options.map((opt) => {
          const isActive = opt.value === value
          return (
              <button
                  key={opt.value}
                  onClick={() => onChange(opt.value)}
                  className="flex justify-center items-center p-[10px] border-0 rounded-[8px] text-[15px] cursor-pointer min-w-[10rem]"
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