// @flow

import http from 'http';
import port from '../../config/port';
import requestHandler from './requestHandler';

const server = options => {
    const serverInstance = http.createServer(requestHandler(options));

    return {
        boot: () =>
            serverInstance.listen(port, () =>
                options.logger.info({ port }, `Server up!`)
            )
    };
};

export default server;
