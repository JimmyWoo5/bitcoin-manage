<template>
  <div id="app">
    <el-menu router :default-active="activeIndex" mode="horizontal" class='main-menu' >
      <el-menu-item index="/">下单</el-menu-item>
      <el-menu-item index="/history">历史数据</el-menu-item>
      <el-menu-item index="/chart">图表</el-menu-item>
    </el-menu>
    <router-view/>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeIndex: '/'
    }
  }
}
</script>

<style lang="less">
  @import "less/reset.less";
  @import "less/elementui-theme.less";
  #app{padding: 20px 30px;}
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  input[type="number"]{
    -moz-appearance: textfield;
  }
  .main-menu{
    position: absolute;right: 30px;top: 5px;z-index: 100;
    .el-menu-item{height: 40px;line-height: 40px;}
  }
</style>
