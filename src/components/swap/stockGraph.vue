<template>
  <div>
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
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import axios from 'axios';
import { GChart } from 'vue-google-charts/legacy';
import { day } from './stock-data';
import { week } from './stock-data';
import { month } from './stock-data';
import { processData } from 'src/utils/swap';
import { GRAPH_NUMBER_PRECISION } from 'src/constants/constants';

export default {
  name: 'stockChart',
  components: {
    GChart,
  },
  data() {
    return {
      timeSeries: 'daily',
      graphData: [],
      options: {
        chart: {
          title: 'Price chart',
          subtitle: '',
        },
        width: 600,
        height: 500,
        backgroundColor: '#23195e',
        chartArea: {
          backgroundColor: '#23195e',
          left: 60,
          right: 20,
          top: 50,
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
          format: 'currency',
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
        legend: 'none',
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
    ...mapGetters('swap', ['getFromToken', 'getToToken', 'getIsValidPair']),
    fromTokenSymbol() {
      return this.getFromToken?.symbol;
    },
    toTokenSymbol() {
      return this.getToToken?.symbol;
    },
    currentServerTime() {
      return new Date(
        '2022-07-29T06:31:00.000Z'.substring(0, 13) + ':00:00.000Z'
      ); // Get the start of the hour
    },
    fromAndToToken() {
      return `${this.getFromToken?.symbol}|${this.getToToken?.symbol}`;
    },
    graphHeaders() {
      return ['Time', `${this.fromTokenSymbol}\\${this.toTokenSymbol}`];
    },
  },
  methods: {
    async fetchAndProcessGraphData() {
      const currentDate = this.currentServerTime.toISOString().split('T')[0];
      const response = await axios.get(
        `${process.env.BACKEND_ENDPOINT}/?token1=${this.fromTokenSymbol}&token2=${this.toTokenSymbol}&timespan=${this.timeSeries}&currentDate=${currentDate}`
      );
      console.log('response', response.data);
      const processedData = processData(
        response.data,
        this.currentServerTime,
        this.fromTokenSymbol
      );
      console.log('processedData', processedData);
      this.graphData = [this.graphHeaders];
      this.graphData.push(
        ...processedData.map((data) => [
          moment.utc(data[0]).format('MM-DD HH:mm A'),
          parseFloat(data[1].toPrecision(GRAPH_NUMBER_PRECISION)),
        ])
      );
    },
  },
  watch: {
    fromAndToToken() {
      this.fetchAndProcessGraphData();
    },
    options() {
      if (timeSeries == 'daily') {
        console.log('day data');
        this.options.hAxis.showTextEvery = 4;
      } else if (timeSeries == 'weekly') {
        console.log('week data');
        this.options.hAxis.showTextEvery = 2;
      } else if (timeSeries == 'monthly') {
        console.log('month data');
        this.options.hAxis.format = 'MMM d, y';
        this.options.hAxis.showTextEvery = 3;
      }
    },
  },
  mounted() {
    this.fetchAndProcessGraphData();
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
