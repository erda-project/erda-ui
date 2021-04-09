# Abort pending request

## 原因
离开当前页面后，请求的数据基本上是不需要的，所以可以abort掉，或者等待取回数据后不执行对应的action，不更新store。

本质上是避免一个组件在unmount后在回调函数中执行了setState等操作，这说明某处还保留着该组件的ref没有被回收，这会造成内存泄露。

还有一种情况，就是页面跳转后，参数获取有问题。一般是请求被延后了，例如做了惰性加载，分步加载等措施，导致后面的请求从url中取到的参数有问题。这和attachParam这个agent中间件有关系，现在只有监控首页和图表部分用到了


## 实现
1. 通过新的agent中间件，监听`request`和`response`事件，在发送请求后进行标记，收到响应后清除标记。标记方式为key/request的map结构。这样，后面传递key过来就可以获取到对应的request，执行abort方法来终止请求。

2. 覆写saga中的call方法，在实际调用call之前，先按照`namespace/serviceName`的方式保存一下key，然后在call的调用中，会在监听`request`事件时取出这个key，保存到map结构中。

3. 组件在unmount时，主动传递key来abort对应的request

**注意：** 此实现有个默认的约定，就是call方法内一定会调用agent[get|put...].then()的方法发出请求，一般总是如此。因此如果有特殊情况，在取key时做了判断，如果不为空说明之前调用了call，但是没有发请求，这时就要检查代码了。


## 使用
1. 引入`import { abortReq } from 'agent'`;

2. unmount方法中执行`abortReq('namespace/serviceName')`;
**ps: abortReq参数可为数组，一次性取消多个请求。**


## 案例
在请求项目列表数据时，因为加入了loadmore组件，如果在组件拉取下一次数据时跳转页面，会先重置paging数据，把pageNo重置为1，然后请求返回后又重新改变了paging。这时，再返回列表页，就会出现pageNo跳过第一页的问题。

这时，如果在unmount中取消了请求，然后重置paging，就不会出现该问题了。
