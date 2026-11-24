export const DECLARED_TOOLS = {
  topics: { name: 'creator-daily_topics', writes: false },
  notes: { name: 'creator-daily_notes', writes: false },
  saveDraft: { name: 'creator-daily_save_draft', writes: true },
} as const;

export type DeclaredToolKey = keyof typeof DECLARED_TOOLS;
