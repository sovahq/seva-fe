import type { AccessLevel, BoardPosition, BoardPositionAssignment } from "@/types"

const defaultAccess: Record<string, AccessLevel> = {
  governance: "none",
  membership: "none",
  financial: "none",
  projects: "none",
}

export const mockBoardPositions: BoardPosition[] = [
  {
    id: "pos-president",
    organizationId: "org-jci-eko",
    name: "President",
    reportsToId: null,
    moduleAccess: {
      governance: "manage",
      membership: "manage",
      financial: "manage",
      projects: "manage",
    },
  },
  {
    id: "pos-treasurer",
    organizationId: "org-jci-eko",
    name: "Treasurer",
    reportsToId: "pos-president",
    moduleAccess: { ...defaultAccess, financial: "manage", membership: "view" },
  },
  {
    id: "pos-secretary",
    organizationId: "org-jci-eko",
    name: "Secretary",
    reportsToId: "pos-president",
    moduleAccess: { ...defaultAccess, governance: "manage", membership: "view" },
  },
  {
    id: "pos-member",
    organizationId: "org-jci-eko",
    name: "Board Member",
    reportsToId: "pos-president",
    moduleAccess: { ...defaultAccess, membership: "view", projects: "view" },
  },
]

export const mockBoardAssignments: BoardPositionAssignment[] = [
  {
    id: "assign-1",
    organizationId: "org-jci-eko",
    positionId: "pos-president",
    userId: "user-1",
    email: null,
  },
  {
    id: "assign-2",
    organizationId: "org-jci-eko",
    positionId: "pos-treasurer",
    userId: null,
    email: "treasurer@jcieko.org",
  },
]
