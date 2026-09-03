export type DashboardFilters = {
  schoolId?: string;
  from?: string;
  to?: string;
};

export type SchoolOption = {
  id: string;
  name: string;
};

export type ImprovementResponse = {
  filters: DashboardFilters;
  studentCount: number;
  suppressed: boolean;
  reason?: string;
  overall: {
    startingGrid: number | null;
    finishLine: number | null;
    improvement: number | null;
  } | null;
  knowledgeAreas:
    | {
        key: string;
        name: string;
        startingGrid: number | null;
        finishLine: number | null;
        improvement: number | null;
      }[]
    | null;
};

export type ReachResponse = {
  filters: DashboardFilters;
  registeredUsers: { count: number | null; suppressed: boolean; reason?: string };
  schoolsParticipating: { count: number };
  inviteToRegister: {
    invited: number;
    registered: number;
    conversionPercent: number | null;
    suppressed: boolean;
    reason?: string;
  };
  monthlyActiveUsers: {
    period: { from: string; to: string };
    count: number | null;
    suppressed: boolean;
    reason?: string;
  };
  appDownloads: { available: boolean; value: null; note: string };
  demographics: DemographicsBreakdown;
};

export type BreakdownItem = { key: string; label: string; count: number };

export type DemographicsBreakdown =
  | {
      suppressed: true;
      reason: string;
      educationType: null;
      licenceStatus: null;
    }
  | {
      suppressed: false;
      educationType: { items: BreakdownItem[]; unknown: number };
      licenceStatus: { items: BreakdownItem[]; unknown: number };
    };

export type EngagementResponse = {
  filters: DashboardFilters;
  studentCount: number;
  suppressed: boolean;
  reason?: string;
  summary: {
    modulesStarted: number;
    modulesCompleted: number;
    programCompletionRate: number | null;
    averageModulesPerStudent: number | null;
    averageTimePerModuleSeconds: number | null;
  } | null;
  byModule:
    | {
        moduleId: string;
        orderIndex: number;
        title: string;
        started: number;
        completed: number;
      }[]
    | null;
  dropOff: {
    moduleTitle: string;
    moduleOrderIndex: number;
    lessonHeading: string;
    stepIndex: number;
    viewsAtStep: number;
    viewsAtNextStep: number;
    dropCount: number;
    dropPercent: number;
  } | null;
  popularity: {
    most: { moduleId: string; title: string; starts: number } | null;
    least: { moduleId: string; title: string; starts: number } | null;
  } | null;
};

export type LearningResponse = {
  filters: DashboardFilters;
  studentCount: number;
  suppressed: boolean;
  reason?: string;
  scores: {
    suppressed: boolean;
    studentCount: number;
    reason?: string;
    startingGrid: number | null;
    finishLine: number | null;
    improvement: number | null;
    pairedStudents: number;
  } | null;
  passRate: {
    available: boolean;
    value: null;
    note: string;
  };
  mostMissed: {
    suppressed: boolean;
    studentCount: number;
    reason?: string;
    questions:
      | {
          questionId: string;
          text: string;
          assessmentType: string;
          knowledgeArea: string;
          missCount: number;
          answerCount: number;
          missRatePercent: number;
        }[]
      | null;
  } | null;
  reAttempt: {
    studentsStarted: number;
    studentsWithReAttempt: number;
    ratePercent: number | null;
    byAssessment: {
      assessmentType: string;
      title: string;
      reAttempts: number;
    }[];
  } | null;
};

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  school: { id: string; name: string } | null;
};

export type SchoolsResponse = {
  schools: SchoolOption[];
};

export type DashboardOverviewResponse = {
  improvement: ImprovementResponse;
  reach: ReachResponse;
  engagement: EngagementResponse;
  learning: LearningResponse;
};
