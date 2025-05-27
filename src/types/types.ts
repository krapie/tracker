export type EventComment = {
  id: string;
  text: string;
  createdAt: number;
  author: string;
};

export type Issue = {
  id: string;
  name: string;
  createdAt: number;
  status: number;
};

export type PlaybookStep = {
  content: string;
};

export type Playbook = {
  id: string;
  name: string;
  steps: PlaybookStep[];
};
