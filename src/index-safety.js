import { createAppEntry } from "./appEntryFactory";
import SafetyRouter from "./apps/safety/Router";

createAppEntry({
  Router: SafetyRouter,
  appName: "Safety",
  useAppComponent: true,
});
