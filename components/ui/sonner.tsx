import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-900 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl dark:group-[.toaster]:bg-zinc-800 dark:group-[.toaster]:text-zinc-50 dark:group-[.toaster]:border-zinc-700',
          description: 'group-[.toast]:text-zinc-600 dark:group-[.toast]:text-zinc-400',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:font-medium hover:group-[.toast]:bg-primary-600 group-[.toast]:transition-colors',
          cancelButton:
            'group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-900 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:font-medium hover:group-[.toast]:bg-zinc-200 group-[.toast]:transition-colors dark:group-[.toast]:bg-zinc-700 dark:group-[.toast]:text-zinc-100 dark:hover:group-[.toast]:bg-zinc-600',
          closeButton:
            'group-[.toast]:bg-transparent group-[.toast]:border-0 group-[.toast]:text-zinc-400 hover:group-[.toast]:text-zinc-900 dark:hover:group-[.toast]:text-zinc-100',
          error:
            'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200 dark:group-[.toaster]:bg-red-950 dark:group-[.toaster]:text-red-50 dark:group-[.toaster]:border-red-800',
          success:
            'group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200 dark:group-[.toaster]:bg-green-950 dark:group-[.toaster]:text-green-50 dark:group-[.toaster]:border-green-800',
          warning:
            'group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 group-[.toaster]:border-yellow-200 dark:group-[.toaster]:bg-yellow-950 dark:group-[.toaster]:text-yellow-50 dark:group-[.toaster]:border-yellow-800',
          info:
            'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-950 dark:group-[.toaster]:text-blue-50 dark:group-[.toaster]:border-blue-800',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
