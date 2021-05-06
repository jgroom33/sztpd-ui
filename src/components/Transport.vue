<template>
  <div class="p-grid p-dir-col p-justify-center" style="text-align:center">
    <Button
      label="transport"
      class="p-button-secondary p-disabled p-button-lg"
    />
    <div class="p-col">
      <div class="p-grid p-justify-center">
        <DataTable
          :value="sbis"
          dataKey="name"
          class="p-col-10 p-datatable-striped"
          :loading="loading"
        >
          <template #header>
            <div class="table-header">
              SBIs (Device Connectivity)
            </div>
          </template>
          <template #loading>
            Loading SBI data. Please wait.
          </template>
          <template #empty>
            No SBI data Found.
          </template>
          <Column field="name" header="name" :sortable="true"></Column>
          <Column field="use-for" header="use-for"></Column>
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
      <Button @click="show_and_load()" label="Create SBI"> </Button>
      <br />
      <br />
      <div class="p-grid p-justify-center">
        <DataTable
          :value="nbis"
          dataKey="name"
          class="p-col-10 p-datatable-striped"
          :loading="loading"
        >
          <template #header>
            <div class="table-header">
              NBIs (Server Config Management)
            </div>
          </template>
          <template #loading>
            Loading Transport data. Please wait.
          </template>
          <template #empty>
            No Transport data Found.
          </template>
          <Column field="name" header="name" :sortable="true"></Column>
          <Column field="use-for" header="use-for"></Column>
          <Column
            field="http.tcp-server-parameters.local-address"
            header="address"
          ></Column>
        </DataTable>
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
            <label class="form__label">SBI Name</label>
            <InputText
              class="form__input general"
              v-model="name"
              placeholder="rfc8572-interface"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Asymmetric Key</label>
            <Dropdown
              v-model="asymmetric_key"
              :options="key_store"
              optionLabel="name"
              optionValue="name"
              placeholder="Select Key"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Certificate</label>
            <Dropdown
              v-model="certificate"
              :options="key_store"
              optionLabel="certificates.certificate.0.name"
              optionValue="certificates.certificate.0.name"
              placeholder="Select Certificate"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">local_truststore_reference</label>
            <Dropdown
              v-model="local_truststore_reference"
              :options="trust_store"
              optionLabel="name"
              optionValue="name"
              placeholder="Select local_truststore_reference"
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
          @click="create_endpoint()"
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
  name: "Transport",
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
      asymmetric_key: "",
      certificate: "",
      local_truststore_reference: "",
      // api
      transport: [],
      sbis: [],
      nbis: [],
      trust_store: [],
      key_store: [],
    };
  },
  created() {
    this.auth =
      "Basic " +
      btoa(this.$store.state.username + ":" + this.$store.state.password);
    this.getTransport();
    this.isReady();
  },
  methods: {
    async isReady() {
      await this.getKeyStore();
      await this.getTrustStore();
      if (this.key_store.length == 0 || this.trust_store.length == 0) {
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail: "Certificates required before an SBI can be created",
        });
      }
    },
    async getTransport() {
      this.sbis = [];
      this.nbis = [];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:transport`,
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
        json["wn-sztpd-1:transport"]["listen"]["endpoint"].forEach(
          (element) => {
            if (element["use-for"] == "native-interface") {
              this.nbis.push(element);
            } else {
              this.sbis.push(element);
            }
          }
        );
      }
      this.loading = false;
    },
    async getKeyStore() {
      this.key_store = [];
      let result = await this.getter(
        "/restconf/ds/ietf-datastores:running/wn-sztpd-1:keystore/asymmetric-keys"
      );
      if ('asymmetric-key' in result['wn-sztpd-1:asymmetric-keys']) {
        this.key_store = result["wn-sztpd-1:asymmetric-keys"]["asymmetric-key"];
      }
    },
    async getTrustStore() {
      this.trust_store = [];
      let result = await this.getter(
        "/restconf/ds/ietf-datastores:running/wn-sztpd-1:truststore/certificate-bags"
      );
      if ('certificate-bag' in result['wn-sztpd-1:certificate-bags']) {
        this.trust_store =
          result["wn-sztpd-1:certificate-bags"]["certificate-bag"];
      }
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
    async show_and_load() {
      await this.getTrustStore();
      await this.getKeyStore();
      this.create_dialog = true;
    },
    async create_endpoint() {
      let body = {
        "wn-sztpd-1:endpoint": [
          {
            name: this.name,
            "use-for": "rfc8572-interface",
            https: {
              "tcp-server-parameters": {
                "local-address": "0.0.0.0",
                "local-port": 443,
              },
              "tls-server-parameters": {
                "server-identity": {
                  certificate: {
                    reference: {
                      "asymmetric-key": this.asymmetric_key,
                      certificate: this.certificate,
                    },
                  },
                },
                "client-authentication": {
                  "ca-certs": {
                    "local-truststore-reference": this
                      .local_truststore_reference,
                  },
                },
              },
            },
          },
        ],
      };
      let path = `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:transport/listen`;
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
      this.getTransport();
    },
    async deleteRecord(data) {
      let record = data["name"];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:transport/listen/endpoint=${record}`,
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
        this.getTransport();
      }
    },
  },
};
</script>
