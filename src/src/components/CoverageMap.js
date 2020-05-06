import React from "react";
import ReactMapboxGl, { Layer, Feature } from "react-mapbox-gl";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1IjoibWFwdXRvcGlhIiwiYSI6IjZ6REI2MWsifQ.Apr0jB7q-uSUXWNvJlXGTg",
});

export function CoverageMap() {
  return (
    <Map
      style={"mapbox://styles/mapbox/light-v9"}
      containerStyle={{
        height: "90vh",
        width: "100vw",
      }}
    >
      <Layer type="symbol" id="marker" layout={{ "icon-image": "marker-15" }}>
        <Feature coordinates={[0, 51.3233379650232]} />
      </Layer>
    </Map>
  );
}
