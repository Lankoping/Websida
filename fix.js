import fs from 'fs';
const path = 'src/server/functions/tickets.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.split('\\`').join('`').split('\\$').join('$');
fs.writeFileSync(path, content);
