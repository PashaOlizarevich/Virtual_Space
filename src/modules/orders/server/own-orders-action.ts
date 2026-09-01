"use server";

import { ZodError } from "zod";

import { listOwnOrders, type OwnOrderPageDto } from "@/modules/orders/server/order-read";
import { UserAuthenticationRequiredError } from "@/server/user-auth";

export type OwnOrdersActionResult =
  | Readonly<{ ok: true; page: OwnOrderPageDto }>
  | Readonly<{ ok: false; code: "UNAUTHENTICATED" | "INVALID_INPUT" | "INTERNAL_ERROR" }>;

export async function listOwnOrdersAction(input: unknown): Promise<OwnOrdersActionResult> {
  try {
    return { ok: true, page: await listOwnOrders(input) };
  } catch (error) {
    if (error instanceof UserAuthenticationRequiredError) {
      return { ok: false, code: "UNAUTHENTICATED" };
    }
    if (error instanceof ZodError) return { ok: false, code: "INVALID_INPUT" };
    return { ok: false, code: "INTERNAL_ERROR" };
  }
}
