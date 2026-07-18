# Qualra Cloud Adapter

Cradle is portable website-representative infrastructure. Qualra Cloud operates the same Cradle contract; it does not replace the open-source widget, installation, visitor, or asset lifecycle.

## Boundary

Cradle owns public-site onboarding, reviewed knowledge, identity assets, browser visitor IDs, the widget, and the streaming runtime. Qualra owns organizations, customers, research campaigns, Collins, long-term relationship memory, and analysis.

The browser only calls Cradle Runtime. It never calls Qualra directly and never receives Qualra credentials.

## Default managed behavior

When a Cloud installation completes a turn, Cradle Runtime sends a signed, idempotent `cradle.conversation.completed` event to Qualra. The event contains the Cradle installation, visitor, conversation, origin, reviewed-knowledge version, identity revision, and normalized transcript.

Qualra resolves the Cloud installation to its organization and creates or updates an organization-scoped customer using the Cradle visitor as an external identity. Qualra then runs its existing memory and analysis workflows. A repeated event ID must not create a second customer turn or synthesis.

## Optional campaign mode

Collins is a qualitative-research interviewer, not the default Cradle representative. A Qualra organization may explicitly attach a Cradle installation to a Qualra campaign. Only in that mode does a private Cradle-to-Qualra adapter call `streamCollinsTurn` for a live turn.

The adapter calls `streamCollinsTurn`, not `src/chat/bot.ts`. The bot owns Chat SDK transport state for Qualra's existing web and channel adapters; Cradle already owns browser transport, visitor identity, and persistence.

## Verification contract

Cloud event requests include an event ID, ISO timestamp, and HMAC signature over the raw body. Qualra rejects stale timestamps, invalid signatures, unknown installations, and duplicate event IDs. The shared secret is only present in Cradle Runtime and Qualra's server environment.

## Rollout order

1. Add a Qualra-owned installation mapping and idempotent event ledger.
2. Implement signed post-turn ingestion from Cradle Cloud.
3. Map Cradle visitors to Qualra customers and invoke existing analysis after completed turns.
4. Add the explicit campaign-mode Collins adapter.
5. Add hosted account ownership and billing around the mapping; keep self-hosted Cradle owner-key access unchanged.
