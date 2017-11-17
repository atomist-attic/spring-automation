import { automationClient } from "@atomist/automation-client/automationClient";
import { findConfiguration } from "@atomist/automation-client/configuration";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { enableDefaultScanning } from "@atomist/automation-client/scan";
import {
    loadSecretsFromCloudFoundryEnvironment,
    loadSecretsFromConfigServer,
} from "./util/secrets";

loadSecretsFromCloudFoundryEnvironment()
    .then(() => {
        const configuration = enableDefaultScanning(findConfiguration());
        const node = automationClient(configuration);
        node.run()
            .then(() => logger.info("Successfully completed startup of process '%s'", process.pid));
    });
