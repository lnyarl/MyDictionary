import { Extension } from "@tiptap/core";
import { type OnWikiLinkClick, WikiLinkNode } from "./wikilink-node";
import { type RenderSuggestionFunction, WikiLinkSuggestion } from "./wikilink-suggestion";

export interface WikiLinkExtensionOptions {
  onWikiLinkClick?: OnWikiLinkClick;
  renderSuggestionFunction: RenderSuggestionFunction;
}

export const WikiLinkExtension = Extension.create<WikiLinkExtensionOptions>({
  name: "wikiLinkExtension",
  addExtensions() {
    const extensions = [];
    extensions.push(
      WikiLinkSuggestion.configure({
        renderSuggestionFunction: this.options.renderSuggestionFunction,
      }),
    );
    extensions.push(WikiLinkNode.configure({ onWikiLinkClick: this.options.onWikiLinkClick }));

    return extensions;
  },
});

export { WikiLinkNode, WikiLinkSuggestion };
