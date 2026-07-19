# 农鲜优选 Product Sale Web

一个面向农产品售卖场景的全栈示例项目，包含：

- 前台商城：商品展示、购物车、下单、删除订单、物流查看、签收确认
- 后台管理：商品管理、订单管理、物流管理、经营概览
- 技术栈：Java Spring Boot + React + Next.js

## 1. 项目结构

- [backend/pom.xml](backend/pom.xml) - Spring Boot 后端
- [backend/src/main/java/com/agromall/backend](backend/src/main/java/com/agromall/backend) - 后端源码
- [frontend/package.json](frontend/package.json) - Next.js 前端
- [frontend/app](frontend/app) - 前端页面
- [frontend/components](frontend/components) - 前端模块组件

## 2. 当前已完成功能

### 前台商城
- 商品列表展示
- 购物车数量控制
- 提交订单
- 删除订单
- 物流轨迹查看
- 签收确认

### 后台管理
- 商品统计 / 订单统计 / 待发货统计 / 营收统计
- 新增商品
- 删除商品
- 查看全部订单
- 发货并录入物流信息
- 标记送达

## 3. 后端接口说明

### 商品接口
- `GET /api/products`：获取商品列表

### 订单接口
- `POST /api/orders`：创建订单
- `DELETE /api/orders/{orderId}`：删除订单
- `POST /api/orders/{orderId}/sign`：用户确认签收

### 管理端接口
- `GET /api/admin/dashboard`：获取仪表盘数据
- `GET /api/admin/orders`：获取订单列表
- `POST /api/admin/products`：新增商品
- `PUT /api/admin/products/{productId}`：更新商品
- `DELETE /api/admin/products/{productId}`：删除商品
- `POST /api/admin/orders/{orderId}/ship`：录入/更新物流
- `POST /api/admin/orders/{orderId}/deliver`：标记送达

## 4. 本地开发启动

### 4.0 如果你上周已经启动过一次

如果前端依赖已经安装过，并且本机环境没有变化，那么这次通常**不需要再次执行** `npm install`。

你可以直接分别启动前后端：

```powershell
cd backend
mvn spring-boot:run
```

新开一个终端：

```powershell
cd frontend
npm run dev
```

启动后访问：

- 前端首页：`http://localhost:3000`
- 后端接口：`http://localhost:8080/api/products`

如果要让同一局域网下的其他设备访问你这台电脑，请改用你当前的 Wi‑Fi 地址：

- 前端首页：`http://10.248.57.125:3000`
- 后端接口：`http://10.248.57.125:8080/api/products`
- 后台页面：`http://10.248.57.125:3000/admin`

### 4.1 启动后端
要求：
- JDK 17+
- Maven 3.9+

进入 [backend](backend) 目录后执行：

```powershell
cd backend
mvn spring-boot:run
```

服务默认启动在 `http://localhost:8080`

### 4.2 启动前端
要求：
- Node.js 20+

进入 [frontend](frontend) 目录后执行：

首次安装依赖时执行：

```powershell
cd frontend
npm install
```

然后启动前端：

```powershell
cd frontend
npm run dev
```

打开 `http://localhost:3000`

### 4.3 本地环境变量说明

项目已内置本地开发默认值：

- 后端默认端口为 `8080`
- 前端会把 `/api/*` 请求转发到 `http://127.0.0.1:8080`

因此在**本地联调**场景下，即使不创建 `.env.local`，通常也可以直接运行。

如果你希望显式配置，可参考 [frontend/.env.local.example](frontend/.env.local.example)：

```dotenv
NEXT_PUBLIC_API_BASE_URL=
BACKEND_INTERNAL_URL=http://10.248.57.125:8080
```

说明：

- `NEXT_PUBLIC_API_BASE_URL` 本地开发时可留空
- `BACKEND_INTERNAL_URL` 可改为当前电脑的局域网地址，例如 `http://10.248.57.125:8080`
- 后端当前已显式监听 `0.0.0.0`，便于局域网设备访问

### 4.4 使用 VS Code 任务启动

如果你更习惯使用 VS Code 的任务面板，可以直接运行以下任务：

- `backend: run`
- `frontend: install`（仅首次需要）
- `frontend: dev`

### 4.5 启动完成后的检查

启动成功后，可按下面方式快速验证：

1. 浏览器打开 `http://localhost:3000`
2. 访问 `http://localhost:8080/api/products`，确认后端返回数据
3. 打开后台页面 `http://localhost:3000/admin`
4. 当前默认管理员密码见后端配置，为 `admin123`

如果是手机或同 Wi‑Fi 下的其他电脑访问，请改用：

1. `http://10.248.57.125:3000`
2. `http://10.248.57.125:8080/api/products`
3. `http://10.248.57.125:3000/admin`

## 5. 生产部署说明

### 后端部署建议
- 使用 `mvn clean package` 打包生成 jar
- 通过 `java -jar target/agro-sale-backend-0.0.1-SNAPSHOT.jar` 启动
- 建议在 Nginx 后面反向代理
- 当前版本已切换为 H2 文件数据库，数据文件默认位于 `backend/data/`
- 本地可通过 `http://localhost:8080/h2-console` 打开 H2 控制台
- 生产环境建议进一步替换为 MySQL / PostgreSQL

## 5.1 当前数据库存储说明

