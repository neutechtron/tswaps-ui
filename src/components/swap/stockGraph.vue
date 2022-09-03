<template>
  <div>
    <!-- Daily-Weekly-Monthly Options radio buttons cntainer starts here -->
    <div class="options q-my-md justify-center row">
      <input
        v-model="timeSeries"
        type="radio"
        name="option"
        id="day"
        value="day"
        checked="true"
      />
      <label class="option-label" for="day" checked>Daily</label>
      <span>|</span>
      <input
        v-model="timeSeries"
        type="radio"
        name="option"
        id="week"
        value="week"
      />
      <label class="option-label" for="week">Weekly</label>
      <span>|</span>
      <input
        v-model="timeSeries"
        type="radio"
        name="option"
        id="month"
        value="month"
      />
      <label class="option-label" for="month">Monthly</label>
    </div>
    <!-- Daily-Weekly-Monthly Options radio buttons cntainer ends here -->
    <GChart type="AreaChart" :options="options" :data="graphData(timeSeries)" />
    <!-- <div v-if="!loaded" class="lds-dual-ring"></div>   -->
  </div>
</template>

<script>
import { GChart } from 'vue-google-charts/legacy';
import { day } from './stock-data';
import { week } from './stock-data';
import { month } from './stock-data';
import { Dark } from 'quasar';
export default {
  name: 'stockChart',
  components: {
    GChart,
  },
  data() {
    return {
      timeSeries: 'day',
      dayData: day.map((val) => [val.x, val.close]),
      weekData: week.map((val) => [val.x, val.close]),
      monthData: month.map((val) => [val.x, val.close]),
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
  methods: {
    graphData(timeSeries) {
      if (timeSeries == 'day') {
        console.log('day data'), (this.options.hAxis.showTextEvery = 4);
        return this.dayData;
      }
      if (timeSeries == 'week') {
        console.log('week data');
        this.options.hAxis.format = 'MMM d, y';
        this.options.hAxis.showTextEvery = 2;
        return this.weekData;
      }
      if (timeSeries == 'month') {
        console.log('month data');
        this.options.hAxis.format = 'MMM d, y';
        this.options.hAxis.showTextEvery = 3;
        return this.monthData;
      }
    },
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
