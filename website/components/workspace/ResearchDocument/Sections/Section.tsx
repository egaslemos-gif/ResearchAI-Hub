"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { navigationEngine } from "../../Navigator/NavigationEngine";
import { workspaceEvents } from "../../ResearchWorkspace/WorkspaceEvents";
import styles from "./Section.module.css";

export interface ResearchSectionProps {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  collapsible?: boolean;
}

export function Section({
  id,
  title,
  defaultOpen = true,
  children,
  collapsible = true,
}: ResearchSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    navigationEngine.registerSection({
      id,
      title,
      collapsed: !isOpen,
      visible: true,
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navigationEngine.setActiveAnchor(id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      navigationEngine.unregisterSection(id);
      observer.disconnect();
    };
  }, [id, title]);

  // Sync state changes to engine
  useEffect(() => {
    navigationEngine.updateSection(id, { collapsed: !isOpen });
    workspaceEvents.publish({
      type: "SECTION_COLLAPSED",
      payload: { id, collapsed: !isOpen },
    });
  }, [isOpen, id]);

  const toggle = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <section id={id} ref={sectionRef} className={styles.section}>
      <header 
        className={`${styles.header} ${collapsible ? styles.collapsible : ""}`} 
        onClick={toggle}
      >
        {collapsible && (
          <span className={styles.toggleIcon}>{isOpen ? "▼" : "▶"}</span>
        )}
        <h3 className={styles.title}>{title}</h3>
      </header>
      
      {isOpen && (
        <div className={`${styles.content} ${!collapsible ? styles.contentNoToggle : ""}`}>
          {children}
        </div>
      )}
      
      <hr className={styles.divider} />
    </section>
  );
}
