<template>
  <div>
    <!-- Daily-Weekly-Monthly Options radio buttons cntainer starts here -->
    <div class="options q-my-md justify-center row ">
      <input
        v-model="timeSeries"
        type="radio"
        name="option"
        id="daily"
        value="day"
        checked
      />
      <label class="option-label" for="daily" checked>Daily</label>
      <span>|</span>
      <input
        v-model="timeSeries"
        type="radio"
        name="option"
        id="weekly"
        value="week"
      />
      <label class="option-label" for="weekly">Weekly</label>
      <span>|</span>
      <input
        v-model="timeSeries"
        type="radio"
        name="option"
        id="monthly"
        value="month"
      />
      <label class="option-label" for="monthly">Monthly</label>
    </div>
    <!-- Daily-Weekly-Monthly Options radio buttons cntainer ends here -->
    <GChart
      type="AreaChart"
      :options="options"
      :data="collectionData"
    />  
    <!-- <div v-if="!loaded" class="lds-dual-ring"></div>   -->
  </div>
   
</template>
 
<script>
import { GChart } from "vue-google-charts/legacy";
import { day } from "./stock-data";
import { week } from "./stock-data";
import { month } from "./stock-data";
export default {
  name: "stockChart",
  components: {
    GChart
  },
  data() {
    return {
      // if (timeSeries == "day"){
      // collectionData: day.map((val) => [val.x, val.close])
      // },
      collectionData: month.map((val) => [val.x, val.close]),
      options: {
        chart: {
          title: "Price chart",
          subtitle: ""
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
        color: 'red',
        //is3D: true,
        colors:['#2fd7fe'],
        vAxis:{
          gridlines:{
            count: 0
          },
          textStyle:{
            color: '#e3def7'
          },
            format: 'currency',
          
        },
        hAxis:{
          gridlines:{
            count: 0
          },
          textStyle:{
            color: '#e3def7'
          },
          
        },
        legend: 'none',
        explorer: {
          axis: 'horizontal',
          keepInBounds: true,
        },
        title: 'Nou ja',
        titleTextStyle: {
          color: "white",
        }
      }
    };
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