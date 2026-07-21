/** Shared timing and narration source for the launch composition and ElevenLabs render. */
export const launchStory = [
  {
    id: "opening",
    from: 0,
    to: 150,
    eyebrow: "CRADLE",
    title: "Your site does not need another chat bubble.",
    narration: "Your site does not need another chat bubble.",
  },
  {
    id: "connect",
    from: 150,
    to: 390,
    eyebrow: "01 / START WITH THE SITE",
    title: "Give Cradle a URL. It reads the parts of your product worth carrying forward.",
    narration: "Start with the site. Cradle gathers the public pages, then lets you decide what becomes part of the project.",
  },
  {
    id: "shape",
    from: 390,
    to: 660,
    eyebrow: "02 / GIVE IT A CHARACTER",
    title: "Choose a character. See it move before it ever reaches your visitors.",
    narration: "Choose the character people will meet. It has motion, states, and a home on the page, without being boxed into another support widget.",
  },
  {
    id: "install",
    from: 660,
    to: 960,
    eyebrow: "03 / MAKE IT YOURS",
    title: "One install. Your own logic behind it.",
    narration: "Install the web component. Then connect it to the product experience you already have, or build a new one around it.",
  },
  {
    id: "closing",
    from: 960,
    to: 1260,
    eyebrow: "OPEN SOURCE CHARACTER INFRASTRUCTURE",
    title: "Cradle gives your product a character. You decide what it becomes.",
    narration: "Cradle gives your product a character. You decide what it becomes.",
  },
] as const;

export const narrationText = launchStory.map((scene) => scene.narration).join(" ");
