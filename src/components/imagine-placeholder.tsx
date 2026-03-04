import { useTheme } from 'next-themes'

export function ImaginePlaceholder() {
  const { theme } = useTheme()

  return (
    <div className="flex-grow flex flex-col justify-center items-center gap-6 text-center">
      <img
        src={
          theme === 'dark'
            ? '/imagine-logo-dark.svg'
            : '/imagine-logo-light.svg'
        }
        alt="Imagine Logo"
        className="size-14"
      />
    </div>
  )
}
