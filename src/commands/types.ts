import { AI } from '@/md/ai/ai';

export enum Command {
  MtrReview = 'mtr-review',
  MtrApplyReview = 'mtr-apply-review',
  MtrTranslate = 'mtr-translate',
}

export type AiBaseCommand = {
  aiInstance: AI;
};
