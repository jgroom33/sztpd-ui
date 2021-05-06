<template>
  <div class="p-grid p-dir-col p-justify-center" style="text-align:center">
    <Button
      label="Boot Images"
      class="p-button-secondary p-disabled p-button-lg"
    />
    <div class="p-col">
      <div class="p-grid p-justify-center">
        <DataTable
          :value="images"
          dataKey="name"
          class="p-col-10 p-datatable-striped"
          :loading="loading"
        >
          <template #loading>
            Loading images data. Please wait.
          </template>
          <template #empty>
            No Images found.
          </template>
          <Column field="name" header="name" :sortable="true"></Column>
          <Column field="download-uri.0" header="download-uri"></Column>
          <Column
            field="image-verification.0.hash-value"
            header="hash-value"
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
      <Button @click="show_and_load()" label="Create Boot Image"> </Button>
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
            <label class="form__label">Image Name</label>
            <InputText
              class="form__input general"
              v-model="name"
              placeholder="Name"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-8">
          <b>
            <label class="form__label">download uri</label>
            <InputText
              class="form__input general"
              v-model="download_uri"
              placeholder="http://10.92.44.130/loads/saos-10-05-01-0096-GA-packages/dnfvi-10-05-01-0096-GA.yml"
            />
          </b>
        </div>
        <div class="form-group p-field p-col-8">
          <b>
            <label class="form__label">hash</label>
            <InputText
              class="form__input general"
              v-model="hash_value"
              placeholder="04:0b:c0:aa:89:55:f7:9f:8b:4d:8a:72:bf:90:78:d0:1f:b7:15:a6:9d:ca:57:de:54:d8:ec:62:de:0d:2e:59"
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
          @click="create_image()"
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
  name: "BootImages",
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
      images: [],
      errors: [],
      // modal
      create_dialog: false,
      download_uri:
        "http://10.92.44.130/loads/saos-10-05-01-0096-GA-packages/dnfvi-10-05-01-0096-GA.yml",
      name: "",
      hash_value:
        "04:0b:c0:aa:89:55:f7:9f:8b:4d:8a:72:bf:90:78:d0:1f:b7:15:a6:9d:ca:57:de:54:d8:ec:62:de:0d:2e:59",
    };
  },
  created() {
    this.auth =
      "Basic " +
      btoa(this.$store.state.username + ":" + this.$store.state.password);
    this.getImages();
  },
  methods: {
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
          this.loading = false;
          this["images"] = json["wn-sztpd-1:boot-images"]["boot-image"];
        });
    },
    async deleteRecord(data) {
      let name = data["name"];
      let response = await fetch(
        `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:boot-images/boot-image=${name}`,
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
        this.getImages();
      }
    },
    async create_image() {
      let body;
      let path;
      body = {
        "wn-sztpd-1:boot-image": [
          {
            name: this.name,
            "download-uri": [this.download_uri],
            "image-verification": [
              {
                "hash-algorithm": "ietf-sztp-conveyed-info:sha-256",
                "hash-value": this.hash_value,
              },
            ],
          },
        ],
      };
      path = `${this.host}/restconf/ds/ietf-datastores:running/wn-sztpd-1:boot-images`;

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
      this.getImages();
    },
    show_and_load() {
      this.create_dialog = true;
    },
  },
};
</script>
