<template>
  <div id="auto-fill">
    <el-row style='margin: 50px 0;'>
      <el-col :span='8'><h1 style='font-size: 30px;'>自动填补流动性</h1></el-col>
      <el-col :span='16' class='currency-type'>
        <span :class='i.class' @click='onCurrencyClick(i)' v-for='(i, n) in currencys' :key='n'>{{i.name}}</span>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span='8'>
        <el-form :model="form" :rules='rules' ref="form" label-width='150px' :show-message='false' class='form'>
          <el-form-item label="允许无交易时间" prop='noTradeTime'>
            <el-row>
              <el-col :span='16'>
                <el-input type='number' v-model.number="form.noTradeTime"></el-input>
              </el-col>
              <el-col :span='7' :offset='1'>分钟</el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="下单回填时间" prop='backfillTime'>
            <el-col :span='16'>
              <el-input type='number' v-model.number="form.backfillTime"></el-input>
            </el-col>
            <el-col :span='7' :offset='1'>分钟</el-col>
          </el-form-item>
          <el-form-item label="单笔金额上限" prop='upperLimit'>
            <el-col :span='16'>
              <el-input type='number' v-model.number="form.upperLimit"></el-input>
            </el-col>
            <el-col :span='7' :offset='1'>{{activeCurrency.name}}</el-col>
          </el-form-item>
          <el-form-item label="单笔金额下限" prop='lowerLimit'>
            <el-col :span='16'>
              <el-input type='number' v-model.number="form.lowerLimit"></el-input>
            </el-col>
            <el-col :span='7' :offset='1'>{{activeCurrency.name}}</el-col>
          </el-form-item>
          <el-form-item label="总交易额度" prop='total'>
            <el-col :span='16'>
              <el-input type='number' v-model.number="form.total"></el-input>
            </el-col>
            <el-col :span='7' :offset='1'>{{activeCurrency.name}}</el-col>
          </el-form-item>
          <el-form-item>
            <el-button style='width:100px' :loading='btnLoading' @click="submit">{{activeCurrency.runStatus === 1 ? '停止' : '开始'}}</el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span='14' :offset='2'>
        <el-table border :data="tableData">
          <el-table-column label="类型" min-width='66' v-loading='tableLoading'>
            <template slot-scope='scope'>
              <span class='red' v-if="scope.row.type==='sell'">买</span>
              <span class='green' v-else>卖</span>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="时间" min-width='175'></el-table-column>
          <el-table-column prop="price" label="价格" min-width='125'></el-table-column>
          <el-table-column prop="amount" label="数量" min-width='125'></el-table-column>
          <el-table-column prop="trade_amount" label="成交量" min-width='115'></el-table-column>
          <el-table-column label='' min-width='65'>
            <template slot-scope="scope">
              <el-button v-if='scope.row.trade_status===0||scope.row.trade_status===1' type='text' @click='revoke(scope.row.order_id)'>撤单</el-button>
              <span v-else-if='scope.row.trade_status===-1'>已撤销</span>
              <span v-else-if='scope.row.trade_status===0'>未成交</span>
              <span v-else-if='scope.row.trade_status===2'>完全成交</span>
              <span v-else-if='scope.row.trade_status===3'>撤单处理中</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

  </div>
</template>

<script>
export default {
  data () {
    return {
      tableLoading: false,
      activeCurrency: {},
      btnLoading: false,
      currencys: [],
      form: {
        noTradeTime: '', // 无交易时间
        backfillTime: '', // 回填时间
        upperLimit: '', // 金额上限
        lowerLimit: '', // 下限
        total: '' // 总额度
      },
      rules: {
        noTradeTime: [{required: true}],
        backfillTime: [{required: true}],
        upperLimit: [{required: true}],
        lowerLimit: [{required: true}],
        total: [{required: true}]
      },
      tableData: []
    }
  },
  methods: {
    getCurrencys () {
      this.$ajax({
        url: '/autotrade/coin',
        done: ({data}) => {
          data = data || []
          data.forEach(i => {
            i.name = i.coin + '/' + i.symbol
            i.class = ''
          })
          this.currencys = data
          this.onCurrencyClick(data[0])
        }
      })
    },
    getOrders (id) {
      this.tableLoading = true
      this.$ajax({
        url: '/autotrade/order',
        params: {
          id: id
        },
        done: ({data}) => {
          data = data || []
          data.forEach(i => {
            i.time = this.moment(i.trade_time).format('YYYY.MM.DD HH:mm:ss')
          })
          this.tableData = data
        },
        always: () => {
          this.tableLoading = false
        }
      })
    },
    onCurrencyClick (item) {
      if (this.activeCurrency.id !== item.id) { // 为当前时，不执行
        this.getOrders(item.id) // 切换币种时获取列表

        this.currencys.forEach(i => { i.class = '' }) // 样式切换
        item.class = 'red'

        this.activeCurrency = item // 更新当前选中币种
        this.form = { // 更新表单数据
          noTradeTime: item.allowNotTrade, // 无交易时间
          backfillTime: item.orderBack, // 回填时间
          upperLimit: item.singleMoneyUpper, // 金额上限
          lowerLimit: item.singleMoneyLower, // 下限
          total: item.totalMoney // 总额度
        }
      }
    },
    revoke (id) {
      this.$confirm('确定撤销该订单？', '提醒信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.tableLoading = true
        this.$ajax({
          url: '/trade/order/cancel',
          method: 'post',
          params: {order_id: id},
          done: () => {
            this.$message.success('撤销成功')
            this.getOrders()
          },
          fail: () => {
            this.$message.error('撤销失败')
          },
          always: () => {
            this.tableLoading = false
          }
        })
      }).catch(() => { })
    },
    submit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.btnLoading = true
          this.$ajax({
            url: '/autotrade/status',
            method: 'post',
            data: {
              id: this.activeCurrency.id,
              allowNotTrade: this.form.noTradeTime,
              orderBack: this.form.backfillTime,
              singleMoneyUpper: this.form.upperLimit,
              singleMoneyLower: this.form.lowerLimit,
              totalMoney: this.form.total,
              runStatus: this.activeCurrency.runStatus === 1 ? 2 : 1 // 状态值为当前状态相反 1运行，2停止
            },
            done: ({data}) => {
              data = data || []
              this.tableData = data
              this.currencys.forEach(i => {
                if (i.id === this.activeCurrency.id) { // 定位数组中当前选中元素
                  i.runStatus = i.runStatus === 1 ? 2 : 1 // 改变元素状态值为想法
                }
              })
              this.$message.success('操作成功')
            },
            always: () => {
              this.btnLoading = false
            }
          })
        }
      })
    }
  },
  mounted () {
    this.getCurrencys()
  }
}
</script>

<style lang="less">
  @import '~@/less/varibles';
  #auto-fill{
    .currency-type{
      font-size: 24px;
      span{
        margin-right: 20px;cursor: pointer;
        &:hover{color: @red;}
      }
    }
    .form .el-input__inner{text-align: right;}
  }
</style>
