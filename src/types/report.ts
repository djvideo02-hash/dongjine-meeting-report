export interface ReportData {
  title: string;
  date: string;
  participants: string[];
  summary: string;
  topics: { title: string; content: string }[];
  decisions?: { decision: string; rationale: string; impact: string }[];
  risks?: { risk: string; severity: string; mitigation: string }[];
  keyInsights?: string[];
  followUps: { task: string; assignee: string; deadline: string; priority?: string }[];
  nextSteps?: string;
}
