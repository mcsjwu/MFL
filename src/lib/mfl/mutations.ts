import { mflImport } from "./client";

export interface SubmitLineupParams {
  cookie: string;
  week: number;
  /** Player ids that should be in the starting lineup for the week. */
  starters: string[];
  /** Only needed when acting as commissioner on someone else's behalf. */
  franchiseId?: string;
  comments?: string;
}

/**
 * Submits a franchise's starting lineup for a given week via MFL's `lineup`
 * import API. Requires the owner's own session cookie — the APIKEY shortcut
 * doesn't work for import (write) requests per MFL's docs.
 */
export async function submitLineup(params: SubmitLineupParams): Promise<void> {
  await mflImport("lineup", {
    cookie: params.cookie,
    params: {
      W: params.week,
      STARTERS: params.starters.join(","),
      FRANCHISE_ID: params.franchiseId,
      COMMENTS: params.comments,
    },
  });
}
