const fs = require('fs');
const files = [
  'c:/Users/nyart/Lab-Inventory/resources/js/Pages/Inventory.jsx',
  'c:/Users/nyart/Lab-Inventory/resources/js/Pages/Transactions.jsx',
  'c:/Users/nyart/Lab-Inventory/resources/js/Pages/Maintenance.jsx',
  'c:/Users/nyart/Lab-Inventory/resources/js/Pages/Users.jsx'
];
files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/max-w-\[1100px\]/g, 'max-w-full');
    content = content.replace(/max-w-\[1200px\]/g, 'max-w-full');
    content = content.replace(/px-6 py-4/g, 'px-4 py-4');
    content = content.replace(/px-6 py-3\.5/g, 'px-4 py-3.5');
    // Also fix Incident Date and Action Taken for better fit
    content = content.replace(/Incident Date/g, 'Date');
    content = content.replace(/Action Taken/g, 'Action');
    fs.writeFileSync(file, content);
  }
});
console.log('Done replacing padding and width.');
