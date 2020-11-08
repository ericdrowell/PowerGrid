import { CellViewModel } from "../src/types";

export enum Rating {
  Bad = 'bad',
  Neutral = 'neutral',
  Good = 'good',
}

export type DemoRatingCellViewModel = CellViewModel & {
  rating: Rating;
};
