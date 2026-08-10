const fs = require('fs');
const filePath = 'd:\\front-end\\js\\mensajero.js';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split(/\r?\n/);

const newCode = `  // URL de la API (Variable de entorno para desarrollo)
  const API_URL = "http://localhost:8080/api/v1/route/d1000001-0001-4000-8000-000000000001/orders";
  // URL de la API (Comentada para producción)
  // const API_URL = "https://api.produccion.com/api/v1/route/d1000001-0001-4000-8000-000000000001/orders";

  async function fetchShipments() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching shipments:", error);
      return [];
    }
  }`;

const startIndex = 19;
const endIndex = 1784;

if (lines[startIndex].includes('API mock response') && lines[endIndex].includes('}')) {
    lines.splice(startIndex, endIndex - startIndex + 1, newCode);
    const hasCr = content.includes('\r\n');
    fs.writeFileSync(filePath, lines.join(hasCr ? '\r\n' : '\n'));
    console.log('Success');
} else {
    console.log('Error: bounds check failed');
    console.log('Start:', lines[startIndex]);
    console.log('End:', lines[endIndex]);
}
