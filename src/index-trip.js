import { createAppEntry } from "./appEntryFactory";
import TripRouter from "./apps/trip/Router";

createAppEntry({
  Router: TripRouter,
  appName: "Trip",
  useAppComponent: true,
});
