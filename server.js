const express = require('express');
const next = require('next');

const port = process.env.PORT || 8080;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.all('*', (req, res) => handle(req, res));

    server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});

});
