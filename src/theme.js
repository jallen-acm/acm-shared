// American Cedar & Millwork brand — sampled from the company logo.
// This is the ONE place brand values live. The customer app, customer
// website, and the employee CRM all import from here, so a change lands
// everywhere at once. Web CSS variables for the same values are in theme.css.

export const COLORS = {
  navy: '#212b67', // primary brand blue (logo capital / "American")
  navyPressed: '#1a2252',
  red: '#CE2029', // brand red (logo flutes / "CEDAR & MILLWORK")
  background: '#F5F6FA', // light cool gray page background
  card: '#FFFFFF',
  border: '#E1E4EF',
  text: '#1D2452', // dark navy body text
  textMuted: '#7A7F99',
  selectedBg: '#EEF0F9', // light navy tint for selected rows
  onNavy: '#FFFFFF',
  onNavyMuted: '#C7CDEA',
  demoBannerBg: '#FFF7E0',
  demoBannerBorder: '#E6D9A8',
  demoBannerText: '#7A6520',
};

// Font stacks per platform. The logo wordmark is a classic serif; Georgia
// (iOS / web) and Noto Serif (Android "serif") are the closest built-in
// matches without bundling a font file. Headings use the serif; body text
// stays on the system sans. React Native callers pick with Platform.select;
// web uses the `web` entry (also baked into theme.css).
export const FONT_FAMILIES = {
  serif: {
    ios: 'Georgia',
    android: 'serif',
    web: "Georgia, 'Times New Roman', serif",
    default: 'serif',
  },
  body: {
    ios: undefined, // system font
    android: undefined,
    web: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    default: undefined,
  },
  mono: {
    ios: 'Menlo',
    android: 'monospace',
    web: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    default: 'monospace',
  },
};
