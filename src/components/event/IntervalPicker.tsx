import {Group} from "@mantine/core";
import {DatePicker, TimeInput} from "@mantine/dates";
import dayjs from "dayjs";
import {FunctionComponent} from "react";

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
  return (
    <Group spacing="xs">
      <DatePicker
        withAsterisk
        sx={{width: "229px", marginBottom: "auto"}}
        label="On"
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
        firstDayOfWeek="sunday"
        error={(startError || endError) ? " " : undefined}
      />
      <TimeInput
        withAsterisk
        sx={{marginBottom: "auto"}}
        label="Start"
        value={start}
        onChange={(event) => onChange(calculateDateTime(start, event), end)}
        error={startError}
      />
      <TimeInput
        withAsterisk
        sx={{marginBottom: "auto"}}
        label="End"
        value={end}
        onChange={(event) => onChange(start, calculateDateTime(end, event))}
        error={endError}
      />
    </Group>
  );
};
