// @flow

export default {
    dependencies: {},
    data: async options => {
        options.logger.info('Fetching geo model');
        return { locale: 'us' };
    }
};
