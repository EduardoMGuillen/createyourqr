import { PlanCode } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      planCode: PlanCode;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    planCode?: PlanCode;
  }
}
