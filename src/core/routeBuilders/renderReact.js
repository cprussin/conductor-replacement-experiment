// @flow

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Page from '../Page.jsx';

const renderReact = ({ component, title, props }) => async (
    options,
    req,
    res
) => {
    options.logger.info(
        `Rendering react from root component: ${component.name}`
    );

    const body = ReactDOMServer.renderToString(
        React.createElement(component, props)
    );
    const page = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Page, { title, body })
    );

    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 301;
    res.end('<!doctype html>' + page);
};

export default renderReact;
