import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'

Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://www.ofec.com.cn/'

const ajaxURL = {
    // 主页
    classID: 'classid.php',          // 栏目
    Class: 'fenlei/news.json',              // 栏目列表
    Stick: 'appistop.php',              // 栏目置顶
    // 详情页
    Artilce: 'fenlei/node/',          // 文章
    Recommend: 'apptuijian.php',        // 文章推荐
    // 搜索页
    Search: 'search.php'                // 搜索
}

export var request = async(type = 'POST', url = '', data = {}) => {
    let result
    type = type.toUpperCase()

    if (url === 'Artilce') {
       url = ajaxURL[url] + data.id + '.json'
    } else if (url === 'Class') {
       url = 'fenlei/news' + data.classid + '.json'
    } else {
       url = ajaxURL[url]
    }
    if (type === 'GET') {
        await axios.get(url, { params: data })
        .then(res => {
            result = res.data
        })
    } else if (type === 'POST') {
        await axios.post(url, qs.stringify(data))
        .then(res => {
            result = res.data
        })
    }
    return result
}
