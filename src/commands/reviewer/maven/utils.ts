
import { PropertiesGrammar } from "../../../grammars/mavenGrammars";

/**
 * Parse the properties block of a POM and
 * replace references to them.
 * @param content
 * @returns {string}
 */
export function expandProperties(content: string): string {
    let expanded = content;
    // Stop after the first match
    const propsBlock = PropertiesGrammar.firstMatch(content);
    if (propsBlock) {
        for (const property of propsBlock.properties) {
            // console.log(`Name=${property.name}, value=${property.value}`);
            expanded = content.replace("${" + property.name + "}", property.value);
        }
    }
    return expanded;
}
