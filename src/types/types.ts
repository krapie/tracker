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
  status: "ongoing" | "resolved";
};
