import type { ChatRequest, RuntimeAdapter, RuntimeContext } from "@cradle/core";

/**
 * Provider-independent fallback runtime. Production deployments replace this
 * with an OpenAI-backed adapter while preserving the public Cradle contract.
 */
export class GroundedRuntime implements RuntimeAdapter {
  async *streamTurn(input: ChatRequest, context: RuntimeContext): AsyncIterable<string> {
    const query = input.message.toLowerCase();
    const matchingPage = context.knowledge.pages.find((page) => page.markdown.toLowerCase().includes(query));
    const source = matchingPage ?? context.knowledge.pages[0];
    const answer = source
      ? `I found this in ${source.title || source.url}: ${source.markdown.slice(0, 420)}`
      : "I am still learning about this company. Please try again once its knowledge has been reviewed.";
    yield answer;
  }
}
