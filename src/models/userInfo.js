// @flow

import geo from './geo';

export default {
    dependencies: { geo },
    data: async (options, data) => {
        options.logger.info('Fetching userInfo model');
        if (data.geo.locale === 'us') {
            return { name: 'Connor' };
        } else {
            return { name: 'El Connoro' };
        }
    }
};
