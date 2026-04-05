import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

function readDebuggerHost() {
  const eg = Constants.expoGoConfig;
  if (eg && typeof eg.debuggerHost === 'string') return eg.debuggerHost;
  const m = Constants.manifest;
  if (m && typeof m === 'object' && typeof m.debuggerHost === 'string') return m.debuggerHost;
  const m2 = Constants.manifest2;
  const extra = m2?.extra?.expoGo;
  if (extra && typeof extra.debuggerHost === 'string') return extra.debuggerHost;
  return null;
}

/**
 * Fixed strip on every screen in __DEV__ (Expo Go). If you do not see this, the phone is not
 * running this bundle. Tag comes from app.json expo.extra.devBuildTag — change it to verify updates.
 */
export function GlobalDevBanner() {
  const insets = useSafeAreaInsets();

  if (!__DEV__) return null;

  const tag = Constants.expoConfig?.extra?.devBuildTag ?? '—';
  const host = readDebuggerHost();

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { paddingTop: insets.top }]}
      collapsable={false}
    >
      <View style={styles.strip} collapsable={false}>
        <Text style={styles.lineBold}>
          DEV · tag {tag} · Expo Go must show this strip
        </Text>
        <Text style={styles.line} numberOfLines={2}>
          Metro: {host ?? '—'} · Reload: shake phone → Reload · PC: npm run start:tunnel if LAN fails
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 99999,
    elevation: 99999,
    alignItems: 'stretch',
  },
  strip: {
    marginHorizontal: 6,
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#fbbf24',
    borderWidth: 2,
    borderColor: '#b45309',
  },
  lineBold: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    fontSize: 12,
    color: '#422006',
    marginBottom: 4,
  },
  line: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    lineHeight: 14,
    color: '#713f12',
  },
});

export default GlobalDevBanner;
