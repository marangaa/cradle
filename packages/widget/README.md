# @maranga/cradle

`@maranga/cradle` registers the framework-free `<cradle-character>` custom element.

## Install

```sh
pnpm add @maranga/cradle
```

```ts
import "@maranga/cradle";
```

Or load the script build directly:

```html
<script src="https://unpkg.com/@maranga/cradle@0.1.0/widget.js"></script>
<cradle-character site-id="PROJECT_ID" api-base="https://runtime.example"></cradle-character>
```

The element loads its character manifest from `api-base`, renders in Shadow DOM, and emits `cradle:ready`, `cradle:open`, `cradle:close`, `cradle:action`, and `cradle:state` browser events. The host application owns conversational UI, identity, persistence, and actions.

Use `placement="inline"` to render at the element's DOM position. Omit it for a draggable floating character.

See the [Cradle repository](https://github.com/marangaa/cradle) for the Runtime, Studio, and self-deployment guide.
