<template>
  <div class="p-grid p-dir-col p-justify-center" style="text-align:center">
    <Button label="Configs" class="p-button-secondary p-disabled p-button-lg" />
    <div class="p-col">
      <div class="p-grid p-justify-center">
        <DataTable
          :value="configs"
          dataKey="name"
          class="p-col-10 p-datatable-striped"
          :loading="loading"
          :expandedRows.sync="expandedRows"
        >
          <template #loading>
            Loading config data. Please wait.
          </template>
          <template #empty>
            No Configs found.
          </template>
          <Column :expander="true" headerStyle="width: 3rem" />
          <Column field="name" header="name" :sortable="true"></Column>
          <Column
            field="configuration-handling"
            header="configuration-handling"
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
            <div class="orders-subtable">
              <h5>Config for {{ slotProps.data.name }}</h5>
              {{ decode(slotProps.data.config) }}
            </div>
          </template>
        </DataTable>
      </div>
      <Button @click="() => (create_dialog = true)" label="Create Config">
      </Button>
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
            <label class="form__label">name</label>
            <InputText
              class="form__input general"
              v-model="name"
              placeholder="Serial Number"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Config Handling</label>
            <Dropdown
              v-model="handling"
              :options="['replace', 'merge']"
              placeholder="Select an Image"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Config</label>
            <InputText
              class="form__input general"
              v-model="xml_config"
              placeholder="<config xml>"
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
          @click="create_config()"
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
      configs: [],
      errors: [],
      expandedRows: [],
      auth: "",
      // modal
      create_dialog: false,
      name: "",
      handling: "replace",
      xml_config: "",
    };
  },
  created() {
    this.auth =
      "Basic " +
      btoa(this.$store.state.username + ":" + this.$store.state.password);
    this.getConfigs();
  },
  methods: {
    decode(data) {
      return atob(data);
    },
    async getConfigs() {
      this.configs = [];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:configurations`,
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
        this.configs = json["wn-sztpd-1:configurations"]["configuration"];
      }
      this.loading = false;
    },
    async deleteRecord(data) {
      let record = data["name"];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:configurations/configuration=${record}`,
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
        this.getConfigs();
      }
    },
    async create_config() {
      let path = `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:configurations`;
      let body = {
        "wn-sztpd-1:configuration": [
          {
            name: this.name,
            "configuration-handling": this.handling,
            config: btoa(this.xml_config),
          },
        ],
      };
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
      this.getConfigs();
    },
  },
};
</script>
