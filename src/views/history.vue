<template>
  <div id="history">
    <h1>历史数据</h1>
    <el-row>
      <el-col :span='11'>

        <h2>未成交</h2>
        <el-table :data="undone" v-loading='undoneLoading'>
          <el-table-column prop="time" label="时间" min-width='175'></el-table-column>
          <el-table-column prop="price" label="价格" min-width='125'></el-table-column>
          <el-table-column prop="amount" label="数量"></el-table-column>
          <el-table-column prop="deal_amount" label="成交量" min-width='115'></el-table-column>
          <el-table-column label='操作' min-width='65'>
            <template slot-scope="scope">
              <el-button type='text' @click='revoke(scope.row)'>撤单</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-show='total1'
          layout="prev, pager, next"
          :page-size='10'
          :total="total1"
          :current-page="currentPage1"
          @current-change="handleCurrentChange1">
        </el-pagination>

      </el-col>

      <el-col :span='12' :offset='1'>

        <el-row>
          <el-col :span='4'>
            <h2>已成交</h2>
          </el-col>
          <!--<el-col :span='20'>
            <span>从 </span><el-date-picker @change='onStartDateChange' type="date" v-model='startDate' placeholder="结束日期"></el-date-picker>
            <span> 至 </span><el-date-picker type="date" :picker-options="dateOptions" v-model='endDate' placeholder="结束日期"></el-date-picker>
            <el-button @click='getDone'>search</el-button>
          </el-col>-->
        </el-row>
        <el-table :data="done" v-loading='doneLoading'>
          <el-table-column prop="time" label="时间" min-width='175'></el-table-column>
          <el-table-column prop="price" label="价格" min-width='125'></el-table-column>
          <el-table-column prop="amount" label="数量"></el-table-column>
          <el-table-column prop="deal_amount" label="成交量" min-width='115'></el-table-column>
        </el-table>

        <el-pagination
          v-show='total2'
          layout="prev, pager, next"
          :page-size='10'
          :total="total2"
          :current-page="currentPage2"
          @current-change="handleCurrentChange2">
        </el-pagination>

      </el-col>

    </el-row>
    <div class='link'>
      <el-button type='text' @click="$router.push('/')">返回首页</el-button>
      <el-button type='text' @click="$router.push('/chart')">查看图表</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      undoneLoading: false,
      doneLoading: false,
      currentPage1: 1,
      currentPage2: 1,
      total1: 0,
      total2: 0,
      undone: [],
      done: [],
      startDate: '',
      endDate: '',
      dateOptions: {}
    }
  },
  methods: {
    getUndone () {
      this.undoneLoading = true
      this.$ajax({
        url: '/trade/order/list',
        params: {
          page: this.currentPage1,
          status: 0
        },
        done: ({data = {}}) => {
          this.undone = data.orders || []
          this.undone.forEach(i => {
            i.time = this.moment(i.create_date).format('YYYY.MM.DD HH:mm:ss')
          })
          this.total1 = data.total
        },
        always: () => {
        //        this.undone = [{time: '2017-03-03 33:22:33', price: 0.999999999, amount: 2323, deal_amount: 0.99999999}]
          this.undoneLoading = false
        }
      })
    },
    getDone () {
      this.doneLoading = true
      this.$ajax({
        url: '/trade/order/list',
        params: {
          page: this.currentPage2,
          status: 1
          //        start_date: this.moment(this.startDate || Date.now()).format('YYYYMMDD'),
          //        end_date: this.moment(this.endDate || Date.now()).format('YYYYMMDD')
        },
        done: ({data = {}}) => {
          this.done = data.orders || []
          this.done.forEach(i => {
            i.time = this.moment(i.create_date).format('YYYY.MM.DD HH:mm:ss')
          })
          this.total2 = data.total
        },
        always: () => {
          //        this.done = [{time: '2017-03-03 33:22:33', price: 0.999999999, amount: 2323, deal_amount: 0.99999999}]
          this.doneLoading = false
        }
      })
    },
    handleCurrentChange1 (page) {
      this.currentPage1 = page
      this.getUndone()
    },
    handleCurrentChange2 (page) {
      this.currentPage2 = page
      this.getDone()
    },
    revoke (item) {
      this.$confirm('确定撤销该订单？', '提醒信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.undoneLoading = true
        this.$ajax({
          url: '/trade/order/cancel',
          method: 'post',
          params: {order_id: item.order_id},
          done: () => {
            this.$message.success('撤销成功')
            this.undone.splice(this.undone.indexOf(item), 1)
            this.getDone()
          },
          fail: () => {
            this.$message.error('撤销失败')
          },
          always: () => {
            this.undoneLoading = false
          }
        })
      }).catch(() => { })
    },
    onStartDateChange () {
      //    var vue = this
      //    if (this.startDate > this.endDate) {
      //     // this.endDate = ''
      //    }
      //    this.dateOptions = {
      //      disabledDate (time) {
      //        return time < vue.startDate
      //      }
      //    }
    }
  },
  mounted () {
    this.getUndone()
    this.getDone()
  }
}
</script>

<style lang="less">
  #history{
    position: relative;padding: 10px;
    h1{font-size: 42px;line-height: 42px;margin-bottom:30px;}
    h2{font-size: 30px;line-height: 30px;height: 46px;}

    .link{position: absolute;right: 10px;top:0;}
  }
</style>
