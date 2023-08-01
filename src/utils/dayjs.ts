import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/hu';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('hu');
dayjs.locale('en');

dayjs.extend(relativeTime);

export default dayjs;
