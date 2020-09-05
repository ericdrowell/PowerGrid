export enum Rating {
  Bad = 'bad',
  Neutral = 'neutral',
  Good = 'good',
}

export type DemoCellViewModel = {
  value: string;
};

export type DemoRatingCellViewModel = DemoCellViewModel & {
  rating: Rating;
};
