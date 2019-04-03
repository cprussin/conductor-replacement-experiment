// @flow

const redirect = code => target => async (options, req, res) => {
    options.logger.info({ target }, `Servicing redirect`);
    res.statusCode = code;
    res.setHeader('location', target);
    res.end();
};

export default {
    permanent: redirect(301),
    temporary: redirect(302)
};
