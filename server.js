// Plik startowy aplikacji dla hostingu Node.js (DirectAdmin / Passenger).
// Uruchamia Next.js w trybie produkcyjnym i nasłuchuje na porcie z PORT.
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOST || "0.0.0.0";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Bryziówka gotowa na http://${hostname}:${port}`);
  });
});
