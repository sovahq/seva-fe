import { ROUTES } from "@/routes/routenames"

export function useAppPaths() {
  return {
    home: ROUTES.DASHBOARD,
    governance: ROUTES.GOVERNANCE,
    members: ROUTES.MEMBERS,
    events: ROUTES.EVENTS,
    finance: ROUTES.FINANCE,
    board: ROUTES.BOARD,
  }
}
