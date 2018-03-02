<template>
  <div id='buy'>
    <el-row>

<!------------------------------------成交历史---------------------------------->

      <el-col :span='4'>
        <div class="title">成交历史</div>
        <div v-bar="{observerThrottle: 1000}" style="height: 496px;" v-loading='historyLoading'>
          <div class='bannerBox'>
            <div class='wrapper'>
              <el-row v-for='(i, n) in history' :key='n'>
                <el-col :span='13' :class="i.type=='sell'?'green':'red'">{{i.price}}</el-col>
                <el-col :span='11' :class="i.amount>500?'red':''">{{i.amount}}</el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span='4' :offset='1'>

        <el-row class="title">
          <el-col :span='11'>卖</el-col>
          <el-col :span='13'>总量 {{soldAmount.toFixed(3)}}</el-col>
        </el-row>
        <div v-bar style='height: 228px;' v-loading='depthLoading'>
          <div ref='sellBannerBox' class='bannerBox' >
            <div class='wrapper'>
              <el-row v-for='(i, n) in depth.asks' :key='n'>
                <el-col :span='12'><span style='cursor: pointer;' @click='onPriceClick(i[0])'>{{i[0]}}</span></el-col>
                <el-col :span='12' :class="i[1]>500?'red':''">{{i[1]}}</el-col>
              </el-row>
            </div>
          </div>

        </div>

        <div class='diff-price'>价差 <span class='red' style='cursor: pointer;' @click='onDiffPriceClick'>{{diffPrice}}</span></div>
        <div v-bar style='height: 228px;' v-loading='depthLoading'>
          <div class='bannerBox'>
            <div class="wrapper">
              <el-row v-for='(i, n) in depth.bids' :key='n'>
                <el-col :span='13'><span style='cursor: pointer;' @click='onPriceClick(i[0])'>{{i[0]}}</span></el-col>
                <el-col :span='11' :class="i[1]>500?'red':''">{{i[1]}}</el-col>
              </el-row>
            </div>
          </div>
        </div>
        <el-row class="title">
          <el-col :span='11'>买</el-col>
          <el-col :span='13'>总量 {{boughtAmount.toFixed(3)}}</el-col>
        </el-row>

      </el-col>

<!------------------------------------打散下单---------------------------------->

      <el-col :span='5' :offset='1' style='margin-top: 30px;'>
        <h2>打散下单</h2>
        <el-form :model="scatterForm" :rules='scatterRules' ref="scatterForm" label-width="80px">
          <el-form-item label="中心价格" prop='price'>
            <el-input type='number' v-model.number="scatterForm.price" @focus="focusedParam='price'"></el-input>
          </el-form-item>
          <el-form-item label="上限" prop='upperLimit'>
            <el-input type='number' v-model.number="scatterForm.upperLimit" @focus="focusedParam='upperLimit'"></el-input>
          </el-form-item>
          <el-form-item label="下限" prop='lowerLimit'>
            <el-input type='number' v-model.number="scatterForm.lowerLimit" @focus="focusedParam='lowerLimit'"></el-input>
          </el-form-item>
          <el-form-item label="打散数" prop='scatterNum'>
            <el-input type='number' v-model.number="scatterForm.scatterNum"></el-input>
          </el-form-item>
          <el-form-item label="总量" prop='total'>
            <el-input type='number' v-model.number="scatterForm.total"></el-input>
          </el-form-item>
          <div class='form-btn'>
            <el-button class='large-btn' :loading='buyBtnLoading' @click="onBuyClick">买</el-button>
            <el-button class='large-btn' :loading='sellBtnLoading' @click="onSellClick">卖</el-button>
          </div>
        </el-form>

<!------------------------------------填补流动性---------------------------------->

        <h2 style="margin-top: 34px;">填补流动性</h2>
        <el-form :model="mobilityForm" :rules='mobilityRules' ref="mobilityForm" label-width="80px">

          <el-form-item label="档位" required>
            <el-row>
              <el-col :span='10'>
                <el-form-item prop='levelFrom'>
                  <el-input type='number' v-model.number="mobilityForm.levelFrom"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span='4' style='text-align: center;'>至</el-col>
              <el-col :span='10'>
                <el-form-item prop='levelTo'>
                  <el-input type='number' v-model.number="mobilityForm.levelTo"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="填补档数" prop='fillLevel'>
            <el-input type='number' v-model.number="mobilityForm.fillLevel"></el-input>
          </el-form-item>

          <el-form-item label="总量" prop='total'>
            <el-input type='number' v-model.number="mobilityForm.total"></el-input>
          </el-form-item>

          <el-form-item class='form-btn'>
            <el-button class='large-btn' :loading='mobilityBtnLoading' @click="mobilityCalculate">下单</el-button>
          </el-form-item>

        </el-form>

      </el-col>

