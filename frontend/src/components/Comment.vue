<template>
  <div class="comment" :id="comment._id">
    <figure class="comment-user-info">
      <div id="info-container">
        <img
          class="profile-picture"
          :src="comment.userImageUrl"
          :alt="'Photo de profil de ' + comment.username"
        />
        <figcaption>
          {{ comment.username }}<br />
          <span class="date">{{ comment.createdAt }}</span>
        </figcaption>
      </div>
      <div class="reacts">
        <button
          class="dropdown-button"
          :id="'edit-btn-comment ' + this.post._id"
          @click="showPostMenu"
        >
          <p>.</p>
          <p>.</p>
          <p>.</p>
        </button>
        <div :id="'edit-menu-comment ' + this.post._id" class="dropdown-content">
          <button @click="editPost">Modifier</button>
          <button @click="deletePost">Supprimer</button>
          <button id="cancel-btn" @click="hidePostMenu">Annuler</button>
        </div>
        <span v-if="comment.likes" class="likes">{{ comment.likes }} </span>
        <span v-if="comment.dislikes" class="dislikes">{{
          comment.dislikes
        }}</span>
      </div>
    </figure>
    <div class="comment-content">
      <p v-if="comment.content != 'null'">{{ comment.content }}</p>
      <div v-if="comment.imageUrl != 'http://localhost:3000/images/undefined'">
        <img :src="comment.imageUrl" :alt="'Image du commentaire'" />
      </div>
    </div>
    <div id="react">
      <p
        @click="addCommentReact('chooseReact' + comment._id)"
        class="chooseReact"
        :id="'chooseReact' + comment._id"
      >
        Réagir
      </p>
      <p @click="reply">Répondre</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as storage from "../modules/storage";
export default {
  name: "Comment",
  data() {
    return {};
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
    post: {
      type: Object,
      required: true,
    },
  },
  methods: {
    showPostMenu() {
      document.getElementById("edit-menu-comment " + this.post._id).style.display =
        "flex";
    },
    hidePostMenu() {
      document.getElementById("edit-menu-comment " + this.post._id).style.display =
        "none";
    },
    addCommentReact(id) {
      const reactData = {
        like: "",
        userId: storage.getStorage("userId"),
      };
      if (
        Math.round(
          (parseInt(document.getElementById(id).style.backgroundPositionX) *
            -1) /
            document.getElementById(id).offsetWidth
        ) == 1
      ) {
        reactData.like = -1;
      } else {
        reactData.like = 1;
      }
      if (this.running == true) {
        return;
      }
      //this.running = true;
      console.log(
        "http://localhost:3000/api/posts/" +
          this.post._id +
          "/" +
          this.comment._id +
          "/react"
      );
      axios
        .post(
          "http://localhost:3000/api/posts/" +
            this.post._id +
            "/" +
            this.comment._id +
            "/react",
          reactData,
          {
            // Verif token user in SessionStorage before posting
            headers: {
              Authorization: "Bearer " + storage.getStorage("token"),
            },
          }
        )
        .then((response) => {
          if (response) {
            if (response.data.message.includes("Dislike ajouté")) {
              document
                .getElementById(id)
                .classList.remove("reactLike", "chooseReact");
              document.getElementById(id).classList.add("reactDislike");
            }
            if (response.data.message.includes("Like ajouté")) {
              document
                .getElementById(id)
                .classList.remove("reactDislike", "chooseReact");
              document.getElementById(id).classList.add("reactLike");
            }
            if (response.data.message.includes("retiré")) {
              document
                .getElementById(id)
                .classList.remove("reactLike", "reactDislike");
            }
            this.running = false;
          }
        })
        .catch((error) => console.log(error));
    },
  },
  mounted() {
    const comments = document.getElementsByClassName("post");
    comments.forEach(() => {
      if (storage.getStorage("userId") != this.comment.userId) {
        document.getElementById(
          "edit-btn-comment " + this.comment._id
        ).style.visibility = "hidden";
      }
    });
    const elements = document.getElementsByClassName("chooseReact");
    elements.forEach(() => {
      if (this.comment.usersDisliked.includes(storage.getStorage("userId"))) {
        document
          .getElementById("chooseReact" + this.comment._id)
          .classList.add("reactDislike");
      }
      if (this.comment.usersLiked.includes(storage.getStorage("userId"))) {
        document
          .getElementById("chooseReact" + this.comment._id)
          .classList.add("reactLike");
      }
    });
    elements.forEach((el) =>
      el.addEventListener("mousemove", (e) => {
        event.target.style.backgroundPositionX = -e.offsetX + "px";
        event.target.classList.add("chooseReact");
      })
    );
  },
};
</script>
<style lang="scss" scoped>
.dropdown-button {
  outline: none;
  border: none;
  background: transparent;
  margin: 60px 0px;
  position: absolute;
  border-radius: 50px;
  padding: 0px 15px 8px;
  & p {
    font-size: 30px;
    line-height: 0%;
    margin: 0px 0px 8px;
  }
}
.dropdown {
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  margin: 0px 20px;
}
#cancel-btn {
  border: transparent;
}
.dropdown-content {
  position: absolute;
  display: none;
  flex-direction: column;
  width: 100px;
  margin: 60px 0px;
  border: 1px solid;
  border-radius: 20px;
  background: white;
  overflow: hidden;
  & button {
    padding: 5px;
    outline: none;
    background: transparent;
    border: none;
    border-bottom: dashed 1px;
  }
}
.chooseReact:hover {
  background: linear-gradient(to left, #f2ccf2 50%, #ccf2cc 50%);
  background-size: 200%;
}
.reactLike {
  background: #ccf2cc;
}
.reactDislike {
  background: #f2ccf2;
}
#info-container {
  display: flex;
}
.reacts {
  display: flex;
  flex-direction: column;
}
.likes,
.dislikes {
  position: absolute;
  margin-left: 5px;
  padding: 5px 10px;
  border-radius: 50%;
}
.likes {
  background: #ccf2cc;
}
.dislikes {
  background: #f2ccf2;
  margin-top: 30px;
}
.newcomment {
  display: flex;
  justify-content: space-around;
  display: none;
  padding: 5px 0px 20px;
}
input {
  width: 80%;
  border-radius: 50px;
  padding: 10px;
  outline: none;
}
.comment {
  border: dashed 1px #bbbbbb;
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 30px auto;
  background: #fcfcfc;
  border-radius: 50px;
}
.comment-user-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 10px 20px;
}
.comment-content {
  margin: -10px 50px;
  & img {
    width: 100%;
    margin: 10px 0px;
  }
}
figcaption {
  min-width: fit-content;
  margin: 5px;
}
#react {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin: 10px 100px;
  border-top: solid 1px;
  & p {
    width: 48%;
    text-align: center;
    padding: 15px 0px;
    border: solid #bbbbbb;
    cursor: pointer;
    border-width: 0px 1px 1px 1px;
  }
}
.date {
  color: #b2b2b2;
  font-size: 12px;
}
</style>