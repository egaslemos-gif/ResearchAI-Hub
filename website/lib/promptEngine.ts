import { ResearchSessionData } from "@/components/workspace/ResearchSessionContext";

/**
 * Pure function to resolve prompt variables from global and local session states.
 * @param content The raw prompt markdown string with {{variables}}
 * @param session The current ResearchSession state
 * @param step The current step number
 * @param highlight If true, wraps resolved values in a <mark> tag for UI rendering
 * @returns The resolved prompt string
 */
export function resolvePromptVariables(
  content: string,
  session: Partial<ResearchSessionData>,
  step: number,
  highlight: boolean = false
): string {
  if (!content) return "";
  
  const documentProperties = session.progress?.[step]?.variables || {};

  return content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const globalValue = (session as any)[key];
    if (globalValue !== undefined && globalValue !== null && globalValue !== "") {
      return highlight ? `<mark class="injected-var">${globalValue}</mark>` : String(globalValue);
    }
    
    const localValue = documentProperties[key];
    if (localValue !== undefined && localValue !== null && localValue !== "") {
      return highlight ? `<mark class="injected-var">${localValue}</mark>` : String(localValue);
    }

    return match; // Se não existir valor, mantém a string original {{key}}
  });
}
