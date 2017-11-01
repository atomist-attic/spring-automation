import { curry } from "@typed/curry";

import { Configuration } from "@atomist/automation-client/configuration";
import * as appRoot from "app-root-path";
import { SpringBootVersionUpgrade } from "./commands/editor/spring/SpringBootVersionUpgrade";
import { RepoCreator } from "./commands/generator/initializr/RepoCreator";
import { ZipCreator } from "./commands/generator/initializr/ZipCreator";
import { addInitializrHandoffRoute } from "./web/initializerHandoff";
import { InMemoryStore } from "./web/InMemoryObjectStore";
import { UpgradeCreatedRepos } from "./commands/editor/spring/UpgradeCreatedRepos";
import { ReposWeMadeRepoFinder } from "./commands/generator/initializr/createdReposRepoFinder";

const pj = require(`${appRoot.path}/package.json`);

const GitHubToken = process.env.GITHUB_TOKEN;

const AtomistUser: string = "atomist-bot";
const AtomistToken: string = process.env.ATOMIST_GITHUB_TOKEN;

export const configuration: Configuration = {
    name: pj.name,
    version: pj.version,
    teamIds: ["T5964N9B7"],
    commands: [
        () => new RepoCreator(InMemoryStore, AtomistUser, AtomistToken),
        ZipCreator,
        () => new UpgradeCreatedRepos(ReposWeMadeRepoFinder, AtomistToken),
    ],
    events: [],
    ingestors: [],
    token: GitHubToken,
    http: {
        enabled: true,
        customizers: [curry(addInitializrHandoffRoute)(InMemoryStore)],
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
