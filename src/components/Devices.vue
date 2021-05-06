<template>
  <div class="p-grid p-dir-col p-justify-center" style="text-align:center">
    <Button label="Devices" class="p-button-secondary p-disabled p-button-lg" />
    <div class="p-col">
      <div class="p-grid p-justify-center">
        <DataTable
          :value="devices"
          dataKey="serial-number"
          class="p-col-10 p-datatable-striped"
          :loading="loading"
          :expandedRows.sync="expandedRows"
          @row-expand="onRowExpand"
        >
          <template #loading>
            Loading devices data. Please wait.
          </template>
          <template #empty>
            No Devices found.
          </template>
          <Column :expander="true" headerStyle="width: 3rem" />
          <Column
            field="serial-number"
            header="serial-number"
            :sortable="true"
          ></Column>
          <Column field="device-type" header="device-type"></Column>
          <Column
            field="response-manager.matched-response.0.response.conveyed-information.onboarding-information.reference"
            header="Conveyed Info Entry"
          ></Column>
          <Column>
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning"
                @click="deleteRecord(slotProps.data)"
              />
            </template>
          </Column>
          <template #expansion="slotProps">
            <div>
              <h5>
                BOOT STRAPPING EVENT for {{ slotProps.data["serial-number"] }}
              </h5>
              <DataTable :value="logs_boot">
                <Column field="timestamp" header="timestamp"></Column>
                <Column field="source-ip" header="source-ip"></Column>
                <Column
                  field="event-details.get-bootstrapping-data-event"
                  header="details"
                ></Column>
              </DataTable>
              <h5>REPORT PROGRESS for {{ slotProps.data["serial-number"] }}</h5>
              <DataTable :value="logs_progress">
                <Column field="timestamp" header="timestamp"></Column>
                <Column field="source-ip" header="source-ip"></Column>
                <Column
                  field="event-details.report-progress-event.passed-input.progress-type"
                  header="details"
                ></Column>
              </DataTable>
              <!-- report-progress-event -->
            </div>
          </template>
        </DataTable>
      </div>
      <Button @click="show_and_load()" label="Create Device"> </Button>
    </div>
    <!-- Create Modal -->
    <Dialog
      :style="{ width: '70%' }"
      :visible.sync="create_dialog"
      :contentStyle="{ overflow: 'visible' }"
    >
      <div
        class="p-fluid p-formgrid p-grid p-justify-center"
        style="text-align:left"
      >
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">serial number</label>
            <InputText
              class="form__input general"
              v-model="serial_number"
              placeholder="Serial Number"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Conveyed Info</label>
            <Dropdown
              v-model="conveyed"
              :options="info"
              optionLabel="name"
              optionValue="name"
              placeholder="Select Conveyed Info"
            />
          </b>
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          @click="() => (create_dialog = false)"
          class="p-justify-right p-button-danger"
        />
        <Button
          label="Create"
          @click="create_device()"
          class="p-justify-right button"
        />
      </template>
    </Dialog>

    <div class="p-col p-justify-center">
      <Message
        v-for="msg of errors"
        :sticky="true"
        severity="error"
        :key="msg.id"
        :closable="true"
        >{{ msg["error-message"] }}
      </Message>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  name: "Devices",
  computed: {
    username: function() {
      return this.$store.state.username;
    },
    password: function() {
      return this.$store.state.password;
    },
    host: function() {
      return this.$store.state.host;
    },
  },
  data() {
    return {
      loading: true,
      devices: [],
      errors: [],
      auth: "",
      info: [],
      conveyed: "",
      create_dialog: false,
      serial_number: "",
      logs: [],
      logs_progress: [],
      logs_boot: [],
      expandedRows: [],
    };
  },
  created() {
    this.auth =
      "Basic " +
      btoa(this.$store.state.username + ":" + this.$store.state.password);
    this.getDevices();
  },
  methods: {
    show_and_load() {
      this.create_dialog = true;
      this.getInfo();
    },
    getDevices() {
      fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:devices`,
        {
          headers: {
            Accept: "application/yang-data+json",
            "Content-Type": "application/yang-data+json",
            Authorization: this.auth,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          this.loading = false;
          this["devices"] = json["wn-sztpd-1:devices"]["device"];
        });
    },
    async onRowExpand(event) {
      let sn = event.data["serial-number"];
      this.logs_boot = [];
      this.logs_progress = [];
      let logs = await this.getLogs(sn);
      console.log(logs);
      logs.forEach((element) => {
        if (element["event-details"]["get-bootstrapping-data-event"] != null) {
          this.logs_boot.push(element);
        } else {
          this.logs_progress.push(element);
        }
      });
    },
    async deleteRecord(data) {
      let name = data["serial-number"];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:devices/device=${name}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/yang-data+json",
            "Content-Type": "application/yang-data+json",
            Authorization: this.auth,
          },
        }
      );
      if (response.status == 204) {
        this.getDevices();
      }
    },
    create_device() {
      let body = {
        "wn-sztpd-1:device": [
          {
            "serial-number": this.serial_number,
            "device-type": "dnfvi",
            "response-manager": {
              "matched-response": [
                {
                  name: "catch-all-response",
                  response: {
                    "conveyed-information": {
                      "onboarding-information": { reference: this.conveyed },
                    },
                  },
                },
              ],
            },
          },
        ],
      };
      fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:devices`,
        {
          method: "POST",
          headers: {
            Accept: "application/yang-data+json",
            "Content-Type": "application/yang-data+json",
            Authorization: this.auth,
          },
          body: JSON.stringify(body),
        }
      )
        .then(() => {
          this.create_dialog = false;
        })
        .then(this.getDevices());
    },
    async getLogs(sn) {
      let result = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:operational/wn-sztpd-1:devices/device=${sn}/bootstrapping-log`,
        {
          headers: {
            Accept: "application/yang-data+json",
            Authorization: this.auth,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          return json;
        });
      return result["wn-sztpd-1:bootstrapping-log"]["log-entry"];
    },
    getInfo() {
      fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:conveyed-information-responses`,
        {
          headers: {
            Accept: "application/yang-data+json",
            "Content-Type": "application/yang-data+json",
            Authorization: this.auth,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          this.loading = false;
          this["info"] =
            json["wn-sztpd-1:conveyed-information-responses"][
              "onboarding-information-response"
            ];
        });
    },
  },
};
</script>
