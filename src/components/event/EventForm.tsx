import {Button, Group, Stack, TextInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useTranslation} from 'next-i18next';
import {FunctionComponent} from 'react';
import {BasicEventType, CreateEventType} from '../../models/Event';
import {LocationPicker} from '../location/LocationPicker';
import {RichTextField} from '../rich-text/RichTextField';
import {CreateLocationType, LocationType} from '../../models/Location';
import {getFormError, getFormLocationOnChange, getFormLocationValue} from '../../utils/mantineFormUtils';
import {OverlayLoader} from '../OverlayLoader';
import dayjs from '../../utils/dayjs';
import {NullableNumberInput} from './NullableNumberInput';
import {DateTimePicker} from '@mantine/dates';

export const EventForm: FunctionComponent<{
  originalEvent: CreateEventType | BasicEventType;
  onSubmit: (event: CreateEventType | BasicEventType) => void;
  loading: boolean;
}> = ({originalEvent, onSubmit, loading}) => {
  const {t} = useTranslation('common');

  const getStartError = (start: Date) => start > new Date() ? null : t('eventForm.start.error');
  const getEndError = (end: Date, start: Date) =>
    (
      end > new Date() &&
      end > start &&
      dayjs(start).add(2, 'weeks').toDate() > end
    ) ?
      null
      : t('eventForm.end.error');

  const form = useForm<CreateEventType | BasicEventType>({
    initialValues: originalEvent,
    validateInputOnChange: true,
    initialErrors: {
      start: getStartError(originalEvent.start),
      end: getEndError(originalEvent.end, originalEvent.start),
    },
    validate: {
      name: (value) => value.trim() ? null : t('eventForm.name.error'),
      location: (value: CreateLocationType | LocationType) => Boolean(value?.address) ? null : t('eventForm.location.error'),
      start: getStartError,
      end: (value, event) => getEndError(value, event.start),
    },
  });

  return (
    <OverlayLoader loading={loading}>
      <form onSubmit={form.onSubmit((data) => onSubmit(data))}>
        <Stack>
          <TextInput
            withAsterisk
            data-autofocus
            maxLength={64}
            label={t('common.name')}
            placeholder={t('eventForm.name.placeholder')}
            {...form.getInputProps('name')}
          />
          <DateTimePicker
            withAsterisk
            clearable={false}
            valueFormat="MMMM DD, YYYY HH:mm"
            label={t('intervalPicker.start')}
            minDate={new Date()}
            {...form.getInputProps('start')}
          />
          <DateTimePicker
            withAsterisk
            clearable={false}
            valueFormat="MMMM DD, YYYY HH:mm"
            label={t('intervalPicker.end')}
            minDate={form.values.start}
            maxDate={dayjs(form.values.start).add(2, 'weeks').toDate()}
            {...form.getInputProps('end')}
          />
          <LocationPicker
            required={true}
            label={t('locationPicker.place')}
            placeholder={t('eventForm.location.placeholder')}
            location={getFormLocationValue(form)}
            setLocation={getFormLocationOnChange(form)}
            error={getFormError(form, 'location')}
          />
          <RichTextField
            label={t('eventForm.description.label')}
            placeholder={t('eventForm.description.placeholder')}
            formInputProps={form.getInputProps('description')}
          />
          <NullableNumberInput
            min={1}
            label={t('eventForm.price.label')}
            placeholder={t('eventForm.price.placeholder')}
            rightSection="€"
            {...form.getInputProps('price')}
          />
          <NullableNumberInput
            min={2}
            label={t('eventForm.limit.label')}
            placeholder={t('eventForm.limit.placeholder')}
            {...form.getInputProps('limit')}
          />
          <Group position="right">
            <Button
              variant="default"
              onClick={() => form.reset()}
              disabled={!form.isDirty()}
            >
              {t('button.reset')}
            </Button>
            <Button type="submit" disabled={!form.isValid() || !form.isDirty()}>
              {t('button.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </OverlayLoader>
  );
};
