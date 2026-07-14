export interface CostBreakdownItem {
  category: string;
  percentage: number;
  description: string;
}

export interface RoadmapPhase {
  phase: string;
  duration: string;
  deliverables: string;
}

export interface EstimatorResponse {
  estimatedCostRange: string;
  timeline: string;
  architectureSummary: string;
  suggestedTechStack: string[];
  costBreakdown: CostBreakdownItem[];
  phasedRoadmap: RoadmapPhase[];
  aiRecommendation: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  techStack: string[];
  deliverables: string[];
  caseStudySummary: string;
}

export interface MethodologyStep {
  number: number;
  title: string;
  description: string;
  details: string;
  timelineContribution: string;
}

export interface BlogArticle {
  id: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  content: string;
  author: string;
  date: string;
}
