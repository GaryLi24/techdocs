'use client'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { createAnchorId } from '@/utils'

// 样式化Markdown容器
const MarkdownBox = styled(Box)(({ theme }) => ({
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    margin: '1.5rem 0 1rem',
    lineHeight: 1.25,
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& h1': {
    fontSize: '2rem',
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: '0.5rem',
  },
  '& h2': {
    fontSize: '1.5rem',
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: '0.3rem',
  },
  '& h3': { fontSize: '1.25rem' },
  '& h4': { fontSize: '1.1rem' },
  '& p': {
    margin: '1rem 0',
    lineHeight: 1.7,
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& img': {
    maxWidth: '100%',
    borderRadius: '4px',
    margin: '1rem 0',
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.light}`,
    paddingLeft: '1rem',
    marginLeft: 0,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.hover,
    padding: '0.5rem 1rem',
    borderRadius: '0 4px 4px 0',
  },
  '& code': {
    backgroundColor: theme.palette.action.hover,
    padding: '0.2em 0.4em',
    borderRadius: '3px',
    fontSize: '0.9em',
    fontFamily: 'monospace',
  },
  '& pre': {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    padding: '1rem',
    borderRadius: '4px',
    overflow: 'auto',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
      color: 'inherit',
    },
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    margin: '1rem 0',
    '& th, & td': {
      padding: '0.5rem',
      border: `1px solid ${theme.palette.divider}`,
    },
    '& th': {
      backgroundColor: theme.palette.action.hover,
      fontWeight: 600,
    },
  },
  '& hr': {
    border: 'none',
    height: '1px',
    backgroundColor: theme.palette.divider,
    margin: '1.5rem 0',
  },
  '& ul, & ol': {
    paddingLeft: '2rem',
  },
  '& li': {
    margin: '0.5rem 0',
  },
}))

interface MarkdownContentProps {
  content: string
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <MarkdownBox>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => {
            const children = props.children as React.ReactNode
            const text = children ? String(children) : ''
            const id = createAnchorId(text)
            return <h1 id={id} {...props} />
          },
          h2: ({ node, ...props }) => {
            const children = props.children as React.ReactNode
            const text = children ? String(children) : ''
            const id = createAnchorId(text)
            return <h2 id={id} {...props} />
          },
          h3: ({ node, ...props }) => {
            const children = props.children as React.ReactNode
            const text = children ? String(children) : ''
            const id = createAnchorId(text)
            return <h3 id={id} {...props} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </MarkdownBox>
  )
}
