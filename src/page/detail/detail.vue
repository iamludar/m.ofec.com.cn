<template>
    <div id="detail">
        <my-header fixed :title='title' v-goTop:click='true'>
            <a slot="left" class="back-black" @click.stop='$router.go(-1)'></a>
            <a slot="right" class="menu" @click.stop='$refs.share.toggle()'></a>
        </my-header>
        
        <div class="content">
            <div class="container" v-swiper:swiperRight='true'>
                <!-- 正文 -->
                <my-article v-if="articleJson" :json='articleJson'/>
                <!-- 标签 -->
                <my-tags v-if="articleJson.infotags" :json='articleJson.infotags'/>
                <!-- 热点评论 -->
                <!--<template v-if='articleJson.comment'>
                    <div class="bg_line" ></div>
                    <div class="comment-hot">
                        <div class="comment_title">
                            <div class="Line">
                                <div class="title">用户热评</div>
                            </div>
                        </div>
                        <comment-item v-for='(item,index) in articleJson.comment' :itemJson='item' :key='index'></comment-item>
                        <a href='http://m.toutiaojk.com/guide.html' class="comment_more" v-if="articleJson.plnum > 0 ">下载健康头条阅读全部{{articleJson.plnum}}条评论<i class="icon-detail"></i></a>
                    </div>
                </template>-->
                <div class="bg_line"></div>
                <!--  推荐 -->
                <my-recommend :json='articleJson.recommend'/>
                <!-- 下载 -->
                <!--<a class="downLoad" href='http://m.toutiaojk.com/guide.html'>都翻到这儿了，下载个头条呗~</a>-->
            </div>
        </div>
        <!-- 分享组件 -->
        <my-share ref="share"/>
        <!-- 请求提示 -->
        <my-loading :visible='loading' :reload='init'/>
    </div>
