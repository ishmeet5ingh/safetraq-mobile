import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import leafletHtml from '../utils/leafletHtml';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
}

interface LeafletMapProps {
  currentUserMarker?: MapMarker | null;
  otherMarkers: MapMarker[];
}

const LeafletMap = ({ currentUserMarker, otherMarkers }: LeafletMapProps) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!isMapReady) {
      return;
    }

    const markers: MapMarker[] = [];

    if (currentUserMarker) {
      markers.push(currentUserMarker);
    }

    otherMarkers.forEach((item) => {
      markers.push(item);
    });

    webViewRef.current?.postMessage(
      JSON.stringify({
        markers,
      }),
    );
  }, [currentUserMarker, otherMarkers, isMapReady]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHtml }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MAP_READY') {
              setIsMapReady(true);
            }
          } catch (_error) {}
        }}
      />
    </View>
  );
};

export default LeafletMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
  },
});