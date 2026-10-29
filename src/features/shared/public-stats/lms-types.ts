/**
 * LMS GET /public/stats — platform-wide aggregate counts for the marketing
 * sites (operationId getPublicStats, tag Public). All-time stock, cached
 * server-side for `cacheTtlSeconds`.
 */

import type {
  CapPublicStats,
  PublicMonthCountBucket,
} from "./types";

export interface PublicLabelCountBucket {
  label: string;
  count: number;
}

export interface PublicIdCountBucket {
  id: string;
  count: number;
}

export interface PublicPublishStatusCounts {
  draft: number;
  published: number;
  archived: number;
}

export interface LmsPublicStats {
  generatedAt: string;
  cacheTtlSeconds: number;
  learners: {
    total: number;
    byStatus: {
      active: number;
      suspended: number;
    };
    certified: number;
    activeLast30Days: number;
    byState: PublicLabelCountBucket[];
    byGender: PublicLabelCountBucket[];
  };
  instructors: {
    total: number;
    byStatus: {
      invited: number;
      active: number;
      suspended: number;
    };
  };
  levelOfferings: {
    total: number;
    byStatus: PublicPublishStatusCounts;
    publishedByQualificationLevel: PublicIdCountBucket[];
  };
  unitOfferings: {
    total: number;
    byStatus: PublicPublishStatusCounts;
    publishedByTrade: PublicIdCountBucket[];
    publishedByQualificationLevel: PublicIdCountBucket[];
  };
  standaloneCourses: {
    total: number;
    byStatus: PublicPublishStatusCounts;
  };
  content: {
    modules: number;
    items: number;
    itemsByType: {
      nativeLesson: number;
      video: number;
      quiz: number;
      assignment: number;
      scormPackage: number;
    };
  };
  enrollments: {
    total: number;
    byStatus: {
      pending: number;
      active: number;
      completed: number;
      expired: number;
      withdrawn: number;
    };
    completionRate: number | null;
  };
  levelEnrollments: {
    total: number;
    byStatus: {
      pending: number;
      active: number;
      expired: number;
      withdrawn: number;
    };
    sponsored: number;
  };
  certificates: {
    issued: number;
    revoked: number;
    issuedThisYear: number;
    byMonth: PublicMonthCountBucket[];
  };
  seats: {
    allocations: number;
    organizations: number;
    totalSlots: number;
    seatsAssigned: number;
  };
}

export type { CapPublicStats };
