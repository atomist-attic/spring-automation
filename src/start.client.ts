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

import { automationClient } from "@atomist/automation-client/automationClient";
import { findConfiguration } from "@atomist/automation-client/configuration";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { enableDefaultScanning } from "@atomist/automation-client/scan";
import {
    loadSecretsFromCloudFoundryEnvironment,
    loadSecretsFromConfigServer,
} from "./util/secrets";

loadSecretsFromConfigServer()
    .then(loadSecretsFromCloudFoundryEnvironment)
    .then(() => {
        const configuration = enableDefaultScanning(findConfiguration());
        const node = automationClient(configuration);
        return node.run()
            .then(() => logger.info("Successfully completed startup of process '%s'", process.pid));
    });
