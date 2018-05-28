
import { Microgrammar } from "@atomist/microgrammar/Microgrammar";
import { optional } from "@atomist/microgrammar/Ops";

export const ELEMENT_NAME = /^[a-zA-Z_.0-9\-]+/;

export const ELEMENT_CONTENT = /^[a-zA-Z_.0-9\-]+/;

export const XML_TAG_WITH_SIMPLE_VALUE = {
    _l: "<",
    name: ELEMENT_NAME,
    _r: ">",
    value: ELEMENT_CONTENT,
    _l2: "</",
    _close: ELEMENT_NAME,
    _ok: ctx => ctx._close === ctx.name,
    _r2: ">",
};

export interface XmlTag {
    name: string;
    value: string;
}

export const OPEN_OR_CLOSE_TAG = Microgrammar.fromDefinitions<{ name: string, slash}>({
    _l: "<",
    slash: optional("/"),
    name: ELEMENT_NAME,
    _r: ">",
});