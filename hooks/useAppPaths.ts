import { ROUTES } from "@/routes/routenames"

export function useAppPaths() {
  return {
    home: ROUTES.DASHBOARD,
    governance: ROUTES.GOVERNANCE,
    members: ROUTES.MEMBERS,
    meetings: ROUTES.MEETINGS,
    finance: ROUTES.FINANCE,
    board: ROUTES.BOARD,
  }
}
