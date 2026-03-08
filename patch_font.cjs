const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf8');

// Replace body font-family with the actual theme font
css = css.replace(
  /body\s*{[^}]+font-family:[^}]+}/m,
  `body {
  @apply m-0;
  overflow-x: hidden;
  min-height: 100vh;
  width: 100vw;
  font-family: 'DM Sans', sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
);

// We should also set up utility classes for font-display and font-serif if they want them
// Let's add them at the bottom
css += `
@utility font-display {
  font-family: 'Bebas Neue', display;
}

@utility font-serif {
  font-family: 'Cormorant Garamond', serif;
}
`;

fs.writeFileSync('src/styles.css', css);
