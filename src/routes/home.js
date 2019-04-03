// @flow

import renderReact from '../core/routeBuilders/renderReact';
import withData from '../core/routeBuilders/withData';
import title from '../models/title';
import Home from '../components/Home.jsx';

export default withData({
    data: {
        title
    },
    onSuccess: data =>
        renderReact({
            title: 'Homepage',
            component: Home,
            props: {
                name: data.title.person
            }
        })
});
