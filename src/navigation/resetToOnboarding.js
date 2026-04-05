import { CommonActions } from '@react-navigation/native';

/**
 * Reset root stack to Onboarding (from nested tab / stack screens).
 */
export function resetToOnboarding(navigation) {
  let target = navigation;
  let parent = navigation.getParent?.();
  while (parent) {
    target = parent;
    parent = parent.getParent?.();
  }
  target.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    })
  );
}
