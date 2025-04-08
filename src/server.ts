import { server } from "./app/socketOi";
import config from "./app/config";
import mongoose from "mongoose";

// let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server.listen(config.port, () => {
      console.log(` app listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
