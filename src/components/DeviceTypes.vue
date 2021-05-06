<template>
  <div class="p-grid p-dir-col p-justify-center" style="text-align:center">
    <div class="p-col">
      <div class="p-grid p-justify-center">
        <DataTable
          :value="device_types"
          dataKey="name"
          class="p-col-4 p-datatable-striped"
          :loading="loading"
        >
          <template #header>
            <div class="table-header">
              Device Types
            </div>
          </template>
          <template #loading>
            Loading Device Types. Please wait.
          </template>
          <template #empty>
            No Device Types Found.
          </template>
          <Column field="name" header="name" :sortable="true"></Column>
          <Column>
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning"
                @click="deleteRecord(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="p-grid p-justify-center">
        <Button @click="show_and_load()" label="Create Device Type"> </Button>
      </div>
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
            <label class="form__label">Device Type Name</label>
            <InputText
              class="form__input general"
              v-model="name"
              placeholder="dnfvi"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Trust Store</label>
            <Dropdown
              v-model="trust_store"
              :options="trust_stores"
              optionLabel="name"
              placeholder="Select Trust Store"
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
          @click="create_device_type()"
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
  name: "DeviceTypes",
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
      errors: [],
      auth: "",
      // modal
      create_dialog: false,
      name: "",
      certificate: "",
      trust_stores: [],
      trust_store: [],
      // api
      device_types: [],
    };
  },
  created() {
    this.auth =
      "Basic " +
      btoa(this.$store.state.username + ":" + this.$store.state.password);
    this.getDeviceTypes();
  },
  methods: {
    async getDeviceTypes() {
      this.device_types = [];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:device-types`,
        {
          headers: {
            Accept: "application/yang-data+json",
            "Content-Type": "application/yang-data+json",
            Authorization: this.auth,
          },
        }
      );
      if (response.status == 200) {
        let json = await response.json();
        this.device_types = json["wn-sztpd-1:device-types"]["device-type"];
      }
      this.loading = false;
    },
    async deleteRecord(data) {
      let record = data["name"];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:device-types/device-type=${record}`,
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
        this.getDeviceTypes();
      }
    },
    async create_device_type() {
      let body;
      let path;
      body = {
        "wn-sztpd-1:device-type": [
          {
            name: this.name,
            "identity-certificates": {
              verification: {
                "local-truststore-reference": {
                  "certificate-bag": this.trust_store.name,
                  certificate: this.trust_store.certificate[0].name,
                },
              },
              "serial-number-extraction": "wn-x509-c2n:serial-number",
            },
          },
        ],
      };
      path = `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:device-types`;

      let response = await fetch(path, {
        method: "POST",
        headers: {
          Accept: "application/yang-data+json",
          "Content-Type": "application/yang-data+json",
          Authorization: this.auth,
        },
        body: JSON.stringify(body),
      });
      if (response.status == 201) {
        this.create_dialog = false;
      } else {
        this.create_dialog = false;
        let result = await response.json();
        result["ietf-restconf:errors"].error.forEach((element) => {
          this.errors.push(element);
        });
      }
      this.getDeviceTypes();
    },
    async getter(path) {
      let response = await fetch(`${this.host}${path}`, {
        headers: {
          Accept: "application/yang-data+json",
          "Content-Type": "application/yang-data+json",
          Authorization: this.auth,
        },
      });
      if (response.status == 200) {
        let json = await response.json();
        return json;
      } else {
        return {};
      }
    },
    async getTrustStore() {
      this.trust_stores = [];
      let result = await this.getter(
        "/restconf/ds/ietf-datastores:running/wn-sztpd-1:truststore"
      );
      if (result != {}) {
        this.trust_stores =
          result["wn-sztpd-1:truststore"]["certificate-bags"][
            "certificate-bag"
          ];
      }
    },
    show_and_load() {
      this.create_dialog = true;
      this.getTrustStore();
    },
  },
};
</script>
