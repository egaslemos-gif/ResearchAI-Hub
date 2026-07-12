"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import styles from "./Theme/Theme.module.css";

interface ResearchMarkdownProps {
  content: string;
}

export function ResearchMarkdown({ content }: ResearchMarkdownProps) {
  return (
    <div className={styles.markdownWrapper}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h2: ({ node, ...props }) => (
            <div className={styles.technicalHeading}>
              <span className={styles.headingLabel}>{props.children}</span>
              <hr className={styles.headingRule} />
            </div>
          ),
          h3: ({ node, ...props }) => <h3 className={styles.h3} {...props} />,
          p: ({ node, ...props }) => <p className={styles.p} {...props} />,
          ul: ({ node, ...props }) => <ul className={styles.ul} {...props} />,
          ol: ({ node, ...props }) => <ol className={styles.ol} {...props} />,
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <pre className={styles.pre}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className={styles.inlineCode} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
