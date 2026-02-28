/**
 * Background location tracking task.
 *
 * Uses expo-task-manager to define a background task that records
 * GPS positions even when the app is backgrounded.
 *
 * This module should be imported at the top level of `_layout.tsx`
 * (before any component renders) to register the task.
 *
 * NOTE: Requires `expo-task-manager` and `expo-location` to be installed.
 * If they're not available, the module gracefully degrades.
 */

const BACKGROUND_LOCATION_TASK = "background-location-task";

let TaskManager: any = null;
let Location: any = null;

try {
  TaskManager = require("expo-task-manager");
  Location = require("expo-location");
} catch {
  console.warn(
    "expo-task-manager not installed. Background location tracking disabled.",
  );
}

if (TaskManager && Location) {
  TaskManager.defineTask(
    BACKGROUND_LOCATION_TASK,
    ({ data, error }: { data: { locations: any[] }; error: any }) => {
      if (error) {
        console.error("Background location error:", error);
        return;
      }

      if (data?.locations?.length > 0) {
        const { useLocationStore } = require("@/shared/store/useLocationStore");
        const store = useLocationStore.getState();

        for (const loc of data.locations) {
          store.setLocation(loc);
          // The updateLocation function in the store handles history recording
        }
      }
    },
  );
}

/**
 * Start background location tracking.
 * Returns a cleanup function.
 */
export async function startBackgroundLocationTracking(): Promise<() => void> {
  if (!TaskManager || !Location) {
    console.warn("Background location not available");
    return () => { };
  }

  try {
    // Request background permissions
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Background location permission denied");
      return () => { };
    }

    // Check if already running
    const isRunning = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    ).catch(() => false);

    if (isRunning) {
      return () => stopBackgroundLocationTracking();
    }

    // Start background updates
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // 5 seconds
      distanceInterval: 10, // 10 meters
      deferredUpdatesInterval: 5000,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Kaelo - Navegación activa",
        notificationBody: "Registrando tu recorrido...",
        notificationColor: "#3B82F6",
      },
      activityType: Location.ActivityType.Fitness,
    });

    console.log("Background location tracking started");

    return () => stopBackgroundLocationTracking();
  } catch (error) {
    console.error("Error starting background location:", error);
    return () => { };
  }
}

/**
 * Stop background location tracking.
 */
export async function stopBackgroundLocationTracking(): Promise<void> {
  if (!TaskManager || !Location) return;

  try {
    // Check if the task is even defined before trying to query it
    const isTaskDefined = TaskManager.isTaskDefined
      ? TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)
      : true;

    if (!isTaskDefined) return;

    const isRunning = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    ).catch(() => false);

    if (isRunning) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log("Background location tracking stopped");
    }
  } catch {
    // Silently ignore — task may never have been started
  }
}

export { BACKGROUND_LOCATION_TASK };
