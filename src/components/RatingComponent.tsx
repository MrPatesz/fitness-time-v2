import {FunctionComponent} from 'react';
import {Group, Rating, Text, useMantineTheme} from "@mantine/core";

export const RatingComponent: FunctionComponent<{
  canRate?: boolean;
  previousRating?: { id: number, user: {}, userId: string, eventId: number, stars: number } | null | undefined;
  averageRating: { count: number, averageStars: number | null } | undefined;
  onChange?: (newRating: number) => void;
}> = ({canRate = false, averageRating, previousRating, onChange}) => {
  const theme = useMantineTheme();

  return (
    <Group align="center" spacing="xs">
      {canRate ? (
        <Rating
          fractions={2}
          color={theme.primaryColor}
          value={previousRating?.stars ?? 0}
          onChange={onChange}
        />
      ) : (
        <Rating
          readOnly
          fractions={5}
          color={theme.primaryColor}
          value={averageRating?.averageStars ?? 0}
        />
      )}
      <Group spacing={4}>
        <Text>
          {averageRating?.averageStars?.toFixed(2) ?? 0}
        </Text>
        <Text color="dimmed">
          ({averageRating?.count})
        </Text>
      </Group>
    </Group>
  );
};
