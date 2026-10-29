/**
 * CAP GET /public/stats — platform-wide aggregate counts for the marketing
 * home page (operationId getPublicStats, tag Public). All-time stock, cached
 * server-side for `cacheTtlSeconds`.
 */

export interface PublicStateCountBucket {
  state: string;
  count: number;
}

export interface PublicLevelCountBucket {
  level: number;
  count: number;
}

export interface NamedCountBucket {
  id: string;
  name: string;
  count: number;
}

export interface PublicMonthCountBucket {
  month: string;
  count: number;
}

export interface PublicReviewStatusCounts {
  pending: number;
  approved: number;
  suspended: number;
  rejected: number;
}

export interface PublicAssessorQualificationCounts {
  qaa: number;
  iqm: number;
  iv: number;
  ev: number;
}

export interface CapPublicStats {
  generatedAt: string;
  cacheTtlSeconds: number;
  candidates: {
    total: number;
    withApplication: number;
    certified: number;
    byState: PublicStateCountBucket[];
  };
  applications: {
    total: number;
    byStatus: {
      draft: number;
      inProgress: number;
      certified: number;
      rejected: number;
      withdrawn: number;
    };
    byType: { rpl: number; nsq: number };
    sponsored: number;
    byLevel: PublicLevelCountBucket[];
    byTrade: NamedCountBucket[];
  };
  assessors: {
    total: number;
    byStatus: PublicReviewStatusCounts;
    byQualification: PublicAssessorQualificationCounts;
    approvedByQualification: PublicAssessorQualificationCounts;
    approvedBySector: NamedCountBucket[];
    approvedByState: PublicStateCountBucket[];
  };
  centres: {
    total: number;
    byStatus: PublicReviewStatusCounts;
    approvedByState: PublicStateCountBucket[];
    approvedStatesCovered: number;
    approvedByTrade: NamedCountBucket[];
  };
  catalogue: {
    sectors: number;
    trades: { total: number; active: number; archived: number };
    nosDocuments: { active: number; superseded: number };
    qualificationLevels: number;
    units: number;
  };
  certificates: {
    issued: number;
    revoked: number;
    issuedThisYear: number;
    byMonth: PublicMonthCountBucket[];
    byTrade: NamedCountBucket[];
    byLevel: PublicLevelCountBucket[];
    medianDaysToCertification: number | null;
  };
  awardingBodies: { total: number };
  jobPostings: {
    total: number;
    byStatus: { open: number; closed: number; filled: number; cancelled: number };
  };
}
