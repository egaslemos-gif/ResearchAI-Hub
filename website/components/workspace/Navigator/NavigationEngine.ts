export interface DocumentSection {
  id: string;
  title: string;
  status?: string;
  collapsed: boolean;
  visible: boolean;
  completed?: boolean;
  progress?: number; // 0-100
}

type SectionListener = (sections: DocumentSection[]) => void;
type ActiveAnchorListener = (activeId: string | null) => void;

class NavigationEngine {
  private sections: Map<string, DocumentSection> = new Map();
  private activeAnchor: string | null = null;
  private sectionListeners: Set<SectionListener> = new Set();
  private anchorListeners: Set<ActiveAnchorListener> = new Set();

  registerSection(section: DocumentSection) {
    this.sections.set(section.id, section);
    this.notifySections();
  }

  updateSection(id: string, updates: Partial<DocumentSection>) {
    const existing = this.sections.get(id);
    if (existing) {
      this.sections.set(id, { ...existing, ...updates });
      this.notifySections();
    }
  }

  unregisterSection(id: string) {
    this.sections.delete(id);
    this.notifySections();
  }

  setActiveAnchor(id: string | null) {
    this.activeAnchor = id;
    this.anchorListeners.forEach((l) => l(id));
  }

  getSections(): DocumentSection[] {
    return Array.from(this.sections.values());
  }

  getActiveAnchor(): string | null {
    return this.activeAnchor;
  }

  subscribeSections(listener: SectionListener) {
    this.sectionListeners.add(listener);
    return () => this.sectionListeners.delete(listener);
  }

  subscribeAnchor(listener: ActiveAnchorListener) {
    this.anchorListeners.add(listener);
    return () => this.anchorListeners.delete(listener);
  }

  private notifySections() {
    const sections = this.getSections();
    this.sectionListeners.forEach((l) => l(sections));
  }
}

export const navigationEngine = new NavigationEngine();
