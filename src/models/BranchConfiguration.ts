import { Branch } from "./Branch";
import { Build } from "./Build";

export interface BranchConfiguration {
    branch: Branch;
    configured: boolean;
    lastBuild: Build;
  }