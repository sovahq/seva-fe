import type { User } from "@/types"

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "President User",
    email: "president@jcieko.org",
    role: "admin",
    password: "password",
    organizationId: "org-jci-eko",
  },
  {
    id: "user-2",
    name: "Demo Member",
    email: "demo@seva.org",
    role: "member",
    password: "password",
    organizationId: "org-demo",
  },
  {
    id: "user-finance",
    name: "Director of Finance",
    email: "finance@jcieko.org",
    role: "finance",
    password: "password",
    organizationId: "org-jci-eko",
  },
]
