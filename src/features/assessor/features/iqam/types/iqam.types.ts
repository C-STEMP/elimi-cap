export type IqamToolId =
  | "CON/01/IQAM"
  | "CON/02/IQAM"
  | "CON/03/IQAM"
  | "CON/04/IQAM"
  | "CON/05/IQAM"
  | "CON/06/IQAM";

export interface IqamToolCard {
  id: IqamToolId;
  refCode: string;
  title: string;
  description: string;
}

export interface CandidateAllocationItem {
  id: string;
  assessorName: string;
  candidateName: string;
  level: string;
  units: string;
}

export interface SamplingPlanItem {
  id: string;
  assessorName: string;
  candidateName: string;
  termType: "Interim" | "Formative" | "Summative" | "Select";
  plannedDate: string;
  units: Record<string, boolean>;
}

export interface SamplingRecordItem {
  id: string;
  assessorName: string;
  status: "Q" | "NQ" | "NSQ" | "NS" | "NSNQ";
  assessmentSite: string;
  candidateName: string;
  unitsAssessed: string;
  process: string;
  method: string;
}

export interface AgreedActionItem {
  id: string;
  actionRequired: string;
  byWho: string;
  timeline: string;
  achieved: "yes" | "no";
}

export interface ChecklistQuestionItem {
  id: string;
  question: string;
  answer: "yes" | "no" | null;
  comments: string;
}
