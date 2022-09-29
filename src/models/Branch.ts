import { Commit } from "./Commit";

export interface Branch {
    name: string;
    commit: Commit;
}