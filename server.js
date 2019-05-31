const express = require('express');
const path = require('path');
const server = express();
const serverBundle = require('./dist/vue-ssr-server-bundle.json');
const clientManifest = require('./dist/vue-ssr-client-manifest.json');
const { createBundleRenderer } = require('vue-server-renderer');

const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: require('fs').readFileSync('./src/index.template.html', 'utf-8'), // page template
  clientManifest // client build manifest
});

server.use('/dist', express.static(path.resolve(__dirname, './dist')));
server.use('/public', express.static(path.resolve(__dirname, './public')));
server.use('/manifest.json', express.static(path.resolve(__dirname, './manifest.json')));
server.use('/service-worker.js', express.static(path.resolve(__dirname, './dist/service-worker.js')));


server.get('*', (req, res) => {
  const context = { url: req.url };


  renderer.renderToString(context, (err, html) => {
    if (err) {
      if (err.code === 404) {
        res.status(404).end('Page not found')
      } else {
        res.status(500).end('Internal Server Error')
      }
    } else {
      res.send(html)
    }
  })

});

module.exports = server;