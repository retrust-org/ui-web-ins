import { createAppEntry } from "./appEntryFactory";
import Home from "./apps/home/index";

createAppEntry({
  Router: Home,
  appName: "Home",
  useAppComponent: true,
});
