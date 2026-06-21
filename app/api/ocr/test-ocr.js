const fs = require('fs');
fetch('http://localhost:3000/api/ocr', {
  method: 'POST',
  body: new FormData()
}).then(res => res.json()).then(console.log).catch(console.error);