<!------------------------------------填补差价---------------------------------->

      <el-col :span='8' :offset='1' style='margin-top: 30px;'>
        <h2>填补差价</h2>

          <el-row>

            <el-col :span='15'>
              <el-form :model="diffForm" ref="diffForm" label-width="50px">
                <el-row v-for='(i,n) in diffForm.list' :key='n'>
                  <el-col :span='15'>
                    <el-form-item
                      :label='priceLabels[n]'
                      >
                      <!--:prop= "'list.' + n + '.price'"
                      :rules="[{required: true, message: '请输入价格'}]"-->
                      <el-input :class="i.type=='buy'?'inPrice':'outPrice'" type='number' v-model.number='diffForm.list[n].price'></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span='8' :offset='1'>
                    <el-form-item
                      label-width="0"
                      >
                      <!--:prop= "'list.' + n + '.num'"
                      :rules="[{required: true, message: '请输入数量'}]"-->
                      <el-input type='number' v-model.number='diffForm.list[n].num'></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-col>

            <el-col :span='9' style='margin-top: 140px;'>
              <el-form :model="diffForm2" :rules='diffRules2' ref="diffForm2" label-width="50px">
                <el-form-item label="差价" prop='price'>
                  <el-input ref='diffPrice' type='number' v-model.number="diffForm2.price"></el-input>
                </el-form-item>
                <el-form-item label="总量" prop='total' :rules="[{required: true, message: '请输入总量'}]">
                  <el-input type='number' v-model.number="diffForm2.total"></el-input>
                </el-form-item>
              </el-form>
            </el-col>

          </el-row>

          <div class='form-btn'>
            <el-button class='medium-btn' :loading='autoFillLoading' @click="autoFill">自动填充</el-button>
            <el-button class='large-btn' @click="onDiffClick">下单</el-button>
          </div>

      </el-col>

    </el-row>

    <!----------------下单-------------------->
    <el-dialog :title='orderDialogTitle' :visible.sync="orderDialogVisible" size='tiny' @close='isInDanger=false'>
      <el-table :data="orderData">
        <el-table-column prop="price" label="价格"></el-table-column>
        <el-table-column prop="num" label="数量"></el-table-column>
      </el-table>
      <p v-if='isInDanger' class='red' style='margin-top: 10px;text-align: center;'>订单存在风险</p>
      <div slot="footer" v-if='orderData.length'>
        <el-button @click="orderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="order" :loading='orderConfirmLoading' :disabled='isInDanger'>确定下单</el-button>
      </div>
    </el-dialog>

    <!--------------------下单结果------------------>
    <el-dialog title='下单结果' :visible.sync="resultDialogVisible">
      <el-table :data="resultData">
        <el-table-column label="类型">
          <template slot-scope='scope'>
            {{scope.row.type == 'buy' ? '买' : '卖'}}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格"></el-table-column>
        <el-table-column prop="num" label="数量"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope='scope'>
            <span :class="!scope.row.status?'red':''">{{['失败', '成功'][scope.row.status]}}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    var valiLevel = (rule, value, callback) => {
      if (value < 1 || value > 20) {
        callback(new Error('范围在1-20'))
      } else if (!/^[0-9]*$/.test(value)) {
        callback(new Error('请输入整数'))
      }
      callback()
    }
    var valiDiffPrice = (rule, value, callback) => {
      if (this.diffPrice && value >= this.diffPrice) {
        callback(new Error('必须小于价差'))
      }
      callback()
    }
    return {
      focusedParam: '', // 聚焦 的输入框model名

      history: [], // 历史记录
      depth: {}, // 深度
      diffPrice: '', // 买卖差价
      boughtAmount: 0, // 买总量
      soldAmount: 0, // 卖总量
      historyLoading: true, // 成交历史loading
      depthLoading: true, // 买卖loading

      orderDialogVisible: false, // 订单确认弹框
      orderDialogTitle: '', // 弹框title
      orderConfirmLoading: false, // 弹框 确认Loading
      orderData: [], // 订单数据
      orderType: 0, // 订单类型

      resultDialogVisible: false, // 下单后>结果弹框
      resultData: [], // 下单后反馈数据

      isScatterBuy: false, // 是否为打散下单买入状态
      buyBtnLoading: false, // 打散下单，买 Loading
      sellBtnLoading: false, // 打散下单，卖Loading
      isInDanger: false, // 打散下单是否有风险

      scatterForm: {
        price: '', // 价格
        upperLimit: '', // 上限
        lowerLimit: '', // 下限
        scatterNum: '', // 打散数
        total: ''
      },
      scatterRules: {
        price: [
          {required: true, message: '请输入中心价格'}
        ],
        upperLimit: [{required: true, message: '请输入上限'}],
        lowerLimit: [{required: true, message: '请输入下限'}],
        scatterNum: [{required: true, message: '请输入打散数'}],
        total: [{required: true, message: '请输入总量'}]
      },

      mobilityForm: {
        levelFrom: '', // 起
        levelTo: '', // 至
        fillLevel: '', // 填补档位数
        total: ''
      },
      mobilityRules: {
        levelFrom: [
          {required: true, message: '请输入档位'},
          {validator: valiLevel}
        ],
        levelTo: [
          {required: true, message: '请输入档位'},
          {validator: valiLevel}
        ],
        fillLevel: [
          {required: true, message: '请输入填补档数'},
          {validator: valiLevel}
        ],
        total: [
          {required: true, message: '请输入总量'}
        ]
      },
      mobilityBtnLoading: false, // 流动性下单loading

      autoFillLoading: false, // 自动填充loading
      diffForm: {
        list: [
          {price: '', num: '', type: 'buy'},
          {price: '', num: '', type: 'buy'},
          {price: '', num: '', type: 'buy'},
          {price: '', num: '', type: 'buy'},
          {price: '', num: '', type: 'sell'},
          {price: '', num: '', type: 'sell'},
          {price: '', num: '', type: 'sell'},
          {price: '', num: '', type: 'sell'}
        ]
      },
      priceLabels: ['买4价', '买3价', '买2价', '买1价', '卖1价', '卖2价', '卖3价', '卖4价'],
      diffForm2: {
        price: '',
        total: ''
      },
      diffRules2: {
        price: [
          {required: true, message: '请输入差价'},
          {validator: valiDiffPrice}
        ]
      }
    }
  },
  methods: {
    onPriceClick (price) {
      if (this.focusedParam) {
        console.log(this.focusedParam, price)
        this.scatterForm[this.focusedParam] = price
      }
    },
    onDiffPriceClick () {
      this.diffForm2.price = this.diffPrice
      this.$refs.diffPrice.$refs.input.focus() // 填充后聚焦
    },
    getHistory () {
      this.$ajax({
        url: '/market/trades',
        done: ({data = []}) => {
          this.history = data
          console.log(data)
        },
        always: () => {
          this.historyLoading = false
          !this.destroyed && setTimeout(() => {
            this.getHistory()
          }, 1000)
        }
      })
    },
    sellScrollInit () {
      if (!this.isScrollInit) { // 卖 展板dom生成后，设置其滚动条
        setTimeout(() => {
          this.$refs.sellBannerBox.scrollTop = this.$refs.sellBannerBox.scrollHeight // 卖 > 拉倒最底
        }, 0)
      }
      this.isScrollInit = true // 滚动条只设置一次
    },
    getDepth () {
      this.$ajax({
        url: '/market/depth',
        done: ({data = {}}) => {
          this.depth = data
          data.asks = data.asks || [] // 卖
          data.bids = data.bids || [] // 买
          this.soldAmount = 0 // 或拉取多次
          this.boughtAmount = 0
          data.asks.forEach(i => { this.soldAmount += Number(i[1]) })
          data.bids.forEach(i => { this.boughtAmount += Number(i[1]) })
          this.diffPrice = (data.asks[data.asks.length - 1][0] - data.bids[0][0]).toFixed(8)

          this.sellScrollInit()
        },
        always: () => {
          this.depthLoading = false
          !this.destroyed && setTimeout(() => {
            this.getDepth()
          }, 1000)
        }
      })
    },
    scatterCalculate () {
      if (this.scatterForm.upperLimit < this.scatterForm.lowerLimit) {
        this.$message.error('上限不能小于下限')
        return
      } else if (this.scatterForm.price < this.scatterForm.lowerLimit || this.scatterForm.price > this.scatterForm.upperLimit) {
        this.$message.error('中心价格必须在上限和下限之间')
        return
      }
      if (this.isScatterBuy) {
        this.buyBtnLoading = true
      } else {
        this.sellBtnLoading = true
      }
      this.$ajax({
        url: '/trade/breakup/calc',
        method: 'post',
        data: {
          center_price: this.scatterForm.price,
          upper_price: this.scatterForm.upperLimit,
          lower_price: this.scatterForm.lowerLimit,
          num: this.scatterForm.scatterNum,
          amount: this.scatterForm.total,
          order_type: this.isScatterBuy ? 'buy' : 'sell'
        },
        done: (res) => {
          if (res.status !== 200) this.isInDanger = true
          res.data = res.data || []
          res.data.forEach(i => { i.type = this.isScatterBuy ? 'buy' : 'sell' })
          this.orderData = res.data
          this.orderDialogVisible = true
          // 展示数据
        },
        always: () => {
          if (this.isScatterBuy) {
            this.buyBtnLoading = false
          } else {
            this.sellBtnLoading = false
          }
        }
      })
    },
    onBuyClick () {
      this.$refs.scatterForm.validate(valid => {
        if (valid) {
          this.isScatterBuy = true
          this.orderDialogTitle = '买入'
          this.orderType = 1
          this.scatterCalculate()
        }
      })
    },
    onSellClick () {
      this.$refs.scatterForm.validate(valid => {
        if (valid) {
          this.isScatterBuy = false
          this.orderDialogTitle = '卖出'
          this.orderType = 1
          this.scatterCalculate()
        }
      })
    },
    order () {
      this.orderConfirmLoading = true
      this.$ajax({
        url: '/trade/order/ok',
        method: 'post',
        params: {orderType: this.orderType},
        data: {
          orders: this.orderData
        },
        done: ({data = {}}) => {
          this.orderDialogVisible = false
          this.solveResultData(data)
        },
        always: () => {
          this.orderConfirmLoading = false
        }
      })
    },
    solveResultData (data) {
      this.resultDialogVisible = true
      data.false.forEach(i => { i.status = 0 })
      data.true.forEach(i => { i.status = 1 })
      this.resultData = data.true.concat(data.false)
    },
    mobilityCalculate () {
      this.$refs.mobilityForm.validate(valid => {
        if (valid) {
          this.mobilityBtnLoading = true
          this.$ajax({
            url: '/trade/fluid/calc',
            method: 'post',
            data: {
              start_stall: this.mobilityForm.levelFrom > this.mobilityForm.levelTo ? this.mobilityForm.levelTo : this.mobilityForm.levelFrom,
              end_stall: this.mobilityForm.levelFrom > this.mobilityForm.levelTo ? this.mobilityForm.levelFrom : this.mobilityForm.levelTo,
              stall_num: this.mobilityForm.fillLevel,
              amount: this.mobilityForm.total
            },
            done: (res) => {
              this.orderDialogTitle = '填补流动性'
              res.data = res.data || []
              res.data.forEach(i => { i.type = 'buy' })
              this.orderData = res.data // 弹框每次展现，orderData都是重新获取的数据
              this.orderType = 0
              this.orderDialogVisible = true // 下单按钮能点，必须在计算成功后
            },
            always: () => {
              this.mobilityBtnLoading = false
            }
          })
        }
      })
    },
    sort (arr) { // 从小到大
      for (var i = 0; i < arr.length - 1; i++) {
        for (var j = 0; j < arr.length - 1 - i; j++) {
          if (arr[j].price > arr[j + 1].price) {
            var temp = arr[j]
            arr[j] = arr[j + 1]
            arr[j + 1] = temp
          }
        }
      }
      return arr
    },
    solveAutoFillData (data) {
      var sell = data.slice(0, 4)
      var buy = data.slice(4)
      return this.sort(buy).concat(this.sort(sell))
    },
    autoFill () {
      console.log(this.diffForm2)
      this.$refs.diffForm2.validate(valid => {
        if (valid) {
          this.autoFillLoading = true
          this.$ajax({
            url: '/trade/pricedif/calc',
            method: 'post',
            data: {
              price_diff: this.diffForm2.price,
              amount: this.diffForm2.total
            },
            done: ({data = []}) => {
              this.diffForm.list = this.solveAutoFillData(data)
            },
            always: () => {
              this.autoFillLoading = false
            }
          })
        }
      })
    },
    onDiffClick () {
      this.orderDialogTitle = '填补差价'
      this.orderType = 0

      var orders = []
      this.diffForm.list.forEach(i => {
        if (i.price && i.num) orders.push(i)
      })

      this.orderData = orders
      console.log(orders)
      this.orderDialogVisible = true
    }
  },
  mounted () {
    this.getHistory()
    this.getDepth()
  },
  beforeDestroy () {
    this.destroyed = true // 防止异步请求触触发多个延时器，无法控制
  }
}
</script>

<style lang="less">
  @import '~@/less/varibles.less';
  #buy{
    position:relative;
    .red{color:@red};
    .green{color:@green};

    .bannerBox{
      box-sizing: border-box;text-align: right;
      .wrapper{margin-right:20px;}
    }

    h2{font-size: 20px;line-height: 20px;height: 30px;}

    .title{line-height: 30px;}

    .large-btn{width: 124px;padding-left: 0;padding-right: 0;text-align: center;}

    .diff-price{
      text-align: center;line-height:40px;
    }

    .inPrice .el-input__inner{background: @red;text-align: right;}
    .outPrice .el-input__inner{background: @green;text-align: right;}

    .form-btn{margin-top: 20px;}

    .vb{border:1px solid #A1A1A1}
  }
</style>
