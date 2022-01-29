<template>
  <div class="tg-container">
    <div class="contact-us q-mb-xl q-mt-lg">CONTACT US</div>
    <div class="tg-icon-container">
      <img src="~assets/home/home-tg-icon.svg" />
    </div>
    <div class="flex justify-center">
      <div class="text-h1 tg-title">
        If you have a question or would like more information please join our
        <a class="tg-title-link" :href="tgLink" target="_blank">
          Telegram channel
        </a>
      </div>
    </div>
    <div class="text-center q-mt-xl">c 2022 T-Swaps</div>
  </div>
</template>

<script>
export default {
  data() {
    return { tgLink: "https://t.me/tswaps" };
  }
};
</script>

<style lang="scss" scoped>
.tg-container {
  padding: 2rem 0.8rem;
  // padding-bottom: 4rem;
  background-image: linear-gradient(
    to bottom,
    rgb(35, 41, 95) 20%,
    rgb(38, 57, 113) 80%
  );
  // background: rgb(36, 39, 87);

  .tg-icon-container {
    img {
      width: 10rem;
    }
    text-align: center;
    // height: 5rem;
  }
  .contact-us {
    text-align: center;
  }

  .tg-title {
    font-family: "silkalight";
    text-align: center;
    flex-basis: 1200px;
    .tg-title-link {
      color: $purpleBright;
    }
  }
}
</style>
