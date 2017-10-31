import { Ingestor } from "@atomist/automation-client/decorators";
import {
    EventFired,
    HandleEvent,
    HandlerContext,
    HandlerResult,
    Success,
} from "@atomist/automation-client/Handlers";

@Ingestor("A simple ingestor that accepts Hello payloads", "hello")
export class HelloIngestor implements HandleEvent<Hello> {

    public handle(e: EventFired<Hello>, ctx: HandlerContext): Promise<HandlerResult> {
        console.log(`Incoming event had ${e.data.name}`);
        return Promise.resolve(Success);
    }
}

export interface Hello {
    name: string;
}
