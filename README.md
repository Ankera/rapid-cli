# rapid-cli
低代码脚手架工程化

#### 创建package
```text
npx lerna create @rapid-cli/core

所有包都安装依赖
npx lerna add uuid

清空所有依赖
npx lerna clean

指定包安装依赖
npx lerna add uuid packages/core

本地开发
npx lerna link

执行所有包的命令
npx lerna run test

执行单独包的命令
npx lerna run --scope @rapid-cli/utils test


```

#### 核心模块
```

```