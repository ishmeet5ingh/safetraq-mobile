const leafletHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <style>
      html, body, #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }

      body {
        overflow: hidden;
      }

      .leaflet-container {
        width: 100%;
        height: 100%;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <script>
      const DEFAULT_CENTER = [28.6139, 77.2090];
      const DEFAULT_ZOOM = 11; // initial wide view
      const SINGLE_MARKER_WIDE_ZOOM = 12; // single marker ke case me bhi wide
      const EXTRA_ZOOM_OUT_STEPS = 1; // fit ke baad thoda aur wider

      const map = L.map('map', {
        zoomControl: true,
        minZoom: 3,
        maxZoom: 19
      }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const markersMap = new Map();

      let hasInitialCameraSet = false;
      let isProgrammaticMove = false;
      let userHasTakenControl = false;

      function setProgrammaticFlag(value) {
        isProgrammaticMove = value;
      }

      function markUserInteraction() {
        if (!isProgrammaticMove) {
          userHasTakenControl = true;
        }
      }

      map.on('dragstart', markUserInteraction);
      map.on('zoomstart', markUserInteraction);
      map.on('movestart', markUserInteraction);

      function setInitialWideView(bounds) {
        if (!bounds.length) return;

        setProgrammaticFlag(true);

        if (bounds.length === 1) {
          map.setView(bounds[0], SINGLE_MARKER_WIDE_ZOOM, {
            animate: false
          });
        } else {
          map.fitBounds(bounds, {
            padding: [70, 70],
            animate: false
          });

          const currentZoom = map.getZoom();
          const nextZoom = Math.max(3, currentZoom - EXTRA_ZOOM_OUT_STEPS);
          map.setZoom(nextZoom, { animate: false });
        }

        hasInitialCameraSet = true;

        setTimeout(() => {
          setProgrammaticFlag(false);
        }, 250);
      }

      function updateMarkers(payload) {
        const markers = payload.markers || [];
        const nextIds = new Set();
        const bounds = [];
        const coordinateGroups = new Map();

        markers.forEach((item) => {
          const key =
            Number(item.latitude).toFixed(6) + ',' + Number(item.longitude).toFixed(6);
          const existing = coordinateGroups.get(key) || [];
          existing.push(item.id);
          coordinateGroups.set(key, existing);
        });

        function getDisplayLatLng(item) {
          const key =
            Number(item.latitude).toFixed(6) + ',' + Number(item.longitude).toFixed(6);
          const group = coordinateGroups.get(key) || [];

          if (group.length <= 1) {
            return [item.latitude, item.longitude];
          }

          const index = group.indexOf(item.id);

          if (index === -1) {
            return [item.latitude, item.longitude];
          }

          // Spread identical coordinates in a small ring so emulator/mock
          // locations do not visually collapse into one marker.
          const angle = (Math.PI * 2 * index) / group.length;
          const radius = 0.00018;
          const latOffset = Math.sin(angle) * radius;
          const lngOffset = Math.cos(angle) * radius;

          return [item.latitude + latOffset, item.longitude + lngOffset];
        }

        markers.forEach((item) => {
          nextIds.add(item.id);

          const latLng = getDisplayLatLng(item);
          bounds.push(latLng);

          if (markersMap.has(item.id)) {
            const marker = markersMap.get(item.id);
            marker.setLatLng(latLng);
            marker.bindPopup(item.label || 'User');
          } else {
            const marker = L.marker(latLng)
              .addTo(map)
              .bindPopup(item.label || 'User');

            markersMap.set(item.id, marker);
          }
        });

        Array.from(markersMap.keys()).forEach((id) => {
          if (!nextIds.has(id)) {
            const marker = markersMap.get(id);
            if (marker) {
              map.removeLayer(marker);
            }
            markersMap.delete(id);
          }
        });

        // sirf first time camera set hogi
        if (!hasInitialCameraSet) {
          setInitialWideView(bounds);
          return;
        }

        // initial ke baad zoom/pan bilkul preserve rahega
        // nayi updates sirf markers ko move karengi, camera ko nahi
      }

      function handleMessage(event) {
        try {
          const payload = JSON.parse(event.data);
          updateMarkers(payload);
        } catch (error) {
          console.log('Invalid map payload', error);
        }
      }

      document.addEventListener('message', handleMessage);
      window.addEventListener('message', handleMessage);

      window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'MAP_READY' })
        );
    </script>
  </body>
</html>
`;

export default leafletHtml;
