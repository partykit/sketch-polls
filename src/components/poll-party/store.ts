import { createLocalStore } from "stencil-store-storage";

export const key = "poll-party";
export const defaultValues = {
  hasVoted: [],
};
const local = createLocalStore(key, defaultValues);
const state = local.state;

export default state;
