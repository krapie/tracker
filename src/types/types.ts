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

export type HealthEndpoint = {
  id: string;
  name: string;
  url: string;
  status: number; // 1 = up, 0 = down, -1 = unknown
  threshold: number;
  failCount: number;
  interval: number; // in seconds
};

export type Report = {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
