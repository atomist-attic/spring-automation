import { Configuration } from "@atomist/automation-client/configuration";
import * as appRoot from "app-root-path";
import { SpringBootVersionUpgrade } from "./commands/editor/spring/SpringBootVersionUpgrade";
import { RepoCreator } from "./commands/generator/initializr/RepoCreator";
import { ZipCreator } from "./commands/generator/initializr/ZipCreator";
import { addInitializrHandoffRoute } from "./web/initializerHandoff";


const pj = require(`${appRoot.path}/package.json`);

const GitHubToken = process.env.GITHUB_TOKEN;

export const configuration: Configuration = {
    name: pj.name,
    version: pj.version,
    teamIds: ["T5964N9B7"], // <-- run @atomist pwd in your slack team to obtain the team id
    commands: [
        RepoCreator,
        ZipCreator,
        SpringBootVersionUpgrade,
    ],
    events: [
    ],
    ingestors: [
    ],
    token: GitHubToken,
    http: {
        enabled: true,
        customizers: [addInitializrHandoffRoute],
        auth: {
            basic: {
                enabled: false,
                username: "test",
                password: "test",
            },
            bearer: {
                enabled: false,
                token: GitHubToken,
            },
            github: {
                enabled: false,
                clientId: "092b3124ced86d5d1569",
                clientSecret: "71d72f657d4402009bd8d728fc1967939c343793",
                callbackUrl: "http://localhost:2866",
                org: "atomisthqa",
                adminOrg: "atomisthq",
            },
        },
        forceSecure: false,
    },
};
