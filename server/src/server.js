import "dotenv/config";
import { createApp } from "./app.js";
import { createDatabase } from "./database.js";

const port = Number(process.env.PORT || 3000);
const db = createDatabase();
const app = createApp(db);

app.listen(port, () => {
  console.log(`Inventory API ready at http://localhost:${port}`);
});
