// @flow

import home from '../src/routes/home';
import redirect from '../src/core/routeBuilders/redirect';

const urls = [
    {
        routeDefinition: home,
        path: '/',
        methods: ['GET']
    },
    {
        routeDefinition: redirect.temporary('/'),
        path: '/foo',
        methods: ['GET']
    }
];

export default urls;
