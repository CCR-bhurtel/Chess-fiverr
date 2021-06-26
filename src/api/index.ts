import { Router } from "express";
import user from "../modules/users/routes";

export default () => {
    const app = Router();
    user(app);
    return app;
};
