<template>
  <div class="p-grid p-dir-col p-justify-center" style="text-align:center">
    <div class="p-col">
      <div class="p-grid p-justify-center">
        <DataTable
          :value="certificate_bags"
          dataKey="name"
          class="p-col-4 p-datatable-striped"
          :loading="loading"
        >
          <template #header>
            <div class="table-header">
              Trust Store (Device Certs)
            </div>
          </template>
          <template #loading>
            Loading Trust Store data. Please wait.
          </template>
          <template #empty>
            No Trust Store data Found.
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
        <Button @click="show_and_load()" label="Create bag"> </Button>
      </div>
      <br />
      <br />
      <div class="p-grid p-justify-center">
        <DataTable
          :value="keys"
          dataKey="name"
          class="p-col-4 p-datatable-striped"
          :loading="loading"
        >
          <template #header>
            <div class="table-header">
              Key Store (Server Certs)
            </div>
          </template>
          <template #loading>
            Loading Key Store data. Please wait.
          </template>
          <template #empty>
            No Key Store data found.
          </template>
          <Column field="name" header="name" :sortable="true"></Column>
          <Column>
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning"
                @click="deleteKeyRecord(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <Button @click="show_and_load_2()" label="Create key set"> </Button>
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
            <label class="form__label">Cert Name</label>
            <InputText
              class="form__input general"
              v-model="name"
              placeholder="Cert Name"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Cert-data</label>
            <InputText
              class="form__input general"
              v-model="cert_data"
              placeholder="CLIENT_CERT_TA_B64"
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
          @click="create_bag()"
          class="p-justify-right button"
        />
      </template>
    </Dialog>
    <Dialog
      :style="{ width: '70%' }"
      :visible.sync="create_dialog2"
      :contentStyle="{ overflow: 'visible' }"
    >
      <div
        class="p-fluid p-formgrid p-grid p-justify-center"
        style="text-align:left"
      >
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Key Name</label>
            <InputText
              class="form__input general"
              v-model="key_name"
              placeholder="Key Name"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Public Key</label>
            <InputText
              class="form__input general"
              v-model="public_key"
              placeholder="SBI_PUB_KEY_B64"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Private Key</label>
            <InputText
              class="form__input general"
              v-model="private_key"
              placeholder="SBI_PRI_KEY_B64"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Cert</label>
            <InputText
              class="form__input general"
              v-model="key_cert_data"
              placeholder="SBI_EE_CERT_B64"
            />
          </b>
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          @click="() => (create_dialog2 = false)"
          class="p-justify-right p-button-danger"
        />
        <Button
          label="Create"
          @click="create_keys()"
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
  name: "Certs",
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
      cert_data: "",
      name: "",
      // modal 2
      create_dialog2: false,
      key_name: "",
      key_cert_data: "",
      public_key: "",
      private_key: "",
      // api
      certificate_bags: [],
      keys: [],
    };
  },
  created() {
    this.auth =
      "Basic " +
      btoa(this.$store.state.username + ":" + this.$store.state.password);
    this.getTrustStore();
    this.getKeyStore();
  },
  methods: {
    async getKeyStore() {
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:keystore`,
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
        this.keys =
          json["wn-sztpd-1:keystore"]["asymmetric-keys"]["asymmetric-key"];
      }
      this.loading = false;
    },
    async getTrustStore() {
      this.certificate_bags = [];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:truststore`,
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
        this.certificate_bags =
          json["wn-sztpd-1:truststore"]["certificate-bags"]["certificate-bag"];
      }
      this.loading = false;
    },
    async deleteRecord(data) {
      let record = data["name"];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:truststore/certificate-bags/certificate-bag=${record}`,
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
        this.getTrustStore();
      }
    },
    async deleteKeyRecord(data) {
      let record = data["name"];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:keystore/asymmetric-keys/asymmetric-key=${record}`,
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
        this.getKeyStore();
      }
    },
    async create_keys() {
      let body = {
        "wn-sztpd-1:asymmetric-keys": {
          "asymmetric-key": [
            {
              name: this.key_name,
              "public-key": this.public_key,
              "cleartext-private-key": this.private_key,
              "public-key-format":
                "ietf-crypto-types:subject-public-key-info-format",
              "private-key-format": "ietf-crypto-types:ec-private-key-format",
              certificates: {
                certificate: [
                  {
                    name: `${this.key_name}-cert`,
                    "cert-data": this.key_cert_data,
                  },
                ],
              },
            },
          ],
        },
      };
      let path = `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:keystore`;

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
        this.create_dialog2 = false;
      } else {
        this.create_dialog2 = false;
        let result = await response.json();
        result["ietf-restconf:errors"].error.forEach((element) => {
          this.errors.push(element);
        });
      }
      this.getKeyStore();
    },
    async create_bag() {
      let body;
      let path;
      body = {
        "wn-sztpd-1:certificate-bags": {
          "certificate-bag": [
            {
              name: this.name,
              certificate: [
                {
                  name: this.name,
                  "cert-data": this.cert_data,
                },
              ],
            },
          ],
        },
      };
      path = `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:truststore`;

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
      this.getTrustStore();
    },
    show_and_load() {
      this.create_dialog = true;
      this.getTrustStore();
    },
    show_and_load_2() {
      this.create_dialog2 = true;
      this.getKeyStore();
    },
  },
};
</script>
