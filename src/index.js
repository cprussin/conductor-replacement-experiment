// @flow

import pino from 'pino';
import server from './core/server';

const main = (): void =>
    server({
        logger: pino()
    }).boot();

main();
