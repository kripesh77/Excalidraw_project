import "dotenv/config";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

async function init() {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
  });
}

init();
