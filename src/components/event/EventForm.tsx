import {Button, Group, NumberInput, Stack, TextInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useTranslation} from 'next-i18next';
import {FunctionComponent} from 'react';
import {BasicEventType, CreateEventType} from '../../models/Event';
import {LocationPicker} from '../location/LocationPicker';
import {RichTextField} from '../rich-text/RichTextField';
import {IntervalPicker} from './IntervalPicker';
import {CreateLocationType, LocationType} from '../../models/Location';
import {
  getFormDateOnChange,
  getFormDateValue,
  getFormError,
  getFormLocationOnChange,
  getFormLocationValue
} from '../../utils/mantineFormUtils';
import {OverlayLoader} from '../OverlayLoader';

export const EventForm: FunctionComponent<{
  originalEvent: CreateEventType | BasicEventType;
  onSubmit: (event: CreateEventType | BasicEventType) => void;
  loading: boolean;
}> = ({originalEvent, onSubmit, loading}) => {
  const {t} = useTranslation('common');

  const getStartError = (start: Date) => start > new Date() ? null : t('eventForm.start.error');
  const getEndError = (end: Date, start: Date) => (end > new Date() && end > start) ? null : t('eventForm.end.error');

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
          <IntervalPicker
            start={getFormDateValue(form, 'start')}
            end={getFormDateValue(form, 'end')}
            onChange={(newStart, newEnd) => {
              const startOnChange = getFormDateOnChange(form, 'start');
              startOnChange(newStart);
              const endOnChange = getFormDateOnChange(form, 'end');
              endOnChange(newEnd);
            }}
            startError={getFormError(form, 'start')}
            endError={getFormError(form, 'end')}
          />
          <LocationPicker
            required={true}
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
          <NumberInput
            min={1}
            label={t('eventForm.price.label')}
            placeholder={t('eventForm.price.placeholder')}
            {...form.getInputProps('price')}
            parser={(value: string | undefined) => value?.replace(/\$\s?|(,*)/g, '')}
            formatter={(value: string | undefined) =>
              value && !Number.isNaN(parseFloat(value))
                ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : '$ '
            }
          />
          <NumberInput
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
