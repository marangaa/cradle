# Changelog

## 0.2.0 (unreleased)

- Widget now runs on the AI SDK chat core (`AbstractChat`), with verified users, a visible AI disclosure, and label-based spotlight.
- Stops the in-flight chat request when the element is removed (`disconnectedCallback`).
- A failure while handling a stream data part (emote, spotlight) is caught and logged instead of aborting the stream.
- Visitors see a fixed friendly error message; the real error is logged to the console only.
- Pins `ai` to `~7.0.31`: `AbstractChat` is exported and typed but not covered in the prose docs, so minor upgrades need review.

## 0.1.0

- Initial open-source Cradle infrastructure: Studio, runtime, widget, bounded Firecrawl ingestion, and Qualra bridge.
