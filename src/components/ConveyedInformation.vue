<template>
  <div class="p-grid p-dir-col p-justify-center" style="text-align:center">
    <div class="p-col">
      <div class="p-grid p-justify-center">
        <DataTable
          :value="conveyed_information_responses"
          dataKey="name"
          class="p-col-10 p-datatable-striped"
          :loading="loading"
        >
          <template #header>
            <div class="table-header">
              Conveyed Information
            </div>
          </template>
          <template #loading>
            Loading Conveyed Info data. Please wait.
          </template>
          <template #empty>
            No Conveyed Info Found.
          </template>
          <Column field="name" header="name" :sortable="true"></Column>
          <Column
            field="onboarding-information.boot-image"
            header="Boot Image Entry"
          ></Column>
          <Column
            field="onboarding-information.configuration"
            header="Configuration Entry"
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
        </DataTable>
      </div>
      <Button @click="show_and_load()" label="Create Information"> </Button>
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
            <label class="form__label">Boot Image</label>
            <Dropdown
              v-model="image"
              :options="images"
              optionLabel="name"
              optionValue="name"
              placeholder="Select an Image"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-2">
          <b>
            <label class="form__label">Config</label>
            <Dropdown
              v-model="config"
              :options="configs"
              optionLabel="name"
              optionValue="name"
              placeholder="Select a Config"
            />
            <!-- <InputText class="form__input general" v-model="config" /> -->
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
          @click="create_info()"
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
      errors: [],
      auth: "",
      // modal
      create_dialog: false,
      name: "",
      config: "",
      image: "",
      // api
      conveyed_information_responses: [],
      images: [],
      configs: [],
    };
  },
  created() {
    this.auth =
      "Basic " +
      btoa(this.$store.state.username + ":" + this.$store.state.password);
    this.getInfo();
  },
  methods: {
    async getInfo() {
      this.conveyed_information_responses = [];
      let result = await this.getter(
        "/restconf/ds/ietf-datastores:running/wn-sztpd-1:conveyed-information-responses"
      );
      if (result != {}) {
        this.conveyed_information_responses =
          result["wn-sztpd-1:conveyed-information-responses"][
            "onboarding-information-response"
          ];
      }
      this.loading = false;
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
    async deleteRecord(data) {
      let sn = data["name"];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:conveyed-information-responses/onboarding-information-response=${sn}`,
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
        this.getInfo();
      }
    },
    show_and_load() {
      this.create_dialog = true;
      this.getConfigs();
      this.getImages();
    },
    getImages() {
      fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:boot-images`,
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
          this.images = json["wn-sztpd-1:boot-images"]["boot-image"];
        });
    },
    getConfigs() {
      fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:configurations`,
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
          this.configs = json["wn-sztpd-1:configurations"]["configuration"];
        });
    },
    create_info() {
      let body = {
        "wn-sztpd-1:onboarding-information-response": [
          {
            name: this.name,
            "onboarding-information": {
              "boot-image": this.image,
              configuration: this.config,
            },
          },
        ],
      };
      fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:conveyed-information-responses`,
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
        .then(this.getInfo());
    },
  },
};
</script>
