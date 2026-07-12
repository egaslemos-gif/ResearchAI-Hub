import { WorkspaceStatePhase } from '../core/types';

export class WorkspaceState {
  constructor(
    public readonly phase: WorkspaceStatePhase
  ) {}
}
