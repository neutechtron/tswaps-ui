<template>
  <div v-if="graphData.length > 0">
    <div class="text-h5 row q-my-md">Price of swap</div>
    <div class="row justify-center swapCard q-my-md inputCard">
      <!-- Daily-Weekly-Monthly Options radio buttons cntainer starts here -->
      <div class="options q-my-md justify-center row">
        <input
          v-model="timeSeries"
          type="radio"
          name="option"
          id="day"
          value="daily"
          checked="true"
        />
        <label class="option-label" for="day" checked>Daily</label>
        <span>|</span>
        <input
          v-model="timeSeries"
          type="radio"
          name="option"
          id="week"
          value="weekly"
        />
        <label class="option-label" for="week">Weekly</label>
        <span>|</span>
        <input
          v-model="timeSeries"
          type="radio"
          name="option"
          id="month"
          value="monthly"
        />
        <label class="option-label" for="month">Monthly</label>
      </div>
      <!-- Daily-Weekly-Monthly Options radio buttons cntainer ends here -->
      <GChart type="AreaChart" :options="options" :data="graphData" />
      <!-- <div v-if="!loaded" class="lds-dual-ring"></div>   -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import axios from 'axios';
import { GChart } from 'vue-google-charts/legacy';
import { processData } from 'src/utils/swap';

const debugModeOn = false;

export default {
  name: 'stockChart',
  components: {
    GChart,
  },
  data() {
    return {
      timeSeries: 'daily',
      graphData: [],
      currentServerTime: null,
      options: {
        width: 600,
        height: 500,
        backgroundColor: '#23195e',
        chartArea: {
          backgroundColor: '#23195e',
          left: 60,
          right: 20,
          top: 65,
          bottom: 55,
        },
        animation: {
          startup: 'true',
          duration: 500,
          easing: 'inAndOut',
        },
        focusTarget: 'category',
        color: 'red',
        is3D: true,
        colors: ['#2fd7fe'],
        vAxis: {
          gridlines: {
            count: 0,
          },
          textStyle: {
            color: '#e3def7',
          },
        },
        hAxis: {
          gridlines: {
            count: 0,
          },
          textStyle: {
            color: '#e3def7',
          },
          viewWindowMode: 'maximized',
          showTextEvery: 4,
        },
        legend: {
          maxLines: 2,
          position: 'top',
          textStyle: { color: 'white', fontSize: 16 },
        },
        explorer: {
          axis: 'horizontal',
          keepInBounds: 'true',
          maxZoomOut: 1,
        },
        dataOpacity: 0.3,
        title: 'Comparison',
        titleTextStyle: {
          color: 'white',
        },
      },
    };
  },
  computed: {
    ...mapGetters('swap', [
      'getFromToken',
      'getToToken',
      'getIsValidPair',
      'getPool',
    ]),
    fromTokenSymbol() {
      return this.getFromToken?.symbol;
    },
    toTokenSymbol() {
      return this.getToToken?.symbol;
    },
    fromAndToToken() {
      return `${this.getFromToken?.symbol}|${this.getToToken?.symbol}`;
    },
    graphHeaders() {
      return ['Time', `${this.fromTokenSymbol}\\${this.toTokenSymbol}`];
    },
  },
  methods: {
    getDateFormatGraph(date) {
      switch (this.timeSeries) {
        case 'daily':
          return moment.utc(date).format('MMM DD, HH:mm');
        default:
          return moment.utc(date).format('MMM DD, YYYY');
      }
    },
    pricePerToken() {
      const token0 = this.getPool.reserve0;
      const token1 = this.getPool.reserve1;
      if (token0.symbol === this.fromTokenSymbol) {
        return Number(
          parseFloat(token0.quantity / token1.quantity).toFixed(
            token0.precision
          )
        );
      }
      return Number(
        parseFloat(token1.quantity / token0.quantity).toFixed(token1.precision)
      );
    },
    async getServerTime() {
      try {
        const response = await axios.get(
          `${process.env.BACKEND_ENDPOINT}/?action=getCurrentTime`
        );
        const serverTime = response.data && response.data[0];
        if (serverTime) {
          debugModeOn && console.log('getServerTime', serverTime.CURRENTTIME);
          this.currentServerTime = new Date(serverTime.CURRENTTIME);
        }
      } catch (error) {
        console.error('Error connecting to Database', error);
      }
    },
    async fetchAndProcessGraphData() {
      if (!this.currentServerTime) {
        return;
      }
      try {
        const token0 = this.getPool.reserve0;
        const token1 = this.getPool.reserve1;
        const currentDate = this.currentServerTime.toISOString().split('T')[0];
        const response = await axios.get(
          `${process.env.BACKEND_ENDPOINT}/?action=getData&token1=${this.fromTokenSymbol}` +
            `&token2=${this.toTokenSymbol}` +
            `&timespan=${this.timeSeries}` +
            `&currentDate=${currentDate}`
        );
        debugModeOn && console.log('response', response.data);
        const processedData = processData(
          response.data,
          this.currentServerTime,
          this.fromTokenSymbol,
          this.pricePerToken(),
          this.timeSeries
        );
        debugModeOn && console.log('processedData', processedData);
        this.graphData = [this.graphHeaders];
        this.graphData.push(
          ...processedData.map((data) => [
            this.getDateFormatGraph(data[0]),
            // need to trim the float values to a level the graph can handle
            parseFloat(
              data[1].toPrecision(
                token0.symbol === this.fromTokenSymbol
                  ? token0.precision
                  : token1.precision
              )
            ),
          ])
        );
      } catch (error) {
        console.error('Error processing graph data', error);
      }
    },
  },
  watch: {
    fromAndToToken() {
      this.fetchAndProcessGraphData();
    },
    timeSeries(timeSeries) {
      if (timeSeries == 'daily') {
        this.options.hAxis.showTextEvery = 4;
      } else if (timeSeries == 'weekly') {
        this.options.hAxis.showTextEvery = 2;
      } else if (timeSeries == 'monthly') {
        this.options.hAxis.showTextEvery = 5;
      }
      this.fetchAndProcessGraphData();
    },
  },
  async mounted() {
    await this.getServerTime();
    await this.fetchAndProcessGraphData();
  },
};
</script>

<style scoped>
.options {
  position: relative;
  width: 300px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid grey;
  border-radius: 20px;
  padding: 10px 20px;
}
.option-label {
  width: 60px;
  text-align: center;
}
input {
  display: none;
}
input:checked + label {
  font-weight: bold;
}
label {
  cursor: pointer;
}
</style>
