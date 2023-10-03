import {ActionIcon, Group, TextInput} from '@mantine/core';
import {useTranslation} from 'next-i18next';
import {FunctionComponent} from 'react';
import {PencilPlus, X} from 'tabler-icons-react';
import RichTextEditor from './RichTextEditor';
import {UseFormReturnType} from '@mantine/form';
import {openModal} from '@mantine/modals';

export const RichTextField: FunctionComponent<{
  label?: string;
  placeholder?: string;
  maxLength?: number;
  formInputProps: ReturnType<UseFormReturnType<unknown>['getInputProps']>;
}> = ({label, placeholder, formInputProps, maxLength = 1024}) => {
  const {t} = useTranslation('common');

  const value = formInputProps.value as string | undefined;
  const onChange = formInputProps.onChange as (newValue: string) => void;

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      sx={{flexGrow: 1}}
      {...formInputProps}
      readOnly={value?.includes('</')}
      maxLength={maxLength}
      rightSectionWidth={74}
      rightSection={(
        <Group spacing={4}>
          <ActionIcon
            title={t('button.reset')}
            disabled={!value}
            variant="transparent"
            onClick={() => onChange('')}
          >
            <X/>
          </ActionIcon>
          <ActionIcon
            title={t('button.richText')}
            variant="transparent"
            onClick={() => openModal({
              title: label ? t('modal.edit', {propertyName: label}) : t('modal.comment.edit'),
              children: (
                <RichTextEditor
                  placeholder={placeholder}
                  value={value}
                  onChange={onChange}
                />
              ),
              size: 'xl',
            })}
          >
            <PencilPlus/>
          </ActionIcon>
        </Group>
      )}
    />
  );
};
