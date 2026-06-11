import { createDb } from "./db";
import { createApp } from "./app";

type Env = {
  DATABASE_URL: string;
};

export default {
  fetch(req: Request, env: Env) {
    const db = createDb(env.DATABASE_URL);
    return createApp(db).fetch(req, env);
  },
};
