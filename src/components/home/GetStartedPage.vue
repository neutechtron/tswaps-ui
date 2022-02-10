<template>
  <div class="start-page-container">
    <div class="text-h1">Ready to get started?</div>
    <div class="step-by-step q-mb-lg">STEP-BY-STEP GUIDE</div>
    <div class="steps-wrapper q-mb-xl">
      <div class="step-container">
        <div class="step-badge">
          <img src="~assets/home/home-icon-shape.svg" />
          <div class="step-number">1</div>
        </div>
        <div class="step-text-container">
          <div class="step-title">Create a Telos Account</div>
          <a
            class="step-subtitle"
            target="”_blank”"
            href="https://www.telos.net/signup"
            >How-to Guide</a
          >
        </div>
      </div>
      <div class="step-container">
        <div class="step-badge">
          <img src="~assets/home/home-icon-shape.svg" />
          <div class="step-number">2</div>
        </div>
        <div class="step-text-container">
          <div class="step-title">Connect your Wallet</div>
          <a
            class="step-subtitle"
            target="”_blank”"
            href="https://www.telos.net/#getting-started"
            >How-to Guide</a
          >
        </div>
      </div>
      <div class="step-container">
        <div class="step-badge">
          <img src="~assets/home/home-icon-shape.svg" />
          <div class="step-number">3</div>
        </div>
        <div class="step-text-container">
          <div class="step-title">Get Telos native tokens</div>
          <a
            class="step-subtitle"
            target="”_blank”"
            href="https://help.telos.net/en_US/getting-started/how-to-buy-tlos"
            >How-to Guide</a
          >
        </div>
      </div>
    </div>
    <div class="row justify-center">
      <q-btn to="/swap" no-caps class="sendBtn" label="Launch App" />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.start-page-container {
  padding: 2rem 0.8rem;
  padding-bottom: 4rem;
  background: rgb(57, 34, 102);

  .step-by-step {
    text-align: center;
  }
  .sendBtn {
    flex-basis: 160px;
  }
  .steps-wrapper {
    // flex-basis: 800px;
    display: grid;
    justify-content: center;
    // grid-gap: 1rem;

    .step-container {
      display: flex;
      align-items: center;
      // flex-basis: 800px;
      .step-badge {
        position: relative;
        width: 7rem;
        height: 7rem;
        img {
          position: absolute;
          z-index: 0;
          width: 7rem;
          height: 7rem;
          // margin-bottom: -5rem;
          // margin-right: -5rem;
        }
        .step-number {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5rem;
          color: $blueLight;
        }
      }

      .step-text-container {
        padding-left: 0.8rem;
        .step-title {
          font-size: 1.3rem;

          // font-weight: 700;
        }
        .step-subtitle {
          font-size: 1rem;
          font-family: "silkathin";
          // cursor: pointer;
          padding-left: 0.5rem;
          // color: $blueLight;
        }
      }
    }
  }
}
</style>