- 后端已从内存 `Map` 存储切换为 `Spring Data JPA + H2`
- 默认数据库文件：`backend/data/agro-sale-db.mv.db`
- 重启后端后，商品和订单数据会保留
- Hibernate 会自动建表和更新表结构
- 当前项目已支持通过环境变量无代码切换到 MySQL
- 当前核心表名已调整为更见名知义的命名：`STORE_PRODUCTS`、`CUSTOMER_ORDERS`、`CUSTOMER_ORDER_ITEMS`、`ORDER_SHIPMENT_EVENTS`

当前默认连接信息：

```text
JDBC URL: jdbc:h2:file:./data/agro-sale-db;AUTO_SERVER=TRUE
Username: sa
Password: （空）
```

如果后续要切换到 MySQL / PostgreSQL，主要只需要调整：

- `backend/pom.xml` 中的数据库依赖
- `backend/src/main/resources/application.yml` 中的 `spring.datasource`
- 其余业务接口层通常不需要大改

### 5.2 切换到 MySQL 的方式

当前后端已做成“默认 H2，环境变量优先覆盖”的配置。

也就是说：

- 不传环境变量：默认使用本地 H2 文件数据库
- 传入 MySQL 环境变量：自动改连 MySQL

示例环境变量：

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://127.0.0.1:3306/agro_sale?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="your_password"
$env:SPRING_JPA_HIBERNATE_DDL_AUTO="update"
cd backend
mvn spring-boot:run
```

如果是 Linux / macOS：

```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://127.0.0.1:3306/agro_sale?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_password"
export SPRING_JPA_HIBERNATE_DDL_AUTO="update"
cd backend
mvn spring-boot:run
```

说明：

- 当前项目已内置 `mysql-connector-j`
- 不需要再改 Java 代码
- 如果你后面给出真实 MySQL 连接信息，我可以继续直接帮你替换成固定配置

### 5.3 使用 DBeaver 连接当前 H2 数据库

如果你希望在图形化工具里查看表结构、DDL 和直接执行 SQL，推荐使用 `DBeaver`。

#### 连接类型

- 请选择 `H2 Embedded V.2`
- 不要选择旧版 `H2 Embedded`

#### 驱动版本要求

当前项目实际使用的 `H2` 版本是 `2.2.224`。

因此在 `DBeaver` 中：

- 需要使用 `2.2.224` 驱动
- 不要使用 `1.4.x`
- 不要使用 `2.1.x`

如果驱动版本过旧，可能会出现类似报错：

```text
The write format 3 is larger than the supported format 2
```

#### DBeaver 连接参数

```text
Driver: H2 Embedded V.2
Driver Class: org.h2.Driver
JDBC URL: jdbc:h2:file:C:/Knowledge/AI Coding/Product Sale Web/backend/data/agro-sale-db;AUTO_SERVER=TRUE
Username: sa
Password: （空）
```

说明：

- 路径不要带 `.mv.db` 后缀
- 当前数据库文件实际位于 `backend/data/agro-sale-db.mv.db`
- `AUTO_SERVER=TRUE` 建议保留

#### 本机可用的 H2 2.2.224 驱动路径

如果你需要在 `DBeaver` 的 `Driver Manager` 里手动替换 jar，可使用本机 Maven 仓库中的：

```text
C:\Users\.m2\repository\com\h2database\h2\2.2.224\h2-2.2.224.jar
```

#### 常用 SQL

查看所有表：

```sql
SHOW TABLES;
```

查看完整 DDL：

```sql
SCRIPT NODATA;
```

查看表结构：

```sql
SHOW COLUMNS FROM STORE_PRODUCTS;
SHOW COLUMNS FROM CUSTOMER_ORDERS;
SHOW COLUMNS FROM CUSTOMER_ORDER_ITEMS;
SHOW COLUMNS FROM ORDER_SHIPMENT_EVENTS;
```

查看数据：

```sql
SELECT * FROM STORE_PRODUCTS;
SELECT * FROM CUSTOMER_ORDERS;
SELECT * FROM CUSTOMER_ORDER_ITEMS;
SELECT * FROM ORDER_SHIPMENT_EVENTS;
```

#### 常见问题

1. `DBeaver` 连接时报 `write format` 错误
	- 原因：驱动版本过旧
	- 解决：将 `DBeaver` 的 H2 驱动替换为 `2.2.224`

2. 找不到数据库文件
	- 请确认 JDBC URL 使用的是绝对路径
	- 请确认路径中不要包含 `.mv.db` 后缀

3. 后端正在运行时是否可以查看数据
	- 可以
	- 建议保留 `AUTO_SERVER=TRUE`

### 前端部署建议
- 使用 `npm run build`
- 使用 `npm run start`
- 或部署到 Vercel / Docker / Linux Node 服务器
- 通过环境变量 `NEXT_PUBLIC_API_BASE_URL` 指向后端地址

## 6. 推荐的下一步生产化改造

建议按以下优先级扩展：

1. 接入 MySQL，替代当前 H2 文件存储
2. 增加管理员登录、用户登录、JWT 鉴权
3. 增加支付模块
4. 增加订单搜索、分页、筛选
5. 增加图片上传到 OSS / COS / MinIO
6. 增加短信通知、物流公司接口对接
7. 增加售后、退款、发票模块
8. 增加 Docker 与 CI/CD

## 7. 当前版本说明

当前版本是一个可运行的精简 MVP，适合：
- 快速演示
- 二次开发起点
- 提交给设计/产品继续迭代
- 部署到测试服务器做联调

如果你需要，我下一步可以继续直接帮你补：
- MySQL 持久化
- 登录鉴权
- 商品编辑功能
- 订单搜索筛选
- Docker 部署文件
- Nginx 配置
