
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold mt-3 mb-2 text-gray-900" {...props} />
          ),
          
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="mb-4 text-sm leading-relaxed text-gray-800" {...props} />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-sm text-gray-800" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-sm text-gray-800" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4 text-gray-800" {...props} />
          ),
          
          // Code blocks
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            const isCopied = copiedCode === codeString;
            
            if (!inline) {
              return (
                <div className="my-4 rounded-lg overflow-hidden border border-gray-700 shadow-lg relative group">
                  {/* Code Header - Like VS Code */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs font-mono text-gray-300 ml-2">
                        {language ? `${language}.code` : 'code.txt'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {language && (
                        <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                          {language}
                        </span>
                      )}
                      {/* Copy Button */}
                      <button
                        onClick={() => copyToClipboard(codeString)}
                        className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-gray-700/50"
                        title={isCopied ? "Copied!" : "Copy code"}
                      >
                        {isCopied ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Code Content */}
                  <pre className="bg-gray-900 p-4 overflow-x-auto text-gray-100">
                    <code className={`${className} text-sm font-mono`} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            
            return (
              <code
                className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-sm font-mono border border-violet-200"
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-violet-500 bg-violet-50 pl-4 py-2 my-4 italic text-gray-700"
              {...props}
            />
          ),
          
          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-sm text-gray-800 border-t border-gray-200" {...props} />
          ),
          
          // Links
          a: ({ node, ...props }) => (
            <a
              className="text-violet-600 hover:text-violet-700 underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          
          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t-2 border-gray-200" {...props} />
          ),
          
          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900" {...props} />
          ),
          
          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic text-gray-800" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      
      <style jsx global>{`
        .markdown-content {
          line-height: 1.6;
        }
        
        .markdown-content pre {
          font-family: 'Courier New', Courier, monospace;
          line-height: 1.5;
        }
        
        .markdown-content code {
          font-family: 'Courier New', Courier, monospace;
        }
        
        .markdown-content pre code {
          color: #e6edf3;
          display: block;
        }
        
        /* Syntax highlighting styles */
        .hljs {
          display: block;
          overflow-x: auto;
          padding: 0;
          background: transparent;
          color: #c9d1d9;
        }
        
        .hljs-keyword,
        .hljs-selector-tag,
        .hljs-type {
          color: #ff7b72;
          font-weight: 500;
        }
        
        .hljs-string,
        .hljs-meta-string {
          color: #a5d6ff;
        }
        
        .hljs-number,
        .hljs-literal,
        .hljs-variable,
        .hljs-template-variable {
          color: #79c0ff;
        }
        
        .hljs-comment {
          color: #8b949e;
          font-style: italic;
        }
        
        .hljs-function,
        .hljs-title {
          color: #d2a8ff;
          font-weight: 500;
        }
        
        .hljs-attr,
        .hljs-attribute {
          color: #ffa657;
        }
        
        .hljs-built_in,
        .hljs-class .hljs-title {
          color: #ffa657;
        }
        
        .hljs-params {
          color: #c9d1d9;
        }
        
        .hljs-meta {
          color: #8b949e;
        }
        
        /* Additional language-specific colors */
        .language-javascript .hljs-keyword,
        .language-typescript .hljs-keyword {
          color: #ff7b72;
        }
        
        .language-python .hljs-keyword {
          color: #ff7b72;
        }
        
        .language-java .hljs-keyword {
          color: #ff7b72;
        }
      `}</style>
    </div>
  );
}
