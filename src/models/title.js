// @flow

import userInfo from './userInfo';
import geo from './geo';

export default {
    dependencies: { userInfo, geo },
    data: async (options, data) => {
        options.logger.info('Fetching title model');
        return { person: `Mr. ${data.userInfo.name} from ${data.geo.locale}` };
    }
};
