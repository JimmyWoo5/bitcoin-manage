<template>
  <div id='chart'>
    <div ref='chart' style='height:500px;margin-top: 40px;'></div>
  </div>
</template>

<script>
import data from '@/json/chart'
console.log(data)

// 使用刚指定的配置项和数据显示图表。

export default {
  data () {
    return {
      option: {
        backgroundColor: '#2c343c',
        textStyle: {
          color: '#fff'
        },
        title: {
          text: 'K线图',
          left: 0,
          textStyle: {
            color: '#fff'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        legend: {
          data: ['MA5', 'MA10', 'MA60'],
          textStyle: {
            color: '#fff'
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: [], // 时间
          scale: true,
          boundaryGap: false,
          axisLine: {onZero: false},
          splitLine: {show: false},
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          scale: true
        },
        dataZoom: [{
          type: 'inside',
          start: 95,
          end: 100
        }, {
          show: true,
          type: 'slider',
          y: '90%',
          start: 50,
          end: 100
        }],
        series: [{
          name: 'MA5',
          type: 'line',
          data: [],
          smooth: true,
          color: '#fff'
        }, {
          name: 'MA10',
          type: 'line',
          data: [],
          smooth: true,
          color: '#ff0',
          lineStyle: {
            normal: {opacity: 0.5}
          }
        }, {
          name: 'MA60',
          type: 'line',
          data: [],
          smooth: true,
          color: '#f00',
          lineStyle: {
            normal: {opacity: 0.5}
          }
        }]
      }
    }
  },
  mounted () {
    this.option.series[0].data = data.data.ma5.map(i => { return i.money })
    this.option.series[1].data = data.data.ma10.map(i => { return i.money })
    this.option.series[2].data = data.data.ma60.map(i => { return i.money })
    this.option.xAxis.data = data.data.time.map(i => { return this.moment(i).format('YYYY-MM-DD HH:mm') })
    var charts = this.$echarts.init(this.$refs.chart)
    charts.setOption(this.option)
  }
}
</script>

<style lang='less'>
</style>
