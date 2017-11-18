import * as appRoot from "app-root-path";
import { UpgradeCreatedRepos } from "./commands/editor/spring/UpgradeCreatedRepos";
import { ReposWeMadeRepoFinder } from "./commands/generator/initializr/createdReposRepoFinder";
import { SpringRepoCreator } from "./commands/generator/initializr/SpringRepoCreator";
import { NodeGenerator } from "./commands/generator/node/NodeGenerator";
import { addFlaskRoutes } from "./web/flask/flaskRoutes";
import { InMemoryStore } from "./web/InMemoryObjectStore";
import { addNodeRoutes } from "./web/node/nodeRoutes";
import { orgPage } from "./web/orgPage";
import { projectPage } from "./web/projectPage";
import { addDeployRoutes } from "./web/spring/addDeployRoutes";
import { addInitializrHandoffRoute } from "./web/spring/initializerHandoff";
import { initMemoryMonitoring } from "./util/mem";
import { secret } from "./util/secrets";
import { LogzioAutomationEventListener, LogzioOptions } from "./util/logzio";
import { CopyGenerator } from "./commands/generator/common/CopyGenerator";
import { ObjectStore } from "./web/ObjectStore";
import { seedMetadataRoutes } from "./web/metadata/seedMetadataRoutes";

const pj = require(`${appRoot.path}/package.json`);

const token = secret("github.token", process.env.GITHUB_TOKEN);
const notLocal = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

const logzioOptions: LogzioOptions = {
    applicationId: secret("applicationId"),
    environmentId: secret("environmentId"),
    token: secret("logzio.token", process.env.LOGZIO_TOKEN),
};

// Set uo automation event listeners
const listeners = [];

// Logz.io will only work in certain environments
if (logzioOptions.token) {
    listeners.push(new LogzioAutomationEventListener(logzioOptions));
}

const AtomistUser: string = "atomist-bot";
const AtomistToken: string = process.env.ATOMIST_GITHUB_TOKEN || token;

export const configuration: any = {
    name: pj.name,
    version: pj.version,
    teamIds: [ "T095SFFBK" ],
    // groups: ["all"],
    commands: [
        () => new SpringRepoCreator(InMemoryStore),
        () => new NodeGenerator(InMemoryStore),
        () => new CopyGenerator(InMemoryStore, AtomistToken),
        () => new UpgradeCreatedRepos(ReposWeMadeRepoFinder, AtomistToken),
    ],
    events: [],
    token,
    listeners,
    ws: {
        enabled: false,
    },
    http: {
        enabled: true,
        customizers: [
            seedMetadataRoutes,
            addInitializrHandoffRoute,
            addFlaskRoutes,
            addNodeRoutes,
            projectPage,
            orgPage,
            addDeployRoutes,
        ],
        auth: {
            basic: {
                enabled: false,
            },
            bearer: {
                enabled: true,
            },
            github: {
                enabled: false,
                clientId: "092b3124ced86d5d1569",
                clientSecret: "71d72f657d4402009bd8d728fc1967939c343793",
                callbackUrl: "http://localhost:2866",
                adminOrg: "atomisthq",
            },
        },
        forceSecure: false,
    },
};

// For now, we enable a couple of interesting memory and heap commands on this automation-client
initMemoryMonitoring(`${appRoot.path}/node_modules/@atomist/automation-client/public/heap`);
