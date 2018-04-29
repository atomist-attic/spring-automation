/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Configuration } from "@atomist/automation-client";
import { initMemoryMonitoring } from "@atomist/automation-client/internal/util/memory";

import * as appRoot from "app-root-path";
import * as config from "config";

import { findMutableInjectionsCommand } from "./commands/editor/spring/findMutableInjections";
import { findNonSpecificMvcAnnotationsCommand } from "./commands/editor/spring/findNonSpecificMvcAnnotations";
import { removeAutowiredOnSoleConstructorCommand } from "./commands/editor/spring/removeUnnecessaryAutowiredAnnotations";
import {
    findUnnecessaryComponentScanReviewerCommand,
    removeUnnecessaryComponentScanCommand,
} from "./commands/editor/spring/removeUnnecessaryComponentScanAnnotations";
import { springBootVersionUpgrade } from "./commands/editor/spring/SpringBootVersionUpgrade";
import { unleashPhilCommand } from "./commands/editor/spring/unleashPhil";
import { verifyPomCommand } from "./commands/editor/spring/verifyPom";
import { kotlinSpring5Generator } from "./commands/generator/spring/kotlinSpring5Generator";
import { springBootGenerator } from "./commands/generator/spring/springBootGenerator";
import { MessagingReviewRouter } from "./commands/messagingReviewRouter";
import { springBootVersionReviewerCommand } from "./commands/reviewer/spring/SpringBootVersionReviewer";
import { tagAllCommand } from "./commands/tag/allTagger";
import { nodeTaggerCommand } from "./commands/tag/nodeTagger";
import { springBootTaggerCommand } from "./commands/tag/springTagger";
import { LogzioOptions } from "./util/logzio";
import { secret } from "./util/secrets";

// tslint:disable-next-line:no-var-requires
const pj = require(`${appRoot.path}/package.json`);

const token = secret("github.token", process.env.GITHUB_TOKEN);
const notLocal = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

// tslint:disable-next-line:no-unused-variable
const logzioOptions: LogzioOptions = {
    applicationId: secret("applicationId"),
    environmentId: secret("environmentId"),
    token: secret("logzio.token", process.env.LOGZIO_TOKEN),
};

export const configuration: Configuration = {
    name: pj.name,
    version: pj.version,
    keywords: pj.keywords,
    policy: config.get("policy"),
    teamIds: config.get("teamIds"),
    token,
    commands: [
        () => removeUnnecessaryComponentScanCommand,
        () => removeAutowiredOnSoleConstructorCommand,
        springBootGenerator,
        kotlinSpring5Generator,
        springBootVersionUpgrade,
        findNonSpecificMvcAnnotationsCommand,
        findUnnecessaryComponentScanReviewerCommand,
        findMutableInjectionsCommand,
        verifyPomCommand,
        springBootTaggerCommand,
        nodeTaggerCommand,
        () => tagAllCommand,
        () => unleashPhilCommand,
        () => springBootVersionReviewerCommand(MessagingReviewRouter),
        // CopyGenerator,
    ],
    events: [],
    listeners: [],
    http: {
        enabled: true,
        auth: {
            basic: {
                enabled: config.get("http.auth.basic.enabled"),
                username: secret("dashboard.user"),
                password: secret("dashboard.password"),
            },
            bearer: {
                enabled: config.get("http.auth.bearer.enabled"),
                adminOrg: "atomisthq",
            },
        },
    },
    endpoints: {
        api: config.get("endpoints.api"),
        graphql: config.get("endpoints.graphql"),
    },
    applicationEvents: {
        enabled: true,
        teamId: "T29E48P34",
    },
    cluster: {
        enabled: notLocal,
        // worker: 2,
    },
    ws: {
        enabled: true,
        termination: {
            graceful: true,
        },
    },
};
(configuration as any).groups = config.get("groups");

initMemoryMonitoring();
