
export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  sources?: { title: string; uri: string }[];
}

export interface IntelCell {
    title: string;
    prompt: string;
    active: boolean;
}

export interface IntelRow {
    category: string;
    cells: IntelCell[];
}
