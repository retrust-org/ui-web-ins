import { createAppEntry } from "./appEntryFactory";
import FireRouter from "./apps/safety/fire/Router";

createAppEntry({
  Router: FireRouter,
  appName: "Fire",
  useAppComponent: true,
});
