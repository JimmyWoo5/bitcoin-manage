<template>
  <div id='buy'>
    <el-form inline class='filter-form'>
      <el-form-item label='平台'>
        <el-select v-model="platformId" placeholder="请选择" @change='onPlatformChange'>
          <el-option v-for="(i, n) in platformList" :key="n" :label="i.name" :value="i.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label='交易区'>
        <el-select v-model="areaId" placeholder="请选择" @change='onAreaChange'>
          <el-option v-for="(i, n) in areaList" :key="n" :label="i.name" :value="i.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label='币名'>
        <el-select v-model="currencyId" placeholder="请选择" @change='onCurrencyChange'>
          <el-option v-for="(i, n) in currencyList" :key="n" :label="i.name" :value="i.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label='账户余额'>
        <span style='margin-right: 10px;' v-for='(i,n) in restMoney' :key='n'>{{i.name}}: {{i.value || '-'}}</span>
      </el-form-item>
    </el-form>

<!------------------------------------成交历史---------------------------------->

    <el-row :gutter='20'>

      <el-col :span='6'>
        <div class="title">成交历史</div>
        <el-row>
          <el-col :span='12'>时间</el-col>
          <el-col :span='6'>价格</el-col>
          <el-col :span='6'>数量</el-col>
        </el-row>
        <div v-bar="{observerThrottle: 1000}" style="height: 498px;" v-loading='historyLoading'>
          <div class='bannerBox'>
            <div class='wrapper'>
              <el-row v-for='(i, n) in history' :key='n'>
                <el-col :span='10' class='text-left'>{{i.time}}</el-col>
                <el-col :span='8' :class="i.type=='sell'?'green':'red'">{{i.price}}</el-col>
                <el-col :span='6' :class="i.amount>500?'red':''">{{i.amount}}</el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span='6'>

        <el-row class="title">
          <el-col :span='10'>卖</el-col>
          <el-col :span='14'>总量 {{soldAmount.toFixed(3)}}</el-col>
        </el-row>
        <el-row>
          <el-col :span='10'>价格</el-col>
          <el-col :span='8'>数量</el-col>
          <el-col :span='6'>总额</el-col>
        </el-row>
        <div v-bar style='height: 228px;' v-loading='depthLoading'>
          <div ref='sellBannerBox' class='bannerBox' >
            <div class='wrapper'>
              <el-row :gutter='20' v-for='(i, n) in depth.asks' :key='n'>
                <el-col :span='7'><span style='cursor: pointer;' @click='onPriceClick(i[0])'>{{i[0]}}</span></el-col>
                <el-col :span='7' :class="i[1]>500?'red':''">{{i[1]}}</el-col>
                <el-col :span='10'>{{(i[0]*i[1]).toFixed(9)}}</el-col>
              </el-row>
            </div>
          </div>
        </div>

        <div class='diff-price'>价差 <span class='red' style='cursor: pointer;' @click='onDiffPriceClick'>{{diffPrice}}</span></div>
        <div v-bar style='height: 228px;' v-loading='depthLoading'>
          <div class='bannerBox'>
            <div class="wrapper">
              <el-row :gutter='20' v-for='(i, n) in depth.bids' :key='n'>
                <el-col :span='7'><span style='cursor: pointer;' @click='onPriceClick(i[0])'>{{i[0]}}</span></el-col>
                <el-col :span='7' :class="i[1]>500?'red':''">{{i[1]}}</el-col>
                <el-col :span='10'>{{(i[0]*i[1]).toFixed(9)}}</el-col>
              </el-row>
            </div>
          </div>
        </div>
        <el-row class="title">
          <el-col :span='10'>买</el-col>
          <el-col :span='14'>总量 {{boughtAmount.toFixed(3)}}</el-col>
        </el-row>

      </el-col>

