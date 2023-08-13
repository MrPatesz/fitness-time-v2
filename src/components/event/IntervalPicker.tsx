import {Group} from '@mantine/core';
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

export const IntervalPicker: FunctionComponent<{
  start: Date;
  end: Date;
  onChange: (newStart: Date, newEnd: Date) => void;
  startError: string | undefined;
  endError: string | undefined;
}> = ({start, end, onChange, startError, endError}) => {
  const {t} = useTranslation('common');
  const {locale = 'en'} = useRouter();

  return (
    <Group spacing="xs">
      <DatePicker
        locale={locale}
        withAsterisk
        sx={{width: '229px', marginBottom: 'auto'}}
        label={t('intervalPicker.on')}
        value={start}
        onChange={(newDate) => {
          if (newDate) {
            onChange(
              calculateDateTime(newDate, start),
              calculateDateTime(newDate, end)
            );
          }
        }}
        clearable={false}
        minDate={new Date()}
        firstDayOfWeek={getFirstDayOfWeek(locale)}
        error={Boolean(startError || endError)}
      />
      <TimeInput
        withAsterisk
        sx={{marginBottom: 'auto'}}
        label={t('intervalPicker.start.label')}
        value={start}
        onChange={(event) => onChange(calculateDateTime(start, event), end)}
        error={startError}
      />
      <TimeInput
        withAsterisk
        sx={{marginBottom: 'auto'}}
        label={t('intervalPicker.end.label')}
        value={end}
        onChange={(event) => onChange(start, calculateDateTime(end, event))}
        error={endError}
      />
    </Group>
  );
};
