export type AdminModuleSummary = {
  id: string;
  orderIndex: number;
  title: string;
  subtitle: string | null;
  slug: string;
  status: string;
  heroImageUrl: string | null;
  updatedAt: string;
  lessonCount: number;
  outcomeCount: number;
};

export type AdminModulesResponse = {
  modules: AdminModuleSummary[];
};

export type PortalUserRole = 'staff' | 'partner' | 'school_admin' | 'reviewer';

export type AdminPortalUser = {
  id: string;
  email: string;
  fullName: string;
  role: PortalUserRole;
  schoolId: string | null;
  schoolName: string | null;
  partnerId: string | null;
  partnerName: string | null;
  lastActiveAt: string | null;
  registeredAt: string;
  /** null until Phase 2 wires Supabase MFA lookup */
  mfaEnrolled: boolean | null;
  status: 'active' | 'deactivated';
};

export type AdminPortalUsersResponse = {
  users: AdminPortalUser[];
};

export type AdminModuleQuizOption = {
  id: string;
  letter: string;
  text: string;
  isCorrect: boolean;
};

export type AdminModuleQuizQuestion = {
  id: string;
  orderIndex: number;
  text: string;
  options: AdminModuleQuizOption[];
};

export type AdminModuleQuizResponse = {
  moduleId: string;
  questions: AdminModuleQuizQuestion[];
};

export type AdminModuleDetail = {
  id: string;
  orderIndex: number;
  title: string;
  subtitle: string | null;
  slug: string;
  status: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  updatedAt: string;
  outcomes: { id: string; orderIndex: number; text: string }[];
  lessons: {
    id: string;
    orderIndex: number;
    type: string;
    heading: string;
    body: string | null;
    icon: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    takeaways: { id: string; orderIndex: number; text: string }[];
  }[];
  /** Populated in Phase 3 */
  quizQuestions?: AdminModuleQuizQuestion[];
};

export type AdminAssessmentsResponse = {
  assessments: {
    id: string;
    type: string;
    title: string;
    subtitle: string | null;
    status: string;
    questionCount: number;
  }[];
};

export type AdminQuestionsResponse = {
  assessment: { id: string; type: string; title: string };
  questions: {
    id: string;
    orderIndex: number;
    text: string;
    explanation: string | null;
    knowledgeArea: { id: string; key: string; name: string };
    module: { id: string; title: string } | null;
    options: { id: string; letter: string; text: string; isCorrect: boolean }[];
  }[];
};

export type AdminKnowledgeAreasResponse = {
  knowledgeAreas: { id: string; key: string; name: string; orderIndex: number }[];
};

export type AdminSchoolsResponse = {
  schools: {
    id: string;
    name: string;
    state: string | null;
    contactEmail: string | null;
    inviteCode: string;
    status: string;
    partnerId: string | null;
    partnerName: string | null;
    createdAt: string;
    studentCount: number;
    invitationCount: number;
  }[];
};

export type AdminSchoolInvitationsResponse = {
  school: { id: string; name: string; inviteCode: string; partnerId: string | null };
  invitations: {
    id: string;
    email: string;
    code: string;
    sentAt: string;
    acceptedAt: string | null;
    expiresAt: string;
  }[];
};

export type AdminAuditResponse = {
  events: {
    id: string;
    type: string;
    payload: unknown;
    occurredAt: string;
    actor: { email: string; fullName: string } | null;
  }[];
};

export type AdminMediaAsset = {
  id: string;
  fileName: string;
  publicUrl: string;
  altText: string;
  mimeType: string;
  byteSize: number;
  createdAt: string;
  uploadedBy: string;
};

export type AdminMediaResponse = {
  assets: AdminMediaAsset[];
};

export type AdminBranding = {
  partnerName: string | null;
  logoUrl: string | null;
  logoAlt: string | null;
  updatedAt: string;
};

export type AdminPartnerSummary = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  logoAlt: string | null;
  isDefault: boolean;
  status: string;
  schoolCount: number;
  updatedAt: string;
};

export type AdminPartnersResponse = {
  partners: AdminPartnerSummary[];
};

export type AdminPartnerDetail = AdminPartnerSummary & {
  partnerSlug: string;
  partnerName: string | null;
};

export type AdminPartnerCredential = {
  id: string;
  clientId: string;
  label: string | null;
  scopes: string;
  status: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
};

export type AdminPartnerCredentialsResponse = {
  credentials: AdminPartnerCredential[];
  issued?: {
    id: string;
    clientId: string;
    clientSecret: string;
    scopes: string;
  };
};

export type AdminResourceItem = {
  id: string;
  category: string;
  title: string;
  summary: string | null;
  body: string | null;
  url: string | null;
  orderIndex: number;
  status: string;
  updatedAt: string;
};

export type AdminResourcesResponse = {
  items: AdminResourceItem[];
};
