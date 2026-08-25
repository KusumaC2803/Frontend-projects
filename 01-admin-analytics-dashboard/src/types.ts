export type Activity = {
  id: number;
  name: string;
  email: string;
  date: string;
  type: "New" | "Member";
  status: "Active" | "Pending" | "Blocked";
};

export type Metric = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
};