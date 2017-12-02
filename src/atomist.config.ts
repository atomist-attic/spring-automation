import { initMemoryMonitoring } from "@atomist/automation-client/internal/util/memory";
import * as appRoot from "app-root-path";
import { findMutableInjectionsCommand } from "./commands/editor/spring/findMutableInjections";
import { findNonSpecificMvcAnnotationsCommand } from "./commands/editor/spring/findNonSpecificMvcAnnotations";
import {
    removeAutowiredOnSoleConstructorCommand,
    removeUnnecessaryComponentScanCommand,
} from "./commands/editor/spring/removeUnnecessaryAnnotations";
import { unleashPhilCommand } from "./commands/editor/spring/unleashPhil";
import { verifyPomCommand } from "./commands/editor/spring/verifyPom";
import { kotlinSpring5Generator } from "./commands/generator/spring/kotlinSpring5Generator";
import { springBootGenerator } from "./commands/generator/spring/springBootGenerator";
import { MessagingReviewRouter } from "./commands/messagingReviewRouter";
import { springBootVersionReviewerCommand } from "./commands/reviewer/spring/SpringBootVersionReviewer";
import { LogzioOptions } from "./util/logzio";
import { secret } from "./util/secrets";
import { springBootVersionUpgrade } from "./commands/editor/spring/SpringBootVersionUpgrade";

const pj = require(`${appRoot.path}/package.json`);

const token = secret("github.token", process.env.GITHUB_TOKEN);
const notLocal = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

const logzioOptions: LogzioOptions = {
    applicationId: secret("applicationId"),
    environmentId: secret("environmentId"),
    token: secret("logzio.token", process.env.LOGZIO_TOKEN),
};

// Set up automation event listeners
const listeners = [];

// Logz.io will only work in certain environments
if (logzioOptions.token) {
    // listeners.push(new LogzioAutomationEventListener(logzioOptions));
}

const AtomistUser: string = "atomist-bot";
const AtomistToken: string = process.env.ATOMIST_GITHUB_TOKEN || token;

export const configuration: any = {
    name: pj.name,
    version: pj.version,
    teamIds: ["T5964N9B7"],
    // groups: ["all"],
    commands: [
        () => removeUnnecessaryComponentScanCommand,
        () => removeAutowiredOnSoleConstructorCommand,
        () => springBootGenerator(),
        () => kotlinSpring5Generator(),
        () => springBootVersionUpgrade(), // Is this one bad?
        () => findNonSpecificMvcAnnotationsCommand(),
        () => findMutableInjectionsCommand(),
        () => verifyPomCommand(),
        () => unleashPhilCommand,
        () => springBootVersionReviewerCommand(MessagingReviewRouter),
        // CopyGenerator,
    ],
    events: [],
    token,
    listeners,
    ws: {
        enabled: true,
    },
    http: {
        enabled: true,
        auth: {
            basic: {
                enabled: false,
            },
            bearer: {
                enabled: true,
            },
            github: {
                enabled: false,
            },
        },
        forceSecure: false,
    },
    applicationEvents: {
        enabled: true,
        teamId: "T29E48P34",
    },
    cluster: {
        enabled: false,
        workers: 2,
    },
};

// For now, we enable a couple of interesting memory and heap commands on this automation-client
initMemoryMonitoring(`${appRoot.path}/node_modules/@atomist/automation-client/public/heap`);
