import Vue from "vue";
import Router from "vue-router";

import HomeComponent from "@/components/Home";
import RunningComponent from "@/components/Running";
import TransportComponent from "@/components/Transport";
import CertsComponent from "@/components/Certs";
import ConfigurationsComponent from "@/components/Configurations";
import ConveyedInformationComponent from "@/components/ConveyedInformation";
import DevicesComponent from "@/components/Devices";
import DevicesTypesComponent from "@/components/DeviceTypes";
import BootImagesComponent from "@/components/BootImages";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      component: HomeComponent,
      meta: {
        title: 'Secure Zero Touch server'
      }
    },
    {
      path: "/ietf-datastores:running",
      name: "Running",
      component: RunningComponent
    },
    {
      path: "/transport",
      name: "Transport",
      component: TransportComponent
    },
    {
      path: "/device-types",
      name: "DeviceTypes",
      component: DevicesTypesComponent
    },
    {
      path: "/certs",
      name: "Certs",
      component: CertsComponent
    },
    {
      path: "/configurations",
      name: "Configurations",
      component: ConfigurationsComponent
    },
    {
      path: "/devices",
      name: "Devices",
      component: DevicesComponent
    },
    {
      path: "/conveyed-information",
      name: "ConveyedInformation",
      component: ConveyedInformationComponent
    },
    {
      path: "/boot-images",
      name: "BootImages",
      component: BootImagesComponent
    }
  ]
});

export default router;
