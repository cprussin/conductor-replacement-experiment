import uuid from 'uuid';
import urls from '../../config/urls';

const serviceRequest = async (options, req, res) => {
    const url = urls.find(
        ({ path, methods }) => path === req.url && methods.includes(req.method)
    );
    if (url) {
        options.logger.info({ path: url.path }, `Matched route`);
        await url.routeDefinition(options, req, res);
    } else {
        options.logger.info(
            { url: req.url, method: req.method },
            `No route matched`
        );
        res.statusCode = 404;
        res.end('Not found');
    }
};

const requestHandler = options => (req, res) => {
    const reqId = uuid();
    serviceRequest(
        {
            reqId,
            logger: options.logger.child({ reqId })
        },
        req,
        res
    ).catch(err => options.logger.error(err));
};

export default requestHandler;
