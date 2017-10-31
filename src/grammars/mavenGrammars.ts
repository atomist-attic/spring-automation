import { Microgrammar } from "@atomist/microgrammar/Microgrammar";
import { atLeastOne, zeroOrMore } from "@atomist/microgrammar/Rep";
import { VersionedArtifact } from "./VersionedArtifact";

export const ElementName = /^[a-zA-Z_.0-9\-]+/;

export const ElementContent = /^[a-zA-Z_.0-9\-]+/;

export const XmlTagWithSimpleValueGrammar = {
    _l: "<",
    name: ElementName,
    _r: ">",
    value: ElementContent,
    _l2: "</",
    _close: ElementName,
    _ok: ctx => ctx._close === ctx.name,
    _r2: ">",
};

export interface XmlTag {
    name: string;
    value: string;
}

/**
 * GAV can be in any order in Maven POMs, so this grammar is more
 * complicated than it would seem
 * @type {Microgrammar<{gav: VersionedArtifact}>}
 */
export const GavGrammar = Microgrammar.fromDefinitions<{ gav: VersionedArtifact }>({
    tags: atLeastOne(XmlTagWithSimpleValueGrammar),
    // This function validates the matches to date
    // We need both groupId and artifactId for the GAV to be valid. version is optional
    _valid: ctx =>
        ctx.tags.filter(t => t.name === "groupId").length > 0 &&
        ctx.tags.filter(t => t.name === "artifactId").length > 0,
    gav: ctx => {
        const group = ctx.tags.filter(tag => tag.name === "groupId")[0].value;
        const artifact = ctx.tags.filter(tag => tag.name === "artifactId")[0].value;
        const versions = ctx.tags.filter(tag => tag.name === "version");
        const version = versions.length === 1 ? versions[0].value : undefined;
        return { group, artifact, version };
    },
});

export interface ArtifactContainer {
    gav: VersionedArtifact;
    version?: XmlTag;
}

/**
 * Grammar for an element, such as <dependency> or <parent>, that contains
 * a distinct GAV
 * @param {string} containerElementName
 * @return {Microgrammar<ArtifactContainer>}
 */
function artifactContainerGrammar(containerElementName: string, group?: string, artifact?: string) {
    return Microgrammar.fromDefinitions<ArtifactContainer>({
        _start: `<${containerElementName}>`,
        _gav: GavGrammar,
        // Validation steps if we are searching for a precise artifact
        _hasDesiredGroup: ctx => !!artifact ? ctx._gav.gav.group === group : true,
        _hasDesiredArtifact: ctx => !!artifact ? ctx._gav.gav.artifact === artifact : true,
        gav: ctx => ctx._gav.gav,
        // Pull this up so that we can modify it directly.
        // We can't modify through gav property as it's computed by a function in GavGrammar
        version: ctx => ctx._gav.tags.find(t => t.name === "version"),
    });
}

export const ParentStanzaGrammar =
    artifactContainerGrammar("parent");

export function parentStanzaOfGrammar(artifact: string) {
    return artifactContainerGrammar("parent", artifact);
}

export const DependencyGrammar = artifactContainerGrammar("dependency");

/**
 * Matches dependency of a particular artifact
 * @param {string} group
 * @param {string} artifact
 * @return {Microgrammar<ArtifactContainer>}
 */
export function dependencyOfGrammar(group: string, artifact: string) {
    return artifactContainerGrammar("dependency", group, artifact);
}

const property = {
    _gt: "<",
    name: ElementName,
    _close: ">",
    value: /^[^<]+/,
    _gt2: "</",
    _closing: ElementName,
    _done: ">",
};

export const PropertiesGrammar =
    Microgrammar.fromDefinitions<PropertiesBlock>({
        _po: "<properties>",
        properties: zeroOrMore(property),
    });

/**
 * Type for returned property
 */
export interface PropertiesBlock {
    properties: Array<{ name: string, value: string }>;
}
