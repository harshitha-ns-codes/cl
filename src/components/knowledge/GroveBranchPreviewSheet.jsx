import { View, Text, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { fonts } from '../../theme/typography';

const spring = { damping: 24, stiffness: 220, mass: 0.85 };

export function GroveBranchPreviewSheet({
  visible,
  node,
  onClose,
  onGenerateReading,
  onOpenImmersive,
  showImmersiveAction = true,
}) {
  const translateY = useSharedValue(420);
  const backdrop = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, spring);
      backdrop.value = withTiming(1, { duration: 280 });
    } else {
      translateY.value = withSpring(420, { ...spring, stiffness: 280 });
      backdrop.value = withTiming(0, { duration: 200 });
    }
  }, [visible, translateY, backdrop]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value * 0.45,
  }));

  if (!visible && !node) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button">
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
        <View style={styles.sheetHit} pointerEvents="box-none">
          <Animated.View style={[styles.sheetWrap, sheetStyle]}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={42} tint="dark" style={styles.sheetBlur}>
                <SheetBody
                  node={node}
                  onClose={onClose}
                  onGenerateReading={onGenerateReading}
                  onOpenImmersive={onOpenImmersive}
                  showImmersiveAction={showImmersiveAction}
                />
              </BlurView>
            ) : (
              <View style={[styles.sheetBlur, styles.sheetAndroid]}>
                <SheetBody
                  node={node}
                  onClose={onClose}
                  onGenerateReading={onGenerateReading}
                  onOpenImmersive={onOpenImmersive}
                  showImmersiveAction={showImmersiveAction}
                />
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

function SheetBody({
  node,
  onClose,
  onGenerateReading,
  onOpenImmersive,
  showImmersiveAction,
}) {
  return (
    <>
      <View style={styles.handle} />
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetKicker}>Branch</Text>
        <Text style={styles.sheetTitle} numberOfLines={3}>
          {node?.label ?? 'Topic'}
        </Text>
        <Pressable onPress={onClose} hitSlop={14} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.onDarkMuted} />
        </Pressable>
      </View>
      <Text style={styles.sheetBody}>
        Open a generated reading tuned to this branch, or enter immersive grove view to explore with
        pinch and pan.
      </Text>
      <Pressable
        onPress={() => {
          onClose();
          onGenerateReading?.(node);
        }}
        style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.92 }]}
      >
        <Ionicons name="sparkles-outline" size={20} color={colors.onAccent} />
        <Text style={styles.primaryBtnText}>Generate reading</Text>
      </Pressable>
      {showImmersiveAction ? (
        <Pressable
          onPress={() => {
            onClose();
            onOpenImmersive?.();
          }}
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.88 }]}
        >
          <Ionicons name="expand-outline" size={20} color={colors.onDark} />
          <Text style={styles.secondaryBtnText}>Immersive grove</Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.forest950,
  },
  sheetHit: {
    width: '100%',
    zIndex: 2,
  },
  sheetWrap: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,252,247,0.12)',
  },
  sheetBlur: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
  },
  sheetAndroid: {
    backgroundColor: 'rgba(20, 40, 30, 0.94)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,252,247,0.25)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    marginBottom: 12,
    paddingRight: 36,
  },
  sheetKicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.onDarkMuted,
    marginBottom: 6,
  },
  sheetTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 28,
    lineHeight: 32,
    color: colors.onDark,
    letterSpacing: -0.3,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  sheetBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.onDarkMuted,
    marginBottom: 22,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.mint500,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.forest950,
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,252,247,0.28)',
  },
  secondaryBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.onDark,
  },
});
