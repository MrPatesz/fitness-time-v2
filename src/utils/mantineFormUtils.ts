import {UseFormReturnType} from '@mantine/form';
import {CreateLocationType} from '../models/Location';

export const getFormStringValue = (form: UseFormReturnType<any>, path: string) => (form.getInputProps(path).value as string | undefined) ?? '';

export const getFormStringOnChange = (form: UseFormReturnType<any>, path: string) => (form.getInputProps(path).onChange as (newValue: string) => void);

export const getFormDateValue = (form: UseFormReturnType<any>, path: string) => {
  return form.getInputProps(path).value as Date;
};

export const getFormDateOnChange = (form: UseFormReturnType<any>, path: string) => (form.getInputProps(path).onChange as (newValue: Date) => void);

export const getFormError = (form: UseFormReturnType<any>, path: string) => (form.getInputProps(path).error as string | undefined);

export const getFormLocationValue = (form: UseFormReturnType<any>) => (form.getInputProps('location').value as CreateLocationType | null);

export const getFormLocationOnChange = (form: UseFormReturnType<any>) => (form.getInputProps('location').onChange as (newValue: CreateLocationType | null) => void);
