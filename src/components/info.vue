<template>
    <div class='news_info'>
        <span class="news_label blue" v-if='json.playonlineurl'>视频</span>
        <span class="news_label red" v-else-if="json.istop && json.istop == '1' ">置顶</span>
        <span class="news_label blue" v-else-if="json.isgood  && json.isgood == '1' ">荐</span>
        <span class="news_label red" v-else-if="json.firsttitle  && json.firsttitle == '1' ">热</span>
        <span class='news_from' v-if='json.befrom'>{{json.befrom}}</span>
        <span class='news_click' v-if='json.onclick'>{{json.onclick | watchFilter }}阅读</span>
        <span class='news_plnum' v-if='json.plnum'>{{json.plnum}}评论</span>
        <span class='news_time' v-if='json.创建'>{{json.创建}}前</span>
        <span class='news_tag' v-if='json.nlist'>{{json.nlist}}</span>
    </div>
</template>
<script>
export default {
    props: ['json'],
    filters: {
        // 阅读量不够，自己加点戏哈哈哈
        watchFilter(val) {
            let randomVal = Math.floor(Math.random() * 101 + 100)   // 取100 ~ 200的随机数
            if (val) {
                return randomVal + parseInt(val)
            } else {
                return ''
            }
        },
      time: function(dateTimeStamp) {
        dateTimeStamp = dateTimeStamp + '000'
        var minute = 1000 * 60 // 把分，时，天，周，半个月，一个月用毫秒表示
        var hour = minute * 60
        var day = hour * 24
        var week = day * 7
        var month = day * 30
        var year = day * 365
        var now = new Date().getTime() // 获取当前时间毫秒
        // console.log(now);
        var diffValue = now - dateTimeStamp // 时间差
        if (diffValue < 0) {
          return
        }
        var minC = diffValue / minute // 计算时间差的分，时，天，周，月
        var hourC = diffValue / hour
        var dayC = diffValue / day
        var weekC = diffValue / week
        var monthC = diffValue / month
        var yearC = diffValue / year
        var result
        if (yearC >= 1) {
          result = ' ' + parseInt(yearC) + '年前'
        } else if (monthC >= 1 && monthC <= 12) {
          result = ' ' + parseInt(monthC) + '月前'
        } else if (weekC >= 1 && weekC <= 4) {
          result = ' ' + parseInt(weekC) + '周前'
        } else if (dayC >= 1 && dayC <= 7) {
          result = ' ' + parseInt(dayC) + '天前'
        } else if (hourC >= 1 && hourC <= 24) {
          result = ' ' + parseInt(hourC) + '小时前'
        } else if (minC >= 1 && minC <= 60) {
          result = ' ' + parseInt(minC) + '分钟前'
        } else if (diffValue >= 0 && diffValue <= minute) {
          result = '刚刚'
        } else {
          var datetime = new Date()
          datetime.setTime(dateTimeStamp)
          var Nyear = datetime.getFullYear()
          var Nmonth =
            datetime.getMonth() + 1 < 10
              ? '0' + (datetime.getMonth() + 1)
              : datetime.getMonth() + 1
          var Ndate =
            datetime.getDate() < 10
              ? '0' + datetime.getDate()
              : datetime.getDate()
          result = Nyear + '-' + Nmonth + '-' + Ndate
        }
        return result
      }
    }
}
</script>
<style lang='stylus'>
.news_info {
    position: relative;
    left: -12.5%;
    width: 125%;
    white-space: normal;
    color: #999;
    margin-top: 6px;
    overflow: hidden;
    font-size: x-small;
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
    span {
        display: inline-block;
        vertical-align: middle;
    }
    .news_label {
        border-radius: 2px;
        padding: 0px 2px 1px;
    }
    .blue {
        color: #fff;
        background: #00939c;
    }
    .red {
        color: #fff;
        background: #f85959;
    }
}
</style>
