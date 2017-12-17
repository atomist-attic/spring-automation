import { Parameters } from "@atomist/automation-client/decorators";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { FallbackReposParameters } from "../editor/FallbackReposParameters";

@Parameters()
export class MappedOrFallbackParameters extends BaseEditorOrReviewerParameters {

    constructor() {
        super(new FallbackReposParameters());
    }
}
