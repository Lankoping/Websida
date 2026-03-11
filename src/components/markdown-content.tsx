import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { cn } from '../lib/utils'

type MarkdownContentProps = {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'text-[#F0E8D8] leading-relaxed',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4',
        '[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-7 [&_h2]:mb-3',
        '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3',
        '[&_p]:my-4',
        '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4',
        '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4',
        '[&_li]:my-1',
        '[&_a]:text-[#C04A2A] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-90',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-[#C04A2A]/60 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4',
        '[&_code]:bg-[#1A1816] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-sm',
        '[&_pre]:bg-[#1A1816] [&_pre]:p-4 [&_pre]:rounded-sm [&_pre]:overflow-x-auto [&_pre]:my-4',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}