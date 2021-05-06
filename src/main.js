import Vue from 'vue'
import App from './App.vue'
import router from "./router";
import store from "./store";
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Badge from "primevue/badge";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Chip from 'primevue/chip';
import Chips from 'primevue/chips';
import Column from "primevue/column";
import ContextMenu from "primevue/contextmenu";
import ConfirmationService from "primevue/confirmationservice";
import DataTable from "primevue/datatable";
import DataView from "primevue/dataview";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import InputMask from "primevue/inputmask";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import Panel from 'primevue/panel';
import ProgressBar from "primevue/progressbar";
import Sidebar from "primevue/sidebar";
import Toast from "primevue/toast";
import ToastService from 'primevue/toastservice';
import Toolbar from "primevue/toolbar";
import Tooltip from "primevue/tooltip";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

Vue.component("AutoComplete", AutoComplete);
Vue.component("Button", Button);
Vue.component("Badge", Badge);
Vue.component("Card", Card);
Vue.component("Checkbox", Checkbox);
Vue.component("Chip", Chip);
Vue.component("Chips", Chips);
Vue.component("Column", Column);
Vue.component("ContextMenu", ContextMenu);
// Vue.component("ConfirmPopup", ConfirmPopup);
Vue.component("DataTable", DataTable);
Vue.component("DataView", DataView);
Vue.component("Dialog", Dialog);
Vue.component("Dropdown", Dropdown);
Vue.component("Panel", Panel);
Vue.component("InputMask", InputMask);
Vue.component("InputText", InputText);
Vue.component("Message", Message);
Vue.component("MultiSelect", MultiSelect);
Vue.component("ProgressBar", ProgressBar);
Vue.component("Sidebar", Sidebar);
Vue.component("Toast", Toast);
Vue.component("Toolbar", Toolbar);
Vue.directive("tooltip", Tooltip);
Vue.use(ToastService);
Vue.use(ConfirmationService);
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
