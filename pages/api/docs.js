import { swaggerSpec, swaggerUi } from '../../lib/swagger';

// This will serve the Swagger UI using the assets from the public folder
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>API Documentation</title>
          <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css" />
          <script src="/swagger-ui/swagger-ui-bundle.js"></script>
          <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script>
            const ui = SwaggerUIBundle({
              url: '/api/docs.json',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout"
            });
          </script>
        </body>
      </html>
    `);
  }
  res.status(405).json({ message: 'Method not allowed' });
}
