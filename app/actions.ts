"use server";

import { revalidatePath, updateTag } from "next/cache";

export async function refreshBriefing(): Promise<void> {
  updateTag("live-education-briefing");
  updateTag("seoul-weather");
  revalidatePath("/");
  revalidatePath("/admin/collect");
}
