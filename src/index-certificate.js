import { createAppEntry } from "./appEntryFactory";
import CertificateRouter from "./apps/certificate/Route";

createAppEntry({
  Router: CertificateRouter,
  appName: "Certificate",
  useAppComponent: true,
});
