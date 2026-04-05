import { StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

/**
 * Barely-visible organic lines — only noticed up close.
 */
export function GroveVeinTexture({ width, height, opacity = 0.14 }) {
  if (!width || !height) return null;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <G opacity={opacity}>
        <Path
          d={`M0 ${height * 0.35} Q ${width * 0.35} ${height * 0.2} ${width * 0.55} ${height * 0.42} T ${width} ${height * 0.28}`}
          stroke="rgba(190, 230, 205, 1)"
          strokeWidth={0.8}
          fill="none"
        />
        <Path
          d={`M${width * 0.08} ${height} Q ${width * 0.25} ${height * 0.65} ${width * 0.5} ${height * 0.55} T ${width * 0.92} ${height * 0.4}`}
          stroke="rgba(158, 212, 184, 1)"
          strokeWidth={0.6}
          fill="none"
        />
        <Path
          d={`M${width} 0 Q ${width * 0.7} ${height * 0.15} ${width * 0.45} ${height * 0.35} T ${width * 0.15} ${height * 0.55}`}
          stroke="rgba(130, 200, 165, 1)"
          strokeWidth={0.5}
          fill="none"
        />
      </G>
    </Svg>
  );
}
