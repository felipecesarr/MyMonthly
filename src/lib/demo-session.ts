export const DEMO_USER_ID = 'demo-user';

let active = false;

export function isDemoSessionActive(): boolean {
  return __DEV__ && active;
}

export function setDemoSessionActive(nextActive: boolean): void {
  active = __DEV__ && nextActive;
}
