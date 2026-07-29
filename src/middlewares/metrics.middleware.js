import { httpRequestCounter, httpRequestDuration } from "../utils/metrics.js";

const scrapeMetrics = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = (Date.now() - start) / 1000;

        httpRequestCounter.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode,
        });

        httpRequestDuration.observe(
            {
                method: req.method,
                route: req.route?.path || req.path,
                status: res.statusCode,
            },
            duration
        );
    });

    next();
};

export default scrapeMetrics;