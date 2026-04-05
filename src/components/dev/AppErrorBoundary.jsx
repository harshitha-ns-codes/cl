import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';

/**
 * Catches render errors so Expo Go shows the real message instead of a generic failure.
 */
export class AppErrorBoundary extends React.Component {
  state = { err: null };

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    if (__DEV__) {
      console.error('[AppErrorBoundary]', err?.message, info?.componentStack);
    }
  }

  render() {
    const { err } = this.state;
    if (err) {
      const msg = err?.message != null ? String(err.message) : String(err);
      return (
        <View style={styles.wrap} accessibilityRole="alert">
          <Text style={styles.title}>App error</Text>
          <Text style={styles.hint}>
            Copy this text from Metro / device logs if you need help. Reload after fixing code.
          </Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            <Text style={styles.msg} selectable>
              {msg}
            </Text>
            {__DEV__ && err?.stack ? (
              <Text style={styles.stack} selectable>
                {err.stack}
              </Text>
            ) : null}
          </ScrollView>
          <Pressable
            onPress={() => this.setState({ err: null })}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#fff7ed',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#9a3412',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 12,
    lineHeight: 20,
  },
  scroll: { flex: 1, maxHeight: '70%' },
  scrollInner: { paddingBottom: 16 },
  msg: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#1c1917',
    marginBottom: 12,
  },
  stack: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#57534e',
  },
  btn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default AppErrorBoundary;
