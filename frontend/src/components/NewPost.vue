<template>
  <div id="new-post">
    <img class="profile-picture" :src="userImageUrl" :alt="'Photo de profil'" />
    <div>
      <textarea
        v-model="post.content"
        placeholder="Ecrivez le contenu de votre post ici"
      />
      <div id="button-container">
        <label for="file">+</label>
        <input id="file" type="file" @change="onImageChange" />
        <button id="poster" @click="createPost">Poster</button>
      </div>
    </div>
    <div id="preview">
      <img v-if="post.imageUrl" :src="post.imageUrl" />
    </div>
  </div>
</template>

<script>
import * as storage from "../modules/storage.js";
import axios from "axios"; //axio is used to make request on API

export default {
  name: "NewPost",
  data() {
    return {
      userImageUrl: storage.getStorage("imageUrl"),
      post: {
        content: null,
        image: null,
        imageUrl: "",
      },
    };
  },
  methods: {
    createPost() {
      const postData = new FormData();
      if (this.post.content || this.post.image) {
        console.log(storage.getAllStorage());
        postData.append("username", storage.getStorage("username"));
        postData.append("userId", storage.getStorage("userId"));
        postData.append("userImageUrl", storage.getStorage("imageUrl"));
        if (this.post.imageUrl != "") {
          postData.append("image", this.post.image);
          postData.append("imageUrl", this.post.image.name);
        }
        postData.append("content", this.post.content);
        //we put image and content of post in a FormData and check if it's not empty
        if (this.running == true) {
          return;
        }
        this.running = true;
        axios
          .post("http://localhost:3000/api/posts", postData, {
            // Verif token user in SessionStorage before posting
            headers: {
              Authorization: "Bearer " + storage.getStorage("token"),
            },
          })
          .then((response) => {
            if (response) {
              window.location.reload();
              this.running = true;
            }
          })
          .catch((error) => console.log(error));
        this.running = false;
      }
    },
    onImageChange(e) {
      //event to check for image upload to display preview
      this.post.image = e.target.files[0];
      this.post.imageUrl = URL.createObjectURL(this.post.image);
    },
  },
};
</script>

<style lang="scss" scoped>
#button-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
#new-post {
  display: flex;
  flex-direction: column;
  &:hover {
    cursor: pointer;
  }
  border: solid 1px;
  border-radius: 40px;
  width: 70%;
  margin: auto;
}
#preview {
  display: flex;
  justify-content: center;
  align-items: center;
}
#preview img {
  max-width: 100%;
  max-height: 500px;
  margin: 10px;
}
input {
  display: none;
}
label {
  padding: 7px 12px 8px;
  font-weight: 900;
  margin: 10px 10px;
  background: black;
  color: white;
  border-radius: 50%;
}
textarea {
  overflow: hidden;
  outline: none;
  padding: 0px 0px 80px;
  min-height: 100%;
  width: 80%;
  margin: -10px 10%;
  border: none;
  resize: none;
  &:hover {
    cursor: pointer;
  }
}
button {
  outline: none;
  width: 50px;
  height: 30px;
  color: white;
  background: black;
  border-radius: 50% 30%;
  border: 0px;
  &:hover {
    cursor: pointer;
  }
}
#poster {
  margin: 10px 10px;
}
.profile-picture {
  margin: 15px 0px 0px 15px;
}
</style>
