import type { Handler, NextFunction, Request, Response } from "express";
import type { Vote } from "../api";

export type ListenerFunction = (vote: Vote, req: Request, res: Response, next: NextFunction) => any;

export function upvoteListener(secret: string, listener: ListenerFunction): Handler {
    return async (req, res, next) => {
        if (req.header("Authorization") !== secret) return res.sendStatus(401);

        try {
            req.body.time = new Date();
            await listener(req.body, req, res, next);

            if (!res.headersSent) res.sendStatus(200);
        } catch (e: any) {
            console.error(e);

            res.sendStatus(500);
        }

        next();
    };
}