<!------------------------------------打散下单---------------------------------->

      <el-col :span='4'>
        <h2>打散下单</h2>
        <el-form :model="scatterForm" :rules='scatterRules' ref="scatterForm" label-width="80px">
          <el-form-item label="中心价格" prop='price'>
            <el-input type='number' v-model.number="scatterForm.price" @focus="focusedParam='price',focusedForm='scatterForm'"></el-input>
          </el-form-item>
          <el-form-item label="上限" prop='upperLimit'>
            <el-input type='number' v-model.number="scatterForm.upperLimit" @focus="focusedParam='upperLimit',focusedForm='scatterForm'"></el-input>
          </el-form-item>
          <el-form-item label="下限" prop='lowerLimit'>
            <el-input type='number' v-model.number="scatterForm.lowerLimit" @focus="focusedParam='lowerLimit',focusedForm='scatterForm'"></el-input>
          </el-form-item>
          <el-form-item label="打散数" prop='scatterNum'>
            <el-input type='number' v-model.number="scatterForm.scatterNum"></el-input>
          </el-form-item>
          <el-form-item label="总量" prop='total'>
            <el-input type='number' v-model.number="scatterForm.total"></el-input>
          </el-form-item>
          <div class='form-btn'>
            <el-button class='medium-btn' :loading='buyBtnLoading' @click="onScatterBtnClick(1)">买</el-button>
            <el-button class='medium-btn' :loading='sellBtnLoading' @click="onScatterBtnClick(0)">卖</el-button>
          </div>
        </el-form>

