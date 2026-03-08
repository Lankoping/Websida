const fs = require('fs');
const css = fs.readFileSync('src/styles.css', 'utf8');

const updatedLight = `:root {
  --background: #100E0C;
  --foreground: #F0E8D8;
  --card: #141210;
  --card-foreground: #F0E8D8;
  --popover: #141210;
  --popover-foreground: #F0E8D8;
  --primary: #C04A2A;
  --primary-foreground: #100E0C;
  --secondary: #1A3045;
  --secondary-foreground: #F0E8D8;
  --muted: #1A1816;
  --muted-foreground: rgba(240, 232, 216, 0.5);
  --accent: #1A3045;
  --accent-foreground: #F0E8D8;
  --destructive: #7A2B1E;
  --destructive-foreground: #100E0C;
  --border: rgba(192, 74, 42, 0.2);
  --input: rgba(192, 74, 42, 0.2);
  --ring: rgba(192, 74, 42, 0.5);
  --radius: 0.125rem;
  
  --cs-bg: #100E0C;
  --cs-brick: #7A2B1E;
  --cs-rust: #C04A2A;
  --cs-rust-dim: rgba(192, 74, 42, 0.18);
  --cs-rust-faint: rgba(192, 74, 42, 0.07);
  --cs-river: #1A3045;
  --cs-river-glow: rgba(30, 70, 110, 0.22);
  --cs-cream: #F0E8D8;
  --cs-cream-dim: rgba(240, 232, 216, 0.5);
  --cs-cream-faint: rgba(240, 232, 216, 0.1);
}`;

const updatedDark = `.dark {
  --background: #100E0C;
  --foreground: #F0E8D8;
  --card: #141210;
  --card-foreground: #F0E8D8;
  --popover: #141210;
  --popover-foreground: #F0E8D8;
  --primary: #C04A2A;
  --primary-foreground: #100E0C;
  --secondary: #1A3045;
  --secondary-foreground: #F0E8D8;
  --muted: #1A1816;
  --muted-foreground: rgba(240, 232, 216, 0.5);
  --accent: #1A3045;
  --accent-foreground: #F0E8D8;
  --destructive: #7A2B1E;
  --destructive-foreground: #100E0C;
  --border: rgba(192, 74, 42, 0.2);
  --input: rgba(192, 74, 42, 0.2);
  --ring: rgba(192, 74, 42, 0.5);
}`;

const replaceRoot = css.replace(/:root\s*{[\s\S]*?--sidebar-ring:\s*[^;]+;\n}/, updatedLight);
const replaceDark = replaceRoot.replace(/\.dark\s*{[\s\S]*?--sidebar-ring:\s*[^;]+;\n}/, updatedDark);

fs.writeFileSync('src/styles.css', replaceDark);
