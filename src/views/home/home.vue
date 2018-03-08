<template>
  <div id="home">

    <el-menu router :default-active="activeIndex" mode="horizontal" class='navbar'>
      <el-menu-item index="/home">下单</el-menu-item>
      <el-menu-item index="/history">历史数据</el-menu-item>
      <el-menu-item index="/chart">图表</el-menu-item>
      <el-menu-item index="/auto">自动填补流动性</el-menu-item>
    </el-menu>

    <router-view/>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeIndex: '/home'
    }
  },
  mounted () {
    this.activeIndex = this.$route.path
  }
}
</script>

<style lang="less">
  #home{
    padding: 20px 30px;
    .navbar{
      position:absolute;right:30px;top:5px;z-index:100;
      .el-menu-item{height: 40px;line-height: 40px;}
    }
  }
</style>
