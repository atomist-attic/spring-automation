import {
    EventFired,
    HandlerContext,
    HandlerResult,
} from "@atomist/automation-client";
import { CommandInvocation } from "@atomist/automation-client/internal/invoker/Payload";
import {
    CommandIncoming,
    EventIncoming,
} from "@atomist/automation-client/internal/transport/RequestProcessor";
import * as nsp from "@atomist/automation-client/internal/util/cls";
import { logger } from "@atomist/automation-client/internal/util/logger";
import {
    AutomationEventListener,
    AutomationEventListenerSupport,
} from "@atomist/automation-client/server/AutomationEventListener";
import { MessageOptions } from "@atomist/automation-client/spi/message/MessageClient";
import { SlackMessage } from "@atomist/slack-messages/SlackMessages";
import * as appRoot from "app-root-path";
import { createLogger } from "logzio-nodejs";
import * as serializeError from "serialize-error";

/* tslint:disable */
const logzioWinstonTransport = require("winston-logzio");
const _assign = require("lodash.assign");
const pj = require(`${appRoot.path}/package.json`);
/* tslint:enable */

export class LogzioAutomationEventListener extends AutomationEventListenerSupport
    implements AutomationEventListener {

    private logzio;

    constructor(options: LogzioOptions) {
        super();
        this.initLogzioLogging(options);
    }

    public commandIncoming(payload: CommandIncoming) {
        this.sendEvent("Incoming command", "request", payload);
    }

    public commandStarting(payload: CommandInvocation,
                           ctx: HandlerContext) {
        this.sendOperation("CommandHandler", "operation", "command-handler",
            payload.name, "starting");
    }

    public commandSuccessful(payload: CommandInvocation,
                             ctx: HandlerContext,
                             result: HandlerResult) {
        return Promise.resolve(this.sendOperation("CommandHandler", "operation", "command-handler",
            payload.name, "successful", result));

    }

    public commandFailed(payload: CommandInvocation,
                         ctx: HandlerContext,
                         err: any) {
        return Promise.resolve(this.sendOperation("CommandHandler", "operation", "command-handler",
            payload.name, "failed", err));
    }

    public eventIncoming(payload: EventIncoming) {
        return Promise.resolve(
            this.sendEvent("Incoming event", "event", payload));
    }

    public eventStarting(payload: EventFired<any>,
                         ctx: HandlerContext) {
        return Promise.resolve(this.sendOperation("EventHandler", "operation", "event-handler",
            payload.extensions.operationName, "starting"));
    }

    public eventSuccessful(payload: EventFired<any>,
                           ctx: HandlerContext,
                           result: HandlerResult[]) {
        return Promise.resolve(this.sendOperation("EventHandler", "operation", "event-handler",
            payload.extensions.operationName, "successful", result));
    }

    public eventFailed(payload: EventFired<any>,
                       ctx: HandlerContext, err: any) {
        return Promise.resolve(this.sendOperation("EventHandler", "operation", "event-handler",
            payload.extensions.operationName, "failed", err));
    }

    public messageSent(message: string | SlackMessage,
                       userNames: string | string[],
                       channelName: string | string[],
                       options?: MessageOptions) {
        this.sendEvent("Outgoing message", "message", {
            message,
            "user-names": userNames,
            "channel-names": channelName,
            options,
        });
    }

    private sendOperation(identifier: string,
                          eventType: string,
                          type: string,
                          name: string,
                          status: string,
                          err?: any) {
        const start = nsp.get().ts;
        const data: any = {
            "operation-type": type,
            "operation-name": name,
            "artifact": nsp.get().name,
            "version": nsp.get().version,
            "team-id": nsp.get().teamId,
            "team-name": nsp.get().teamName,
            "event-type": eventType,
            "level": status === "failed" ? "error" : "info",
            status,
            "execution-time": Date.now() - start,
            "correlation-id": nsp.get().correlationId,
            "invocation-id": nsp.get().invocationId,
            "message": `${identifier} ${name} invocation ${status} for ${nsp.get().teamName} '${nsp.get().teamId}'`,
        };
        if (err) {
            if (status === "failed") {
                data.stacktrace = serializeError(err);
            } else if (status === "successful") {
                data.result = serializeError(err);
            }
        }
        if (this.logzio) {
            this.logzio.log(data);
        }
    }

    private sendEvent(identifier: string,
                      type: string,
                      payload: any) {
        const data = {
            "operation-name": nsp.get().operation,
            "artifact": nsp.get().name,
            "version": nsp.get().version,
            "team-id": nsp.get().teamId,
            "team-name": nsp.get().teamName,
            "event-type": type,
            "level": "info",
            "correlation-id": nsp.get().correlationId,
            "invocation-id": nsp.get().invocationId,
            "message": `${identifier} of ${nsp.get().operation} for ${nsp.get().teamName} '${nsp.get().teamId}'`,
            "payload": JSON.stringify(payload),
        };
        if (this.logzio) {
            this.logzio.log(data);
        }
    }

    private initLogzioLogging(options: LogzioOptions) {

        const logzioOptions = {
            token: options.token,
            level: "debug",
            type: "automation-client",
            protocol: "https",
            bufferSize: 10,
            extraFields: {
                "service": pj.name,
                "artifact": pj.name,
                "version": pj.version,
                "environment": options.environmentId,
                "application-id": options.applicationId,
            },
        };
        // create the logzio event logger
        this.logzio = createLogger(logzioOptions);

        logzioWinstonTransport.prototype.log = function(level, msg, meta, callback) {

            if (typeof msg !== "string" && typeof msg !== "object") {
                msg = { message: this.safeToString(msg) };
            } else if (typeof msg === "string") {
                msg = { message: msg };
            }

            if (meta instanceof Error) {
                meta = { error: meta.stack || meta.toString() };
            }

            if (nsp && nsp.get()) {
                _assign(msg, {
                    level,
                    "meta": meta,
                    "operation-name": nsp.get().operation,
                    "artifact": nsp.get().name,
                    "version": nsp.get().version,
                    "team-id": nsp.get().teamId,
                    "team-name": nsp.get().teamName,
                    "correlation-id": nsp.get().correlationId,
                    "invocation-id": nsp.get().invocationId,
                    "process-id": process.pid,
                });
            } else {
                _assign(msg, {
                    level,
                    meta,
                });
            }

            this.logzioLogger.log(msg);

            callback(null, true);
        };

        // create the winston logging adapter
        (logger as any).add(logzioWinstonTransport, logzioOptions);

    }
}

export interface LogzioOptions {

    token: string;
    environmentId: string;
    applicationId: string;

}
