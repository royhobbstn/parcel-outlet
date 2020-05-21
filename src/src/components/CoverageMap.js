import React, { Component } from "react";
import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { style } from "../style/mapStyle.js";
import { stateLookup } from "../lookups/states";
import { countyLookup } from "../lookups/counties.js";

export class CoverageMap extends Component {
  componentDidMount() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoibWFwdXRvcGlhIiwiYSI6IjZ6REI2MWsifQ.Apr0jB7q-uSUXWNvJlXGTg";
    window.map = new mapboxgl.Map({
      container: "map",
      style,
      center: [-104.9, 39.75],
      zoom: 4,
      maxZoom: 13,
      minZoom: 3,
    });

    let hoveredStateId = null;

    const countyJsonLoad = window
      .fetch("/data/us_counties.geojson")
      .then((response) => response.json());
    const stateJsonLoad = window
      .fetch("/data/us_states.geojson")
      .then((response) => response.json());

    window.map.on("load", () => {
      Promise.all([countyJsonLoad, stateJsonLoad])
        .then((geo) => {
          const enriched = enrichGeometry(geo[0], this.props.inventory);

          window.map.addSource("counties", {
            type: "geojson",
            data: enriched,
            generateId: true,
          });
          window.map.addSource("states", {
            type: "geojson",
            data: geo[1],
          });
          window.map.addLayer({
            id: "counties",
            type: "fill",
            source: "counties",
            layout: {},
            paint: {
              "fill-color": [
                "case",
                ["boolean", ["get", "covered"], true],
                "#088",
                "maroon",
              ],
              "fill-opacity": [
                "case",
                [
                  "all",
                  ["boolean", ["to-boolean", ["feature-state", "hover"]], true],
                  ["boolean", ["get", "covered"], true],
                ],
                0.8,
                ["boolean", ["get", "covered"], true],
                0.4,
                ["boolean", ["to-boolean", ["feature-state", "hover"]], true],
                0.2,
                0.1,
              ],
            },
          });
          window.map.addLayer({
            id: "states",
            type: "line",
            source: "states",
            layout: {},
            paint: {
              "line-color": "#627BC1",
              "line-width": 1,
            },
          });
        })
        .catch((err) => console.log(err));
    });

    // When a click event occurs on a feature in the states layer, open a popup at the
    // location of the click, with description HTML from its properties.
    window.map.on("click", "counties", function (e) {
      const feature = e.features[0].properties;

      const geoid = feature.GEOID;
      const state = geoid.slice(0, 2);
      const county = geoid.slice(2);

      let html = `${countyLookup(state + county)}, ${stateLookup(state)}`;

      if (feature.covered) {
        JSON.parse(feature.links).forEach((link) => {
          html += `<br /><a href="${link}" target="_blank">${
            new URL(link).hostname
          }</a>`;
        });
      } else {
        html += `<br /><span style="color:maroon;">No coverage.</span>`;
      }

      new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(html).addTo(window.map);
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    window.map.on("mouseenter", "counties", function () {
      window.map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    window.map.on("mouseleave", "counties", function () {
      window.map.getCanvas().style.cursor = "";
    });

    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    window.map.on("mousemove", "counties", function (e) {
      if (e.features.length > 0) {
        if (hoveredStateId) {
          window.map.setFeatureState(
            { source: "counties", id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = e.features[0].id;
        window.map.setFeatureState(
          { source: "counties", id: hoveredStateId },
          { hover: true }
        );
      }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    window.map.on("mouseleave", "counties", function () {
      if (hoveredStateId) {
        window.map.setFeatureState(
          { source: "counties", id: hoveredStateId },
          { hover: false }
        );
      }
      hoveredStateId = null;
    });

    window.map.on("error", (event) => console.log(event));
  }

  shouldComponentUpdate(nextProps, nextState, _) {
    return false;
  }

  render() {
    return <div id="map" />;
  }
}

function enrichGeometry(geo, inventory) {
  const hash = {};
  const links = {};

  inventory.forEach((i) => {
    hash[i.FIPS] = true;

    if (!links[i.FIPS]) {
      links[i.FIPS] = [];
    }

    links[i.FIPS].push(i.LandingPageLink);
  });

  geo.features.forEach((feature) => {
    feature.properties.covered = !!hash[feature.properties.GEOID];
    feature.properties.links = links[feature.properties.GEOID];
  });

  return geo;
}
