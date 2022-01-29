<template>
  <div class="benefits-page-container">
    <div class="text-h1 ">
      Your preferred swaps tool
    </div>
    <div class="benefits-wrapper">
      <div class="benefits-container ">
        <div class="benefit-item">
          <div class="benefits-icon">
            <img src="~assets/home/home-bolt.svg" />
          </div>
          <div class="text-h2">Fast & Affordable</div>
          <p class="benefits-description">
            Battle tested 10 000 transactions per second. No gas fees on Telos
            Native.
          </p>
        </div>
        <div class="benefit-item">
          <div class="benefits-icon">
            <img src="~assets/home/home-hand.svg" />
          </div>
          <div class="text-h2">Easy to use</div>
          <p class="benefits-description">
            A trading platform that anyone can use.
          </p>
        </div>
        <div class="benefit-item">
          <div class="benefits-icon">
            <img src="~assets/home/home-droplet.svg" />
          </div>
          <div class="text-h2">Liquidity pools</div>
          <p class="benefits-description">
            Our pools have the most liquidity on Telos native.
          </p>
        </div>
        <div class="benefit-item">
          <div class="benefits-icon">
            <img src="~assets/home/home-coins.svg" />
          </div>
          <div class="text-h2">Self-listing</div>
          <p class="benefits-description">
            You can list any native Telos token pair.
          </p>
        </div>
        <div class="benefit-item">
          <div class="benefits-icon">
            <img src="~assets/home/home-triangles.svg" />
          </div>
          <div class="text-h2">Eco-Friendly</div>
          <p class="benefits-description">
            Runs on the most energy efficient blockchain.
          </p>
        </div>
        <div class="benefit-item">
          <div class="benefits-icon">
            <img src="~assets/home/home-connect.svg" />
          </div>
          <div class="text-h2">Curve Pools</div>
          <p class="benefits-description">
            Choose between the Bancor (Uniswap) or Curve algorithm during pool
            creation.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.benefits-page-container {
  // display: flex;
  // flex-direction: column;
  // min-height: 100vh;

  padding: 5rem 0.8rem;
  // padding-bottom: 100px;
  background-image: linear-gradient(
    to bottom,
    rgb(36, 39, 87) 20%,
    rgb(38, 57, 113) 80%
  );

  // .text-h1 {
  //   flex-basis: 200px;
  // }
  .benefits-wrapper {
    display: flex;
    width: 100%;
    justify-content: center;
  }
  .benefits-container {
    flex-basis: 1200px;
    display: grid;
    grid-gap: 2rem;
    align-items: stretch;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-template-rows: min-content;

    .text-h2 {
      padding-bottom: 0.5rem;
    }
    .benefit-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .benefits-icon {
      width: 5rem;
      height: 6rem;
    }

    .benefits-description {
      font-family: "silkathin";
      font-size: 1rem;
      line-height: 1.5rem;
      text-align: center;
      max-width: 35ch;
    }
  }
}
</style>
