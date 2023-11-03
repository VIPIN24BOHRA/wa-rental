import type { MachineConfig } from './machine.types';

export const gaurdsFactory = (_machineConfig: MachineConfig): any => {
  return {
    invalidLocationMsg: () => false,
    isInvalidLocationSelected: () => false,
  };
};
