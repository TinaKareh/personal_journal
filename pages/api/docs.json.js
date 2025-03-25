// pages/api/docs.json.js

import { swaggerSpec } from '../../lib/swagger'; // Import the swaggerSpec

export default function handler(req, res) {
  res.status(200).json(swaggerSpec); // Return the Swagger JSON specification
}
