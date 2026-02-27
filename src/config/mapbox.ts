import Mapbox from "@rnmapbox/maps";
import ENV from "./env";

// Set access token
Mapbox.setAccessToken(ENV.MAPBOX_ACCESS_TOKEN);

// Suppress non-critical Mapbox timing warnings globally
Mapbox.Logger.setLogCallback((log: { level: string; message: string }) => {
    if (
        log.message.includes("is not in style") ||
        log.message.includes("Invalid size") ||
        log.message.includes("max 1 subview")
    ) {
        return true; // suppress this log
    }
    return false; // let other logs through
});
