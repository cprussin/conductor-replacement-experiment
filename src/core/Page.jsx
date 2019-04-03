// @flow

import React from 'react';

const Page = ({ title, body }) => (
    <html>
      <head>
        <title>{title}</title>
      </head>
      <body dangerouslySetInnerHTML={{ __html: body }} />
    </html>
);

export default Page;
