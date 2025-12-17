export interface ReportData {
  title: string;
  date: string;
  participants: string[];
  meetingPurpose?: string[];
  summary: string;
  topics: { title: string; content: string; subItems?: string[] }[];
  decisions?: { decision: string; rationale: string; impact: string; deadline?: string }[];
  risks?: { risk: string; severity: string; mitigation: string; owner?: string }[];
  keyInsights?: string[];
  followUps: { task: string; assignee: string; deadline: string; priority?: string; details?: string }[];
  nextSteps?: string;
}
