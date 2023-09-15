import {Group, Stack} from '@mantine/core';
import {DatePicker, TimeInput} from '@mantine/dates';
import {useTranslation} from 'next-i18next';
import {useRouter} from 'next/router';
import {FunctionComponent} from 'react';
import dayjs from '../../utils/dayjs';
import {getFirstDayOfWeek} from '../../utils/utilFunctions';

const calculateDateTime = (date: Date, time: Date): Date => {
  const hour = dayjs(time).hour();
  const minute = dayjs(time).minute();
  const dateAndTime = dayjs(date)
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0);

  return dateAndTime.toDate();
};

interface DateInfo {
  value: Date;
  onChange: (newDate: Date) => void;
  error: string | undefined;
}

export const IntervalPicker: FunctionComponent<{
  startInfo: DateInfo;
  endInfo: DateInfo;
}> = ({
        startInfo: {value: start, onChange: onStartChange, error: startError},
        endInfo: {value: end, onChange: onEndChange, error: endError},
      }) => {
  const {t} = useTranslation('common');
  const {locale = 'en'} = useRouter();

  return (
    <Stack>
      <Group spacing="xs">
        <DatePicker
          locale={locale}
          withAsterisk
          sx={{flexGrow: 1, marginBottom: 'auto'}}
          label={t('intervalPicker.start')}
          value={start}
          onChange={(newStartDate) => {
            if (newStartDate) {
              onStartChange(calculateDateTime(newStartDate, start));
              onEndChange(calculateDateTime(newStartDate, end));
            }
          }}
          clearable={false}
          minDate={new Date()}
          firstDayOfWeek={getFirstDayOfWeek(locale)}
          error={Boolean(startError)}
        />
        <TimeInput
          withAsterisk
          sx={{marginBottom: 'auto'}}
          label={t('intervalPicker.time')}
          value={start}
          onChange={(newStartTime) => onStartChange(calculateDateTime(start, newStartTime))}
          error={startError}
        />
      </Group>
      <Group spacing="xs">
        <DatePicker
          locale={locale}
          withAsterisk
          sx={{flexGrow: 1, marginBottom: 'auto'}}
          label={t('intervalPicker.end')}
          value={end}
          onChange={(newEndDate) => {
            if (newEndDate) {
              onEndChange(calculateDateTime(newEndDate, end));
            }
          }}
          clearable={false}
          minDate={start}
          firstDayOfWeek={getFirstDayOfWeek(locale)}
          error={Boolean(endError)}
        />
        <TimeInput
          withAsterisk
          sx={{marginBottom: 'auto'}}
          label={t('intervalPicker.time')}
          value={end}
          onChange={(newEndTime) => onEndChange(calculateDateTime(end, newEndTime))}
          error={endError}
        />
      </Group>
    </Stack>
  );
};
