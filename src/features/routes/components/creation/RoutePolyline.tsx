import Mapbox from "@rnmapbox/maps";
import React from "react";

interface RoutePolylineProps {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  id?: string;
}

export function RoutePolyline({
  coordinates,
  color = "#0EA5E9",
  width = 4,
  id = "draft-route",
}: RoutePolylineProps) {
  if (coordinates.length < 2) return null;

  const geojson: GeoJSON.Feature = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates,
    },
  };

  return (
    <Mapbox.ShapeSource id={`${id}-source`} shape={geojson}>
      <Mapbox.LineLayer
        id={`${id}-line`}
        style={{
          lineColor: color,
          lineWidth: width,
          lineCap: "round",
          lineJoin: "round",
          lineOpacity: 0.85,
        }}
      />
    </Mapbox.ShapeSource>
  );
}