<!------------------------------------填补流动性---------------------------------->

        <h2>填补流动性</h2>
        <el-form :model="mobilityForm" :rules='mobilityRules' ref="mobilityForm" label-width="80px">

          <el-form-item label="档位" style='margin:0'>
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

      <el-col :span='8'>

        <h2>辅助下单</h2>
        <el-form inline :model='helpForm' :rules='helpRules' ref='helpForm' :show-message='false'>
          <el-row>
            <el-col :span='8'>
              <el-form-item prop='price'>
                <el-input @focus="focusedParam='price',focusedForm='helpForm'" type='number' placeholder='价格' v-model='helpForm.price'></el-input>
              </el-form-item>
            </el-col>
            <el-col :span='6'>
              <el-form-item prop='num'>
                <el-input type='number' placeholder='数量' v-model='helpForm.num'></el-input>
              </el-form-item>
            </el-col>
            <el-col :span='10'>
              <el-form-item>
                <el-button @click='randomAmount(n+1)' v-for='(i,n) in unitBtns' :key='n' size='mini'>{{i}}</el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button class='medium-btn' @click='onHelpBtnClick(1)'>买</el-button>
            <el-button class='medium-btn' @click='onHelpBtnClick(0)'>卖</el-button>
          </el-form-item>
        </el-form>

        <h2 style="margin-top: 20px;">填补差价</h2>
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
          <el-button :loading='autoFillLoading' @click="autoFill">自动填充</el-button>
          <el-button class='large-btn' @click="onDiffClick">下单</el-button>
        </div>

      </el-col>

    </el-row>

    <!----------------下单-------------------->
    <el-dialog center :title='orderDialogTitle' :visible.sync="orderDialogVisible" @close='isInDanger=false'>
      <el-table border :data="orderData" max-height='288'>
        <el-table-column label="类型">
          <template slot-scope='scope'>
            <span class='red' v-if="scope.row.type==='buy'">买</span>
            <span class='green' v-else>卖</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格"></el-table-column>
        <el-table-column prop="num" label="数量"></el-table-column>
      </el-table>
      <p v-if='isInDanger' class='red' style='margin-top: 10px;text-align: center;'>订单存在风险</p>
      <div slot="footer" v-if='orderData.length'>
        <el-button @click="orderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="order" :loading='orderConfirmLoading'>确定下单</el-button>
      </div>
    </el-dialog>

    <!--------------------下单结果------------------>
    <el-dialog center title='下单结果' :visible.sync="resultDialogVisible">
      <el-table border :data="resultData">
        <el-table-column label="类型">
          <template slot-scope='scope'>
            <span class='red' v-if="scope.row.type==='buy'">买</span>
            <span class='green' v-else>卖</span>
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
      restMoney: [], // 余额

      platformId: '', // 平台
      areaId: '', // 交易区
      currencyId: '', // 币种
      platformList: [],
      areaList: [],
      currencyList: [],
      allAreas: {}, // 所有交易区缓存
      allCurrencys: {}, // 所有币名缓存

      history: [], // 历史记录
      depth: {}, // 深度
      diffPrice: '', // 买卖差价
      boughtAmount: 0, // 买总量
      soldAmount: 0, // 卖总量
      historyLoading: true, // 成交历史loading ---------------------------------------------
      depthLoading: true, // 买卖loading------------------------------------------

      orderDialogVisible: false, // 订单确认弹框
      orderDialogTitle: '', // 弹框title
      orderConfirmLoading: false, // 弹框 确认Loading
      orderData: [], // 订单数据
      orderType: 0, // 订单类型

      resultDialogVisible: false, // 下单后>结果弹框
      resultData: [], // 下单后反馈数据

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
          {required: true, message: '输入档位'},
          {validator: valiLevel}
        ],
        levelTo: [
          {required: true, message: '输入档位'},
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

      helpForm: { // 辅助下单------------
        price: '',
        num: ''
      },
      helpRules: {
        price: [{required: true}],
        num: [{required: true}]
      },
      unitBtns: ['百', '千', '万'],

      autoFillLoading: false, // 自动填充loading
      diffForm: {
        list: [
          {price: '', num: '', type: 'sell'},
          {price: '', num: '', type: 'sell'},
          {price: '', num: '', type: 'sell'},
          {price: '', num: '', type: 'sell'},
          {price: '', num: '', type: 'buy'},
          {price: '', num: '', type: 'buy'},
          {price: '', num: '', type: 'buy'},
          {price: '', num: '', type: 'buy'}
        ]
      },
      priceLabels: ['卖4价', '卖3价', '卖1价', '卖1价', '买1价', '买2价', '买3价', '买4价'],
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
    getUserInfo () {
      this.$ajax({
        url: '/account/user/info',
        method: 'post',
        done: ({data}) => {
          console.log(data)
          this.restMoney = data || []
        },
        fail: () => {
          this.restMoney = []
        }
      })
    },
    getPlatform () { // 获取平台
      this.$ajax({
        url: '/option/platform',
        done: ({data}) => {
          data = data || []
          this.platformList = data
          if (this.xParams[0]) {
            this.platformId = Number(this.xParams[0])
          } else if (data.length) {
            this.platformId = data[0].id
          } else {
            this.platformId = ''
          }
          this.onPlatformChange()
        }
      })
    },
    onPlatformChange () { // 切换平台
      this.historyLoading = true
      this.depthLoading = true
      this.getArea()
    },
    onAreaChange () { // 切换交易区
      this.historyLoading = true
      this.depthLoading = true
      this.areaList.forEach(i => {
        if (i.id === this.areaId) {
          this.areaName = i.name
        }
      })
      this.getCurrency()
    },
    onCurrencyChange () { // 切换币名
      console.log('币名改变')
      this.getUserInfo() // 获取余额
      this.historyLoading = true
      this.depthLoading = true
      this.isScrollInited = false
      this.currencyList.forEach(i => {
        if (i.id === this.currencyId) {
          this.currencyName = i.name
        }
      })
      var xParams = [this.platformId, this.areaName, this.currencyName].join(',')
      this.$store.commit('updateXparams', xParams)
      localStorage.setItem('xParams', xParams)
    },
    getArea () { // 获取交易区
      this.$ajax({
        url: '/option/symbol',
        params: {
          plat_id: this.platformId
        },
        done: ({data}) => {
          data = data || []
          this.areaList = data

          if (!this.isAreaInited) { // 若未初始化
            console.log('area初始化')

            if (this.xParams[1]) { // 若交易区有值
              data.forEach(i => {
                if (i.name === this.xParams[1]) {
                  this.areaId = i.id // 下拉状态改变
                  this.areaName = this.xParams[1] // header传值改变
                }
              })
            } else if (data.length) {
              this.areaId = data[0].id
            } else {
              this.areaId = ''
              this.areaName = ''
            }

            this.isAreaInited = true // 已初始化，下次不会进入
          } else if (data.length) {
            this.areaId = data[0].id
          } else {
            this.areaId = ''
            this.areaName = ''
          }

          this.onAreaChange()
        }
      })
    },
    getCurrency () { // 获取币种
      this.$ajax({
        url: '/option/coin',
        params: {
          symbol_id: this.areaId
        },
        done: ({data}) => {
          data = data || []
          this.currencyList = data

          if (!this.isCurrencyInited) { // 若未初始化
            if (this.xParams[2]) { // 若币名有值
              data.forEach(i => {
                if (i.name === this.xParams[2]) {
                  this.currencyId = i.id // 下拉状态改变
                  this.currencyName = this.xParams[2] // header传值改变
                }
              })
            } else if (data.length) { // 无值时给默认
              this.currencyId = data[0].id
            } else {
              this.currencyId = ''
              this.currencyName = ''
            }

            this.isCurrencyInited = true // 已初始化，下次不会进入
          } else if (data.length) { // 若已初始化
            this.currencyId = data[0].id
          } else {
            this.currencyId = ''
            this.currencyName = ''
          }

          this.onCurrencyChange()
        }
      })
    },
    randomAmount (n) {
      var base = 10 * Math.pow(10, n)
      console.log(base, base * 9)
      this.helpForm.num = base + parseInt(Math.random() * base * 9)
    },
    onPriceClick (price) {
      if (this.focusedParam) {
        console.log(this.focusedForm)
        this[this.focusedForm][this.focusedParam] = price
      }
    },
    onDiffPriceClick () {
      this.diffForm2.price = this.diffPrice
      this.$refs.diffPrice.$refs.input.focus() // 填充后聚焦
    },
    getHistory () {
      this.$ajax({
        url: '/market/trades',
        done: ({data}) => {
          data = data || []
          data.forEach(i => { i.time = this.moment(i.date * 1000).format('YY.MM.DD HH:mm:ss') })
          this.history = data.reverse()

          !this.destroyed && setTimeout(() => {
            this.getHistory()
          }, 1000)
        },
        fail: () => {
          this.history = []
          !this.destroyed && setTimeout(() => {
            this.getHistory()
          }, 5000)
        },
        always: () => {
          this.historyLoading = false
        }
      })
    },
    sellScrollInit () {
      if (!this.isScrollInited) { // 卖 展板dom生成后，设置其滚动条
        setTimeout(() => {
          this.$refs.sellBannerBox.scrollTop = this.$refs.sellBannerBox.scrollHeight // 卖 > 拉倒最底
        }, 0)
      }
      this.isScrollInited = true // 滚动条只设置一次
    },
    maxLengthCalculate () {
      if (!this.isMaxLengthInited) {
        var decimal
        var lengthArr = this.depth.asks.map(i => {
          decimal = Number(i[0]).toString().split('.')[1]
          return decimal ? decimal.length : 0
        })
        lengthArr = lengthArr.sort()
        this.maxLength = lengthArr[lengthArr.length - 1]
        this.isMaxLengthInited = true
      }
    },
    getDepth () {
      this.$ajax({
        url: '/market/depth',
        done: ({data}) => {
          data = data || {}
          this.depth = data
          data.asks = data.asks || [] // 卖
          data.bids = data.bids || [] // 买
          data.asks.forEach(i => { this.soldAmount += Number(i[1]) })
          data.bids.forEach(i => { this.boughtAmount += Number(i[1]) })
          this.diffPrice = (data.asks[data.asks.length - 1][0] - data.bids[0][0]).toFixed(8)

          this.maxLengthCalculate()
          this.sellScrollInit()

          !this.destroyed && setTimeout(() => { // 成功后延迟一秒再次执行
            this.getDepth()
          }, 1000)
        },
        fail: () => {
          this.depth = {} // 买卖清空
          this.boughtAmount = 0 // 买总量清空
          this.soldAmount = 0 // 卖总量清空
          this.diffPrice = '' // 价差

          !this.destroyed && setTimeout(() => { // 失败后延迟5秒再次执行
            this.getDepth()
          }, 5000)
        },
        always: () => {
          this.depthLoading = false
        }
      })
    },
    scatterCalculate () {
      this.scatterForm.price = Number(this.scatterForm.price)
      this.scatterForm.upperLimit = Number(this.scatterForm.upperLimit)
      this.scatterForm.lowerLimit = Number(this.scatterForm.lowerLimit)
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
    onScatterBtnClick (isBuy) {
      this.$refs.scatterForm.validate(valid => {
        if (valid) {
          this.isScatterBuy = isBuy
          this.orderDialogTitle = isBuy ? '买入' : '卖出'
          this.orderType = 1
          this.scatterCalculate()
        }
      })
    },
    onHelpBtnClick (isBuy) {
      this.$refs.helpForm.validate(valid => {
        if (valid) {
          this.orderDialogTitle = isBuy ? '买入' : '卖出'
          this.orderType = 0
          this.orderDialogVisible = true
          this.orderData = [Object.assign(this.helpForm, {type: isBuy ? 'buy' : 'sell'})]
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
          orders: this.orderData,
          max_num: this.maxLength
        },
        done: ({data}) => {
          this.orderDialogVisible = false
          this.solveResultData(data)
        },
        always: () => {
          this.orderConfirmLoading = false
        }
      })
    },
    solveResultData (data = {}) {
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
            done: ({data}) => {
              data = data || []
              this.orderDialogTitle = '填补流动性'
              data.forEach(i => { i.type = 'buy' })
              this.orderData = data // 弹框每次展现，orderData都是重新获取的数据
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
    //  sort (arr) { // 从大到小
    //    for (var i = 0; i < arr.length - 1; i++) {
    //      for (var j = 0; j < arr.length - 1 - i; j++) {
    //        if (arr[j].price < arr[j + 1].price) {
    //          var temp = arr[j]
    //          arr[j] = arr[j + 1]
    //          arr[j + 1] = temp
    //        }
    //      }
    //    }
    //    return arr
    //  },
    //  solveAutoFillData (data = []) {
    //    var sell = data.slice(0, 4)
    //    var buy = data.slice(4)
    //    return this.sort(sell).concat(this.sort(buy))
    //  },
    autoFill () {
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
            done: ({data}) => {
              this.diffForm.list = data
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
    this.getPlatform()
    this.getHistory()
    this.getDepth()
    this.xParams = this.$store.state.xParams ? this.$store.state.xParams.split(',') : []
  },
  beforeDestroy () {
    this.destroyed = true // 防止异步请求触触发多个延时器，无法控制
  }
}
</script>

<style lang="less">
  @import '~@/less/varibles';
  #buy{

     /*表单*/
    .el-form-item{margin-bottom: 10px;}
    .el-input__inner{height: 30px;}
    .el-form-item__error{top:87%}

    .bannerBox{
      box-sizing: border-box;text-align: right;
      .wrapper{margin-right:20px;}
    }

    h2{font-size: 20px;line-height: 20px;height: 30px;margin-top: 30px;}

    .title{line-height: 30px;}

    .large-btn{width: 124px;}
    .medium-btn{width: 88px}

    .diff-price{
      text-align: center;line-height:40px;
    }

    .inPrice .el-input__inner{background: @red;text-align: right;}
    .outPrice .el-input__inner{background: @green;text-align: right;}

    .form-btn{margin-top: 20px;}

    .vb{border:1px solid #A1A1A1}

    /*顶部筛选*/
    .filter-form{
      .el-select{width:100px;}
      .el-form-item__content{line-height: 24px;}
      .el-form-item__label{padding: 0 12px 0 0;line-height: 1;}
      .el-input__inner{height: 24px;}
    }
  }
</style>