</template>
<script>
import myArticle from './components/article'
import myTags from './components/tags'
import myRecommend from './components/recommend'
import myShare from './components/share'
import { mapState, mapMutations, mapActions } from 'vuex'
import wx from 'weixin-js-sdk'
import axios from 'axios'
export default {
    name: 'detail',
    components: { myArticle, myTags, myRecommend, myShare },
    data() {
        return {
            title: '光电通信',   // header的title
            id: '',             // 文章id
            classid: '',        // 文章classid（分类）
            datafrom: '',       // 数据来源
            articleJson: {},    // 文章数据
            loading: 'loading',
            error: false
        }
    },
    computed: {
        ...mapState('index', [
            'indexColumn'
        ]),
        ...mapState('detail', [
            'location'
        ])
    },
    watch: {
        $route(val) {
            if (val.query.id) {
                this.init() // 自己调用自己，重新初始化
            }
        }
    },
    methods: {
        ...mapMutations('detail', [
            'set_location'
        ]),
        ...mapActions('index', [
            'get_indexColumn_data'
        ]),
        ...mapActions('detail', [
            'get_Article_data'
        ]),
        async init() {
            this.classid = this.$route.query.classid
            this.id = this.$route.query.id
            this.datafrom = this.$route.query.datafrom
            $('#detail .container').scrollTop(0)    // 初始化返回顶部
            await this.handleTitle()
            this.get_Article()
            this.visitCollect()
        },
        // 获取title分类
        async handleTitle() {
            // if (!(this.indexColumn.length > 1)) {
            //     await this.get_indexColumn_data()
            // }
            // let index = this.indexColumn.findIndex(n => n.classid === this.classid)
            // if (index > -1) {
            //     this.title = `健康头条 · ${this.indexColumn[index].classname}`
            // }
        },
        // 获取文章数据
        get_Article() {
            this.loading = 'loading'
            let params = {
                'id': this.id,
                'datafrom': this.datafrom
            }
            this.get_Article_data(params)
            .then(res => {
                if (res) {
                    this.articleJson = res
                    console.log(this.articleJson)
                    this.articleJson.jsontext = this.replaceAll(this.articleJson.body.und[0].value)
                    this.handleLocaltion('get')
                    const that = this
                    axios.post('http://ofec.04wu.com/wechatshare')
                    .then(res => {
                        console.log(res.data)
                        wx.config({
                            debug: false, // 开启调试模式,
                            appId: res.data.appid, // 必填，企业号的唯一标识，此处填写企业号corpid
                            timestamp: res.data.timestamp, // 必填，生成签名的时间戳
                            nonceStr: 'bj4iwerijrelwlqkkrewl83', // 必填，生成签名的随机串
                            signature: res.data.signature, // 必填，签名，见附录1
                            jsApiList: ['onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                        })
                    })
                    console.log('这个是分享的链接 + window.location.href.split('#')[0] + '#' + window.location.href.split('#')[1])
                    wx.ready(function() {
                        wx.onMenuShareAppMessage({
                            title: that.articleJson.title, // 分享标题
                            desc: that.articleJson.body.und[0].value.replace(/<[^>]+>/g,""), // 分享描述
                            link: window.location.href.split('#')[0] + '#' + window.location.href.split('#')[1], // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                            imgUrl: 'http://www.ofec.com.cn/sites/default/files/styles/120_80/public/' + that.articleJson.field_feng_mian.und[0].filename, // 分享图标
                            type: '', // 分享类型,music、video或link，不填默认为link
                            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                            success: function () {
                                alert('分享成功')
                            // 用户点击了分享后执行的回调函数
                            }
                        })
                    })
                }
                this.loading = false
            })
            .catch(err => {
                console.log(err)
                this.loading = 'error'
            })
        },
        replaceAll(str) {
            if (str != null) {
                str = str.replace(/\/sites\/default\/files/g, 'http://www.ofec.com.cn/sites/default/files')
                return str
            }
        },
        // 数据统计
        visitCollect() {
            $.ajax({
                url: `http://api.toutiaojk.com/public/ViewClick/?classid=${this.classid}&id=${this.id}&addclick=1`,
                type: 'GET'
            })
        },
        handleLocaltion(type) {
            if (type === 'get') {
                this.$nextTick(() => {
                    if (this.location && this.location[this.id]) {
                        $('#detail .container').scrollTop(this.location[this.id])
                    }
                })
            } else if (type === 'set') {
                this.location[this.id] = $('#detail .container').scrollTop()
                this.set_location(this.location)
            }
        }
    },
    mounted() {
        this.init()
        console.log(wx)
    },
    // 离开路由钩子
    beforeRouteLeave(to, from, next) {
        this.handleLocaltion('set')
        next() // 一定要调用next() 不然路由不会跳转
    },
    // 重复调用组件的钩子
    beforeRouteUpdate(to, from, next) {
        this.handleLocaltion('set')
        next()
    }
}
</script>
<style lang='stylus'>
#detail {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #f8f8f8;
    header {
        background: #fff;
        color: #333;
        font-size: 16px;
        .menu {
            background: url(../../assets/img/menu.png) no-repeat center center;
            background-size: 20px;
        }
    }
    .downLoad {
        display: block;
        width: 100%;
        height: 36px;
        line-height: 36px;
        background: #00939c;
        color: #fff;
        text-align: center;
        font-size: 14px;
        text-decoration: none;
    }
    .comment-hot {
        padding: 0.533rem 0 0;
        background: #f9f9f9;
        .comment_title {
            margin-bottom: 0.4rem;
            position: relative;
            .Line {
                position: relative;
                width: 2.8rem;
                margin: 0 auto;
                text-align: center &:before {
                    content: "";
                    border-top: 2px solid #aaa;
                    display: block;
                    position: absolute;
                    width: 0.4rem;
                    top: 50%;
                    left: 0
                }
                &:after {
                    content: "";
                    border-top: 2px solid #aaa;
                    display: block;
                    position: absolute;
                    width: 0.4rem;
                    top: 50%;
                    right: 0
                }
            }
            .title {
                font-size: 14px;
                font-weight: bold;
            }
        }
        .comment_more {
            display: block;
            text-align: center;
            font-size: 12px;
            color: #00939c;
            padding: 0.533rem 0;
            vertical-align: middle;
            i {
                display: inline-block;
                vertical-align: middle;
                margin-left: 2px;
                margin-top: -2px;
                padding: 0 2px;
                font-size: 12px;
            }
        }
    }
    .bg_line {
        height: 0.1333rem;
        background: #eee;
    }
}
</style>
