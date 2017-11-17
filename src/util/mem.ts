import {
    CommandHandler,
    HandleCommand,
    HandlerContext,
    HandlerResult,
    RedirectResult,
    Tags,
} from "@atomist/automation-client";
import { logger } from "@atomist/automation-client/internal/util/logger";
import { codeBlock, url } from "@atomist/slack-messages/SlackMessages";
import * as appRoot from "app-root-path";
import * as fs from "fs";
import * as os from "os";

let DataDirectory = null;

export function initMemoryMonitoring(dataDirectory: string = `${appRoot.path}/heap`) {

    logger.info("Initialising memory monitoring");
    DataDirectory = dataDirectory;
    if (!fs.existsSync(DataDirectory)) {
        fs.mkdirSync(DataDirectory);
    }

    setInterval(() => {
        logger.debug("Memory stats: %j", memoryUsage());
    }, 60000);
}

export function heapDump(): string {
    logger.debug("Memory stats for pid '%s': %j", process.pid, memoryUsage());
    const heapdump = require("heapdump");
    const name = `heapdump-${Date.now()}.heapsnapshot`;
    heapdump.writeSnapshot(`${DataDirectory}/${name}`, (err, filename) => {
        logger.debug("Heap dump written to '%s'", filename);
    });
    return name;
}

export function memoryUsage() {
    const mem = process.memoryUsage();
    const usage = {
        rss: (mem.rss / 1024 / 1024).toFixed(2),
        heap_total: (mem.heapTotal / 1024 / 1024).toFixed(2),
        heap_used: (mem.heapUsed / 1024 / 1024 ).toFixed(2),
        mem_free: (os.freemem() / 1024 / 1024).toFixed(2),
        mem_total: (os.totalmem() / 1024 / 1024).toFixed(2),
        up_time: formatMillis(process.uptime() * 1000),
    };
    return usage;
}

function formatMillis(millis: number): string {
    const date = new Date(millis);
    let str = "";
    if (date.getUTCDate() > 1) {
        str += date.getUTCDate() - 1 + " d, ";
    }
    if (date.getUTCHours() > 0) {
        str += date.getUTCHours() + " hr, ";
    }
    if (date.getUTCMinutes() > 0) {
        str += date.getUTCMinutes() + " min, ";
    }
    str += date.getUTCSeconds() + " s";
    return str;
}

export function gc() {
    if (global.gc) {
        global.gc();
    }
}

@CommandHandler("Trigger heap dump and GC")
@Tags("memory", "gc", "dump")
export class HeapDumpCommand implements HandleCommand {

    public handle(ctx: HandlerContext): Promise<HandlerResult> {
        const name = heapDump();
        gc();
        const downloadUrl = "https://lifecycle.atomist.io/heap/" + name;
        return ctx.messageClient
            .addressUsers(`Heap dump available at ${url(downloadUrl, name)}`, "cd")
            .then(() => ({code: 0, redirect: downloadUrl} as RedirectResult));
    }
}

@CommandHandler("Get memory usage")
@Tags("memory", "usage")
export class MemoryUsageCommand implements HandleCommand {

    public handle(ctx: HandlerContext): Promise<HandlerResult> {
        return ctx.messageClient
            .addressUsers(codeBlock(JSON.stringify(memoryUsage(), null, 2)), "cd")
            .then(() => ({ code: 0, ...memoryUsage() }));
    }
}

@CommandHandler("Run GC")
@Tags("memory", "usage")
export class GcCommand implements HandleCommand {

    public handle(ctx: HandlerContext): Promise<HandlerResult> {
        gc();
        return new MemoryUsageCommand().handle(ctx);
    }
}
