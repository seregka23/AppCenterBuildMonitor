import axios, { AxiosInstance } from "axios"
import { BranchConfiguration } from "./models/BranchConfiguration";
import { Build } from "./models/Build";
import { ValidateError } from "./models/ValidateError";


export class BuildMonitor {
    private readonly apiClient: AxiosInstance;

    constructor(
        private readonly appName: string,
        private readonly ownerName: string,
        private readonly token: string
    ) {

        this.apiClient = axios.create({
            baseURL: `https://api.appcenter.ms/v0.1/apps/${this.ownerName}/${this.appName}`,
            responseType: "json",
            headers: {
                "Content-Type": "application/json",
                "X-API-Token": token,
            },
        })
    }

    async startBuilds() {
        try {
            console.log("*=========================*");
            console.log("Finding configured branches");
            console.log("*=========================*");

            const branches = await this.getBranches();

            const configuredBranches = branches.filter(b => b.configured);

            console.log("*=========================*");
            console.log("Starting builds");
            console.log("*=========================*");
            const startBuildRequests = configuredBranches.map((branch) =>
                this.startBuild(branch.branch.name, branch.branch.commit.sha)
            );
            const startedBuilds = await Promise.all(startBuildRequests);

            console.log("*=========================*");
            startedBuilds.forEach(b => {
                console.log(`Build # ${b.id} was started.`);
            })
            console.log("*=========================*");
            this.monitorBuild(startedBuilds);

        } catch (error) {
            throw Error(`Application failed with code ${(<ValidateError>error)?.response.data.statusCode} with following error: "${(<ValidateError>error)?.response.data.message}"`)
        }
    }

    private async getBranches() {
        const response = await this.apiClient.get(`/branches`);
        const branches: BranchConfiguration[] = response.data;
        return branches;
    }

    private async startBuild(branchName: string, sourceVersion: string) {
        const params = { sourceVersion: sourceVersion };
        const response = await this.apiClient.post(
            `/branches/${branchName}/builds`,
            params
        );
        const build: Build = response.data;
        return build;
    }

    private async monitorBuild(builds: Build[]) {

        //Get updated status
        const buildRequests = builds.map((build: Build) => {
            return this.getBuildByID(build.id);
        });
        const buildsPromise = await Promise.all(buildRequests);

        buildsPromise.forEach(b => {
            if (b.status === "completed") this.showLog(b);
        })

        const runningBuilds = buildsPromise.filter((b: Build) => b.status !== "completed")

        if (!runningBuilds || runningBuilds.length === 0) return;
        // runningBuilds.forEach((b: Build) => console.log(`${b.sourceBranch} build ${b.id} is running`))
        // console.log("*=========================*");

        setTimeout(() => { this.monitorBuild(runningBuilds) }, 1 * 60 * 1000);
    }

    async getBuildByID(id: number) {
        const response = await this.apiClient.get(`/builds/${id}`);
        const build: Build = response.data;
        return build;
    }

    private showLog(build: Build) {
        const logsLink = `https://appcenter.ms/users/${this.ownerName}/apps/${this.appName}/build/branches/${build.sourceBranch}/builds/${build.id}`;
        const buildDuration =
            (Date.parse(build.finishTime) - Date.parse(build.startTime)) / 1000;
        console.log(
            `${build.sourceBranch} build ${build.id} ${build.result} in ${buildDuration} sec. Link to build logs ${logsLink}`
        );
    }
}