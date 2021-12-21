# По-русски

## Предваритетельные условия

Для установки требуется `nodejs` версии 16 (это также указано в `.nvmrc`).
Для локального запуска вам понадобятся переменные окружения для firebase, для их установки достаточно скопировать `.env.client.example` как `.env.client`, значения можно взять со [страницы проекта](https://console.firebase.google.com/u/0/project/hin-ru/settings/general/) (блок "your apps").

## Установка

`npm install`

## Локальный запуск

`npm start`

После выполнения этой команды будет запущен автоматически перезагружаемый при любых изменениях сервер на порту из переменной окружения `PORT` (по умолчанию - 80).

## Деплой в Яндекс.Облако

### Предварительные условия

Для деплоя требуются переменные окружения, для их установки достаточно скопировать `.env.deploy.example` как `.env.deploy`, значения берутся из следующих источников:

- `CLOUD_FOLDER_ID` - folder облака, в котором будут выполняться запросы
- `CLOUD_SERVICE_ACCOUNT_ID` - id сервисного аккаунта, из-под которого будут выполняться запросы
- `CLOUD_S3_ACCESS_KEY_ID` - Access Key ID для доступа в S3 (требуются права на запись в бакет `static-hin-ru`)
- `CLOUD_S3_SECRET_ACCESS_KEY` - Secret Access Key, соответствующий ключу из пункта выше

Также требуется сгенерировать авторизационный ключ для доступа от имена сервисного аккаунта из пункта выше, это можно сделать с помощью следующей команды:

`yc iam key create --service-account-id abcd1234abcd1234abcd -o .auth-key.deploy.json`

Ключ в виде json-файла с именем `.auth-key.deploy.json` должен лежать в корне проекта, пример файла можно посмотреть по имени `.auth-key.deploy.example.json`.

Также требуется сгенерировать ключ для доступа к БД firebase. Для этого требуется перейти в консоль `https://console.firebase.google.com/project/hin-ru/settings/serviceaccounts/adminsdk`, нажать `Generate new private key` во вкладке `Firebase Admin SDK` и сохранить ключ как `.firebase-credentials.json` в корне проекта, пример файла можно посмотреть в `.firebase-credentials.example.json`.

### Деплой

`npm run deploy`

Так как пакет, используемый для отображения визуальной части переписывает поток - для его заглушения можно использовать переменную окружения `SILENT`:

`SILENT=true npm run deploy`

# English

## Prerequisites

You need `nodejs` version 16 to run the project (according to `.nvmrc`).
To run project locally you need firebase environment variables. Just copy `.env.client.example` as `.env.client` and fetch values from [project page](https://console.firebase.google.com/u/0/project/hin-ru/settings/general/) ("your apps" block).

## Install

`npm install`

## Run locally

`npm start`

On invocation hot-reloading server (both server-side and client-side) will be running. Server listens on port from environment variable `PORT` (or 80 by default).

## Yandex.Cloud deploy

### Prerequisites

To deploy project to Yandex.Cloud you need environment variables. Just copy `.env.deploy.example` as `.env.deploy`, fetch values as following:

- `CLOUD_FOLDER_ID` - folder id of the cloud to run all queries in
- `CLOUD_SERVICE_ACCOUNT_ID` - id of service account that will attribute all the deployment process
- `CLOUD_S3_ACCESS_KEY_ID` - S3 Access Key ID (write permission for bucket `static-hin-ru` required)
- `CLOUD_S3_SECRET_ACCESS_KEY` - corresponding S3 Secret Access Key

Also, you need an auth key to performs actions on behalf of service account, you can generate one like this:

`yc iam key create --service-account-id abcd1234abcd1234abcd -o .auth-key.deploy.json`

JSON file named `.auth-key.deploy.json` should be places in root directory of the project, example file is named `.auth-key.deploy.example.json`.

Also, you need an auth key for firebase DB. To get it open `https://console.firebase.google.com/project/hin-ru/settings/serviceaccounts/adminsdk`, press `Generate new private key` in tab `Firebase Admin SDK` ans save key as `.firebase-credentials.json` in project root, example file is named `.firebase-credentials.example.json`

### Deploy

`npm run deploy`

Packages used to refresh CLI overwrites output frequently, you can use environment variable `SILENT` to override it:

`SILENT=true npm run deploy`
