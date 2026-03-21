/**
 * Root backend module map.
 *
 * The real Nest AppModule should import these modules first:
 * - iam
 * - tenancy
 * - academy-memberships
 * - invitations
 * - enrollment-requests
 */
export const appModuleDefinition = {
  modules: [
    "iam",
    "tenancy",
    "academy-memberships",
    "invitations",
    "enrollment-requests",
    "onboarding",
  ],
  services: [
    "TenantResolutionService",
    "AcademyMembershipService",
    "InvitationService",
    "EnrollmentRequestService",
    "SessionComposerService",
  ],
} as const
