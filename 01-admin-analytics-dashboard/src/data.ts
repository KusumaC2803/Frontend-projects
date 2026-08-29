import type { Activity } from "./types";

/* =========================
   Dashboard KPI Metrics
========================= */

export const metrics = [
  {
    label: "Total Revenue",
    value: "$128,420",
    change: "+12.5%",
    positive: true,
  },
  {
    label: "Active Users",
    value: "24,892",
    change: "+8.2%",
    positive: true,
  },
  {
    label: "Orders",
    value: "8,642",
    change: "+5.7%",
    positive: true,
  },
  {
    label: "Conversion Rate",
    value: "4.82%",
    change: "-0.6%",
    positive: false,
  },
];

/* =========================
   Analytics Data
========================= */

export const analyticsPeriods = {
  "Last 7 days": [
    {
      month: "Mon",
      revenue: 6200,
      users: 820,
    },
    {
      month: "Tue",
      revenue: 7100,
      users: 940,
    },
    {
      month: "Wed",
      revenue: 6800,
      users: 910,
    },
    {
      month: "Thu",
      revenue: 8300,
      users: 1080,
    },
    {
      month: "Fri",
      revenue: 9100,
      users: 1210,
    },
    {
      month: "Sat",
      revenue: 10400,
      users: 1380,
    },
    {
      month: "Sun",
      revenue: 11800,
      users: 1520,
    },
  ],

  "Last 30 days": [
    {
      month: "Week 1",
      revenue: 18000,
      users: 3200,
    },
    {
      month: "Week 2",
      revenue: 24000,
      users: 4100,
    },
    {
      month: "Week 3",
      revenue: 29000,
      users: 5200,
    },
    {
      month: "Week 4",
      revenue: 35000,
      users: 6100,
    },
  ],

  "Last 90 days": [
    {
      month: "Jun",
      revenue: 42000,
      users: 7400,
    },
    {
      month: "Jul",
      revenue: 48000,
      users: 8200,
    },
    {
      month: "Aug",
      revenue: 54000,
      users: 9100,
    },
  ],

  "This year": [
    {
      month: "Jan",
      revenue: 18000,
      users: 3200,
    },
    {
      month: "Feb",
      revenue: 24000,
      users: 4100,
    },
    {
      month: "Mar",
      revenue: 21000,
      users: 3800,
    },
    {
      month: "Apr",
      revenue: 29000,
      users: 5200,
    },
    {
      month: "May",
      revenue: 35000,
      users: 6100,
    },
    {
      month: "Jun",
      revenue: 42000,
      users: 7400,
    },
    {
      month: "Jul",
      revenue: 48000,
      users: 8200,
    },
    {
      month: "Aug",
      revenue: 54000,
      users: 9100,
    },
  ],
};

/* =========================
   Recent Activity
========================= */

export const activities: Activity[] = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav@example.com",
    date: "2026-08-25",
    type: "New",
    status: "Active",
  },
  {
    id: 2,
    name: "Diya Rao",
    email: "diya@example.com",
    date: "2026-08-24",
    type: "Member",
    status: "Active",
  },
  {
    id: 3,
    name: "Rohan Kumar",
    email: "rohan@example.com",
    date: "2026-08-23",
    type: "Member",
    status: "Pending",
  },
  {
    id: 4,
    name: "Ananya Patel",
    email: "ananya@example.com",
    date: "2026-08-22",
    type: "New",
    status: "Active",
  },
  {
    id: 5,
    name: "Vihaan Singh",
    email: "vihaan@example.com",
    date: "2026-08-21",
    type: "Member",
    status: "Blocked",
  },
  {
    id: 6,
    name: "Ishita Nair",
    email: "ishita@example.com",
    date: "2026-08-20",
    type: "New",
    status: "Active",
  },
  {
    id: 7,
    name: "Kabir Das",
    email: "kabir@example.com",
    date: "2026-08-19",
    type: "Member",
    status: "Active",
  },
  {
    id: 8,
    name: "Meera Joshi",
    email: "meera@example.com",
    date: "2026-08-18",
    type: "Member",
    status: "Pending",
  },
  {
    id: 9,
    name: "Aditya Verma",
    email: "aditya@example.com",
    date: "2026-08-17",
    type: "New",
    status: "Active",
  },
  {
    id: 10,
    name: "Sara Khan",
    email: "sara@example.com",
    date: "2026-08-16",
    type: "Member",
    status: "Active",
  },
  {
    id: 11,
    name: "Arjun Rao",
    email: "arjun@example.com",
    date: "2026-08-15",
    type: "New",
    status: "Active",
  },
  {
    id: 12,
    name: "Nisha Iyer",
    email: "nisha@example.com",
    date: "2026-08-14",
    type: "Member",
    status: "Blocked",
  },
];

/* =========================
   Notifications
========================= */

export const notifications = [
  "New order #10482 was created.",
  "Weekly revenue target reached 92%.",
  "3 users require account review.",
];